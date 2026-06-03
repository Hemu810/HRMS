from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import settings
from db import (
    engine,
    fetch_email_logs,
    fetch_employees,
    fetch_payroll_runs,
    init_database,
    insert_email_log,
    mark_email_log_failed,
    mark_email_log_sent,
)
from mailer import send_payslip_email
from schemas import EmailLogOut, PayslipEmailRequest


app = FastAPI(title="DOLOXE HRMS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_database()


@app.get("/api/health")
def health():
    return {"ok": True, "service": "doloxe-hrms-fastapi", "database": engine.dialect.name}


@app.get("/api/payroll/employees")
def employees():
    return {"employees": fetch_employees()}


@app.get("/api/payroll/runs")
def payroll_runs():
    return {"payrollRuns": fetch_payroll_runs()}


@app.get("/api/email-logs", response_model=dict[str, list[EmailLogOut]])
def email_logs():
    return {"emailLogs": fetch_email_logs()}


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


if __name__ == "__main__":
    uvicorn.run("app:app", host=settings.host, port=settings.port, reload=settings.reload)
