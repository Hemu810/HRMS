-- ============================================================
-- DOLOXE HRMS — Complete MSSQL Schema
-- Run this once against your SQL Server instance.
-- All IF NOT EXISTS guards make it safe to re-run.
-- ============================================================



USE DOLOXE_DEV;
GO

-- ── 1. employees ─────────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.employees', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.employees (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id      NVARCHAR(20)   NOT NULL UNIQUE,
    first_name       NVARCHAR(80)   NOT NULL,
    middle_name      NVARCHAR(80)   NULL,
    last_name        NVARCHAR(80)   NOT NULL,
    full_name        NVARCHAR(180)  NOT NULL,
    department       NVARCHAR(80)   NOT NULL,
    designation      NVARCHAR(120)  NOT NULL,
    email            NVARCHAR(180)  NOT NULL UNIQUE,
    phone            NVARCHAR(40)   NULL,
    location         NVARCHAR(80)   NULL,
    date_of_joining  DATE           NULL,
    dob              DATE           NULL,
    gender           NVARCHAR(20)   NULL,
    color            NVARCHAR(10)   NULL,
    mgr_id           NVARCHAR(20)   NULL REFERENCES hrms.employees(employee_id),
    pan              NVARCHAR(20)   NULL,
    aadhaar          NVARCHAR(30)   NULL,
    uan              NVARCHAR(30)   NULL,
    pf_account       NVARCHAR(80)   NULL,
    esic             NVARCHAR(40)   NULL,
    bank_name        NVARCHAR(120)  NULL,
    bank_account_no  NVARCHAR(80)   NULL,
    ifsc             NVARCHAR(20)   NULL,
    annual_ctc_lpa   DECIMAL(12,2)  NOT NULL DEFAULT 0,
    emp_type         NVARCHAR(40)   NULL,
    notice_period    NVARCHAR(40)   NULL,
    access_level     INT            NOT NULL DEFAULT 1,
    is_hr            BIT            NOT NULL DEFAULT 0,
    is_finance_operator BIT         NOT NULL DEFAULT 0,
    perf_score            DECIMAL(4,2)   NULL,
    password_hash         NVARCHAR(200)  NOT NULL,
    must_change_password  BIT            NOT NULL DEFAULT 1,
    is_active             BIT            NOT NULL DEFAULT 1,
    created_at       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 2. payroll_runs ──────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.payroll_runs', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payroll_runs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    payroll_month   DATE          NOT NULL UNIQUE,
    status          NVARCHAR(30)  NOT NULL DEFAULT 'draft',
    pay_date        DATE          NULL,
    payment_mode    NVARCHAR(40)  NOT NULL DEFAULT 'Bank Transfer',
    tax_regime      NVARCHAR(40)  NOT NULL DEFAULT 'New Regime',
    remarks         NVARCHAR(MAX) NULL,
    processed_by    NVARCHAR(20)  NULL REFERENCES hrms.employees(employee_id),
    processed_at    DATETIME2     NULL,
    created_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 3. payslips ──────────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.payslips', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payslips (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    payroll_run_id   BIGINT         NOT NULL REFERENCES hrms.payroll_runs(id),
    employee_id      NVARCHAR(20)   NOT NULL REFERENCES hrms.employees(employee_id),
    total_work_days  DECIMAL(5,2)   NOT NULL DEFAULT 0,
    payable_days     DECIMAL(5,2)   NOT NULL DEFAULT 0,
    lop_days         DECIMAL(5,2)   NOT NULL DEFAULT 0,
    gross_earnings   DECIMAL(14,2)  NOT NULL DEFAULT 0,
    total_deductions DECIMAL(14,2)  NOT NULL DEFAULT 0,
    net_pay          DECIMAL(14,2)  NOT NULL DEFAULT 0,
    status           NVARCHAR(30)   NOT NULL DEFAULT 'draft',
    created_at       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_payslips_run_employee UNIQUE (payroll_run_id, employee_id)
  );
