USE DOLOXEHRMS;
GO

IF OBJECT_ID('dbo.employees', 'U') IS NULL
BEGIN
  THROW 50001, 'Tables are missing. Run backend/mssql_schema.sql first, then run backend/mssql_sample_data.sql.', 1;
END
GO

-- Sample employees for all payroll access cases:
-- CEO and CTO can run payroll only for themselves.
-- Finance operators can manage payroll for everyone.
-- Other employees can view/download/send only their own payslip.

MERGE dbo.employees AS target
USING (VALUES
  ('EMP-0001','Arjun','Mehta','Arjun Suresh Mehta','Leadership','CEO','arjun.mehta@doloxe.com','+91 98100 00001','Bengaluru','2016-01-15','AABCM1111A','100000000001','KA/BN/0000001/000/0000001','00000000000000001','HDFC Bank','XXXX XXXX 0001','HDFC0000001',120.00,4,0,1),
  ('EMP-0100','Priya','Nair','Priya Venkat Nair','Engineering','CTO / VP Engineering','priya.nair@doloxe.com','+91 98200 00100','Bengaluru','2017-04-01','AABCN2222B','100000000100','KA/BN/0000100/000/0000001','00000000000000100','HDFC Bank','XXXX XXXX 0100','HDFC0000100',90.00,3,0,1),
  ('EMP-0300','Vikash','Agarwal','Vikash Prasad Agarwal','Finance','Finance Director','vikash.agarwal@doloxe.com','+91 98200 00300','Mumbai','2017-10-01','AABCA9911C','100000000300','MH/MU/0000300/000/0000001','00000000000000300','HDFC Bank','XXXX XXXX 0300','HDFC0000300',70.00,3,1,1),
  ('EMP-0310','Kavitha','Reddy','Kavitha Suresh Reddy','Finance','Finance Manager','kavitha.reddy@doloxe.com','+91 98300 00310','Mumbai','2019-11-11','AABCR0022D','100000000310','MH/MU/0000310/000/0000001','00000000000000310','HDFC Bank','XXXX XXXX 0310','HDFC0000310',30.00,2,1,1),
  ('EMP-0311','Manoj','Sharma','Manoj Lal Sharma','Finance','Accountant','manoj.sharma@doloxe.com','+91 99100 00311','Mumbai','2021-05-17','AABCS1133E','100000000311','MH/MU/0000311/000/0000001','00000000000000311','HDFC Bank','XXXX XXXX 0311','HDFC0000311',10.00,1,1,1),
  ('EMP-0210','Sudhir','Rao','Sudhir Balaji Rao','HR','HR Manager','sudhir.rao@doloxe.com','+91 98300 00210','Bengaluru','2020-01-06','AABCR3355W','100000000210','KA/BN/0000210/000/0000001','00000000000000210','HDFC Bank','XXXX XXXX 0210','HDFC0000210',28.00,2,0,1),
  ('EMP-0121','Vikram','Sharma','Vikram Anand Sharma','Engineering','Senior Software Engineer','vikram.sharma@doloxe.com','+91 98500 00121','Bengaluru','2021-01-10','AABCS5555E','100000000121','KA/BN/0000121/000/0000001','00000000000000121','HDFC Bank','XXXX XXXX 0121','HDFC0000121',22.00,1,0,1),
  ('EMP-0124','Meena','Iyer','Meena Rajan Iyer','Engineering','Junior Software Engineer','meena.iyer@doloxe.com','+91 98500 00124','Bengaluru','2023-08-01','AABCI8888H','100000000124','KA/BN/0000124/000/0000001','00000000000000124','HDFC Bank','XXXX XXXX 0124','HDFC0000124',8.00,1,0,1),
  ('EMP-0400','Meghna','Verma','Meghna Ashok Verma','Product','Product Manager','meghna.verma@doloxe.com','+91 98200 00400','Bengaluru','2018-03-12','AABCV6688J','100000000400','KA/BN/0000400/000/0000001','00000000000000400','HDFC Bank','XXXX XXXX 0400','HDFC0000400',60.00,3,0,1)
) AS source (
  employee_id, first_name, last_name, full_name, department, designation, email, phone,
  location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
  ifsc, annual_ctc_lpa, access_level, is_finance_operator, is_active
)
ON target.employee_id = source.employee_id
WHEN MATCHED THEN
  UPDATE SET
    first_name = source.first_name,
    last_name = source.last_name,
    full_name = source.full_name,
    department = source.department,
    designation = source.designation,
    email = source.email,
    phone = source.phone,
    location = source.location,
    date_of_joining = source.date_of_joining,
    pan = source.pan,
    uan = source.uan,
    pf_account = source.pf_account,
    esic = source.esic,
    bank_name = source.bank_name,
    bank_account_no = source.bank_account_no,
    ifsc = source.ifsc,
    annual_ctc_lpa = source.annual_ctc_lpa,
    access_level = source.access_level,
    is_finance_operator = source.is_finance_operator,
    is_active = source.is_active,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (
    employee_id, first_name, last_name, full_name, department, designation, email, phone,
    location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
    ifsc, annual_ctc_lpa, access_level, is_finance_operator, is_active
  )
  VALUES (
    source.employee_id, source.first_name, source.last_name, source.full_name, source.department,
    source.designation, source.email, source.phone, source.location, source.date_of_joining,
    source.pan, source.uan, source.pf_account, source.esic, source.bank_name,
    source.bank_account_no, source.ifsc, source.annual_ctc_lpa, source.access_level,
    source.is_finance_operator, source.is_active
  );
