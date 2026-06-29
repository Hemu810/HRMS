"""
db.py — Database Layer
======================
All SQL table definitions, schema creation, and query functions live here.
The rest of the app (app.py) imports only the functions it needs — it never
writes raw SQL itself.

Key design decisions:
  - SQLAlchemy Core (not ORM) — gives fine-grained control over queries
    without the overhead of mapped class instances.
  - engine.begin() context manager — every query runs inside an auto-committed
    transaction; if anything raises, the transaction rolls back automatically.
  - rows_to_dicts() — converts every SQLAlchemy Row into a plain Python dict
    with Python-native types (datetime → ISO string, Decimal → float) so the
    result can be JSON-serialised directly by FastAPI.
  - BigInteger().with_variant(Integer, "sqlite") — SQLite doesn't support
    BigInteger auto-increment the same way; this variant ensures the schema
    works identically on both SQLite (dev) and SQL Server / PostgreSQL (prod).
"""

from datetime import datetime, date
from decimal import Decimal
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from pathlib import Path
from secrets import token_hex
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    delete as sql_delete,
    desc,
    func,
    insert,
    select,
    text,
    update,
)

from config import settings

# ── Password hashing ──────────────────────────────────────────────────────────
# PBKDF2-SHA256 with 100k iterations — strong enough for a production HRMS.
# The hash is stored as "algo$iterations$salt$hexdigest" so all parameters are
# self-contained in the stored string (no separate salt column needed).
PWD_HASH_ALGO = "pbkdf2_sha256"
PWD_HASH_ITERATIONS = 100_000


def hash_password(password: str) -> str:
    """Hash a plain-text password. Returns a portable hash string."""
    salt = token_hex(16)           # 32 hex chars = 128-bit random salt
    digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PWD_HASH_ITERATIONS)
    return f"{PWD_HASH_ALGO}${PWD_HASH_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, password_hash: str) -> bool:
    """
    Re-derives the hash from the stored salt and compares with a constant-time
    compare_digest to prevent timing attacks.
    Returns False for any hash that doesn't match the expected format.
    """
    try:
        algo, iterations, salt, hash_hex = password_hash.split("$", 3)
    except ValueError:
        return False
    if algo != PWD_HASH_ALGO or int(iterations) != PWD_HASH_ITERATIONS:
        return False
    digest = pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), PWD_HASH_ITERATIONS)
    return compare_digest(digest.hex(), hash_hex)  # constant-time comparison


# ── Database engine ───────────────────────────────────────────────────────────
# IS_SQLITE detects whether we're running locally (SQLite file) or in
# production (SQL Server / PostgreSQL URL).
BASE_DIR = Path(__file__).resolve().parent
IS_SQLITE = settings.database_url.startswith("sqlite")

# pool_pre_ping=True sends a lightweight "SELECT 1" before each connection is
# used — catches stale/dropped connections from the pool before a real query
# hits them. Disabled for SQLite because it doesn't need connection pooling.
_pool_kwargs = {} if IS_SQLITE else {
    "pool_size": 5,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_recycle": 1800,   # recycle connections after 30 min to avoid MSSQL TCP timeouts
}

# pymssql needs explicit timeouts so a slow/unreachable MSSQL server doesn't
# hang the process indefinitely. login_timeout covers the TCP connect+auth
# phase; timeout covers individual query execution.
_connect_args = (
    {"check_same_thread": False} if IS_SQLITE
    else {"login_timeout": 15, "timeout": 60}
)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=not IS_SQLITE,
    future=True,
    connect_args=_connect_args,
    **_pool_kwargs,
)

# MetaData holds all table definitions in memory so create_all() can create
# or verify them in one pass.
metadata = MetaData(schema="hrms")

# ── Table definitions ─────────────────────────────────────────────────────────

