import base64
from email.message import EmailMessage
import smtplib

from config import settings
from schemas import PayslipEmailRequest


def send_payslip_email(payload: PayslipEmailRequest):
    if not settings.smtp_user or not settings.smtp_pass or not settings.smtp_from:
        raise RuntimeError("SMTP is not configured. Set SMTP_USER, SMTP_PASS and SMTP_FROM in backend/.env.")
    if settings.smtp_user == "your-email@gmail.com" or settings.smtp_pass == "your-app-password":
        raise RuntimeError("SMTP is still using placeholder credentials. Update SMTP_USER, SMTP_PASS and SMTP_FROM in backend/.env.")

    msg = EmailMessage()
    msg["From"] = settings.smtp_from
    msg["To"] = payload.to
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

    if settings.smtp_secure:
        with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as smtp:
            smtp.login(settings.smtp_user, settings.smtp_pass)
            smtp.send_message(msg)
            return msg.get("Message-ID")

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
        smtp.starttls()
        smtp.login(settings.smtp_user, settings.smtp_pass)
        smtp.send_message(msg)
        return msg.get("Message-ID")