GO

MERGE dbo.payroll_runs AS target
USING (VALUES
  (CAST('2025-04-01' AS DATE), 'paid', CAST('2025-04-30' AS DATE), 'Bank Transfer', 'New Regime', 'April 2025 payroll closed', 'EMP-0300', SYSUTCDATETIME()),
  (CAST('2025-05-01' AS DATE), 'approved', CAST('2025-05-30' AS DATE), 'Bank Transfer', 'New Regime', 'May 2025 payroll approved for bank upload', 'EMP-0310', SYSUTCDATETIME())
) AS source (payroll_month, status, pay_date, payment_mode, tax_regime, remarks, processed_by, processed_at)
ON target.payroll_month = source.payroll_month
WHEN MATCHED THEN
  UPDATE SET
    status = source.status,
    pay_date = source.pay_date,
    payment_mode = source.payment_mode,
    tax_regime = source.tax_regime,
    remarks = source.remarks,
    processed_by = source.processed_by,
    processed_at = source.processed_at,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (payroll_month, status, pay_date, payment_mode, tax_regime, remarks, processed_by, processed_at)
  VALUES (source.payroll_month, source.status, source.pay_date, source.payment_mode, source.tax_regime, source.remarks, source.processed_by, source.processed_at);
GO

DECLARE @aprilRunId BIGINT = (SELECT id FROM dbo.payroll_runs WHERE payroll_month = '2025-04-01');

MERGE dbo.payslips AS target
USING (VALUES
  (@aprilRunId,'EMP-0001',26,26,0,0,1000000.00,182000.00,0.00,182000.00,818000.00,1800.00,0.00,1001800.00,10800000.00,2618200.00,218183.00,0,'paid'),
  (@aprilRunId,'EMP-0100',26,26,0,0,750000.00,132000.00,0.00,132000.00,618000.00,1800.00,0.00,751800.00,7800000.00,1741600.00,145133.00,0,'paid'),
  (@aprilRunId,'EMP-0300',26,26,0,0,583333.00,94500.00,0.00,94500.00,488833.00,1800.00,0.00,585133.00,5800000.00,1170000.00,97500.00,0,'paid'),
  (@aprilRunId,'EMP-0310',26,25,1,4,247900.00,27900.00,0.00,27900.00,220000.00,1800.00,0.00,249700.00,2474800.00,405600.00,33800.00,0,'paid'),
  (@aprilRunId,'EMP-0311',26,26,0,0,83333.00,4700.00,0.00,4700.00,78633.00,1800.00,0.00,85133.00,860000.00,32400.00,2700.00,0,'paid'),
  (@aprilRunId,'EMP-0210',26,26,0,0,233333.00,24800.00,0.00,24800.00,208533.00,1800.00,0.00,235133.00,2300000.00,276000.00,23000.00,0,'paid'),
  (@aprilRunId,'EMP-0121',26,26,0,0,183333.00,16600.00,0.00,16600.00,166733.00,1800.00,0.00,185133.00,1700000.00,168000.00,14000.00,0,'paid'),
  (@aprilRunId,'EMP-0124',26,26,0,0,66667.00,3800.00,0.00,3800.00,62867.00,1800.00,0.00,68467.00,720000.00,0.00,0.00,0,'paid'),
  (@aprilRunId,'EMP-0400',26,26,0,0,500000.00,77000.00,0.00,77000.00,423000.00,1800.00,0.00,501800.00,4800000.00,858000.00,71500.00,0,'paid')
) AS source (
  payroll_run_id, employee_id, total_work_days, payable_days, lop_days, overtime_hours,
  gross_earnings, total_statutory_deductions, total_voluntary_deductions, total_deductions,
  net_pay, employer_pf, employer_esi, ctc_actual, annual_taxable_income, annual_tax,
  monthly_tds, salary_hold, status
)
ON target.payroll_run_id = source.payroll_run_id AND target.employee_id = source.employee_id
WHEN MATCHED THEN
  UPDATE SET
    total_work_days = source.total_work_days,
    payable_days = source.payable_days,
    lop_days = source.lop_days,
    overtime_hours = source.overtime_hours,
    gross_earnings = source.gross_earnings,
    total_statutory_deductions = source.total_statutory_deductions,
    total_voluntary_deductions = source.total_voluntary_deductions,
    total_deductions = source.total_deductions,
    net_pay = source.net_pay,
    employer_pf = source.employer_pf,
    employer_esi = source.employer_esi,
    ctc_actual = source.ctc_actual,
    annual_taxable_income = source.annual_taxable_income,
    annual_tax = source.annual_tax,
    monthly_tds = source.monthly_tds,
    salary_hold = source.salary_hold,
    status = source.status,
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (
    payroll_run_id, employee_id, total_work_days, payable_days, lop_days, overtime_hours,
    gross_earnings, total_statutory_deductions, total_voluntary_deductions, total_deductions,
    net_pay, employer_pf, employer_esi, ctc_actual, annual_taxable_income, annual_tax,
    monthly_tds, salary_hold, status
  )
  VALUES (
    source.payroll_run_id, source.employee_id, source.total_work_days, source.payable_days,
    source.lop_days, source.overtime_hours, source.gross_earnings, source.total_statutory_deductions,
    source.total_voluntary_deductions, source.total_deductions, source.net_pay, source.employer_pf,
    source.employer_esi, source.ctc_actual, source.annual_taxable_income, source.annual_tax,
    source.monthly_tds, source.salary_hold, source.status
  );
