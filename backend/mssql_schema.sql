IF DB_ID(N'DOLOXEHRMS') IS NULL
BEGIN
  CREATE DATABASE DOLOXEHRMS;
END
GO

USE DOLOXEHRMS;
GO

IF OBJECT_ID('dbo.email_logs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.email_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payslip_id BIGINT NULL,
    recipient_email NVARCHAR(180) NOT NULL,
    subject NVARCHAR(300) NOT NULL,
    body NVARCHAR(MAX) NOT NULL,
    attachment_filename NVARCHAR(255) NULL,
    status NVARCHAR(30) NOT NULL CONSTRAINT DF_email_logs_status DEFAULT 'queued',
    provider_message_id NVARCHAR(500) NULL,
    error_message NVARCHAR(2000) NULL,
    sent_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_email_logs_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_email_logs_updated_at DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.employees (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20) NOT NULL UNIQUE,
    first_name NVARCHAR(80) NOT NULL,
    last_name NVARCHAR(80) NOT NULL,
    full_name NVARCHAR(180) NOT NULL,
    department NVARCHAR(80) NOT NULL,
    designation NVARCHAR(120) NOT NULL,
    email NVARCHAR(180) NOT NULL UNIQUE,
    phone NVARCHAR(40) NULL,
    location NVARCHAR(80) NULL,
    date_of_joining DATE NULL,
    pan NVARCHAR(20) NULL,
    uan NVARCHAR(30) NULL,
    pf_account NVARCHAR(80) NULL,
    esic NVARCHAR(40) NULL,
    bank_name NVARCHAR(120) NULL,
    bank_account_no NVARCHAR(80) NULL,
    ifsc NVARCHAR(20) NULL,
    annual_ctc_lpa DECIMAL(12,2) NOT NULL CONSTRAINT DF_employees_ctc DEFAULT 0,
    access_level INT NOT NULL CONSTRAINT DF_employees_access DEFAULT 1,
    is_finance_operator BIT NOT NULL CONSTRAINT DF_employees_finance DEFAULT 0,
    is_active BIT NOT NULL CONSTRAINT DF_employees_active DEFAULT 1,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_employees_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_employees_updated_at DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.payroll_runs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payroll_runs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payroll_month DATE NOT NULL UNIQUE,
    status NVARCHAR(30) NOT NULL CONSTRAINT DF_payroll_runs_status DEFAULT 'draft',
    pay_date DATE NULL,
    payment_mode NVARCHAR(40) NOT NULL CONSTRAINT DF_payroll_runs_payment_mode DEFAULT 'Bank Transfer',
    tax_regime NVARCHAR(40) NOT NULL CONSTRAINT DF_payroll_runs_tax_regime DEFAULT 'New Regime',
    remarks NVARCHAR(MAX) NULL,
    processed_by NVARCHAR(20) NULL,
    processed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_payroll_runs_created_at DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_payroll_runs_updated_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_payroll_runs_processed_by FOREIGN KEY (processed_by) REFERENCES dbo.employees(employee_id)
  );
END
GO

IF OBJECT_ID('dbo.payslips', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payslips (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payroll_run_id BIGINT NOT NULL,
    employee_id NVARCHAR(20) NOT NULL,
    total_work_days DECIMAL(5,2) NOT NULL DEFAULT 26,
    payable_days DECIMAL(5,2) NOT NULL DEFAULT 26,
    lop_days DECIMAL(5,2) NOT NULL DEFAULT 0,
    overtime_hours DECIMAL(7,2) NOT NULL DEFAULT 0,
    gross_earnings DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_statutory_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_voluntary_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_deductions DECIMAL(14,2) NOT NULL DEFAULT 0,
    net_pay DECIMAL(14,2) NOT NULL DEFAULT 0,
    employer_pf DECIMAL(14,2) NOT NULL DEFAULT 0,
    employer_esi DECIMAL(14,2) NOT NULL DEFAULT 0,
    ctc_actual DECIMAL(14,2) NOT NULL DEFAULT 0,
    annual_taxable_income DECIMAL(14,2) NOT NULL DEFAULT 0,
    annual_tax DECIMAL(14,2) NOT NULL DEFAULT 0,
    monthly_tds DECIMAL(14,2) NOT NULL DEFAULT 0,
    salary_hold BIT NOT NULL DEFAULT 0,
    status NVARCHAR(30) NOT NULL DEFAULT 'draft',
    pdf_storage_url NVARCHAR(1000) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_payslips_run FOREIGN KEY (payroll_run_id) REFERENCES dbo.payroll_runs(id) ON DELETE CASCADE,
    CONSTRAINT FK_payslips_employee FOREIGN KEY (employee_id) REFERENCES dbo.employees(employee_id),
    CONSTRAINT UQ_payslips_run_employee UNIQUE (payroll_run_id, employee_id)
  );
END
GO

IF OBJECT_ID('dbo.payslip_earnings', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payslip_earnings (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payslip_id BIGINT NOT NULL,
    label NVARCHAR(120) NOT NULL,
    earning_type NVARCHAR(40) NOT NULL DEFAULT 'fixed',
    amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_payslip_earnings_payslip FOREIGN KEY (payslip_id) REFERENCES dbo.payslips(id) ON DELETE CASCADE
  );
END
GO

IF OBJECT_ID('dbo.payslip_deductions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payslip_deductions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    payslip_id BIGINT NOT NULL,
    label NVARCHAR(120) NOT NULL,
    deduction_type NVARCHAR(40) NOT NULL DEFAULT 'statutory',
    code NVARCHAR(30) NULL,
    amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_payslip_deductions_payslip FOREIGN KEY (payslip_id) REFERENCES dbo.payslips(id) ON DELETE CASCADE
  );
END
GO

IF OBJECT_ID('dbo.payroll_adjustments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.payroll_adjustments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id NVARCHAR(20) NOT NULL,
    payroll_run_id BIGINT NULL,
    adjustment_type NVARCHAR(60) NOT NULL,
    amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    taxable BIT NOT NULL DEFAULT 1,
    notes NVARCHAR(MAX) NULL,
    created_by NVARCHAR(20) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_payroll_adjustments_employee FOREIGN KEY (employee_id) REFERENCES dbo.employees(employee_id),
    CONSTRAINT FK_payroll_adjustments_run FOREIGN KEY (payroll_run_id) REFERENCES dbo.payroll_runs(id) ON DELETE CASCADE,
    CONSTRAINT FK_payroll_adjustments_created_by FOREIGN KEY (created_by) REFERENCES dbo.employees(employee_id)
  );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_payslips_employee_id')
  CREATE INDEX IX_payslips_employee_id ON dbo.payslips(employee_id);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_email_logs_status')
  CREATE INDEX IX_email_logs_status ON dbo.email_logs(status);
GO
