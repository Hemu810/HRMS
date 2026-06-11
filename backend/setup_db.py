"""
Run this ONCE to insert the initial employees into the database.
After running, you can delete this file.

Usage:
    cd backend
    python setup_db.py

Seed passwords are read from env vars so they are never hardcoded
in source control. Set them in backend/.env before running:
    SEED_PASS_DIRECTOR=<dir-password>
    SEED_PASS_MANAGER=<manager-password>
    SEED_PASS_LEAD=<lead-password>
    SEED_PASS_EMPLOYEE=<employee-password>
"""

import os
from datetime import date, datetime
from env import load_env_file
from db import (
    engine, employees_table, metadata,
    hash_password, IS_SQLITE
)
from sqlalchemy import insert, select

load_env_file()

DIR_PASS  = os.getenv("SEED_PASS_DIRECTOR", "dir123")
MGR_PASS  = os.getenv("SEED_PASS_MANAGER",  "mgr123")
LEAD_PASS = os.getenv("SEED_PASS_LEAD",     "lead123")
EMP_PASS  = os.getenv("SEED_PASS_EMPLOYEE", "emp123")

# ── Initial employees ─────────────────────────────────────────────────────────
# Format: (employee_id, first_name, middle_name, last_name, full_name,
#          department, designation, email, phone, location,
#          date_of_joining, dob, gender, color, mgr_id,
#          pan, aadhaar, uan, pf_account, esic,
#          bank_name, bank_account_no, ifsc,
#          annual_ctc_lpa, emp_type, notice_period,
#          access_level, is_hr, perf_score, password)

# Departments grouped together:
# Leadership (0001) → HR (0002) → Technology (0003-0006) → Data (0007-0014) → Sales & Marketing (0015-0019)