# employees_table — the central entity. Every other table references it.
# mgr_id is a self-referential FK (employee → manager) used to build the
# org-chart tree and the "reports" list in fetch_all_employees_full().
employees_table = Table(
    "employees",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id",    String(20),  nullable=False, unique=True),   # e.g. "EMP-0001"
    Column("first_name",     String(80),  nullable=False),
    Column("middle_name",    String(80),  nullable=True),
    Column("last_name",      String(80),  nullable=False),
    Column("full_name",      String(180), nullable=False),
    Column("department",     String(80),  nullable=False),
    Column("designation",    String(120), nullable=False),
    Column("email",          String(180), nullable=False, unique=True),
    Column("phone",          String(40)),
    Column("location",       String(80)),
    Column("date_of_joining", Date),
    Column("dob",            Date),
    Column("gender",         String(20)),
    Column("color",          String(10)),   # hex colour for the avatar background in the UI
    Column("mgr_id",         String(20),  ForeignKey("hrms.employees.employee_id", use_alter=True, name="fk_mgr"), nullable=True),
    Column("pan",            String(20)),
    Column("aadhaar",        String(30)),
    Column("uan",            String(30)),   # Universal Account Number for PF
    Column("pf_account",     String(80)),
    Column("esic",           String(40)),
    Column("bank_name",      String(120)),
    Column("bank_account_no", String(80)),
    Column("ifsc",           String(20)),
    Column("annual_ctc_lpa", Numeric(12, 2), nullable=False, default=0),  # Cost To Company in Lakhs Per Annum
    Column("emp_type",       String(40)),   # Full-time | Contract | Intern
    Column("notice_period",  String(40)),
    Column("access_level",   Integer, nullable=False, default=1),   # 1=Employee, 2=Lead, 3=Manager, 4=Director
    Column("is_hr",          Boolean, nullable=False, default=False),
    Column("is_finance_operator", Boolean, nullable=False, default=False),
    Column("password_hash",  String(200), nullable=False),
    Column("must_change_password", Boolean, nullable=False, default=True),  # forced on first login
    Column("is_active",      Boolean, nullable=False, default=True),
    Column("created_at",     DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at",     DateTime, nullable=False, default=datetime.utcnow),
)

# payroll_runs_table — one row per month-level payroll run (draft → processed).
# Tracks who processed the run and when, for audit purposes.
payroll_runs_table = Table(
    "payroll_runs",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payroll_month", Date, nullable=False, unique=True),
    Column("status", String(30), nullable=False, default="draft"),   # draft | processed | paid
    Column("pay_date", Date),
    Column("payment_mode", String(40), nullable=False, default="Bank Transfer"),
    Column("tax_regime",   String(40), nullable=False, default="New Regime"),
    Column("remarks", Text),
    Column("processed_by", String(20), ForeignKey("hrms.employees.employee_id")),
    Column("processed_at", DateTime),
    Column("created_at",   DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at",   DateTime, nullable=False, default=datetime.utcnow),
)

# payslips_table — one row per employee per payroll run (the summary record).
# Detailed line items (earnings/deductions) live in payslip_line_items_table.
payslips_table = Table(
    "payslips",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payroll_run_id",  BigInteger, ForeignKey("hrms.payroll_runs.id"), nullable=False),
    Column("employee_id",     String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("total_work_days", Numeric(5, 2), nullable=False, default=0),
    Column("payable_days",    Numeric(5, 2), nullable=False, default=0),
    Column("lop_days",        Numeric(5, 2), nullable=False, default=0),   # Loss Of Pay days
    Column("gross_earnings",  Numeric(14, 2), nullable=False, default=0),
    Column("total_deductions", Numeric(14, 2), nullable=False, default=0),
    Column("net_pay",         Numeric(14, 2), nullable=False, default=0),
    Column("status",          String(30), nullable=False, default="draft"),
    Column("created_at",      DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at",      DateTime, nullable=False, default=datetime.utcnow),
)

# payroll_structure_table — HR-configurable salary component percentages.
# Seeded with defaults in init_database(); HR can edit via the Configure tab.
# component_key values: basic_pct | hra_pct | lta_pct | transport
payroll_structure_table = Table(
    "payroll_structure",
    metadata,
    Column("id",          BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("component_key", String(40),   nullable=False, unique=True),
    Column("label",       String(120),  nullable=False),
    Column("calc_type",   String(30),   nullable=False),   # pct_ctc | pct_basic | fixed
    Column("value",       Numeric(12,2),nullable=False, default=0),
    Column("description", String(300),  nullable=True),
    Column("updated_by",  String(20),   ForeignKey("hrms.employees.employee_id"), nullable=True),
    Column("updated_at",  DateTime,     nullable=False, default=datetime.utcnow),
)

# Default salary structure values seeded on first run.
# Tuple: (component_key, label, calc_type, value, description)
PAYROLL_STRUCTURE_DEFAULTS = [
    ("basic_pct",  "Basic Salary",                  "pct_ctc",   50.0, "Percentage of monthly CTC paid as Basic Salary"),
    ("hra_pct",    "House Rent Allowance (HRA)",     "pct_basic", 45.0, "Percentage of Basic Salary paid as HRA"),
    ("lta_pct",    "Leave Travel Allowance (LTA)",   "pct_ctc",    0.0, "Percentage of monthly CTC paid as LTA (set to 0 if not applicable)"),
    ("transport",  "Conveyance Allowance",            "fixed",   2333.0, "Fixed conveyance allowance per month (₹)"),
]

# announcements_table — company-wide notices posted by managers.
# Soft-deleted via is_active=False so the history is preserved.
# category: Company | HR | IT | Facility | Celebration
announcements_table = Table(
    "announcements",
    metadata,
    Column("id",          BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("title",       String(300),  nullable=False),
    Column("body",        Text,         nullable=False),
    Column("category",    String(50),   nullable=False, default="Company"),
    Column("is_important", Boolean,     nullable=False, default=False),
    Column("author_id",   String(20),   ForeignKey("hrms.employees.employee_id"), nullable=True),
    Column("author_name", String(180),  nullable=True),
    Column("is_active",   Boolean,      nullable=False, default=True),
    Column("created_at",  DateTime,     nullable=False, default=datetime.utcnow),
    Column("updated_at",  DateTime,     nullable=False, default=datetime.utcnow),
)

# payroll_field_config_table — admin-defined custom earning/deduction fields.
# Examples: "Performance Bonus" (earning, fixed), "Loan Deduction" (deduction, fixed).
# calc_type: fixed | pct_basic | pct_ctc | pct_gross
payroll_field_config_table = Table(
    "payroll_field_config",
    metadata,
    Column("id",         BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("name",       String(120),  nullable=False),
    Column("category",   String(20),   nullable=False),   # earning | deduction
    Column("calc_type",  String(30),   nullable=False),
    Column("value",      Numeric(12,2),nullable=False, default=0),
    Column("active",     Boolean,      nullable=False, default=True),
    Column("created_by", String(20),   ForeignKey("hrms.employees.employee_id"), nullable=True),
    Column("created_at", DateTime,     nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime,     nullable=False, default=datetime.utcnow),
)

# payslip_line_items_table — the individual rows of each payslip
# (e.g. "Basic Salary ₹25,000", "PF ₹1,800").
# Linked to field_config_id for custom fields; is_custom=True flags them.
payslip_line_items_table = Table(
    "payslip_line_items",
    metadata,
    Column("id",              BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id",     String(20),   ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("payroll_month",   String(30),   nullable=False),   # e.g. "June 2026"
    Column("line_type",       String(20),   nullable=False),   # earning | deduction
    Column("label",           String(120),  nullable=False),
    Column("amount",          Numeric(14,2),nullable=False, default=0),
    Column("field_config_id", BigInteger,   ForeignKey("hrms.payroll_field_config.id"), nullable=True),
    Column("is_custom",       Boolean,      nullable=False, default=False),
    Column("created_at",      DateTime,     nullable=False, default=datetime.utcnow),
)

# email_logs_table — tracks every payslip email attempt.
# status lifecycle: queued → sent | failed
# provider_message_id is the SMTP Message-ID returned after successful delivery.
email_logs_table = Table(
    "email_logs",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payslip_id",          BigInteger),
    Column("recipient_email",     String(180), nullable=False),
    Column("subject",             String(300), nullable=False),
    Column("body",                Text, nullable=False),
    Column("attachment_filename", String(255)),
    Column("status",              String(30), nullable=False, default="queued"),
    Column("provider_message_id", String(500)),
    Column("error_message",       String(2000)),
    Column("sent_at",             DateTime),
    Column("created_at",          DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at",          DateTime, nullable=False, default=datetime.utcnow),
)


# password_reset_tokens_table — OTP records for forgot-password flow.
# Stores the 6-digit OTP, the real (user-provided) email it was sent to,
# an expiry timestamp, and a `used` flag so tokens can't be replayed.
password_reset_tokens_table = Table(
    "password_reset_tokens",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("otp", String(10), nullable=False),
    Column("real_email", String(200), nullable=False),  # real email provided by the user (not the DB email)
    Column("expires_at", DateTime, nullable=False),
    Column("used", Boolean, nullable=False, default=False),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
)


# attendance_table — daily clock-in/out records per employee
attendance_table = Table(
    "attendance",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("date", Date, nullable=False),
    Column("status", String(20), nullable=False, default="present"),  # present|late|absent|leave|holiday|weekend
    Column("clock_in", String(10)),
    Column("clock_out", String(10)),
    Column("hours_worked", Numeric(5, 2)),
    Column("notes", Text),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

# attendance_corrections_table — missed punch correction requests
attendance_corrections_table = Table(
    "attendance_corrections",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("emp_name", String(180), nullable=False),
    Column("date", Date, nullable=False),
    Column("reason", Text, nullable=False),
    # The employee's claimed actual punch time(s) — what approval should write back to the
    # attendance record. Either may be null (e.g. only the clock-out was missed).
    Column("corrected_clock_in", String(10)),
    Column("corrected_clock_out", String(10)),
    Column("status", String(20), nullable=False, default="pending"),  # pending|approved|rejected
    Column("requested_at", Date, nullable=False),
    Column("actioned_by", String(180)),
    Column("actioned_at", Date),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

# leave_requests_table — leave / time-off applications
leave_requests_table = Table(
    "leave_requests",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("emp_name", String(180), nullable=False),
    Column("leave_type", String(60), nullable=False),
    Column("from_date", Date, nullable=False),
    Column("to_date", Date, nullable=False),
    Column("days", Integer, nullable=False, default=1),
    Column("reason", Text, nullable=False),
    Column("status", String(20), nullable=False, default="pending"),  # pending|approved|rejected
    Column("applied_date", Date, nullable=False),
    Column("approved_by", String(180)),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

# leave_balances_table — per-employee leave allocation per fiscal year
leave_balances_table = Table(
    "leave_balances",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("leave_type", String(60), nullable=False),
    Column("total", Integer, nullable=False, default=0),
    Column("used", Integer, nullable=False, default=0),
    Column("color", String(10), nullable=False, default="#1B45F5"),
    Column("fiscal_year", String(10), nullable=False),  # e.g. "2024-25"
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

# time_log_entries_table — individual hour entries logged by employees
time_log_entries_table = Table(
    "time_log_entries",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("week_key", Date, nullable=False),  # Monday of the ISO week
    Column("date", Date, nullable=False),
    Column("project", String(200), nullable=False),
    Column("subtask", String(200), nullable=False),
    Column("hours", Numeric(5, 2), nullable=False),
    Column("notes", Text),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
)

# timesheets_table — weekly timesheet summary (status lifecycle: draft→submitted→approved|rejected)
timesheets_table = Table(
    "timesheets",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("week_key", Date, nullable=False),
    Column("total_hours", Numeric(6, 2), nullable=False, default=0),
    Column("status", String(20), nullable=False, default="draft"),  # draft|submitted|approved|rejected
    Column("approved_by", String(180)),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

# documents_table — employee document vault.
# Stores metadata only; file bytes live on disk at uploads/<stored_name>.
# category: Offer Letter | Payslip | Tax | PF | Policy | Other
documents_table = Table(
    "documents",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id",   String(20),  ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("uploaded_by",   String(20),  ForeignKey("hrms.employees.employee_id"), nullable=False),
    Column("original_name", String(255), nullable=False),
    Column("stored_name",   String(255), nullable=False),   # uuid-based filename on disk
    Column("file_type",     String(80),  nullable=True),    # MIME type
    Column("file_size",     Integer,     nullable=True),    # bytes
    Column("category",      String(60),  nullable=False, default="Other"),
    Column("description",   Text,        nullable=True),
    Column("created_at",    DateTime,    nullable=False, default=datetime.utcnow),
)

# payroll_statutory_config_table — DB-driven statutory deduction rates.
# Replaces all hardcoded PF/ESI/PT/TDS constants in the frontend.
# key values and their meanings:
#   pf_rate_employee    — employee PF contribution as decimal (e.g. 0.12 = 12%)
#   pf_rate_employer    — employer PF contribution as decimal
#   pf_ceiling          — monthly basic salary cap for PF calculation (₹)
#   esi_rate_employee   — employee ESI rate as decimal (e.g. 0.0075 = 0.75%)
#   esi_rate_employer   — employer ESI rate as decimal
#   esi_gross_limit     — max gross salary eligible for ESI (₹)
#   pt_slab_json        — JSON array of {min, max, pt} slabs for Professional Tax
#   tds_slab_json       — JSON array of {min, max, rate} slabs for Income Tax (New Regime)
#   tds_cess_rate       — Health & Education cess rate as decimal (e.g. 0.04 = 4%)
#   tds_80c_limit       — Section 80C deduction limit (₹) for TDS calculation
#   tds_standard_deduction — Standard deduction amount (₹) for salaried employees
payroll_statutory_config_table = Table(
    "payroll_statutory_config",
    metadata,
    Column("id",          BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("config_key",  String(60),   nullable=False, unique=True),
    Column("label",       String(200),  nullable=False),
    Column("value",       String(500),  nullable=False),   # numeric value OR JSON string for slabs
    Column("description", String(500),  nullable=True),
    Column("updated_by",  String(20),   ForeignKey("hrms.employees.employee_id"), nullable=True),
    Column("updated_at",  DateTime,     nullable=False, default=datetime.utcnow),
)

# Default statutory config values seeded on first run.
# Tuple: (config_key, label, value, description)
STATUTORY_CONFIG_DEFAULTS = [
    ("pf_rate_employee",        "PF Employee Rate",             "0.12",
     "Employee PF contribution: 12% of basic salary (capped at PF ceiling)"),
    ("pf_rate_employer",        "PF Employer Rate",             "0.12",
     "Employer PF contribution: 12% of basic salary (capped at PF ceiling)"),
    ("pf_ceiling",              "PF Wage Ceiling (₹/month)",    "15000",
     "PF is calculated on min(basic, ceiling). Currently ₹15,000 as per EPFO."),
    ("esi_rate_employee",       "ESI Employee Rate",            "0.0075",
     "Employee ESI contribution: 0.75% of gross salary"),
    ("esi_rate_employer",       "ESI Employer Rate",            "0.0325",
     "Employer ESI contribution: 3.25% of gross salary"),
    ("esi_gross_limit",         "ESI Gross Salary Limit (₹)",   "21000",
     "ESI applies only when monthly gross ≤ this limit. Currently ₹21,000."),
    ("pt_slab_json",            "Professional Tax Slabs (JSON)","[{\"min\":0,\"max\":10000,\"pt\":0},{\"min\":10001,\"max\":15000,\"pt\":150},{\"min\":15001,\"max\":999999999,\"pt\":200}]",
     "Karnataka PT schedule. Array of {min, max, pt} objects. Adjust for your state."),
    ("tds_slab_json",           "Income Tax Slabs New Regime (JSON)","[{\"min\":0,\"max\":250000,\"rate\":0},{\"min\":250001,\"max\":500000,\"rate\":0.05},{\"min\":500001,\"max\":750000,\"rate\":0.10},{\"min\":750001,\"max\":1000000,\"rate\":0.15},{\"min\":1000001,\"max\":1250000,\"rate\":0.20},{\"min\":1250001,\"max\":1500000,\"rate\":0.25},{\"min\":1500001,\"max\":999999999,\"rate\":0.30}]",
     "New Regime income tax slabs (Section 115BAC, FY 2024-25). Array of {min, max, rate}."),
    ("tds_cess_rate",           "Health & Education Cess Rate", "0.04",
     "4% cess applied on top of computed income tax."),
    ("tds_80c_limit",           "Section 80C Limit (₹)",        "150000",
     "Maximum annual 80C deduction (PF contributions counted towards this)."),
    ("tds_standard_deduction",  "Standard Deduction (₹)",       "50000",
     "Annual standard deduction for salaried employees under the New Regime."),
]

# Default leave type allocations seeded for every new employee.
LEAVE_TYPES_DEFAULT = [
    ("Earned Leave",        21, "#1B45F5"),
    ("Sick Leave",          12, "#0F8C5A"),
    ("Casual Leave",         9, "#5C35C2"),
    ("Maternity/Paternity",  0, "#B06010"),
    ("Compensatory Off",     5, "#0A7E7A"),
]


# notifications_table — in-app alerts sent to HR/Director when leave or
# attendance correction requests are submitted.
notifications_table = Table(
    "notifications",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("recipient_id", String(20), nullable=False),
    Column("type",         String(40),  nullable=False),   # leave_request | attendance_correction
    Column("title",        String(200), nullable=False),
    Column("message",      String(500), nullable=False),
    Column("ref_id",       Integer,     nullable=True),    # FK to the originating request row
    Column("is_read",      Boolean,     nullable=False, default=False),
    Column("created_at",   DateTime,    nullable=False, default=datetime.utcnow),
)


company_holidays_table = Table(
    "company_holidays",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("holiday_date", Date, nullable=False, unique=True),
    Column("name", String(200), nullable=False),
    Column("created_by", String(180), nullable=False),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
)


goals_table = Table(
    "goals",
    metadata,
    Column("id",          BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20),   nullable=False),
    Column("title",       String(200),  nullable=False),
    Column("target",      String(300),  nullable=True),
    Column("notes",       String(500),  nullable=True),
    Column("is_key",      Boolean,      nullable=False, default=False),
    Column("progress",    Integer,      nullable=False, default=0),
    Column("status",      String(20),   nullable=False, default="on-track"),  # on-track | at-risk
    Column("quarter",     String(10),   nullable=False),   # e.g. Q2-2026
    Column("created_at",  DateTime,     nullable=False, default=datetime.utcnow),
    Column("updated_at",  DateTime,     nullable=False, default=datetime.utcnow),
)

performance_reviews_table = Table(
    "performance_reviews",
    metadata,
    Column("id",          BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20),   nullable=False),   # who is being reviewed
    Column("reviewer_id", String(20),   nullable=True),    # who wrote the review (manager/HR)
    Column("period",      String(40),   nullable=False),   # e.g. "Q2 2026" or "Annual 2025"
    Column("score",       Float,        nullable=True),    # 1.0–5.0, null if TBD
    Column("feedback",    Text,         nullable=True),
    Column("status",      String(20),   nullable=False, default="pending"),  # pending | complete
    Column("review_date", Date,         nullable=True),
    Column("created_at",  DateTime,     nullable=False, default=datetime.utcnow),
)

# ── Serialisation helpers ─────────────────────────────────────────────────────

def serialize(value: Any):
    """
    Converts non-JSON-serialisable Python types to safe equivalents:
      datetime/date → ISO 8601 string  (e.g. "2025-06-05T14:30:00")
      Decimal       → float            (avoids JSON serialisation errors)
    """
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def rows_to_dicts(result):
    """Converts a list of SQLAlchemy Row objects to a list of plain dicts."""
    return [{k: serialize(v) for k, v in row._mapping.items()} for row in result]


# ── Index helpers ─────────────────────────────────────────────────────────────

def _idx(conn, name: str, table: str, cols: str) -> None:
    """Creates an index idempotently (catches 'already exists' from any dialect)."""
    try:
        conn.execute(text(f"CREATE INDEX {name} ON {table} ({cols})"))
    except Exception:
        pass


# ── Database initialisation ───────────────────────────────────────────────────

def init_database():
    """
    Called once at server startup (via the @app.on_event("startup") hook).
    - Creates all tables that don't exist yet (checkfirst=True is safe).
    - Seeds the payroll_structure table with defaults if it's empty.
    - Seeds default leave balances for all employees if the table is empty.
    """
    metadata.create_all(engine, checkfirst=True)

    # Add indexes for every hot query path. _idx() is idempotent — safe to call on
    # every startup; the database ignores duplicates via the caught exception.
    # DDL (CREATE INDEX) must run outside an explicit transaction on MSSQL because
    # SQL Server auto-commits DDL internally, leaving no open transaction for
    # SQLAlchemy's engine.begin() to commit.  AUTOCOMMIT mode works on all dialects.
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as _ic:
        _idx(_ic, "ix_att_emp_date",    "hrms.attendance",              "employee_id, date")
        _idx(_ic, "ix_att_date",        "hrms.attendance",              "date")
        _idx(_ic, "ix_cor_emp",         "hrms.attendance_corrections",  "employee_id")
        _idx(_ic, "ix_cor_status",      "hrms.attendance_corrections",  "status")
        _idx(_ic, "ix_lr_emp",          "hrms.leave_requests",          "employee_id")
        _idx(_ic, "ix_lr_status",       "hrms.leave_requests",          "status")
        _idx(_ic, "ix_lb_emp_fy",       "hrms.leave_balances",          "employee_id, fiscal_year")
        _idx(_ic, "ix_tle_emp_wk",      "hrms.time_log_entries",        "employee_id, week_key")
        _idx(_ic, "ix_ts_emp_wk",       "hrms.timesheets",              "employee_id, week_key")
        _idx(_ic, "ix_ts_status",       "hrms.timesheets",              "status")
        _idx(_ic, "ix_pli_emp_month",   "hrms.payslip_line_items",      "employee_id, payroll_month")
        _idx(_ic, "ix_notif_recip",     "hrms.notifications",           "recipient_id, is_read")
        _idx(_ic, "ix_doc_emp",         "hrms.documents",               "employee_id")
        _idx(_ic, "ix_emp_mgr",         "hrms.employees",               "mgr_id")

    # Migration: add must_change_password column to existing tables (safe to run on every startup).
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as _mc:
        try:
            if IS_SQLITE:
                _mc.execute(text("ALTER TABLE hrms.employees ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 1"))
            else:
                _mc.execute(text("ALTER TABLE hrms.employees ADD must_change_password BIT NOT NULL DEFAULT 1"))
        except Exception:
            pass  # column already exists

    # Migration: add corrected_clock_in/out columns to existing attendance_corrections tables
    # (safe to run on every startup — create_all() only creates brand-new tables, it never
    # alters ones that already exist, so this is the only way an already-deployed database
    # picks up these columns).
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as _cc:
        for _col in ("corrected_clock_in", "corrected_clock_out"):
            try:
                if IS_SQLITE:
                    _cc.execute(text(f"ALTER TABLE hrms.attendance_corrections ADD COLUMN {_col} VARCHAR(10)"))
                else:
                    _cc.execute(text(f"ALTER TABLE hrms.attendance_corrections ADD {_col} VARCHAR(10)"))
            except Exception:
                pass  # column already exists

    now = datetime.utcnow()
    with engine.begin() as conn:
        existing = conn.execute(select(payroll_structure_table.c.id)).fetchall()
        if not existing:
            for key, label, calc_type, value, desc in PAYROLL_STRUCTURE_DEFAULTS:
                conn.execute(insert(payroll_structure_table).values(
                    component_key=key, label=label, calc_type=calc_type,
                    value=value, description=desc, updated_at=now,
                ))
        # Seed statutory deduction config (PF/ESI/PT/TDS rates) if not already present.
        for config_key, label, value, desc in STATUTORY_CONFIG_DEFAULTS:
            already = conn.execute(
                select(payroll_statutory_config_table.c.id).where(
                    payroll_statutory_config_table.c.config_key == config_key
                )
            ).first()
            if not already:
                conn.execute(insert(payroll_statutory_config_table).values(
                    config_key=config_key, label=label, value=value,
                    description=desc, updated_at=now,
                ))
        # Seed default leave balances for any employee that doesn't have them yet.
        today = date.today()
        fy_start = today.year if today.month >= 4 else today.year - 1
        fiscal_year = f"{fy_start}-{str(fy_start + 1)[-2:]}"
        emp_rows = conn.execute(
            select(employees_table.c.employee_id)
        ).fetchall()
        for row in emp_rows:
            emp_id = row._mapping["employee_id"]
            has_balance = conn.execute(
                select(leave_balances_table.c.id).where(
                    (leave_balances_table.c.employee_id == emp_id) &
                    (leave_balances_table.c.fiscal_year == fiscal_year)
                )
            ).first()
            if not has_balance:
                for leave_type, total, color in LEAVE_TYPES_DEFAULT:
                    conn.execute(insert(leave_balances_table).values(
                        employee_id=emp_id, leave_type=leave_type,
                        total=total, used=0, color=color,
                        fiscal_year=fiscal_year,
                        created_at=now, updated_at=now,
                    ))
            # Recovery email is NOT seeded with any default.
            # Each employee must set their own via Security Settings → Recovery Email.


# ── Utility ───────────────────────────────────────────────────────────────────

def _calc_age(dob):
    """Returns the employee's age in whole years, or 0 if dob is None."""
    if not dob:
        return 0
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


# ── Employee queries ──────────────────────────────────────────────────────────

def fetch_all_employees_full():
    """
    Returns every active employee as a list of frontend-shaped dicts.
    Performance score is auto-computed from timesheets + goals (no manual input).
    """
    with engine.begin() as conn:
        rows = conn.execute(select(employees_table).order_by(employees_table.c.employee_id)).fetchall()
    emps = [dict(r._mapping) for r in rows]

    # Build the "who reports to whom" map in a single pass over the employee list.
    reports_map = {e["employee_id"]: [] for e in emps}
    for e in emps:
        if e["mgr_id"] and e["mgr_id"] in reports_map:
            reports_map[e["mgr_id"]].append(e["employee_id"])

    # Auto-compute performance scores from timesheets + goals.
    perf_scores = compute_perf_scores_bulk()

    result = []
    for e in emps:
        dob = e.get("dob")
        joining = e.get("date_of_joining")
        result.append({
            "id": e["employee_id"], "firstName": e["first_name"],
            "middleName": e.get("middle_name") or "", "lastName": e["last_name"],
            "name": e["full_name"], "dept": e["department"], "role": e["designation"],
            "accessLevel": e["access_level"], "ctcLPA": float(e["annual_ctc_lpa"]),
            "joining": joining.isoformat() if joining else None,
            "color": e.get("color") or "#1B45F5",
            "mgr": e.get("mgr_id"),
            "reports": reports_map.get(e["employee_id"], []),
            "loc": e.get("location") or "", "email": e["email"],
            "phone": e.get("phone") or "",
            "perf": perf_scores.get(e["employee_id"], 3.0),
            "dob": dob.isoformat() if dob else None,
            "age": _calc_age(dob), "gender": e.get("gender") or "",
            "aadhaar": e.get("aadhaar") or "", "pan": e.get("pan") or "",
            "empType": e.get("emp_type") or "Full-time",
            "noticePeriod": e.get("notice_period") or "",
            "bank": e.get("bank_name") or "", "accountNo": e.get("bank_account_no") or "",
            "ifsc": e.get("ifsc") or "", "uan": e.get("uan") or "",
            "pfAccount": e.get("pf_account") or "", "esic": e.get("esic") or "",
            "isHR": bool(e.get("is_hr")),
        })
    return result


def verify_login(email, password):
    """
    Looks up the employee by email, verifies the PBKDF2 hash, and returns the
    full frontend-shaped dict — same shape as fetch_all_employees_full entries.
    Builds the dict from two small queries instead of loading the entire table.
    """
    with engine.begin() as conn:
        row = conn.execute(
            select(employees_table).where(employees_table.c.email == email.lower().strip())
        ).first()
    if not row:
        return None
    emp = dict(row._mapping)
    if not verify_password(password, emp["password_hash"]):
        return None
    # Fetch only the direct-report IDs for this manager — avoids loading all employees.
    with engine.begin() as conn:
        report_rows = conn.execute(
            select(employees_table.c.employee_id).where(
                employees_table.c.mgr_id == emp["employee_id"]
            )
        ).fetchall()
    reports = [r._mapping["employee_id"] for r in report_rows]
    dob = emp.get("dob")
    joining = emp.get("date_of_joining")
    return {
        "id": emp["employee_id"], "firstName": emp["first_name"],
        "middleName": emp.get("middle_name") or "", "lastName": emp["last_name"],
        "name": emp["full_name"], "dept": emp["department"], "role": emp["designation"],
        "accessLevel": emp["access_level"], "ctcLPA": float(emp["annual_ctc_lpa"]),
        "joining": joining.isoformat() if joining else None,
        "color": emp.get("color") or "#1B45F5",
        "mgr": emp.get("mgr_id"), "reports": reports,
        "loc": emp.get("location") or "", "email": emp["email"],
        "phone": emp.get("phone") or "",
        "perf": float(emp["perf_score"]) if emp.get("perf_score") else 0,
        "dob": dob.isoformat() if dob else None,
        "age": _calc_age(dob), "gender": emp.get("gender") or "",
        "aadhaar": emp.get("aadhaar") or "", "pan": emp.get("pan") or "",
        "empType": emp.get("emp_type") or "Full-time",
        "noticePeriod": emp.get("notice_period") or "",
        "bank": emp.get("bank_name") or "", "accountNo": emp.get("bank_account_no") or "",
        "ifsc": emp.get("ifsc") or "", "uan": emp.get("uan") or "",
        "pfAccount": emp.get("pf_account") or "", "esic": emp.get("esic") or "",
        "isHR": bool(emp.get("is_hr")),
        "mustChangePassword": bool(emp.get("must_change_password", True)),
    }


def fetch_employees():
    """
    Lightweight employee list used by the payroll summary endpoint.
    Only returns non-sensitive columns (no salary, PAN, bank details).
    """
    stmt = select(
        employees_table.c.employee_id, employees_table.c.first_name,
        employees_table.c.last_name, employees_table.c.full_name,
        employees_table.c.department, employees_table.c.designation,
        employees_table.c.email, employees_table.c.location,
        employees_table.c.annual_ctc_lpa, employees_table.c.is_active,
    ).order_by(employees_table.c.employee_id)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def fetch_payroll_runs():
    """Returns the 50 most recent payroll run records, newest first."""
    stmt = select(
        payroll_runs_table.c.id, payroll_runs_table.c.payroll_month,
        payroll_runs_table.c.status, payroll_runs_table.c.pay_date,
        payroll_runs_table.c.payment_mode, payroll_runs_table.c.tax_regime,
        payroll_runs_table.c.remarks,
        payroll_runs_table.c.processed_by, payroll_runs_table.c.processed_at,
        payroll_runs_table.c.created_at,
    ).order_by(
        desc(payroll_runs_table.c.payroll_month),
        desc(payroll_runs_table.c.created_at),
    ).limit(50)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def upsert_payroll_run(payroll_month: date, *, status=None, pay_date=None,
                        payment_mode=None, tax_regime=None, remarks=None, processed_by=None):
    """Creates or updates the month-level payroll run record (status/pay date/etc.).
    Keyed by payroll_month (one row per calendar month). Returns the saved row."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        existing = conn.execute(
            select(payroll_runs_table).where(payroll_runs_table.c.payroll_month == payroll_month)
        ).first()
        vals = {"updated_at": now}
        if status is not None:       vals["status"]        = status
        if pay_date is not None:     vals["pay_date"]       = pay_date
        if payment_mode is not None: vals["payment_mode"]   = payment_mode
        if tax_regime is not None:   vals["tax_regime"]     = tax_regime
        if remarks is not None:      vals["remarks"]        = remarks
        if processed_by is not None:
            vals["processed_by"] = processed_by
            vals["processed_at"] = now
        if existing:
            conn.execute(
                update(payroll_runs_table)
                .where(payroll_runs_table.c.payroll_month == payroll_month)
                .values(**vals)
            )
        else:
            conn.execute(insert(payroll_runs_table).values(
                payroll_month=payroll_month, status=status or "draft",
                pay_date=pay_date, payment_mode=payment_mode or "Bank Transfer",
                tax_regime=tax_regime or "New Regime", remarks=remarks,
                processed_by=processed_by, processed_at=now if processed_by else None,
                created_at=now, updated_at=now,
            ))
        row = conn.execute(
            select(payroll_runs_table).where(payroll_runs_table.c.payroll_month == payroll_month)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


# ── Announcement queries ──────────────────────────────────────────────────────

def fetch_announcements():
    """Returns all active announcements ordered by newest first."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(announcements_table)
            .where(announcements_table.c.is_active == True)
            .order_by(desc(announcements_table.c.created_at))
        ).fetchall()
    return rows_to_dicts(rows)


def create_announcement(title, body, category, is_important, author_id, author_name):
    """Inserts a new announcement and returns the created row as a dict."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(insert(announcements_table).values(
            title=title, body=body, category=category,
            is_important=is_important, author_id=author_id,
            author_name=author_name, is_active=True,
            created_at=now, updated_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(announcements_table).where(announcements_table.c.id == row_id)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_announcement(ann_id, **kwargs):
    """Updates an announcement by ID. Always stamps updated_at."""
    kwargs["updated_at"] = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(
            update(announcements_table)
            .where(announcements_table.c.id == ann_id)
            .values(**kwargs)
        )
        row = conn.execute(
            select(announcements_table).where(announcements_table.c.id == ann_id)
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_announcement(ann_id):
    """Soft delete — sets is_active=False so the record is hidden but not lost."""
    with engine.begin() as conn:
        result = conn.execute(
            update(announcements_table)
            .where(announcements_table.c.id == ann_id)
            .values(is_active=False, updated_at=datetime.utcnow())
        )
    return result.rowcount > 0


# ── Payroll structure queries ─────────────────────────────────────────────────

def fetch_payroll_structure():
    """Returns all salary structure component rows ordered by ID."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(payroll_structure_table).order_by(payroll_structure_table.c.id)
        ).fetchall()
    return rows_to_dicts(rows)


def update_payroll_structure_component(component_key, value, updated_by=None):
    """
    Updates a single component (e.g. basic_pct → 50) by its key.
    Returns the updated row, or None if the key doesn't exist.
    """
    now = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(
            update(payroll_structure_table)
            .where(payroll_structure_table.c.component_key == component_key)
            .values(value=value, updated_by=updated_by, updated_at=now)
        )
        row = conn.execute(
            select(payroll_structure_table)
            .where(payroll_structure_table.c.component_key == component_key)
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


# ── Payroll field config queries ──────────────────────────────────────────────

def fetch_payroll_field_configs():
    """Returns all custom earning/deduction field configs, oldest first."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(payroll_field_config_table)
            .order_by(payroll_field_config_table.c.created_at)
        ).fetchall()
    return rows_to_dicts(rows)


def create_payroll_field_config(name, category, calc_type, value, active, created_by):
    """Inserts a new custom payroll field and returns the created row."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(insert(payroll_field_config_table).values(
            name=name, category=category, calc_type=calc_type,
            value=value, active=active, created_by=created_by,
            created_at=now, updated_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(payroll_field_config_table)
            .where(payroll_field_config_table.c.id == row_id)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_payroll_field_config(field_id, **kwargs):
    """Partial update of a custom field. Always stamps updated_at."""
    kwargs["updated_at"] = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(
            update(payroll_field_config_table)
            .where(payroll_field_config_table.c.id == field_id)
            .values(**kwargs)
        )
        row = conn.execute(
            select(payroll_field_config_table)
            .where(payroll_field_config_table.c.id == field_id)
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_payroll_field_config(field_id):
    """
    Hard delete — custom fields are admin config (not employee records),
    so a real DELETE is safe. Returns True if a row was deleted.
    """
    with engine.begin() as conn:
        result = conn.execute(
            sql_delete(payroll_field_config_table)
            .where(payroll_field_config_table.c.id == field_id)
        )
    return result.rowcount > 0


# ── Payslip line item queries ─────────────────────────────────────────────────

def save_payslip_line_items(employee_id, payroll_month, lines):
    """
    Persists the computed payslip breakdown for one employee + month.

    lines: list of dicts with keys:
      line_type     — "earning" | "deduction"
      label         — human-readable name (e.g. "Basic Salary")
      amount        — rupee amount (float)
      field_config_id — FK to payroll_field_config (None for standard lines)
      is_custom     — True for admin-defined custom fields

    Idempotent: deletes any existing lines for the same employee+month before
    inserting, so re-running payroll for the same month is safe.
    """
    now = datetime.utcnow()
    with engine.begin() as conn:
        # Clear existing lines first to avoid duplicates on re-run.
        conn.execute(
            sql_delete(payslip_line_items_table).where(
                (payslip_line_items_table.c.employee_id == employee_id) &
                (payslip_line_items_table.c.payroll_month == payroll_month)
            )
        )
        for line in lines:
            conn.execute(insert(payslip_line_items_table).values(
                employee_id=employee_id,
                payroll_month=payroll_month,
                line_type=line["line_type"],
                label=line["label"],
                amount=line["amount"],
                field_config_id=line.get("field_config_id"),
                is_custom=line.get("is_custom", False),
                created_at=now,
            ))


def fetch_payslip_line_items(employee_id, payroll_month):
    """Returns all saved line items for one employee + month, ordered by ID."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(payslip_line_items_table).where(
                (payslip_line_items_table.c.employee_id == employee_id) &
                (payslip_line_items_table.c.payroll_month == payroll_month)
            ).order_by(payslip_line_items_table.c.id)
        ).fetchall()
    return rows_to_dicts(rows)


# ── Email log queries ─────────────────────────────────────────────────────────

def fetch_email_logs():
    """Returns the 100 most recent email log entries, newest first."""
    stmt = select(
        email_logs_table.c.id, email_logs_table.c.recipient_email,
        email_logs_table.c.subject, email_logs_table.c.attachment_filename,
        email_logs_table.c.status, email_logs_table.c.provider_message_id,
        email_logs_table.c.error_message, email_logs_table.c.sent_at,
        email_logs_table.c.created_at,
    ).order_by(desc(email_logs_table.c.created_at)).limit(100)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def insert_email_log(recipient_email, subject, body, attachment_filename, status):
    """Creates a new email log entry in "queued" status and returns its ID."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(insert(email_logs_table).values(
            recipient_email=recipient_email, subject=subject, body=body,
            attachment_filename=attachment_filename, status=status,
            created_at=now, updated_at=now,
        ))
        return result.inserted_primary_key[0]


def mark_email_log_sent(log_id, provider_message_id):
    """Updates an email log to status="sent" with the SMTP Message-ID."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(
            update(email_logs_table)
            .where(email_logs_table.c.id == log_id)
            .values(status="sent", provider_message_id=provider_message_id,
                    sent_at=now, updated_at=now)
        )


def mark_email_log_failed(log_id, error_message):
    """Updates an email log to status="failed" with the error reason (capped at 2000 chars)."""
    with engine.begin() as conn:
        conn.execute(
            update(email_logs_table)
            .where(email_logs_table.c.id == log_id)
            .values(status="failed", error_message=error_message[:2000],
                    updated_at=datetime.utcnow())
        )


# ── Attendance queries ────────────────────────────────────────────────────────

def fetch_attendance_for_month(employee_id: str, year: int, month: int):
    """Returns all attendance records for one employee in a given month."""
    from_date = date(year, month, 1)
    # last day of month
    if month == 12:
        to_date = date(year + 1, 1, 1)
    else:
        to_date = date(year, month + 1, 1)
    with engine.begin() as conn:
        rows = conn.execute(
            select(attendance_table).where(
                (attendance_table.c.employee_id == employee_id) &
                (attendance_table.c.date >= from_date) &
                (attendance_table.c.date < to_date)
            ).order_by(attendance_table.c.date)
        ).fetchall()
    return rows_to_dicts(rows)


def fetch_all_attendance_for_month(year: int, month: int):
    """Returns attendance records for ALL employees in a given month (HR reports)."""
    from_date = date(year, month, 1)
    if month == 12:
        to_date = date(year + 1, 1, 1)
    else:
        to_date = date(year, month + 1, 1)
    with engine.begin() as conn:
        rows = conn.execute(
            select(attendance_table).where(
                (attendance_table.c.date >= from_date) &
                (attendance_table.c.date < to_date)
            ).order_by(attendance_table.c.employee_id, attendance_table.c.date)
        ).fetchall()
    return rows_to_dicts(rows)


def upsert_attendance(employee_id: str, att_date: date, status: str,
                      clock_in=None, clock_out=None, hours_worked=None, notes=None):
    """Creates or updates the attendance record for employee+date. Returns the saved row."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        existing = conn.execute(
            select(attendance_table).where(
                (attendance_table.c.employee_id == employee_id) &
                (attendance_table.c.date == att_date)
            )
        ).first()
        if existing:
            vals = {"status": status, "updated_at": now}
            if clock_in is not None:     vals["clock_in"]      = clock_in
            if clock_out is not None:    vals["clock_out"]     = clock_out
            if hours_worked is not None: vals["hours_worked"]  = hours_worked
            if notes is not None:        vals["notes"]         = notes
            conn.execute(
                update(attendance_table)
                .where(
                    (attendance_table.c.employee_id == employee_id) &
                    (attendance_table.c.date == att_date)
                ).values(**vals)
            )
        else:
            conn.execute(insert(attendance_table).values(
                employee_id=employee_id, date=att_date, status=status,
                clock_in=clock_in, clock_out=clock_out,
                hours_worked=hours_worked, notes=notes,
                created_at=now, updated_at=now,
            ))
        row = conn.execute(
            select(attendance_table).where(
                (attendance_table.c.employee_id == employee_id) &
                (attendance_table.c.date == att_date)
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


# ── Attendance correction queries ─────────────────────────────────────────────

def fetch_corrections(employee_id=None, status=None):
    """Returns correction requests. Filters by employee and/or status if provided."""
    stmt = select(attendance_corrections_table).order_by(
        desc(attendance_corrections_table.c.created_at)
    )
    if employee_id:
        stmt = stmt.where(attendance_corrections_table.c.employee_id == employee_id)
    if status and status != "all":
        stmt = stmt.where(attendance_corrections_table.c.status == status)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt).fetchall())


def create_correction(employee_id: str, emp_name: str, corr_date: date, reason: str,
                       corrected_clock_in: str = None, corrected_clock_out: str = None):
    """Creates a new missed-punch correction request. Returns the created row."""
    now = datetime.utcnow()
    today = date.today()
    with engine.begin() as conn:
        result = conn.execute(insert(attendance_corrections_table).values(
            employee_id=employee_id, emp_name=emp_name,
            date=corr_date, reason=reason,
            corrected_clock_in=corrected_clock_in, corrected_clock_out=corrected_clock_out,
            status="pending", requested_at=today,
            created_at=now, updated_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(attendance_corrections_table).where(
                attendance_corrections_table.c.id == row_id
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_correction_status(correction_id: int, status: str, actioned_by: str = None):
    """Approves or rejects a correction request. Returns the updated row."""
    now = datetime.utcnow()
    vals = {"status": status, "updated_at": now}
    if actioned_by:
        vals["actioned_by"] = actioned_by
        vals["actioned_at"] = date.today()
    with engine.begin() as conn:
        conn.execute(
            update(attendance_corrections_table)
            .where(attendance_corrections_table.c.id == correction_id)
            .values(**vals)
        )
        row = conn.execute(
            select(attendance_corrections_table).where(
                attendance_corrections_table.c.id == correction_id
            )
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


# ── Leave request queries ─────────────────────────────────────────────────────

def fetch_leave_requests(employee_id=None, status=None):
    """Returns leave requests. Can be filtered by employee_id and/or status."""
    stmt = select(leave_requests_table).order_by(desc(leave_requests_table.c.created_at))
    if employee_id:
        stmt = stmt.where(leave_requests_table.c.employee_id == employee_id)
    if status and status != "all":
        stmt = stmt.where(leave_requests_table.c.status == status)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt).fetchall())


def create_leave_request(employee_id: str, emp_name: str, leave_type: str,
                          from_date: date, to_date: date, days: int, reason: str,
                          status: str = "pending", applied_date: date = None,
                          approved_by: str = None):
    """Creates a new leave request. Returns the created row."""
    now = datetime.utcnow()
    if applied_date is None:
        applied_date = date.today()
    vals = dict(
        employee_id=employee_id, emp_name=emp_name, leave_type=leave_type,
        from_date=from_date, to_date=to_date, days=days, reason=reason,
        status=status, applied_date=applied_date,
        created_at=now, updated_at=now,
    )
    if approved_by:
        vals["approved_by"] = approved_by
    with engine.begin() as conn:
        result = conn.execute(insert(leave_requests_table).values(**vals))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(leave_requests_table).where(leave_requests_table.c.id == row_id)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_leave_request_status(request_id: int, status: str, approved_by: str = None):
    """Updates a leave request's status. Returns the updated row."""
    now = datetime.utcnow()
    vals = {"status": status, "updated_at": now}
    if approved_by:
        vals["approved_by"] = approved_by
    with engine.begin() as conn:
        conn.execute(
            update(leave_requests_table)
            .where(leave_requests_table.c.id == request_id)
            .values(**vals)
        )
        row = conn.execute(
            select(leave_requests_table).where(leave_requests_table.c.id == request_id)
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def fetch_leave_balances(employee_id: str):
    """Returns all leave balance rows for an employee (current fiscal year order)."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(leave_balances_table)
            .where(leave_balances_table.c.employee_id == employee_id)
            .order_by(leave_balances_table.c.id)
        ).fetchall()
    return rows_to_dicts(rows)


def ensure_leave_balances(employee_id: str, fiscal_year: str):
    """Creates default leave balances for an employee+fiscal_year if they don't exist yet."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        existing = conn.execute(
            select(leave_balances_table.c.id).where(
                (leave_balances_table.c.employee_id == employee_id) &
                (leave_balances_table.c.fiscal_year == fiscal_year)
            )
        ).fetchall()
        if not existing:
            for leave_type, total, color in LEAVE_TYPES_DEFAULT:
                conn.execute(insert(leave_balances_table).values(
                    employee_id=employee_id, leave_type=leave_type,
                    total=total, used=0, color=color,
                    fiscal_year=fiscal_year,
                    created_at=now, updated_at=now,
                ))
    return fetch_leave_balances(employee_id)


def increment_leave_used(employee_id: str, leave_type: str, days: int, fiscal_year: str):
    """Increments the `used` counter for a leave type when a request is approved."""
    with engine.begin() as conn:
        row = conn.execute(
            select(leave_balances_table).where(
                (leave_balances_table.c.employee_id == employee_id) &
                (leave_balances_table.c.leave_type == leave_type) &
                (leave_balances_table.c.fiscal_year == fiscal_year)
            )
        ).first()
        if row:
            new_used = min(int(row._mapping["used"]) + days, int(row._mapping["total"]))
            conn.execute(
                update(leave_balances_table)
                .where(leave_balances_table.c.id == row._mapping["id"])
                .values(used=new_used, updated_at=datetime.utcnow())
            )


def decrement_leave_used(employee_id: str, leave_type: str, days: int, fiscal_year: str):
    """Decrements the `used` counter when an approved leave is rejected/cancelled."""
    with engine.begin() as conn:
        row = conn.execute(
            select(leave_balances_table).where(
                (leave_balances_table.c.employee_id == employee_id) &
                (leave_balances_table.c.leave_type == leave_type) &
                (leave_balances_table.c.fiscal_year == fiscal_year)
            )
        ).first()
        if row:
            new_used = max(0, int(row._mapping["used"]) - days)
            conn.execute(
                update(leave_balances_table)
                .where(leave_balances_table.c.id == row._mapping["id"])
                .values(used=new_used, updated_at=datetime.utcnow())
            )


# ── Time log queries ──────────────────────────────────────────────────────────

def fetch_time_log_entries(employee_id: str, week_key: date):
    """Returns all time log entries for an employee's week."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(time_log_entries_table).where(
                (time_log_entries_table.c.employee_id == employee_id) &
                (time_log_entries_table.c.week_key == week_key)
            ).order_by(time_log_entries_table.c.created_at)
        ).fetchall()
    return rows_to_dicts(rows)


def create_time_log_entry(employee_id: str, week_key: date, entry_date: date,
                           project: str, subtask: str, hours: float, notes: str = None):
    """Creates a new time log entry and returns it."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(insert(time_log_entries_table).values(
            employee_id=employee_id, week_key=week_key,
            date=entry_date, project=project, subtask=subtask,
            hours=hours, notes=notes, created_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(time_log_entries_table).where(time_log_entries_table.c.id == row_id)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_time_log_entry(entry_id: int, employee_id: str):
    """Hard-deletes a time log entry (only allowed while timesheet is in draft). Returns True if deleted."""
    with engine.begin() as conn:
        result = conn.execute(
            sql_delete(time_log_entries_table).where(
                (time_log_entries_table.c.id == entry_id) &
                (time_log_entries_table.c.employee_id == employee_id)
            )
        )
    return result.rowcount > 0


def fetch_timesheet(employee_id: str, week_key: date):
    """Returns the timesheet summary row for employee+week, or None."""
    with engine.begin() as conn:
        row = conn.execute(
            select(timesheets_table).where(
                (timesheets_table.c.employee_id == employee_id) &
                (timesheets_table.c.week_key == week_key)
            )
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def upsert_timesheet(employee_id: str, week_key: date, total_hours: float,
                     status: str = "draft", approved_by: str = None):
    """Creates or updates the timesheet summary for employee+week. Returns the row."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        existing = conn.execute(
            select(timesheets_table).where(
                (timesheets_table.c.employee_id == employee_id) &
                (timesheets_table.c.week_key == week_key)
            )
        ).first()
        if existing:
            vals = {"total_hours": total_hours, "status": status, "updated_at": now}
            if approved_by is not None:
                vals["approved_by"] = approved_by
            conn.execute(
                update(timesheets_table)
                .where(
                    (timesheets_table.c.employee_id == employee_id) &
                    (timesheets_table.c.week_key == week_key)
                ).values(**vals)
            )
        else:
            conn.execute(insert(timesheets_table).values(
                employee_id=employee_id, week_key=week_key,
                total_hours=total_hours, status=status,
                approved_by=approved_by,
                created_at=now, updated_at=now,
            ))
        row = conn.execute(
            select(timesheets_table).where(
                (timesheets_table.c.employee_id == employee_id) &
                (timesheets_table.c.week_key == week_key)
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def fetch_all_timesheets(status=None):
    """Returns all timesheets (for HR review), optionally filtered by status."""
    stmt = select(timesheets_table).order_by(desc(timesheets_table.c.updated_at))
    if status and status != "all":
        stmt = stmt.where(timesheets_table.c.status == status)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt).fetchall())


def fetch_employee_timesheets(employee_id: str):
    """Returns all timesheet summaries for an employee, newest week first."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(timesheets_table).where(
                timesheets_table.c.employee_id == employee_id
            ).order_by(desc(timesheets_table.c.week_key))
        ).fetchall()
    return rows_to_dicts(rows)


# ── Password reset / change queries ──────────────────────────────────────────

def find_employee_by_id(employee_id: str):
    """Returns a minimal employee dict for auth/permission checks, or None."""
    with engine.begin() as conn:
        row = conn.execute(
            select(
                employees_table.c.employee_id,
                employees_table.c.full_name,
                employees_table.c.is_active,
                employees_table.c.is_hr,
                employees_table.c.access_level,
            ).where(employees_table.c.employee_id == employee_id)
        ).first()
    if not row:
        return None
    m = dict(row._mapping)
    return {
        "id": m["employee_id"],
        "full_name": m["full_name"],
        "is_active": m["is_active"],
        "isHR": bool(m.get("is_hr")),
        "accessLevel": int(m.get("access_level") or 1),
    }


def find_employee_by_email(email: str):
    """Looks up an employee by their DB email (case-insensitive). Returns minimal dict or None."""
    with engine.begin() as conn:
        row = conn.execute(
            select(
                employees_table.c.employee_id,
                employees_table.c.full_name,
                employees_table.c.is_active,
            ).where(employees_table.c.email == email.lower().strip())
        ).first()
    if not row:
        return None
    return dict(row._mapping)


def create_reset_token(employee_id: str, otp: str, real_email: str):
    """
    Stores a new OTP for password reset, valid for 15 minutes.
    Any previous unused tokens for this employee are invalidated first.
    Returns the new token row.
    """
    from datetime import timedelta
    now = datetime.utcnow()
    expires = now + timedelta(minutes=15)
    with engine.begin() as conn:
        # Invalidate all previous tokens for this employee so only one is active at a time.
        conn.execute(
            update(password_reset_tokens_table)
            .where(
                (password_reset_tokens_table.c.employee_id == employee_id) &
                (password_reset_tokens_table.c.used == False)
            )
            .values(used=True)
        )
        result = conn.execute(insert(password_reset_tokens_table).values(
            employee_id=employee_id,
            otp=otp,
            real_email=real_email,
            expires_at=expires,
            used=False,
            created_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(password_reset_tokens_table).where(
                password_reset_tokens_table.c.id == row_id
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def verify_reset_token(employee_id: str, otp: str):
    """
    Checks that the OTP is valid: correct employee, unused, and not expired.
    Returns the token row on success, or None on failure.
    """
    now = datetime.utcnow()
    with engine.begin() as conn:
        row = conn.execute(
            select(password_reset_tokens_table).where(
                (password_reset_tokens_table.c.employee_id == employee_id) &
                (password_reset_tokens_table.c.otp == otp) &
                (password_reset_tokens_table.c.used == False) &
                (password_reset_tokens_table.c.expires_at > now)
            ).order_by(desc(password_reset_tokens_table.c.created_at))
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def invalidate_reset_token(token_id: int):
    """Marks a token as used so it can't be replayed."""
    with engine.begin() as conn:
        conn.execute(
            update(password_reset_tokens_table)
            .where(password_reset_tokens_table.c.id == token_id)
            .values(used=True)
        )


def change_employee_password(employee_id: str, new_password: str):
    """Hashes and saves a new password; clears the must_change_password flag."""
    new_hash = hash_password(new_password)
    with engine.begin() as conn:
        result = conn.execute(
            update(employees_table)
            .where(employees_table.c.employee_id == employee_id)
            .values(password_hash=new_hash, must_change_password=False, updated_at=datetime.utcnow())
        )
    return result.rowcount > 0


def verify_current_password(employee_id: str, password: str):
    """Checks the provided password against the stored hash. Returns True if correct."""
    with engine.begin() as conn:
        row = conn.execute(
            select(employees_table.c.password_hash).where(
                employees_table.c.employee_id == employee_id
            )
        ).first()
    if not row:
        return False
    return verify_password(password, row._mapping["password_hash"])


# ── Document queries ──────────────────────────────────────────────────────────

def fetch_documents(employee_id: str = None):
    """Returns document metadata rows, optionally filtered to one employee."""
    stmt = select(documents_table).order_by(desc(documents_table.c.created_at))
    if employee_id:
        stmt = stmt.where(documents_table.c.employee_id == employee_id)
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt).fetchall())


def create_document(employee_id: str, uploaded_by: str, original_name: str,
                    stored_name: str, file_type: str, file_size: int,
                    category: str, description: str = None):
    """Inserts a document metadata row and returns the created row."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(insert(documents_table).values(
            employee_id=employee_id, uploaded_by=uploaded_by,
            original_name=original_name, stored_name=stored_name,
            file_type=file_type, file_size=file_size,
            category=category, description=description, created_at=now,
        ))
        row_id = result.inserted_primary_key[0]
        row = conn.execute(
            select(documents_table).where(documents_table.c.id == row_id)
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def fetch_document_by_id(doc_id: int):
    """Returns a single document metadata row or None."""
    with engine.begin() as conn:
        row = conn.execute(
            select(documents_table).where(documents_table.c.id == doc_id)
        ).first()
    if not row:
        return None
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_document(doc_id: int):
    """Hard-deletes a document metadata row. Returns the stored_name so the caller can remove the file."""
    doc = fetch_document_by_id(doc_id)
    if not doc:
        return None
    with engine.begin() as conn:
        conn.execute(sql_delete(documents_table).where(documents_table.c.id == doc_id))
    return doc["stored_name"]


# ── Statutory config queries ──────────────────────────────────────────────────

def fetch_statutory_config():
    """Returns all statutory deduction config rows as a list of dicts."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(payroll_statutory_config_table).order_by(payroll_statutory_config_table.c.id)
        ).fetchall()
    return rows_to_dicts(rows)


def update_statutory_config(config_key: str, value: str, updated_by: str = None):
    """Updates a single statutory config value. Returns True on success."""
    with engine.begin() as conn:
        result = conn.execute(
            update(payroll_statutory_config_table)
            .where(payroll_statutory_config_table.c.config_key == config_key)
            .values(value=value, updated_by=updated_by, updated_at=datetime.utcnow())
        )
    return result.rowcount > 0


# ── Notification queries ──────────────────────────────────────────────────────

def _get_hr_recipient_ids() -> list[str]:
    """Returns employee_ids of all active HR/Director users."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(employees_table.c.employee_id).where(
                (employees_table.c.is_active == True) &
                ((employees_table.c.is_hr == True) | (employees_table.c.access_level >= 4))
            )
        ).fetchall()
    return [r._mapping["employee_id"] for r in rows]


def create_notifications_for_hr(type_: str, title: str, message: str, ref_id: int = None):
    """Creates a notification row for every active HR/Director employee."""
    now = datetime.utcnow()
    for emp_id in _get_hr_recipient_ids():
        with engine.begin() as conn:
            conn.execute(insert(notifications_table).values(
                recipient_id=emp_id, type=type_, title=title,
                message=message, ref_id=ref_id, is_read=False, created_at=now,
            ))


def fetch_notifications(recipient_id: str):
    """Returns the 50 most recent notifications for a recipient, newest first."""
    with engine.begin() as conn:
        rows = conn.execute(
            select(notifications_table)
            .where(notifications_table.c.recipient_id == recipient_id)
            .order_by(desc(notifications_table.c.created_at))
            .limit(50)
        ).fetchall()
    return rows_to_dicts(rows)


def mark_notification_read(notif_id: int):
    """Marks a single notification as read."""
    with engine.begin() as conn:
        conn.execute(
            update(notifications_table)
            .where(notifications_table.c.id == notif_id)
            .values(is_read=True)
        )


def mark_all_notifications_read(recipient_id: str):
    """Marks all unread notifications as read for a recipient."""
    with engine.begin() as conn:
        conn.execute(
            update(notifications_table)
            .where(
                (notifications_table.c.recipient_id == recipient_id) &
                (notifications_table.c.is_read == False)
            )
            .values(is_read=True)
        )


def clear_all_notifications(recipient_id: str):
    """Permanently deletes all notifications for a recipient."""
    with engine.begin() as conn:
        conn.execute(
            sql_delete(notifications_table)
            .where(notifications_table.c.recipient_id == recipient_id)
        )


# ── Goals ─────────────────────────────────────────────────────────────────────

def fetch_goals(employee_id: str, quarter: str = None):
    """Returns all goals for an employee, optionally filtered by quarter."""
    with engine.connect() as conn:
        q = select(goals_table).where(goals_table.c.employee_id == employee_id)
        if quarter:
            q = q.where(goals_table.c.quarter == quarter)
        q = q.order_by(goals_table.c.created_at.desc())
        rows = conn.execute(q).fetchall()
    return [{k: serialize(v) for k, v in r._mapping.items()} for r in rows]


def create_goal(employee_id: str, title: str, target: str, notes: str,
                is_key: bool, progress: int, status: str, quarter: str):
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(
            insert(goals_table).values(
                employee_id=employee_id, title=title, target=target, notes=notes,
                is_key=is_key, progress=progress, status=status, quarter=quarter,
                created_at=now, updated_at=now,
            )
        )
        row = conn.execute(
            select(goals_table).where(goals_table.c.id == result.inserted_primary_key[0])
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_goal(goal_id: int, **fields):
    fields["updated_at"] = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(update(goals_table).where(goals_table.c.id == goal_id).values(**fields))
        row = conn.execute(select(goals_table).where(goals_table.c.id == goal_id)).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_goal(goal_id: int):
    with engine.begin() as conn:
        conn.execute(sql_delete(goals_table).where(goals_table.c.id == goal_id))


# ── Performance Reviews ───────────────────────────────────────────────────────

def fetch_reviews(employee_id: str):
    with engine.connect() as conn:
        rows = conn.execute(
            select(performance_reviews_table)
            .where(performance_reviews_table.c.employee_id == employee_id)
            .order_by(performance_reviews_table.c.created_at.desc())
        ).fetchall()
    return rows_to_dicts(rows)


def create_review(employee_id: str, reviewer_id: str, period: str,
                  score, feedback: str, status: str, review_date):
    with engine.begin() as conn:
        result = conn.execute(
            performance_reviews_table.insert().values(
                employee_id=employee_id,
                reviewer_id=reviewer_id,
                period=period,
                score=float(score) if score is not None else None,
                feedback=feedback,
                status=status,
                review_date=review_date,
                created_at=datetime.utcnow(),
            )
        )
        row = conn.execute(
            select(performance_reviews_table).where(
                performance_reviews_table.c.id == result.inserted_primary_key[0]
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()}


def update_review(review_id: int, **fields):
    allowed = {"score", "feedback", "status", "review_date", "period"}
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        return None
    with engine.begin() as conn:
        conn.execute(
            performance_reviews_table.update()
            .where(performance_reviews_table.c.id == review_id)
            .values(**updates)
        )
        row = conn.execute(
            select(performance_reviews_table).where(
                performance_reviews_table.c.id == review_id
            )
        ).first()
    return {k: serialize(v) for k, v in row._mapping.items()} if row else None


# ── Company Holidays ──────────────────────────────────────────────────────────

def list_holidays(year: int):
    """Returns all company holidays for a given calendar year."""
    from_date = date(year, 1, 1)
    to_date = date(year, 12, 31)
    with engine.connect() as conn:
        rows = conn.execute(
            select(company_holidays_table)
            .where(
                (company_holidays_table.c.holiday_date >= from_date) &
                (company_holidays_table.c.holiday_date <= to_date)
            )
            .order_by(company_holidays_table.c.holiday_date)
        ).fetchall()
    return rows_to_dicts(rows)


def add_holiday(holiday_date: date, name: str, created_by: str):
    """Inserts a company holiday and marks all employees as 'holiday' for that date."""
    now = datetime.utcnow()
    with engine.begin() as conn:
        # Idempotent insert — skip if date already exists
        existing = conn.execute(
            select(company_holidays_table).where(
                company_holidays_table.c.holiday_date == holiday_date
            )
        ).first()
        if existing:
            return {k: serialize(v) for k, v in existing._mapping.items()}
        result = conn.execute(
            insert(company_holidays_table).values(
                holiday_date=holiday_date, name=name,
                created_by=created_by, created_at=now,
            )
        )
        row = conn.execute(
            select(company_holidays_table).where(
                company_holidays_table.c.id == result.inserted_primary_key[0]
            )
        ).first()
        # Mark every employee as 'holiday' for that date
        all_emps = conn.execute(
            select(employees_table.c.employee_id)
        ).fetchall()
        for emp_row in all_emps:
            emp_id = emp_row[0]
            existing_att = conn.execute(
                select(attendance_table).where(
                    (attendance_table.c.employee_id == emp_id) &
                    (attendance_table.c.date == holiday_date)
                )
            ).first()
            if existing_att:
                conn.execute(
                    update(attendance_table)
                    .where(
                        (attendance_table.c.employee_id == emp_id) &
                        (attendance_table.c.date == holiday_date)
                    )
                    .values(status="holiday", updated_at=now)
                )
            else:
                conn.execute(
                    insert(attendance_table).values(
                        employee_id=emp_id, date=holiday_date, status="holiday",
                        created_at=now, updated_at=now,
                    )
                )
    return {k: serialize(v) for k, v in row._mapping.items()}


def delete_holiday(holiday_id: int):
    """Removes a company holiday record. Does not revert individual attendance rows."""
    with engine.begin() as conn:
        conn.execute(
            sql_delete(company_holidays_table).where(company_holidays_table.c.id == holiday_id)
        )


def delete_review(review_id: int):
    with engine.begin() as conn:
        conn.execute(
            sql_delete(performance_reviews_table).where(
                performance_reviews_table.c.id == review_id
            )
        )


def compute_perf_scores_bulk():
    """
    Auto-computes a 1.0–5.0 performance score for every employee based on
    objective work-log data — no manual input required.

    Formula (rounded to 1 decimal):
      Timesheet score (60%): last 12 weeks
        approved = 1.0 pt, submitted/pending = 0.6 pt, rejected = 0.2 pt, missing = 0
        → (total_pts / 12) * 5, capped at 5.0
      Goals score (40%): current quarter
        on-track = 1.0 pt, at-risk = 0.4 pt per goal
        → (total_pts / max(1, n_goals)) * 5, capped at 5.0
        if no goals at all → neutral 3.0

    Returns dict: { employee_id: float }
    """
    from datetime import date as _date, timedelta as _td

    today = _date.today()
    # Build list of the last 12 Monday dates (ISO week starts)
    mondays = []
    d = today - _td(days=today.weekday())  # this week's Monday
    for _ in range(12):
        mondays.append(d)
        d -= _td(weeks=1)
    cutoff = mondays[-1]  # earliest week we care about

    # Determine current quarter label (matches frontend currentQuarterLabel)
    q_num = (today.month - 1) // 3 + 1
    current_quarter = f"Q{q_num}-{today.year}"

    with engine.connect() as conn:
        # Fetch all timesheets in the last 12 weeks
        ts_rows = conn.execute(
            select(timesheets_table.c.employee_id, timesheets_table.c.week_key, timesheets_table.c.status)
            .where(timesheets_table.c.week_key >= cutoff)
        ).fetchall()

        # Fetch all goals for current quarter
        goal_rows = conn.execute(
            select(goals_table.c.employee_id, goals_table.c.status)
            .where(goals_table.c.quarter == current_quarter)
        ).fetchall()

        # Fetch all employee IDs
        emp_ids = [r[0] for r in conn.execute(select(employees_table.c.employee_id)).fetchall()]

    # Build timesheet score per employee
    ts_pts = {eid: 0.0 for eid in emp_ids}
    for row in ts_rows:
        eid, wk, st = row.employee_id, row.week_key, row.status
        if st == "approved":   ts_pts[eid] = ts_pts.get(eid, 0.0) + 1.0
        elif st in ("submitted", "draft"): ts_pts[eid] = ts_pts.get(eid, 0.0) + 0.6
        elif st == "rejected": ts_pts[eid] = ts_pts.get(eid, 0.0) + 0.2

    # Build goals score per employee
    goal_pts  = {}
    goal_count = {}
    for row in goal_rows:
        eid, st = row.employee_id, row.status
        goal_count[eid] = goal_count.get(eid, 0) + 1
        goal_pts[eid]   = goal_pts.get(eid, 0.0) + (1.0 if st == "on-track" else 0.4)

    scores = {}
    for eid in emp_ids:
        ts_score   = min(5.0, (ts_pts.get(eid, 0.0) / 12) * 5)
        n_goals    = goal_count.get(eid, 0)
        if n_goals:
            g_score = min(5.0, (goal_pts.get(eid, 0.0) / n_goals) * 5)
        else:
            g_score = 3.0   # neutral — no goals set yet
        if ts_pts.get(eid, 0.0) == 0 and n_goals == 0:
            scores[eid] = 3.0   # new / no data yet
        else:
            raw = 0.6 * ts_score + 0.4 * g_score
            scores[eid] = round(max(1.0, min(5.0, raw)), 1)
    return scores


def fetch_attendance_date_range():
    """Returns the earliest and latest attendance date recorded in the database."""
    with engine.connect() as conn:
        row = conn.execute(
            select(
                func.min(attendance_table.c.date).label("earliest"),
                func.max(attendance_table.c.date).label("latest"),
            )
        ).first()
    return {
        "earliest": serialize(row.earliest) if row.earliest else None,
        "latest":   serialize(row.latest)   if row.latest   else None,
    }


# ── Employee create / update ───────────────────────────────────────────────────

def _next_employee_id(conn) -> str:
    """Computes the next EMP-XXXX employee_id by reading the current max."""
    row = conn.execute(
        select(func.max(employees_table.c.employee_id))
    ).scalar()
    if not row:
        return "EMP-0001"
    try:
        num = int(row.split("-")[1]) + 1
    except (IndexError, ValueError):
        num = 1
    return f"EMP-{num:04d}"


def _avatar_colors():
    return ["#1B45F5","#0F8C5A","#BE2B5A","#0A7E7A","#5C35C2","#B06010","#C8312A","#8B5CF6"]


def create_employee(data: dict) -> dict:
    """
    Inserts a new employee row. `data` must include:
      first_name, last_name, email, department, designation,
      annual_ctc_lpa, password (plain-text, will be hashed).
    All other fields are optional.

    Returns the new employee in the same frontend-shaped dict as fetch_all_employees_full.
    """
    import random

    first  = (data.get("first_name") or "").strip()
    middle = (data.get("middle_name") or "").strip()
    last   = (data.get("last_name") or "").strip()
    parts  = [p for p in [first, middle, last] if p]
    full   = " ".join(parts)

    dob_val     = data.get("dob")
    joining_val = data.get("date_of_joining")

    with engine.begin() as conn:
        emp_id = _next_employee_id(conn)
        conn.execute(employees_table.insert().values(
            employee_id=emp_id,
            first_name=first,
            middle_name=middle or None,
            last_name=last,
            full_name=full,
            department=data["department"],
            designation=data["designation"],
            email=data["email"].lower().strip(),
            phone=data.get("phone") or None,
            location=data.get("location") or None,
            date_of_joining=joining_val if joining_val else None,
            dob=dob_val if dob_val else None,
            gender=data.get("gender") or None,
            color=data.get("color") or random.choice(_avatar_colors()),
            mgr_id=data.get("mgr_id") or None,
            pan=data.get("pan") or None,
            aadhaar=data.get("aadhaar") or None,
            uan=data.get("uan") or None,
            pf_account=data.get("pf_account") or None,
            esic=data.get("esic") or None,
            bank_name=data.get("bank_name") or None,
            bank_account_no=data.get("bank_account_no") or None,
            ifsc=data.get("ifsc") or None,
            annual_ctc_lpa=float(data.get("annual_ctc_lpa") or 0),
            emp_type=data.get("emp_type") or "Full-time",
            notice_period=data.get("notice_period") or None,
            access_level=int(data.get("access_level") or 1),
            is_hr=bool(data.get("is_hr") or False),
            is_finance_operator=bool(data.get("is_finance_operator") or False),
            password_hash=hash_password(data["password"]),
            must_change_password=True,
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        ))
        row = conn.execute(
            select(employees_table).where(employees_table.c.employee_id == emp_id)
        ).first()

    e = dict(row._mapping)
    dob = e.get("dob")
    joining = e.get("date_of_joining")
    return {
        "id": e["employee_id"], "firstName": e["first_name"],
        "middleName": e.get("middle_name") or "", "lastName": e["last_name"],
        "name": e["full_name"], "dept": e["department"], "role": e["designation"],
        "accessLevel": e["access_level"], "ctcLPA": float(e["annual_ctc_lpa"]),
        "joining": joining.isoformat() if joining else None,
        "color": e.get("color") or "#1B45F5",
        "mgr": e.get("mgr_id"), "reports": [],
        "loc": e.get("location") or "", "email": e["email"],
        "phone": e.get("phone") or "",
        "perf": 3.0,
        "dob": dob.isoformat() if dob else None,
        "age": _calc_age(dob), "gender": e.get("gender") or "",
        "aadhaar": e.get("aadhaar") or "", "pan": e.get("pan") or "",
        "empType": e.get("emp_type") or "Full-time",
        "noticePeriod": e.get("notice_period") or "",
        "bank": e.get("bank_name") or "", "accountNo": e.get("bank_account_no") or "",
        "ifsc": e.get("ifsc") or "", "uan": e.get("uan") or "",
        "pfAccount": e.get("pf_account") or "", "esic": e.get("esic") or "",
        "isHR": bool(e.get("is_hr")),
    }


# ── rename_employee_id ────────────────────────────────────────────────────────

# All (table, column) pairs that hold a FK reference to employees.employee_id.
# Used by rename_employee_id to cascade the PK change to every child row.
_EMPLOYEE_ID_FK_REFS = [
    ("employees",               "mgr_id"),
    ("payroll_runs",            "processed_by"),
    ("payslips",                "employee_id"),
    ("payroll_structure",       "updated_by"),
    ("announcements",           "author_id"),
    ("payroll_field_config",    "created_by"),
    ("payslip_line_items",      "employee_id"),
    ("password_reset_tokens",   "employee_id"),
    ("attendance",              "employee_id"),
    ("attendance_corrections",  "employee_id"),
    ("leave_requests",          "employee_id"),
    ("leave_balances",          "employee_id"),
    ("time_log_entries",        "employee_id"),
    ("timesheets",              "employee_id"),
    ("documents",               "employee_id"),
    ("documents",               "uploaded_by"),
    ("payroll_statutory_config","updated_by"),
]


def rename_employee_id(old_id: str, new_id: str) -> dict:
    """
    Renames an employee's primary key and cascades the update to every
    FK-referencing table inside a single transaction.

    For MSSQL: temporarily disables FK constraint checking with NOCHECK so
    the PK can be updated before child rows are updated, then re-validates.
    For SQLite: FK enforcement is off by default so updates proceed directly.
    """
    import re
    new_id = new_id.strip().upper()
    if not re.match(r'^EMP-\d+$', new_id):
        raise ValueError("Employee ID must follow the format EMP-XXXX (e.g., EMP-0042).")

    # Unique list of table names for NOCHECK/CHECK (no duplicates — documents appears twice)
    _all_tables = list(dict.fromkeys(t for t, _ in _EMPLOYEE_ID_FK_REFS))
    s = "" if IS_SQLITE else "hrms."  # schema prefix

    with engine.begin() as conn:
        # Verify the target employee exists
        if not conn.execute(
            select(employees_table.c.employee_id).where(employees_table.c.employee_id == old_id)
        ).first():
            raise ValueError("Employee not found.")

        if old_id == new_id:
            row = conn.execute(
                select(employees_table).where(employees_table.c.employee_id == old_id)
            ).first()
        else:
            # Reject if the new ID is already taken
            if conn.execute(
                select(employees_table.c.employee_id).where(employees_table.c.employee_id == new_id)
            ).first():
                raise ValueError(f"Employee ID '{new_id}' is already in use.")

            if not IS_SQLITE:
                # Disable FK enforcement on every referencing table + employees itself
                for tbl in _all_tables + ["employees"]:
                    conn.execute(text(f"ALTER TABLE {s}{tbl} NOCHECK CONSTRAINT ALL"))

            # Update the PK
            conn.execute(text(
                f"UPDATE {s}employees SET employee_id = :n WHERE employee_id = :o"
            ), {"n": new_id, "o": old_id})

            # Cascade to every FK column
            for tbl, col in _EMPLOYEE_ID_FK_REFS:
                conn.execute(text(
                    f"UPDATE {s}{tbl} SET {col} = :n WHERE {col} = :o"
                ), {"n": new_id, "o": old_id})

            if not IS_SQLITE:
                # Re-enable and validate FK constraints
                for tbl in _all_tables + ["employees"]:
                    conn.execute(text(
                        f"ALTER TABLE {s}{tbl} WITH CHECK CHECK CONSTRAINT ALL"
                    ))

            row = conn.execute(
                select(employees_table).where(employees_table.c.employee_id == new_id)
            ).first()

    if not row:
        raise ValueError("Employee not found after rename.")

    e = dict(row._mapping)
    dob = e.get("dob")
    joining = e.get("date_of_joining")

    with engine.begin() as conn:
        report_rows = conn.execute(
            select(employees_table.c.employee_id).where(employees_table.c.mgr_id == new_id)
        ).fetchall()
    reports = [r._mapping["employee_id"] for r in report_rows]

    return {
        "id": e["employee_id"], "firstName": e["first_name"],
        "middleName": e.get("middle_name") or "", "lastName": e["last_name"],
        "name": e["full_name"], "dept": e["department"], "role": e["designation"],
        "accessLevel": e["access_level"], "ctcLPA": float(e["annual_ctc_lpa"]),
        "joining": joining.isoformat() if joining else None,
        "color": e.get("color") or "#1B45F5",
        "mgr": e.get("mgr_id"), "reports": reports,
        "loc": e.get("location") or "", "email": e["email"],
        "phone": e.get("phone") or "",
        "perf": float(e["perf_score"]) if e.get("perf_score") else 3.0,
        "dob": dob.isoformat() if dob else None,
        "age": _calc_age(dob), "gender": e.get("gender") or "",
        "aadhaar": e.get("aadhaar") or "", "pan": e.get("pan") or "",
        "empType": e.get("emp_type") or "Full-time",
        "noticePeriod": e.get("notice_period") or "",
        "bank": e.get("bank_name") or "", "accountNo": e.get("bank_account_no") or "",
        "ifsc": e.get("ifsc") or "", "uan": e.get("uan") or "",
        "pfAccount": e.get("pf_account") or "", "esic": e.get("esic") or "",
        "isHR": bool(e.get("is_hr")),
    }


# Fields an employee can update on their own record.
SELF_EDITABLE = {
    "phone", "location", "gender", "dob",
    "bank_name", "bank_account_no", "ifsc", "uan", "pan", "aadhaar", "pf_account",
}

# Additional fields HR / Director can update on any record.
HR_EDITABLE = SELF_EDITABLE | {
    "first_name", "middle_name", "last_name",
    "department", "designation", "email",
    "annual_ctc_lpa", "emp_type", "notice_period",
    "mgr_id", "access_level", "is_hr",
    "date_of_joining", "is_active",
}


def update_employee(employee_id: str, fields: dict) -> dict:
    """
    Updates an employee row. `fields` should only contain DB column names
    that the caller has already permission-checked. Returns the updated
    employee in frontend-shaped dict (same as fetch_all_employees_full).
    """
    if not fields:
        raise ValueError("No fields to update.")

    update_vals = {k: v for k, v in fields.items()}

    # Recompute full_name if any name part changes.
    name_keys = {"first_name", "middle_name", "last_name"}
    if name_keys & set(update_vals):
        with engine.begin() as conn:
            row = conn.execute(
                select(employees_table).where(employees_table.c.employee_id == employee_id)
            ).first()
        if not row:
            raise ValueError("Employee not found.")
        cur = dict(row._mapping)
        fn = update_vals.get("first_name",  cur["first_name"])
        mn = update_vals.get("middle_name", cur.get("middle_name") or "")
        ln = update_vals.get("last_name",   cur["last_name"])
        parts = [p for p in [fn, mn, ln] if p]
        update_vals["full_name"] = " ".join(parts)

    update_vals["updated_at"] = datetime.utcnow()

    with engine.begin() as conn:
        conn.execute(
            employees_table.update()
            .where(employees_table.c.employee_id == employee_id)
            .values(**update_vals)
        )
        row = conn.execute(
            select(employees_table).where(employees_table.c.employee_id == employee_id)
        ).first()

    if not row:
        raise ValueError("Employee not found after update.")

    e = dict(row._mapping)
    dob = e.get("dob")
    joining = e.get("date_of_joining")

    with engine.begin() as conn:
        report_rows = conn.execute(
            select(employees_table.c.employee_id).where(
                employees_table.c.mgr_id == employee_id
            )
        ).fetchall()
    reports = [r._mapping["employee_id"] for r in report_rows]

    return {
        "id": e["employee_id"], "firstName": e["first_name"],
        "middleName": e.get("middle_name") or "", "lastName": e["last_name"],
        "name": e["full_name"], "dept": e["department"], "role": e["designation"],
        "accessLevel": e["access_level"], "ctcLPA": float(e["annual_ctc_lpa"]),
        "joining": joining.isoformat() if joining else None,
        "color": e.get("color") or "#1B45F5",
        "mgr": e.get("mgr_id"), "reports": reports,
        "loc": e.get("location") or "", "email": e["email"],
        "phone": e.get("phone") or "",
        "perf": float(e["perf_score"]) if e.get("perf_score") else 3.0,
        "dob": dob.isoformat() if dob else None,
        "age": _calc_age(dob), "gender": e.get("gender") or "",
        "aadhaar": e.get("aadhaar") or "", "pan": e.get("pan") or "",
        "empType": e.get("emp_type") or "Full-time",
        "noticePeriod": e.get("notice_period") or "",
        "bank": e.get("bank_name") or "", "accountNo": e.get("bank_account_no") or "",
        "ifsc": e.get("ifsc") or "", "uan": e.get("uan") or "",
        "pfAccount": e.get("pf_account") or "", "esic": e.get("esic") or "",
        "isHR": bool(e.get("is_hr")),
    }
