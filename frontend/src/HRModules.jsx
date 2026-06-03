import { useState, useEffect } from "react";

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0D0D0E;
      --ink2: #3A3A3D;
      --ink3: #6E6E74;
      --ink4: #A8A8AE;
      --ink5: #D4D4D8;
      --paper: #FAFAFA;
      --surface: #FFFFFF;
      --raised: #F5F5F6;
      --accent: #1B45F5;
      --accent-soft: #EEF1FE;
      --accent-mid: #3A5CF6;
      --green: #0F8C5A;
      --green-soft: #E6F5EE;
      --red: #C8312A;
      --red-soft: #FDF0EF;
      --amber: #B06010;
      --amber-soft: #FDF5E6;
      --purple: #5C35C2;
      --purple-soft: #F0ECFC;
      --teal: #0A7E7A;
      --teal-soft: #E5F5F5;
      --rose: #BE2B5A;
      --rose-soft: #FBF0F4;
      --brd: rgba(0,0,0,0.07);
      --brd2: rgba(0,0,0,0.12);
      --r4: 4px; --r8: 8px; --r12: 12px; --r16: 16px; --r20: 20px; --r999: 999px;
      --sb: 234px; --topbar: 52px;
      --font: 'DM Sans', sans-serif;
      --display: 'Syne', sans-serif;
      --mono: 'DM Mono', monospace;
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
    }

    html, body, #root { height: 100%; }
    body {
      font-family: var(--font);
      background: var(--paper);
      color: var(--ink);
      font-size: 13.5px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--ink5); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink4); }

    /* ── TOPBAR ── */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      height: var(--topbar);
      background: var(--surface);
      border-bottom: 1px solid var(--brd);
      display: flex; align-items: center;
      padding: 0 16px 0 0;
      gap: 0;
    }
    .tb-brand {
      width: var(--sb);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      border-right: 1px solid var(--brd);
      height: 100%;
    }
    .tb-wordmark {
      font-family: var(--display);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.3px;
      color: var(--ink);
    }
    .tb-wordmark span { color: var(--accent); }
    .tb-center { flex: 1; display: flex; align-items: center; padding: 0 20px; }
    .tb-search {
      display: flex; align-items: center; gap: 8px;
      background: var(--raised);
      border: 1px solid var(--brd);
      border-radius: var(--r8);
      padding: 0 12px; height: 32px;
      width: 280px;
      font-size: 12.5px; color: var(--ink3);
      cursor: text;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .tb-search:hover { border-color: var(--brd2); }
    .tb-right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
    .tb-clock {
      font-family: var(--mono); font-size: 11.5px; color: var(--ink3);
      background: var(--raised); border: 1px solid var(--brd);
      border-radius: var(--r8); padding: 4px 10px; letter-spacing: 0.5px;
    }
    .tb-btn {
      width: 32px; height: 32px;
      border-radius: var(--r8);
      border: 1px solid var(--brd);
      background: transparent;
      color: var(--ink3); font-size: 14px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.12s;
      position: relative;
    }
    .tb-btn:hover { background: var(--raised); border-color: var(--brd2); color: var(--ink); }
    .notif-dot {
      position: absolute; top: 5px; right: 5px;
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--red); border: 1.5px solid var(--surface);
    }
    .tb-user {
      display: flex; align-items: center; gap: 8px;
      padding: 4px 10px 4px 6px;
      border-radius: var(--r8);
      cursor: pointer; border: 1px solid var(--brd);
      transition: all 0.12s;
    }
    .tb-user:hover { background: var(--raised); border-color: var(--brd2); }
    .tb-uname { font-size: 12.5px; font-weight: 600; color: var(--ink); line-height: 1.2; }
    .tb-urole { font-size: 10.5px; color: var(--ink3); line-height: 1.2; }

    /* ── SIDEBAR ── */
    .sidebar {
      position: fixed; top: var(--topbar); left: 0; bottom: 0;
      width: var(--sb);
      background: var(--surface);
      border-right: 1px solid var(--brd);
      display: flex; flex-direction: column;
      overflow-y: auto; z-index: 100;
      padding: 0 0 12px;
    }
    .sb-user-card {
      margin: 12px 10px 8px;
      padding: 14px;
      border-radius: var(--r12);
      background: var(--ink);
      color: #fff;
      position: relative;
      overflow: hidden;
    }
    .sb-user-card::before {
      content: '';
      position: absolute; top: -20px; right: -20px;
      width: 80px; height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.06);
    }
    .sb-user-card::after {
      content: '';
      position: absolute; bottom: -30px; left: 10px;
      width: 100px; height: 100px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    .sbu-name { font-family: var(--display); font-size: 13px; font-weight: 600; margin-bottom: 1px; }
    .sbu-role { font-size: 10.5px; opacity: 0.55; margin-bottom: 10px; }
    .sbu-id {
      font-family: var(--mono); font-size: 9.5px; color: rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.08); border-radius: var(--r4); padding: 2px 7px;
      display: inline-block;
    }
    .sbu-badge {
      position: absolute; top: 12px; right: 12px;
      font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
      padding: 2px 7px; border-radius: var(--r4);
      background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8);
    }

    .sb-section-label {
      padding: 14px 14px 4px;
      font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
      color: var(--ink4);
    }
    .sb-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 10px 7px 12px;
      margin: 1px 6px;
      border-radius: var(--r8);
      cursor: pointer;
      font-size: 12.5px; font-weight: 500;
      color: var(--ink3);
      transition: all 0.12s;
      position: relative;
    }
    .sb-item:hover { background: var(--raised); color: var(--ink); }
    .sb-item.active {
      background: var(--accent-soft);
      color: var(--accent);
      font-weight: 600;
    }
    .sb-item svg { width: 15px; height: 15px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .sb-pip {
      margin-left: auto;
      min-width: 18px; height: 18px;
      border-radius: var(--r999);
      background: var(--red-soft);
      color: var(--red);
      font-size: 9.5px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
    }
    .sb-divider { height: 1px; background: var(--brd); margin: 6px 10px; }

    /* ── MAIN ── */
    .app { display: flex; height: 100vh; overflow: hidden; }
    .main {
      margin-left: var(--sb); margin-top: var(--topbar);
      flex: 1; overflow-y: auto;
      min-height: calc(100vh - var(--topbar));
    }
    .main-inner { padding: 24px 28px; }

    /* ── PAGE HEADER ── */
    .ph { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
    .ph-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
      color: var(--ink4); margin-bottom: 3px;
    }
    .ph-title {
      font-family: var(--display); font-size: 22px; font-weight: 700;
      color: var(--ink); letter-spacing: -0.5px; line-height: 1.15;
    }
    .ph-sub { font-size: 12.5px; color: var(--ink3); margin-top: 3px; }

    /* ── AVATAR ── */
    .avt {
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #fff; flex-shrink: 0;
      font-size: 11px; line-height: 1;
    }

    /* ── STAT CARDS ── */
    .sg { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
    .sc {
      background: var(--surface);
      border: 1px solid var(--brd);
      border-radius: var(--r12);
      padding: 16px;
      position: relative;
      overflow: hidden;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .sc:hover { border-color: var(--brd2); box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .sc-accent { position: absolute; top: 0; left: 16px; right: 16px; height: 2px; border-radius: 0 0 var(--r4) var(--r4); }
    .sc-emo { font-size: 16px; margin-bottom: 8px; }
    .sc-val { font-family: var(--display); font-size: 28px; font-weight: 700; color: var(--ink); letter-spacing: -1px; line-height: 1; }
    .sc-lbl { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--ink4); margin-top: 4px; }
    .sc-sub { font-size: 11px; color: var(--ink4); margin-top: 3px; }

    /* ── CARD ── */
    .card { background: var(--surface); border: 1px solid var(--brd); border-radius: var(--r12); margin-bottom: 14px; overflow: hidden; }
    .ch { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--brd); }
    .ct { font-family: var(--display); font-size: 13.5px; font-weight: 600; color: var(--ink); display: flex; align-items: center; gap: 7px; }
    .cb { padding: 14px 16px; }

    /* ── BUTTON ── */
    .btn {
      display: inline-flex; align-items: center; gap: 5px;
      border: 1px solid var(--brd);
      background: var(--surface); color: var(--ink2);
      font-family: var(--font); font-size: 12.5px; font-weight: 500;
      padding: 6px 12px; border-radius: var(--r8);
      cursor: pointer; transition: all 0.12s; white-space: nowrap;
    }
    .btn:hover { background: var(--raised); border-color: var(--brd2); color: var(--ink); }
    .btn-p { background: var(--accent); color: #fff; border-color: var(--accent); }
    .btn-p:hover { background: var(--accent-mid); border-color: var(--accent-mid); }
    .btn-sm { padding: 4px 9px; font-size: 11.5px; }
    .btn-d { background: var(--red-soft); color: var(--red); border-color: rgba(200,49,42,0.2); }
    .btn-d:hover { background: #fae0df; }
    .btn-s { background: var(--green-soft); color: var(--green); border-color: rgba(15,140,90,0.2); }
    .btn-s:hover { background: #d3eddf; }

    /* ── BADGE ── */
    .bdg {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: var(--r999); font-size: 11px; font-weight: 650;
      white-space: nowrap; border: 1px solid transparent;
    }
    .bdg-g { background: var(--green-soft); color: var(--green); border-color: rgba(15,140,90,0.18); }
    .bdg-r { background: var(--red-soft); color: var(--red); border-color: rgba(200,49,42,0.18); }
    .bdg-a { background: var(--amber-soft); color: var(--amber); border-color: rgba(176,96,16,0.18); }
    .bdg-b { background: var(--accent-soft); color: var(--accent); border-color: rgba(27,69,245,0.18); }
    .bdg-p { background: var(--purple-soft); color: var(--purple); border-color: rgba(92,53,194,0.18); }
    .bdg-t { background: var(--teal-soft); color: var(--teal); border-color: rgba(10,126,122,0.18); }
    .bdg-gray { background: var(--raised); color: var(--ink3); border-color: var(--brd); }
    .bdg-rose { background: var(--rose-soft); color: var(--rose); border-color: rgba(190,43,90,0.18); }
    .bdg-ink { background: var(--ink); color: #fff; }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    thead th {
      text-align: left; padding: 9px 14px;
      font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
      color: var(--ink4); background: var(--raised); border-bottom: 1px solid var(--brd);
      white-space: nowrap;
    }
    tbody tr { border-bottom: 1px solid var(--brd); transition: background 0.1s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: #FAFAFA; }
    tbody td { padding: 10px 14px; color: var(--ink2); vertical-align: middle; }

    /* ── TABS ── */
    .tabs { display: flex; border-bottom: 1px solid var(--brd); margin-bottom: 16px; }
    .tab {
      padding: 9px 14px; font-size: 12.5px; font-weight: 500; color: var(--ink3);
      cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px;
      transition: all 0.12s;
    }
    .tab:hover { color: var(--ink); }
    .tab.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }

    /* ── FORM ── */
    .fg { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .ff { grid-column: 1/-1; }
    .fgrp { display: flex; flex-direction: column; gap: 4px; }
    .flbl { font-size: 10.5px; font-weight: 700; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.6px; }
    .finp, .fsel, .ftxt {
      background: var(--surface); border: 1.5px solid var(--brd);
      color: var(--ink); font-family: var(--font); font-size: 13px;
      padding: 7px 11px; border-radius: var(--r8); outline: none;
      transition: border-color 0.15s, box-shadow 0.15s; width: 100%;
    }
    .finp:focus, .fsel:focus, .ftxt:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(27,69,245,0.1); }
    .ftxt { resize: vertical; min-height: 64px; }

    /* ── MODAL ── */
    .mo {
      position: fixed; inset: 0; background: rgba(13,13,14,0.4);
      backdrop-filter: blur(4px); z-index: 300;
      display: flex; align-items: center; justify-content: center;
      animation: mofade 0.12s ease;
    }
    @keyframes mofade { from { opacity: 0 } to { opacity: 1 } }
    .modal {
      background: var(--surface); border-radius: var(--r16);
      border: 1px solid var(--brd);
      box-shadow: 0 24px 64px rgba(0,0,0,0.18);
      width: 520px; max-width: 95vw; max-height: 88vh;
      display: flex; flex-direction: column;
      animation: moup 0.2s var(--ease);
    }
    .modal-w { width: 720px; }
    @keyframes moup { from { transform: translateY(20px) scale(0.96); opacity: 0 } to { transform: none; opacity: 1 } }
    .mh { padding: 16px 20px; border-bottom: 1px solid var(--brd); display: flex; align-items: center; justify-content: space-between; }
    .mt { font-family: var(--display); font-size: 15px; font-weight: 600; color: var(--ink); }
    .mc {
      width: 26px; height: 26px; border-radius: var(--r8);
      background: var(--raised); border: 1px solid var(--brd);
      color: var(--ink3); cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center; transition: all 0.12s;
    }
    .mc:hover { background: var(--red-soft); color: var(--red); border-color: rgba(200,49,42,0.2); }
    .mb { padding: 18px 20px; overflow-y: auto; flex: 1; }
    .mf { padding: 12px 20px; border-top: 1px solid var(--brd); display: flex; gap: 8px; justify-content: flex-end; background: var(--raised); border-radius: 0 0 var(--r16) var(--r16); }

    /* ── MISC ── */
    .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .sep { border: none; border-top: 1px solid var(--brd); margin: 12px 0; }
    .fw6 { font-weight: 600; } .fw7 { font-weight: 700; } .t3 { color: var(--ink3); } .tsm { font-size: 12px; } .mono { font-family: var(--mono); }
    .tw { overflow-x: auto; }

    .lbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--raised); border-radius: var(--r8); margin-bottom: 8px; border: 1px solid var(--brd); }
    .lbar-t { height: 5px; background: var(--brd); border-radius: var(--r999); overflow: hidden; }
    .lbar-f { height: 100%; border-radius: var(--r999); transition: width 0.5s ease; }

    .pt { width: 100%; height: 6px; background: var(--brd); border-radius: var(--r999); overflow: hidden; margin: 6px 0; }
    .pf { height: 100%; border-radius: var(--r999); transition: width 0.7s ease; }

    .emp-row { display: flex; align-items: center; gap: 10px; padding: 11px 16px; border-bottom: 1px solid var(--brd); cursor: pointer; transition: background 0.1s; }
    .emp-row:hover { background: var(--raised); }
    .emp-row.sel { background: var(--accent-soft); }
    .emp-row:last-child { border-bottom: none; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; }
    .if { font-size: 12.5px; } .if-l { font-size: 10.5px; color: var(--ink3); margin-bottom: 1px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    .pill {
      padding: 4px 11px; border-radius: var(--r999); font-size: 11.5px; font-weight: 500;
      cursor: pointer; border: 1px solid var(--brd); color: var(--ink3); background: var(--surface);
      transition: all 0.12s;
    }
    .pill:hover { border-color: var(--accent); color: var(--accent); }
    .pill.active { background: var(--accent-soft); border-color: rgba(27,69,245,0.25); color: var(--accent); font-weight: 600; }

    .goal-row { padding: 12px 14px; border-bottom: 1px solid var(--brd); }
    .goal-row:last-child { border-bottom: none; }

    .review-card { padding: 14px; border: 1px solid var(--brd); border-radius: var(--r8); margin-bottom: 8px; transition: border-color 0.15s; }
    .review-card:hover { border-color: var(--brd2); }

    .score-circle { width: 54px; height: 54px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 750; flex-shrink: 0; }

    .ann { padding: 13px 15px; border-radius: var(--r8); border: 1px solid var(--brd); background: var(--surface); margin-bottom: 8px; cursor: pointer; transition: all 0.12s; }
    .ann:hover { border-color: var(--accent); box-shadow: 0 2px 8px rgba(27,69,245,0.08); }

    .empty { padding: 40px 20px; text-align: center; color: var(--ink4); font-size: 13px; }

    /* Login */
    .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--paper); }
    .login-box { background: var(--surface); border: 1px solid var(--brd); border-radius: var(--r16); padding: 36px; width: 440px; box-shadow: 0 8px 40px rgba(0,0,0,0.08); }
    .login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .quick-login { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; max-height: 280px; overflow-y: auto; }
    .ql-btn { padding: 8px 10px; border-radius: var(--r8); border: 1px solid var(--brd); background: var(--raised); cursor: pointer; font-family: var(--font); font-size: 11.5px; font-weight: 500; color: var(--ink2); transition: all 0.12s; text-align: left; }
    .ql-btn:hover { background: var(--accent-soft); border-color: rgba(27,69,245,0.25); color: var(--accent); }
    .ql-name { font-weight: 700; margin-bottom: 1px; font-size: 12px; }
    .ql-role { font-size: 10.5px; color: var(--ink3); }

    /* Attendance */
    .att-day { aspect-ratio: 1; border-radius: var(--r8); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; border: 1px solid transparent; }
    .att-present { background: var(--green-soft); color: var(--green); border-color: rgba(15,140,90,0.2); }
    .att-absent { background: var(--red-soft); color: var(--red); border-color: rgba(200,49,42,0.2); }
    .att-late { background: var(--amber-soft); color: var(--amber); border-color: rgba(176,96,16,0.2); }
    .att-leave { background: var(--accent-soft); color: var(--accent); border-color: rgba(27,69,245,0.2); }
    .att-holiday { background: var(--purple-soft); color: var(--purple); border-color: rgba(92,53,194,0.2); }
    .att-wknd { background: transparent; color: var(--ink5); }
    .att-today { outline: 2px solid var(--accent); outline-offset: 1px; }
    .att-future { background: transparent; color: var(--ink5); border-color: var(--brd); }
    .att-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 4px; }

    .reg-btn { padding: 11px 20px; border-radius: var(--r8); border: 1.5px solid var(--accent); background: var(--accent-soft); color: var(--accent); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.18s; text-align: center; width: 100%; font-family: var(--font); }
    .reg-btn:hover { background: var(--accent); color: #fff; }
    .reg-btn.checked-in { border-color: var(--green); background: var(--green-soft); color: var(--green); }
    .reg-btn.checked-in:hover { background: var(--red-soft); border-color: var(--red); color: var(--red); }

    /* Payslip */
    .slip-h { background: var(--ink); color: #fff; padding: 22px 26px; }
    .slip-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px dashed var(--brd); font-size: 13px; }
    .slip-row:last-child { border-bottom: none; }
    .slip-tot { background: var(--accent-soft); padding: 12px 22px; display: flex; justify-content: space-between; font-weight: 750; font-size: 15px; border-top: 2px solid var(--accent); }

    /* Org */
    .org-card { background: var(--surface); border: 1.5px solid var(--brd); border-radius: var(--r12); padding: 10px 12px; text-align: center; transition: all 0.15s var(--ease); cursor: pointer; min-width: 100px; max-width: 118px; position: relative; }
    .org-card:hover { border-color: var(--accent); box-shadow: 0 6px 16px rgba(27,69,245,0.12); transform: translateY(-2px); }
    .org-card.is-root { border-color: var(--accent); background: var(--accent-soft); }
    .org-card.is-you { border-color: var(--green); background: var(--green-soft); }
    .org-card.is-lead { border-color: var(--purple); background: var(--purple-soft); }
    .org-card-name { font-size: 11px; font-weight: 700; line-height: 1.3; margin-top: 6px; color: var(--ink); }
    .org-card-role { font-size: 9px; color: var(--ink3); line-height: 1.3; margin-top: 2px; }
    .org-card-badge { font-size: 8px; font-weight: 700; padding: 1px 6px; border-radius: var(--r4); margin-top: 4px; display: inline-block; }
    .org-connector-v { width: 1.5px; height: 20px; background: var(--brd2); margin: 0 auto; }
    .org-dept-section { margin-bottom: 28px; }
    .org-dept-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding: 0 4px; }
    .org-dept-line { flex: 1; height: 1px; background: var(--brd); }
    .org-dept-title { font-family: var(--display); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink4); white-space: nowrap; padding: 0 8px; }

    /* TL */
    .tl-project-row { border: 1px solid var(--brd); border-radius: var(--r8); margin-bottom: 8px; overflow: hidden; }
    .tl-project-hd { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--raised); cursor: pointer; font-weight: 600; font-size: 12.5px; transition: background 0.1s; }
    .tl-project-hd:hover { background: var(--ink5); }
    .tl-task-row { display: flex; align-items: center; gap: 10px; padding: 8px 14px 8px 36px; border-top: 1px solid var(--brd); font-size: 12.5px; transition: background 0.1s; }
    .tl-task-row:hover { background: var(--raised); }
    .week-bar { background: var(--accent-soft); border: 1px solid rgba(27,69,245,0.15); border-radius: var(--r12); padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; }
    .login-field { margin-bottom: 14px; }
  `}</style>
);

const Icon = ({ n, s = 15 }) => {
  const p = {
    leave: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    salary: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    time: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    dl: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    chk: <><polyline points="20 6 9 17 4 12"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    cal: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    print: <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    brief: <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    org: <><rect x="3" y="3" width="6" height="5" rx="1"/><rect x="15" y="3" width="6" height="5" rx="1"/><rect x="9" y="15" width="6" height="5" rx="1"/><path d="M6 8v4h12V8M12 12v3"/></>,
    target: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    announce: <><path d="M22 3L2 10.5l8 3.5"/><path d="M22 3L14 22l-4-8"/></>,
    analytics: <><path d="M2 20h20M7 20V10M12 20V4M17 20v-6"/></>,
    perf: <><path d="M2 12 L7 7 L12 12 L17 5 L22 9"/><polyline points="17 5 22 5 22 10"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    chevdown: <><polyline points="6 9 12 15 18 9"/></>,
    chevright: <><polyline points="9 18 15 12 9 6"/></>,
    folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>,
    clip: <><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>,
    award: <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    fingerprint: <><path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"/><path d="M5 19.5C5.5 18 6 15 6 12"/><path d="M17.5 21.4C17 19.5 16 17 16 12"/><path d="M10 12c0 3.5-.9 7-2.3 9.5"/><path d="M13 12c0 3.5.9 7 2.3 9.5"/></>,
    clockin: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    clockout: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><path d="M20 20L16 16"/></>,
    attend: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="8 14 10.5 16.5 16 11"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={s} height={s} style={{ display:"inline-block", verticalAlign:"middle", flexShrink:0 }}>
      {p[n] || p.chk}
    </svg>
  );
};

const Modal = ({ title, onClose, children, footer, wide }) => (
  <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className={`modal${wide ? " modal-w" : ""}`}>
      <div className="mh"><div className="mt">{title}</div><button className="mc" onClick={onClose}><Icon n="x" s={13}/></button></div>
      <div className="mb">{children}</div>
      {footer && <div className="mf">{footer}</div>}
    </div>
  </div>
);

// ─── EMPLOYEE DATA ────────────────────────────────────────────────────────────
const ALL_USERS = [
  { id:"EMP-0001", firstName:"Arjun", middleName:"Suresh", lastName:"Mehta", name:"Arjun Suresh Mehta", dept:"Leadership", role:"CEO", accessLevel:4, ctcLPA:120, joining:"2016-01-15", color:"#1B45F5", mgr:null, reports:["EMP-0100","EMP-0200","EMP-0300","EMP-0400"], loc:"Bengaluru", email:"arjun.mehta@doloxe.com", phone:"+91 98100 00001", skills:["Strategy","Fundraising","Leadership","Vision","Governance"], perf:5.0, dob:"1978-03-10", age:47, gender:"Male", aadhaar:"1111 2222 3333", pan:"AABCM1111A", empType:"Full-time", noticePeriod:"6 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0001", ifsc:"HDFC0000001", uan:"100000000001", pfAccount:"KA/BN/0000001/000/0000001", esic:"00000000000000001", password:"ceo123", isHR:false },
  { id:"EMP-0100", firstName:"Priya", middleName:"Venkat", lastName:"Nair", name:"Priya Venkat Nair", dept:"Engineering", role:"CTO / VP Engineering", accessLevel:3, ctcLPA:90, joining:"2017-04-01", color:"#5C35C2", mgr:"EMP-0001", reports:["EMP-0110"], loc:"Bengaluru", email:"priya.nair@doloxe.com", phone:"+91 98200 00100", skills:["System Architecture","Cloud","Engineering Leadership","Go","Distributed Systems"], perf:4.9, dob:"1980-07-22", age:44, gender:"Female", aadhaar:"2222 3333 4444", pan:"AABCN2222B", empType:"Full-time", noticePeriod:"6 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0100", ifsc:"HDFC0000100", uan:"100000000100", pfAccount:"KA/BN/0000100/000/0000001", esic:"00000000000000100", password:"cto123", isHR:false },
  { id:"EMP-0110", firstName:"Karthik", middleName:"Ramesh", lastName:"Iyer", name:"Karthik Ramesh Iyer", dept:"Engineering", role:"Engineering Manager", accessLevel:2, ctcLPA:42, joining:"2019-06-10", color:"#0A7E7A", mgr:"EMP-0100", reports:["EMP-0120","EMP-0130","EMP-0140"], loc:"Bengaluru", email:"karthik.iyer@doloxe.com", phone:"+91 98300 00110", skills:["React","Node.js","System Design","Team Leadership","Agile"], perf:4.7, dob:"1986-11-05", age:38, gender:"Male", aadhaar:"3333 4444 5555", pan:"AABCI3333C", empType:"Full-time", noticePeriod:"3 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0110", ifsc:"HDFC0000110", uan:"100000000110", pfAccount:"KA/BN/0000110/000/0000001", esic:"00000000000000110", password:"mgr123", isHR:false },
  { id:"EMP-0120", firstName:"Sneha", middleName:"Anil", lastName:"Kulkarni", name:"Sneha Anil Kulkarni", dept:"Engineering", role:"Team Lead", accessLevel:2, ctcLPA:32, joining:"2020-02-17", color:"#BE2B5A", mgr:"EMP-0110", reports:["EMP-0121","EMP-0122","EMP-0123","EMP-0124","EMP-0125"], loc:"Bengaluru", email:"sneha.kulkarni@doloxe.com", phone:"+91 98400 00120", skills:["TypeScript","React","GraphQL","Technical Mentoring","Sprint Planning"], perf:4.6, dob:"1990-05-14", age:34, gender:"Female", aadhaar:"4444 5555 6666", pan:"AABCK4444D", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0120", ifsc:"HDFC0000120", uan:"100000000120", pfAccount:"KA/BN/0000120/000/0000001", esic:"00000000000000120", password:"mgr123", isHR:false },
  { id:"EMP-0121", firstName:"Vikram", middleName:"Anand", lastName:"Sharma", name:"Vikram Anand Sharma", dept:"Engineering", role:"Senior Software Engineer", accessLevel:1, ctcLPA:22, joining:"2021-01-10", color:"#1B45F5", mgr:"EMP-0120", reports:[], loc:"Bengaluru", email:"vikram.sharma@doloxe.com", phone:"+91 98500 00121", skills:["React","TypeScript","Redux","AWS","Jest"], perf:4.4, dob:"1993-08-20", age:31, gender:"Male", aadhaar:"5555 6666 7777", pan:"AABCS5555E", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0121", ifsc:"HDFC0000121", uan:"100000000121", pfAccount:"KA/BN/0000121/000/0000001", esic:"00000000000000121", password:"emp123", isHR:false },
  { id:"EMP-0122", firstName:"Deepa", middleName:"Krishnan", lastName:"Pillai", name:"Deepa Krishnan Pillai", dept:"Engineering", role:"Software Engineer", accessLevel:1, ctcLPA:16, joining:"2022-03-21", color:"#B06010", mgr:"EMP-0120", reports:[], loc:"Bengaluru", email:"deepa.pillai@doloxe.com", phone:"+91 98500 00122", skills:["Node.js","PostgreSQL","REST APIs","Docker"], perf:4.1, dob:"1996-02-12", age:29, gender:"Female", aadhaar:"6666 7777 8888", pan:"AABCP6666F", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0122", ifsc:"HDFC0000122", uan:"100000000122", pfAccount:"KA/BN/0000122/000/0000001", esic:"00000000000000122", password:"emp123", isHR:false },
  { id:"EMP-0123", firstName:"Rahul", middleName:"Sunil", lastName:"Reddy", name:"Rahul Sunil Reddy", dept:"Engineering", role:"Software Engineer", accessLevel:1, ctcLPA:15, joining:"2022-07-04", color:"#0F8C5A", mgr:"EMP-0120", reports:[], loc:"Hyderabad", email:"rahul.reddy@doloxe.com", phone:"+91 98500 00123", skills:["Python","Django","Redis","Celery"], perf:3.9, dob:"1997-06-30", age:27, gender:"Male", aadhaar:"7777 8888 9999", pan:"AABCR7777G", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0123", ifsc:"HDFC0000123", uan:"100000000123", pfAccount:"TS/HY/0000123/000/0000001", esic:"00000000000000123", password:"emp123", isHR:false },
  { id:"EMP-0124", firstName:"Meena", middleName:"Rajan", lastName:"Iyer", name:"Meena Rajan Iyer", dept:"Engineering", role:"Junior Software Engineer", accessLevel:1, ctcLPA:8, joining:"2023-08-01", color:"#C8312A", mgr:"EMP-0120", reports:[], loc:"Bengaluru", email:"meena.iyer@doloxe.com", phone:"+91 98500 00124", skills:["JavaScript","React","HTML/CSS","Git"], perf:3.7, dob:"1999-04-18", age:25, gender:"Female", aadhaar:"8888 9999 0000", pan:"AABCI8888H", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0124", ifsc:"HDFC0000124", uan:"100000000124", pfAccount:"KA/BN/0000124/000/0000001", esic:"00000000000000124", password:"emp123", isHR:false },
  { id:"EMP-0125", firstName:"Rohan", middleName:"Dev", lastName:"Kumar", name:"Rohan Dev Kumar", dept:"Engineering", role:"Intern", accessLevel:1, ctcLPA:3, joining:"2025-01-15", color:"#0A7E7A", mgr:"EMP-0120", reports:[], loc:"Bengaluru", email:"rohan.kumar@doloxe.com", phone:"+91 98500 00125", skills:["Python","JavaScript","Basic React"], perf:3.5, dob:"2002-09-22", age:22, gender:"Male", aadhaar:"9999 0000 1111", pan:"AABCK9999I", empType:"Intern", noticePeriod:"15 days", bank:"HDFC Bank", accountNo:"XXXX XXXX 0125", ifsc:"HDFC0000125", uan:"100000000125", pfAccount:"KA/BN/0000125/000/0000001", esic:"00000000000000125", password:"emp123", isHR:false },
  { id:"EMP-0130", firstName:"Ananya", middleName:"Suresh", lastName:"Menon", name:"Ananya Suresh Menon", dept:"Engineering", role:"QA Lead", accessLevel:2, ctcLPA:28, joining:"2020-09-14", color:"#5C35C2", mgr:"EMP-0110", reports:["EMP-0131","EMP-0132","EMP-0133","EMP-0134","EMP-0135"], loc:"Bengaluru", email:"ananya.menon@doloxe.com", phone:"+91 98600 00130", skills:["Selenium","Cypress","JIRA","Test Planning","Automation"], perf:4.5, dob:"1988-12-03", age:36, gender:"Female", aadhaar:"0000 1111 2222", pan:"AABCM0000J", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0130", ifsc:"HDFC0000130", uan:"100000000130", pfAccount:"KA/BN/0000130/000/0000001", esic:"00000000000000130", password:"mgr123", isHR:false },
  { id:"EMP-0131", firstName:"Suresh", middleName:"Babu", lastName:"Rajan", name:"Suresh Babu Rajan", dept:"Engineering", role:"QA Engineer", accessLevel:1, ctcLPA:12, joining:"2021-11-08", color:"#1B45F5", mgr:"EMP-0130", reports:[], loc:"Bengaluru", email:"suresh.rajan@doloxe.com", phone:"+91 98700 00131", skills:["Selenium","TestNG","API Testing","Postman"], perf:4.2, dob:"1994-07-15", age:30, gender:"Male", aadhaar:"1122 3344 5566", pan:"AABCR1122K", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0131", ifsc:"HDFC0000131", uan:"100000000131", pfAccount:"KA/BN/0000131/000/0000001", esic:"00000000000000131", password:"emp123", isHR:false },
  { id:"EMP-0132", firstName:"Lakshmi", middleName:"Prasad", lastName:"Devi", name:"Lakshmi Prasad Devi", dept:"Engineering", role:"QA Engineer", accessLevel:1, ctcLPA:11, joining:"2022-02-14", color:"#BE2B5A", mgr:"EMP-0130", reports:[], loc:"Bengaluru", email:"lakshmi.devi@doloxe.com", phone:"+91 98700 00132", skills:["Cypress","JavaScript","JIRA","BDD"], perf:4.0, dob:"1996-01-28", age:29, gender:"Female", aadhaar:"2233 4455 6677", pan:"AABCD2233L", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0132", ifsc:"HDFC0000132", uan:"100000000132", pfAccount:"KA/BN/0000132/000/0000001", esic:"00000000000000132", password:"emp123", isHR:false },
  { id:"EMP-0133", firstName:"Aditya", middleName:"Naresh", lastName:"Pillai", name:"Aditya Naresh Pillai", dept:"Engineering", role:"QA Engineer", accessLevel:1, ctcLPA:10, joining:"2022-06-20", color:"#0F8C5A", mgr:"EMP-0130", reports:[], loc:"Hyderabad", email:"aditya.pillai@doloxe.com", phone:"+91 98700 00133", skills:["Manual Testing","Test Cases","Agile","Regression"], perf:3.8, dob:"1997-03-11", age:28, gender:"Male", aadhaar:"3344 5566 7788", pan:"AABCP3344M", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0133", ifsc:"HDFC0000133", uan:"100000000133", pfAccount:"TS/HY/0000133/000/0000001", esic:"00000000000000133", password:"emp123", isHR:false },
  { id:"EMP-0134", firstName:"Kavita", middleName:"Mohan", lastName:"Sharma", name:"Kavita Mohan Sharma", dept:"Engineering", role:"QA Engineer", accessLevel:1, ctcLPA:9, joining:"2023-01-09", color:"#B06010", mgr:"EMP-0130", reports:[], loc:"Bengaluru", email:"kavita.sharma@doloxe.com", phone:"+91 98700 00134", skills:["Selenium","Java","TestNG","SQL"], perf:3.7, dob:"1998-08-04", age:26, gender:"Female", aadhaar:"4455 6677 8899", pan:"AABCS4455N", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0134", ifsc:"HDFC0000134", uan:"100000000134", pfAccount:"KA/BN/0000134/000/0000001", esic:"00000000000000134", password:"emp123", isHR:false },
  { id:"EMP-0135", firstName:"Nikhil", middleName:"Venkat", lastName:"Rao", name:"Nikhil Venkat Rao", dept:"Engineering", role:"QA Engineer", accessLevel:1, ctcLPA:9, joining:"2023-04-17", color:"#C8312A", mgr:"EMP-0130", reports:[], loc:"Bengaluru", email:"nikhil.rao@doloxe.com", phone:"+91 98700 00135", skills:["Cypress","TypeScript","API Testing","Git"], perf:3.9, dob:"1999-11-25", age:25, gender:"Male", aadhaar:"5566 7788 9900", pan:"AABCR5566O", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0135", ifsc:"HDFC0000135", uan:"100000000135", pfAccount:"KA/BN/0000135/000/0000001", esic:"00000000000000135", password:"emp123", isHR:false },
  { id:"EMP-0140", firstName:"Rajesh", middleName:"Kumar", lastName:"Singh", name:"Rajesh Kumar Singh", dept:"Engineering", role:"DevOps Lead", accessLevel:2, ctcLPA:34, joining:"2020-04-06", color:"#1B45F5", mgr:"EMP-0110", reports:["EMP-0141","EMP-0142","EMP-0143","EMP-0144","EMP-0145"], loc:"Bengaluru", email:"rajesh.singh@doloxe.com", phone:"+91 98800 00140", skills:["Kubernetes","Terraform","AWS","CI/CD","Docker"], perf:4.6, dob:"1987-01-19", age:38, gender:"Male", aadhaar:"6677 8899 0011", pan:"AABCS6677P", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0140", ifsc:"HDFC0000140", uan:"100000000140", pfAccount:"KA/BN/0000140/000/0000001", esic:"00000000000000140", password:"mgr123", isHR:false },
  { id:"EMP-0141", firstName:"Pooja", middleName:"Ravi", lastName:"Nair", name:"Pooja Ravi Nair", dept:"Engineering", role:"DevOps Engineer", accessLevel:1, ctcLPA:14, joining:"2021-07-12", color:"#0A7E7A", mgr:"EMP-0140", reports:[], loc:"Bengaluru", email:"pooja.nair@doloxe.com", phone:"+91 98900 00141", skills:["AWS","Terraform","Jenkins","Linux"], perf:4.3, dob:"1994-05-07", age:30, gender:"Female", aadhaar:"7788 9900 1122", pan:"AABCN7788Q", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0141", ifsc:"HDFC0000141", uan:"100000000141", pfAccount:"KA/BN/0000141/000/0000001", esic:"00000000000000141", password:"emp123", isHR:false },
  { id:"EMP-0142", firstName:"Sanjay", middleName:"Mohan", lastName:"Verma", name:"Sanjay Mohan Verma", dept:"Engineering", role:"DevOps Engineer", accessLevel:1, ctcLPA:13, joining:"2021-10-25", color:"#5C35C2", mgr:"EMP-0140", reports:[], loc:"Bengaluru", email:"sanjay.verma@doloxe.com", phone:"+91 98900 00142", skills:["GCP","Kubernetes","Helm","Monitoring"], perf:4.1, dob:"1995-09-14", age:29, gender:"Male", aadhaar:"8899 0011 2233", pan:"AABCV8899R", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0142", ifsc:"HDFC0000142", uan:"100000000142", pfAccount:"KA/BN/0000142/000/0000001", esic:"00000000000000142", password:"emp123", isHR:false },
  { id:"EMP-0143", firstName:"Divya", middleName:"Subramaniam", lastName:"Krishnan", name:"Divya Subramaniam Krishnan", dept:"Engineering", role:"DevOps Engineer", accessLevel:1, ctcLPA:12, joining:"2022-05-03", color:"#BE2B5A", mgr:"EMP-0140", reports:[], loc:"Chennai", email:"divya.krishnan@doloxe.com", phone:"+91 98900 00143", skills:["Docker","CI/CD","Ansible","Python"], perf:3.9, dob:"1997-12-01", age:27, gender:"Female", aadhaar:"9900 1122 3344", pan:"AABCK9900S", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0143", ifsc:"HDFC0000143", uan:"100000000143", pfAccount:"TN/CH/0000143/000/0000001", esic:"00000000000000143", password:"emp123", isHR:false },
  { id:"EMP-0144", firstName:"Aman", middleName:"Prakash", lastName:"Gupta", name:"Aman Prakash Gupta", dept:"Engineering", role:"DevOps Engineer", accessLevel:1, ctcLPA:11, joining:"2022-11-14", color:"#0F8C5A", mgr:"EMP-0140", reports:[], loc:"Bengaluru", email:"aman.gupta@doloxe.com", phone:"+91 98900 00144", skills:["Azure","Terraform","Shell Scripting","Grafana"], perf:3.8, dob:"1998-07-23", age:26, gender:"Male", aadhaar:"0011 2233 4455", pan:"AABCG0011T", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0144", ifsc:"HDFC0000144", uan:"100000000144", pfAccount:"KA/BN/0000144/000/0000001", esic:"00000000000000144", password:"emp123", isHR:false },
  { id:"EMP-0145", firstName:"Ritu", middleName:"Lal", lastName:"Mishra", name:"Ritu Lal Mishra", dept:"Engineering", role:"DevOps Engineer", accessLevel:1, ctcLPA:10, joining:"2023-03-27", color:"#C8312A", mgr:"EMP-0140", reports:[], loc:"Bengaluru", email:"ritu.mishra@doloxe.com", phone:"+91 98900 00145", skills:["Linux","Nginx","Prometheus","Bash"], perf:3.7, dob:"1999-02-16", age:25, gender:"Female", aadhaar:"1122 3344 5566", pan:"AABCM1122U", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0145", ifsc:"HDFC0000145", uan:"100000000145", pfAccount:"KA/BN/0000145/000/0000001", esic:"00000000000000145", password:"emp123", isHR:false },
  { id:"EMP-0200", firstName:"Nisha", middleName:"Arun", lastName:"Pillai", name:"Nisha Arun Pillai", dept:"HR", role:"HR Director", accessLevel:3, ctcLPA:65, joining:"2017-08-01", color:"#BE2B5A", mgr:"EMP-0001", reports:["EMP-0210"], loc:"Bengaluru", email:"nisha.pillai@doloxe.com", phone:"+91 98200 00200", skills:["HR Strategy","Talent Management","L&D","HRBP","Organizational Design"], perf:4.8, dob:"1979-04-30", age:45, gender:"Female", aadhaar:"2244 6688 0022", pan:"AABCP2244V", empType:"Full-time", noticePeriod:"6 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0200", ifsc:"HDFC0000200", uan:"100000000200", pfAccount:"KA/BN/0000200/000/0000001", esic:"00000000000000200", password:"hr123", isHR:true },
  { id:"EMP-0210", firstName:"Sudhir", middleName:"Balaji", lastName:"Rao", name:"Sudhir Balaji Rao", dept:"HR", role:"HR Manager", accessLevel:2, ctcLPA:28, joining:"2020-01-06", color:"#B06010", mgr:"EMP-0200", reports:["EMP-0211","EMP-0212","EMP-0213","EMP-0214","EMP-0215"], loc:"Bengaluru", email:"sudhir.rao@doloxe.com", phone:"+91 98300 00210", skills:["Payroll","Compliance","Employee Relations","Onboarding","HRIS"], perf:4.4, dob:"1985-06-18", age:39, gender:"Male", aadhaar:"3355 7799 1133", pan:"AABCR3355W", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0210", ifsc:"HDFC0000210", uan:"100000000210", pfAccount:"KA/BN/0000210/000/0000001", esic:"00000000000000210", password:"mgr123", isHR:true },
  { id:"EMP-0211", firstName:"Archana", middleName:"Vijay", lastName:"Menon", name:"Archana Vijay Menon", dept:"HR", role:"HR Executive", accessLevel:1, ctcLPA:8, joining:"2022-04-04", color:"#1B45F5", mgr:"EMP-0210", reports:[], loc:"Bengaluru", email:"archana.menon@doloxe.com", phone:"+91 99000 00211", skills:["Employee Onboarding","HRIS","Documentation","Compliance"], perf:4.0, dob:"1997-01-09", age:28, gender:"Female", aadhaar:"4466 8800 2244", pan:"AABCM4466X", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0211", ifsc:"HDFC0000211", uan:"100000000211", pfAccount:"KA/BN/0000211/000/0000001", esic:"00000000000000211", password:"emp123", isHR:true },
  { id:"EMP-0212", firstName:"Bhavna", middleName:"Sathish", lastName:"Kumar", name:"Bhavna Sathish Kumar", dept:"HR", role:"HR Executive", accessLevel:1, ctcLPA:7, joining:"2022-09-19", color:"#0F8C5A", mgr:"EMP-0210", reports:[], loc:"Bengaluru", email:"bhavna.kumar@doloxe.com", phone:"+91 99000 00212", skills:["Payroll Processing","Leave Management","PF/ESI","Employee Queries"], perf:3.9, dob:"1998-05-22", age:26, gender:"Female", aadhaar:"5577 9911 3355", pan:"AABCK5577Y", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0212", ifsc:"HDFC0000212", uan:"100000000212", pfAccount:"KA/BN/0000212/000/0000001", esic:"00000000000000212", password:"emp123", isHR:true },
  { id:"EMP-0213", firstName:"Gopal", middleName:"Narayan", lastName:"Iyer", name:"Gopal Narayan Iyer", dept:"HR", role:"Recruiter", accessLevel:1, ctcLPA:9, joining:"2021-11-22", color:"#C8312A", mgr:"EMP-0210", reports:[], loc:"Bengaluru", email:"gopal.iyer@doloxe.com", phone:"+91 99000 00213", skills:["LinkedIn Sourcing","Tech Hiring","ATS","Campus Recruitment"], perf:4.2, dob:"1995-10-17", age:29, gender:"Male", aadhaar:"6688 0022 4466", pan:"AABCI6688Z", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0213", ifsc:"HDFC0000213", uan:"100000000213", pfAccount:"KA/BN/0000213/000/0000001", esic:"00000000000000213", password:"emp123", isHR:false },
  { id:"EMP-0214", firstName:"Shreya", middleName:"Mohan", lastName:"Nair", name:"Shreya Mohan Nair", dept:"HR", role:"Recruiter", accessLevel:1, ctcLPA:10, joining:"2021-07-05", color:"#0A7E7A", mgr:"EMP-0210", reports:[], loc:"Mumbai", email:"shreya.nair@doloxe.com", phone:"+91 99000 00214", skills:["Talent Acquisition","Job Portals","HR Analytics","Screening"], perf:4.1, dob:"1994-03-08", age:31, gender:"Female", aadhaar:"7799 1133 5577", pan:"AABCN7799A", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0214", ifsc:"HDFC0000214", uan:"100000000214", pfAccount:"MH/MU/0000214/000/0000001", esic:"00000000000000214", password:"emp123", isHR:false },
  { id:"EMP-0215", firstName:"Tarun", middleName:"Shankar", lastName:"Pillai", name:"Tarun Shankar Pillai", dept:"HR", role:"HR Executive", accessLevel:1, ctcLPA:7, joining:"2023-02-13", color:"#5C35C2", mgr:"EMP-0210", reports:[], loc:"Bengaluru", email:"tarun.pillai@doloxe.com", phone:"+91 99000 00215", skills:["HR Documentation","Employee Engagement","Policy Communication"], perf:3.6, dob:"1999-07-30", age:25, gender:"Male", aadhaar:"8800 2244 6688", pan:"AABCP8800B", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0215", ifsc:"HDFC0000215", uan:"100000000215", pfAccount:"KA/BN/0000215/000/0000001", esic:"00000000000000215", password:"emp123", isHR:false },
  { id:"EMP-0300", firstName:"Vikash", middleName:"Prasad", lastName:"Agarwal", name:"Vikash Prasad Agarwal", dept:"Finance", role:"Finance Director", accessLevel:3, ctcLPA:70, joining:"2017-10-01", color:"#0F8C5A", mgr:"EMP-0001", reports:["EMP-0310"], loc:"Mumbai", email:"vikash.agarwal@doloxe.com", phone:"+91 98200 00300", skills:["Financial Planning","Fund Raising","Taxation","Audit","Investor Relations"], perf:4.8, dob:"1977-09-14", age:47, gender:"Male", aadhaar:"9911 3355 7799", pan:"AABCA9911C", empType:"Full-time", noticePeriod:"6 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0300", ifsc:"HDFC0000300", uan:"100000000300", pfAccount:"MH/MU/0000300/000/0000001", esic:"00000000000000300", password:"hr123", isHR:false },
  { id:"EMP-0310", firstName:"Kavitha", middleName:"Suresh", lastName:"Reddy", name:"Kavitha Suresh Reddy", dept:"Finance", role:"Finance Manager", accessLevel:2, ctcLPA:30, joining:"2019-11-11", color:"#BE2B5A", mgr:"EMP-0300", reports:["EMP-0311","EMP-0312","EMP-0313","EMP-0314","EMP-0315"], loc:"Mumbai", email:"kavitha.reddy@doloxe.com", phone:"+91 98300 00310", skills:["Tally","GST","P&L Management","Payroll Accounting","Cash Flow"], perf:4.5, dob:"1984-02-28", age:41, gender:"Female", aadhaar:"0022 4466 8800", pan:"AABCR0022D", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0310", ifsc:"HDFC0000310", uan:"100000000310", pfAccount:"MH/MU/0000310/000/0000001", esic:"00000000000000310", password:"mgr123", isHR:false },
  { id:"EMP-0311", firstName:"Manoj", middleName:"Lal", lastName:"Sharma", name:"Manoj Lal Sharma", dept:"Finance", role:"Accountant", accessLevel:1, ctcLPA:10, joining:"2021-05-17", color:"#1B45F5", mgr:"EMP-0310", reports:[], loc:"Mumbai", email:"manoj.sharma@doloxe.com", phone:"+91 99100 00311", skills:["Tally ERP","GST Filing","TDS","Bank Reconciliation"], perf:4.1, dob:"1993-12-20", age:31, gender:"Male", aadhaar:"1133 5577 9911", pan:"AABCS1133E", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0311", ifsc:"HDFC0000311", uan:"100000000311", pfAccount:"MH/MU/0000311/000/0000001", esic:"00000000000000311", password:"emp123", isHR:false },
  { id:"EMP-0312", firstName:"Swati", middleName:"Raj", lastName:"Kulkarni", name:"Swati Raj Kulkarni", dept:"Finance", role:"Accountant", accessLevel:1, ctcLPA:9, joining:"2022-01-24", color:"#B06010", mgr:"EMP-0310", reports:[], loc:"Pune", email:"swati.kulkarni@doloxe.com", phone:"+91 99100 00312", skills:["Accounts Payable","Invoicing","Excel","MIS Reports"], perf:3.9, dob:"1996-08-11", age:28, gender:"Female", aadhaar:"2244 6688 0033", pan:"AABCK2244F", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0312", ifsc:"HDFC0000312", uan:"100000000312", pfAccount:"MH/PU/0000312/000/0000001", esic:"00000000000000312", password:"emp123", isHR:false },
  { id:"EMP-0400", firstName:"Meghna", middleName:"Ashok", lastName:"Verma", name:"Meghna Ashok Verma", dept:"Product", role:"Product Manager", accessLevel:3, ctcLPA:60, joining:"2018-03-12", color:"#C8312A", mgr:"EMP-0001", reports:["EMP-0410"], loc:"Bengaluru", email:"meghna.verma@doloxe.com", phone:"+91 98200 00400", skills:["Roadmapping","Agile","Stakeholder Management","Analytics","User Research"], perf:4.7, dob:"1983-11-27", age:41, gender:"Female", aadhaar:"6688 0022 4477", pan:"AABCV6688J", empType:"Full-time", noticePeriod:"3 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0400", ifsc:"HDFC0000400", uan:"100000000400", pfAccount:"KA/BN/0000400/000/0000001", esic:"00000000000000400", password:"hr123", isHR:false },
  { id:"EMP-0410", firstName:"Siddharth", middleName:"Ganesh", lastName:"Menon", name:"Siddharth Ganesh Menon", dept:"Product", role:"UI/UX Lead", accessLevel:2, ctcLPA:26, joining:"2020-08-24", color:"#5C35C2", mgr:"EMP-0400", reports:["EMP-0411","EMP-0412","EMP-0413","EMP-0414","EMP-0415"], loc:"Bengaluru", email:"siddharth.menon@doloxe.com", phone:"+91 98300 00410", skills:["Figma","Design Systems","UX Research","Prototyping","Usability Testing"], perf:4.5, dob:"1989-07-08", age:35, gender:"Male", aadhaar:"7799 1133 5588", pan:"AABCM7799K", empType:"Full-time", noticePeriod:"2 months", bank:"HDFC Bank", accountNo:"XXXX XXXX 0410", ifsc:"HDFC0000410", uan:"100000000410", pfAccount:"KA/BN/0000410/000/0000001", esic:"00000000000000410", password:"mgr123", isHR:false },
  { id:"EMP-0411", firstName:"Riya", middleName:"Sunil", lastName:"Shah", name:"Riya Sunil Shah", dept:"Product", role:"UI/UX Designer", accessLevel:1, ctcLPA:12, joining:"2021-09-06", color:"#BE2B5A", mgr:"EMP-0410", reports:[], loc:"Bengaluru", email:"riya.shah@doloxe.com", phone:"+91 99200 00411", skills:["Figma","Adobe XD","Interaction Design","Wireframing"], perf:4.3, dob:"1995-02-28", age:30, gender:"Female", aadhaar:"8800 2244 6699", pan:"AABCS8800L", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0411", ifsc:"HDFC0000411", uan:"100000000411", pfAccount:"KA/BN/0000411/000/0000001", esic:"00000000000000411", password:"emp123", isHR:false },
  { id:"EMP-0412", firstName:"Kiran", middleName:"Bose", lastName:"Dey", name:"Kiran Bose Dey", dept:"Product", role:"UI/UX Designer", accessLevel:1, ctcLPA:11, joining:"2022-02-07", color:"#0A7E7A", mgr:"EMP-0410", reports:[], loc:"Bengaluru", email:"kiran.dey@doloxe.com", phone:"+91 99200 00412", skills:["Figma","User Research","Visual Design","Prototyping"], perf:4.1, dob:"1996-11-14", age:28, gender:"Male", aadhaar:"9911 3355 7788", pan:"AABCD9911M", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0412", ifsc:"HDFC0000412", uan:"100000000412", pfAccount:"KA/BN/0000412/000/0000001", esic:"00000000000000412", password:"emp123", isHR:false },
  { id:"EMP-0413", firstName:"Pallavi", middleName:"Nanda", lastName:"Rao", name:"Pallavi Nanda Rao", dept:"Product", role:"UI/UX Designer", accessLevel:1, ctcLPA:10, joining:"2022-06-13", color:"#1B45F5", mgr:"EMP-0410", reports:[], loc:"Hyderabad", email:"pallavi.rao@doloxe.com", phone:"+91 99200 00413", skills:["Sketch","UI Design","Motion Design","Brand Identity"], perf:3.9, dob:"1997-08-29", age:27, gender:"Female", aadhaar:"0022 4466 8811", pan:"AABCR0022N", empType:"Full-time", noticePeriod:"1 month", bank:"HDFC Bank", accountNo:"XXXX XXXX 0413", ifsc:"HDFC0000413", uan:"100000000413", pfAccount:"TS/HY/0000413/000/0000001", esic:"00000000000000413", password:"emp123", isHR:false },
];

const HR_MGR_ID = "EMP-0210";
const HR_DIR_ID = "EMP-0200";
const CEO_ID    = "EMP-0001";
const CTO_ID    = "EMP-0100";
const EXEMPT_IDS = [CEO_ID, CTO_ID];

const getLeaveApproverRole = (empId) => {
  if (EXEMPT_IDS.includes(empId)) return "exempt";
  if (empId === HR_DIR_ID) return "ceo-cto-only";
  if (empId === HR_MGR_ID) return "hr-dir-only";
  return "hr-manager";
};

const canApproveLeaveNew = (approver, requestorId) => {
  if (!approver || !requestorId) return false;
  if (EXEMPT_IDS.includes(requestorId)) return false;
  const rule = getLeaveApproverRole(requestorId);
  if (rule === "ceo-cto-only") return approver.id === CEO_ID || approver.id === CTO_ID;
  if (rule === "hr-dir-only") return approver.id === HR_DIR_ID;
  return approver.id === HR_MGR_ID || approver.id === HR_DIR_ID;
};

const getApproverLabel = (empId) => {
  if (EXEMPT_IDS.includes(empId)) return "No approval required";
  if (empId === HR_DIR_ID) return "CEO or CTO must approve";
  if (empId === HR_MGR_ID) return "HR Director must approve";
  return "HR Manager or HR Director";
};

const collectDescendants = (id, acc = new Set()) => {
  acc.add(id);
  const emp = ALL_USERS.find(e => e.id === id);
  if (emp?.reports) emp.reports.forEach(r => collectDescendants(r, acc));
  return acc;
};
const getVisibleEmpIds = (user) => {
  if (!user) return [];
  if (user.accessLevel >= 3) return ALL_USERS.map(u => u.id);
  if (user.accessLevel === 2) return [...collectDescendants(user.id)];
  return [user.id];
};
const getVisibleEmps = (user) => { const ids = getVisibleEmpIds(user); return ALL_USERS.filter(e => ids.includes(e.id)); };
const canManage    = (user) => user?.accessLevel >= 2;
const canViewAll   = (user) => user?.accessLevel >= 3;
const canViewAnalytics = (user) => user?.accessLevel >= 2;
const canSeeSensitiveOf = (viewer, targetId) => viewer?.accessLevel >= 3 || viewer?.id === targetId;

const LEAVE_BALANCES = {
  "EMP-0121": [
    { type:"Earned Leave",total:21,used:7,color:"#1B45F5" },
    { type:"Sick Leave",total:12,used:2,color:"#0F8C5A" },
    { type:"Casual Leave",total:9,used:1,color:"#5C35C2" },
    { type:"Maternity/Paternity",total:0,used:0,color:"#B06010" },
    { type:"Compensatory Off",total:8,used:3,color:"#0A7E7A" },
  ],
};
const DEFAULT_LEAVE_BALANCE = [
  { type:"Earned Leave",total:21,used:3,color:"#1B45F5" },
  { type:"Sick Leave",total:12,used:1,color:"#0F8C5A" },
  { type:"Casual Leave",total:9,used:0,color:"#5C35C2" },
  { type:"Maternity/Paternity",total:0,used:0,color:"#B06010" },
  { type:"Compensatory Off",total:5,used:0,color:"#0A7E7A" },
];

const pad2 = (value) => String(value).padStart(2, "0");
const isoDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const addDaysIso = (date, days) => isoDate(addDays(date, days));
const TODAY = new Date();
const TODAY_STR = isoDate(TODAY);
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH_INDEX = TODAY.getMonth();
const CURRENT_MONTH_KEY = `${CURRENT_YEAR}-${pad2(CURRENT_MONTH_INDEX + 1)}`;
const buildRecentMonthKeys = (count = 5) => Array.from({ length:count }, (_, i) => {
  const d = new Date(CURRENT_YEAR, CURRENT_MONTH_INDEX - (count - 1 - i), 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
});
const currentQuarterLabel = (offset = 0) => {
  const absoluteQuarter = CURRENT_YEAR * 4 + Math.floor(CURRENT_MONTH_INDEX / 3) + offset;
  return `Q${(absoluteQuarter % 4) + 1} ${Math.floor(absoluteQuarter / 4)}`;
};
const FISCAL_START_YEAR = CURRENT_MONTH_INDEX >= 3 ? CURRENT_YEAR : CURRENT_YEAR - 1;
const CURRENT_FY_LABEL = `${FISCAL_START_YEAR}-${String(FISCAL_START_YEAR + 1).slice(2)}`;
const PREVIOUS_FY_LABEL = `${FISCAL_START_YEAR - 1}-${String(FISCAL_START_YEAR).slice(2)}`;
const reviewDueDate = new Date(CURRENT_YEAR, Math.min(CURRENT_MONTH_INDEX + 2, 11), 1);

const INIT_LEAVE_REQS = [
  { id:"LR001", empId:"EMP-0121", emp:"Vikram Anand Sharma",   type:"Earned Leave",    from:addDaysIso(TODAY,2),  to:addDaysIso(TODAY,4),  days:3, reason:"Family function — cousin's wedding", status:"pending",  applied:addDaysIso(TODAY,-1) },
  { id:"LR002", empId:"EMP-0110", emp:"Karthik Ramesh Iyer",   type:"Sick Leave",      from:addDaysIso(TODAY,-10), to:addDaysIso(TODAY,-9), days:2, reason:"Flu recovery — doctor advised rest", status:"approved", applied:addDaysIso(TODAY,-12), approvedBy:"Sudhir Balaji Rao" },
  { id:"LR003", empId:"EMP-0131", emp:"Suresh Babu Rajan",     type:"Earned Leave",    from:addDaysIso(TODAY,-5),  to:addDaysIso(TODAY,-1), days:5, reason:"Vacation to Coorg with family",      status:"approved", applied:addDaysIso(TODAY,-14), approvedBy:"Nisha Arun Pillai" },
  { id:"LR004", empId:"EMP-0211", emp:"Archana Vijay Menon",   type:"Casual Leave",    from:addDaysIso(TODAY,4),  to:addDaysIso(TODAY,4),  days:1, reason:"Bank KYC update and personal errand", status:"approved", applied:addDaysIso(TODAY,-1), approvedBy:"Sudhir Balaji Rao" },
  { id:"LR005", empId:"EMP-0411", emp:"Riya Sunil Shah",       type:"Sick Leave",      from:addDaysIso(TODAY,1),  to:addDaysIso(TODAY,2),  days:2, reason:"Medical appointment — follow-up",    status:"pending",  applied:TODAY_STR },
  { id:"LR006", empId:"EMP-0125", emp:"Rohan Dev Kumar",       type:"Casual Leave",    from:addDaysIso(TODAY,3),  to:addDaysIso(TODAY,3),  days:1, reason:"Bank account opening",               status:"pending",  applied:addDaysIso(TODAY,-1) },
  { id:"LR007", empId:"EMP-0122", emp:"Deepa Krishnan Pillai", type:"Earned Leave",    from:addDaysIso(TODAY,15), to:addDaysIso(TODAY,19), days:5, reason:"Sister's graduation ceremony",       status:"pending",  applied:addDaysIso(TODAY,-2) },
  { id:"LR008", empId:"EMP-0200", emp:"Nisha Arun Pillai",     type:"Earned Leave",    from:addDaysIso(TODAY,2),  to:addDaysIso(TODAY,4),  days:3, reason:"Annual family trip to Ooty",         status:"pending",  applied:TODAY_STR },
  { id:"LR009", empId:"EMP-0210", emp:"Sudhir Balaji Rao",     type:"Sick Leave",      from:addDaysIso(TODAY,1),  to:addDaysIso(TODAY,1),  days:1, reason:"Severe migraine — rest advised",     status:"pending",  applied:TODAY_STR },
  { id:"LR010", empId:"EMP-0312", emp:"Swati Raj Kulkarni",    type:"Sick Leave",      from:addDaysIso(TODAY,-13), to:addDaysIso(TODAY,-12), days:2, reason:"Severe migraine — bed rest",         status:"approved", applied:addDaysIso(TODAY,-13), approvedBy:"Sudhir Balaji Rao" },
  { id:"LR011", empId:"EMP-0413", emp:"Pallavi Nanda Rao",     type:"Earned Leave",    from:addDaysIso(TODAY,8),  to:addDaysIso(TODAY,12), days:5, reason:"Anniversary trip to Goa",            status:"pending",  applied:addDaysIso(TODAY,-1) },
];

const HOLIDAY_MONTH_DAYS = ["01-14","01-26","03-14","03-17","04-14","04-18","05-01","08-15","08-27","10-02","10-20","10-24","11-01","11-05","12-25"];
const HOLIDAYS_CURRENT_YEAR = HOLIDAY_MONTH_DAYS.map(day => `${CURRENT_YEAR}-${day}`);

const generateAttendanceForEmployee = (empId, joinDate) => {
  const records = {};
  const today = TODAY;
  const join  = new Date(joinDate);
  const start = new Date(CURRENT_YEAR, 0, 1);
  const from  = start > join ? start : join;
  for (let d = new Date(from); d <= today; d.setDate(d.getDate() + 1)) {
    const ds = isoDate(d);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { records[ds] = "weekend"; continue; }
    if (HOLIDAYS_CURRENT_YEAR.includes(ds)) { records[ds] = "holiday"; continue; }
    if (ds === TODAY_STR) continue;
    const r = Math.random();
    if (r < 0.88) records[ds] = "present";
    else if (r < 0.93) records[ds] = "late";
    else if (r < 0.96) records[ds] = "absent";
    else records[ds] = "leave";
  }
  return records;
};

const INIT_ATTENDANCE = {};
ALL_USERS.forEach(u => { INIT_ATTENDANCE[u.id] = generateAttendanceForEmployee(u.id, u.joining); });

const INIT_ATTENDANCE_CORRECTIONS = [
  { id:"AC001", empId:"EMP-0121", emp:"Vikram Anand Sharma", date:addDaysIso(TODAY,-3), reason:"Worked from office but forgot to punch in before the daily standup.", status:"pending", requestedAt:addDaysIso(TODAY,-2) },
  { id:"AC002", empId:"EMP-0312", emp:"Swati Raj Kulkarni", date:addDaysIso(TODAY,-7), reason:"Reached office on time, biometric device was unavailable near the finance bay.", status:"approved", requestedAt:addDaysIso(TODAY,-6), actionedBy:"Nisha Arun Pillai", actionedAt:addDaysIso(TODAY,-5) },
  { id:"AC003", empId:"EMP-0411", emp:"Riya Sunil Shah", date:addDaysIso(TODAY,-14), reason:"Forgot to punch out after late design review, requesting present regularisation.", status:"rejected", requestedAt:addDaysIso(TODAY,-13), actionedBy:"Sudhir Balaji Rao", actionedAt:addDaysIso(TODAY,-12) },
];

const PROJS = [
  { name:"Customer Portal v3",    subtasks:["Frontend Components","Checkout Flow","API Integration","Testing","Bug Fixes"] },
  { name:"Mobile App Redesign",   subtasks:["Wireframing","UI Screens","Prototyping","Developer Handoff"] },
  { name:"API Gateway Migration", subtasks:["Rate Limiting","Auth Middleware","Route Configuration","Load Testing"] },
  { name:"Analytics Dashboard",   subtasks:["D3 Charts","Data Pipeline","KPI Design","Filters & Drilldown"] },
  { name:"Auth Service Refactor", subtasks:["OAuth2 Setup","Session Management","Token Refresh","Security Audit"] },
];
const getWeekKey = (date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff)); return isoDate(mon); };
const THIS_WEEK = getWeekKey(TODAY);
const LAST_WEEK = addDaysIso(THIS_WEEK, -7);

const INIT_TIMESHEETS = {
  [`EMP-0121_${THIS_WEEK}`]: { empId:"EMP-0121", weekKey:THIS_WEEK, entries:[
    { id:"TL001", date:THIS_WEEK, project:"Customer Portal v3", subtask:"Frontend Components", hours:6.5, notes:"Built product listing cards" },
    ...(THIS_WEEK !== TODAY_STR ? [{ id:"TL002", date:TODAY_STR, project:"API Gateway Migration", subtask:"Auth Middleware", hours:7.0, notes:"JWT validation pipeline" }] : []),
  ], totalHours:THIS_WEEK !== TODAY_STR ? 13.5 : 6.5, status:"draft" },
  [`EMP-0121_${LAST_WEEK}`]: { empId:"EMP-0121", weekKey:LAST_WEEK, entries:[
    { id:"TL101", date:LAST_WEEK, project:"Customer Portal v3", subtask:"Checkout Flow", hours:8.0, notes:"Payment gateway integration" },
    { id:"TL102", date:addDaysIso(LAST_WEEK,1), project:"Customer Portal v3", subtask:"API Integration", hours:8.0, notes:"Cart sync API" },
    { id:"TL103", date:addDaysIso(LAST_WEEK,2), project:"Auth Service Refactor", subtask:"OAuth2 Setup", hours:8.0, notes:"Google & GitHub OAuth2" },
    { id:"TL104", date:addDaysIso(LAST_WEEK,3), project:"Auth Service Refactor", subtask:"Session Management", hours:8.0, notes:"Redis-backed sessions" },
    { id:"TL105", date:addDaysIso(LAST_WEEK,4), project:"Analytics Dashboard", subtask:"Data Pipeline", hours:8.0, notes:"Kafka consumer" },
  ], totalHours:40.0, status:"approved", approvedBy:"Sudhir Balaji Rao" },
};

const PERF_GOALS_BY_EMP = {
  "EMP-0121": [
    { title:"Deliver Customer Portal v3 — all 3 sprints", target:currentQuarterLabel(), progress:75, status:"on-track", key:true, notes:"Sprint 1 & 2 done." },
    { title:"Reduce frontend bundle size by 35%", target:currentQuarterLabel(), progress:90, status:"on-track", key:true, notes:"Achieved 32% via code-splitting." },
    { title:"Complete AWS Solutions Architect cert", target:currentQuarterLabel(1), progress:35, status:"at-risk", key:false, notes:"Exam booked for the next quarter." },
  ],
};
const DEFAULT_GOALS = [
  { title:"Complete all assigned sprint tasks on time", target:currentQuarterLabel(), progress:80, status:"on-track", key:true, notes:"On track." },
  { title:"Improve code review turnaround to < 24h", target:currentQuarterLabel(), progress:60, status:"on-track", key:false, notes:"Currently 26h avg." },
  { title:"Complete department-level upskilling module", target:currentQuarterLabel(1), progress:40, status:"at-risk", key:false, notes:"Module 2 of 5." },
];
const REVIEWS_BY_EMP = {
  "EMP-0121": [
    { period:currentQuarterLabel(-1), manager:"Sneha Anil Kulkarni", score:4.2, status:"complete", date:addDaysIso(TODAY,-45), feedback:"Strong delivery on checkout module." },
    { period:currentQuarterLabel(), manager:"Sneha Anil Kulkarni", score:null, status:"pending", date:isoDate(reviewDueDate), feedback:"" },
  ],
};
const DEFAULT_REVIEWS = [
  { period:currentQuarterLabel(-1), manager:"Direct Manager", score:3.8, status:"complete", date:addDaysIso(TODAY,-45), feedback:"Good effort. Continue building depth." },
  { period:currentQuarterLabel(), manager:"Direct Manager", score:null, status:"pending", date:isoDate(reviewDueDate), feedback:"" },
];
const SKILLS_BY_EMP = {
  "EMP-0121": [{ name:"Technical Execution",score:4.5 },{ name:"Communication",score:3.8 },{ name:"Collaboration",score:4.2 },{ name:"Problem Solving",score:4.6 },{ name:"Code Quality",score:4.4 }],
};
const DEFAULT_SKILLS = [
  { name:"Technical Execution",score:3.8 },{ name:"Communication",score:3.6 },
  { name:"Collaboration",score:4.0 },{ name:"Problem Solving",score:3.9 },{ name:"Delivery",score:3.7 },
];
const DOCS_BY_EMP = {
  "EMP-0121": [
    { name:"Appointment Letter",type:"PDF",date:"2021-01-10",size:"194 KB",cat:"Legal",ico:"📄",status:"signed" },
    { name:"Promotion Letter — Senior SWE",type:"PDF",date:"2024-10-01",size:"112 KB",cat:"Career",ico:"🎖️",status:"signed" },
    { name:`Form 16 — FY ${PREVIOUS_FY_LABEL}`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,5,15)),size:"328 KB",cat:"Tax",ico:"🏛️",status:"available" },
    { name:`PF Statement FY ${CURRENT_FY_LABEL}`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,CURRENT_MONTH_INDEX,1)),size:"215 KB",cat:"PF",ico:"💼",status:"available" },
    { name:`Employee Handbook v${CURRENT_YEAR}.1`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,0,15)),size:"1.4 MB",cat:"Policy",ico:"📚",status:"available" },
  ],
};
const DEFAULT_DOCS = [
  { name:"Appointment Letter",type:"PDF",date:"2022-01-10",size:"189 KB",cat:"Legal",ico:"📄",status:"signed" },
  { name:"NDA Agreement",type:"PDF",date:"2022-01-10",size:"156 KB",cat:"Legal",ico:"🔒",status:"signed" },
  { name:`Form 16 — FY ${PREVIOUS_FY_LABEL}`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,5,15)),size:"310 KB",cat:"Tax",ico:"🏛️",status:"available" },
  { name:`PF Statement FY ${CURRENT_FY_LABEL}`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,CURRENT_MONTH_INDEX,1)),size:"205 KB",cat:"PF",ico:"💼",status:"available" },
  { name:`Employee Handbook v${CURRENT_YEAR}.1`,type:"PDF",date:isoDate(new Date(CURRENT_YEAR,0,15)),size:"1.4 MB",cat:"Policy",ico:"📚",status:"available" },
];
const POLICY_LIST = [
  { name:"Remote Work Policy",acked:true,date:"2024-11-15",version:"v2.1" },
  { name:"Code of Conduct",acked:true,date:"2024-11-15",version:"v3.0" },
  { name:"POSH Policy",acked:true,date:"2024-11-15",version:"v1.5" },
  { name:"Data Security & ISMS Policy",acked:true,date:"2024-11-15",version:"v4.2" },
  { name:`Expense Reimbursement Policy ${CURRENT_YEAR}`,acked:false,date:addDaysIso(TODAY,-75),version:"v2.3" },
  { name:`Travel & Accommodation Policy ${CURRENT_YEAR}`,acked:false,date:addDaysIso(TODAY,-75),version:"v2.0" },
  { name:"Bring Your Own Device (BYOD) Policy",acked:false,date:addDaysIso(TODAY,-28),version:"v1.0" },
];
const ANNOUNCEMENTS = [
  { id:1, title:`DOLOXE ${currentQuarterLabel(-1)} Results — Best Quarter Yet!`, body:`We crossed ₹10Cr ARR this quarter, up 34% YoY. All-hands celebration is this Friday, ${TODAY.toLocaleDateString("en-IN",{ month:"short", day:"numeric" })} at 5:30pm IST.`, author:"CEO Office — Arjun Mehta", date:addDaysIso(TODAY,-2), cat:"Company", read:false, important:true },
  { id:2, title:`Updated Leave Policy for FY ${CURRENT_FY_LABEL}`, body:`Starting ${addDays(TODAY,14).toLocaleDateString("en-IN",{ month:"long", day:"numeric", year:"numeric" })}: Earned Leave carryforward limit increases from 21 to 30 days.`, author:"People Ops — Nisha Pillai", date:addDaysIso(TODAY,-3), cat:"HR", read:true, important:true },
  { id:3, title:`${TODAY.toLocaleDateString("en-IN",{ month:"long" })} Celebrations — Birthdays & Anniversaries!`, body:"Birthdays and work anniversaries for this month are now available in the HR calendar.", author:"HR Team", date:addDaysIso(TODAY,-4), cat:"Celebration", read:false, important:false },
  { id:4, title:`Mandatory ISMS Cybersecurity Training — Complete by ${addDays(TODAY,7).toLocaleDateString("en-IN",{ month:"short", day:"numeric" })}`, body:"ISO 27001 compliance requires all employees to complete the annual information security training module (~45 mins).", author:"IT Security — Rajesh Singh", date:addDaysIso(TODAY,-6), cat:"IT", read:true, important:true },
  { id:5, title:`Annual Salary Revisions — Effective ${addDays(TODAY,14).toLocaleDateString("en-IN",{ month:"long", day:"numeric", year:"numeric" })}`, body:"Individual revision letters will be emailed this month. High performers will receive revised compensation letters first.", author:"People Ops — Sudhir Rao", date:addDaysIso(TODAY,-12), cat:"HR", read:false, important:true },
];
const HIRING_PIPELINE = [
  { role:"Senior Backend Engineer",dept:"Engineering",openings:2,applied:47,shortlisted:12,interviewed:6,offered:1,status:"active" },
  { role:"DevOps Engineer",dept:"Engineering",openings:1,applied:31,shortlisted:8,interviewed:3,offered:0,status:"active" },
  { role:"UI/UX Designer",dept:"Product",openings:1,applied:28,shortlisted:7,interviewed:4,offered:1,status:"offer-out" },
  { role:"Accountant",dept:"Finance",openings:1,applied:19,shortlisted:5,interviewed:2,offered:0,status:"active" },
];
const ATTRITION_DATA = [
  { name:"Rahul Desai",dept:"Engineering",role:"SWE",resigned:addDaysIso(TODAY,-64),lwd:addDaysIso(TODAY,-34),reason:"Better offer (40% hike)" },
  { name:"Anita Bose",dept:"HR",role:"Recruiter",resigned:addDaysIso(TODAY,-88),lwd:addDaysIso(TODAY,-58),reason:"Relocation" },
  { name:"Saurabh Mehta",dept:"Finance",role:"Accountant",resigned:addDaysIso(TODAY,-128),lwd:addDaysIso(TODAY,-98),reason:"MBA — full-time" },
];

const AccessDenied = () => (
  <div style={{ padding:"60px 20px", textAlign:"center" }}>
    <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
    <div style={{ fontFamily:"var(--display)", fontSize:18, fontWeight:700, marginBottom:8 }}>Access Restricted</div>
    <div style={{ fontSize:13, color:"var(--ink3)", maxWidth:300, margin:"0 auto" }}>You don't have permission to view this section.</div>
  </div>
);

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const tryLogin = () => {
    const user = ALL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) { setErr(""); onLogin(user); } else setErr("Invalid credentials.");
  };
  const demoAccounts = ["EMP-0001","EMP-0100","EMP-0200","EMP-0210","EMP-0300","EMP-0400","EMP-0110","EMP-0120","EMP-0121","EMP-0125"].map(id => ALL_USERS.find(u => u.id === id)).filter(Boolean);
  const levelLabel = (al) => al >= 4 ? "CEO" : al === 3 ? "Director" : al === 2 ? "Manager" : "Employee";
  const levelColor = (al) => al >= 4 ? "#1B45F5" : al === 3 ? "#BE2B5A" : al === 2 ? "#5C35C2" : "#0F8C5A";

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-logo">
          <div style={{ width:38, height:38, borderRadius:10, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div style={{ fontFamily:"var(--display)", fontSize:17, fontWeight:700, letterSpacing:"-0.3px" }}>DOLOXE<span style={{ color:"var(--accent)" }}> INDIA PVT LTD.</span></div>
            <div style={{ fontSize:11, color:"var(--ink3)" }}>People Operations Platform</div>
          </div>
        </div>
        <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Sign in</div>
        <div style={{ fontSize:12.5, color:"var(--ink3)", marginBottom:20 }}>Use your company email and password</div>
        <div className="login-field"><div className="flbl" style={{ marginBottom:5 }}>Email</div><input className="finp" type="email" placeholder="you@doloxe.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/></div>
        <div className="login-field"><div className="flbl" style={{ marginBottom:5 }}>Password</div><input className="finp" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}/></div>
        {err && <div style={{ color:"var(--red)", fontSize:12, marginBottom:10, padding:"6px 10px", background:"var(--red-soft)", borderRadius:"var(--r8)" }}>{err}</div>}
        <button className="btn btn-p" style={{ width:"100%", justifyContent:"center", padding:"9px", marginBottom:6 }} onClick={tryLogin}>Sign in →</button>
        <hr style={{ border:"none", borderTop:"1px solid var(--brd)", margin:"18px 0" }}/>
        <div className="flbl" style={{ marginBottom:10 }}>Quick access — demo accounts</div>
        <div className="quick-login">
          {demoAccounts.map(u => (
            <button key={u.id} className="ql-btn" onClick={() => onLogin(u)}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                <div className="avt" style={{ width:20, height:20, fontSize:8, background:u.color }}>{u.firstName[0]}{u.lastName[0]}</div>
                <span className="ql-name">{u.firstName} {u.lastName.charAt(0)}.</span>
                <span style={{ marginLeft:"auto", fontSize:9, fontWeight:700, padding:"1px 5px", borderRadius:3, background:levelColor(u.accessLevel)+"18", color:levelColor(u.accessLevel) }}>{levelLabel(u.accessLevel)}</span>
              </div>
              <div className="ql-role">{u.role}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize:10.5, color:"var(--ink4)", textAlign:"center" }}>Passwords: <span style={{ fontFamily:"var(--mono)" }}>ceo123 / cto123 / hr123 / mgr123 / emp123</span></div>
      </div>
    </div>
  );
};

// ─── ATTENDANCE ────────────────────────────────────────────────────────────────
const AttendanceMod = ({ currentUser }) => {
  const [attendance, setAttendance] = useState(INIT_ATTENDANCE);
  const [tab, setTab] = useState("my");
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH_KEY);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [selEmpId, setSelEmpId] = useState(currentUser.id);
  const [teamFilter, setTeamFilter] = useState("all");
  const [corrections, setCorrections] = useState(INIT_ATTENDANCE_CORRECTIONS);
  const [corrFilter, setCorrFilter] = useState("all");
  const [corrModal, setCorrModal] = useState(false);
  const [corrForm, setCorrForm] = useState({ date:"", reason:"" });

  const visibleEmps = getVisibleEmps(currentUser);
  const canViewTeam = canManage(currentUser) || currentUser.isHR;
  const isHRorAdmin = currentUser.isHR || currentUser.accessLevel >= 3;
  const canApproveAttendance = currentUser.isHR;
  const myAtt = attendance[currentUser.id] || {};
  const selectedAtt = attendance[selEmpId] || {};
  const [yr, mo] = selMonth.split("-").map(Number);
  const dim = new Date(yr, mo, 0).getDate();
  const fd  = new Date(yr, mo-1, 1).getDay();
  const todayStr = TODAY_STR;

  const getMonthStats = (attData) => {
    let present=0, absent=0, late=0, leave=0, holidays=0;
    for (let d=1; d<=dim; d++) {
      const ds = `${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      const st = attData[ds];
      if (st==="present") present++; else if (st==="absent") absent++; else if (st==="late") late++; else if (st==="leave") leave++; else if (st==="holiday") holidays++;
    }
    return { present, absent, late, leave, holidays };
  };

  const myStats = getMonthStats(myAtt);
  const handleCheckIn = () => {
    const now = new Date();
    const t = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    setCheckedIn(true); setCheckInTime(t);
    const minutes = now.getHours() * 60 + now.getMinutes();
    const status = minutes > 660 ? "absent" : minutes >= 630 ? "late" : "present";
    setAttendance(prev => ({ ...prev, [currentUser.id]: { ...(prev[currentUser.id]||{}), [todayStr]: status } }));
  };
  const handleCheckOut = () => { setCheckOutTime(new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })); setCheckedIn(false); };

  const attClass = (st) => {
    if (st==="present") return "att-present"; if (st==="late") return "att-late"; if (st==="absent") return "att-absent";
    if (st==="leave") return "att-leave"; if (st==="holiday") return "att-holiday"; if (st==="weekend") return "att-wknd";
    return "att-future";
  };
  const attLabel = (st) => { if (st==="present") return "P"; if (st==="late") return "L"; if (st==="absent") return "A"; if (st==="leave") return "LV"; if (st==="holiday") return "H"; if (st==="weekend") return "—"; return ""; };
  const attBadge = (st) => {
    if (!st) return <span className="bdg bdg-gray">—</span>;
    if (st==="present") return <span className="bdg bdg-g">Present</span>;
    if (st==="late") return <span className="bdg bdg-a">Late</span>;
    if (st==="absent") return <span className="bdg bdg-r">Absent</span>;
    if (st==="leave") return <span className="bdg bdg-b">On Leave</span>;
    if (st==="holiday") return <span className="bdg bdg-p">Holiday</span>;
    return <span className="bdg bdg-gray">{st}</span>;
  };

  const teamToday = visibleEmps.map(e => ({ emp:e, status:(attendance[e.id]||{})[todayStr] }));
  const teamFiltered = teamToday.filter(x => teamFilter==="all" || x.status===teamFilter);
  const visibleCorrections = corrections
    .filter(r => canApproveAttendance || r.empId === currentUser.id)
    .filter(r => corrFilter === "all" || r.status === corrFilter);
  const pendingCorrections = corrections.filter(r => r.status === "pending");
  const months = buildRecentMonthKeys();
  const monthLabel = (m) => { const [y,mo]=m.split("-"); return new Date(+y,+mo-1,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"}); };

  const statusText = (s) => {
    if (s === "approved") return <span className="bdg bdg-g">Approved</span>;
    if (s === "rejected") return <span className="bdg bdg-r">Rejected</span>;
    return <span className="bdg bdg-a">Pending</span>;
  };

  const submitCorrection = () => {
    const reason = corrForm.reason.trim();
    if (!corrForm.date || reason.length < 10) return;
    const duplicate = corrections.some(r => r.empId === currentUser.id && r.date === corrForm.date && r.status === "pending");
    if (duplicate) return;
    setCorrections(prev => [{
      id:`AC${String(prev.length + 1).padStart(3, "0")}`,
      empId:currentUser.id,
      emp:currentUser.name,
      date:corrForm.date,
      reason,
      status:"pending",
      requestedAt:todayStr,
    }, ...prev]);
    setCorrModal(false);
    setCorrForm({ date:"", reason:"" });
  };

  const approveCorrection = (requestId) => {
    const req = corrections.find(r => r.id === requestId);
    if (!req || !canApproveAttendance) return;
    setCorrections(prev => prev.map(r => r.id === requestId ? { ...r, status:"approved", actionedBy:currentUser.name, actionedAt:todayStr } : r));
    setAttendance(prev => ({
      ...prev,
      [req.empId]: { ...(prev[req.empId] || {}), [req.date]:"present" },
    }));
  };

  const rejectCorrection = (requestId) => {
    if (!canApproveAttendance) return;
    setCorrections(prev => prev.map(r => r.id === requestId ? { ...r, status:"rejected", actionedBy:currentUser.name, actionedAt:todayStr } : r));
  };

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">Attendance</div>
          <div className="ph-sub">Daily tracking, missed punch requests and HR approval</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button className="btn btn-p" onClick={()=>setCorrModal(true)}><Icon n="plus" s={13}/>Missed Punch Request</button>
          <select className="fsel" style={{ width:170 }} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
            {months.map(m=><option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="ch"><div className="ct"><Icon n="clockin" s={14}/>Today — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>{attBadge(attendance[currentUser.id]?.[todayStr])}</div>
          <div className="cb">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[{ l:"Clock-in", v:checkInTime||"—:——", c:"var(--green)" },{ l:"Clock-out", v:checkOutTime||"—:——", c:"var(--red)" },{ l:"Hours", v:checkOutTime?"8h 40m":checkInTime?"ongoing":"—", c:"var(--accent)" }].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"10px 6px", background:"var(--raised)", borderRadius:"var(--r8)", border:"1px solid var(--brd)" }}>
                  <div style={{ fontSize:10.5, color:"var(--ink3)", marginBottom:3 }}>{s.l}</div>
                  <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:13.5, color:s.c }}>{s.v}</div>
                </div>
              ))}
            </div>
            {!checkedIn && !checkOutTime && <button className="reg-btn" onClick={handleCheckIn}>Clock In</button>}
            {checkedIn && <button className="reg-btn checked-in" onClick={handleCheckOut}>Clock Out · In since {checkInTime}</button>}
            {checkOutTime && !checkedIn && <div style={{ background:"var(--green-soft)", border:"1px solid rgba(15,140,90,0.2)", borderRadius:"var(--r8)", padding:"10px 14px", textAlign:"center" }}><div style={{ fontWeight:700, color:"var(--green)" }}>Day complete</div><div style={{ fontSize:12, color:"var(--ink3)" }}>{checkInTime} → {checkOutTime}</div></div>}
          </div>
        </div>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="ch"><div className="ct"><Icon n="chart" s={14}/>My Stats — {monthLabel(selMonth)}</div></div>
          <div className="cb">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {[
                { v:myStats.present, l:"Present", c:"var(--green)", bg:"var(--green-soft)" },
                { v:myStats.late,    l:"Late",    c:"var(--amber)", bg:"var(--amber-soft)" },
                { v:myStats.absent,  l:"Absent",  c:"var(--red)",   bg:"var(--red-soft)"   },
                { v:myStats.leave,   l:"Leave",   c:"var(--accent)",bg:"var(--accent-soft)" },
                { v:myStats.holidays,l:"Holidays",c:"var(--purple)",bg:"var(--purple-soft)"},
                { v:Math.round((myStats.present+myStats.late)/(dim-myStats.holidays-Math.floor(dim/7)*2)*100)||0, l:"Attendance %", c:"var(--teal)", bg:"var(--teal-soft)", suffix:"%" },
              ].map(s=>(
                <div key={s.l} style={{ textAlign:"center", padding:"10px 6px", background:s.bg, borderRadius:"var(--r8)" }}>
                  <div style={{ fontFamily:"var(--display)", fontWeight:700, fontSize:20, color:s.c }}>{s.v}{s.suffix||""}</div>
                  <div style={{ fontSize:10, color:s.c, fontWeight:700, marginTop:2, textTransform:"uppercase", letterSpacing:"0.5px" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sg">
        {[
          { v:myStats.present, l:"Days Present", s:monthLabel(selMonth), c:"#0F8C5A" },
          { v:myStats.absent,  l:"Days Absent",  s:"Unauthorised",       c:"#C8312A" },
          { v:myStats.late,    l:"Late Arrivals", s:"10:30–11:00 AM",    c:"#B06010" },
          { v:canViewTeam ? `${teamToday.filter(x=>x.status==="present"||x.status==="late").length}/${teamToday.length}` : `${Math.round((myStats.present+myStats.late)/(dim-myStats.holidays-8)*100)||0}%`,
            l:canViewTeam?"Team Present Today":"My Attendance Rate", s:canViewTeam?"As of now":"This month", c:"#5C35C2" },
        ].map((s,i)=>(
          <div className="sc" key={i}>
            <div className="sc-accent" style={{ background:s.c }}/>
            <div className="sc-val" style={{ marginTop:10 }}>{s.v}</div>
            <div className="sc-lbl">{s.l}</div>
            <div className="sc-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {["my","calendar","corrections",...(canViewTeam?["team"]:[]),...(isHRorAdmin?["reports"]:[])].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="my"?"My Log":t==="calendar"?"Calendar":t==="corrections"?`Corrections${canApproveAttendance&&pendingCorrections.length>0?` · ${pendingCorrections.length}`:""}`:t==="team"?"Team Today":"Reports"}
          </div>
        ))}
      </div>

      {tab==="my" && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="attend" s={14}/>My Daily Log — {monthLabel(selMonth)}</div></div>
          <div className="tw" style={{ maxHeight:440, overflowY:"auto" }}>
            <table>
              <thead><tr><th>Date</th><th>Day</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th><th>Notes</th></tr></thead>
              <tbody>
                {Array.from({length:dim}).map((_,i)=>{
                  const d=i+1;
                  const ds=`${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const dt=new Date(yr,mo-1,d);
                  const dayName=dt.toLocaleDateString("en-IN",{weekday:"short"});
                  const st=myAtt[ds];
                  const isFuture=ds>todayStr; const isToday=ds===todayStr;
                  if (!st&&isFuture&&!isToday) return null;
                  const mockIn=st==="present"?"09:05":st==="late"?"10:45":null;
                  const mockOut=st==="present"||st==="late"?"18:15":null;
                  return (
                    <tr key={ds} style={{ background:isToday?"rgba(27,69,245,0.03)":"" }}>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{ds}{isToday&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:6 }}>Today</span>}</td>
                      <td className="t3 tsm">{dayName}</td>
                      <td>{attBadge(st)}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--green)" }}>{isToday&&checkInTime?checkInTime:mockIn||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--red)" }}>{isToday&&checkOutTime?checkOutTime:mockOut||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{isToday&&checkOutTime?"8h 40m":st==="present"||st==="late"?"9h 10m":"—"}</td>
                      <td className="t3 tsm">{st==="late"?"10:30–11:00 AM window":st==="absent"?"Unmarked":st==="leave"?"Approved leave":st==="holiday"?"Public holiday":"—"}</td>
                    </tr>
                  );
                }).filter(Boolean)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="calendar" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="cal" s={14}/>Calendar — {monthLabel(selMonth)}</div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {[["att-present","Present"],["att-late","Late"],["att-absent","Absent"],["att-leave","Leave"],["att-holiday","Holiday"]].map(([cls,lbl])=>(
                <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--ink3)" }}>
                  <div className={`att-day ${cls}`} style={{ width:14, height:14, borderRadius:3, fontSize:8 }}></div>{lbl}
                </div>
              ))}
            </div>
          </div>
          <div className="cb">
            {canViewTeam && (
              <div className="fgrp" style={{ marginBottom:14, maxWidth:240 }}>
                <div className="flbl">View employee</div>
                <select className="fsel" value={selEmpId} onChange={e=>setSelEmpId(e.target.value)}>
                  {visibleEmps.map(e=><option key={e.id} value={e.id}>{e.name}{e.id===currentUser.id?" (You)":""}</option>)}
                </select>
              </div>
            )}
            <div className="att-grid" style={{ marginBottom:8 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=>(
                <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", padding:"4px 0" }}>{d}</div>
              ))}
            </div>
            <div className="att-grid">
              {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:dim}).map((_,i)=>{
                const d=i+1;
                const ds=`${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                const st=(canViewTeam?selectedAtt:myAtt)[ds];
                const isFuture=ds>todayStr; const isToday=ds===todayStr;
                return (
                  <div key={d} className={`att-day ${isFuture&&!isToday?"att-future":attClass(st)} ${isToday?"att-today":""}`} style={{ fontSize:10 }}>
                    <span style={{ fontSize:11, fontWeight:600 }}>{d}</span>
                    {!isFuture&&st&&<span style={{ fontSize:8 }}>{attLabel(st)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab==="corrections" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="shield" s={14}/>{canApproveAttendance ? "Attendance Correction Approvals" : "My Missed Punch Requests"}</div>
            <div style={{ display:"flex", gap:5 }}>
              {["all","pending","approved","rejected"].map(f=>(
                <div key={f} className={`pill${corrFilter===f?" active":""}`} onClick={()=>setCorrFilter(f)} style={{ fontSize:11 }}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>
              ))}
            </div>
          </div>
          <div className="tw" style={{ maxHeight:460, overflowY:"auto" }}>
            <table>
              <thead><tr><th>Employee</th><th>Date Missed</th><th>Current Status</th><th>Explanation</th><th>Requested</th><th>Decision</th><th>Actions</th></tr></thead>
              <tbody>
                {visibleCorrections.map(r=>{
                  const emp = ALL_USERS.find(e => e.id === r.empId);
                  const currentStatus = attendance[r.empId]?.[r.date];
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {emp&&<div className="avt" style={{ width:26, height:26, background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div>}
                          <div><div className="fw7">{r.emp}{r.empId===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9, marginLeft:4 }}>You</span>}</div><div className="t3 tsm">{r.empId}</div></div>
                        </div>
                      </td>
                      <td className="mono tsm">{r.date}</td>
                      <td>{attBadge(currentStatus)}</td>
                      <td className="t3 tsm" style={{ maxWidth:260 }}>{r.reason}</td>
                      <td className="mono tsm">{r.requestedAt}</td>
                      <td>{statusText(r.status)}<div className="t3 tsm">{r.actionedBy ? `${r.actionedBy} · ${r.actionedAt}` : "HR department only"}</div></td>
                      <td>
                        {canApproveAttendance && r.status === "pending" ? (
                          <div style={{ display:"flex", gap:4 }}>
                            <button className="btn btn-s btn-sm" onClick={()=>approveCorrection(r.id)}>Mark Present</button>
                            <button className="btn btn-d btn-sm" onClick={()=>rejectCorrection(r.id)}>Reject</button>
                          </div>
                        ) : <span className="t3">—</span>}
                      </td>
                    </tr>
                  );
                })}
                {!visibleCorrections.length&&<tr><td colSpan={7}><div className="empty">No attendance correction requests found</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="team" && canViewTeam && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="users" s={14}/>Team Today — {todayStr}</div>
            <div style={{ display:"flex", gap:5 }}>
              {["all","present","late","absent","leave"].map(f=>(
                <div key={f} className={`pill${teamFilter===f?" active":""}`} onClick={()=>setTeamFilter(f)} style={{ fontSize:11 }}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>
              ))}
            </div>
          </div>
          <div className="tw" style={{ maxHeight:440, overflowY:"auto" }}>
            <table>
              <thead><tr><th>Employee</th><th>Dept</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th></tr></thead>
              <tbody>
                {teamFiltered.map(({emp,status})=>{
                  const mockIn=status==="present"?"09:03":status==="late"?"10:45":null;
                  const mockOut=status==="present"||status==="late"?"18:10":null;
                  return (
                    <tr key={emp.id}>
                      <td><div style={{ display:"flex",alignItems:"center",gap:8 }}><div className="avt" style={{ width:28,height:28,background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div><div className="fw7">{emp.name}{emp.id===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div></div></td>
                      <td><span className="bdg bdg-b">{emp.dept}</span></td>
                      <td>{attBadge(status)}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--green)" }}>{emp.id===currentUser.id&&checkInTime?checkInTime:mockIn||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--red)" }}>{emp.id===currentUser.id&&checkOutTime?checkOutTime:mockOut||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12 }}>{status==="present"||status==="late"?"9h 10m":"—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="reports" && isHRorAdmin && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="analytics" s={14}/>Organisation Attendance — {monthLabel(selMonth)}</div></div>
          <div className="tw" style={{ maxHeight:500, overflowY:"auto" }}>
            <table>
              <thead><tr><th>Employee</th><th>Dept</th><th>Present</th><th>Late</th><th>Absent</th><th>Leave</th><th>Holidays</th><th>Rate</th></tr></thead>
              <tbody>
                {ALL_USERS.map(e=>{
                  const st=getMonthStats(attendance[e.id]||{});
                  const workDays=dim-st.holidays-Math.floor(dim/7)*2;
                  const pct=workDays>0?Math.round(((st.present+st.late)/workDays)*100):0;
                  return (
                    <tr key={e.id}>
                      <td><div style={{ display:"flex",alignItems:"center",gap:8 }}><div className="avt" style={{ width:26,height:26,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div className="fw7">{e.name}</div></div></td>
                      <td><span className="bdg bdg-b">{e.dept}</span></td>
                      <td style={{ color:"var(--green)",fontWeight:650 }}>{st.present}</td>
                      <td style={{ color:"var(--amber)",fontWeight:650 }}>{st.late}</td>
                      <td style={{ color:"var(--red)",fontWeight:650 }}>{st.absent}</td>
                      <td style={{ color:"var(--accent)",fontWeight:650 }}>{st.leave}</td>
                      <td style={{ color:"var(--purple)" }}>{st.holidays}</td>
                      <td>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <div style={{ flex:1,height:5,background:"var(--brd)",borderRadius:3,overflow:"hidden",minWidth:60 }}>
                            <div style={{ width:`${pct}%`,height:"100%",background:pct>=90?"var(--green)":pct>=75?"var(--amber)":"var(--red)",borderRadius:3 }}/>
                          </div>
                          <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:pct>=90?"var(--green)":pct>=75?"var(--amber)":"var(--red)",minWidth:36 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {corrModal && (
        <Modal title="Missed Punch Request" onClose={()=>setCorrModal(false)} footer={<><button className="btn" onClick={()=>setCorrModal(false)}>Cancel</button><button className="btn btn-p" onClick={submitCorrection}>Submit to HR</button></>}>
          <div className="fg">
            <div className="fgrp">
              <div className="flbl">Missed attendance date</div>
              <input className="finp" type="date" value={corrForm.date} onChange={e=>setCorrForm(p=>({...p,date:e.target.value}))}/>
            </div>
            <div className="fgrp">
              <div className="flbl">Requested status</div>
              <input className="finp" value="Present" readOnly/>
            </div>
            <div className="fgrp ff">
              <div className="flbl">Explanation for HR</div>
              <textarea className="ftxt" placeholder="Explain why attendance was missed even though you worked from office..." value={corrForm.reason} onChange={e=>setCorrForm(p=>({...p,reason:e.target.value}))}/>
            </div>
          </div>
          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--amber-soft)", border:"1px solid rgba(176,96,16,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--amber)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="shield" s={13}/> Only the HR department can approve and mark this attendance as present.
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── LEAVE MODULE ──────────────────────────────────────────────────────────────
const LeaveMod = ({ currentUser }) => {
  const visibleEmps = getVisibleEmps(currentUser);
  const [tab, setTab] = useState("requests");
  const [reqs, setReqs] = useState(INIT_LEAVE_REQS);
  const [fil, setFil] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type:"Earned Leave", from:"", to:"", reason:"", empId:currentUser.id });

  const today=new Date(); const yr=today.getFullYear(); const mo=today.getMonth();
  const dim=new Date(yr,mo+1,0).getDate(); const fd=new Date(yr,mo,1).getDay();
  const myBalance = LEAVE_BALANCES[currentUser.id] || DEFAULT_LEAVE_BALANCE;
  const isExempt = EXEMPT_IDS.includes(currentUser.id);

  const relevantReqs = reqs.filter(r => {
    if (r.empId===currentUser.id) return true;
    if (currentUser.id===HR_DIR_ID&&r.empId===HR_MGR_ID) return true;
    if ((currentUser.id===CEO_ID||currentUser.id===CTO_ID)&&r.empId===HR_DIR_ID) return true;
    if (currentUser.id===HR_DIR_ID||currentUser.id===HR_MGR_ID) return true;
    return false;
  });

  const filtered = relevantReqs.filter(r => fil==="all"||r.status===fil);
  const pendingActionable = relevantReqs.filter(r => r.status==="pending"&&r.empId!==currentUser.id&&canApproveLeaveNew(currentUser,r.empId));

  const showApproveFor = (r) => r.status==="pending"&&r.empId!==currentUser.id&&canApproveLeaveNew(currentUser,r.empId);

  const dayS = (d) => {
    const dt=new Date(yr,mo,d);
    if (dt.getDay()===0||dt.getDay()===6) return "wknd";
    const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const myLeave=reqs.find(r=>r.empId===currentUser.id&&r.status==="approved"&&ds>=r.from&&ds<=r.to);
    if (myLeave) return "leave";
    if (d<today.getDate()) return "present";
    if (d===today.getDate()) return "today";
    return "";
  };

  const sbdg = (s) => {
    if (s==="approved") return <span className="bdg bdg-g">Approved</span>;
    if (s==="rejected") return <span className="bdg bdg-r">Rejected</span>;
    return <span className="bdg bdg-a">Pending</span>;
  };

  const submit = () => {
    if (!form.from||!form.to||!form.reason) return;
    const emp=ALL_USERS.find(e=>e.id===form.empId);
    setReqs(p=>[{ id:`LR${String(p.length+1).padStart(3,"0")}`,empId:form.empId,emp:emp?.name||"",type:form.type,from:form.from,to:form.to,days:Math.max(1,Math.ceil((new Date(form.to)-new Date(form.from))/86400000)+1),reason:form.reason,status:"pending",applied:TODAY_STR },...p]);
    setModal(false); setForm({ type:"Earned Leave",from:"",to:"",reason:"",empId:currentUser.id });
  };
  const handleApprove = (rId) => setReqs(p=>p.map(x=>x.id===rId?{...x,status:"approved",approvedBy:currentUser.name}:x));
  const handleReject  = (rId) => setReqs(p=>p.map(x=>x.id===rId?{...x,status:"rejected",approvedBy:currentUser.name}:x));

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">Time Off</div>
          <div className="ph-sub">{isExempt ? "CEO / CTO — time off is self-managed" : `Approver: ${getApproverLabel(currentUser.id)}`}</div>
        </div>
        {!isExempt && <button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Apply for Leave</button>}
      </div>

      <div className="sg">
        {[
          { v:pendingActionable.length, l:"Pending Your Approval", s:"Awaiting action", c:"#B06010" },
          { v:relevantReqs.filter(r=>r.status==="approved").length, l:"Approved", s:"In your scope", c:"#0F8C5A" },
          { v:myBalance.reduce((a,l)=>a+(l.total-l.used),0), l:"My Available Days", s:"All leave types", c:"#1B45F5" },
          { v:myBalance.find(l=>l.type==="Earned Leave")?.used||0, l:"EL Used", s:"This fiscal year", c:"#5C35C2" },
        ].map((s,i)=>(
          <div className="sc" key={i}>
            <div className="sc-accent" style={{ background:s.c }}/>
            <div className="sc-val" style={{ marginTop:10 }}>{s.v}</div>
            <div className="sc-lbl">{s.l}</div>
            <div className="sc-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="tabs">
        {["requests","balances","calendar"].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="requests"?`Requests${pendingActionable.length>0?` · ${pendingActionable.length} pending`:""}`
             :t==="balances"?"My Balance":"My Calendar"}
          </div>
        ))}
      </div>

      {tab==="requests" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="leave" s={14}/>Leave Requests</div>
            <div style={{ display:"flex", gap:5 }}>
              {["all","pending","approved","rejected"].map(f=><div key={f} className={`pill${fil===f?" active":""}`} onClick={()=>setFil(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>)}
            </div>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Approver</th><th>Status</th><th>Actioned By</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.id} style={{ opacity:r.empId===currentUser.id&&r.status!=="pending"?0.7:1 }}>
                    <td><div className="fw7">{r.emp}{r.empId===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div></td>
                    <td><span className="bdg bdg-b">{r.type}</span></td>
                    <td className="t3 mono tsm">{r.from}</td>
                    <td className="t3 mono tsm">{r.to}</td>
                    <td className="fw6">{r.days}d</td>
                    <td className="t3 tsm" style={{ maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{r.reason}</td>
                    <td style={{ fontSize:11,color:"var(--ink3)" }}>{getApproverLabel(r.empId)}</td>
                    <td>{sbdg(r.status)}</td>
                    <td className="t3 tsm">{r.approvedBy||"—"}</td>
                    <td>
                      {showApproveFor(r) ? (
                        <div style={{ display:"flex",gap:4 }}>
                          <button className="btn btn-s btn-sm" onClick={()=>handleApprove(r.id)}>Approve</button>
                          <button className="btn btn-d btn-sm" onClick={()=>handleReject(r.id)}>Reject</button>
                        </div>
                      ) : r.status==="pending"&&r.empId!==currentUser.id ? (
                        <span className="tsm t3">Not in scope</span>
                      ) : EXEMPT_IDS.includes(r.empId) ? (
                        <span className="tsm" style={{ color:"var(--accent)" }}>Auto-exempt</span>
                      ) : <span className="t3">—</span>}
                    </td>
                  </tr>
                ))}
                {!filtered.length&&<tr><td colSpan={10}><div className="empty">No {fil} leave requests in your scope</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="balances" && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="chart" s={14}/>Leave Balance — FY {yr}-{String(yr+1).slice(2)}</div></div>
          <div className="cb">
            {myBalance.map((lt,i)=>{ const rem=lt.total-lt.used; const pct=lt.total>0?(lt.used/lt.total)*100:0; return (
              <div className="lbar" key={i}>
                <div style={{ minWidth:220 }}><div style={{ fontWeight:650,fontSize:13 }}>{lt.type}</div><div className="t3 tsm">{lt.used} used · {rem} remaining of {lt.total}</div></div>
                <div style={{ flex:1,margin:"0 12px" }} className="lbar-t"><div className="lbar-f" style={{ width:`${pct}%`,background:lt.color }}/></div>
                <div style={{ minWidth:60,textAlign:"right" }}><div style={{ fontFamily:"var(--display)",fontWeight:700,color:lt.color,fontSize:16 }}>{rem}</div><div className="t3 tsm">/ {lt.total} days</div></div>
              </div>
            );})}
          </div>
        </div>
      )}

      {tab==="calendar" && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="cal" s={14}/>My Leave Calendar — {today.toLocaleDateString("en-IN",{month:"long",year:"numeric"})}</div></div>
          <div className="cb">
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"6px 4px",marginBottom:8 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{ textAlign:"center",fontSize:10,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",padding:"3px 0" }}>{d}</div>)}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4 }}>
              {Array.from({length:fd}).map((_,i)=><div key={`e${i}`}/>)}
              {Array.from({length:dim}).map((_,i)=>{ const d=i+1; const st=dayS(d); return (
                <div key={d} style={{ aspectRatio:1,borderRadius:"var(--r8)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,border:st==="today"?"2px solid var(--accent)":"1px solid transparent",background:st==="leave"?"var(--amber-soft)":st==="present"?"rgba(15,140,90,0.08)":st==="today"?"var(--accent-soft)":"transparent",color:st==="leave"?"var(--amber)":st==="present"?"var(--green)":st==="today"?"var(--accent)":st==="wknd"?"var(--ink5)":"var(--ink)" }}>
                  <span>{d}</span>
                  {st==="leave"&&<span style={{ fontSize:8,marginTop:1 }}>Leave</span>}
                  {st==="present"&&<span style={{ fontSize:8,marginTop:1 }}>✓</span>}
                </div>
              );})}
            </div>
          </div>
        </div>
      )}

      {modal && !isExempt && (
        <Modal title="Apply for Leave" onClose={()=>setModal(false)} footer={<><button className="btn" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-p" onClick={submit}>Submit Request</button></>}>
          <div className="fg">
            {canManage(currentUser)&&<div className="fgrp ff"><div className="flbl">Applying for</div><select className="fsel" value={form.empId} onChange={e=>setForm(p=>({...p,empId:e.target.value}))}>{visibleEmps.filter(e=>!EXEMPT_IDS.includes(e.id)).map(e=><option key={e.id} value={e.id}>{e.name}{e.id===currentUser.id?" (You)":""}</option>)}</select></div>}
            <div className="fgrp"><div className="flbl">Leave Type</div><select className="fsel" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{(LEAVE_BALANCES[currentUser.id]||DEFAULT_LEAVE_BALANCE).map(l=><option key={l.type}>{l.type}</option>)}</select></div>
            <div className="fgrp"><div className="flbl">Half Day?</div><select className="fsel"><option>Full Day</option><option>First Half</option><option>Second Half</option></select></div>
            <div className="fgrp"><div className="flbl">From</div><input className="finp" type="date" value={form.from} onChange={e=>setForm(p=>({...p,from:e.target.value}))}/></div>
            <div className="fgrp"><div className="flbl">To</div><input className="finp" type="date" value={form.to} onChange={e=>setForm(p=>({...p,to:e.target.value}))}/></div>
            <div className="fgrp ff"><div className="flbl">Reason</div><textarea className="ftxt" placeholder="Briefly describe your reason..." value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}/></div>
          </div>
          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--raised)", borderRadius:"var(--r8)", fontSize:12, color:"var(--ink3)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="shield" s={13}/> Approver: <strong>{getApproverLabel(form.empId)}</strong>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TIME LOG ──────────────────────────────────────────────────────────────────
const TimeLogMod = ({ currentUser }) => {
  const [timesheets, setTimesheets] = useState(INIT_TIMESHEETS);
  const [selectedWeek, setSelectedWeek] = useState(THIS_WEEK);
  const [tab, setTab] = useState("log");
  const [modal, setModal] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [form, setForm] = useState({ date:TODAY_STR, project:PROJS[0].name, subtask:PROJS[0].subtasks[0], hours:"", notes:"" });
  const [fil, setFil] = useState("all");

  const isHRReviewer = currentUser.isHR && currentUser.accessLevel >= 2;
  const tsKey = `${currentUser.id}_${selectedWeek}`;
  const currentTs = timesheets[tsKey] || { empId:currentUser.id,weekKey:selectedWeek,entries:[],totalHours:0,status:"draft" };
  const weekStart = new Date(selectedWeek); const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
  const weekLabel = `${weekStart.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;
  const totalHours = currentTs.entries.reduce((a,e)=>a+Number(e.hours),0);
  const pct = Math.min((totalHours/40)*100, 100);
  const selectedProj = PROJS.find(p=>p.name===form.project)||PROJS[0];
  const weekOptions = [THIS_WEEK, LAST_WEEK];

  const updateTs = (updater) => {
    setTimesheets(prev=>{
      const existing=prev[tsKey]||{ empId:currentUser.id,weekKey:selectedWeek,entries:[],totalHours:0,status:"draft" };
      const updated=updater(existing);
      const newTotal=updated.entries.reduce((a,e)=>a+Number(e.hours),0);
      const autoSubmit=newTotal>=40&&existing.status==="draft";
      return { ...prev,[tsKey]:{ ...updated,totalHours:newTotal,status:autoSubmit?"submitted":updated.status } };
    });
  };
  const addEntry = () => {
    if (!form.date||!form.project||!form.subtask||!form.hours) return;
    if (currentTs.status==="submitted"||currentTs.status==="approved") return;
    updateTs(ts=>({ ...ts,entries:[...ts.entries,{ id:`TL${Date.now()}`,date:form.date,project:form.project,subtask:form.subtask,hours:Number(form.hours),notes:form.notes }] }));
    setModal(false); setForm(f=>({ ...f,hours:"",notes:"" }));
  };
  const removeEntry = (id) => { if (currentTs.status!=="draft") return; updateTs(ts=>({ ...ts,entries:ts.entries.filter(e=>e.id!==id) })); };
  const grouped = currentTs.entries.reduce((acc,entry)=>{ if (!acc[entry.project]) acc[entry.project]={}; if (!acc[entry.project][entry.subtask]) acc[entry.project][entry.subtask]=[]; acc[entry.project][entry.subtask].push(entry); return acc; },{});
  const toggleProject = (proj) => setExpandedProjects(p=>({ ...p,[proj]:!p[proj] }));
  const allSubmitted = Object.values(timesheets).filter(ts=>["submitted","approved","rejected"].includes(ts.status));
  const filteredTs = allSubmitted.filter(ts=>fil==="all"||ts.status===fil);
  const handleHRApprove = (key) => setTimesheets(p=>({ ...p,[key]:{ ...p[key],status:"approved",approvedBy:currentUser.name } }));
  const handleHRReject  = (key) => setTimesheets(p=>({ ...p,[key]:{ ...p[key],status:"rejected",approvedBy:currentUser.name } }));
  const statusBdg = (s) => { if (s==="approved") return <span className="bdg bdg-g">Approved</span>; if (s==="submitted") return <span className="bdg bdg-a">Submitted</span>; if (s==="rejected") return <span className="bdg bdg-r">Rejected</span>; return <span className="bdg bdg-gray">Draft</span>; };

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">Work</div>
          <div className="ph-title">Time Log</div>
          <div className="ph-sub">Log hours by project and task. Timesheet auto-submits at 40h.</div>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          {isHRReviewer&&<button className="btn" onClick={()=>setTab("review")}><Icon n="eye" s={13}/>Review</button>}
          {currentTs.status==="draft"&&<button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Add Hours</button>}
        </div>
      </div>

      <div style={{ display:"flex",gap:6,marginBottom:14 }}>
        {weekOptions.map(wk=>{ const ts=timesheets[`${currentUser.id}_${wk}`]; return (
          <div key={wk} className={`pill${selectedWeek===wk?" active":""}`} onClick={()=>setSelectedWeek(wk)} style={{ display:"flex",alignItems:"center",gap:6 }}>
            {wk===THIS_WEEK?"This week":"Last week"}{ts&&ts.status!=="draft"&&<span style={{ fontSize:9 }}>{ts.status==="approved"?"✓":ts.status==="submitted"?"●":"✗"}</span>}
          </div>
        );})}
      </div>

      <div className="sg">
        {[
          { v:`${totalHours.toFixed(1)}h`, l:"Logged Hours", s:`${(40-totalHours).toFixed(1)}h remaining`, c:totalHours>=40?"#0F8C5A":"#1B45F5" },
          { v:`${Math.round(pct)}%`, l:"Week Progress", s:"40h target", c:pct>=100?"#0F8C5A":pct>=75?"#B06010":"#1B45F5" },
          { v:currentTs.entries.length, l:"Log Entries", s:"This week", c:"#5C35C2" },
          { v:statusBdg(currentTs.status), l:"Status", s:"", c:"var(--ink3)" },
        ].map((s,i)=>(
          <div className="sc" key={i}>
            <div className="sc-accent" style={{ background:s.c }}/>
            <div className="sc-val" style={{ marginTop:10, fontSize:typeof s.v==="object"?14:26 }}>{s.v}</div>
            <div className="sc-lbl">{s.l}</div>
            <div className="sc-sub">{s.s}</div>
          </div>
        ))}
      </div>

      <div className="week-bar">
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontWeight:600,fontSize:13 }}>Week of {weekLabel}</span>
            <span style={{ fontFamily:"var(--mono)",fontWeight:700,color:totalHours>=40?"var(--green)":"var(--accent)" }}>{totalHours.toFixed(1)} / 40h</span>
          </div>
          <div style={{ height:8,background:"var(--brd)",borderRadius:"var(--r999)",overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${pct}%`,background:pct>=100?"var(--green)":pct>=75?"var(--amber)":"var(--accent)",borderRadius:"var(--r999)",transition:"width 0.4s ease" }}/>
          </div>
          {currentTs.status==="submitted"&&<div style={{ fontSize:11,color:"var(--amber)",marginTop:5,fontWeight:650 }}>Submitted to HR for approval</div>}
          {currentTs.status==="approved"&&<div style={{ fontSize:11,color:"var(--green)",marginTop:5,fontWeight:650 }}>Approved by {currentTs.approvedBy}</div>}
          {currentTs.status==="draft"&&totalHours<40&&<div style={{ fontSize:11,color:"var(--ink3)",marginTop:5 }}>Auto-submits at 40 hours</div>}
        </div>
      </div>

      <div className="tabs">{["log",...(isHRReviewer?["review"]:[])].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="log"?"My Time Log":"HR Review"}</div>)}</div>

      {tab==="log"&&(
        <div>
          {currentTs.entries.length===0 ? (
            <div className="card"><div className="empty" style={{ padding:48 }}><div style={{ fontFamily:"var(--display)",fontSize:16,fontWeight:600,marginBottom:6 }}>No hours logged this week</div>{currentTs.status==="draft"&&<button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Add Hours</button>}</div></div>
          ) : (
            Object.entries(grouped).map(([project,subtasks])=>{ const projTotal=Object.values(subtasks).flat().reduce((a,e)=>a+Number(e.hours),0); const isOpen=expandedProjects[project]!==false; return (
              <div className="tl-project-row" key={project}>
                <div className="tl-project-hd" onClick={()=>toggleProject(project)}><Icon n={isOpen?"chevdown":"chevright"} s={14}/><Icon n="folder" s={14}/><span style={{ flex:1 }}>{project}</span><span style={{ fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",fontSize:13 }}>{projTotal.toFixed(1)}h</span></div>
                {isOpen&&Object.entries(subtasks).map(([subtask,entries])=>{ const stTotal=entries.reduce((a,e)=>a+Number(e.hours),0); return (<div key={subtask}><div style={{ padding:"6px 14px 4px 36px",borderTop:"1px solid var(--brd)",background:"var(--raised)",display:"flex",alignItems:"center",gap:8 }}><Icon n="clip" s={12}/><span style={{ fontWeight:600,fontSize:12.5,flex:1 }}>{subtask}</span><span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--teal)",fontWeight:650 }}>{stTotal.toFixed(1)}h</span></div>{entries.map(entry=>(<div className="tl-task-row" key={entry.id} style={{ paddingLeft:52 }}><span className="t3 mono tsm" style={{ minWidth:80 }}>{entry.date}</span><span style={{ fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",minWidth:42 }}>{entry.hours}h</span><span className="t3 tsm" style={{ flex:1 }}>{entry.notes||"—"}</span>{currentTs.status==="draft"&&<button className="btn btn-d btn-sm" style={{ padding:"2px 7px" }} onClick={()=>removeEntry(entry.id)}>✕</button>}</div>))}</div>);})}
              </div>
            );})
          )}
        </div>
      )}

      {tab==="review"&&isHRReviewer&&(
        <div>
          <div style={{ display:"flex",gap:5,marginBottom:12 }}>{["all","submitted","approved","rejected"].map(f=><div key={f} className={`pill${fil===f?" active":""}`} onClick={()=>setFil(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>)}</div>
          {filteredTs.map(ts=>{ const emp=ALL_USERS.find(u=>u.id===ts.empId); const key=`${ts.empId}_${ts.weekKey}`; const tsTotal=ts.entries.reduce((a,e)=>a+Number(e.hours),0); return (
            <div className="card" key={key}>
              <div className="ch">
                <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="avt" style={{ width:32,height:32,background:emp?.color||"#aaa" }}>{emp?.firstName[0]}{emp?.lastName[0]}</div><div><div className="fw7">{emp?.name}</div><div className="t3 tsm">{emp?.role} · Week of {ts.weekKey}</div></div></div>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:14,color:"var(--accent)" }}>{tsTotal.toFixed(1)}h</span>{statusBdg(ts.status)}{ts.status==="submitted"&&<div style={{ display:"flex",gap:5 }}><button className="btn btn-s btn-sm" onClick={()=>handleHRApprove(key)}>Approve</button><button className="btn btn-d btn-sm" onClick={()=>handleHRReject(key)}>Reject</button></div>}</div>
              </div>
            </div>
          );})}
        </div>
      )}

      {modal&&currentTs.status==="draft"&&(
        <Modal title="Log Hours" onClose={()=>setModal(false)} footer={<><button className="btn" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-p" onClick={addEntry}>Add Entry</button></>}>
          <div className="fg">
            <div className="fgrp"><div className="flbl">Date</div><input className="finp" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="fgrp"><div className="flbl">Hours</div><input className="finp" type="number" min="0.5" max="12" step="0.5" placeholder="e.g. 7.5" value={form.hours} onChange={e=>setForm(f=>({...f,hours:e.target.value}))}/></div>
            <div className="fgrp ff"><div className="flbl">Project</div><select className="fsel" value={form.project} onChange={e=>{ const p=PROJS.find(x=>x.name===e.target.value)||PROJS[0]; setForm(f=>({...f,project:e.target.value,subtask:p.subtasks[0]})); }}>{PROJS.map(p=><option key={p.name}>{p.name}</option>)}</select></div>
            <div className="fgrp ff"><div className="flbl">Task</div><select className="fsel" value={form.subtask} onChange={e=>setForm(f=>({...f,subtask:e.target.value}))}>{selectedProj.subtasks.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="fgrp ff"><div className="flbl">Notes</div><textarea className="ftxt" placeholder="What did you work on?" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── PAYROLL ENGINE ────────────────────────────────────────────────────────────
const PF_RATE_EMP = 0.12;
const PF_RATE_EMPLOYER = 0.12;
const PF_CEILING = 15000;
const ESI_GROSS_LIMIT = 21000;
const ESI_RATE_EMP = 0.0075;
const ESI_RATE_EMPLOYER = 0.0325;
const PT_SLABS = [{ min:0, max:10000, pt:0 }, { min:10001, max:15000, pt:150 }, { min:15001, max:999999999, pt:200 }];
const INCOME_TAX_SLABS = [
  { min:0, max:250000, rate:0 }, { min:250001, max:500000, rate:0.05 }, { min:500001, max:750000, rate:0.10 },
  { min:750001, max:1000000, rate:0.15 }, { min:1000001, max:1250000, rate:0.20 }, { min:1250001, max:1500000, rate:0.25 },
  { min:1500001, max:999999999, rate:0.30 },
];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthLabelFromDate = (date) => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
const buildPayrollMonths = (startYear = CURRENT_YEAR, startMonthIndex = CURRENT_MONTH_INDEX, count = 48) =>
  Array.from({ length:count }, (_, i) => monthLabelFromDate(new Date(startYear, startMonthIndex - i, 1)));
const PAYROLL_MONTHS = buildPayrollMonths();
const CURRENT_PAYROLL_MONTH = PAYROLL_MONTHS[0];
const parsePayrollMonth = (month) => {
  const [name, yearText] = String(month || "").split(" ");
  const monthIndex = MONTH_NAMES.indexOf(name);
  return {
    monthIndex:monthIndex >= 0 ? monthIndex : 3,
    year:Number(yearText) || CURRENT_YEAR,
  };
};
const defaultPayDateForMonth = (month) => {
  const { monthIndex, year } = parsePayrollMonth(month);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
};
const fiscalMonthNumber = (month) => {
  const { monthIndex } = parsePayrollMonth(month);
  return monthIndex >= 3 ? monthIndex - 2 : monthIndex + 10;
};
const payrollHistoryForMonths = (months) => months.map((month, i) => ({
  month,
  credited:defaultPayDateForMonth(month),
  status:i === 0 ? "current" : "paid",
  remarks:i === 0 ? "Current payroll cycle" : "Archived payslip available",
}));
const money = n => `₹${Math.round(Math.abs(n || 0)).toLocaleString("en-IN")}`;
const moneySigned = n => `${n < 0 ? "-" : ""}${money(n)}`;
const clampNum = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));

const computeTaxAnnual = (annualTaxableIncome) => {
  let tax = 0;
  for (const slab of INCOME_TAX_SLABS) {
    if (annualTaxableIncome <= slab.min) break;
    tax += (Math.min(annualTaxableIncome, slab.max) - slab.min) * slab.rate;
  }
  return Math.round(tax * 1.04);
};

const computePT = grossMonthly => PT_SLABS.find(s => grossMonthly >= s.min && grossMonthly <= s.max)?.pt ?? 200;
const canOperatePayroll = user => user?.dept === "Finance";
const canOperateOwnPayroll = user => [CEO_ID, CTO_ID].includes(user?.id);
const canViewPayrollOf = (viewer, targetId) => canOperatePayroll(viewer) || canSeeSensitiveOf(viewer, targetId);

const calcPayroll = (emp, inputs = {}) => {
  const lopDays = clampNum(inputs.lopDays, 0, 31);
  const overtimeHours = clampNum(inputs.overtimeHours, 0, 160);
  const bonusAmount = clampNum(inputs.bonusAmount, 0, 9999999);
  const arrears = clampNum(inputs.arrears, 0, 9999999);
  const loanEMI = clampNum(inputs.loanEMI, 0, 9999999);
  const leaveEncashment = clampNum(inputs.leaveEncashment, 0, 9999999);
  const reimbursements = clampNum(inputs.reimbursements, 0, 9999999);
  const shiftAllowance = clampNum(inputs.shiftAllowance, 0, 9999999);
  const foodAllowance = clampNum(inputs.foodAllowance, 0, 9999999);
  const mobileAllowance = clampNum(inputs.mobileAllowance, 0, 9999999);
  const variableIncentive = clampNum(inputs.variableIncentive, 0, 9999999);
  const advanceRecovery = clampNum(inputs.advanceRecovery, 0, 9999999);
  const insuranceDeduction = clampNum(inputs.insuranceDeduction, 0, 9999999);
  const otherDeduction = clampNum(inputs.otherDeduction, 0, 9999999);
  const pfOverride = inputs.pfOverride === "" || inputs.pfOverride == null ? null : clampNum(inputs.pfOverride, 0, 9999999);
  const esiOverride = inputs.esiOverride === "" || inputs.esiOverride == null ? null : clampNum(inputs.esiOverride, 0, 9999999);
  const ptOverride = inputs.ptOverride === "" || inputs.ptOverride == null ? null : clampNum(inputs.ptOverride, 0, 9999999);
  const tdsOverride = inputs.tdsOverride === "" || inputs.tdsOverride == null ? null : clampNum(inputs.tdsOverride, 0, 9999999);
  const totalWorkDays = clampNum(inputs.totalWorkDays ?? 26, 1, 31);
  const month = inputs.month || CURRENT_PAYROLL_MONTH;
  const ctcMonthly = Math.round((emp.ctcLPA * 100000) / 12);
  const basic = Math.round(ctcMonthly * 0.40);
  const hra = Math.round(basic * 0.50);
  const lta = Math.round(ctcMonthly * 0.05);
  const transport = 1600;
  const specialAllowance = ctcMonthly - basic - hra - lta - transport;
  const payableDays = Math.max(0, totalWorkDays - lopDays);
  const proRataFactor = payableDays / totalWorkDays;
  const proRataBasic = Math.round(basic * proRataFactor);
  const proRataHRA = Math.round(hra * proRataFactor);
  const proRataLTA = Math.round(lta * proRataFactor);
  const proRataTransport = lopDays > 0 ? Math.round(transport * proRataFactor) : transport;
  const proRataSpecial = Math.round(specialAllowance * proRataFactor);
  const hourlyRate = Math.round(basic / (26 * 8));
  const overtimePay = Math.round(hourlyRate * overtimeHours * 2);
  const grossEarnings = proRataBasic + proRataHRA + proRataLTA + proRataTransport + proRataSpecial + overtimePay + bonusAmount + arrears + leaveEncashment + reimbursements + shiftAllowance + foodAllowance + mobileAllowance + variableIncentive;
  const pfBase = Math.min(proRataBasic, PF_CEILING);
  const calculatedPFEmployee = Math.round(pfBase * PF_RATE_EMP);
  const pfEmployee = pfOverride ?? calculatedPFEmployee;
  const pfEmployer = Math.round(pfBase * PF_RATE_EMPLOYER);
  const esiEligible = grossEarnings <= ESI_GROSS_LIMIT;
  const calculatedESIEmployee = esiEligible ? Math.round(grossEarnings * ESI_RATE_EMP) : 0;
  const esiEmployee = esiOverride ?? calculatedESIEmployee;
  const esiEmployer = esiEligible ? Math.round(grossEarnings * ESI_RATE_EMPLOYER) : 0;
  const professionalTax = ptOverride ?? computePT(grossEarnings);
  const annualGross = grossEarnings * 12;
  const annual80C = Math.min(pfEmployee * 12, 150000);
  const annualTaxableIncome = Math.max(0, annualGross - annual80C - 50000);
  const annualTax = computeTaxAnnual(annualTaxableIncome);
  const tdsMonthly = tdsOverride ?? Math.round(annualTax / 12);
  const totalStatutoryDeductions = pfEmployee + esiEmployee + professionalTax + tdsMonthly;
  const totalVoluntaryDeductions = loanEMI + advanceRecovery + insuranceDeduction + otherDeduction;
  const totalDeductions = totalStatutoryDeductions + totalVoluntaryDeductions;
  const netPay = grossEarnings - totalDeductions;
  const monthNum = fiscalMonthNumber(month);
  return {
    month, employeeId:emp.id, employeeName:emp.name, designation:emp.role, department:emp.dept, pan:emp.pan, uan:emp.uan, pfAccount:emp.pfAccount,
    bank:emp.bank, accountNo:emp.accountNo, ifsc:emp.ifsc, joining:emp.joining, location:emp.loc, email:emp.email,
    totalWorkDays, payableDays, lopDays, overtimeHours, bonusAmount, arrears, loanEMI, hourlyRate, pfBase, grossEarnings,
    earnings:[
      { label:"Basic Salary", amount:proRataBasic, type:"fixed" }, { label:"HRA", amount:proRataHRA, type:"fixed" },
      { label:"Leave Travel Allowance", amount:proRataLTA, type:"fixed" }, { label:"Transport Allowance", amount:proRataTransport, type:"fixed" },
      { label:"Special Allowance", amount:proRataSpecial, type:"fixed" },
      ...(overtimePay > 0 ? [{ label:"Overtime Pay", amount:overtimePay, type:"variable" }] : []),
      ...(bonusAmount > 0 ? [{ label:"Performance Bonus", amount:bonusAmount, type:"variable" }] : []),
      ...(arrears > 0 ? [{ label:"Salary Arrears", amount:arrears, type:"arrear" }] : []),
      ...(leaveEncashment > 0 ? [{ label:"Leave Encashment", amount:leaveEncashment, type:"variable" }] : []),
      ...(variableIncentive > 0 ? [{ label:"Variable Incentive", amount:variableIncentive, type:"variable" }] : []),
      ...(shiftAllowance > 0 ? [{ label:"Shift Allowance", amount:shiftAllowance, type:"variable" }] : []),
      ...(foodAllowance > 0 ? [{ label:"Meal / Food Allowance", amount:foodAllowance, type:"variable" }] : []),
      ...(mobileAllowance > 0 ? [{ label:"Mobile / Internet Allowance", amount:mobileAllowance, type:"variable" }] : []),
      ...(reimbursements > 0 ? [{ label:"Approved Reimbursements", amount:reimbursements, type:"reimbursement" }] : []),
    ],
    statutory:[
      { label:"Provident Fund (12%)", amount:pfEmployee, code:"PF" },
      ...(esiEligible ? [{ label:"ESI (0.75%)", amount:esiEmployee, code:"ESI" }] : []),
      { label:"Professional Tax", amount:professionalTax, code:"PT" }, { label:"Income Tax (TDS)", amount:tdsMonthly, code:"TDS" },
    ],
    voluntary:[
      ...(loanEMI > 0 ? [{ label:"Loan EMI Recovery", amount:loanEMI }] : []),
      ...(advanceRecovery > 0 ? [{ label:"Salary Advance Recovery", amount:advanceRecovery }] : []),
      ...(insuranceDeduction > 0 ? [{ label:"Insurance Deduction", amount:insuranceDeduction }] : []),
      ...(otherDeduction > 0 ? [{ label:"Other Deduction", amount:otherDeduction }] : []),
    ],
    totalStatutoryDeductions, totalVoluntaryDeductions, totalDeductions, netPay, pfEmployer, esiEmployer,
    ctcActual:grossEarnings + pfEmployer + esiEmployer, annualGross, annual80C, annualTaxableIncome, annualTax, tdsMonthly, esiEligible,
    payDate:inputs.payDate || defaultPayDateForMonth(month), paymentMode:inputs.paymentMode || "Bank Transfer", payrollStatus:inputs.payrollStatus || "Draft",
    taxRegime:inputs.taxRegime || "New Regime", salaryHold:Boolean(inputs.salaryHold), remarks:inputs.remarks || "",
    overrides:{ pf:pfOverride, esi:esiOverride, pt:ptOverride, tds:tdsOverride },
    ytd:{ gross:grossEarnings * monthNum, tax:tdsMonthly * monthNum, pf:pfEmployee * monthNum, net:netPay * monthNum },
  };
};

const pdfMoney = n => `INR ${Math.round(Math.abs(n || 0)).toLocaleString("en-IN")}`;
const pdfEscape = s => String(s ?? "").replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, "-");
const pdfRgb = (hex) => {
  const clean = hex.replace("#", "");
  const nums = [0, 2, 4].map(i => parseInt(clean.slice(i, i + 2), 16) / 255);
  return nums.map(n => n.toFixed(3)).join(" ");
};
const createStyledPdfBlob = (commands) => {
  const content = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type:"application/pdf" });
};
const payslipPdfBlob = (data) => {
  const c = [];
  const fill = (hex) => c.push(`${pdfRgb(hex)} rg`);
  const stroke = (hex) => c.push(`${pdfRgb(hex)} RG`);
  const rect = (x, y, w, h, hex) => { fill(hex); c.push(`${x} ${y} ${w} ${h} re f`); };
  const line = (x1, y1, x2, y2, hex = "#E5E7EB") => { stroke(hex); c.push(`0.7 w ${x1} ${y1} m ${x2} ${y2} l S`); };
  const text = (value, x, y, size = 10, hex = "#111827", bold = false) => {
    fill(hex);
    c.push(`BT /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td (${pdfEscape(value).slice(0, 95)}) Tj ET`);
  };
  const rightText = (value, x, y, size = 10, hex = "#111827", bold = false) => {
    const safe = String(value ?? "");
    text(safe, x - safe.length * size * 0.48, y, size, hex, bold);
  };
  const row = (label, amount, x, y, color = "#111827") => {
    text(label, x, y, 9.2, "#374151");
    rightText(pdfMoney(amount), x + 235, y, 9.2, color, true);
    line(x, y - 7, x + 238, y - 7, "#F0F2F5");
  };

  rect(0, 0, 595, 842, "#FFFFFF");
  rect(26, 762, 543, 54, "#0D0D0E");
  rect(26, 762, 6, 54, "#1B45F5");
  text("DOLOXE", 44, 794, 19, "#FFFFFF", true);
  text("CIN: U72900KA2016PTC000001 | GSTIN: 29AABCN1234F1Z5", 44, 779, 8.5, "#B8BCC7");
  rightText("PAY SLIP", 548, 794, 10, "#B8BCC7", true);
  rightText(data.month, 548, 779, 13, "#FFFFFF", true);

  rect(26, 708, 543, 42, "#F8FAFC");
  text(data.employeeName, 42, 733, 13, "#111827", true);
  text(`${data.employeeId} | ${data.designation} | ${data.department}`, 42, 718, 9, "#6B7280");
  rightText(`Generated ${new Date().toLocaleDateString("en-IN")}`, 548, 733, 8.5, "#6B7280");
  rightText(`Pay Date ${data.payDate}`, 548, 718, 9, "#111827", true);

  const details = [
    ["Joining", data.joining], ["Location", data.location], ["PAN", data.pan], ["UAN", data.uan],
    ["PF Account", data.pfAccount], ["Bank", data.bank], ["Account", data.accountNo], ["IFSC", data.ifsc],
  ];
  details.forEach(([label, value], i) => {
    const x = 42 + (i % 4) * 132;
    const y = 681 - Math.floor(i / 4) * 34;
    text(label.toUpperCase(), x, y + 13, 7.2, "#9CA3AF", true);
    text(value, x, y, 8.6, "#111827", true);
  });

  [["Working Days", data.totalWorkDays, "#1B45F5"], ["Payable Days", data.payableDays, "#0F8C5A"], ["LOP Days", data.lopDays, "#C8312A"], ["OT Hours", data.overtimeHours, "#B06010"]].forEach(([label, value, color], i) => {
    const x = 26 + i * 135.75;
    rect(x, 581, 135.75, 43, "#F8FAFC");
    line(x + 135.75, 581, x + 135.75, 624);
    rightText(String(value), x + 72, 603, 15, color, true);
    text(label.toUpperCase(), x + 75, 603, 7.2, "#9CA3AF", true);
  });

  text("EARNINGS", 42, 548, 9, "#6B7280", true);
  text("DEDUCTIONS", 318, 548, 9, "#6B7280", true);
  line(42, 538, 280, 538, "#111827");
  line(318, 538, 556, 538, "#111827");

  data.earnings.slice(0, 9).forEach((r, i) => row(r.label, r.amount, 42, 519 - i * 20, "#0F8C5A"));
  [...data.statutory, ...data.voluntary].slice(0, 9).forEach((r, i) => row(r.label, r.amount, 318, 519 - i * 20, "#C8312A"));

  rect(42, 323, 238, 28, "#F0FDF4");
  text("Gross Earnings", 54, 333, 10, "#065F46", true);
  rightText(pdfMoney(data.grossEarnings), 266, 333, 10, "#0F8C5A", true);
  rect(318, 323, 238, 28, "#FEF2F2");
  text("Total Deductions", 330, 333, 10, "#991B1B", true);
  rightText(pdfMoney(data.totalDeductions), 542, 333, 10, "#C8312A", true);

  rect(26, 252, 543, 50, "#0D0D0E");
  text("Net Pay", 44, 282, 9, "#9CA3AF", true);
  text(pdfMoney(data.netPay), 44, 262, 22, "#FFFFFF", true);
  rightText(`Payment Mode: ${data.paymentMode}`, 548, 282, 9, "#B8BCC7");
  rightText(`Status: ${data.payrollStatus}`, 548, 265, 9, "#FFFFFF", true);

  rect(26, 187, 543, 43, "#F8FAFF");
  text("YEAR-TO-DATE SUMMARY", 42, 213, 8, "#6B7280", true);
  [["Gross", data.ytd.gross], ["Net", data.ytd.net], ["PF", data.ytd.pf], ["TDS", data.ytd.tax]].forEach(([label, value], i) => {
    const x = 42 + i * 126;
    text(`YTD ${label}`, x, 198, 8, "#6B7280");
    text(pdfMoney(value), x, 185, 10, "#1B45F5", true);
  });

  rect(26, 123, 543, 43, "#FFF7ED");
  text("TAX COMPUTATION", 42, 149, 8, "#B06010", true);
  [["Annual Taxable", data.annualTaxableIncome], ["Annual Tax", data.annualTax], ["Monthly TDS", data.tdsMonthly], ["Employer PF", data.pfEmployer]].forEach(([label, value], i) => {
    const x = 42 + i * 126;
    text(label, x, 134, 8, "#9A5814");
    text(pdfMoney(value), x, 121, 10, "#B06010", true);
  });

  text("This is a system-generated payslip and does not require a signature.", 42, 82, 8, "#9CA3AF");
  text("For queries, contact DOLOXE Finance Operations.", 42, 68, 8, "#9CA3AF");
  return createStyledPdfBlob(c);
};
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
  reader.onerror = reject;
  reader.readAsDataURL(blob);
});
const htmlEscape = value => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");
const payslipEmailHtml = (data) => {
  const row = (label, value, color = "#111827") => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #edf0f4;color:#4b5563;font-size:13px">${htmlEscape(label)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #edf0f4;color:${color};font-size:13px;font-weight:800;text-align:right">${htmlEscape(value)}</td>
    </tr>`;
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f3f5f8;font-family:Arial,'Segoe UI',sans-serif;color:#111827">
    <div style="max-width:760px;margin:0 auto;padding:24px">
      <div style="background:#0d0d0e;color:#fff;padding:24px 28px;border-radius:14px 14px 0 0;border-left:6px solid #1B45F5">
        <div style="font-size:22px;font-weight:900;letter-spacing:.2px">DOLOXE</div>
        <div style="font-size:12px;color:#b8bcc7;margin-top:4px">Pay Slip - ${htmlEscape(data.month)}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 14px 14px;overflow:hidden">
        <div style="padding:22px 28px;background:#f8fafc;border-bottom:1px solid #e5e7eb">
          <div style="font-size:18px;font-weight:900;color:#111827">${htmlEscape(data.employeeName)}</div>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">${htmlEscape(data.employeeId)} | ${htmlEscape(data.designation)} | ${htmlEscape(data.department)}</div>
        </div>
        <div style="padding:22px 28px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:25%;padding:0 12px 16px 0">
                <div style="font-size:11px;font-weight:800;color:#9ca3af;text-transform:uppercase">Pay Date</div>
                <div style="font-size:14px;font-weight:800;color:#111827;margin-top:4px">${htmlEscape(data.payDate)}</div>
              </td>
              <td style="width:25%;padding:0 12px 16px 0">
                <div style="font-size:11px;font-weight:800;color:#9ca3af;text-transform:uppercase">Payable Days</div>
                <div style="font-size:14px;font-weight:800;color:#0f8c5a;margin-top:4px">${htmlEscape(data.payableDays)}</div>
              </td>
              <td style="width:25%;padding:0 12px 16px 0">
                <div style="font-size:11px;font-weight:800;color:#9ca3af;text-transform:uppercase">Gross Earnings</div>
                <div style="font-size:14px;font-weight:800;color:#0f8c5a;margin-top:4px">${htmlEscape(money(data.grossEarnings))}</div>
              </td>
              <td style="width:25%;padding:0 0 16px 0">
                <div style="font-size:11px;font-weight:800;color:#9ca3af;text-transform:uppercase">Net Pay</div>
                <div style="font-size:16px;font-weight:900;color:#1B45F5;margin-top:4px">${htmlEscape(money(data.netPay))}</div>
              </td>
            </tr>
          </table>
          <div style="display:block;background:#0d0d0e;color:#fff;padding:18px 20px;border-radius:10px;margin:4px 0 22px">
            <div style="font-size:12px;color:#b8bcc7;margin-bottom:4px">Amount credited to ${htmlEscape(data.bank)} - ${htmlEscape(data.accountNo)}</div>
            <div style="font-size:28px;font-weight:900">${htmlEscape(money(data.netPay))}</div>
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:50%;vertical-align:top;padding-right:18px">
                <div style="font-size:11px;font-weight:900;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #111827;padding-bottom:8px">Earnings</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${data.earnings.map(item => row(item.label, money(item.amount), "#0f8c5a")).join("")}
                  ${row("Gross Earnings", money(data.grossEarnings), "#0f8c5a")}
                </table>
              </td>
              <td style="width:50%;vertical-align:top;padding-left:18px">
                <div style="font-size:11px;font-weight:900;color:#6b7280;text-transform:uppercase;border-bottom:2px solid #111827;padding-bottom:8px">Deductions</div>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${[...data.statutory, ...data.voluntary].map(item => row(item.label, money(item.amount), "#c8312a")).join("")}
                  ${row("Total Deductions", money(data.totalDeductions), "#c8312a")}
                </table>
              </td>
            </tr>
          </table>
          <div style="margin-top:22px;background:#f8faff;border:1px solid #dbe5ff;border-radius:10px;padding:14px 16px">
            <div style="font-size:11px;font-weight:900;color:#6b7280;text-transform:uppercase;margin-bottom:8px">Year-to-Date</div>
            <div style="font-size:13px;color:#374151">Gross: <b>${htmlEscape(money(data.ytd.gross))}</b> &nbsp; Net: <b>${htmlEscape(money(data.ytd.net))}</b> &nbsp; PF: <b>${htmlEscape(money(data.ytd.pf))}</b> &nbsp; TDS: <b>${htmlEscape(money(data.ytd.tax))}</b></div>
          </div>
          <div style="font-size:12px;color:#6b7280;margin-top:20px">A PDF copy of this payslip is attached. This is a system-generated payslip and does not require a signature.</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

// ─── SALARY / PAYROLL ─────────────────────────────────────────────────────────
const SalaryMod = ({ currentUser }) => {
  const canRunTeamPayroll = canOperatePayroll(currentUser);
  const canRunOwnPayroll = canRunTeamPayroll || canOperateOwnPayroll(currentUser);
  const scopedEmps = canRunTeamPayroll ? ALL_USERS : [currentUser];
  const [tab, setTab] = useState(canRunOwnPayroll ? "run" : "slip");
  const [selId, setSelId] = useState(currentUser.id);
  const [month, setMonth] = useState(CURRENT_PAYROLL_MONTH);
  const [inputs, setInputs] = useState({
    totalWorkDays:26, lopDays:0, overtimeHours:0, bonusAmount:0, arrears:0, loanEMI:0,
    leaveEncashment:0, reimbursements:0, shiftAllowance:0, foodAllowance:0, mobileAllowance:0, variableIncentive:0,
    advanceRecovery:0, insuranceDeduction:0, otherDeduction:0, pfOverride:"", esiOverride:"", ptOverride:"", tdsOverride:"",
    payDate:defaultPayDateForMonth(CURRENT_PAYROLL_MONTH), paymentMode:"Bank Transfer", payrollStatus:"Draft", taxRegime:"New Regime", salaryHold:false, remarks:"",
  });
  const [slip, setSlip] = useState(() => calcPayroll(currentUser, { month }));
  const [bulk, setBulk] = useState([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [archiveYear, setArchiveYear] = useState(String(parsePayrollMonth(month).year));
  const [emailModal, setEmailModal] = useState(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const emp = scopedEmps.find(e => e.id === selId) || currentUser;
  const preview = calcPayroll(emp, { ...inputs, month });
  const canSeeSalary = canViewPayrollOf(currentUser, emp.id);
  const canEditPayroll = canRunOwnPayroll;
  const archiveYears = [...new Set(PAYROLL_MONTHS.map(m => String(parsePayrollMonth(m).year)))];
  const archiveMonths = PAYROLL_MONTHS.filter(m => String(parsePayrollMonth(m).year) === archiveYear);
  const payrollHistory = payrollHistoryForMonths(PAYROLL_MONTHS.slice(0, 18));
  const input = (key, min = 0, max = 999999) => ({
    value:inputs[key],
    disabled:!canEditPayroll,
    onChange:e => setInputs(p => ({ ...p, [key]:clampNum(e.target.value, min, max) })),
  });
  const textInput = key => ({
    value:inputs[key],
    disabled:!canEditPayroll,
    onChange:e => setInputs(p => ({ ...p, [key]:e.target.value })),
  });
  const setSlipFor = (employee, customInputs = {}) => {
    const data = calcPayroll(employee, { ...inputs, ...customInputs, month });
    setSlip(data);
    setTab("slip");
  };
  const selectPayslipMonth = (nextMonth, employee = ALL_USERS.find(e => e.id === slip.employeeId) || emp) => {
    const nextPayDate = defaultPayDateForMonth(nextMonth);
    setMonth(nextMonth);
    setArchiveYear(String(parsePayrollMonth(nextMonth).year));
    setInputs(p => ({ ...p, payDate:nextPayDate }));
    setSlip(calcPayroll(employee, {
      ...inputs,
      month:nextMonth,
      payDate:nextPayDate,
      payrollStatus:nextMonth === PAYROLL_MONTHS[0] ? "Current" : "Paid",
    }));
  };
  const downloadPayslip = (data) => {
    const blob = payslipPdfBlob(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payslip_${data.employeeId}_${data.month.replaceAll(" ", "_")}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const sendPayslipEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      setEmailStatus("Enter a valid email address.");
      return;
    }
    const endpoint = import.meta.env.VITE_PAYSLIP_EMAIL_ENDPOINT;
    if (!endpoint) {
      setEmailStatus("Email delivery service is not configured. Set VITE_PAYSLIP_EMAIL_ENDPOINT to send directly.");
      return;
    }
    const subject = `Your Pay Slip for ${emailModal.month} - DOLOXE`;
    const body = [
      `Dear ${emailModal.employeeName.split(" ")[0]},`,
      "",
      `Your payslip for ${emailModal.month} is ready.`,
      `Net Pay: ${money(emailModal.netPay)}`,
      `Pay Date: ${emailModal.payDate}`,
      "",
      "Please download the PDF payslip from the HR portal.",
      "",
      "Regards,",
      "DOLOXE Finance Operations",
    ].join("\n");
    setEmailSending(true);
    setEmailStatus("Sending payslip...");
    try {
      const filename = `Payslip_${emailModal.employeeId}_${emailModal.month.replaceAll(" ","_")}.pdf`;
      const pdfBase64 = await blobToBase64(payslipPdfBlob(emailModal));
      const htmlBody = payslipEmailHtml(emailModal);
      const res = await fetch(endpoint, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ to:emailTo, subject, body, htmlBody, filename, attachmentType:"application/pdf", attachmentBase64:pdfBase64 }),
      });
      if (!res.ok) {
        let detail = `Email service returned ${res.status}`;
        try {
          const errorBody = await res.json();
          detail = errorBody.detail || detail;
        } catch {
          detail = await res.text() || detail;
        }
        throw new Error(detail);
      }
      setEmailStatus(`Payslip sent directly to ${emailTo}.`);
    } catch (err) {
      setEmailStatus(`Email send failed: ${err.message}`);
    } finally {
      setEmailSending(false);
    }
  };
  const runBulk = () => {
    setBulkRunning(true);
    setTimeout(() => {
      setBulk(scopedEmps.map(e => calcPayroll(e, { month, totalWorkDays:inputs.totalWorkDays, payDate:inputs.payDate, paymentMode:inputs.paymentMode, payrollStatus:"Processed", taxRegime:inputs.taxRegime })));
      setBulkRunning(false);
    }, 700);
  };
  const payrollStats = canRunTeamPayroll ? [
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month }).grossEarnings,0)), l:"Gross Payroll", s:`${scopedEmps.length} employees`, c:"#1B45F5" },
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month }).netPay,0)), l:"Net Payroll", s:"Projected credits", c:"#0F8C5A" },
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month }).totalDeductions,0)), l:"Deductions", s:"PF, ESI, PT, TDS", c:"#C8312A" },
    { v:"30 May", l:"Credit Date", s:month, c:"#5C35C2" },
  ] : [
    { v:money(preview.grossEarnings), l:"Gross Salary", s:month, c:"#1B45F5" },
    { v:money(preview.totalDeductions), l:"Deductions", s:"PF, PT, TDS", c:"#C8312A" },
    { v:money(preview.netPay), l:"Net Pay", s:"Estimated credit", c:"#0F8C5A" },
    { v:`₹${currentUser.ctcLPA}L`, l:"Annual CTC", s:"Gross package", c:"#5C35C2" },
  ];
  const departments = ["All", ...new Set(scopedEmps.map(e => e.dept))];

  const renderPayslipCard = (data) => {
    const owner = ALL_USERS.find(e => e.id === data.employeeId) || emp;
    const allowed = canViewPayrollOf(currentUser, owner.id);
    return (
      <div style={{ background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r12)", overflow:"hidden" }}>
        <div className="slip-h">
          <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
            <div><div style={{ fontFamily:"var(--display)", fontSize:18, fontWeight:800 }}>DOLOXE</div><div style={{ fontSize:11.5, opacity:0.6 }}>CIN: U72900KA2016PTC000001 · GSTIN: 29AABCN1234F1Z5</div></div>
            <div style={{ textAlign:"right" }}><div style={{ fontSize:11, opacity:0.55, fontWeight:800 }}>PAY SLIP</div><div style={{ fontWeight:800 }}>{data.month}</div></div>
          </div>
        </div>
        <div style={{ padding:"14px 22px", background:"var(--raised)", borderBottom:"1px solid var(--brd)" }}>
          <div className="info-grid">{[["Employee",data.employeeName],["Employee ID",data.employeeId],["Designation",data.designation],["Department",data.department],["Joining",data.joining],["Location",data.location],["PAN",allowed?data.pan:"Confidential"],["UAN",allowed?data.uan:"Confidential"],["PF Account",allowed?data.pfAccount:"Confidential"],["Bank",allowed?data.bank:"Confidential"],["Account No.",allowed?data.accountNo:"Confidential"],["IFSC",allowed?data.ifsc:"Confidential"]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:650 }}>{v}</div></div>)}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", borderBottom:"1px solid var(--brd)" }}>
          {[["Working Days",data.totalWorkDays,"var(--accent)"],["Payable Days",data.payableDays,"var(--green)"],["LOP Days",data.lopDays,data.lopDays ? "var(--red)" : "var(--ink3)"],["OT Hours",data.overtimeHours,"var(--amber)"]].map(([l,v,c])=>(
            <div key={l} style={{ padding:"12px 10px", textAlign:"center", borderRight:"1px solid var(--brd)" }}><div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:c }}>{v}</div><div className="if-l">{l}</div></div>
          ))}
        </div>
        {allowed ? (
          <>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", borderBottom:"1px solid var(--brd)" }}>
              <div style={{ padding:"16px 20px", borderRight:"1px solid var(--brd)" }}><div className="flbl" style={{ marginBottom:8 }}>Earnings</div>{data.earnings.map(r=><div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px dashed var(--brd)" }}><span className="t3" style={{ fontSize:12 }}>{r.label}</span><b>{money(r.amount)}</b></div>)}<div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, marginTop:8, borderTop:"2px solid var(--ink)", fontWeight:800 }}><span>Gross Earnings</span><span style={{ color:"var(--green)" }}>{money(data.grossEarnings)}</span></div></div>
              <div style={{ padding:"16px 20px" }}><div className="flbl" style={{ marginBottom:8 }}>Deductions</div>{[...data.statutory,...data.voluntary].map(r=><div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px dashed var(--brd)" }}><span className="t3" style={{ fontSize:12 }}>{r.label}</span><b style={{ color:"var(--red)" }}>{moneySigned(-r.amount)}</b></div>)}<div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, marginTop:8, borderTop:"2px solid var(--ink)", fontWeight:800 }}><span>Total Deductions</span><span style={{ color:"var(--red)" }}>{money(data.totalDeductions)}</span></div></div>
            </div>
            <div className="slip-tot"><span>NET PAY · {data.bank} · {data.accountNo}</span><span style={{ fontSize:22, color:"var(--accent)" }}>{money(data.netPay)}</span></div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, padding:"14px 20px", background:"var(--accent-soft)" }}>
              {[["YTD Gross",data.ytd.gross],["YTD Net",data.ytd.net],["YTD PF",data.ytd.pf],["YTD TDS",data.ytd.tax]].map(([l,v])=><div key={l}><div className="if-l">{l}</div><div style={{ fontWeight:800, color:"var(--accent)" }}>{money(v)}</div></div>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, padding:"12px 20px", background:"var(--raised)", borderTop:"1px solid var(--brd)" }}>
              {[["Pay Date",data.payDate],["Payment Mode",data.paymentMode],["Payroll Status",data.payrollStatus],["Tax Regime",data.taxRegime]].map(([l,v])=><div key={l}><div className="if-l">{l}</div><div style={{ fontWeight:700 }}>{v}</div></div>)}
            </div>
            <div style={{ padding:"12px 20px", background:"var(--amber-soft)", borderTop:"1px solid var(--brd)" }}>
              <div className="flbl" style={{ color:"var(--amber)", marginBottom:8 }}>Tax Computation</div>
              <div className="info-grid">{[["Annual Gross",data.annualGross],["80C PF Deduction",data.annual80C],["Standard Deduction",50000],["Taxable Income",data.annualTaxableIncome],["Tax + Cess",data.annualTax],["Monthly TDS",data.tdsMonthly]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:700 }}>{money(v)}</div></div>)}</div>
            </div>
          </>
        ) : (
          <div style={{ padding:24, textAlign:"center", color:"var(--ink3)" }}>Payroll details are confidential for this employee.</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="ph">
        <div><div className="ph-eyebrow">Finance</div><div className="ph-title">Payroll</div><div className="ph-sub">{canRunTeamPayroll ? "Finance operations workspace for payroll edits, runs and statutory summaries" : canRunOwnPayroll ? "Personal payroll run workspace. Company payroll is managed by Finance operations." : "Your monthly payslip. Payroll edits and runs are managed by Finance operations."}</div></div>
        <select className="fsel" style={{ width:180 }} value={month} onChange={e=>selectPayslipMonth(e.target.value)}>
          {PAYROLL_MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="tabs">{(canRunTeamPayroll ? ["run","slip","bulk","history"] : canRunOwnPayroll ? ["run","slip"] : ["slip"]).map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="run"?"Payroll Run":t==="slip"?"Pay Slip":t==="bulk"?"Bulk Process":"History"}</div>)}</div>
      <div className="sg">{payrollStats.map((s,i)=><div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10, fontSize:20 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>)}</div>

      {tab==="run"&&(
        <div className="g2" style={{ alignItems:"start" }}>
          <div className="card" style={{ marginBottom:0 }}>
            <div className="ch"><div className="ct"><Icon n="user" s={14}/>{canRunTeamPayroll ? "Employee Selection" : "Employee"}</div></div>
            <div style={{ padding:0, maxHeight:470, overflowY:"auto" }}>
              {scopedEmps.map(e=><div key={e.id} className={`emp-row${selId===e.id?" sel":""}`} onClick={()=>setSelId(e.id)}>
                <div className="avt" style={{ width:32, height:32, background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div>
                <div style={{ flex:1 }}><div className="fw7" style={{ fontSize:13, color:selId===e.id?"var(--accent)":"var(--ink)" }}>{e.name}{e.id===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9, marginLeft:4 }}>You</span>}</div><div className="t3 tsm">{e.role}</div></div>
                <span className="bdg bdg-b">{e.dept}</span>
              </div>)}
            </div>
          </div>
          <div className="card" style={{ marginBottom:0 }}>
            <div className="ch"><div className="ct"><Icon n="salary" s={14}/>{emp.name}</div><div style={{ display:"flex", gap:6, alignItems:"center" }}><span className={`bdg ${canEditPayroll ? "bdg-g" : "bdg-gray"}`}>{canRunTeamPayroll ? "Finance Edit Access" : canRunOwnPayroll ? "Personal Run Access" : "Read Only"}</span><span className="bdg bdg-g">CTC ₹{emp.ctcLPA}L</span></div></div>
            <div className="cb">
              {!canEditPayroll&&<div style={{ background:"var(--amber-soft)", border:"1px solid rgba(176,96,16,0.22)", borderRadius:"var(--r8)", padding:"10px 12px", color:"var(--amber)", fontSize:12, marginBottom:14 }}>Payroll run and edit controls are restricted to Finance operations employees.</div>}
              <div className="flbl" style={{ marginBottom:8 }}>Payroll Controls</div>
              <div className="fg" style={{ marginBottom:14 }}>
                <div className="fgrp"><div className="flbl">Pay Date</div><input className="finp" type="date" {...textInput("payDate")}/></div>
                <div className="fgrp"><div className="flbl">Payment Mode</div><select className="fsel" {...textInput("paymentMode")}><option>Bank Transfer</option><option>Cheque</option><option>Cash</option><option>Hold for Review</option></select></div>
                <div className="fgrp"><div className="flbl">Payroll Status</div><select className="fsel" {...textInput("payrollStatus")}><option>Draft</option><option>Reviewed</option><option>Approved</option><option>Processed</option><option>On Hold</option></select></div>
                <div className="fgrp"><div className="flbl">Tax Regime</div><select className="fsel" {...textInput("taxRegime")}><option>New Regime</option><option>Old Regime</option><option>Custom Declaration</option></select></div>
                <div className="fgrp"><div className="flbl">Salary Hold</div><select className="fsel" value={inputs.salaryHold ? "Yes" : "No"} disabled={!canEditPayroll} onChange={e=>setInputs(p=>({...p, salaryHold:e.target.value==="Yes"}))}><option>No</option><option>Yes</option></select></div>
                <div className="fgrp"><div className="flbl">Remarks</div><input className="finp" placeholder="Audit note" {...textInput("remarks")}/></div>
              </div>
              <div className="flbl" style={{ marginBottom:8 }}>Attendance & Time</div>
              <div className="fg" style={{ marginBottom:14 }}>
                <div className="fgrp"><div className="flbl">Total Work Days</div><input className="finp" type="number" min="1" max="31" {...input("totalWorkDays",1,31)}/></div>
                <div className="fgrp"><div className="flbl">LOP Days</div><input className="finp" type="number" min="0" max="31" {...input("lopDays",0,31)}/></div>
                <div className="fgrp"><div className="flbl">Overtime Hours</div><input className="finp" type="number" min="0" max="160" {...input("overtimeHours",0,160)}/></div>
              </div>
              <div className="flbl" style={{ marginBottom:8 }}>Variable Pay & Deductions</div>
              <div className="fg" style={{ marginBottom:14 }}>
                <div className="fgrp"><div className="flbl">Performance Bonus</div><input className="finp" type="number" min="0" {...input("bonusAmount")}/></div>
                <div className="fgrp"><div className="flbl">Salary Arrears</div><input className="finp" type="number" min="0" {...input("arrears")}/></div>
                <div className="fgrp"><div className="flbl">Loan EMI Recovery</div><input className="finp" type="number" min="0" {...input("loanEMI")}/></div>
                <div className="fgrp"><div className="flbl">Leave Encashment</div><input className="finp" type="number" min="0" {...input("leaveEncashment")}/></div>
                <div className="fgrp"><div className="flbl">Variable Incentive</div><input className="finp" type="number" min="0" {...input("variableIncentive")}/></div>
                <div className="fgrp"><div className="flbl">Reimbursements</div><input className="finp" type="number" min="0" {...input("reimbursements")}/></div>
                <div className="fgrp"><div className="flbl">Shift Allowance</div><input className="finp" type="number" min="0" {...input("shiftAllowance")}/></div>
                <div className="fgrp"><div className="flbl">Meal Allowance</div><input className="finp" type="number" min="0" {...input("foodAllowance")}/></div>
                <div className="fgrp"><div className="flbl">Mobile / Internet</div><input className="finp" type="number" min="0" {...input("mobileAllowance")}/></div>
                <div className="fgrp"><div className="flbl">Advance Recovery</div><input className="finp" type="number" min="0" {...input("advanceRecovery")}/></div>
                <div className="fgrp"><div className="flbl">Insurance Deduction</div><input className="finp" type="number" min="0" {...input("insuranceDeduction")}/></div>
                <div className="fgrp"><div className="flbl">Other Deduction</div><input className="finp" type="number" min="0" {...input("otherDeduction")}/></div>
              </div>
              <div className="flbl" style={{ marginBottom:8 }}>Statutory Overrides</div>
              <div className="fg" style={{ marginBottom:14 }}>
                <div className="fgrp"><div className="flbl">PF Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("pfOverride")}/></div>
                <div className="fgrp"><div className="flbl">ESI Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("esiOverride")}/></div>
                <div className="fgrp"><div className="flbl">PT Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("ptOverride")}/></div>
                <div className="fgrp"><div className="flbl">TDS Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("tdsOverride")}/></div>
              </div>
              <div style={{ background:"var(--raised)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:12, marginBottom:14 }}>
                <div className="flbl" style={{ marginBottom:8 }}>Live Preview</div>
                {canSeeSalary ? <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>{[["Gross",preview.grossEarnings,"var(--green)"],["PF",preview.statutory.find(s=>s.code==="PF")?.amount || 0,"var(--purple)"],["TDS",preview.tdsMonthly,"var(--amber)"],["Deductions",preview.totalDeductions,"var(--red)"],["Net Pay",preview.netPay,"var(--accent)"]].map(([l,v,c])=><div key={l} style={{ background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:"9px 6px", textAlign:"center" }}><div style={{ fontWeight:800, color:c, fontSize:13 }}>{money(v)}</div><div className="t3" style={{ fontSize:10.5 }}>{l}</div></div>)}</div> : <div className="t3" style={{ textAlign:"center", padding:12 }}>Salary preview is confidential.</div>}
                {canSeeSalary && !preview.esiEligible && <div style={{ marginTop:8, fontSize:11, color:"var(--accent)" }}>ESI is not applicable because gross salary exceeds ₹21,000/month.</div>}
              </div>
              <div style={{ display:"flex", gap:8 }}><button className="btn btn-p" disabled={!canEditPayroll} onClick={()=>setSlipFor(emp)}><Icon n="calc" s={13}/>Calculate & Generate Payslip</button><button className="btn" disabled={!canEditPayroll} onClick={()=>setInputs({ totalWorkDays:26, lopDays:0, overtimeHours:0, bonusAmount:0, arrears:0, loanEMI:0, leaveEncashment:0, reimbursements:0, shiftAllowance:0, foodAllowance:0, mobileAllowance:0, variableIncentive:0, advanceRecovery:0, insuranceDeduction:0, otherDeduction:0, pfOverride:"", esiOverride:"", ptOverride:"", tdsOverride:"", payDate:defaultPayDateForMonth(CURRENT_PAYROLL_MONTH), paymentMode:"Bank Transfer", payrollStatus:"Draft", taxRegime:"New Regime", salaryHold:false, remarks:"" })}>Reset</button></div>
            </div>
          </div>
        </div>
      )}

      {tab==="slip"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:12 }}>
            <div><div className="fw7" style={{ fontFamily:"var(--display)", fontSize:16 }}>{slip.employeeName}</div><div className="t3 tsm">{slip.month} payslip</div></div>
            <div style={{ display:"flex", gap:7 }}><button className="btn" onClick={()=>downloadPayslip(slip)}><Icon n="dl" s={13}/>Download PDF</button><button className="btn btn-p" onClick={()=>{ setEmailModal(slip); setEmailTo(slip.email); setEmailStatus(""); }}><Icon n="mail" s={13}/>Send Email</button></div>
          </div>
          <div className="card" style={{ marginBottom:12 }}>
            <div className="ch">
              <div className="ct"><Icon n="cal" s={14}/>Payslip Archive</div>
              <div style={{ display:"flex", gap:8 }}>
                <select className="fsel" style={{ width:120 }} value={archiveYear} onChange={e=>setArchiveYear(e.target.value)}>{archiveYears.map(y=><option key={y}>{y}</option>)}</select>
                <select className="fsel" style={{ width:180 }} value={month} onChange={e=>selectPayslipMonth(e.target.value)}>{archiveMonths.map(m=><option key={m}>{m}</option>)}</select>
              </div>
            </div>
            <div className="cb" style={{ paddingTop:12 }}>
              {canRunTeamPayroll&&<div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>{scopedEmps.map(e=><div key={e.id} className={`pill${slip.employeeId===e.id?" active":""}`} onClick={()=>selectPayslipMonth(month, e)}>{e.firstName}</div>)}</div>}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(132px,1fr))", gap:8 }}>
                {archiveMonths.map(m => {
                  const isActive = slip.month === m;
                  const sample = calcPayroll(ALL_USERS.find(e => e.id === slip.employeeId) || emp, { month:m, payDate:defaultPayDateForMonth(m), payrollStatus:m === PAYROLL_MONTHS[0] ? "Current" : "Paid" });
                  return (
                    <button key={m} className={`btn${isActive ? " btn-p" : ""}`} style={{ justifyContent:"space-between", padding:"9px 10px" }} onClick={()=>selectPayslipMonth(m)}>
                      <span>{m}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize:11 }}>{money(sample.netPay)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {renderPayslipCard(slip)}
        </div>
      )}

      {tab==="bulk"&&canRunTeamPayroll&&(
        <div>
          <div className="card">
            <div className="ch"><div className="ct"><Icon n="users" s={14}/>Bulk Payroll Processing</div><button className="btn btn-p" onClick={runBulk} disabled={bulkRunning}>{bulkRunning ? "Processing..." : "Run Payroll for All"}</button></div>
            {bulk.length === 0 ? <div className="cb t3">Run payroll to generate the monthly payroll register for {scopedEmps.length} employees.</div> : <div className="tw"><table><thead><tr>{["Employee","Dept","Gross","PF","ESI","PT","TDS","Deductions","Net Pay","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{bulk.map(r=>{ const owner=ALL_USERS.find(e=>e.id===r.employeeId); const allowed=canViewPayrollOf(currentUser,r.employeeId); return <tr key={r.employeeId}><td><div style={{ display:"flex", alignItems:"center", gap:8 }}><div className="avt" style={{ width:26, height:26, background:owner.color }}>{owner.firstName[0]}{owner.lastName[0]}</div><div><div className="fw7">{owner.name}</div><div className="t3 tsm">{r.employeeId}</div></div></div></td><td><span className="bdg bdg-b">{r.department}</span></td>{allowed ? <><td className="fw6" style={{ color:"var(--green)" }}>{money(r.grossEarnings)}</td><td>{money(r.statutory.find(s=>s.code==="PF")?.amount || 0)}</td><td>{r.esiEligible ? money(r.statutory.find(s=>s.code==="ESI")?.amount || 0) : "N/A"}</td><td>{money(r.statutory.find(s=>s.code==="PT")?.amount || 0)}</td><td style={{ color:"var(--amber)" }}>{money(r.tdsMonthly)}</td><td style={{ color:"var(--red)" }}>{money(r.totalDeductions)}</td><td className="fw7" style={{ color:"var(--accent)" }}>{money(r.netPay)}</td></> : <td colSpan="7" className="t3">Confidential</td>}<td><div style={{ display:"flex", gap:4 }}><button className="btn btn-sm" onClick={()=>{ setSlip(r); setTab("slip"); }}><Icon n="eye" s={12}/></button>{allowed&&<button className="btn btn-sm" onClick={()=>downloadPayslip(r)}><Icon n="dl" s={12}/></button>}</div></td></tr>; })}</tbody></table></div>}
          </div>
          {bulk.length > 0&&<div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>{[["PF Challan",bulk.reduce((a,r)=>a+(r.statutory.find(s=>s.code==="PF")?.amount || 0)+r.pfEmployer,0),"var(--purple)"],["ESI Challan",bulk.reduce((a,r)=>a+(r.statutory.find(s=>s.code==="ESI")?.amount || 0)+r.esiEmployer,0),"var(--teal)"],["TDS + PT",bulk.reduce((a,r)=>a+r.tdsMonthly+(r.statutory.find(s=>s.code==="PT")?.amount || 0),0),"var(--amber)"]].map(([l,v,c])=><div key={l} className="card" style={{ marginBottom:0, borderTop:`3px solid ${c}` }}><div className="cb"><div className="flbl">{l}</div><div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:c }}>{money(v)}</div></div></div>)}</div>}
        </div>
      )}

      {tab==="history"&&(
        <div>
          <div className="g2" style={{ alignItems:"start" }}>
            <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Monthly Summary</div></div><div style={{ padding:0 }}>{payrollHistory.map((m,i)=><div key={m.month} onClick={()=>selectPayslipMonth(m.month)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 16px", borderBottom:"1px solid var(--brd)", cursor:"pointer", background:month===m.month ? "var(--accent-soft)" : "transparent" }}><div><div className="fw7">{m.month}</div><div className="t3 tsm">{m.remarks} · Credited {m.credited}</div></div><span className="bdg bdg-g">{i === 0 ? "Current" : "Paid"}</span></div>)}</div></div>
            <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Compliance Calendar</div></div><div className="cb">{[["PF Challan","15th every month","bdg-b"],["ESI Challan","15th every month","bdg-p"],["Professional Tax","End of month","bdg-a"],["TDS Deposit","7th of next month","bdg-b"],["Form 24Q","Quarterly return","bdg-r"],["Form 16","By 15 June","bdg-g"]].map(([l,d,b])=><div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--brd)" }}><div><div className="fw7" style={{ fontSize:12.5 }}>{l}</div><div className="t3 tsm">{d}</div></div><span className={`bdg ${b}`}>Scheduled</span></div>)}</div></div>
          </div>
          <div className="card" style={{ marginTop:14 }}>
            <div className="ch"><div className="ct">Employee Payslip Archive · {month}</div><div style={{ display:"flex", gap:5 }}>{departments.map(d=><div key={d} className={`pill${historyFilter===d?" active":""}`} onClick={()=>setHistoryFilter(d)}>{d}</div>)}</div></div>
            <div className="tw"><table><thead><tr>{["Employee","Dept","Monthly Gross","Net Pay","YTD Net","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{scopedEmps.filter(e=>historyFilter==="All"||e.dept===historyFilter).map(e=>{ const data=calcPayroll(e,{ month, payDate:defaultPayDateForMonth(month), payrollStatus:month === PAYROLL_MONTHS[0] ? "Current" : "Paid" }); const allowed=canViewPayrollOf(currentUser,e.id); return <tr key={e.id}><td><div style={{ display:"flex", alignItems:"center", gap:8 }}><div className="avt" style={{ width:28, height:28, background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div><div className="fw7">{e.name}</div><div className="t3 tsm">{e.id}</div></div></div></td><td><span className="bdg bdg-b">{e.dept}</span></td><td>{allowed ? money(data.grossEarnings) : "Confidential"}</td><td className="fw7" style={{ color:"var(--green)" }}>{allowed ? money(data.netPay) : "Confidential"}</td><td style={{ color:"var(--accent)" }}>{allowed ? money(data.ytd.net) : "Confidential"}</td><td><button className="btn btn-sm" onClick={()=>{ setSlip(data); setTab("slip"); }}><Icon n="eye" s={12}/></button></td></tr>; })}</tbody></table></div>
          </div>
        </div>
      )}

      {emailModal&&(
        <Modal title={`Send Pay Slip — ${emailModal.employeeName}`} onClose={()=>setEmailModal(null)} footer={<><button className="btn" onClick={()=>setEmailModal(null)}>Cancel</button><button className="btn btn-p" onClick={sendPayslipEmail} disabled={emailSending}><Icon n="mail" s={13}/>{emailSending ? "Sending..." : "Send Email"}</button></>}>
          <div className="fgrp" style={{ marginBottom:12 }}><div className="flbl">To</div><input className="finp" type="email" value={emailTo} onChange={e=>setEmailTo(e.target.value)}/></div>
          <div className="fgrp" style={{ marginBottom:12 }}><div className="flbl">Subject</div><input className="finp" readOnly value={`Your Pay Slip for ${emailModal.month} - DOLOXE`}/></div>
          <div style={{ background:"var(--raised)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:12, fontSize:12, marginBottom:12 }}><div className="fw7">PDF File</div><div className="t3">Payslip_{emailModal.employeeId}_{emailModal.month.replaceAll(" ","_")}.pdf</div></div>
          <div style={{ fontSize:11.5, color:emailStatus.includes("failed") || emailStatus.includes("valid") || emailStatus.includes("not configured") ? "var(--red)" : "var(--green)" }}>{emailStatus || "Sends directly through the configured payroll email service."}</div>
        </Modal>
      )}
    </div>
  );
};

// ─── DIRECTORY ─────────────────────────────────────────────────────────────────
const DirectoryMod = ({ currentUser }) => {
  const visibleEmps = getVisibleEmps(currentUser);
  const [sel, setSel] = useState(currentUser.id);
  const [srch, setSrch] = useState("");
  const [fil, setFil] = useState("All");
  const [profTab, setProfTab] = useState("profile");
  const depts = ["All",...[...new Set(visibleEmps.map(e=>e.dept))]];
  const filtered = visibleEmps.filter(e=>(fil==="All"||e.dept===fil)&&(e.name.toLowerCase().includes(srch.toLowerCase())||e.role.toLowerCase().includes(srch.toLowerCase())));
  const emp = ALL_USERS.find(e=>e.id===sel)||currentUser;
  const canSeeSensitive = canSeeSensitiveOf(currentUser, sel);
  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">{canViewAll(currentUser)?"Directory":canManage(currentUser)?"My Team":"My Profile"}</div>
          <div className="ph-sub">{canViewAll(currentUser)?`${ALL_USERS.length} employees across ${[...new Set(ALL_USERS.map(e=>e.dept))].length} departments`:canManage(currentUser)?"Team profiles and directory":"Your HR profile"}</div>
        </div>
      </div>
      {(canViewAll(currentUser)||canManage(currentUser))&&(
        <div style={{ display:"flex",gap:7,marginBottom:14,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1.5px solid var(--brd)",borderRadius:"var(--r8)",padding:"0 11px",height:36,transition:"border-color 0.15s" }}>
            <Icon n="search" s={13}/><input style={{ border:"none",outline:"none",flex:1,fontFamily:"var(--font)",fontSize:13,color:"var(--ink)",background:"transparent" }} placeholder="Search by name, role..." value={srch} onChange={e=>setSrch(e.target.value)}/>
          </div>
          {depts.map(d=><div key={d} className={`pill${fil===d?" active":""}`} onClick={()=>setFil(d)}>{d}</div>)}
        </div>
      )}
      <div className="g2" style={{ alignItems:"start" }}>
        <div className="card" style={{ marginBottom:0 }}>
          <div className="ch"><div className="ct"><Icon n="users" s={14}/>{filtered.length} {canViewAll(currentUser)?"Employees":canManage(currentUser)?"Members":"Profile"}</div></div>
          <div style={{ padding:0,maxHeight:500,overflowY:"auto" }}>
            {filtered.map(e=>(
              <div key={e.id} className={`emp-row${sel===e.id?" sel":""}`} onClick={()=>{ setSel(e.id); setProfTab("profile"); }}>
                <div className="avt" style={{ width:36,height:36,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div>
                <div style={{ flex:1 }}><div className="fw7" style={{ fontSize:13,color:sel===e.id?"var(--accent)":"var(--ink)" }}>{e.name}{e.id===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div><div className="t3 tsm">{e.role}</div></div>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}><span className="bdg bdg-b" style={{ fontSize:10 }}>{e.dept}</span><span className="tsm t3">{e.loc}</span></div>
              </div>
            ))}
          </div>
        </div>
        {emp&&(
          <div className="card" style={{ marginBottom:0 }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div className="avt" style={{ width:44,height:44,fontSize:15,background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div>
                <div><div className="fw7" style={{ fontSize:15,fontFamily:"var(--display)" }}>{emp.name}</div><div className="t3 tsm">{emp.role} · {emp.dept}</div></div>
              </div>
              <div style={{ display:"flex",gap:6,alignItems:"center" }}><span className="bdg bdg-b">{emp.loc}</span><span className="bdg bdg-g">Active</span></div>
            </div>
            <div style={{ display:"flex",borderBottom:"1px solid var(--brd)" }}>
              {["profile",...(canSeeSensitive?["identity"]:[]),"employment"].map(t=><div key={t} className={`tab${profTab===t?" active":""}`} onClick={()=>setProfTab(t)} style={{ padding:"8px 14px",fontSize:12 }}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}
            </div>
            <div className="cb">
              {profTab==="profile"&&(
                <div>
                  <div className="info-grid" style={{ marginBottom:14 }}>
                    {[["First Name",emp.firstName],["Last Name",emp.lastName],["Date of Birth",canSeeSensitive?emp.dob:"••••••••"],["Age",`${emp.age} years`],["Gender",emp.gender],["Email",emp.email],["Phone",canSeeSensitive?emp.phone:"+91 •••••• ••••"],["Location",emp.loc]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:600,fontSize:12.5 }}>{v}</div></div>)}
                  </div>
                  <div className="sep"/>
                  <div className="flbl" style={{ marginBottom:8 }}>Skills</div>
                  <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>{emp.skills.map(sk=><span key={sk} style={{ padding:"3px 10px",borderRadius:"var(--r999)",background:"var(--accent-soft)",color:"var(--accent)",fontSize:11,fontWeight:650 }}>{sk}</span>)}</div>
                  <div className="sep"/>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}><div className="flbl">Performance Score</div><div style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:16,color:emp.perf>=4.5?"var(--green)":emp.perf>=4?"var(--amber)":"var(--red)" }}>{emp.perf}/5.0</div></div>
                  <div className="pt" style={{ height:6 }}><div className="pf" style={{ width:`${(emp.perf/5)*100}%`,background:emp.perf>=4.5?"var(--green)":emp.perf>=4?"var(--amber)":"var(--red)" }}/></div>
                </div>
              )}
              {profTab==="identity"&&canSeeSensitive&&(
                <div>
                  <div style={{ padding:"9px 12px",background:"var(--amber-soft)",borderRadius:"var(--r8)",fontSize:12,color:"var(--amber)",display:"flex",alignItems:"center",gap:7,marginBottom:14 }}><Icon n="lock" s={13}/>Sensitive — Directors and the employee only.</div>
                  <div className="info-grid">{[["Aadhaar",emp.aadhaar],["PAN",emp.pan],["Employee ID",emp.id],["UAN",emp.uan],["PF Account",emp.pfAccount],["Bank",emp.bank],["Account No.",emp.accountNo],["IFSC",emp.ifsc]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:600,fontSize:12.5,fontFamily:"var(--mono)" }}>{v}</div></div>)}</div>
                </div>
              )}
              {profTab==="employment"&&(
                <div>
                  <div className="info-grid">{[["Date of Joining",emp.joining],["Tenure",`${Math.floor((new Date()-new Date(emp.joining))/31536000000)} years`],["Employment Type",emp.empType],["Notice Period",emp.noticePeriod],["Annual CTC",canSeeSensitiveOf(currentUser,emp.id)?`₹${emp.ctcLPA} LPA`:"Confidential"],["Location",emp.loc],["Manager",emp.mgr?ALL_USERS.find(e=>e.id===emp.mgr)?.name||"—":"None"],["Performance",`${emp.perf}/5.0`]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:600,fontSize:12.5 }}>{v}</div></div>)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ORG CHART ─────────────────────────────────────────────────────────────────
const OrgMod = ({ currentUser }) => {
  const isFullView = canViewAll(currentUser);
  const renderOrgCard = (emp) => {
    const cls = emp.id===currentUser.id?"org-card is-you":emp.accessLevel>=3?"org-card is-root":emp.accessLevel===2?"org-card is-lead":"org-card";
    const badgeColor = emp.accessLevel>=4?"#1B45F5":emp.accessLevel===3?"#5C35C2":emp.accessLevel===2?"#B06010":"#0F8C5A";
    const badgeText  = emp.accessLevel>=4?"CEO":emp.accessLevel===3?"Director":emp.accessLevel===2?"Lead":"IC";
    return (
      <div className={cls} style={{ minWidth:100,maxWidth:118 }}>
        <div className="avt" style={{ width:34,height:34,fontSize:12,background:emp.color,margin:"0 auto" }}>{emp.firstName[0]}{emp.lastName[0]}</div>
        <div className="org-card-name">{emp.firstName}<br/>{emp.lastName}</div>
        <div className="org-card-role">{emp.role.split(" ").slice(0,3).join(" ")}</div>
        <div className="org-card-badge" style={{ background:badgeColor+"18",color:badgeColor }}>{badgeText}</div>
        {emp.id===currentUser.id&&<div style={{ fontSize:8,marginTop:3,color:"var(--green)",fontWeight:700 }}>● YOU</div>}
      </div>
    );
  };
  const renderTeamGroup = (lead) => {
    const members=(lead.reports||[]).map(id=>ALL_USERS.find(u=>u.id===id)).filter(Boolean);
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
        {renderOrgCard(lead)}
        {members.length>0&&<><div className="org-connector-v"/><div style={{ position:"relative",padding:"12px 10px 10px",border:"1px solid var(--brd)",borderRadius:"var(--r12)",background:"var(--raised)" }}><div style={{ position:"absolute",top:-10,left:10,background:"var(--surface)",border:"1px solid var(--brd)",borderRadius:"var(--r999)",padding:"2px 10px",fontSize:9,fontWeight:700,color:"var(--ink4)",textTransform:"uppercase",letterSpacing:"0.5px",whiteSpace:"nowrap" }}>{lead.role.split(" ").slice(0,2).join(" ")} · {members.length}</div><div style={{ display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",maxWidth:members.length<=3?members.length*126:400 }}>{members.map(m=><div key={m.id}>{renderOrgCard(m)}</div>)}</div></div></>}
      </div>
    );
  };
  const ceo=ALL_USERS.find(u=>!u.mgr);
  const deptHeads=ceo?.reports?.map(id=>ALL_USERS.find(u=>u.id===id)).filter(Boolean)||[];
  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">Organisation</div><div className="ph-title">Org Chart</div><div className="ph-sub">{isFullView?"Full company hierarchy":"Your team reporting chain"}</div></div></div>
      <div className="card">
        <div className="ch"><div className="ct"><Icon n="org" s={14}/>{isFullView?"Full Org Tree":"My Team"}</div></div>
        <div style={{ padding:"24px 20px",overflowX:"auto" }}>
          {isFullView&&ceo&&<div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24 }}>{renderOrgCard(ceo)}<div className="org-connector-v" style={{ height:28 }}/><div style={{ width:"60%",height:1,background:"var(--brd2)" }}/></div>}
          {isFullView&&deptHeads.map(head=>{
            const subManagers=(head.reports||[]).map(id=>ALL_USERS.find(u=>u.id===id)).filter(Boolean);
            return (
              <div key={head.id} className="org-dept-section">
                <div className="org-dept-header"><div className="org-dept-line"/><div className="org-dept-title">{head.dept}</div><div className="org-dept-line"/></div>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",marginBottom:16 }}>{renderOrgCard(head)}{subManagers.length>0&&<div className="org-connector-v" style={{ height:24 }}/>}</div>
                {subManagers.length>0&&<div style={{ display:"flex",gap:20,justifyContent:"center",flexWrap:"wrap" }}>{subManagers.map(mgr=><div key={mgr.id}>{renderTeamGroup(mgr)}</div>)}</div>}
              </div>
            );
          })}
          {!isFullView&&<div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>{renderTeamGroup(currentUser)}</div>}
        </div>
      </div>
    </div>
  );
};

// ─── PERFORMANCE ───────────────────────────────────────────────────────────────
const PerfMod = ({ currentUser }) => {
  const [tab, setTab] = useState("goals");
  const goals   = PERF_GOALS_BY_EMP[currentUser.id]||DEFAULT_GOALS;
  const reviews = REVIEWS_BY_EMP[currentUser.id]||DEFAULT_REVIEWS;
  const skills  = SKILLS_BY_EMP[currentUser.id]||DEFAULT_SKILLS;
  const visibleEmps = getVisibleEmps(currentUser);
  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">People</div><div className="ph-title">Performance</div><div className="ph-sub">Goals, OKRs, review cycles and skill scores</div></div><button className="btn btn-p"><Icon n="plus" s={13}/>Add Goal</button></div>
      <div className="sg">{[
        { v:currentUser.perf,l:"My Perf Score",s:"Last review",c:"#0F8C5A" },
        { v:goals.filter(g=>g.status==="on-track").length,l:"On Track",s:"Active goals",c:"#1B45F5" },
        { v:goals.filter(g=>g.status==="at-risk").length,l:"At Risk",s:"Need attention",c:"#B06010" },
        { v:currentQuarterLabel(),l:"Next Review",s:`Due ${reviewDueDate.toLocaleDateString("en-IN",{ day:"numeric", month:"short" })}`,c:"#5C35C2" },
      ].map((s,i)=>(
        <div className="sc" key={i}>
          <div className="sc-accent" style={{ background:s.c }}/>
          <div className="sc-val" style={{ marginTop:10 }}>{s.v}</div>
          <div className="sc-lbl">{s.l}</div>
          <div className="sc-sub">{s.s}</div>
        </div>
      ))}</div>
      <div className="tabs">{["goals","reviews","skills",...(canManage(currentUser)?["team"]:[])].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="goals"?"My Goals":t==="reviews"?"Reviews":t==="skills"?"Skills":"Team"}</div>)}</div>
      {tab==="goals"&&<div className="card"><div className="ch"><div className="ct"><Icon n="target" s={14}/>My Goals — {currentQuarterLabel()}</div></div><div style={{ padding:0 }}>{goals.map((g,i)=>(<div key={i} style={{ padding:"12px 14px",borderBottom:"1px solid var(--brd)" }}><div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:6 }}><div style={{ flex:1 }}><div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:2 }}><div className="fw7" style={{ fontSize:13 }}>{g.title}</div>{g.key&&<span className="bdg bdg-p" style={{ fontSize:9.5 }}>KEY</span>}</div><div className="t3 tsm">Target: {g.target} · {g.notes}</div></div><span className={`bdg ${g.status==="on-track"?"bdg-g":"bdg-a"}`}>{g.status==="on-track"?"On Track":"At Risk"}</span><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:g.progress>=75?"var(--green)":"var(--amber)",minWidth:38,textAlign:"right" }}>{g.progress}%</span></div><div className="pt" style={{ height:5 }}><div className="pf" style={{ width:`${g.progress}%`,background:g.status==="on-track"?"var(--green)":"var(--amber)" }}/></div></div>))}</div></div>}
      {tab==="reviews"&&<div className="card"><div className="ch"><div className="ct"><Icon n="star" s={14}/>Review Cycles</div></div><div className="cb">{reviews.map((r,i)=>(<div key={i} className="review-card"><div style={{ display:"flex",alignItems:"center",gap:12 }}>{r.score?<div className="score-circle" style={{ background:r.score>=4.5?"var(--green-soft)":"var(--accent-soft)",color:r.score>=4.5?"var(--green)":"var(--accent)" }}>{r.score}</div>:<div className="score-circle" style={{ background:"var(--raised)",color:"var(--ink4)",fontSize:12 }}>TBD</div>}<div style={{ flex:1 }}><div style={{ display:"flex",gap:7,alignItems:"center",marginBottom:3 }}><div className="fw7" style={{ fontSize:13 }}>{r.period}</div>{r.status==="complete"?<span className="bdg bdg-g">Done</span>:<span className="bdg bdg-a">Upcoming</span>}</div><div className="t3 tsm">{r.manager} · {r.date}</div>{r.feedback&&<div style={{ fontSize:12,color:"var(--ink2)",marginTop:6,padding:"6px 10px",background:"var(--raised)",borderRadius:"var(--r8)",borderLeft:"2px solid var(--accent)" }}>{r.feedback}</div>}</div></div></div>))}</div></div>}
      {tab==="skills"&&<div className="card"><div className="ch"><div className="ct"><Icon n="star" s={14}/>Competency Scores</div></div><div className="cb">{skills.map((sk,i)=>(<div className="lbar" key={i}><div style={{ minWidth:180 }}><div style={{ fontWeight:650,fontSize:13 }}>{sk.name}</div></div><div style={{ flex:1,margin:"0 12px" }} className="lbar-t"><div className="lbar-f" style={{ width:`${(sk.score/5)*100}%`,background:sk.score>=4.5?"var(--green)":sk.score>=4?"var(--accent)":"var(--amber)" }}/></div><div style={{ minWidth:50,textAlign:"right" }}><span style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:14,color:sk.score>=4.5?"var(--green)":sk.score>=4?"var(--accent)":"var(--amber)" }}>{sk.score}</span><span className="t3" style={{ fontSize:11 }}>/5</span></div></div>))}</div></div>}
      {tab==="team"&&canManage(currentUser)&&<div className="card"><div className="ch"><div className="ct"><Icon n="users" s={14}/>Team Performance</div></div><div className="tw"><table><thead><tr><th>Employee</th><th>Role</th><th>Score</th><th>Rating</th></tr></thead><tbody>{visibleEmps.filter(e=>e.id!==currentUser.id).map(e=><tr key={e.id}><td><div style={{ display:"flex",alignItems:"center",gap:8 }}><div className="avt" style={{ width:26,height:26,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div className="fw7">{e.name}</div></div></td><td className="t3 tsm">{e.role}</td><td><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:e.perf>=4.5?"var(--green)":e.perf>=4?"var(--accent)":"var(--amber)" }}>{e.perf}</span></td><td><span className={`bdg ${e.perf>=4.5?"bdg-g":e.perf>=4?"bdg-b":"bdg-a"}`}>{e.perf>=4.5?"Excellent":e.perf>=4?"Good":"Needs Work"}</span></td></tr>)}</tbody></table></div></div>}
    </div>
  );
};

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────────
const DocsMod = ({ currentUser }) => {
  const docs=DOCS_BY_EMP[currentUser.id]||DEFAULT_DOCS;
  const [polList,setPolList]=useState(POLICY_LIST);
  const [tab,setTab]=useState("vault");
  const [catFil,setCatFil]=useState("All");
  const cats=["All",...[...new Set(docs.map(d=>d.cat))]];
  const filteredDocs=docs.filter(d=>catFil==="All"||d.cat===catFil);
  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">Documents</div><div className="ph-title">My Documents</div><div className="ph-sub">Letters, Form 16, PF statements and policy acknowledgements</div></div></div>
      <div className="sg">{[{ v:docs.length,l:"Documents",s:"In vault",c:"#1B45F5" },{ v:polList.filter(p=>p.acked).length,l:"Acknowledged",s:"Policies",c:"#0F8C5A" },{ v:polList.filter(p=>!p.acked).length,l:"Pending ACK",s:"Action required",c:"#C8312A" },{ v:docs.filter(d=>d.cat==="Tax").length,l:"Tax Docs",s:"Form 16 etc.",c:"#B06010" }].map((s,i)=>(
        <div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>
      ))}</div>
      <div className="tabs">{["vault","policies"].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="vault"?"Document Vault":"Policy Acknowledgements"}</div>)}</div>
      {tab==="vault"&&<div className="card"><div className="ch"><div className="ct"><Icon n="doc" s={14}/>Vault</div><div style={{ display:"flex",gap:5 }}>{cats.map(c=><div key={c} className={`pill${catFil===c?" active":""}`} onClick={()=>setCatFil(c)}>{c}</div>)}</div></div><div style={{ padding:0 }}>{filteredDocs.map((d,i)=>(<div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--brd)" }}><div style={{ width:34,height:34,borderRadius:"var(--r8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:"var(--accent-soft)" }}>{d.ico}</div><div style={{ flex:1 }}><div className="fw6" style={{ fontSize:13 }}>{d.name}</div><div className="t3 tsm">{d.type} · {d.size} · {d.date}</div></div><span className="bdg bdg-gray">{d.cat}</span>{d.status==="signed"&&<span className="bdg bdg-g" style={{ fontSize:10 }}>Signed</span>}<button className="btn btn-sm"><Icon n="eye" s={12}/> View</button></div>))}</div></div>}
      {tab==="policies"&&<div className="card"><div className="ch"><div className="ct"><Icon n="doc" s={14}/>Policies</div><div style={{ fontSize:12,color:"var(--ink3)" }}>{polList.filter(p=>p.acked).length}/{polList.length} done</div></div><div style={{ padding:0 }}>{polList.map((p,i)=>(<div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:"1px solid var(--brd)" }}><div style={{ width:34,height:34,borderRadius:"var(--r8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:p.acked?"var(--green-soft)":"var(--amber-soft)" }}>📋</div><div style={{ flex:1 }}><div className="fw6" style={{ fontSize:13 }}>{p.name}</div><div className="t3 tsm">{p.version} · {p.date}</div></div>{p.acked?<span className="bdg bdg-g">Acknowledged</span>:<button className="btn btn-p btn-sm" onClick={()=>setPolList(pl=>pl.map((x,idx)=>idx===i?{...x,acked:true}:x))}>Acknowledge</button>}</div>))}</div></div>}
    </div>
  );
};

// ─── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
const AnnMod = () => {
  const [filter,setFilter]=useState("All");
  const cats=["All",...[...new Set(ANNOUNCEMENTS.map(a=>a.cat))]];
  const filtered=ANNOUNCEMENTS.filter(a=>filter==="All"||a.cat===filter);
  const catC={ Company:"bdg-b",HR:"bdg-p",Celebration:"bdg-g",IT:"bdg-a",Facility:"bdg-t" };
  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">Communications</div><div className="ph-title">Announcements</div><div className="ph-sub">Company news, HR updates and notices</div></div></div>
      <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>{cats.map(c=><div key={c} className={`pill${filter===c?" active":""}`} onClick={()=>setFilter(c)}>{c}</div>)}</div>
      <div className="card"><div className="ch"><div className="ct"><Icon n="announce" s={14}/>Announcements</div><span className="bdg bdg-r" style={{ fontSize:10 }}>{ANNOUNCEMENTS.filter(a=>!a.read).length} new</span></div><div style={{ padding:"8px 0" }}>{filtered.map(a=>(<div key={a.id} className="ann" style={{ margin:"0 12px 8px",borderLeft:`2.5px solid ${!a.read?"var(--accent)":"var(--brd2)"}`,borderRadius:"0 var(--r8) var(--r8) 0",paddingLeft:12 }}><div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:5 }}><span className={`bdg ${catC[a.cat]||"bdg-gray"}`}>{a.cat}</span>{a.important&&<span className="bdg bdg-r" style={{ fontSize:10 }}>Important</span>}{!a.read&&<span className="bdg bdg-b" style={{ fontSize:10 }}>New</span>}<span className="t3 tsm" style={{ marginLeft:"auto" }}>{a.date}</span></div><div className="fw7" style={{ fontSize:13,marginBottom:4 }}>{a.title}</div><div className="t3 tsm" style={{ lineHeight:1.6 }}>{a.body.substring(0,200)}{a.body.length>200?"...":""}</div><div style={{ fontSize:11,color:"var(--ink4)",marginTop:8 }}>— {a.author}</div></div>))}</div></div>
    </div>
  );
};

// ─── ANALYTICS ─────────────────────────────────────────────────────────────────
const AnalyticsMod = ({ currentUser }) => {
  const [tab,setTab]=useState("overview");
  if (!canViewAnalytics(currentUser)) return <AccessDenied/>;
  const scopedEmps=canViewAll(currentUser)?ALL_USERS:getVisibleEmps(currentUser);
  const depts=[...new Set(scopedEmps.map(e=>e.dept))];
  const deptCount=depts.map(d=>({ name:d,count:scopedEmps.filter(e=>e.dept===d).length }));
  const maxCount=Math.max(...deptCount.map(d=>d.count),1);
  const payroll=depts.map(d=>({ dept:d,cost:scopedEmps.filter(e=>e.dept===d).reduce((a,e)=>a+(e.ctcLPA*100000/12),0) }));
  const totalPayroll=payroll.reduce((a,d)=>a+d.cost,0);
  const avgPerf=(scopedEmps.reduce((a,e)=>a+e.perf,0)/scopedEmps.length).toFixed(1);
  const isCompanyWide=canViewAll(currentUser);
  const barColors=["#1B45F5","#0F8C5A","#B06010","#5C35C2","#C8312A"];
  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">Insights</div><div className="ph-title">Analytics</div><div className="ph-sub">{isCompanyWide?"Company-wide insights":`Team scope — ${scopedEmps.length} employees`}</div></div></div>
      <div className="sg">{[
        { v:scopedEmps.length,l:isCompanyWide?"Total Headcount":"Team Size",s:`${depts.length} depts`,c:"#1B45F5" },
        { v:isCompanyWide?ATTRITION_DATA.length:"—",l:"Attrition YTD",s:isCompanyWide?`${((ATTRITION_DATA.length/ALL_USERS.length)*100).toFixed(1)}%`:"N/A",c:"#C8312A" },
        { v:`₹${Math.round(totalPayroll/100000).toFixed(1)}L`,l:"Monthly Payroll",s:"Gross",c:"#0F8C5A" },
        { v:avgPerf,l:"Avg Perf",s:isCompanyWide?"Company":"Your team",c:"#5C35C2" },
      ].map((s,i)=>(
        <div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>
      ))}</div>
      <div className="tabs">{["overview","employees",...(isCompanyWide?["hiring","attrition"]:[])].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>
      {tab==="overview"&&<div className="g2">
        <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Headcount by Dept</div></div><div className="cb"><div style={{ display:"flex",alignItems:"flex-end",gap:10,height:140,justifyContent:"space-around",borderBottom:"1px solid var(--brd)",paddingBottom:8,marginBottom:8 }}>{deptCount.map((d,i)=>{ const h=Math.round((d.count/maxCount)*110); return (<div key={d.name} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1 }}><div style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:12,color:barColors[i%barColors.length] }}>{d.count}</div><div style={{ width:32,height:h,borderRadius:"var(--r4) var(--r4) 0 0",background:barColors[i%barColors.length] }}/><div style={{ fontSize:9,color:"var(--ink3)",textAlign:"center" }}>{d.name.slice(0,5)}</div></div>);})}
        </div></div></div>
        <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Payroll by Dept</div></div><div className="cb">{payroll.sort((a,b)=>b.cost-a.cost).map((p,i)=>(<div key={p.dept} className="lbar"><div style={{ minWidth:110 }}><div style={{ fontWeight:650,fontSize:12 }}>{p.dept}</div></div><div style={{ flex:1,margin:"0 10px" }} className="lbar-t"><div className="lbar-f" style={{ width:`${(p.cost/totalPayroll)*100}%`,background:barColors[i%barColors.length] }}/></div><span style={{ fontFamily:"var(--mono)",fontWeight:700,fontSize:12,color:"var(--accent)",minWidth:60,textAlign:"right" }}>₹{Math.round(p.cost/1000)}K</span></div>))}</div></div>
      </div>}
      {tab==="employees"&&<div className="card"><div className="ch"><div className="ct">Employee Performance & Payroll</div></div><div className="tw" style={{ maxHeight:500,overflowY:"auto" }}><table><thead><tr><th>Employee</th><th>Dept</th><th>CTC</th><th>Net/mo</th><th>Score</th><th>Rating</th></tr></thead><tbody>{scopedEmps.map(e=>{ const mon=Math.round(e.ctcLPA*100000/12);const b=Math.round(mon*0.40);const g=mon;const d=Math.round(b*0.12)+200+Math.round(g*0.10);const n=g-d;const canSee=canSeeSensitiveOf(currentUser,e.id); return <tr key={e.id}><td><div style={{ display:"flex",alignItems:"center",gap:7 }}><div className="avt" style={{ width:26,height:26,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div className="fw7">{e.name}</div></div></td><td><span className="bdg bdg-b">{e.dept}</span></td><td className="fw6 mono">{canSee?`₹${e.ctcLPA}L`:"—"}</td><td className="fw6 mono" style={{ color:"var(--green)" }}>{canSee?`₹${Math.round(n/1000)}K`:"—"}</td><td><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:e.perf>=4.5?"var(--green)":e.perf>=4?"var(--accent)":"var(--amber)" }}>{e.perf}</span></td><td><span className={`bdg ${e.perf>=4.5?"bdg-g":e.perf>=4?"bdg-b":"bdg-a"}`}>{e.perf>=4.5?"Excellent":e.perf>=4?"Good":"Needs Work"}</span></td></tr>; })}</tbody></table></div></div>}
      {tab==="hiring"&&isCompanyWide&&<div className="card"><div className="ch"><div className="ct">Hiring Pipeline</div></div><div className="tw"><table><thead><tr><th>Role</th><th>Dept</th><th>Open</th><th>Applied</th><th>Shortlisted</th><th>Offered</th><th>Status</th></tr></thead><tbody>{HIRING_PIPELINE.map((r,i)=>(<tr key={i}><td className="fw7">{r.role}</td><td><span className="bdg bdg-b">{r.dept}</span></td><td className="mono fw6">{r.openings}</td><td className="mono">{r.applied}</td><td className="mono" style={{ color:"var(--amber)" }}>{r.shortlisted}</td><td className="mono" style={{ color:"var(--green)" }}>{r.offered}</td><td><span className={`bdg ${r.status==="onboarding"?"bdg-g":r.status==="offer-out"?"bdg-a":"bdg-b"}`}>{r.status}</span></td></tr>))}</tbody></table></div></div>}
      {tab==="attrition"&&isCompanyWide&&<div className="card"><div className="ch"><div className="ct">Recent Attrition</div></div><div className="tw"><table><thead><tr><th>Employee</th><th>Dept</th><th>Resigned</th><th>LWD</th><th>Reason</th></tr></thead><tbody>{ATTRITION_DATA.map((a,i)=>(<tr key={i}><td className="fw7">{a.name}</td><td><span className="bdg bdg-b">{a.dept}</span></td><td className="mono t3 tsm">{a.resigned}</td><td className="mono t3 tsm">{a.lwd}</td><td className="t3 tsm">{a.reason}</td></tr>))}</tbody></table></div></div>}
    </div>
  );
};

// ─── PAGES ─────────────────────────────────────────────────────────────────────
const PAGES = [
  { id:"dir",        l:"Directory",      i:"user",     grp:"People",    minLevel:1 },
  { id:"org",        l:"Org Chart",      i:"org",      grp:"People",    minLevel:1 },
  { id:"attendance", l:"Attendance",     i:"attend",   grp:"People",    minLevel:1 },
  { id:"leaves",     l:"Time Off",       i:"leave",    grp:"People",    minLevel:1 },
  { id:"timelog",    l:"Time Log",       i:"time",     grp:"Work",      minLevel:1 },
  { id:"perf",       l:"Performance",    i:"perf",     grp:"Work",      minLevel:1 },
  { id:"salary",     l:"Payroll",        i:"salary",   grp:"Finance",   minLevel:1 },
  { id:"docs",       l:"Documents",      i:"doc",      grp:"Resources", minLevel:1 },
  { id:"announce",   l:"Announcements",  i:"announce", grp:"Resources", minLevel:1 },
  { id:"analytics",  l:"Analytics",      i:"analytics",grp:"Insights",  minLevel:2 },
];

// ─── APP SHELL ─────────────────────────────────────────────────────────────────
export default function HRApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dir");
  const [clock, setClock] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

  if (!currentUser) return (<><GS/><LoginScreen onLogin={u => { setCurrentUser(u); setPage("dir"); }}/></>);

  const visiblePages = PAGES.filter(p => currentUser.accessLevel >= p.minLevel);
  const grps = [...new Set(visiblePages.map(p => p.grp))];

  const renderPage = () => {
    switch(page) {
      case "dir":        return <DirectoryMod currentUser={currentUser}/>;
      case "org":        return <OrgMod currentUser={currentUser}/>;
      case "attendance": return <AttendanceMod currentUser={currentUser}/>;
      case "leaves":     return <LeaveMod currentUser={currentUser}/>;
      case "timelog":    return <TimeLogMod currentUser={currentUser}/>;
      case "perf":       return <PerfMod currentUser={currentUser}/>;
      case "docs":       return <DocsMod currentUser={currentUser}/>;
      case "salary":     return <SalaryMod currentUser={currentUser}/>;
      case "announce":   return <AnnMod currentUser={currentUser}/>;
      case "analytics":  return <AnalyticsMod currentUser={currentUser}/>;
      default:           return <DirectoryMod currentUser={currentUser}/>;
    }
  };

  const accessLabel = { 4:"CEO", 3:"Director", 2:"Manager", 1:"Employee" }[currentUser.accessLevel];
  const pendingLeaves = INIT_LEAVE_REQS.filter(r => r.status==="pending" && r.empId!==currentUser.id && canApproveLeaveNew(currentUser, r.empId));

  return (
    <>
      <GS/>
      <div className="app">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="tb-brand">
            <div style={{ width:28, height:28, borderRadius:7, background:"var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div className="tb-wordmark">DOLOXE<span>INDIA PVT LTD.</span></div>
          </div>

          <div className="tb-center">
            <div className="tb-search">
              <Icon n="search" s={13}/> Search people, documents…
            </div>
          </div>

          <div className="tb-right">
            <div className="tb-clock">{clock.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
            <div style={{ padding:"3px 9px", borderRadius:"var(--r999)", background:"var(--accent-soft)", color:"var(--accent)", fontSize:10.5, fontWeight:700, border:"1px solid rgba(27,69,245,0.2)" }}>{accessLabel}</div>
            <div className="tb-btn"><Icon n="bell" s={14}/>{pendingLeaves.length>0&&<div className="notif-dot"/>}</div>
            <div className="tb-user">
              <div className="avt" style={{ width:26, height:26, fontSize:9, background:currentUser.color }}>{currentUser.firstName[0]}{currentUser.lastName[0]}</div>
              <div>
                <div className="tb-uname">{currentUser.firstName} {currentUser.lastName.charAt(0)}.</div>
                <div className="tb-urole">{currentUser.role.split("/")[0].trim()}</div>
              </div>
            </div>
            <button className="btn btn-sm" style={{ color:"var(--red)", borderColor:"rgba(200,49,42,0.2)", background:"var(--red-soft)" }} onClick={()=>setCurrentUser(null)}>
              <Icon n="logout" s={12}/>
            </button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-user-card">
            <div className="sbu-badge">{currentUser.isHR?"HR":"L"+currentUser.accessLevel}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, position:"relative", zIndex:1 }}>
              <div className="avt" style={{ width:30, height:30, fontSize:10, background:"rgba(255,255,255,0.2)" }}>{currentUser.firstName[0]}{currentUser.lastName[0]}</div>
              <div>
                <div className="sbu-name">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="sbu-role">{currentUser.role}</div>
              </div>
            </div>
            <div className="sbu-id" style={{ position:"relative", zIndex:1 }}>{currentUser.id} · {currentUser.dept}</div>
          </div>

          {grps.map(grp => (
            <div key={grp}>
              <div className="sb-section-label">{grp}</div>
              {visiblePages.filter(p => p.grp === grp).map(p => {
                const isPendingPage = p.id === "leaves" && pendingLeaves.length > 0;
                return (
                  <div key={p.id} className={`sb-item${page===p.id?" active":""}`} onClick={()=>setPage(p.id)}>
                    <Icon n={p.i} s={14}/>
                    <span style={{ flex:1 }}>{p.l}</span>
                    {isPendingPage && <span className="sb-pip">{pendingLeaves.length}</span>}
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ flex:1 }}/>
          <div className="sb-divider"/>
          <div className="sb-item" onClick={()=>setCurrentUser(null)} style={{ color:"var(--red)", margin:"0 6px" }}>
            <Icon n="logout" s={14}/><span>Sign Out</span>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="main-inner">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}
