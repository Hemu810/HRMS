"""
app.py — FastAPI Application Entry Point
========================================
This is the main backend server for the Doloxe HRMS platform.
It wires together all API routes and hands database work off to db.py.

Architecture overview:
  app.py  → defines HTTP routes (what URLs exist and what they do)
  db.py   → handles all SQL queries and table definitions
  schemas.py → Pydantic models that validate incoming request bodies
  config.py  → reads environment variables (DB URL, SMTP creds, port, etc.)
  mailer.py  → sends payslip emails via SMTP

FastAPI automatically:
  - validates request bodies against Pydantic schemas
  - generates /docs (Swagger UI) and /redoc automatically
  - returns HTTP 422 if any field fails validation
"""

from datetime import date
from pathlib import Path
from time import monotonic
from uuid import uuid4

from contextlib import asynccontextmanager

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import uvicorn

UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# Simple in-memory cache for the 4 bootstrap endpoints that fire on every page load.
# Remote MSSQL adds ~100-300ms per query; caching reduces repeated hits to zero.
_CACHE: dict = {}          # key → {"data": ..., "ts": monotonic()}
_CACHE_TTL   = 30          # seconds before a cache entry expires

def _cache_get(key):
    entry = _CACHE.get(key)
    if entry and (monotonic() - entry["ts"]) < _CACHE_TTL:
        return entry["data"]
    return None

def _cache_set(key, data):
    _CACHE[key] = {"data": data, "ts": monotonic()}

def _cache_bust(*keys):
    for k in keys:
        _CACHE.pop(k, None)

from config import settings
from secrets import randbelow

from db import (
    engine,
    # employees
    fetch_all_employees_full,
    fetch_employees,
    verify_login,
    find_employee_by_id,
    find_employee_by_email,
    create_reset_token,
    verify_reset_token,
    invalidate_reset_token,
    change_employee_password,
    verify_current_password,
    # payroll
    fetch_payroll_runs,
    fetch_payroll_structure,
    update_payroll_structure_component,
    fetch_payroll_field_configs,
    create_payroll_field_config,
    update_payroll_field_config,
    delete_payroll_field_config,
    save_payslip_line_items,
    fetch_payslip_line_items,
    # announcements
    fetch_announcements,
    create_announcement,
    update_announcement,
    delete_announcement,
    # performance reviews
    fetch_reviews, create_review, update_review, delete_review,
    # email
    fetch_email_logs,
    insert_email_log,
    mark_email_log_failed,
    mark_email_log_sent,
    # attendance
    fetch_attendance_for_month,
    fetch_all_attendance_for_month,
    upsert_attendance,
    fetch_corrections,
    create_correction,
    update_correction_status,
    fetch_attendance_date_range,
    # leave
    fetch_leave_requests,
    create_leave_request,
    update_leave_request_status,
    fetch_leave_balances,
    ensure_leave_balances,
    increment_leave_used,
    decrement_leave_used,
    # time log
    fetch_time_log_entries,
    create_time_log_entry,
    delete_time_log_entry,
    fetch_timesheet,
    upsert_timesheet,
    fetch_all_timesheets,
    fetch_employee_timesheets,
    # documents
    fetch_documents,
    create_document,
    fetch_document_by_id,
    delete_document,
    # statutory config
    fetch_statutory_config,
    update_statutory_config,
    # notifications
    create_notifications_for_hr,
    fetch_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    # goals
    fetch_goals,
    create_goal,
    update_goal,
    delete_goal,
    # init
    init_database,
)
from mailer import send_otp_email, send_payslip_email
from schemas import EmailLogOut, LoginRequest, LoginResponse, PayslipEmailRequest


# ── App instance ──────────────────────────────────────────────────────────────
# title and version appear in the auto-generated /docs Swagger UI.
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_database()
    yield

app = FastAPI(title="DOLOXE HRMS API", version="1.0.0", lifespan=lifespan)

# ── CORS middleware ───────────────────────────────────────────────────────────
# Browsers block cross-origin requests unless the server explicitly allows them.
# We allow the configured frontend origin (e.g. http://localhost:5173 in dev,
# or the production Vercel URL in prod) so the React app can call our API.
# allow_credentials=True is required for cookie-based auth (not currently used
# but kept for future sessions).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],   # allow GET, POST, PUT, DELETE, OPTIONS
    allow_headers=["*"],   # allow Content-Type, Authorization, etc.
)



