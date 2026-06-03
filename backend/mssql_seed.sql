IF NOT EXISTS (SELECT 1 FROM dbo.employees WHERE employee_id = 'EMP-0001')
INSERT INTO dbo.employees (
  employee_id, first_name, last_name, full_name, department, designation, email,
  location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
  ifsc, annual_ctc_lpa, access_level, is_finance_operator
) VALUES (
  'EMP-0001', 'Arjun', 'Mehta', 'Arjun Suresh Mehta', 'Leadership', 'CEO',
  'arjun.mehta@doloxe.com', 'Bengaluru', '2016-01-15', 'AABCM1111A', '100000000001',
  'KA/BN/0000001/000/0000001', '00000000000000001', 'HDFC Bank', 'XXXX XXXX 0001',
  'HDFC0000001', 120, 4, 0
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.employees WHERE employee_id = 'EMP-0100')
INSERT INTO dbo.employees (
  employee_id, first_name, last_name, full_name, department, designation, email,
  location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
  ifsc, annual_ctc_lpa, access_level, is_finance_operator
) VALUES (
  'EMP-0100', 'Priya', 'Nair', 'Priya Venkat Nair', 'Engineering', 'CTO / VP Engineering',
  'priya.nair@doloxe.com', 'Bengaluru', '2017-04-01', 'AABCN2222B', '100000000100',
  'KA/BN/0000100/000/0000001', '00000000000000100', 'HDFC Bank', 'XXXX XXXX 0100',
  'HDFC0000100', 90, 3, 0
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.employees WHERE employee_id = 'EMP-0300')
INSERT INTO dbo.employees (
  employee_id, first_name, last_name, full_name, department, designation, email,
  location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
  ifsc, annual_ctc_lpa, access_level, is_finance_operator
) VALUES (
  'EMP-0300', 'Vikash', 'Agarwal', 'Vikash Prasad Agarwal', 'Finance', 'Finance Director',
  'vikash.agarwal@doloxe.com', 'Mumbai', '2017-10-01', 'AABCA9911C', '100000000300',
  'MH/MU/0000300/000/0000001', '00000000000000300', 'HDFC Bank', 'XXXX XXXX 0300',
  'HDFC0000300', 70, 3, 1
);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.employees WHERE employee_id = 'EMP-0310')
INSERT INTO dbo.employees (
  employee_id, first_name, last_name, full_name, department, designation, email,
  location, date_of_joining, pan, uan, pf_account, esic, bank_name, bank_account_no,
  ifsc, annual_ctc_lpa, access_level, is_finance_operator
) VALUES (
  'EMP-0310', 'Kavitha', 'Reddy', 'Kavitha Suresh Reddy', 'Finance', 'Finance Manager',
  'kavitha.reddy@doloxe.com', 'Mumbai', '2019-11-11', 'AABCR0022D', '100000000310',
  'MH/MU/0000310/000/0000001', '00000000000000310', 'HDFC Bank', 'XXXX XXXX 0310',
  'HDFC0000310', 30, 2, 1
);
GO