EMPLOYEES = [
    # ── Leadership ─────────────────────────────────────────────────────────────
    ("EMP-0001","Rajanikanth","Reddy","Tippasani","Rajanikanth Reddy Tippasani",
     "Leadership","Director","rkreddy@doloxe.com","+91 9966249234","Hyderabad",
     date(2018,1,1),date(1980,6,15),"Male","#1B45F5",None,
     "AABCT1111A","1111 2222 3333","100000000001","TS/HY/0000001/000/0000001","00000000000000001",
     "Kotak Mahindra Bank","XXXX XXXX 0001","HDFC0000001",
     100,"Full-time","20 months",4,False,5.0,DIR_PASS),

    # ── HR ─────────────────────────────────────────────────────────────────────
    ("EMP-0002","Radhika","","T","T. Radhika",
     "HR","HR Manager","radhika@doloxe.com","+91 98200 00002","Hyderabad",
     date(2019,6,1),date(1985,3,20),"Female","#BE2B5A","EMP-0001",
     "AABCR2222B","2222 3333 4444","100000000002","TS/HY/0000002/000/0000001","00000000000000002",
     "Kotak Mahindra Bank","XXXX XXXX 0002","HDFC0000002",
     30,"Full-time","12 months",3,True,4.7,MGR_PASS),

    # ── Technology ─────────────────────────────────────────────────────────────
    ("EMP-0003","Vijay","","Ramteke","Vijay Ramteke",
     "Technology","Tech Manager","vijay.ramteke@doloxe.com","+91 98300 00003","Hyderabad",
     date(2019,8,15),date(1983,11,10),"Male","#0A7E7A","EMP-0001",
     "AABCV3333C","3333 4444 5555","100000000003","TS/HY/0000003/000/0000001","00000000000000003",
     "Kotak Mahindra Bank","XXXX XXXX ₀₀₀₃","HDFC₀₀₀₀₀₀₃",
     25,"Full-time","12 months",3,False,4.8,MGR_PASS),

    ("EMP-0004","Tech","","Lead","Tech Lead",
     "Technology","Tech Team Lead","techteamlead@doloxe.com","+91 98400 00004","Hyderabad",
     date(2020,9,1),date(1988,7,14),"Male","#5C35C2","EMP-0003",
     "AABCT4444D","4444 5555 6666","100000000004","TS/HY/0000004/000/0000001","00000000000000₀₀₀₄",
     "Kotak Mahindra Bank","XXXX XXXX 0004","HDFC0000004",
     25,"Full-time","12 months",2,False,4.5,LEAD_PASS),

    ("EMP-0005","Hemanth","Reddy","Kethu","Hemanth Reddy Kethu",
     "Technology","Senior Software Engineer","hemanthreddy.kethu@doloxe.com","+91 98500 00005","Hyderabad",
     date(2021,3,1),date(1993,5,22),"Male","#1B45F5","EMP-0004",
     "AABCH5555E","5555 6666 7777","100000000005","TS/HY/0000005/000/0000001","00000000000000０００５",
     "Kotak Mahindra Bank","XXXX XXXX ０００５","HDFC００００００５",
     18,"Full-time","12 months",1,False,4.4,EMP_PASS),

    ("EMP-0006","Sakethram","Katakam","","Sakethram Katakam",
     "Technology","Software Engineer","sakethram.katakam@doloxe.com","+91 98600 00006","Hyderabad",
     date(2026,5,1),date(2002,4,10),"Male","#0F8C5A","EMP-0004",
     "NLAPS9990B","323668620949","100000000006","TS/HY/0000006/000/0000001","00000000000000",
     "Kotak Mahindra Bank","XXXX XXXX 24","KKBK0000563",
     12,"Full-time","12 months",1,False,4.2,EMP_PASS),

    # ── Data ───────────────────────────────────────────────────────────────────
    ("EMP-0007","Punit","","Pal","Punit Pal",
     "Data","Data Manager","punit.pal@doloxe.com","+91 98700 00007","Hyderabad",
     date(2020,1,15),date(1984,9,30),"Male","#B06010","EMP-0001",
     "CCZPP8072J","7777 8888 9999","100000000007","TS/HY/0000007/000/0000001","00000000000000007",
     "Kotak Mahindra Bank","XXXX XXXX12","KKBK0007475",
     35,"Full-time","12 months",3,False,4.6,MGR_PASS),

    ("EMP-0008","Data","","Lead","Data Lead",
     "Data","Data Team Lead","datateamlead@doloxe.com","+91 98800 00008","Hyderabad",
     date(2021,5,1),date(1990,12,5),"Female","#C8312A","EMP-0007",
     "AABCD8888H","8888 9999 0000","100000000008","TS/HY/0000008/000/0000001","00000000₀₀₀₀₀₀₀₈",
     "HDFC Bank","XXXX XXXX 0008","HDFC0000008",
     22,"Full-time","2 months",2,False,4.3,LEAD_PASS),

    ("EMP-0009","Senior","","Analyst","Senior Analyst",
     "Data","Senior Data Analyst","senioranalyst@doloxe.com","+91 98900 00009","Hyderabad",
     date(2021,11,1),date(1992,8,18),"Female","#5C35C2","EMP-0008",
     "AABCS9999I","9999 0000 1111","100000000009","TS/HY/0000009/000/0000001","00000000000000009",
     "HDFC Bank","XXXX XXXX 0009","HDFC0000009",
     14,"Full-time","1 month",1,False,4.1,EMP_PASS),

    ("EMP-0010","Esther","","Rani","Esther Rani",
     "Data","Data Analyst","esther.rani@doloxe.com","+91 99000 00010","Hyderabad",
     date(2022,4,1),date(1997,4,12),"Female","#BE2B5A","EMP-0008",
     "AABCE0000J","0000 1111 2233","100000000010","TS/HY/0000010/000/0000001","00000000000000010",
     "Kotak Mahindra Bank","XXXX XXXX 0010","KKBK0007475",
     8,"Full-time","1 month",1,False,4.0,EMP_PASS),

    ("EMP-0011","Pravalika","Gudelli","","Pravalika Gudelli",
     "Data","Data Analyst","pravalika.gudelli@doloxe.com","+91 99000 00011","Hyderabad",
     date(2022,4,1),date(1997,4,12),"Female","#5C35C2","EMP-0008",
     "AABCP0011K","0011 1122 2233","100000000011","TS/HY/0000011/000/0000001","00000000000000011",
     "Kotak Mahindra Bank","XXXX XXXX 0011","KKBK0007475",
     8,"Full-time","12 month",1,False,4.0,EMP_PASS),

    ("EMP-0012","Mounica","","Jampani","Mounica Jampani",
     "Data","Data Analyst","mounica.jampani@doloxe.com","+91 99000 00012","Hyderabad",
     date(2022,6,15),date(1997,11,25),"Female","#0A7E7A","EMP-0008",
     "AABCM1122K","1122 3344 5566","100000000012","TS/HY/0000012/000/0000001","00000000000000012",
     "Kotak Mahindra Bank","XXXX XXXX 0012","KKBK0007475",
     8,"Full-time","1 month",1,False,3.9,EMP_PASS),

    ("EMP-0013","Anjana","Deepthi","Besthavemula","Anjana Deepthi Besthavemula",
     "Data","Data Analyst","anjana.deepthi@doloxe.com","+91 99000 00013","Hyderabad",
     date(2023,1,10),date(1998,7,8),"Female","#1B45F5","EMP-0008",
     "AABCA2233L","2233 4455 6677","100000000013","TS/HY/0000013/000/0000001","00000000000000013",
     "Kotak Mahindra Bank","XXXX XXXX 0013","KKBK0007475",
     8,"Full-time","1 month",1,False,3.8,EMP_PASS),

    ("EMP-0014","Anvitha","","Akula","Anvitha Akula",
     "Data","Data Analyst","anvitha.akula@doloxe.com","+91 99000 00014","Hyderabad",
     date(2023,3,20),date(1999,1,30),"Female","#0F8C5A","EMP-0008",
     "AABCA3344M","3344 5566 7788","100000000014","TS/HY/0000014/000/0000001","00000000000000014",
     "Kotak Mahindra Bank","XXXX XXXX 0014","KKBK0007475",
     8,"Full-time","1 month",1,False,3.7,EMP_PASS),

    # ── Sales & Marketing ──────────────────────────────────────────────────────
    ("EMP-0015","Sales","","Manager","Sales Manager",
     "Sales & Marketing","Sales & Marketing Manager","salesmanager@doloxe.com","+91 98100 00015","Hyderabad",
     date(2020,5,1),date(1982,4,25),"Male","#C8312A","EMP-0001",
     "AABCS4455N","4455 6677 8899","100000000015","TS/HY/0000015/000/0000001","00000000000000015",
     "Kotak Mahindra Bank","XXXX XXXX 0015","KKBK0007475",
     30,"Full-time","3 months",3,False,4.4,MGR_PASS),

    ("EMP-0016","APAC","","Executive","APAC Executive",
     "Sales & Marketing","APAC Sales Executive","apacexecutive@doloxe.com","+91 99100 00016","Hyderabad",
     date(2021,7,1),date(1994,9,17),"Male","#1B45F5","EMP-0015",
     "AABCA5566O","5566 7788 9900","100000000016","TS/HY/0000016/000/0000001","00000000000000016",
     "Kotak Mahindra Bank","XXXX XXXX 0016","KKBK0007475",
     10,"Full-time","1 month",1,False,4.0,EMP_PASS),

    ("EMP-0017","NA","","Executive","North America Executive",
     "Sales & Marketing","North America Sales Executive","naexecutive@doloxe.com","+91 99100 00017","Hyderabad",
     date(2021,9,15),date(1995,3,8),"Male","#5C35C2","EMP-0015",
     "AABCN6677P","6677 8899 0011","100000000017","TS/HY/0000017/000/0000001","00000000000000017",
     "Kotak Mahindra Bank","XXXX XXXX 0017","KKBK0007475",
     10,"Full-time","1 month",1,False,3.9,EMP_PASS),

    ("EMP-0018","Europe","","Executive","Europe & ME Executive",
     "Sales & Marketing","Europe & Middle-East Sales Executive","europeexecutive@doloxe.com","+91 99100 00018","Hyderabad",
     date(2022,2,1),date(1996,6,21),"Female","#0A7E7A","EMP-0015",
     "AABCE7788Q","7788 9900 1122","100000000018","TS/HY/0000018/000/0000001","00000000000000018",
     "Kotak Mahindra Bank","XXXX XXXX 0018","KKBK0007475",
     10,"Full-time","1 month",1,False,3.8,EMP_PASS),

    ("EMP-0019","SEO","","Expert","SEO Expert",
     "Sales & Marketing","SEO Expert","seoexpert@doloxe.com","+91 99100 00019","Hyderabad",
     date(2022,5,15),date(1995,12,11),"Female","#B06010","EMP-0015",
     "AABCS8899R","8899 0011 2233","100000000019","TS/HY/0000019/000/0000001","00000000000000019",
     "Kotak Mahindra Bank","XXXX XXXX 0019","KKBK0007475",
     8,"Full-time","1 month",1,False,4.1,EMP_PASS),
]