# ── Health check ─────────────────────────────────────────────────────────────
# Called by the frontend AppBootstrap and monitoring tools to confirm the
# server is up and which database dialect is being used (sqlite vs mssql).
@app.get("/api/health")
def health():
    return {"ok": True, "service": "doloxe-hrms-fastapi", "database": engine.dialect.name}


# ── Employee endpoints ────────────────────────────────────────────────────────
# Returns the full employee list with all fields needed by the frontend
# (access level, manager chain, payroll details, etc.). Called once on app
# boot by AppBootstrap and cached in the module-level ALL_USERS variable.
@app.get("/api/employees/all")
def all_employees():
    cached = _cache_get("employees_all")
    if cached is not None:
        return cached
    data = {"employees": fetch_all_employees_full()}
    _cache_set("employees_all", data)
    return data


# ── Auth endpoints ────────────────────────────────────────────────────────────
# Verifies the posted email + password against the stored PBKDF2 hash.
# Returns 401 if the credentials are wrong — the frontend shows an error
# message in the login form without revealing which field is wrong.
@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = verify_login(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return LoginResponse(ok=True, user=user)


@app.post("/api/auth/forgot-password")
def forgot_password(payload: dict):
    """
    Step 1 of forgot-password: find employee by company email, generate OTP,
    and send it to that same company email address stored in the DB.
    Always returns the same shape to prevent account enumeration.
    """
    account_email = (payload.get("accountEmail") or "").strip().lower()
    if not account_email:
        raise HTTPException(status_code=400, detail="accountEmail is required.")

    emp = find_employee_by_email(account_email)
    if not emp or not emp.get("is_active"):
        return {"ok": True, "maskedEmail": account_email[0] + "***@" + account_email.split("@")[-1]}

    otp = str(randbelow(1000000)).zfill(6)
    create_reset_token(emp["employee_id"], otp, account_email)

    try:
        send_otp_email(account_email, otp, emp["full_name"])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Email send failed: {exc}") from exc

    local, _, domain = account_email.partition("@")
    masked = local[0] + "*" * max(1, len(local) - 2) + local[-1] + "@" + domain if len(local) > 2 else local[0] + "***@" + domain
    return {"ok": True, "maskedEmail": masked}


@app.post("/api/auth/reset-password")
def reset_password(payload: dict):
    """Step 2: verify OTP and set the new password."""
    account_email = (payload.get("accountEmail") or "").strip().lower()
    otp           = (payload.get("otp")          or "").strip()
    new_password  = (payload.get("newPassword")  or "").strip()

    if not account_email or not otp or not new_password:
        raise HTTPException(status_code=400, detail="accountEmail, otp and newPassword are required.")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if not any(c.isdigit() for c in new_password):
        raise HTTPException(status_code=400, detail="Password must include at least one number.")
    if not any(not c.isalnum() for c in new_password):
        raise HTTPException(status_code=400, detail="Password must include at least one special character.")

    emp = find_employee_by_email(account_email)
    if not emp:
        raise HTTPException(status_code=400, detail="Invalid request.")

    token = verify_reset_token(emp["employee_id"], otp)
    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Request a new one.")

    invalidate_reset_token(token["id"])
    change_employee_password(emp["employee_id"], new_password)
    return {"ok": True, "message": "Password reset successfully. You can now log in."}


@app.post("/api/auth/change-password")
def change_password_endpoint(payload: dict):
    """
    Change-password for a logged-in user.
    Verifies the current password before applying the new one.
    """
    employee_id      = (payload.get("employeeId")      or "").strip().upper()
    current_password = (payload.get("currentPassword") or "").strip()
    new_password     = (payload.get("newPassword")     or "").strip()

    if not employee_id or not current_password or not new_password:
        raise HTTPException(status_code=400, detail="employeeId, currentPassword and newPassword are required.")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")
    if not any(c.isdigit() for c in new_password):
        raise HTTPException(status_code=400, detail="Password must include at least one number.")
    if not any(not c.isalnum() for c in new_password):
        raise HTTPException(status_code=400, detail="Password must include at least one special character.")
    if not verify_current_password(employee_id, current_password):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    change_employee_password(employee_id, new_password)
    return {"ok": True, "message": "Password changed successfully."}


# ── Payroll summary endpoints ─────────────────────────────────────────────────
# Lightweight employee list (id, name, dept, CTC only) used in the payroll
# run table — avoids sending sensitive fields to the summary view.
@app.get("/api/payroll/employees")
def employees():
    return {"employees": fetch_employees()}


# Historical payroll run records (month, status, pay date, processed by).
# The SalaryMod uses this to build the payslip history dropdown.
@app.get("/api/payroll/runs")
def payroll_runs():
    return {"payrollRuns": fetch_payroll_runs()}


# ── Announcements endpoints ───────────────────────────────────────────────────
# Full CRUD for company-wide announcements. Only Managers (accessLevel ≥ 3)
# see the Post/Edit/Delete controls in the frontend, but the GET is public
# so all employees can read announcements.

@app.get("/api/announcements")
def get_announcements():
    # Returns only is_active=True records (soft-delete pattern).
    return {"announcements": fetch_announcements()}


@app.post("/api/announcements")
def post_announcement(payload: dict):
    # payload keys: title, body, category, isImportant, authorId, authorName
    try:
        ann = create_announcement(
            title=payload["title"],
            body=payload["body"],
            category=payload.get("category", "Company"),
            is_important=bool(payload.get("isImportant", False)),
            author_id=payload.get("authorId"),
            author_name=payload.get("authorName", ""),
        )
        return {"ok": True, "announcement": ann}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/announcements/{ann_id}")
def put_announcement(ann_id: int, payload: dict):
    # Only fields present in the payload are updated (partial update pattern).
    updates = {}
    if "title"       in payload: updates["title"]       = payload["title"]
    if "body"        in payload: updates["body"]         = payload["body"]
    if "category"    in payload: updates["category"]     = payload["category"]
    if "isImportant" in payload: updates["is_important"] = bool(payload["isImportant"])
    ann = update_announcement(ann_id, **updates)
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return {"ok": True, "announcement": ann}


@app.delete("/api/announcements/{ann_id}")
def del_announcement(ann_id: int):
    # Soft delete — sets is_active=False instead of removing the row,
    # so audit trails are preserved.
    deleted = delete_announcement(ann_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Announcement not found.")
    return {"ok": True}


# ── Payroll Structure endpoints ───────────────────────────────────────────────
# The salary structure defines the percentage split of CTC into components
# (basic, HRA, LTA, conveyance). HR admins can edit these via the Configure
# tab in SalaryMod; changes are persisted here and loaded on next app boot.

@app.get("/api/payroll/structure")
def get_payroll_structure():
    cached = _cache_get("payroll_structure")
    if cached is not None:
        return cached
    data = {"structure": fetch_payroll_structure()}
    _cache_set("payroll_structure", data)
    return data


@app.put("/api/payroll/structure/{component_key}")
def put_payroll_structure(component_key: str, payload: dict):
    # component_key is one of: basic_pct | hra_pct | lta_pct | transport
    try:
        row = update_payroll_structure_component(
            component_key=component_key,
            value=float(payload["value"]),
            updated_by=payload.get("updatedBy"),
        )
        if not row:
            raise HTTPException(status_code=404, detail="Component not found.")
        _cache_bust("payroll_structure")
        return {"ok": True, "component": row}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ── Payroll Field Config endpoints ────────────────────────────────────────────
# Custom earning / deduction fields (e.g. "Performance Bonus", "Loan Deduction")
# that HR can add, toggle active/inactive, and remove. calcType controls whether
# the amount is fixed, % of basic, % of CTC, or % of gross.

@app.get("/api/payroll/field-configs")
def get_field_configs():
    cached = _cache_get("payroll_field_configs")
    if cached is not None:
        return cached
    data = {"fieldConfigs": fetch_payroll_field_configs()}
    _cache_set("payroll_field_configs", data)
    return data


@app.post("/api/payroll/field-configs")
def post_field_config(payload: dict):
    # payload keys: name, category ("earning"|"deduction"), calcType, value, active, createdBy
    try:
        field = create_payroll_field_config(
            name=payload["name"],
            category=payload["category"],
            calc_type=payload["calcType"],
            value=float(payload["value"]),
            active=bool(payload.get("active", True)),
            created_by=payload.get("createdBy"),
        )
        _cache_bust("payroll_field_configs")
        return {"ok": True, "field": field}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/payroll/field-configs/{field_id}")
def put_field_config(field_id: int, payload: dict):
    # Partial update — only keys present in the payload are changed.
    updates = {}
    if "name"     in payload: updates["name"]      = payload["name"]
    if "category" in payload: updates["category"]  = payload["category"]
    if "calcType" in payload: updates["calc_type"]  = payload["calcType"]
    if "value"    in payload: updates["value"]      = float(payload["value"])
    if "active"   in payload: updates["active"]     = bool(payload["active"])
    field = update_payroll_field_config(field_id, **updates)
    if not field:
        raise HTTPException(status_code=404, detail="Field config not found.")
    _cache_bust("payroll_field_configs")
    return {"ok": True, "field": field}


@app.delete("/api/payroll/field-configs/{field_id}")
def del_field_config(field_id: int):
    deleted = delete_payroll_field_config(field_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Field config not found.")
    _cache_bust("payroll_field_configs")
    return {"ok": True}


# ── Statutory deduction config endpoints ─────────────────────────────────────
# PF, ESI, PT and TDS rates/slabs are stored in payroll_statutory_config so HR
# can update them when legislation changes without touching code.

@app.get("/api/payroll/statutory-config")
def get_statutory_config():
    cached = _cache_get("statutory_config")
    if cached is not None:
        return cached
    data = {"statutoryConfig": fetch_statutory_config()}
    _cache_set("statutory_config", data)
    return data


@app.put("/api/payroll/statutory-config/{config_key}")
def put_statutory_config(config_key: str, payload: dict):
    """
    Updates a single statutory config value (HR/Director only via UI guard).
    payload: { value: str, updatedBy: str }
    For slab fields (pt_slab_json, tds_slab_json) value must be a JSON string.
    """
    value      = str(payload.get("value", "")).strip()
    updated_by = payload.get("updatedBy")
    if not value:
        raise HTTPException(status_code=400, detail="value is required.")
    ok = update_statutory_config(config_key, value, updated_by)
    if not ok:
        raise HTTPException(status_code=404, detail="Config key not found.")
    _cache_bust("statutory_config")
    return {"ok": True}


# ── Payslip Line Items endpoints ──────────────────────────────────────────────
# Stores the computed payslip breakdown (each earning and deduction row) for a
# given employee + month. The frontend saves these after running payroll so that
# past payslips can be reconstructed without re-running the calculation engine.

@app.post("/api/payroll/payslip-lines")
def post_payslip_lines(payload: dict):
    # payload keys: employeeId, payrollMonth ("June 2026"), lines (list of line item dicts)
    # The DB layer deletes existing lines for this employee+month before inserting,
    # so this is idempotent — safe to call multiple times for the same month.
    try:
        save_payslip_line_items(
            employee_id=payload["employeeId"],
            payroll_month=payload["payrollMonth"],
            lines=payload["lines"],
        )
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/payroll/payslip-lines/{employee_id}/{payroll_month}")
def get_payslip_lines(employee_id: str, payroll_month: str):
    # payroll_month is a URL segment like "June%202026" (URL-decoded by FastAPI).
    lines = fetch_payslip_line_items(employee_id, payroll_month)
    return {"lines": lines}


# ── Email log endpoints ───────────────────────────────────────────────────────
# Email logs track every payslip email attempt (queued → sent / failed).
# The SalaryMod shows these in the email audit trail.
@app.get("/api/email-logs", response_model=dict[str, list[EmailLogOut]])
def email_logs():
    return {"emailLogs": fetch_email_logs()}


# ── Payslip email endpoint ────────────────────────────────────────────────────
# Sends a payslip PDF to an employee's email address via SMTP.
# Flow:
#   1. Insert a "queued" record in email_logs for audit trail.
#   2. Call send_payslip_email() which uses smtplib to deliver the message.
#   3. On success → mark the log as "sent" with the provider message ID.
#   4. On failure → mark the log as "failed" with the error, then raise 502.
@app.post("/api/send-payslip")
def send_payslip(payload: PayslipEmailRequest):
    log_id = insert_email_log(
        recipient_email=payload.to,
        subject=payload.subject,
        body=payload.body,
        attachment_filename=payload.filename,
        status="queued",
    )

    try:
        provider_id = send_payslip_email(payload)
        mark_email_log_sent(log_id, provider_id)
        return {"ok": True, "emailLog": {"id": log_id, "status": "sent", "providerMessageId": provider_id}}
    except Exception as exc:
        mark_email_log_failed(log_id, str(exc))
        raise HTTPException(status_code=502, detail=f"Email send failed: {exc}") from exc


# ── Attendance endpoints ──────────────────────────────────────────────────────
# IMPORTANT: specific routes (corrections, clock-in, all/month) must be declared
# BEFORE the wildcard /{employee_id} route — FastAPI matches in definition order.

@app.get("/api/attendance/date-range")
def get_attendance_date_range():
    """Returns the earliest and latest date for which attendance has been recorded."""
    return fetch_attendance_date_range()


@app.get("/api/attendance/all/month")
def get_all_attendance(year: int = Query(...), month: int = Query(...)):
    """Returns attendance records for ALL employees for a given year+month (HR reports)."""
    records = fetch_all_attendance_for_month(year, month)
    return {"attendance": records}


@app.post("/api/attendance/clock-in")
def clock_in(payload: dict):
    """Records a clock-in event for the employee for today."""
    try:
        emp_id = payload["employeeId"]
        clock_time = payload.get("time")
        status = payload.get("status", "present")
        today = date.today()
        record = upsert_attendance(emp_id, today, status, clock_in=clock_time)
        return {"ok": True, "record": record}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/attendance/clock-out")
def clock_out(payload: dict):
    """Records a clock-out event for the employee for today."""
    try:
        emp_id = payload["employeeId"]
        clock_time = payload.get("time")
        hours = payload.get("hoursWorked")
        status = payload.get("status", "present")
        today = date.today()
        record = upsert_attendance(emp_id, today, status, clock_out=clock_time, hours_worked=hours)
        return {"ok": True, "record": record}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/attendance/corrections")
def get_corrections(employee_id: str = Query(None), status: str = Query(None)):
    """Returns missed-punch correction requests, filtered by employee and/or status."""
    return {"corrections": fetch_corrections(employee_id=employee_id, status=status)}


@app.post("/api/attendance/corrections")
def post_correction(payload: dict):
    """Submits a new missed-punch correction request."""
    try:
        corr_date = date.fromisoformat(payload["date"])
        rec = create_correction(
            employee_id=payload["employeeId"],
            emp_name=payload["empName"],
            corr_date=corr_date,
            reason=payload["reason"],
        )
        create_notifications_for_hr(
            type_="attendance_correction",
            title="Attendance Correction Request",
            message=f"{payload['empName']} requested a missed-punch correction for {payload['date']}",
            ref_id=rec["id"],
        )
        return {"ok": True, "correction": rec}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/attendance/corrections/{correction_id}/approve")
def approve_correction(correction_id: int, payload: dict):
    """HR approves a missed-punch request and marks attendance as present for that day."""
    try:
        rec = update_correction_status(correction_id, "approved", actioned_by=payload.get("actionedBy"))
        if not rec:
            raise HTTPException(status_code=404, detail="Correction not found.")
        emp_id = rec["employee_id"]
        att_date = date.fromisoformat(rec["date"]) if isinstance(rec["date"], str) else rec["date"]
        upsert_attendance(emp_id, att_date, "present")
        return {"ok": True, "correction": rec}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/attendance/corrections/{correction_id}/reject")
def reject_correction(correction_id: int, payload: dict):
    """HR rejects a missed-punch request."""
    try:
        rec = update_correction_status(correction_id, "rejected", actioned_by=payload.get("actionedBy"))
        if not rec:
            raise HTTPException(status_code=404, detail="Correction not found.")
        return {"ok": True, "correction": rec}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# Wildcard route — must be LAST so it doesn't swallow the specific routes above.
@app.get("/api/attendance/{employee_id}")
def get_attendance(employee_id: str, year: int = Query(...), month: int = Query(...)):
    """Returns attendance records for one employee for a given year+month."""
    records = fetch_attendance_for_month(employee_id, year, month)
    return {"attendance": records}


# ── Leave / Time-off endpoints ────────────────────────────────────────────────

@app.get("/api/leaves")
def get_leaves(employee_id: str = Query(None), status: str = Query(None)):
    """Returns leave requests. Optionally filtered by employee_id and/or status."""
    return {"leaveRequests": fetch_leave_requests(employee_id=employee_id, status=status)}


@app.post("/api/leaves")
def post_leave(payload: dict):
    """Submits a new leave application."""
    try:
        today = date.today()
        fy_start = today.year if today.month >= 4 else today.year - 1
        fiscal_year = f"{fy_start}-{str(fy_start + 1)[-2:]}"
        from_date = date.fromisoformat(payload["fromDate"])
        to_date   = date.fromisoformat(payload["toDate"])
        status = payload.get("status", "pending")
        approved_by = payload.get("approvedBy")
        req = create_leave_request(
            employee_id=payload["employeeId"],
            emp_name=payload["empName"],
            leave_type=payload["leaveType"],
            from_date=from_date,
            to_date=to_date,
            days=int(payload.get("days", 1)),
            reason=payload["reason"],
            status=status,
            applied_date=today,
            approved_by=approved_by,
        )
        # If auto-approved (Director submitting for themselves), increment used count.
        if status == "approved":
            increment_leave_used(payload["employeeId"], payload["leaveType"],
                                 int(payload.get("days", 1)), fiscal_year)
        # Notify HR/Directors only for pending requests.
        if status == "pending":
            create_notifications_for_hr(
                type_="leave_request",
                title="New Leave Request",
                message=f"{payload['empName']} applied for {payload['leaveType']} ({payload['fromDate']} → {payload['toDate']}, {payload.get('days',1)} day(s))",
                ref_id=req["id"],
            )
        return {"ok": True, "leaveRequest": req}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/leaves/{request_id}/approve")
def approve_leave(request_id: int, payload: dict):
    """HR/Manager approves a leave request and increments the employee's used balance."""
    try:
        rec = update_leave_request_status(request_id, "approved", approved_by=payload.get("approvedBy"))
        if not rec:
            raise HTTPException(status_code=404, detail="Leave request not found.")
        today = date.today()
        fy_start = today.year if today.month >= 4 else today.year - 1
        fiscal_year = f"{fy_start}-{str(fy_start + 1)[-2:]}"
        increment_leave_used(rec["employee_id"], rec["leave_type"], int(rec["days"]), fiscal_year)
        return {"ok": True, "leaveRequest": rec}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/leaves/{request_id}/reject")
def reject_leave(request_id: int, payload: dict):
    """HR/Manager rejects a leave request."""
    try:
        # If previously approved, decrement the used balance
        from db import fetch_leave_requests as _flr
        existing = _flr(status=None)
        prev = next((r for r in existing if r["id"] == request_id), None)
        rec = update_leave_request_status(request_id, "rejected", approved_by=payload.get("approvedBy"))
        if not rec:
            raise HTTPException(status_code=404, detail="Leave request not found.")
        if prev and prev.get("status") == "approved":
            today = date.today()
            fy_start = today.year if today.month >= 4 else today.year - 1
            fiscal_year = f"{fy_start}-{str(fy_start + 1)[-2:]}"
            decrement_leave_used(rec["employee_id"], rec["leave_type"], int(rec["days"]), fiscal_year)
        return {"ok": True, "leaveRequest": rec}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/leaves/balance/{employee_id}")
def get_leave_balance(employee_id: str):
    """Returns the leave balances for an employee (creates defaults if none exist)."""
    today = date.today()
    fy_start = today.year if today.month >= 4 else today.year - 1
    fiscal_year = f"{fy_start}-{str(fy_start + 1)[-2:]}"
    balances = ensure_leave_balances(employee_id, fiscal_year)
    return {"balances": balances, "fiscalYear": fiscal_year}


# ── Time log endpoints ────────────────────────────────────────────────────────

@app.get("/api/timelogs/entries/{employee_id}")
def get_time_entries(employee_id: str, week_key: str = Query(...)):
    """Returns all time log entries for an employee's week (week_key = YYYY-MM-DD Monday)."""
    wk = date.fromisoformat(week_key)
    entries = fetch_time_log_entries(employee_id, wk)
    sheet = fetch_timesheet(employee_id, wk)
    return {"entries": entries, "timesheet": sheet}


@app.post("/api/timelogs/entries")
def post_time_entry(payload: dict):
    """Adds a new time log entry and recalculates the timesheet total."""
    try:
        emp_id = payload["employeeId"]
        week_key = date.fromisoformat(payload["weekKey"])
        entry_date = date.fromisoformat(payload["date"])
        entry = create_time_log_entry(
            employee_id=emp_id,
            week_key=week_key,
            entry_date=entry_date,
            project=payload["project"],
            subtask=payload["subtask"],
            hours=float(payload["hours"]),
            notes=payload.get("notes"),
        )
        # Recalculate total and auto-submit at 40h
        all_entries = fetch_time_log_entries(emp_id, week_key)
        total = sum(float(e["hours"]) for e in all_entries)
        sheet = fetch_timesheet(emp_id, week_key)
        current_status = sheet["status"] if sheet else "draft"
        new_status = "submitted" if total >= 40 and current_status == "draft" else current_status
        sheet = upsert_timesheet(emp_id, week_key, total, status=new_status)
        return {"ok": True, "entry": entry, "timesheet": sheet}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/timelogs/entries/{entry_id}")
def del_time_entry(entry_id: int, employee_id: str = Query(...), week_key: str = Query(...)):
    """Removes a time log entry (only allowed while timesheet is in draft)."""
    emp_id = employee_id
    wk = date.fromisoformat(week_key)
    # Guard: only allow deletion on draft timesheets
    sheet = fetch_timesheet(emp_id, wk)
    if sheet and sheet.get("status") not in ("draft", None):
        raise HTTPException(status_code=400, detail="Cannot delete entries from a submitted/approved timesheet.")
    deleted = delete_time_log_entry(entry_id, emp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Entry not found.")
    # Recalculate total
    all_entries = fetch_time_log_entries(emp_id, wk)
    total = sum(float(e["hours"]) for e in all_entries)
    updated_sheet = upsert_timesheet(emp_id, wk, total, status="draft")
    return {"ok": True, "timesheet": updated_sheet}


@app.post("/api/timelogs/sheets/{employee_id}/{week_key}/submit")
def submit_timesheet(employee_id: str, week_key: str):
    """Marks a timesheet as submitted for HR review."""
    try:
        wk = date.fromisoformat(week_key)
        entries = fetch_time_log_entries(employee_id, wk)
        total = sum(float(e["hours"]) for e in entries)
        sheet = upsert_timesheet(employee_id, wk, total, status="submitted")
        return {"ok": True, "timesheet": sheet}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/timelogs/sheets/{employee_id}/{week_key}/approve")
def approve_timesheet(employee_id: str, week_key: str, payload: dict):
    """HR approves a submitted timesheet."""
    try:
        wk = date.fromisoformat(week_key)
        sheet = fetch_timesheet(employee_id, wk)
        if not sheet:
            raise HTTPException(status_code=404, detail="Timesheet not found.")
        total = float(sheet.get("total_hours", 0))
        updated = upsert_timesheet(employee_id, wk, total, status="approved",
                                   approved_by=payload.get("approvedBy"))
        return {"ok": True, "timesheet": updated}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/timelogs/sheets/{employee_id}/{week_key}/reject")
def reject_timesheet(employee_id: str, week_key: str, payload: dict):
    """HR rejects a submitted timesheet (sends it back to draft)."""
    try:
        wk = date.fromisoformat(week_key)
        sheet = fetch_timesheet(employee_id, wk)
        if not sheet:
            raise HTTPException(status_code=404, detail="Timesheet not found.")
        total = float(sheet.get("total_hours", 0))
        updated = upsert_timesheet(employee_id, wk, total, status="rejected",
                                   approved_by=payload.get("approvedBy"))
        return {"ok": True, "timesheet": updated}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/timelogs/sheets/all")
def get_all_timesheets(status: str = Query(None)):
    """Returns all timesheets (for HR review tab), optionally filtered by status."""
    return {"timesheets": fetch_all_timesheets(status=status)}


@app.get("/api/timelogs/sheets/{employee_id}")
def get_employee_timesheets(employee_id: str):
    """Returns all timesheet summaries for one employee."""
    return {"timesheets": fetch_employee_timesheets(employee_id)}


# ── Documents endpoints ───────────────────────────────────────────────────────

@app.get("/api/documents")
def get_documents(employee_id: str = Query(None)):
    """Returns document metadata. Pass employee_id to filter to one employee."""
    return {"documents": fetch_documents(employee_id=employee_id)}


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    employeeId: str = Form(...),
    uploadedBy: str = Form(...),
    category: str = Form("Other"),
    description: str = Form(""),
):
    """Saves an uploaded file to disk and stores its metadata in the DB."""
    suffix = Path(file.filename).suffix
    stored_name = f"{uuid4().hex}{suffix}"
    dest = UPLOADS_DIR / stored_name
    content = await file.read()
    dest.write_bytes(content)
    doc = create_document(
        employee_id=employeeId,
        uploaded_by=uploadedBy,
        original_name=file.filename,
        stored_name=stored_name,
        file_type=file.content_type or "application/octet-stream",
        file_size=len(content),
        category=category,
        description=description or None,
    )
    return {"ok": True, "document": doc}


@app.get("/api/documents/{doc_id}/view")
def view_document(doc_id: int):
    """Serves the file inline so the browser can render it (PDF, image, etc.)."""
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    file_path = UPLOADS_DIR / doc["stored_name"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")
    from fastapi.responses import Response
    content = file_path.read_bytes()
    return Response(
        content=content,
        media_type=doc["file_type"],
        headers={"Content-Disposition": f"inline; filename=\"{doc['original_name']}\""},
    )


@app.get("/api/documents/{doc_id}/download")
def download_document(doc_id: int):
    """Serves the raw file as an attachment (forces browser download)."""
    doc = fetch_document_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    file_path = UPLOADS_DIR / doc["stored_name"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk.")
    return FileResponse(
        path=str(file_path),
        media_type=doc["file_type"],
        filename=doc["original_name"],
    )


@app.delete("/api/documents/{doc_id}")
def remove_document(doc_id: int):
    """Deletes a document record and its file from disk."""
    stored_name = delete_document(doc_id)
    if not stored_name:
        raise HTTPException(status_code=404, detail="Document not found.")
    file_path = UPLOADS_DIR / stored_name
    if file_path.exists():
        file_path.unlink()
    return {"ok": True}


# ── Notification endpoints ────────────────────────────────────────────────────

@app.get("/api/notifications")
def get_notifications(recipient_id: str = Query(...)):
    """Returns the 50 most recent notifications for a recipient (HR/Director)."""
    return {"notifications": fetch_notifications(recipient_id)}


@app.put("/api/notifications/read-all")
def read_all_notifs(recipient_id: str = Query(...)):
    """Marks all notifications as read for a recipient."""
    mark_all_notifications_read(recipient_id)
    return {"ok": True}


@app.put("/api/notifications/{notif_id}/read")
def read_notif(notif_id: int):
    """Marks a single notification as read."""
    mark_notification_read(notif_id)
    return {"ok": True}


# ── Goals endpoints ──────────────────────────────────────────────────────────

@app.get("/api/goals")
def get_goals(employee_id: str = Query(...), quarter: str = Query(None)):
    return {"goals": fetch_goals(employee_id, quarter)}


@app.post("/api/goals")
def post_goal(payload: dict):
    try:
        g = create_goal(
            employee_id=payload["employeeId"],
            title=payload["title"],
            target=payload.get("target", ""),
            notes=payload.get("notes", ""),
            is_key=bool(payload.get("isKey", False)),
            progress=int(payload.get("progress", 0)),
            status=payload.get("status", "on-track"),
            quarter=payload["quarter"],
        )
        return {"ok": True, "goal": g}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.patch("/api/goals/{goal_id}")
def patch_goal(goal_id: int, payload: dict):
    allowed = {"title", "target", "notes", "is_key", "progress", "status"}
    fields = {k: v for k, v in payload.items() if k in allowed}
    if not fields:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    try:
        return {"ok": True, "goal": update_goal(goal_id, **fields)}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/goals/{goal_id}")
def del_goal(goal_id: int):
    try:
        delete_goal(goal_id)
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# ── Performance Reviews endpoints ─────────────────────────────────────────────

@app.get("/api/perf/reviews/{employee_id}")
def get_reviews(employee_id: str):
    return {"reviews": fetch_reviews(employee_id)}


@app.post("/api/perf/reviews")
def post_review(payload: dict):
    try:
        review = create_review(
            employee_id=payload["employeeId"],
            reviewer_id=payload.get("reviewerId"),
            period=payload["period"],
            score=payload.get("score"),
            feedback=payload.get("feedback", ""),
            status=payload.get("status", "pending"),
            review_date=payload.get("reviewDate"),
        )
        return {"ok": True, "review": review}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.put("/api/perf/reviews/{review_id}")
def put_review(review_id: int, payload: dict):
    updates = {}
    if "score"      in payload: updates["score"]       = float(payload["score"]) if payload["score"] is not None else None
    if "feedback"   in payload: updates["feedback"]    = payload["feedback"]
    if "status"     in payload: updates["status"]      = payload["status"]
    if "reviewDate" in payload: updates["review_date"] = payload["reviewDate"]
    if "period"     in payload: updates["period"]      = payload["period"]
    review = update_review(review_id, **updates)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
    return {"ok": True, "review": review}


@app.delete("/api/perf/reviews/{review_id}")
def del_review(review_id: int):
    delete_review(review_id)
    return {"ok": True}


# ── Dev server entry point ────────────────────────────────────────────────────
# Only used when running `python app.py` directly (local dev).
# In production (Render / Railway) the platform calls uvicorn directly via
# the Procfile / start command, so this block is skipped.
if __name__ == "__main__":
    uvicorn.run("app:app", host=settings.host, port=settings.port, reload=settings.reload)