END
GO

-- ── 4. payroll_structure ─────────────────────────────────────────────────────
IF OBJECT_ID('hrms.payroll_structure', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payroll_structure (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    component_key NVARCHAR(40)   NOT NULL UNIQUE,
    label         NVARCHAR(120)  NOT NULL,
    calc_type     NVARCHAR(30)   NOT NULL,
    value         DECIMAL(12,2)  NOT NULL DEFAULT 0,
    description   NVARCHAR(300)  NULL,
    updated_by    NVARCHAR(20)   NULL REFERENCES hrms.employees(employee_id),
    updated_at    DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );

  INSERT INTO hrms.payroll_structure (component_key, label, calc_type, value, description, updated_at) VALUES
    ('basic_pct', 'Basic Salary',               'pct_ctc',   50.0, 'Percentage of monthly CTC paid as Basic Salary',                          SYSUTCDATETIME()),
    ('hra_pct',   'House Rent Allowance (HRA)',  'pct_basic', 45.0, 'Percentage of Basic Salary paid as HRA',                                  SYSUTCDATETIME()),
    ('lta_pct',   'Leave Travel Allowance (LTA)','pct_ctc',    0.0, 'Percentage of monthly CTC paid as LTA (set to 0 if not applicable)',      SYSUTCDATETIME()),
    ('transport', 'Conveyance Allowance',         'fixed',   2333.0,'Fixed conveyance allowance per month (INR)',                               SYSUTCDATETIME());
END
GO

-- ── 5. announcements ─────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.announcements', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.announcements (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    title        NVARCHAR(300)  NOT NULL,
    body         NVARCHAR(MAX)  NOT NULL,
    category     NVARCHAR(50)   NOT NULL DEFAULT 'Company',
    is_important BIT            NOT NULL DEFAULT 0,
    author_id    NVARCHAR(20)   NULL REFERENCES hrms.employees(employee_id),
    author_name  NVARCHAR(180)  NULL,
    is_active    BIT            NOT NULL DEFAULT 1,
    created_at   DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 6. payroll_field_config ──────────────────────────────────────────────────
IF OBJECT_ID('hrms.payroll_field_config', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payroll_field_config (
    id         BIGINT IDENTITY(1,1) PRIMARY KEY,
    name       NVARCHAR(120)  NOT NULL,
    category   NVARCHAR(20)   NOT NULL,
    calc_type  NVARCHAR(30)   NOT NULL,
    value      DECIMAL(12,2)  NOT NULL DEFAULT 0,
    active     BIT            NOT NULL DEFAULT 1,
    created_by NVARCHAR(20)   NULL REFERENCES hrms.employees(employee_id),
    created_at DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 7. payslip_line_items ────────────────────────────────────────────────────
IF OBJECT_ID('hrms.payslip_line_items', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payslip_line_items (
    id               BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id      NVARCHAR(20)   NOT NULL REFERENCES hrms.employees(employee_id),
    payroll_month    NVARCHAR(30)   NOT NULL,
    line_type        NVARCHAR(20)   NOT NULL,
    label            NVARCHAR(120)  NOT NULL,
    amount           DECIMAL(14,2)  NOT NULL DEFAULT 0,
    field_config_id  BIGINT         NULL REFERENCES hrms.payroll_field_config(id),
    is_custom        BIT            NOT NULL DEFAULT 0,
    created_at       DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 8. email_logs ────────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.email_logs', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.email_logs (
    id                    BIGINT IDENTITY(1,1) PRIMARY KEY,
    payslip_id            BIGINT         NULL,
    recipient_email       NVARCHAR(180)  NOT NULL,
    subject               NVARCHAR(300)  NOT NULL,
    body                  NVARCHAR(MAX)  NOT NULL,
    attachment_filename   NVARCHAR(255)  NULL,
    status                NVARCHAR(30)   NOT NULL DEFAULT 'queued',
    provider_message_id   NVARCHAR(500)  NULL,
    error_message         NVARCHAR(2000) NULL,
    sent_at               DATETIME2      NULL,
    created_at            DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at            DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 9. password_reset_tokens ─────────────────────────────────────────────────
IF OBJECT_ID('hrms.password_reset_tokens', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.password_reset_tokens (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    otp         NVARCHAR(10)  NOT NULL,
    real_email  NVARCHAR(200) NOT NULL,
    expires_at  DATETIME2     NOT NULL,
    used        BIT           NOT NULL DEFAULT 0,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 10. attendance ───────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.attendance', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.attendance (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id  NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    date         DATE          NOT NULL,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'present',
    clock_in     NVARCHAR(10)  NULL,
    clock_out    NVARCHAR(10)  NULL,
    hours_worked DECIMAL(5,2)  NULL,
    notes        NVARCHAR(MAX) NULL,
    created_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_attendance_emp_date UNIQUE (employee_id, date)
  );
END
GO

-- ── 11. attendance_corrections ───────────────────────────────────────────────
IF OBJECT_ID('hrms.attendance_corrections', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.attendance_corrections (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id  NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    emp_name     NVARCHAR(180) NOT NULL,
    date         DATE          NOT NULL,
    reason       NVARCHAR(MAX) NOT NULL,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'pending',
    requested_at DATE          NOT NULL,
    actioned_by  NVARCHAR(180) NULL,
    actioned_at  DATE          NULL,
    created_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 12. leave_requests ───────────────────────────────────────────────────────
IF OBJECT_ID('hrms.leave_requests', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.leave_requests (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id  NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    emp_name     NVARCHAR(180) NOT NULL,
    leave_type   NVARCHAR(60)  NOT NULL,
    from_date    DATE          NOT NULL,
    to_date      DATE          NOT NULL,
    days         INT           NOT NULL DEFAULT 1,
    reason       NVARCHAR(MAX) NOT NULL,
    status       NVARCHAR(20)  NOT NULL DEFAULT 'pending',
    applied_date DATE          NOT NULL,
    approved_by  NVARCHAR(180) NULL,
    created_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 13. leave_balances ───────────────────────────────────────────────────────
IF OBJECT_ID('hrms.leave_balances', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.leave_balances (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20) NOT NULL REFERENCES hrms.employees(employee_id),
    leave_type  NVARCHAR(60) NOT NULL,
    total       INT          NOT NULL DEFAULT 0,
    used        INT          NOT NULL DEFAULT 0,
    color       NVARCHAR(10) NOT NULL DEFAULT '#1B45F5',
    fiscal_year NVARCHAR(10) NOT NULL,
    created_at  DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2    NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_leave_balances_emp_type_yr UNIQUE (employee_id, leave_type, fiscal_year)
  );
END
GO

-- ── 14. time_log_entries ─────────────────────────────────────────────────────
IF OBJECT_ID('hrms.time_log_entries', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.time_log_entries (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)   NOT NULL REFERENCES hrms.employees(employee_id),
    week_key    DATE           NOT NULL,
    date        DATE           NOT NULL,
    project     NVARCHAR(200)  NOT NULL,
    subtask     NVARCHAR(200)  NOT NULL,
    hours       DECIMAL(5,2)   NOT NULL,
    notes       NVARCHAR(MAX)  NULL,
    created_at  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 15. timesheets ───────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.timesheets', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.timesheets (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    week_key    DATE          NOT NULL,
    total_hours DECIMAL(6,2)  NOT NULL DEFAULT 0,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'draft',
    approved_by NVARCHAR(180) NULL,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_timesheets_emp_week UNIQUE (employee_id, week_key)
  );
END
GO

-- ── 16. documents ────────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.documents', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.documents (
    id            BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id   NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    uploaded_by   NVARCHAR(20)  NOT NULL REFERENCES hrms.employees(employee_id),
    original_name NVARCHAR(255) NOT NULL,
    stored_name   NVARCHAR(255) NOT NULL,
    file_type     NVARCHAR(80)  NULL,
    file_size     INT           NULL,
    category      NVARCHAR(60)  NOT NULL DEFAULT 'Other',
    description   NVARCHAR(MAX) NULL,
    created_at    DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 17. payroll_statutory_config ─────────────────────────────────────────────
IF OBJECT_ID('hrms.payroll_statutory_config', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.payroll_statutory_config (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    config_key  NVARCHAR(60)   NOT NULL UNIQUE,
    label       NVARCHAR(200)  NOT NULL,
    value       NVARCHAR(500)  NOT NULL,
    description NVARCHAR(500)  NULL,
    updated_by  NVARCHAR(20)   NULL REFERENCES hrms.employees(employee_id),
    updated_at  DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
  );

  INSERT INTO hrms.payroll_statutory_config (config_key, label, value, description, updated_at) VALUES
    ('pf_rate_employee',       'PF Employee Rate',                  '0.12',
     'Employee PF contribution: 12% of basic salary (capped at PF ceiling)',                          SYSUTCDATETIME()),
    ('pf_rate_employer',       'PF Employer Rate',                  '0.12',
     'Employer PF contribution: 12% of basic salary (capped at PF ceiling)',                          SYSUTCDATETIME()),
    ('pf_ceiling',             'PF Wage Ceiling (INR/month)',        '15000',
     'PF is calculated on min(basic, ceiling). Currently INR 15,000 as per EPFO.',                    SYSUTCDATETIME()),
    ('esi_rate_employee',      'ESI Employee Rate',                 '0.0075',
     'Employee ESI contribution: 0.75% of gross salary',                                              SYSUTCDATETIME()),
    ('esi_rate_employer',      'ESI Employer Rate',                 '0.0325',
     'Employer ESI contribution: 3.25% of gross salary',                                              SYSUTCDATETIME()),
    ('esi_gross_limit',        'ESI Gross Salary Limit (INR)',       '21000',
     'ESI applies only when monthly gross is at or below this limit. Currently INR 21,000.',          SYSUTCDATETIME()),
    ('pt_slab_json',           'Professional Tax Slabs (JSON)',
     '[{"min":0,"max":10000,"pt":0},{"min":10001,"max":15000,"pt":150},{"min":15001,"max":999999999,"pt":200}]',
     'Telangana/Karnataka PT schedule. Array of {min,max,pt}. Adjust for your state.',                SYSUTCDATETIME()),
    ('tds_slab_json',          'Income Tax Slabs New Regime (JSON)',
     '[{"min":0,"max":250000,"rate":0},{"min":250001,"max":500000,"rate":0.05},{"min":500001,"max":750000,"rate":0.10},{"min":750001,"max":1000000,"rate":0.15},{"min":1000001,"max":1250000,"rate":0.20},{"min":1250001,"max":1500000,"rate":0.25},{"min":1500001,"max":999999999,"rate":0.30}]',
     'New Regime income tax slabs (Section 115BAC, FY 2024-25). Array of {min,max,rate}.',            SYSUTCDATETIME()),
    ('tds_cess_rate',          'Health & Education Cess Rate',      '0.04',
     '4% cess applied on top of computed income tax.',                                                 SYSUTCDATETIME()),
    ('tds_80c_limit',          'Section 80C Limit (INR)',           '150000',
     'Maximum annual 80C deduction. PF contributions count towards this.',                             SYSUTCDATETIME()),
    ('tds_standard_deduction', 'Standard Deduction (INR)',          '50000',
     'Annual standard deduction for salaried employees under the New Regime.',                         SYSUTCDATETIME());
END
GO

-- ── Indexes ──────────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_payslips_employee_id')
  CREATE INDEX IX_payslips_employee_id ON hrms.payslips(employee_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_payslip_line_items_emp_month')
  CREATE INDEX IX_payslip_line_items_emp_month ON hrms.payslip_line_items(employee_id, payroll_month);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_attendance_emp_date')
  CREATE INDEX IX_attendance_emp_date ON hrms.attendance(employee_id, date);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_leave_requests_emp')
  CREATE INDEX IX_leave_requests_emp ON hrms.leave_requests(employee_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_time_log_entries_emp_week')
  CREATE INDEX IX_time_log_entries_emp_week ON hrms.time_log_entries(employee_id, week_key);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_email_logs_status')
  CREATE INDEX IX_email_logs_status ON hrms.email_logs(status);
GO

-- ============================================================
-- TABLES ADDED DURING DEVELOPMENT (run these if missing)
-- Schema: hrms  (matches MetaData(schema="hrms") in db.py)
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'hrms')
  EXEC('CREATE SCHEMA hrms');
GO

-- ── 18. notifications ────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.notifications', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.notifications (
    id           BIGINT IDENTITY(1,1) PRIMARY KEY,
    recipient_id NVARCHAR(20)  NOT NULL,
    type         NVARCHAR(40)  NOT NULL,
    title        NVARCHAR(200) NOT NULL,
    message      NVARCHAR(500) NOT NULL,
    ref_id       INT           NULL,
    is_read      BIT           NOT NULL DEFAULT 0,
    created_at   DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 19. goals ────────────────────────────────────────────────────────────────
IF OBJECT_ID('hrms.goals', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.goals (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)  NOT NULL,
    title       NVARCHAR(200) NOT NULL,
    target      NVARCHAR(300) NULL,
    notes       NVARCHAR(500) NULL,
    is_key      BIT           NOT NULL DEFAULT 0,
    progress    INT           NOT NULL DEFAULT 0,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'on-track',
    quarter     NVARCHAR(10)  NOT NULL,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 20. performance_reviews ──────────────────────────────────────────────────
IF OBJECT_ID('hrms.performance_reviews', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.performance_reviews (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)  NOT NULL,
    reviewer_id NVARCHAR(20)  NULL,
    period      NVARCHAR(40)  NOT NULL,
    score       FLOAT         NULL,
    feedback    NVARCHAR(MAX) NULL,
    status      NVARCHAR(20)  NOT NULL DEFAULT 'pending',
    review_date DATE          NULL,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── 21. employee_skills ──────────────────────────────────────────────────────
-- Defined in schema but no longer used by the app (Skills tab was removed).
-- Create it anyway to keep the schema in sync with db.py.
IF OBJECT_ID('hrms.employee_skills', 'U') IS NULL
BEGIN
  CREATE TABLE hrms.employee_skills (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20)  NOT NULL,
    skill_name  NVARCHAR(100) NOT NULL,
    score       FLOAT         NOT NULL,
    updated_by  NVARCHAR(20)  NULL,
    updated_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- ── Indexes for new tables ───────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notifications_recipient')
  CREATE INDEX IX_notifications_recipient ON hrms.notifications(recipient_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_goals_employee_quarter')
  CREATE INDEX IX_goals_employee_quarter ON hrms.goals(employee_id, quarter);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_perf_reviews_employee')
  CREATE INDEX IX_perf_reviews_employee ON hrms.performance_reviews(employee_id);
GO

-- ============================================================
-- MIGRATION — run this if your employees table already exists
-- (created from an older version of this file).
-- Adds the must_change_password column that the app requires.
-- Safe to re-run — the IF NOT EXISTS guard prevents duplicates.
-- ============================================================
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'hrms' AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'must_change_password'
)
BEGIN
  ALTER TABLE hrms.employees
    ADD must_change_password BIT NOT NULL DEFAULT 1;
  PRINT 'Column must_change_password added to hrms.employees';
END
GO