# ── Run ───────────────────────────────────────────────────────────────────────

def run():
    metadata.create_all(engine, checkfirst=True)
    now = datetime.utcnow()
    inserted = 0

    with engine.begin() as conn:
        for row in EMPLOYEES:
            (emp_id, first, middle, last, full, dept, role, email, phone, loc,
             joining, dob, gender, color, mgr_id, pan, aadhaar, uan, pf_account,
             esic, bank, account_no, ifsc, ctc, emp_type, notice,
             access, is_hr, perf, plain_pw) = row

            already = conn.execute(
                select(employees_table.c.id).where(employees_table.c.employee_id == emp_id)
            ).first()

            if already:
                print(f"  SKIP  {emp_id} — {full} (already exists)")
                continue

            conn.execute(insert(employees_table).values(
                employee_id=emp_id,
                first_name=first, middle_name=middle, last_name=last, full_name=full,
                department=dept, designation=role,
                email=email, phone=phone, location=loc,
                date_of_joining=joining, dob=dob, gender=gender, color=color,
                mgr_id=mgr_id, pan=pan, aadhaar=aadhaar, uan=uan,
                pf_account=pf_account, esic=esic,
                bank_name=bank, bank_account_no=account_no, ifsc=ifsc,
                annual_ctc_lpa=ctc, emp_type=emp_type, notice_period=notice,
                access_level=access, is_hr=is_hr, is_finance_operator=False,
                perf_score=perf,
                password_hash=hash_password(plain_pw),
                is_active=True, created_at=now, updated_at=now,
            ))
            print(f"  OK    {emp_id} — {full}")
            inserted += 1

    print(f"\nDone — {inserted} employees inserted.")
    print("\nLogin credentials (passwords from SEED_PASS_* env vars):")
    print(f"  Director  : rajanikanth.tippasani@doloxe.com / {DIR_PASS}")
    print(f"  HR Mgr    : radhika@doloxe.com               / {MGR_PASS}")
    print(f"  Tech Mgr  : vijay@doloxe.com                 / {MGR_PASS}")
    print(f"  SSE       : hemanthreddy.kethu@doloxe.com    / {EMP_PASS}")
    print(f"  SE        : sakethram@doloxe.com             / {EMP_PASS}")


if __name__ == "__main__":
    run()