GO

DELETE FROM dbo.payslip_earnings
WHERE payslip_id IN (
  SELECT p.id FROM dbo.payslips p
  JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
  WHERE r.payroll_month = '2025-04-01'
);

INSERT INTO dbo.payslip_earnings (payslip_id, label, earning_type, amount, sort_order)
SELECT p.id, e.label, e.earning_type, ROUND(p.gross_earnings * e.factor, 2), e.sort_order
FROM dbo.payslips p
JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
CROSS JOIN (VALUES
  ('Basic Salary','fixed',0.40,1),
  ('HRA','fixed',0.20,2),
  ('Leave Travel Allowance','fixed',0.05,3),
  ('Transport Allowance','fixed',0.02,4),
  ('Special Allowance','fixed',0.33,5)
) AS e(label, earning_type, factor, sort_order)
WHERE r.payroll_month = '2025-04-01';
GO

DELETE FROM dbo.payslip_deductions
WHERE payslip_id IN (
  SELECT p.id FROM dbo.payslips p
  JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
  WHERE r.payroll_month = '2025-04-01'
);

INSERT INTO dbo.payslip_deductions (payslip_id, label, deduction_type, code, amount, sort_order)
SELECT p.id, 'Provident Fund (12%)', 'statutory', 'PF', 1800.00, 1
FROM dbo.payslips p
JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
WHERE r.payroll_month = '2025-04-01';

INSERT INTO dbo.payslip_deductions (payslip_id, label, deduction_type, code, amount, sort_order)
SELECT p.id, 'Professional Tax', 'statutory', 'PT', 200.00, 2
FROM dbo.payslips p
JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
WHERE r.payroll_month = '2025-04-01';

INSERT INTO dbo.payslip_deductions (payslip_id, label, deduction_type, code, amount, sort_order)
SELECT p.id, 'Income Tax (TDS)', 'statutory', 'TDS', p.monthly_tds, 3
FROM dbo.payslips p
JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
WHERE r.payroll_month = '2025-04-01' AND p.monthly_tds > 0;
GO

IF NOT EXISTS (
  SELECT 1 FROM dbo.payroll_adjustments
  WHERE employee_id = 'EMP-0310' AND adjustment_type = 'Overtime Pay'
)
INSERT INTO dbo.payroll_adjustments (
  employee_id, payroll_run_id, adjustment_type, amount, taxable, notes, created_by
)
VALUES (
  'EMP-0310',
  (SELECT id FROM dbo.payroll_runs WHERE payroll_month = '2025-04-01'),
  'Overtime Pay',
  3900.00,
  1,
  'Four approved overtime hours for April payroll',
  'EMP-0300'
);
GO

IF NOT EXISTS (
  SELECT 1 FROM dbo.email_logs
  WHERE recipient_email = 'vikram.sharma@doloxe.com'
    AND subject = 'Your Pay Slip for April 2025 - DOLOXE'
)
INSERT INTO dbo.email_logs (
  payslip_id, recipient_email, subject, body, attachment_filename, status, provider_message_id, sent_at
)
SELECT
  p.id,
  'vikram.sharma@doloxe.com',
  'Your Pay Slip for April 2025 - DOLOXE',
  'Sample sent payslip email log for April 2025.',
  'Payslip_EMP-0121_April_2025.pdf',
  'sent',
  'sample-provider-message-id',
  SYSUTCDATETIME()
FROM dbo.payslips p
JOIN dbo.payroll_runs r ON r.id = p.payroll_run_id
WHERE r.payroll_month = '2025-04-01' AND p.employee_id = 'EMP-0121';
GO

SELECT 'employees' AS table_name, COUNT(*) AS total_rows FROM dbo.employees
UNION ALL SELECT 'payroll_runs', COUNT(*) FROM dbo.payroll_runs
UNION ALL SELECT 'payslips', COUNT(*) FROM dbo.payslips
UNION ALL SELECT 'payslip_earnings', COUNT(*) FROM dbo.payslip_earnings
UNION ALL SELECT 'payslip_deductions', COUNT(*) FROM dbo.payslip_deductions
UNION ALL SELECT 'payroll_adjustments', COUNT(*) FROM dbo.payroll_adjustments
UNION ALL SELECT 'email_logs', COUNT(*) FROM dbo.email_logs;
GO
