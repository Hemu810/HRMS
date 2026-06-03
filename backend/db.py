from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    MetaData,
    Numeric,
    String,
    Table,
    Text,
    create_engine,
    desc,
    insert,
    select,
    text,
    update,
)

from config import settings


BASE_DIR = Path(__file__).resolve().parent
SCHEMA_PATH = BASE_DIR / "mssql_schema.sql"
SEED_PATH = BASE_DIR / "mssql_seed.sql"

IS_SQLITE = settings.database_url.startswith("sqlite")
engine = create_engine(
    settings.database_url,
    pool_pre_ping=not IS_SQLITE,
    future=True,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
)
metadata = MetaData()

employees_table = Table(
    "employees",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("employee_id", String(20), nullable=False, unique=True),
    Column("first_name", String(80), nullable=False),
    Column("last_name", String(80), nullable=False),
    Column("full_name", String(180), nullable=False),
    Column("department", String(80), nullable=False),
    Column("designation", String(120), nullable=False),
    Column("email", String(180), nullable=False, unique=True),
    Column("phone", String(40)),
    Column("location", String(80)),
    Column("date_of_joining", Date),
    Column("pan", String(20)),
    Column("uan", String(30)),
    Column("pf_account", String(80)),
    Column("esic", String(40)),
    Column("bank_name", String(120)),
    Column("bank_account_no", String(80)),
    Column("ifsc", String(20)),
    Column("annual_ctc_lpa", Numeric(12, 2), nullable=False, default=0),
    Column("access_level", Integer, nullable=False, default=1),
    Column("is_finance_operator", Boolean, nullable=False, default=False),
    Column("is_active", Boolean, nullable=False, default=True),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

payroll_runs_table = Table(
    "payroll_runs",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payroll_month", Date, nullable=False, unique=True),
    Column("status", String(30), nullable=False, default="draft"),
    Column("pay_date", Date),
    Column("payment_mode", String(40), nullable=False, default="Bank Transfer"),
    Column("tax_regime", String(40), nullable=False, default="New Regime"),
    Column("remarks", Text),
    Column("processed_by", String(20), ForeignKey("employees.employee_id")),
    Column("processed_at", DateTime),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

payslips_table = Table(
    "payslips",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payroll_run_id", BigInteger, ForeignKey("payroll_runs.id"), nullable=False),
    Column("employee_id", String(20), ForeignKey("employees.employee_id"), nullable=False),
    Column("total_work_days", Numeric(5, 2), nullable=False, default=26),
    Column("payable_days", Numeric(5, 2), nullable=False, default=26),
    Column("lop_days", Numeric(5, 2), nullable=False, default=0),
    Column("overtime_hours", Numeric(7, 2), nullable=False, default=0),
    Column("gross_earnings", Numeric(14, 2), nullable=False, default=0),
    Column("total_statutory_deductions", Numeric(14, 2), nullable=False, default=0),
    Column("total_voluntary_deductions", Numeric(14, 2), nullable=False, default=0),
    Column("total_deductions", Numeric(14, 2), nullable=False, default=0),
    Column("net_pay", Numeric(14, 2), nullable=False, default=0),
    Column("employer_pf", Numeric(14, 2), nullable=False, default=0),
    Column("employer_esi", Numeric(14, 2), nullable=False, default=0),
    Column("ctc_actual", Numeric(14, 2), nullable=False, default=0),
    Column("annual_taxable_income", Numeric(14, 2), nullable=False, default=0),
    Column("annual_tax", Numeric(14, 2), nullable=False, default=0),
    Column("monthly_tds", Numeric(14, 2), nullable=False, default=0),
    Column("salary_hold", Boolean, nullable=False, default=False),
    Column("status", String(30), nullable=False, default="draft"),
    Column("pdf_storage_url", String(1000)),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)

email_logs_table = Table(
    "email_logs",
    metadata,
    Column("id", BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True),
    Column("payslip_id", BigInteger),
    Column("recipient_email", String(180), nullable=False),
    Column("subject", String(300), nullable=False),
    Column("body", Text, nullable=False),
    Column("attachment_filename", String(255)),
    Column("status", String(30), nullable=False, default="queued"),
    Column("provider_message_id", String(500)),
    Column("error_message", String(2000)),
    Column("sent_at", DateTime),
    Column("created_at", DateTime, nullable=False, default=datetime.utcnow),
    Column("updated_at", DateTime, nullable=False, default=datetime.utcnow),
)


SAMPLE_EMPLOYEES = [
    {
        "employee_id": "EMP-0001",
        "first_name": "Arjun",
        "last_name": "Mehta",
        "full_name": "Arjun Suresh Mehta",
        "department": "Leadership",
        "designation": "CEO",
        "email": "arjun.mehta@doloxe.com",
        "phone": "+91 98100 00001",
        "location": "Bengaluru",
        "date_of_joining": date(2016, 1, 15),
        "annual_ctc_lpa": 120,
        "access_level": 4,
        "is_finance_operator": False,
    },
    {
        "employee_id": "EMP-0100",
        "first_name": "Priya",
        "last_name": "Nair",
        "full_name": "Priya Venkat Nair",
        "department": "Engineering",
        "designation": "CTO / VP Engineering",
        "email": "priya.nair@doloxe.com",
        "phone": "+91 98200 00100",
        "location": "Bengaluru",
        "date_of_joining": date(2017, 4, 1),
        "annual_ctc_lpa": 90,
        "access_level": 3,
        "is_finance_operator": False,
    },
    {
        "employee_id": "EMP-0300",
        "first_name": "Vikash",
        "last_name": "Agarwal",
        "full_name": "Vikash Prasad Agarwal",
        "department": "Finance",
        "designation": "Finance Director",
        "email": "vikash.agarwal@doloxe.com",
        "phone": "+91 98200 00300",
        "location": "Mumbai",
        "date_of_joining": date(2017, 10, 1),
        "annual_ctc_lpa": 70,
        "access_level": 3,
        "is_finance_operator": True,
    },
    {
        "employee_id": "EMP-0310",
        "first_name": "Kavitha",
        "last_name": "Reddy",
        "full_name": "Kavitha Suresh Reddy",
        "department": "Finance",
        "designation": "Finance Manager",
        "email": "kavitha.reddy@doloxe.com",
        "phone": "+91 98300 00310",
        "location": "Mumbai",
        "date_of_joining": date(2019, 11, 11),
        "annual_ctc_lpa": 30,
        "access_level": 2,
        "is_finance_operator": True,
    },
]


def serialize(value: Any):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    return value


def rows_to_dicts(result):
    return [{key: serialize(value) for key, value in row._mapping.items()} for row in result]


def execute_script(path: Path):
    script = path.read_text()
    statements = [chunk.strip() for chunk in script.split("GO") if chunk.strip()]
    with engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
        for statement in statements:
            conn.execute(text(statement))


def seed_portable_database():
    now = datetime.utcnow()
    with engine.begin() as conn:
        for employee in SAMPLE_EMPLOYEES:
            exists = conn.execute(
                select(employees_table.c.id).where(employees_table.c.employee_id == employee["employee_id"])
            ).first()
            payload = {
                **employee,
                "pan": "AABCD1234A",
                "uan": f"1000000{employee['employee_id'].split('-')[1]}",
                "pf_account": f"DOLOXE/PF/{employee['employee_id']}",
                "esic": f"ESIC{employee['employee_id'].split('-')[1]}",
                "bank_name": "HDFC Bank",
                "bank_account_no": f"XXXX XXXX {employee['employee_id'].split('-')[1]}",
                "ifsc": "HDFC0000001",
                "is_active": True,
                "updated_at": now,
            }
            if exists:
                conn.execute(
                    update(employees_table)
                    .where(employees_table.c.employee_id == employee["employee_id"])
                    .values(**payload)
                )
            else:
                conn.execute(insert(employees_table).values(**payload, created_at=now))

        if not conn.execute(select(payroll_runs_table.c.id).where(payroll_runs_table.c.payroll_month == date(2025, 4, 1))).first():
            conn.execute(
                insert(payroll_runs_table).values(
                    payroll_month=date(2025, 4, 1),
                    status="paid",
                    pay_date=date(2025, 4, 30),
                    payment_mode="Bank Transfer",
                    tax_regime="New Regime",
                    remarks="April 2025 payroll closed",
                    processed_by="EMP-0300",
                    processed_at=now,
                    created_at=now,
                    updated_at=now,
                )
            )


def init_database():
    if IS_SQLITE:
        metadata.create_all(engine)
        seed_portable_database()
        return

    execute_script(SCHEMA_PATH)
    if SEED_PATH.exists():
        execute_script(SEED_PATH)


def fetch_all(sql: str, params: dict | None = None):
    with engine.begin() as conn:
        result = conn.execute(text(sql), params or {})
        return rows_to_dicts(result)


def fetch_employees():
    stmt = (
        select(
            employees_table.c.employee_id,
            employees_table.c.first_name,
            employees_table.c.last_name,
            employees_table.c.full_name,
            employees_table.c.department,
            employees_table.c.designation,
            employees_table.c.email,
            employees_table.c.location,
            employees_table.c.annual_ctc_lpa,
            employees_table.c.is_active,
        )
        .order_by(employees_table.c.employee_id)
    )
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def fetch_payroll_runs():
    stmt = (
        select(
            payroll_runs_table.c.id,
            payroll_runs_table.c.payroll_month,
            payroll_runs_table.c.status,
            payroll_runs_table.c.pay_date,
            payroll_runs_table.c.processed_by,
            payroll_runs_table.c.processed_at,
            payroll_runs_table.c.created_at,
        )
        .order_by(desc(payroll_runs_table.c.payroll_month), desc(payroll_runs_table.c.created_at))
        .limit(50)
    )
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def fetch_email_logs():
    stmt = (
        select(
            email_logs_table.c.id,
            email_logs_table.c.recipient_email,
            email_logs_table.c.subject,
            email_logs_table.c.attachment_filename,
            email_logs_table.c.status,
            email_logs_table.c.provider_message_id,
            email_logs_table.c.error_message,
            email_logs_table.c.sent_at,
            email_logs_table.c.created_at,
        )
        .order_by(desc(email_logs_table.c.created_at))
        .limit(100)
    )
    with engine.begin() as conn:
        return rows_to_dicts(conn.execute(stmt))


def insert_email_log(recipient_email: str, subject: str, body: str, attachment_filename: str, status: str):
    now = datetime.utcnow()
    with engine.begin() as conn:
        result = conn.execute(
            insert(email_logs_table).values(
                recipient_email=recipient_email,
                subject=subject,
                body=body,
                attachment_filename=attachment_filename,
                status=status,
                created_at=now,
                updated_at=now,
            )
        )
        return result.inserted_primary_key[0]


def mark_email_log_sent(log_id: int, provider_message_id: str | None):
    now = datetime.utcnow()
    with engine.begin() as conn:
        conn.execute(
            update(email_logs_table)
            .where(email_logs_table.c.id == log_id)
            .values(
                status="sent",
                provider_message_id=provider_message_id,
                sent_at=now,
                updated_at=now,
            )
        )


def mark_email_log_failed(log_id: int, error_message: str):
    with engine.begin() as conn:
        conn.execute(
            update(email_logs_table)
            .where(email_logs_table.c.id == log_id)
            .values(status="failed", error_message=error_message[:2000], updated_at=datetime.utcnow())
        )
