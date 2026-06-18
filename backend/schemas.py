"""
schemas.py — Pydantic Request / Response Models
================================================
Pydantic models validate incoming HTTP request bodies before they reach
route handler functions. If any field fails validation, FastAPI automatically
returns a 422 Unprocessable Entity response with field-level error details —
no manual validation code needed in the route handlers.

Why separate from db.py?
  schemas.py owns the HTTP contract (what the API accepts and returns).
  db.py owns the database contract (how data is stored and queried).
  Keeping them separate means you can change one without touching the other.
"""

from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """
    POST /api/auth/login request body.
    EmailStr validates that the email is syntactically valid before
    we even hit the database — avoids unnecessary DB queries for junk input.
    """
    email: EmailStr
    password: str = Field(min_length=1)  # rejects empty passwords at the boundary


class LoginResponse(BaseModel):
    """
    Successful login response.
    `user` is the full employee dict (same shape as ALL_USERS entries in the
    frontend) — the frontend stores this in React state as `currentUser`.
    `token` is a signed JWT the frontend must send as `Authorization: Bearer <token>`
    on every subsequent API request.
    """
    ok: bool
    user: dict[str, Any]
    token: str


# ── Payslip email ─────────────────────────────────────────────────────────────

class PayslipEmailRequest(BaseModel):
    """
    POST /api/send-payslip request body.
    The frontend generates a PDF payslip in-browser, encodes it as Base64,
    and sends it here together with recipient details. The server decodes and
    attaches it to the SMTP message — the PDF never needs to be written to disk.

    Strict validators enforce that only PDF payslips can be sent through this
    endpoint (prevents misuse as a generic file-sending relay).
    """
    to: EmailStr                                        # recipient address
    subject: str = Field(min_length=1, max_length=300) # email subject line
    body: str    = Field(min_length=1)                  # plain-text body
    htmlBody: str | None = None                         # rich HTML body (optional)
    filename: str = Field(min_length=5, max_length=255) # attachment filename
    attachmentType: str = "application/pdf"             # MIME type
    attachmentBase64: str = Field(min_length=10)        # Base64-encoded PDF bytes

    @field_validator("filename")
    @classmethod
    def filename_must_be_pdf(cls, value: str):
        """Rejects any filename that doesn't end in .pdf to prevent misuse."""
        if not value.lower().endswith(".pdf"):
            raise ValueError("filename must end with .pdf")
        return value

    @field_validator("attachmentType")
    @classmethod
    def attachment_must_be_pdf(cls, value: str):
        """Ensures only PDF MIME type is accepted."""
        if value != "application/pdf":
            raise ValueError("attachmentType must be application/pdf")
        return value


# ── Email log output ──────────────────────────────────────────────────────────

class EmployeeUpdateRequest(BaseModel):
    """
    PUT /api/employees/{employee_id} request body.
    All fields are optional — only provided fields are written to the DB.
    The route handler enforces which fields each access level may change.
    """
    # Self-editable by any employee on their own record
    phone:          Optional[str] = None
    location:       Optional[str] = None
    gender:         Optional[str] = None
    dob:            Optional[str] = None   # ISO date string "YYYY-MM-DD"
    bank_name:      Optional[str] = None
    bank_account_no: Optional[str] = None
    ifsc:           Optional[str] = None
    uan:            Optional[str] = None
    pan:            Optional[str] = None
    aadhaar:        Optional[str] = None
    pf_account:     Optional[str] = None
    # HR / Director only
    first_name:     Optional[str] = None
    middle_name:    Optional[str] = None
    last_name:      Optional[str] = None
    department:     Optional[str] = None
    designation:    Optional[str] = None
    email:          Optional[EmailStr] = None
    annual_ctc_lpa: Optional[float] = None
    emp_type:       Optional[str] = None
    notice_period:  Optional[str] = None
    mgr_id:         Optional[str] = None
    access_level:   Optional[int] = None
    is_hr:          Optional[bool] = None
    date_of_joining: Optional[str] = None
    is_active:      Optional[bool] = None
    # Director/Manager (level ≥ 3) only — renames the primary key across all tables
    new_employee_id: Optional[str] = None
    # Caller identity — used by the route to authorise which fields to accept
    requestor_id:   str = Field(..., min_length=1)


class EmployeeCreateRequest(BaseModel):
    """POST /api/employees request body. HR / Director only."""
    first_name:      str = Field(..., min_length=1)
    last_name:       str = Field(..., min_length=1)
    middle_name:     Optional[str] = None
    email:           EmailStr
    department:      str = Field(..., min_length=1)
    designation:     str = Field(..., min_length=1)
    annual_ctc_lpa:  float = Field(..., ge=0)
    password:        str = Field(..., min_length=6)
    phone:           Optional[str] = None
    location:        Optional[str] = None
    gender:          Optional[str] = None
    dob:             Optional[str] = None
    date_of_joining: Optional[str] = None
    emp_type:        Optional[str] = None
    notice_period:   Optional[str] = None
    mgr_id:          Optional[str] = None
    access_level:    Optional[int] = 1
    is_hr:           Optional[bool] = False
    pan:             Optional[str] = None
    aadhaar:         Optional[str] = None
    uan:             Optional[str] = None
    pf_account:      Optional[str] = None
    bank_name:       Optional[str] = None
    bank_account_no: Optional[str] = None
    ifsc:            Optional[str] = None
    # Caller identity — route uses this to verify HR / Director access
    requestor_id:    str = Field(..., min_length=1)


class EmailLogOut(BaseModel):
    """
    Shape of each email log entry returned by GET /api/email-logs.
    Optional fields are None when the email hasn't been sent yet or failed.
    This model is used as the response_model so FastAPI filters out
    sensitive fields (like the raw body) from the API response.
    """
    id: int
    recipient_email: str
    subject: str
    attachment_filename: str | None = None
    status: str                        # queued | sent | failed
    provider_message_id: str | None = None  # SMTP Message-ID on success
    error_message: str | None = None        # error reason on failure
    sent_at: str | None = None              # ISO timestamp of delivery
    created_at: str                         # ISO timestamp of log creation
