# HR App Backend

FastAPI backend for payroll email delivery and payroll persistence.

Stack:

- FastAPI
- SQLAlchemy
- SQLite for local development without Docker
- pyodbc + MS SQL Server for Docker/production
- SMTP email delivery

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

For local development without Docker SQL Server, keep this value in `.env`:

```env
DATABASE_URL=sqlite:///./doloxe_hrms_dev.db
```

The backend will create the SQLite database and seed basic employees during startup.

For Docker/production SQL Server, create a database named `DOLOXEHRMS`, then change `DATABASE_URL` in `.env`:

```env
DATABASE_URL=mssql+pyodbc://sa:YOUR_PASSWORD@localhost:1433/DOLOXEHRMS?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes
```

In SQL Server mode, the backend creates tables from `mssql_schema.sql` and inserts seed rows from `mssql_seed.sql` during startup.

Edit `.env` and set your SMTP credentials. For Gmail, use an app password.

```bash
python3 app.py
```

Point the frontend to the email endpoint:

```env
VITE_PAYSLIP_EMAIL_ENDPOINT=http://localhost:4000/api/send-payslip
```

Restart the Vite dev server after changing frontend env values.

## Email Endpoint

`POST /api/send-payslip`

Payload expected from the current frontend:

```json
{
  "to": "employee@example.com",
  "subject": "Your Pay Slip for April 2025 - DOLOXE",
  "body": "Email body text",
  "filename": "Payslip_EMP-0001_April_2025.pdf",
  "attachmentType": "application/pdf",
  "attachmentBase64": "JVBERi0x..."
}
```

The endpoint sends the email with a PDF attachment and writes an audit row in `email_logs`.

## Tables

- `employees`
- `payroll_runs`
- `payslips`
- `payslip_earnings`
- `payslip_deductions`
- `payroll_adjustments`
- `email_logs`
