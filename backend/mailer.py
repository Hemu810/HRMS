"""
mailer.py — SMTP Email Delivery
================================
Sends payslip emails with a PDF attachment using Python's built-in smtplib.
Called by the POST /api/send-payslip route in app.py.

Why smtplib instead of a third-party service (SendGrid, Mailgun)?
  - Zero external dependencies beyond the standard library.
  - Works with any SMTP provider — Gmail, Outlook, Zoho, your company mail server.
  - For Gmail: enable 2FA and generate an App Password (SMTP_PASS) at
    myaccount.google.com/apppasswords. Do NOT use your Gmail login password.

Two connection modes:
  - smtp_secure=True  → SMTP_SSL on port 465   (direct TLS from the start)
  - smtp_secure=False → SMTP + STARTTLS on port 587 (upgrades to TLS mid-session)
  Gmail requires port 465 (SMTP_SSL). Most corporate mail servers prefer 587.
"""

import base64
from email.message import EmailMessage
import smtplib

from config import settings
from schemas import PayslipEmailRequest


def _smtp_connect():
    """Opens and authenticates an SMTP connection based on config. Returns the smtp object."""
    if not settings.smtp_user or not settings.smtp_pass or not settings.smtp_from:
        raise RuntimeError(
            "SMTP is not configured. Set SMTP_USER, SMTP_PASS and SMTP_FROM in backend/.env."
        )
    if settings.smtp_user == "your-email@gmail.com" or settings.smtp_pass == "your-app-password":
        raise RuntimeError(
            "SMTP is still using placeholder credentials. Update SMTP_USER, SMTP_PASS and SMTP_FROM in backend/.env."
        )
    if settings.smtp_secure:
        smtp = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port)
    else:
        smtp = smtplib.SMTP(settings.smtp_host, settings.smtp_port)
        smtp.starttls()
    smtp.login(settings.smtp_user, settings.smtp_pass)
    return smtp


def send_otp_email(to_email: str, otp: str, employee_name: str):
    """
    Sends the 6-digit OTP to the user's real email address for password reset.
    `to_email` is whatever the user typed — Gmail, Outlook, or any real mailbox.
    Raises RuntimeError / smtplib exceptions on failure (caller handles logging).
    """
    html_body = f"""<!doctype html>
<html>
<body style="margin:0;background:#f3f5f8;font-family:Arial,'Segoe UI',sans-serif;color:#111827">
  <div style="max-width:480px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:#0d0d0e;padding:24px 28px;border-left:6px solid #1B45F5">
      <div style="font-size:20px;font-weight:900;color:#fff;letter-spacing:.3px">DOLOXE HRMS</div>
      <div style="font-size:12px;color:#b8bcc7;margin-top:4px">Password Reset · One-Time Password</div>
    </div>
    <div style="padding:32px 28px">
      <p style="margin:0 0 16px;font-size:15px">Hi <strong>{employee_name}</strong>,</p>
      <p style="margin:0 0 24px;font-size:14px;color:#374151">
        We received a request to reset your Doloxe HRMS password.
        Use the one-time password below to proceed:
      </p>
      <div style="background:#eff6ff;border:2px solid #1B45F5;border-radius:12px;text-align:center;padding:28px 20px;margin-bottom:24px">
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#1B45F5;font-family:monospace">{otp}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:10px">Expires in <strong>15 minutes</strong></div>
      </div>
      <p style="font-size:13px;color:#6b7280;margin:0 0 10px">
        If you did not request this, you can safely ignore this email — your password will not change.
      </p>
      <p style="font-size:13px;color:#6b7280;margin:0">
        Do not share this OTP with anyone, including Doloxe support staff.
      </p>
    </div>
    <div style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center">
      Doloxe India Private Limited · HR Operations
    </div>
  </div>
</body>
</html>"""

    plain_body = (
        f"Hi {employee_name},\n\n"
        f"Your Doloxe HRMS password reset OTP is: {otp}\n\n"
        f"This OTP expires in 15 minutes. Do not share it with anyone.\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"-- Doloxe India Private Limited"
    )

    msg = EmailMessage()
    msg["From"]    = settings.smtp_from
    msg["To"]      = to_email
    msg["Subject"] = "Your DOLOXE HRMS Password Reset OTP"
    msg.set_content(plain_body)
    msg.add_alternative(html_body, subtype="html")

    with _smtp_connect() as smtp:
        smtp.send_message(msg)
        return msg.get("Message-ID")


def send_payslip_email(payload: PayslipEmailRequest):
    """
    Builds and sends an email with the payslip PDF attached.

    Parameters:
        payload — validated PayslipEmailRequest containing:
            to              : recipient address
            subject         : email subject
            body            : plain-text fallback body
            htmlBody        : rich HTML body (shown by modern email clients)
            filename        : PDF filename for the attachment
            attachmentBase64: Base64-encoded PDF bytes (generated in the browser)

    Returns:
        The SMTP Message-ID string on success (stored in email_logs for auditing).

    Raises:
        RuntimeError — if SMTP credentials are missing or still set to placeholders.
        Any smtplib / socket exception — propagated up so app.py can mark the
        email log as "failed" and return a 502 to the frontend.
    """
    msg = EmailMessage()
    msg["From"]    = settings.smtp_from
    msg["To"]      = payload.to
    msg["Subject"] = payload.subject
    msg.set_content(payload.body)
    if payload.htmlBody:
        msg.add_alternative(payload.htmlBody, subtype="html")
    msg.add_attachment(
        base64.b64decode(payload.attachmentBase64),
        maintype="application",
        subtype="pdf",
        filename=payload.filename,
    )
    with _smtp_connect() as smtp:
        smtp.send_message(msg)
        return msg.get("Message-ID")
