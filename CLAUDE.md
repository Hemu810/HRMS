# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server (http://localhost:5173)
cd frontend && npm run dev

# Backend API server (http://localhost:4000)
cd backend && python app.py
# OR via frontend npm alias:
cd frontend && npm run backend:dev

# Build frontend for production
cd frontend && npm run build

# Lint frontend
cd frontend && npm run lint

# Seed the database with initial employees (run once)
cd backend && python setup_db.py
```

No test suite exists. Verification is done by running the app.

## Architecture

### Stack
- **Frontend**: Single-file React 19 app — `frontend/src/HRModules.jsx` contains all components, styles (CSS-in-JS via `<style>`), and the payroll engine. There is no component split across files.
- **Backend**: FastAPI + SQLAlchemy Core (not ORM) in `backend/app.py` (routes) and `backend/db.py` (all table definitions and query functions). `backend/config.py` reads all settings from environment variables via `backend/env.py` (a zero-dep `.env` loader).
- **Database**: SQLite for dev (`doloxe_hrms_dev.db`), production uses MSSQL or PostgreSQL via `DATABASE_URL`. `BigInteger().with_variant(Integer, "sqlite")` is used on every PK so the schema works on both.

### Frontend globals (critical to understand)
Three module-level variables in `HRModules.jsx` act as the app's in-memory store:
```js
let ALL_USERS        = window.__HR_ALL_USERS__        || [];
let APP_STRUCTURE    = window.__HR_APP_STRUCTURE__    || null;
let APP_CUSTOM_FIELDS= window.__HR_APP_CUSTOM_FIELDS__|| [];
```
These are populated once by `AppBootstrap` on first render from `/api/employees/all`, `/api/payroll/structure`, and `/api/payroll/field-configs`. They are mirrored on `window.*` to survive Vite HMR module re-evaluation. Any component that reads these will see stale data if modified without also updating the window cache.

Employee objects from the API use `id` (not `employeeId`) as the key field. All FK lookups must use `u.id`.

### Payroll engine
`calcPayroll(emp, inputs, customFields, structure)` in `HRModules.jsx` is a pure-JS function — all payroll computation runs client-side. It consumes:
- `structure` (from `APP_STRUCTURE` / `payroll_structure` DB table): basic%, HRA%, LTA%, transport flat amount
- `customFields` (from `APP_CUSTOM_FIELDS` / `payroll_field_config` DB table): HR-defined extra earnings/deductions
- Statutory rates (PF, ESI, PT, TDS) currently as frontend constants — see lines ~2222–2240

The backend stores payslip metadata in `payslip_line_items` but the canonical payroll calculation always happens in the frontend.

### Access control
Access levels: 1=Employee, 2=Lead, 3=Manager, 4=Director. `is_hr=true` grants payroll/HR access regardless of level. Key guards:
- `canOperatePayroll(user)` — `accessLevel >= 4 || isHR`
- `canViewAll(user)` — `accessLevel >= 3` (full org chart / team data)
- `canSeeSensitiveOf(viewer, targetId)` — `accessLevel >= 4 || viewer.id === targetId`

### Database tables
16 tables total. All defined in `db.py` with their FKs. Key ones:
- `employees` — self-referential `mgr_id → employee_id` for org chart
- `payroll_structure` — editable earnings component percentages (seeded with defaults on startup)
- `payroll_field_config` — HR-defined custom earning/deduction fields
- `attendance`, `attendance_corrections`, `leave_requests`, `leave_balances` — workforce management
- `time_log_entries`, `timesheets` — weekly timesheets (draft→submitted→approved)
- `documents` — file metadata only; actual files stored at `backend/uploads/<uuid>.<ext>`
- `password_reset_tokens` — OTP tokens for forgot-password flow

`init_database()` in `db.py` creates tables, seeds `payroll_structure` defaults, and seeds `leave_balances` for every employee on startup.

### Auth flow
Login → `verify_login()` in `db.py` (PBKDF2-SHA256, 100k iterations). No JWT — `currentUser` is React state in `HRApp`. Forgot-password uses a 6-digit OTP sent to each employee's `recovery_email` (personal inbox, not company email). OTPs expire in 15 minutes and are single-use.

### Org chart hierarchy
`mgr_id` on the `employees` table is the self-referential FK. `fetch_all_employees_full()` builds a `reports_map` in a second pass so every employee object includes a `reports` array. The frontend `OrgMod` renders the employee view (personal chain) when `accessLevel < 3`, and the full company tree when `accessLevel >= 3`.

### Time log projects
`DEPT_PROJS` in `HRModules.jsx` (lines ~759–795) defines per-department project lists shown in the Time Log module. Each department has its own named projects and subtasks.

### File uploads
Documents upload endpoint (`POST /api/documents/upload`) saves files to `backend/uploads/` with UUID filenames. View (`/view`) sets `Content-Disposition: inline`; download (`/download`) sets `attachment`. The `stored_name` column in `documents` is the on-disk filename.

### Deployment
- Backend on Render: start command `cd backend && pip install -r requirements.txt && python app.py`
- Frontend on Vercel: `VITE_API_URL` and `VITE_PAYSLIP_EMAIL_ENDPOINT` must be set as env vars before build (they are baked into the JS bundle at build time)
- `FRONTEND_ORIGIN` on Render must match the exact Vercel domain for CORS
- SQLite on Render free tier is ephemeral — add a Render Disk or switch to PostgreSQL for persistent data
