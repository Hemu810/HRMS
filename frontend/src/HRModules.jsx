import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
// GS injects the design-system CSS once into the DOM as a <style> tag.
// All class names here are referenced by JSX throughout the file — rename
// with care. Variables in :root act as a single source of truth for every
// colour, radius, shadow and spacing value used across all modules.
const GS = () => (
  <style>{`
    /* Google Fonts are loaded via <link> in index.html — no @import needed here */

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Design Tokens ─────────────────────────────────────────────────── */
    :root {
      /* Text — cool slate scale */
      --ink:  #0C0F14;
      --ink2: #1E2636;
      --ink3: #5A6480;
      --ink4: #8B96AC;
      --ink5: #C2CBD9;

      /* Surfaces */
      --paper:   #F4F7FB;
      --surface: #FFFFFF;
      --raised:  #EBF0F7;

      /* Brand — vivid cobalt */
      --accent:      #2563EB;
      --accent-soft: #EFF6FF;
      --accent-mid:  #1D4ED8;

      /* Semantic status colours */
      --green:       #059669;  --green-soft:  #ECFDF5;
      --red:         #DC2626;  --red-soft:    #FEF2F2;
      --amber:       #D97706;  --amber-soft:  #FFFBEB;
      --purple:      #7C3AED;  --purple-soft: #F5F3FF;
      --teal:        #0D9488;  --teal-soft:   #F0FDFA;
      --rose:        #E11D48;  --rose-soft:   #FFF1F2;

      /* Borders */
      --brd:  rgba(10,20,50,0.07);
      --brd2: rgba(10,20,50,0.14);

      /* Border radii */
      --r4: 4px; --r6: 6px; --r8: 8px; --r10: 10px;
      --r12: 12px; --r14: 14px; --r16: 16px; --r20: 20px; --r999: 999px;

      /* Layout dimensions */
      --sb: 242px; --topbar: 56px;

      /* Typography */
      --font:    'Inter', system-ui, -apple-system, sans-serif;
      --display: 'Inter', system-ui, -apple-system, sans-serif;
      --mono:    'JetBrains Mono', 'Fira Code', ui-monospace, Consolas, monospace;

      /* Easing curves */
      --ease:     cubic-bezier(0.16, 1, 0.3, 1);
      --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);

      /* Shadow system — layered for natural depth */
      --shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
      --shadow-sm: 0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
      --shadow-lg: 0 12px 36px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06);
      --shadow-xl: 0 28px 72px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08);
    }

    html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; box-sizing: border-box; overflow: hidden; }
    body {
      font-family: var(--font);
      background: var(--paper);
      color: var(--ink);
      font-size: 13.5px;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overscroll-behavior: none;
      /* Gecko (Firefox) has no ::-webkit-scrollbar support — this is its equivalent,
         so the slim scrollbar look is consistent across Blink/WebKit/Gecko instead
         of Firefox falling back to its much wider default. */
      scrollbar-width: thin;
      scrollbar-color: var(--ink5) transparent;
    }

    /* Slim, polished scrollbar — Blink/WebKit. Firefox uses scrollbar-width/-color above. */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--ink5); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ink4); }

    /* ── TOPBAR ──────────────────────────────────────────────────────────── */
    /* Frosted-glass effect; z-index 200 keeps it above sidebar (100). */
    .topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      height: var(--topbar);
      background: rgba(255,255,255,0.88);
      backdrop-filter: blur(14px) saturate(1.8);
      -webkit-backdrop-filter: blur(14px) saturate(1.8);
      border-bottom: 1px solid var(--brd);
      box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.04);
      display: flex; align-items: center;
      padding: 0 20px 0 0;
    }
    .tb-brand {
      width: var(--sb); flex-shrink: 0;
      display: flex; align-items: center; gap: 10px;
      padding: 0 18px;
      border-right: 1px solid var(--brd);
      height: 100%;
    }
    .tb-wordmark {
      font-family: var(--display); font-size: 13.5px; font-weight: 800;
      letter-spacing: -0.5px; color: var(--ink);
    }
    .tb-wordmark span { color: var(--accent); }
    .tb-center { flex: 1; min-width: 0; display: flex; align-items: center; padding: 0 20px; }
    .tb-search {
      display: flex; align-items: center; gap: 8px;
      background: var(--paper); border: 1.5px solid var(--brd);
      border-radius: var(--r10); padding: 0 13px; height: 34px;
      width: clamp(140px, 22vw, 300px); /* shrinks smoothly instead of needing to vanish at one breakpoint */
      font-size: 12.5px; color: var(--ink4); cursor: text;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .tb-search:hover { border-color: var(--brd2); background: var(--surface); }
    .tb-right { margin-left: auto; display: flex; align-items: center; gap: 7px; }
    .tb-clock {
      font-family: var(--mono); font-size: 11.5px; color: var(--ink3);
      background: var(--paper); border: 1.5px solid var(--brd);
      border-radius: var(--r8); padding: 4px 11px; letter-spacing: 0.5px; font-weight: 500;
    }
    .tb-btn {
      width: 34px; height: 34px; border-radius: var(--r8);
      border: 1.5px solid var(--brd); background: transparent;
      color: var(--ink4); font-size: 15px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.12s; position: relative;
    }
    .tb-btn:hover { background: var(--raised); border-color: var(--brd2); color: var(--ink2); }
    .tb-user {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 10px 5px 6px; border-radius: var(--r8);
      cursor: pointer; border: 1.5px solid var(--brd); transition: all 0.12s;
    }
    .tb-user:hover { background: var(--raised); border-color: var(--brd2); }
    .tb-uname { font-size: 12.5px; font-weight: 700; color: var(--ink); line-height: 1.2; }
    .tb-urole { font-size: 10px; color: var(--ink4); line-height: 1.2; }

    /* ── SIDEBAR ─────────────────────────────────────────────────────────── */
    /* z-index 100 keeps it above page content but below modals (300). */
    .sidebar {
      position: fixed; top: var(--topbar); left: 0; bottom: 0;
      width: var(--sb);
      background: var(--surface);
      border-right: 1px solid var(--brd);
      display: flex; flex-direction: column;
      overflow-y: auto; overscroll-behavior: none; z-index: 100;
      padding: 0 0 16px;
    }
    /* User identity card — dark gradient with decorative orbs */
    .sb-user-card {
      margin: 12px 10px 10px; padding: 15px 16px;
      border-radius: var(--r14);
      background: linear-gradient(145deg, #0C0F14 0%, #161d30 55%, #1a2545 100%);
      color: #fff; position: relative; overflow: hidden;
      box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    }
    .sb-user-card::before {
      content: ''; position: absolute; top: -22px; right: -14px;
      width: 88px; height: 88px; border-radius: 50%;
      background: rgba(37,99,235,0.28); pointer-events: none;
    }
    .sb-user-card::after {
      content: ''; position: absolute; bottom: -30px; left: 6px;
      width: 78px; height: 78px; border-radius: 50%;
      background: rgba(255,255,255,0.04); pointer-events: none;
    }
    .sbu-name { font-family: var(--display); font-size: 13px; font-weight: 700; margin-bottom: 1px; letter-spacing: -0.2px; }
    .sbu-role { font-size: 10.5px; opacity: 0.48; margin-bottom: 10px; }
    .sbu-id {
      font-family: var(--mono); font-size: 9.5px; color: rgba(255,255,255,0.35);
      background: rgba(255,255,255,0.09); border-radius: var(--r4); padding: 2px 8px;
      display: inline-block; letter-spacing: 0.3px;
    }
    .sb-section-label {
      padding: 16px 16px 5px;
      font-size: 9px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
      color: var(--ink5);
    }
    .sb-item {
      display: flex; align-items: center; gap: 9px;
      padding: 7px 10px 7px 12px; margin: 1px 8px;
      border-radius: var(--r8); cursor: pointer;
      font-size: 12.5px; font-weight: 500; color: var(--ink3);
      transition: all 0.12s; position: relative;
    }
    .sb-item:hover { background: var(--raised); color: var(--ink2); }
    /* Active nav item — accent background + left accent stripe */
    .sb-item.active { background: var(--accent-soft); color: var(--accent); font-weight: 650; }
    .sb-item.active::before {
      content: ''; position: absolute; left: -8px; top: 5px; bottom: 5px;
      width: 3px; background: var(--accent); border-radius: 0 3px 3px 0;
    }
    .sb-item svg { width: 15px; height: 15px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .sb-divider { height: 1px; background: var(--brd); margin: 8px 10px; }
    .sb-signout {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      margin: 6px 10px 2px; padding: 9px 14px;
      border-radius: var(--r8); cursor: pointer;
      font-size: 12.5px; font-weight: 700; letter-spacing: 0.1px;
      color: var(--red);
      background: var(--red-soft);
      border: 1.5px solid rgba(220,38,38,0.22);
      transition: background 0.12s, border-color 0.12s, box-shadow 0.12s, transform 0.1s;
      user-select: none;
    }
    .sb-signout:hover {
      background: #fde0e0; border-color: rgba(220,38,38,0.42);
      box-shadow: 0 2px 10px rgba(220,38,38,0.15);
    }
    .sb-signout:active { transform: translateY(1px); box-shadow: none; }

    /* ── APP SHELL & MAIN CONTENT ────────────────────────────────────────── */
    /* height: 100dvh after 100vh — browsers that don't understand dvh ignore that
       line and keep 100vh; browsers that do (all current engines) use it instead,
       so the shell tracks the *actual visible* viewport as mobile browser chrome
       (address bar) shows/hides, instead of being sized for the largest possible
       viewport and getting clipped. */
    .app { display: flex; height: 100vh; height: 100dvh; width: 100%; overflow: hidden; background: var(--paper); }
    /* main is fixed so it sits alongside the sidebar and below the topbar */
    .main {
      position: fixed;
      top: var(--topbar); left: var(--sb); right: 0; bottom: 0;
      overflow-y: auto; overflow-x: hidden; overscroll-behavior: none;
    }
    .main-inner { padding: 26px 30px; }

    /* ── PAGE HEADER ─────────────────────────────────────────────────────── */
    .ph { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
    .ph-eyebrow {
      font-size: 9.5px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
      color: var(--accent); margin-bottom: 4px; opacity: 0.75;
    }
    .ph-title {
      font-family: var(--display); font-size: 22px; font-weight: 800;
      color: var(--ink); letter-spacing: -0.6px; line-height: 1.15;
    }
    .ph-sub { font-size: 12.5px; color: var(--ink4); margin-top: 3px; }

    /* ── AVATAR ──────────────────────────────────────────────────────────── */
    .avt {
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: #fff; flex-shrink: 0;
      font-size: 11px; line-height: 1;
      box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    }

    /* ── STAT CARDS ──────────────────────────────────────────────────────── */
    /* Four-across grid of KPI summary tiles above each module. */
    /* auto-fit + minmax: as many 200px-minimum columns as fit, collapsing to fewer
       (down to 1) as the viewport shrinks — no breakpoint needed at all. */
    .sg { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 12px; margin-bottom: 22px; }
    .sc {
      background: var(--surface); border: 1px solid var(--brd);
      border-radius: var(--r14); padding: 18px 18px 15px;
      position: relative; overflow: hidden;
      transition: border-color 0.18s, box-shadow 0.18s, transform 0.18s;
      box-shadow: var(--shadow-sm);
    }
    .sc:hover { border-color: var(--brd2); box-shadow: var(--shadow-md); transform: translateY(-1px); }
    /* Full-width top accent stripe — colour set per-card via inline style */
    .sc-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .sc-emo { font-size: 18px; margin-bottom: 10px; }
    .sc-val { font-family: var(--display); font-size: 30px; font-weight: 800; color: var(--ink); letter-spacing: -1.2px; line-height: 1; }
    .sc-lbl { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink4); margin-top: 7px; }
    .sc-sub { font-size: 11px; color: var(--ink5); margin-top: 2px; font-weight: 500; }

    /* ── CARD ────────────────────────────────────────────────────────────── */
    /* General-purpose container: header (.ch) + body (.cb). */
    .card {
      background: var(--surface); border: 1px solid var(--brd);
      border-radius: var(--r14); margin-bottom: 16px; overflow: hidden;
      box-shadow: var(--shadow-sm); transition: box-shadow 0.18s;
      /* Flex/grid items default to min-width:auto, which refuses to shrink below
         a wide table's content size — that's what actually causes a grid/flex
         layout to blow out the page width on narrow screens, even when the table
         itself has overflow-x:auto. min-width:0 lets .card shrink to its
         container so .tw's own scrollbar (below) is what handles overflow. */
      min-width: 0;
    }
    .card:hover { box-shadow: var(--shadow-md); }
    .ch {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; border-bottom: 1px solid var(--brd);
    }
    .ct { font-family: var(--display); font-size: 13px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 8px; letter-spacing: -0.2px; }
    .cb { padding: 16px 18px; }

    /* ── BUTTON ──────────────────────────────────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; gap: 5px;
      border: 1.5px solid var(--brd); background: var(--surface); color: var(--ink2);
      font-family: var(--font); font-size: 12.5px; font-weight: 600;
      padding: 6px 13px; border-radius: var(--r8);
      cursor: pointer; transition: background 0.1s, border-color 0.1s, box-shadow 0.1s, transform 0.1s; white-space: nowrap;
      box-shadow: var(--shadow-xs); will-change: transform;
    }
    .btn:hover { background: var(--raised); border-color: var(--brd2); color: var(--ink); }
    .btn:active { transform: translateY(1px); box-shadow: none; }
    /* Primary — cobalt blue with glow */
    .btn-p { background: var(--accent); color: #fff; border-color: var(--accent); box-shadow: 0 2px 8px rgba(37,99,235,0.3); }
    .btn-p:hover { background: var(--accent-mid); border-color: var(--accent-mid); box-shadow: 0 4px 16px rgba(37,99,235,0.38); }
    .btn-sm { padding: 4px 10px; font-size: 11.5px; }
    /* Destructive — red tint */
    .btn-d { background: var(--red-soft); color: var(--red); border-color: rgba(220,38,38,0.22); }
    .btn-d:hover { background: #fde8e8; border-color: rgba(220,38,38,0.38); }
    /* Success — green tint */
    .btn-s { background: var(--green-soft); color: var(--green); border-color: rgba(5,150,105,0.22); }
    .btn-s:hover { background: #d4f4e8; border-color: rgba(5,150,105,0.38); }

    /* ── BADGE ───────────────────────────────────────────────────────────── */
    /* Inline status pill — colour suffix maps to a semantic status. */
    .bdg {
      display: inline-flex; align-items: center; padding: 2px 8px;
      border-radius: var(--r999); font-size: 11px; font-weight: 700;
      white-space: nowrap; border: 1px solid transparent; letter-spacing: 0.02em;
    }
    .bdg-g    { background: var(--green-soft);  color: var(--green);  border-color: rgba(5,150,105,0.2); }
    .bdg-r    { background: var(--red-soft);    color: var(--red);    border-color: rgba(220,38,38,0.2); }
    .bdg-a    { background: var(--amber-soft);  color: var(--amber);  border-color: rgba(217,119,6,0.2); }
    .bdg-b    { background: var(--accent-soft); color: var(--accent); border-color: rgba(37,99,235,0.2); }
    .bdg-p    { background: var(--purple-soft); color: var(--purple); border-color: rgba(124,58,237,0.2); }
    .bdg-t    { background: var(--teal-soft);   color: var(--teal);   border-color: rgba(13,148,136,0.2); }
    .bdg-gray { background: var(--raised); color: var(--ink3); border-color: var(--brd); }
    .bdg-rose { background: var(--rose-soft);   color: var(--rose);   border-color: rgba(225,29,72,0.2); }
    .bdg-ink  { background: var(--ink); color: #fff; }

    /* ── TABLE ───────────────────────────────────────────────────────────── */
    table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
    thead th {
      text-align: left; padding: 10px 16px;
      font-size: 10px; font-weight: 800; letter-spacing: 0.9px; text-transform: uppercase;
      color: var(--ink4); background: var(--paper); border-bottom: 1px solid var(--brd);
      white-space: nowrap;
    }
    tbody tr { border-bottom: 1px solid var(--brd); transition: background 0.08s; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:hover { background: #F6F9FF; }
    tbody td { padding: 11px 16px; color: var(--ink2); vertical-align: middle; }

    /* ── TABS ────────────────────────────────────────────────────────────── */
    /* Horizontal tab strip — active tab gets an underline + soft fill. */
    .tabs { display: flex; border-bottom: 1.5px solid var(--brd); margin-bottom: 18px; gap: 2px; }
    .tab {
      padding: 9px 15px; font-size: 12.5px; font-weight: 600; color: var(--ink4);
      cursor: pointer; border-bottom: 2.5px solid transparent; margin-bottom: -1.5px;
      transition: all 0.12s; border-radius: var(--r6) var(--r6) 0 0;
    }
    .tab:hover { color: var(--ink2); background: var(--raised); }
    .tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--accent-soft); }

    /* ── FORM ────────────────────────────────────────────────────────────── */
    .fg { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 14px; }
    .ff { grid-column: 1/-1; }
    .fgrp { display: flex; flex-direction: column; gap: 5px; }
    .flbl { font-size: 10.5px; font-weight: 800; color: var(--ink3); text-transform: uppercase; letter-spacing: 0.7px; }
    .finp, .fsel, .ftxt {
      background: var(--surface); border: 1.5px solid var(--brd);
      color: var(--ink); font-family: var(--font); font-size: 13px;
      padding: 8px 12px; border-radius: var(--r8); outline: none;
      transition: border-color 0.15s, box-shadow 0.15s; width: 100%;
      box-shadow: var(--shadow-xs);
    }
    .finp:focus, .fsel:focus, .ftxt:focus {
      border-color: var(--accent); box-shadow: 0 0 0 3.5px rgba(37,99,235,0.1);
    }
    .ftxt { resize: vertical; min-height: 70px; line-height: 1.6; }

    /* ── MODAL ───────────────────────────────────────────────────────────── */
    /* Backdrop blurs and dims the page; the modal card slides up on open.
       .mo-backdrop is a sibling div (not an ancestor) of .modal so that:
         - Chrome: backdrop-filter is not on any ancestor of the date inputs,
           preventing Chrome from creating a containing block that traps the
           native date-picker calendar popup.
         - Safari: backdrop-filter on a sibling never blurs the modal card
           itself (Safari blurs all children of the filtered element, so
           putting it on .mo directly or on ::before inside .mo breaks Safari). */
    .mo {
      position: fixed; inset: 0;
      z-index: 300;
      display: flex; align-items: center; justify-content: center;
      animation: mofade 0.15s ease;
    }
    .mo-backdrop {
      position: absolute; inset: 0;
      background: rgba(8,12,25,0.48);
      backdrop-filter: blur(7px) saturate(1.5);
      -webkit-backdrop-filter: blur(7px) saturate(1.5);
      pointer-events: none;
    }
    @keyframes mofade { from { opacity: 0 } to { opacity: 1 } }
    .modal {
      position: relative; z-index: 1;
      background: var(--surface); border-radius: var(--r16);
      border: 1px solid var(--brd); box-shadow: var(--shadow-xl);
      width: 520px; max-width: 96vw;
      max-height: 88vh; max-height: 88dvh;
      display: flex; flex-direction: column;
      animation: moup 0.22s var(--ease);
    }
    .modal-w { width: 720px; }
    @keyframes moup { from { transform: translateY(22px) scale(0.95); opacity: 0 } to { transform: none; opacity: 1 } }
    .mh { padding: 18px 22px; border-bottom: 1px solid var(--brd); display: flex; align-items: center; justify-content: space-between; }
    .mt { font-family: var(--display); font-size: 15px; font-weight: 700; color: var(--ink); letter-spacing: -0.3px; }
    .mc {
      width: 28px; height: 28px; border-radius: var(--r8);
      background: var(--raised); border: 1.5px solid var(--brd);
      color: var(--ink4); cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center; transition: all 0.12s;
    }
    .mc:hover { background: var(--red-soft); color: var(--red); border-color: rgba(220,38,38,0.25); }
    .mb { padding: 20px 22px; overflow-y: auto; overscroll-behavior: none; flex: 1; }
    .mf {
      padding: 14px 22px; border-top: 1px solid var(--brd);
      display: flex; gap: 8px; justify-content: flex-end;
      background: var(--paper); border-radius: 0 0 var(--r16) var(--r16);
    }

    /* ── MISC UTILITIES ──────────────────────────────────────────────────── */
    .g2   { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 16px; }
    .sep  { border: none; border-top: 1px solid var(--brd); margin: 14px 0; }
    .fw6  { font-weight: 600; }
    .fw7  { font-weight: 700; }
    .t3   { color: var(--ink3); }
    .tsm  { font-size: 12px; }
    .mono { font-family: var(--mono); }
    .tw   { overflow-x: auto; overscroll-behavior: none; min-width: 0; }

    /* Leave balance bar */
    .lbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 14px; background: var(--paper);
      border-radius: var(--r10); margin-bottom: 9px; border: 1px solid var(--brd);
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    .lbar:hover { border-color: var(--brd2); box-shadow: var(--shadow-sm); }
    .lbar-t { height: 6px; background: var(--brd); border-radius: var(--r999); overflow: hidden; }
    .lbar-f { height: 100%; border-radius: var(--r999); transition: width 0.5s var(--ease); }

    /* Generic progress bar (timesheet / perf goals) */
    .pt { width: 100%; height: 6px; background: var(--brd); border-radius: var(--r999); overflow: hidden; margin: 6px 0; }
    .pf { height: 100%; border-radius: var(--r999); transition: width 0.7s var(--ease); }

    /* Employee list rows (Directory left panel) */
    .emp-row { display: flex; align-items: center; gap: 10px; padding: 11px 18px; border-bottom: 1px solid var(--brd); cursor: pointer; transition: background 0.08s; }
    .emp-row:hover { background: #F6F9FF; }
    .emp-row.sel  { background: var(--accent-soft); }
    .emp-row:last-child { border-bottom: none; }

    /* Info key-value grid (employee detail panel) */
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 10px 24px; }
    .if   { font-size: 12.5px; }
    .if-l { font-size: 10px; color: var(--ink4); margin-bottom: 2px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; }

    /* Filter pill toggles */
    .pill {
      padding: 4px 12px; border-radius: var(--r999); font-size: 11.5px; font-weight: 600;
      cursor: pointer; border: 1.5px solid var(--brd); color: var(--ink4); background: var(--surface);
      transition: all 0.12s;
    }
    .pill:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
    .pill.active { background: var(--accent-soft); border-color: rgba(37,99,235,0.3); color: var(--accent); }

    /* Performance goal list rows */
    .goal-row { padding: 13px 16px; border-bottom: 1px solid var(--brd); }
    .goal-row:last-child { border-bottom: none; }

    /* Performance review cards */
    .review-card {
      padding: 16px; border: 1.5px solid var(--brd); border-radius: var(--r10);
      margin-bottom: 9px; transition: border-color 0.15s, box-shadow 0.15s;
      box-shadow: var(--shadow-xs);
    }
    .review-card:hover { border-color: var(--brd2); box-shadow: var(--shadow-sm); }

    /* Circular score display on perf cards */
    .score-circle {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 800; flex-shrink: 0;
      box-shadow: var(--shadow-sm);
    }

    /* Announcement accordion cards */
    .ann {
      padding: 14px 16px; border-radius: var(--r10);
      border: 1.5px solid var(--brd); background: var(--surface);
      margin-bottom: 9px; cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s;
      box-shadow: var(--shadow-xs);
    }
    .ann:hover { border-color: var(--accent); box-shadow: 0 4px 18px rgba(37,99,235,0.1); }

    /* Empty state placeholder */
    .empty { padding: 52px 20px; text-align: center; color: var(--ink4); font-size: 13px; }

    /* ── LOGIN (error / loading states via AppBootstrap) ─────────────────── */
    .login-wrap {
      min-height: 100vh; min-height: 100dvh; width: 100%;
      display: flex; align-items: center; justify-content: center;
      background: var(--paper);
    }
    .login-box {
      background: var(--surface); border: 1px solid var(--brd);
      border-radius: var(--r16); padding: 36px;
      width: min(440px, 92vw); /* fluid — no breakpoint needed to avoid overflow on narrow screens */
      box-shadow: var(--shadow-xl);
    }
    .login-logo  { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .quick-login {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
      margin-bottom: 16px; max-height: 280px; overflow-y: auto; overscroll-behavior: none;
    }
    .ql-btn {
      padding: 9px 10px; border-radius: var(--r8);
      border: 1.5px solid var(--brd); background: var(--paper);
      cursor: pointer; font-family: var(--font); font-size: 11.5px; font-weight: 500;
      color: var(--ink2); transition: all 0.12s; text-align: left;
    }
    .ql-btn:hover { background: var(--accent-soft); border-color: rgba(37,99,235,0.25); color: var(--accent); }
    .ql-name { font-weight: 700; margin-bottom: 1px; font-size: 12px; }
    .ql-role  { font-size: 10.5px; color: var(--ink3); }

    /* ── ATTENDANCE CALENDAR ─────────────────────────────────────────────── */
    /* Each att-day cell gets a colour class based on the attendance status. */
    .att-day {
      aspect-ratio: 1; border-radius: var(--r8);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700; border: 1px solid transparent;
      transition: transform 0.12s, box-shadow 0.12s;
    }
    .att-day:hover { transform: scale(1.07); box-shadow: var(--shadow-sm); }
    .att-present { background: var(--green-soft);  color: var(--green);  border-color: rgba(5,150,105,0.22); }
    .att-absent  { background: var(--red-soft);    color: var(--red);    border-color: rgba(220,38,38,0.22); }
    .att-late    { background: var(--amber-soft);  color: var(--amber);  border-color: rgba(217,119,6,0.22); }
    .att-leave   { background: var(--accent-soft); color: var(--accent); border-color: rgba(37,99,235,0.22); }
    .att-holiday { background: var(--purple-soft); color: var(--purple); border-color: rgba(124,58,237,0.22); }
    .att-wknd    { background: var(--raised); color: var(--ink4); border-color: var(--brd); }
    .att-today   { outline: 2.5px solid var(--accent); outline-offset: 2px; box-shadow: 0 0 0 5px rgba(37,99,235,0.08); }
    .att-future  { background: transparent; color: var(--ink5); border-color: var(--brd); }
    .att-grid    { display: grid; grid-template-columns: repeat(7,1fr); gap: 5px; }

    /* Pulsing dot for the "Active" status pill in State B */
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.4; transform: scale(0.75); }
    }

    /* Clock-in / out button — toggles between blue (idle) → green (in) → red (out) */
    .reg-btn {
      padding: 12px 20px; border-radius: var(--r10);
      border: 1.5px solid var(--accent); background: var(--accent-soft); color: var(--accent);
      font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.18s;
      text-align: center; width: 100%; font-family: var(--font);
      box-shadow: 0 2px 8px rgba(37,99,235,0.12);
    }
    .reg-btn:hover { background: var(--accent); color: #fff; box-shadow: 0 4px 16px rgba(37,99,235,0.32); }
    .reg-btn.checked-in { border-color: var(--green); background: var(--green-soft); color: var(--green); box-shadow: 0 2px 8px rgba(5,150,105,0.12); }
    .reg-btn.checked-in:hover { background: var(--red-soft); border-color: var(--red); color: var(--red); box-shadow: 0 4px 16px rgba(220,38,38,0.22); }

    /* ── PAYSLIP ─────────────────────────────────────────────────────────── */
    .slip-h { background: var(--ink); color: #fff; padding: 24px 28px; border-radius: var(--r12) var(--r12) 0 0; }
    .slip-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--brd); font-size: 13px; }
    .slip-row:last-child { border-bottom: none; }
    .slip-tot { background: var(--accent-soft); padding: 14px 24px; display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; border-top: 2px solid var(--accent); }

    /* ── ORG CHART ───────────────────────────────────────────────────────── */
    .org-card {
      background: var(--surface); border: 1.5px solid var(--brd);
      border-radius: var(--r12); padding: 12px 14px;
      text-align: center; transition: all 0.18s var(--ease);
      cursor: pointer; min-width: 108px; max-width: 126px;
      position: relative; box-shadow: var(--shadow-xs);
    }
    .org-card:hover { border-color: var(--accent); box-shadow: 0 8px 26px rgba(37,99,235,0.15); transform: translateY(-3px); }
    .org-card.is-root { border-color: var(--accent); background: var(--accent-soft); box-shadow: 0 4px 16px rgba(37,99,235,0.18); }
    .org-card.is-you  { border-color: var(--green);  background: var(--green-soft);  box-shadow: 0 4px 16px rgba(5,150,105,0.14); }
    .org-card.is-lead { border-color: var(--purple); background: var(--purple-soft); box-shadow: 0 4px 16px rgba(124,58,237,0.14); }
    .org-card-name  { font-size: 11px; font-weight: 700; line-height: 1.3; margin-top: 7px; color: var(--ink); letter-spacing: -0.1px; }
    .org-card-role  { font-size: 9px; color: var(--ink3); line-height: 1.3; margin-top: 2px; }
    .org-card-badge { font-size: 8px; font-weight: 800; padding: 2px 6px; border-radius: var(--r4); margin-top: 5px; display: inline-block; }
    .org-connector-v  { width: 1.5px; height: 22px; background: var(--brd2); margin: 0 auto; }
    .org-dept-section { margin-bottom: 32px; }
    .org-dept-header  { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; padding: 0 4px; }
    .org-dept-line    { flex: 1; height: 1px; background: var(--brd); }
    .org-dept-title   {
      font-family: var(--display); font-size: 10px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 1px; color: var(--ink4);
      white-space: nowrap; padding: 0 10px;
    }

    /* ── TIME LOG / PROJECT ROWS ─────────────────────────────────────────── */
    .tl-project-row { border: 1.5px solid var(--brd); border-radius: var(--r10); margin-bottom: 9px; overflow: hidden; box-shadow: var(--shadow-xs); }
    .tl-project-hd {
      display: flex; align-items: center; gap: 10px;
      padding: 11px 16px; background: var(--paper);
      cursor: pointer; font-weight: 700; font-size: 12.5px;
      transition: background 0.12s; letter-spacing: -0.1px;
    }
    .tl-project-hd:hover { background: var(--raised); }
    .tl-task-row {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 16px 9px 38px; border-top: 1px solid var(--brd);
      font-size: 12.5px; transition: background 0.08s;
    }
    .tl-task-row:hover { background: #F6F9FF; }
    /* Weekly progress indicator bar at top of Time Log */
    .week-bar {
      background: var(--surface);
      border: 1.5px solid rgba(37,99,235,0.14);
      border-radius: var(--r12); padding: 16px 20px; margin-bottom: 18px;
      display: flex; align-items: center; gap: 16px;
      box-shadow: var(--shadow-sm);
    }

    /* Form field bottom margin helper */
    .login-field { margin-bottom: 14px; }

    /* ── LOGIN RESPONSIVE ─────────────────────────────────────────────────── */
    @media (max-width: 860px) {
      .login-left { display: none !important; }
      .login-right { padding: 32px 24px !important; }
      .login-mobile-logo { display: flex !important; align-items: center; gap: 10px; margin-bottom: 28px; }
    }

    /* ── RESPONSIVE APP SHELL ─────────────────────────────────────────────── */
    /* Hamburger toggle — hidden on desktop, shown on tablet/mobile */
    .tb-hamburger {
      display: none;
      width: 36px; height: 36px;
      border: none; background: transparent; cursor: pointer;
      flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      padding: 0; flex-shrink: 0; margin-right: 2px;
    }
    .tb-hamburger span {
      display: block; width: 18px; height: 2px;
      background: var(--ink3); border-radius: 2px; transition: all 0.2s;
    }

    /* Sidebar slide-in overlay */
    .sb-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.42); z-index: 98;
    }
    .sb-overlay.visible { display: block; }

    /* ── TABLET  (≤ 768px) ─────────────────────────────────────────────────── */
    @media (max-width: 768px) {
      /* Show hamburger, slim topbar brand */
      .tb-hamburger { display: flex; }
      .tb-brand { width: auto; padding: 0 10px 0 14px; border-right: none; }
      .tb-wordmark { display: none; }
      .tb-search { display: none; }
      .tb-clock { display: none; }

      /* Sidebar becomes a slide-in drawer */
      .sidebar { width: 242px !important; left: -252px; transition: left 0.26s cubic-bezier(0.16,1,0.3,1), box-shadow 0.26s; z-index: 150; }
      .sidebar.open { left: 0; box-shadow: 0 28px 72px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.1); }

      /* Main content takes full width */
      .main { left: 0 !important; }
      .main-inner { padding: 20px 16px; }

      /* .sg / .fg / .info-grid / .g2 need no override here anymore — they're
         auto-fit/minmax fluid grids now, so they collapse to fewer columns on
         their own as the viewport narrows instead of snapping at this breakpoint. */

      /* Page header stacks on mobile */
      .ph { flex-direction: column; gap: 12px; align-items: flex-start; }

      /* Tabs scroll instead of wrapping */
      .tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; }
      .tab { white-space: nowrap; }

      /* Modal fills screen */
      .modal { width: 96vw !important; max-width: 96vw; }

      /* Login box */
      .login-box { padding: 28px 18px; }
    }

    /* ── MOBILE  (≤ 480px) ─────────────────────────────────────────────────── */
    @media (max-width: 480px) {
      .main-inner { padding: 14px 10px; }
      .ph-title { font-size: 19px; }
      .sc-val { font-size: 24px; }
      .sc { padding: 14px 14px 12px; }
      .sg { gap: 8px; margin-bottom: 16px; }
      .card { border-radius: var(--r10); margin-bottom: 12px; }
      .ch { padding: 12px 14px; flex-wrap: wrap; gap: 8px; }
      .cb { padding: 12px 14px; }
      .btn { font-size: 12px; padding: 5px 10px; }
      .btn-sm { padding: 3px 8px; font-size: 11px; }
      .tb-uname { font-size: 11.5px; }
      .tb-urole { display: none; }
      .sign-out-label { display: none; }
      .week-bar { flex-wrap: wrap; gap: 10px; }
    }

    /* ── EXTRA RESPONSIVE GRID UTILITIES ─────────────────────────────────── */
    /* These complement .g2 (already defined above) for 3/5-col patterns     */
    /* and .dir-pane for the documents two-pane directory layout.            */
    .g3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 8px; }
    .g5 { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px,1fr)); gap: 8px; }
    .dir-pane { display: grid; grid-template-columns: 220px 1fr; gap: 14px; align-items: start; }

    @media (max-width: 768px) {
      .dir-pane { grid-template-columns: 1fr; }
      /* Notif panel: prevent overflow beyond viewport on narrow screens */
      .notif-panel { max-width: calc(100vw - 20px) !important; }
      /* Week bar wraps instead of overflowing */
      .week-bar { flex-wrap: wrap; }
    }

    /* ── TOUCH TARGETS ─────────────────────────────────────────────────────
       pointer:coarse matches touch input specifically (finger, not mouse/
       trackpad) regardless of screen size — an iPad in landscape at 1024px
       still needs ≥44px tap targets even though it wouldn't hit any
       max-width breakpoint above. Mouse/trackpad users keep the current
       compact sizing; this only changes anything on touch devices. */
    @media (pointer: coarse) {
      .tb-btn, .mc { width: 44px; height: 44px; }
      .tb-hamburger { width: 44px; height: 44px; }
      .sb-item { padding: 11px 10px 11px 12px; }
      .tab { padding: 12px 15px; }
      .pill { padding: 8px 14px; }
      .btn { padding: 10px 16px; }
      .btn-sm { padding: 8px 13px; }
    }
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

const Modal = ({ title, onClose, children, footer, wide }) => createPortal(
  <div className="mo" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="mo-backdrop" onClick={onClose} />
    <div className={`modal${wide ? " modal-w" : ""}`}>
      <div className="mh"><div className="mt">{title}</div><button className="mc" onClick={onClose}><Icon n="x" s={13}/></button></div>
      <div className="mb">{children}</div>
      {footer && <div className="mf">{footer}</div>}
    </div>
  </div>,
  document.body
);

// ─── URL DEEP-LINKING ────────────────────────────────────────────────────────
// Lightweight, dependency-free query-param sync (no react-router) — this is a
// single-path SPA with exactly two flat params (page, tab), so a full router
// would be retrofitting machinery this app doesn't need. Query params (not path
// segments) so no server-side rewrite rule is required on whatever static host
// serves the built app.
const getUrlParams = () => new URLSearchParams(window.location.search);
const setUrlParams = (updates) => {
  const params = getUrlParams();
  Object.entries(updates).forEach(([k, v]) => {
    if (v == null) params.delete(k); else params.set(k, v);
  });
  const query = params.toString();
  window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
};

// Mirrors a module's local "active tab" into ?tab= so the current view is
// shareable/bookmarkable and survives a refresh.
// deepLink: { tab, key } | null — passed down from HRApp when a notification
// click (or the page's initial URL) should force a specific sub-tab. `key`
// changes on every new instruction, so comparing it against the last-applied
// key (held in state, not a ref) catches even a repeat of the same tab string
// — e.g. clicking two different "Attendance Correction" notifications in a row.
// Adjusted directly during render (not via an effect) per React's guidance for
// "state that needs to change in response to a prop" — avoids the extra
// effect-triggered render pass.
const useUrlTab = (defaultTab, deepLink) => {
  const [tab, setTabState] = useState(() => getUrlParams().get("tab") || defaultTab);
  const [appliedKey, setAppliedKey] = useState(deepLink?.key);
  if (deepLink && deepLink.key !== appliedKey) {
    setAppliedKey(deepLink.key);
    setTabState(deepLink.tab);
  }
  const setTab = (t) => { setTabState(t); setUrlParams({ tab: t }); };
  return [tab, setTab];
};

// ─── EMPLOYEE DATA & ACCESS CONTROL ──────────────────────────────────────────
// API_URL is set via the VITE_API_URL env var at build time; falls back to
// localhost:4000 for local development.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// JWT token helpers — stored in localStorage so they survive page reloads.
const _TOKEN_KEY = "hrms_jwt";
const getToken   = () => localStorage.getItem(_TOKEN_KEY) || "";
const saveToken  = (t) => localStorage.setItem(_TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(_TOKEN_KEY);

// Drop-in replacement for apiFetch() that injects Authorization: Bearer <token>.
// FormData bodies skip Content-Type so the browser can set the multipart boundary.
const apiFetch = (url, opts = {}) => {
  const token = getToken();
  const isForm = opts.body instanceof FormData;
  return fetch(url, {
    ...opts,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
};

// These three globals are populated once by AppBootstrap on first render.
// Using module-level lets (not React state) avoids prop-drilling them through
// every component — they're effectively read-only after the bootstrap phase.
// These globals survive Vite HMR module re-evaluation by being cached on window.
// Without this, any saved code change resets them to empty which makes all
// components appear broken until a hard reload. On a production build there is
// no HMR so the window cache is set once and never read again.
let ALL_USERS           = window.__HR_ALL_USERS__           || [];
let APP_STRUCTURE       = window.__HR_APP_STRUCTURE__       || null;
let APP_CUSTOM_FIELDS   = window.__HR_APP_CUSTOM_FIELDS__   || [];
let APP_STATUTORY_CFG   = window.__HR_APP_STATUTORY_CFG__   || null;  // DB-driven PF/ESI/PT/TDS rates

// Leave approval is role-based — no hardcoded employee IDs.
// Director (accessLevel >= 4)  → their own leave is auto-approved
// HR member (isHR)             → must be approved by a Director
// All other employees          → approved by any HR Manager (isHR && accessLevel >= 3)

const isDirector    = (emp) => emp?.accessLevel >= 4;
const isHRManager   = (emp) => emp?.accessLevel >= 4 || emp?.isHR;

const getLeaveApproverRole = (empId) => {
  const emp = ALL_USERS.find(e => e.id === empId);
  if (!emp) return "hr-manager";
  if (isDirector(emp)) return "auto-approved";
  if (emp.isHR)        return "director-only";
  return "hr-manager";
};

const canApproveLeaveNew = (approver, requestorId) => {
  if (!approver || !requestorId) return false;
  const rule = getLeaveApproverRole(requestorId);
  if (rule === "auto-approved") return false;
  if (rule === "director-only") return isDirector(approver);
  return isHRManager(approver) || isDirector(approver);
};

const getApproverLabel = (empId) => {
  const role = getLeaveApproverRole(empId);
  if (role === "auto-approved") return "Auto-approved";
  if (role === "director-only") return "Director must approve";
  return "HR Manager";
};

// Recursively walks the org tree downward from `id` using `emp.reports[]` links.
// Returns a Set of IDs for the employee + all their direct/indirect reports.
const collectDescendants = (id, acc = new Set()) => {
  acc.add(id);
  const emp = ALL_USERS.find(e => e.id === id);
  if (emp?.reports) emp.reports.forEach(r => collectDescendants(r, acc));
  return acc;
};

// Access-level gating:
//   L1 (Employee) → sees only themselves
//   L2 (Lead)     → sees themselves + all direct/indirect reports
//   L3+ (Manager / Director) → sees the entire organisation
const getVisibleEmpIds = (user) => {
  if (!user) return [];
  if (user.accessLevel >= 3) return ALL_USERS.map(u => u.id);
  if (user.accessLevel === 2) return [...collectDescendants(user.id)];
  return [user.id];
};
// Convenience wrapper — returns full employee objects instead of just IDs.
const getVisibleEmps = (user) => { const ids = getVisibleEmpIds(user); return ALL_USERS.filter(e => ids.includes(e.id)); };

// Attendance team views are scoped to the employee's own reporting tree.
const hasTeamReports = (user) => Boolean(user?.reports?.length);
const getTeamEmpIds = (user) => user ? [...collectDescendants(user.id)] : [];
const getTeamEmps = (user) => { const ids = getTeamEmpIds(user); return ALL_USERS.filter(e => ids.includes(e.id)); };
const canViewAttendanceReports = (user) => user?.isHR || user?.accessLevel >= 4;

// Shorthand access predicates used throughout module components.
const canManage         = (user) => user?.accessLevel >= 2;  // Lead+
const canViewAll        = (user) => user?.accessLevel >= 3;  // Manager+
const canViewAnalytics  = (user) => user?.accessLevel >= 2;  // Lead+
// A viewer can see sensitive fields (salary, PAN, etc.) for themselves OR if they are Manager+.
const canSeeSensitiveOf = (viewer, targetId) => viewer?.accessLevel >= 3 || viewer?.id === targetId;

// Leave balances are loaded from the API — no hardcoded defaults.

// ─── DATE / TIME UTILITIES ────────────────────────────────────────────────────
const pad2 = (value) => String(value).padStart(2, "0");
// Returns a YYYY-MM-DD ISO string for any Date object.
const isoDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
// Adds `days` to a YYYY-MM-DD string and returns a new YYYY-MM-DD string.
const addDaysIso = (date, days) => isoDate(addDays(date, days));

// Frozen at module load — used to seed mock attendance and set "current" context.
const TODAY = new Date();
const TODAY_STR = isoDate(TODAY);
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH_INDEX = TODAY.getMonth();                                // 0-based
const CURRENT_MONTH_KEY = `${CURRENT_YEAR}-${pad2(CURRENT_MONTH_INDEX + 1)}`; // "YYYY-MM" selector key

// Returns a quarter label like "Q3 2025". `offset` shifts forward/backward
// by that many quarters relative to today (e.g. offset=-1 → previous quarter).
const currentQuarterLabel = (offset = 0) => {
  const absoluteQuarter = CURRENT_YEAR * 4 + Math.floor(CURRENT_MONTH_INDEX / 3) + offset;
  return `Q${(absoluteQuarter % 4) + 1} ${Math.floor(absoluteQuarter / 4)}`;
};

// Indian fiscal year runs April–March, so FY starts in April (month index 3).

// Leave requests are loaded from the API — no hardcoded data.


// Attendance data comes from the API — no generated/hardcoded records.

const DEPT_PROJS = {
  "Technology": [
    { name:"Customer Portal v3",    subtasks:["Frontend Components","Checkout Flow","API Integration","Testing","Bug Fixes"] },
    { name:"Mobile App Redesign",   subtasks:["Wireframing","UI Screens","Prototyping","Developer Handoff"] },
    { name:"API Gateway Migration", subtasks:["Rate Limiting","Auth Middleware","Route Configuration","Load Testing"] },
    { name:"Analytics Dashboard",   subtasks:["D3 Charts","Data Pipeline","KPI Design","Filters & Drilldown"] },
    { name:"Auth Service Refactor", subtasks:["OAuth2 Setup","Session Management","Token Refresh","Security Audit"] },
  ],
  "Data": [
    { name:"Data Pipeline Development", subtasks:["ETL Design","Data Extraction","Transformation Logic","Load & Validation"] },
    { name:"Analytics & Reporting",     subtasks:["Dashboard Design","KPI Metrics","Report Generation","Data Visualization"] },
    { name:"Database Management",       subtasks:["Schema Design","Query Optimization","Indexing","Backup & Recovery"] },
    { name:"Machine Learning Models",   subtasks:["Model Training","Feature Engineering","Model Evaluation","Deployment"] },
    { name:"Data Quality & Governance", subtasks:["Data Auditing","Documentation","Compliance Checks","Master Data"] },
  ],
  "Sales & Marketing": [
    { name:"Lead Generation",          subtasks:["Prospecting","Email Outreach","LinkedIn Campaign","Follow-ups"] },
    { name:"Client Onboarding",        subtasks:["Requirements Gathering","Demo Presentation","Proposal Writing","Contract Finalisation"] },
    { name:"Marketing Content",        subtasks:["Blog Writing","Social Media Posts","Brochure Design","SEO"] },
    { name:"Sales Pipeline Mgmt",      subtasks:["CRM Updates","Deal Review","Forecasting","Client Calls"] },
    { name:"Product Launch",           subtasks:["Go-to-Market Strategy","Campaign Planning","Launch Execution","Post-Launch Analysis"] },
  ],
  "HR": [
    { name:"Recruitment",            subtasks:["Job Posting","Resume Screening","Interviews","Offer Letters"] },
    { name:"Employee Onboarding",    subtasks:["Documentation","Induction Sessions","System Access Setup","Buddy Program"] },
    { name:"Payroll & Compliance",   subtasks:["Payroll Processing","Statutory Filings","PF/ESI","Tax"] },
    { name:"Performance Management", subtasks:["Appraisal Coordination","Reviews","Training Needs","Documentation"] },
    { name:"Policy & Admin",         subtasks:["Policy Updates","Employee Queries","Records Management","Compliance"] },
  ],
  "Leadership": [
    { name:"Strategic Planning",    subtasks:["OKR Setting","Roadmap Planning","Budget Review","Board Presentation"] },
    { name:"Team Management",       subtasks:["1-on-1 Meetings","Performance Reviews","Hiring Decisions","Team Building"] },
    { name:"Business Development",  subtasks:["Client Meetings","Partnership Discussions","RFP Review","Negotiations"] },
    { name:"Operations",            subtasks:["Process Improvement","Resource Allocation","Vendor Management","Cost Optimisation"] },
    { name:"Reporting & Analytics", subtasks:["Weekly Reports","KPI Review","Department Updates","Stakeholder Comms"] },
  ],
};
// Returns the Monday (ISO week start) of the week containing `date` as a YYYY-MM-DD string.
// Sunday (day 0) is treated as belonging to the previous week.
const getWeekKey = (date) => { const d = new Date(date); const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1); const mon = new Date(d.setDate(diff)); return isoDate(mon); };
const THIS_WEEK = getWeekKey(TODAY);
const LAST_WEEK = addDaysIso(THIS_WEEK, -7); // exactly 7 days before this week's Monday

// Timesheets are loaded from the API — no hardcoded demo data.

// Performance, documents, hiring and attrition data comes from the API or starts empty.

const AccessDenied = () => (
  <div style={{ padding:"60px 20px", textAlign:"center" }}>
    <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
    <div style={{ fontFamily:"var(--display)", fontSize:18, fontWeight:700, marginBottom:8 }}>Access Restricted</div>
    <div style={{ fontSize:13, color:"var(--ink3)", maxWidth:300, margin:"0 auto" }}>You don't have permission to view this section.</div>
  </div>
);

// ─── TOPBAR CLOCK ─────────────────────────────────────────────────────────────
// Isolated so its 1-second tick never re-renders the parent HRApp.
const TopbarClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return <div className="tb-clock">{t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>;
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot-password state — step: null | "request" | "otp" | "done"
  const [fpStep, setFpStep] = useState(null);
  const [fpEmail, setFpEmail] = useState("");
  const [fpMasked, setFpMasked] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpErr, setFpErr] = useState("");
  const [fpLoading, setFpLoading] = useState(false);

  const resetFp = () => {
    setFpStep(null); setFpEmail(""); setFpMasked(""); setFpOtp("");
    setFpNewPass(""); setFpConfirm(""); setFpErr("");
  };

  const sendOtp = async () => {
    if (!fpEmail.trim()) { setFpErr("Enter your company email."); return; }
    setFpLoading(true); setFpErr("");
    try {
      const res = await apiFetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountEmail: fpEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setFpErr(data.detail || "Failed to send OTP."); return; }
      setFpMasked(data.maskedEmail);
      setFpStep("otp");
    } catch { setFpErr("Cannot reach server. Please try again."); }
    finally { setFpLoading(false); }
  };

  const verifyAndReset = async () => {
    if (!fpOtp.trim()) { setFpErr("Enter the OTP."); return; }
    if (!fpNewPass) { setFpErr("Enter a new password."); return; }
    if (fpNewPass.length < 8 || !/\d/.test(fpNewPass) || !/[^a-zA-Z0-9]/.test(fpNewPass)) {
      setFpErr("Password must be at least 8 characters, include a number and a special character."); return;
    }
    if (fpNewPass !== fpConfirm) { setFpErr("Passwords do not match."); return; }
    setFpLoading(true); setFpErr("");
    try {
      const res = await apiFetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountEmail: fpEmail.trim(), otp: fpOtp.trim(), newPassword: fpNewPass }),
      });
      const data = await res.json();
      if (!res.ok) { setFpErr(data.detail || "OTP verification failed."); return; }
      setFpStep("done");
    } catch { setFpErr("Cannot reach server. Please try again."); }
    finally { setFpLoading(false); }
  };

  const fpBtn = (busy) => ({ width:"100%", padding:"12px", borderRadius:10, border:"none", background: busy ? "#93c5fd" : "#2563eb", color:"#fff", fontSize:14, fontWeight:700, cursor: busy ? "not-allowed" : "pointer", marginBottom:8, fontFamily:"inherit" });
  const inp = { width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:13.5, color:"#0f172a", outline:"none", boxSizing:"border-box", marginBottom:12, fontFamily:"inherit" };

  const tryLogin = async () => {
    if (!email || !pass) { setErr("Enter email and password."); return; }
    setLoading(true); setErr("");
    try {
      const res = await apiFetch(`${API_URL}/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password: pass }) });
      if (res.ok) { const { user, token } = await res.json(); saveToken(token); onLogin(user); } else { setErr("Invalid email or password."); }
    } catch { setErr("Cannot reach server. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, display:"flex", flexDirection:"row", fontFamily:"Inter, 'Plus Jakarta Sans', sans-serif", overflow:"hidden" }}>

      {/* ── LEFT PANEL ── */}
      <div className="login-left" style={{ width:"60%", flexShrink:0, display:"flex", flexDirection:"column", justifyContent:"space-between", background:"linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #1e3a8a 100%)", padding:"48px 52px", boxSizing:"border-box" }}>
        {/* Logo mark */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.15)", flexShrink:0 }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>doloxe</span>
        </div>

        {/* Centre headline */}
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:999, padding:"5px 14px", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", display:"inline-block", flexShrink:0 }}/>
            <span style={{ color:"rgba(255,255,255,0.65)", fontSize:11.5, fontWeight:500 }}>People Operations Platform</span>
          </div>
          <h1 style={{ color:"#fff", fontSize:48, fontWeight:800, lineHeight:1.12, letterSpacing:"-1.5px", margin:0, marginBottom:20 }}>
            Doloxe India<br/>
            <span style={{ background:"linear-gradient(90deg, #818cf8, #60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Pvt Ltd.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:15, lineHeight:1.65, maxWidth:440, margin:0 }}>
            A unified workspace for HR operations — payroll, attendance, leaves, appraisals, and org management in one place.
          </p>
        </div>

        {/* Bottom stat strip */}
        <div style={{ display:"flex", gap:40 }}>
          {[["Employees","50+"],["Modules","10"],["Uptime","99.9%"]].map(([label, val]) => (
            <div key={label}>
              <div style={{ color:"#fff", fontSize:22, fontWeight:700, letterSpacing:"-0.5px" }}>{val}</div>
              <div style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right" style={{ flex:1, display:"flex", flexDirection:"column", overflowY:"auto", background:"#f8fafc", padding:"48px 44px", boxSizing:"border-box" }}>
        {/* Inner wrapper — margin:auto centers content without cutting off the top on overflow */}
        <div style={{ margin:"auto 0", width:"100%" }}>
        {/* Mobile logo — only visible when left panel is hidden */}
        <div style={{ display:"none" }} className="login-mobile-logo">
          <div style={{ width:32, height:32, background:"#0f172a", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span style={{ fontWeight:700, fontSize:14, color:"#0f172a" }}>Doloxe India Pvt Ltd.</span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom:32 }}>
          <h2 style={{ fontSize:28, fontWeight:800, color:"#0f172a", letterSpacing:"-0.6px", margin:0, marginBottom:6 }}>Sign In</h2>
          <p style={{ fontSize:13.5, color:"#94a3b8", margin:0 }}>Use your company email and password</p>
        </div>

        {/* Form */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:6, letterSpacing:"0.02em" }}>Email</label>
          <input
            type="email"
            placeholder="you@doloxe.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryLogin()}
            style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:14, color:"#0f172a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s, box-shadow 0.15s" }}
            onFocus={e => { e.target.style.borderColor="#3b82f6"; e.target.style.boxShadow="0 0 0 4px rgba(59,130,246,0.1)"; }}
            onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
          />
        </div>
        <div style={{ marginBottom:err ? 12 : 20 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:6, letterSpacing:"0.02em" }}>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && tryLogin()}
            style={{ width:"100%", padding:"12px 16px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#fff", fontSize:14, color:"#0f172a", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s, box-shadow 0.15s" }}
            onFocus={e => { e.target.style.borderColor="#3b82f6"; e.target.style.boxShadow="0 0 0 4px rgba(59,130,246,0.1)"; }}
            onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; }}
          />
        </div>

        {err && (
          <div style={{ fontSize:12.5, color:"#dc2626", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"8px 12px", marginBottom:16 }}>
            {err}
          </div>
        )}

        <button
          onClick={tryLogin}
          disabled={loading}
          style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background: loading ? "#93c5fd" : "#2563eb", color:"#fff", fontSize:14.5, fontWeight:700, cursor: loading ? "not-allowed" : "pointer", letterSpacing:"0.01em", transition:"background 0.18s, transform 0.1s", marginBottom:12 }}
          onMouseEnter={e => { if (!loading) e.target.style.background="#1d4ed8"; }}
          onMouseLeave={e => { if (!loading) e.target.style.background="#2563eb"; }}
        >
          {loading ? "Signing in…" : "Sign in →"}
        </button>

        {/* Forgot password link */}
        <div style={{ textAlign:"center", marginTop:14 }}>
          <button onClick={() => { setFpStep("request"); setFpErr(""); }}
            style={{ background:"none", border:"none", color:"#2563eb", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
            Forgot your password?
          </button>
        </div>

        </div>{/* end inner centering wrapper */}
      </div>

      {/* ── Forgot Password overlay ── */}
      {fpStep !== null && (
        <div style={{ position:"fixed", inset:0, background:"rgba(8,12,25,0.52)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:"#fff", borderRadius:16, width:420, maxWidth:"94vw", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", overflow:"hidden" }}>

            <div style={{ background:"#0d0d0e", padding:"18px 22px", borderLeft:"5px solid #1B45F5", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>
                  {fpStep === "done" ? "Password Reset" : fpStep === "otp" ? "Enter OTP" : "Forgot Password"}
                </div>
                <div style={{ color:"#b8bcc7", fontSize:11.5, marginTop:2 }}>DOLOXE HRMS · Secure Reset</div>
              </div>
              <button onClick={resetFp} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:28, height:28, borderRadius:8, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ padding:"28px 24px" }}>

              {/* Step 1 — Enter company email */}
              {fpStep === "request" && (
                <>
                  <p style={{ fontSize:13.5, color:"#475569", marginBottom:20, lineHeight:1.6 }}>
                    Enter your <strong>company email</strong>. A 6-digit OTP will be sent to that address.
                  </p>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Company Email</label>
                  <input style={inp} type="email" placeholder="you@doloxe.com"
                    value={fpEmail} onChange={e => { setFpEmail(e.target.value); setFpErr(""); }}
                    onKeyDown={e => e.key === "Enter" && sendOtp()}/>
                  {fpErr && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12.5, color:"#dc2626", marginBottom:12 }}>{fpErr}</div>}
                  <button style={fpBtn(fpLoading)} onClick={sendOtp} disabled={fpLoading}>
                    {fpLoading ? "Sending OTP…" : "Send OTP →"}
                  </button>
                  <button onClick={resetFp} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    Back to Sign In
                  </button>
                </>
              )}

              {/* Step 2 — OTP + new password */}
              {fpStep === "otp" && (
                <>
                  <p style={{ fontSize:13, color:"#475569", marginBottom:18, lineHeight:1.6 }}>
                    OTP sent to <strong>{fpMasked}</strong>. Enter it below along with your new password.
                  </p>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>6-digit OTP</label>
                  <input style={{ ...inp, fontFamily:"monospace", fontSize:20, letterSpacing:8, textAlign:"center" }}
                    placeholder="000000" maxLength={6}
                    value={fpOtp} onChange={e => setFpOtp(e.target.value.replace(/\D/g,"").slice(0,6))}/>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>New Password</label>
                  <input style={inp} type="password" placeholder="Min 8 chars, 1 number, 1 special char"
                    value={fpNewPass} onChange={e => { setFpNewPass(e.target.value); setFpErr(""); }}/>
                  <label style={{ fontSize:11.5, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Confirm New Password</label>
                  <input style={inp} type="password" placeholder="Re-enter new password"
                    value={fpConfirm} onChange={e => { setFpConfirm(e.target.value); setFpErr(""); }}
                    onKeyDown={e => e.key === "Enter" && verifyAndReset()}/>
                  {fpErr && <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"8px 12px", fontSize:12.5, color:"#dc2626", marginBottom:12 }}>{fpErr}</div>}
                  <button style={fpBtn(fpLoading)} onClick={verifyAndReset} disabled={fpLoading}>
                    {fpLoading ? "Resetting…" : "Reset Password →"}
                  </button>
                  <button onClick={() => { setFpStep("request"); setFpErr(""); setFpOtp(""); }}
                    style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"transparent", color:"#64748b", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
                    ← Re-enter email
                  </button>
                </>
              )}

              {/* Step 3 — Success */}
              {fpStep === "done" && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:56, height:56, borderRadius:"50%", background:"#f0fdf4", border:"2px solid #86efac", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", fontSize:24 }}>✓</div>
                  <div style={{ fontSize:16, fontWeight:800, color:"#0f172a", marginBottom:8 }}>Password Reset Successfully</div>
                  <p style={{ fontSize:13.5, color:"#64748b", marginBottom:24, lineHeight:1.6 }}>
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                  <button style={{ ...fpBtn(false), marginBottom:0 }} onClick={resetFp}>Back to Sign In</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ─── ATTENDANCE MODULE ─────────────────────────────────────────────────────────
// Manages daily clock-in/out, the monthly calendar view, team overview, missed
// punch correction requests, and HR approval of those corrections.
const AttendanceMod = ({ currentUser, deepLink }) => {
  // Attendance map keyed by empId → { [YYYY-MM-DD]: "present"|"late"|"absent"|"leave"|"holiday"|"weekend" }
  const [attendance, setAttendance] = useState({});
  // Clock detail records keyed by empId → { [YYYY-MM-DD]: { clock_in, clock_out, hours_worked } }
  const [clockRecords, setClockRecords] = useState({});
  // Active tab: "my" | "calendar" | "corrections" | "team" | "reports" — mirrored to
  // ?tab= in the URL; deepLink lets a notification click jump straight to a sub-tab.
  const [tab, setTab] = useUrlTab("my", deepLink);
  // Month currently displayed in the stats and calendar views ("YYYY-MM").
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH_KEY);
  // Clock-in state — tracks whether the user is currently clocked in today.
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [timeLogs, setTimeLogs] = useState([]);
  const checkInDateRef = useRef(null);
  const clockBusyRef = useRef(false);
  // Employee selected in the calendar "team view" picker (defaults to self).
  const [selEmpId, setSelEmpId] = useState(currentUser.id);
  // Status filter for the Team Today tab.
  const [teamFilter, setTeamFilter] = useState("all");
  // Missed punch correction requests — loaded from API.
  const [corrections, setCorrections] = useState([]);
  const [corrLoading, setCorrLoading] = useState(true);
  // Status filter for the Corrections tab.
  const [corrFilter, setCorrFilter] = useState("all");
  // Controls visibility of the "Missed Punch Request" submission modal.
  const [corrModal, setCorrModal] = useState(false);
  // Controlled form state for the missed punch request modal.
  const [corrForm, setCorrForm] = useState({ date:"", reason:"", correctedClockIn:"", correctedClockOut:"" });
  const [corrError, setCorrError] = useState("");
  const [corrSaving, setCorrSaving] = useState(false);
  // Dynamic month list for Reports dropdown — built from actual DB date range
  const [rptMonths, setRptMonths] = useState([CURRENT_MONTH_KEY]);
  // Company holidays for the selected year
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  // Holiday form state
  const [holModal, setHolModal] = useState(false);
  const [holForm, setHolForm] = useState({ date:"", name:"" });
  const [holError, setHolError] = useState("");
  const [holSaving, setHolSaving] = useState(false);
  // Live elapsed display for State B of the Smart Attendance Card — ticks every second
  const [liveElapsed, setLiveElapsed] = useState("");
  // Button processing states — prevent double-click by disabling visually while the API call is in-flight
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  // Exact duration (ms) of the just-completed shift, captured at clock-out for State C's summary
  const [lastShiftMs, setLastShiftMs] = useState(null);
  // Set when the clock-in/out API call fails or the server rejects it — surfaces a failure
  // that was previously silent (the optimistic local update looked fine, but never saved).
  const [clockSaveError, setClockSaveError] = useState("");

  const canViewTeam = hasTeamReports(currentUser) || canViewAttendanceReports(currentUser);
  const canViewReports = canViewAttendanceReports(currentUser);
  const canApproveAttendance = currentUser.isHR || isDirector(currentUser);
  const teamEmps = canViewAttendanceReports(currentUser) ? ALL_USERS : (canViewTeam ? getTeamEmps(currentUser) : [currentUser]);
  const calendarEmps = canViewReports ? ALL_USERS : teamEmps;
  const myAtt = attendance[currentUser.id] || {};
  const selectedAtt = attendance[selEmpId] || {};
  const [yr, mo] = selMonth.split("-").map(Number);
  const dim = new Date(yr, mo, 0).getDate();
  const fd  = new Date(yr, mo-1, 1).getDay();
  const todayStr = TODAY_STR;

  const parseTodayClock = (timeText) => {
    if (!timeText) return null;
    const match = String(timeText).trim().match(/^(\d{1,2}):(\d{2})\s*([ap]m)?$/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const meridiem = match[3]?.toLowerCase();
    if (meridiem === "pm" && hours < 12) hours += 12;
    if (meridiem === "am" && hours === 12) hours = 0;
    const parsed = new Date();
    parsed.setHours(hours, minutes, 0, 0);
    return parsed;
  };
  // Converts a native <input type="time"> 24-hour value ("14:30") into the "HH:MM AM/PM"
  // format the rest of the app stores clock_in/clock_out as.
  const to12HourClock = (hhmm) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  };
  const clockGapMinutes = (startText, endText) => {
    const start = parseTodayClock(startText);
    const end = parseTodayClock(endText);
    return start && end ? (end - start) / 60000 : null;
  };
  const parseSessionLogs = (notes) => {
    if (!notes) return [];
    try {
      const data = typeof notes === "string" ? JSON.parse(notes) : notes;
      return Array.isArray(data.sessions) ? data.sessions : [];
    } catch { return []; }
  };
  const sumSessionHours = (sessions) => sessions.reduce((total, session) => {
    const start = parseTodayClock(session.in);
    const end = parseTodayClock(session.out);
    if (!start || !end) return total;
    const minutes = (end - start) / 60000;
    return total + (minutes < 0 ? minutes + 1440 : minutes) / 60;
  }, 0);
  const fmtHours = (hours) => {
    if (!hours) return "—";
    const mins = Math.round(hours * 60);
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
  };

  // Load attendance for current user (and team if applicable) when month changes
  useEffect(() => {
    const empIds = canViewReports ? ALL_USERS.map(e => e.id) : (canViewTeam ? getTeamEmpIds(currentUser) : [currentUser.id]);
    Promise.all(empIds.map(id =>
      apiFetch(`${API_URL}/api/attendance/${id}?year=${yr}&month=${mo}`)
        .then(r => r.json())
        .then(data => ({ id, records: data.attendance || [] }))
        .catch(() => ({ id, records: [] }))
    )).then(results => {
      const map = {};
      const clocks = {};
      results.forEach(({ id, records }) => {
        const byDate = {};
        const byDateClock = {};
        records.forEach(rec => {
          byDate[rec.date] = rec.status;
          if (rec.clock_in || rec.clock_out || rec.hours_worked) {
            byDateClock[rec.date] = { clock_in: rec.clock_in, clock_out: rec.clock_out, hours_worked: rec.hours_worked };
          }
        });
        map[id] = byDate;
        clocks[id] = byDateClock;
      });
      const myToday = results.find(r => r.id === currentUser.id)?.records.find(rec => rec.date === todayStr);
      // Re-derived from the server on every month switch — the "just completed" transient
      // summary (State C) should never resurrect from a stale local value.
      setLastShiftMs(null);
      if (myToday) {
        const savedIn = myToday.clock_in || myToday.clockIn || null;
        const savedOut = myToday.clock_out || myToday.clockOut || null;
        const parsedLogs = parseSessionLogs(myToday.notes);
        const savedLogs = parsedLogs.length ? parsedLogs : (savedIn ? [{ in:savedIn, out:savedOut || null }] : []);
        const openLog = savedLogs.find(s => s.in && !s.out);
        const accidentalOut = savedLogs.length === 0 && savedIn && savedOut && (clockGapMinutes(savedIn, savedOut) ?? Infinity) < 2;
        setTimeLogs(savedLogs);
        setCheckInTime(openLog?.in || savedIn);
        setCheckOutTime(openLog || accidentalOut ? null : savedOut);
        setCheckedIn(Boolean(openLog || (savedIn && (!savedOut || accidentalOut))));
        checkInDateRef.current = openLog ? parseTodayClock(openLog.in) : (savedIn && (!savedOut || accidentalOut) ? parseTodayClock(savedIn) : null);
      } else if (selMonth === CURRENT_MONTH_KEY) {
        setTimeLogs([]);
        setCheckInTime(null);
        setCheckOutTime(null);
        setCheckedIn(false);
        checkInDateRef.current = null;
      }
      setAttendance(prev => ({ ...prev, ...map }));
      setClockRecords(prev => ({ ...prev, ...clocks }));
    });
  }, [selMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load corrections
  useEffect(() => {
    const url = canApproveAttendance
      ? `${API_URL}/api/attendance/corrections`
      : `${API_URL}/api/attendance/corrections?employee_id=${currentUser.id}`;
    apiFetch(url)
      .then(r => r.json())
      .then(data => setCorrections(data.corrections || []))
      .catch(() => setCorrections([]))
      .finally(() => setCorrLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build Reports dropdown from actual DB date range
  useEffect(() => {
    apiFetch(`${API_URL}/api/attendance/date-range`)
      .then(r => r.json())
      .then(({ earliest, latest }) => {
        if (!earliest) return;
        const end = latest ? latest.slice(0, 7) : CURRENT_MONTH_KEY;
        const [ey, em] = earliest.slice(0, 7).split("-").map(Number);
        const [ly, lm] = end.split("-").map(Number);
        const keys = [];
        let y = ey, m = em;
        while (y < ly || (y === ly && m <= lm)) {
          keys.push(`${y}-${String(m).padStart(2, "0")}`);
          m++; if (m > 12) { m = 1; y++; }
        }
        if (!keys.includes(CURRENT_MONTH_KEY)) keys.push(CURRENT_MONTH_KEY);
        setRptMonths(keys.reverse());
      })
      .catch(() => {});
  }, []);

  // Load company holidays when the selected year changes
  useEffect(() => {
    apiFetch(`${API_URL}/api/holidays?year=${yr}`)
      .then(r => r.json())
      .then(data => setHolidays(data.holidays || []))
      .catch(() => setHolidays([]))
      .finally(() => setHolidaysLoading(false));
  }, [yr]);

  useEffect(() => {
    if (!checkedIn || !checkInDateRef.current) { setLiveElapsed(""); return; }
    const update = () => {
      const secs = Math.max(0, Math.floor((new Date() - checkInDateRef.current) / 1000));
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setLiveElapsed(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [checkedIn]);

  // Formats an exact duration (ms) as "X hours, Y minutes" — falls back to seconds when the
  // whole shift was under a minute, so very short sessions still show a non-zero duration.
  const fmtExactDuration = (ms) => {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return h > 0 || m > 0 ? `${h} hours, ${m} minutes` : `${h} hours, ${m} minutes, ${s} seconds`;
  };

  const countWorkDays = (y, m) => {
    const days = new Date(y, m, 0).getDate();
    let n = 0;
    for (let d = 1; d <= days; d++) {
      const dow = new Date(y, m - 1, d).getDay();
      if (dow !== 0 && dow !== 6) n++;
    }
    return n;
  };

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
  const totalWorkedHours = sumSessionHours(timeLogs);

  const handleCheckIn = async () => {
    if (clockBusyRef.current || checkedIn || clockingIn) return;
    clockBusyRef.current = true;
    setClockingIn(true); // disable button immediately — prevents double-click
    setClockSaveError("");
    const now = new Date();
    const t = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    checkInDateRef.current = now;
    setLastShiftMs(null);
    setCheckedIn(true); setCheckInTime(t); setCheckOutTime(null);
    setTimeLogs(prev => [...prev, { in:t, out:null }]);
    setAttendance(prev => ({ ...prev, [currentUser.id]: { ...(prev[currentUser.id]||{}), [todayStr]: "present" } }));
    try {
      const res = await apiFetch(`${API_URL}/api/attendance/clock-in`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ employeeId: currentUser.id, time: t, status: "present" }),
      });
      const data = await res.json();
      const savedLogs = parseSessionLogs(data.record?.notes);
      if (res.ok && savedLogs.length) setTimeLogs(savedLogs);
      else if (!res.ok) setClockSaveError(`Clock-in shown above didn't save (server said: ${data?.detail || res.status}). It will disappear on reload — try again.`);
    } catch { setClockSaveError("Clock-in shown above didn't save — couldn't reach the server. It will disappear on reload — try again."); }
    finally { clockBusyRef.current = false; setClockingIn(false); }
  };
  const handleCheckOut = async () => {
    // No minimum-duration restriction — clock-out is allowed at any time, even seconds after clock-in.
    if (clockBusyRef.current || !checkedIn || !checkInDateRef.current || clockingOut) return;
    clockBusyRef.current = true;
    setClockingOut(true); // disable button immediately — prevents double-click
    setClockSaveError("");
    const now = new Date();
    const t = now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    const exactMs = now - checkInDateRef.current;
    const hoursWorked = exactMs / 3600000;
    const activeLogs = timeLogs.length ? timeLogs : [{ in:checkInTime, out:null }];
    const nextLogs = activeLogs.map((session, index) => index === activeLogs.length - 1 && session.in && !session.out ? { ...session, out:t } : session);
    const status = "present";
    setTimeLogs(nextLogs);
    setCheckOutTime(t); setCheckedIn(false); setLastShiftMs(exactMs);
    setAttendance(prev => ({ ...prev, [currentUser.id]: { ...(prev[currentUser.id]||{}), [todayStr]: status } }));
    try {
      const res = await apiFetch(`${API_URL}/api/attendance/clock-out`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ employeeId: currentUser.id, time: t, status, hoursWorked }),
      });
      const data = await res.json();
      const savedLogs = parseSessionLogs(data.record?.notes);
      if (res.ok && savedLogs.length) setTimeLogs(savedLogs);
      else if (!res.ok) setClockSaveError(`Clock-out shown above didn't save (server said: ${data?.detail || res.status}). It will disappear on reload — try again.`);
    } catch { setClockSaveError("Clock-out shown above didn't save — couldn't reach the server. It will disappear on reload — try again."); }
    finally { clockBusyRef.current = false; setClockingOut(false); }
  };

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
    if (st==="weekend") return <span className="bdg bdg-gray">Weekend</span>;
    return <span className="bdg bdg-gray">{st}</span>;
  };

  const teamToday = teamEmps.map(e => ({ emp:e, status:(attendance[e.id]||{})[todayStr] }));
  const teamFiltered = teamToday.filter(x => teamFilter==="all" || x.status===teamFilter);
  const visibleCorrections = corrections
    .filter(r => canApproveAttendance || (r.employee_id || r.empId) === currentUser.id)
    .filter(r => corrFilter === "all" || r.status === corrFilter);
  const pendingCorrections = corrections.filter(r => r.status === "pending");
  const availYears = [...new Set([...rptMonths.map(m => m.slice(0,4)), String(CURRENT_YEAR)])].sort().reverse();
  const MONTH_NAMES_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthLabel = (m) => { const [y,mo]=m.split("-"); return new Date(+y,+mo-1,1).toLocaleDateString("en-IN",{month:"long",year:"numeric"}); };

  const statusText = (s) => {
    if (s === "approved") return <span className="bdg bdg-g">Approved</span>;
    if (s === "rejected") return <span className="bdg bdg-r">Rejected</span>;
    return <span className="bdg bdg-a">Pending</span>;
  };

  const submitCorrection = async () => {
    const reason = corrForm.reason.trim();
    if (!corrForm.date) { setCorrError("Select the missed attendance date."); return; }
    if (corrForm.date > todayStr) { setCorrError("Missed punch requests cannot be raised for future dates."); return; }
    if (reason.length < 10) { setCorrError("Add at least 10 characters in the explanation."); return; }
    setCorrSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/attendance/corrections`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          employeeId: currentUser.id, empName: currentUser.name, date: corrForm.date, reason,
          correctedClockIn: to12HourClock(corrForm.correctedClockIn),
          correctedClockOut: to12HourClock(corrForm.correctedClockOut),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCorrError(data.detail || "Could not submit request."); return; }
      setCorrections(prev => [data.correction, ...prev]);
      setCorrForm({ date:"", reason:"", correctedClockIn:"", correctedClockOut:"" });
      setCorrError("");
      setCorrFilter("all");
      setCorrModal(false);
      setTab("corrections");
    } catch { setCorrError("Network error. Please try again."); }
    finally { setCorrSaving(false); }
  };

  const approveCorrection = async (requestId) => {
    if (!canApproveAttendance) return;
    const req = corrections.find(r => r.id === requestId);
    if (!req) return;
    setCorrections(prev => prev.map(r => r.id === requestId ? { ...r, status: "approved", actioned_by: currentUser.name } : r));
    setAttendance(prev => ({
      ...prev,
      [req.employee_id || req.empId]: { ...(prev[req.employee_id || req.empId] || {}), [req.date]: "present" },
    }));
    try {
      const res = await apiFetch(`${API_URL}/api/attendance/corrections/${requestId}/approve`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ actionedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setCorrections(prev => prev.map(r => r.id === requestId ? data.correction : r));
      } else {
        setCorrections(prev => prev.map(r => r.id === requestId ? req : r));
        setAttendance(prev => { const e = { ...(prev[req.employee_id || req.empId] || {}) }; delete e[req.date]; return { ...prev, [req.employee_id || req.empId]: e }; });
      }
    } catch {
      setCorrections(prev => prev.map(r => r.id === requestId ? req : r));
      setAttendance(prev => { const e = { ...(prev[req.employee_id || req.empId] || {}) }; delete e[req.date]; return { ...prev, [req.employee_id || req.empId]: e }; });
    }
  };

  const rejectCorrection = async (requestId) => {
    if (!canApproveAttendance) return;
    const req = corrections.find(r => r.id === requestId);
    if (!req) return;
    setCorrections(prev => prev.map(r => r.id === requestId ? { ...r, status: "rejected", actioned_by: currentUser.name } : r));
    try {
      const res = await apiFetch(`${API_URL}/api/attendance/corrections/${requestId}/reject`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ actionedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) setCorrections(prev => prev.map(r => r.id === requestId ? data.correction : r));
      else setCorrections(prev => prev.map(r => r.id === requestId ? req : r));
    } catch { setCorrections(prev => prev.map(r => r.id === requestId ? req : r)); }
  };

  const submitHoliday = async () => {
    const name = holForm.name.trim();
    if (!holForm.date) { setHolError("Select the holiday date."); return; }
    if (!name) { setHolError("Enter a name for the holiday."); return; }
    setHolSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/holidays`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ date: holForm.date, name, createdBy: currentUser.name }),
      });
      const data = await res.json();
      if (!res.ok) { setHolError(data.detail || "Could not add holiday."); return; }
      setHolidays(prev => [...prev, data.holiday].sort((a,b) => a.holiday_date.localeCompare(b.holiday_date)));
      // Update attendance map so calendar reflects the new holiday immediately
      const ds = holForm.date;
      setAttendance(prev => {
        const next = { ...prev };
        ALL_USERS.forEach(e => {
          next[e.id] = { ...(next[e.id] || {}), [ds]: "holiday" };
        });
        return next;
      });
      setHolForm({ date:"", name:"" });
      setHolError("");
      setHolModal(false);
    } catch { setHolError("Network error. Please try again."); }
    finally { setHolSaving(false); }
  };

  const removeHoliday = async (id) => {
    if (!canApproveAttendance) return;
    const snapshot = holidays;
    setHolidays(prev => prev.filter(h => h.id !== id));
    try {
      const res = await apiFetch(`${API_URL}/api/holidays/${id}`, { method:"DELETE" });
      if (!res.ok) setHolidays(snapshot);
    } catch { setHolidays(snapshot); }
  };

  return (
    <div>
      <div className="ph" style={{ marginBottom:14 }}>
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">Attendance</div>
          <div className="ph-sub">Daily tracking, missed punch requests and HR approval</div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button className="btn btn-p" onClick={()=>{ setCorrError(""); setCorrModal(true); }}><Icon n="plus" s={13}/>Missed Punch Request</button>
          <select className="fsel" style={{ width:82 }} value={selMonth.slice(0,4)} onChange={e=>setSelMonth(`${e.target.value}-${selMonth.slice(5,7)}`)}>
            {availYears.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <select className="fsel" style={{ width:90 }} value={selMonth.slice(5,7)} onChange={e=>setSelMonth(`${selMonth.slice(0,4)}-${e.target.value}`)}>
            {MONTH_NAMES_SHORT.map((n,i)=><option key={i} value={pad2(i+1)}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* ── Smart Attendance Card + Monthly Stats — kept compact so the daily log table below sits higher ── */}
      <div className="g2" style={{ gap:12, marginBottom:10 }}>

        {/* ── LEFT: Smart Attendance Card (3 conditional states) ── */}
        {(() => {
          const isOnLeave = attendance[currentUser.id]?.[todayStr] === "leave";
          const isHoliday = attendance[currentUser.id]?.[todayStr] === "holiday";
          const hour = new Date().getHours();
          const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
          const firstName = currentUser.firstName || currentUser.name?.split(" ")[0] || "there";
          // Determine state: A=ready to clock in, B=working, C=just finished a session.
          // C is gated on lastShiftMs (set only by an in-session clock-out), not on the
          // persisted checkOutTime — so a page reload never gets stuck on the old summary,
          // and employees can start as many clock-in/out sessions as they want per day.
          const stateB = checkedIn;
          const stateC = !checkedIn && lastShiftMs != null;
          const stateA = !stateB && !stateC;
          const sessionNum = timeLogs.length || 1;
          return (
            <div className="card" style={{ marginBottom:0 }}>
              {/* Card header — always shows date + today's status badge */}
              <div className="ch">
                <div className="ct"><Icon n="clockin" s={14}/>Today — {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
                {attBadge(attendance[currentUser.id]?.[todayStr])}
              </div>
              <div className="cb" style={{ padding:"12px 14px" }}>

                {/* Save-failure banner — surfaces a clock-in/out that displayed but never persisted */}
                {clockSaveError && (
                  <div style={{ marginBottom:10, padding:"10px 12px", background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.25)", borderRadius:"var(--r8)", fontSize:12.5, color:"var(--red)", display:"flex", alignItems:"flex-start", gap:8 }}>
                    <span style={{ fontSize:14, lineHeight:1.3 }}>⚠️</span>
                    <span>{clockSaveError}</span>
                  </div>
                )}

                {/* Leave / Holiday override banner */}
                {(isOnLeave || isHoliday) && (
                  <div style={{ padding:"10px 12px", background:"var(--accent-soft)", border:"1px solid rgba(37,99,235,0.2)", borderRadius:"var(--r8)", fontSize:12.5, color:"var(--accent)", display:"flex", alignItems:"center", gap:8 }}>
                    <Icon n="leave" s={13}/>
                    {isOnLeave ? "You are on approved leave today — clock-in is not required." : "Today is a public holiday — enjoy your day off!"}
                  </div>
                )}

                {/* ── STATE A: Not clocked in yet — welcome message + full-width blue Clock In button ── */}
                {!isOnLeave && !isHoliday && stateA && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ textAlign:"center", padding:"8px 12px 4px" }}>
                      <div style={{ fontSize:20, marginBottom:4 }}>👋</div>
                      <div style={{ fontWeight:700, fontSize:14.5, color:"var(--ink)", marginBottom:3 }}>{greeting}, {firstName}!</div>
                      <div style={{ fontSize:12.5, color:"var(--ink3)" }}>
                        {timeLogs.length ? "Ready for another session? Clock in anytime." : "Ready to start your day? Clock in to begin."}
                      </div>
                    </div>
                    {/* Button is disabled immediately on first click while the API call is in-flight */}
                    <button
                      className="reg-btn"
                      onClick={handleCheckIn}
                      disabled={clockingIn}
                      style={{ opacity: clockingIn ? 0.65 : 1, cursor: clockingIn ? "not-allowed" : "pointer", transition:"all 0.18s" }}
                    >
                      {clockingIn ? "Starting shift…" : "Clock In"}
                    </button>
                  </div>
                )}

                {/* ── STATE B: Currently clocked in / working — no minimum-duration lock; Clock Out is always enabled ── */}
                {!isOnLeave && !isHoliday && stateB && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {/* Active status pill */}
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", background:"var(--green-soft)", border:"1px solid rgba(5,150,105,0.25)", borderRadius:20, fontSize:11.5, color:"var(--green)", fontWeight:700 }}>
                        <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--green)", display:"inline-block", animation:"pulse-dot 1.4s ease-in-out infinite" }}/>
                        Active
                      </span>
                      <span style={{ fontSize:11.5, color:"var(--ink3)" }}>Clocked in at <span style={{ fontFamily:"var(--mono)", fontWeight:700, color:"var(--green)" }}>{checkInTime}</span></span>
                      <span style={{ fontSize:11.5, color:"var(--ink4)" }}>· Session {sessionNum}</span>
                    </div>
                    {/* Live elapsed counter — ticks every second, shows exact h/m/s with no floor */}
                    <div style={{ background:"var(--raised)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:"10px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:11.5, color:"var(--ink3)" }}>Time Elapsed</div>
                      <div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:"var(--accent)" }}>{liveElapsed || "0h 00m 00s"}</div>
                    </div>
                    {/* Clock Out is a single, always-enabled amber/red button — clickable at any time */}
                    <button
                      className="reg-btn checked-in"
                      style={{ background:"var(--amber-soft)", borderColor:"var(--amber)", color:"var(--amber)", opacity: clockingOut ? 0.65 : 1, cursor: clockingOut ? "not-allowed" : "pointer", transition:"all 0.18s" }}
                      onClick={handleCheckOut}
                      disabled={clockingOut}
                    >
                      {clockingOut ? "Processing…" : "Clock Out"}
                    </button>
                  </div>
                )}

                {/* ── STATE C: Session completed — transient summary, not an end-of-day lock ── */}
                {!isOnLeave && !isHoliday && stateC && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:"var(--green-soft)", border:"1px solid rgba(5,150,105,0.25)", borderRadius:"var(--r8)" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--green)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <span style={{ color:"#fff", fontSize:16, lineHeight:1 }}>✓</span>
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13.5, color:"var(--green)", marginBottom:3 }}>Shift completed successfully!</div>
                        <div style={{ fontSize:12, color:"var(--ink3)" }}>Total logged time: <span style={{ fontFamily:"var(--mono)", fontWeight:700, color:"var(--ink)" }}>{fmtExactDuration(lastShiftMs)}</span></div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <div style={{ flex:1, textAlign:"center", padding:"8px 6px", background:"var(--raised)", borderRadius:"var(--r8)", border:"1px solid var(--brd)" }}>
                        <div style={{ fontSize:10, color:"var(--ink3)", marginBottom:2 }}>Clocked In</div>
                        <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:12.5, color:"var(--green)" }}>{checkInTime}</div>
                      </div>
                      <div style={{ flex:1, textAlign:"center", padding:"8px 6px", background:"var(--raised)", borderRadius:"var(--r8)", border:"1px solid var(--brd)" }}>
                        <div style={{ fontSize:10, color:"var(--ink3)", marginBottom:2 }}>Clocked Out</div>
                        <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:12.5, color:"var(--red)" }}>{checkOutTime}</div>
                      </div>
                      <div style={{ flex:1, textAlign:"center", padding:"8px 6px", background:"var(--raised)", borderRadius:"var(--r8)", border:"1px solid var(--brd)" }}>
                        <div style={{ fontSize:10, color:"var(--ink3)", marginBottom:2 }}>Today's Total</div>
                        <div style={{ fontFamily:"var(--mono)", fontWeight:700, fontSize:12.5, color:"var(--accent)" }}>{fmtHours(totalWorkedHours)}</div>
                      </div>
                    </div>
                    {/* No end-of-day lock — employees can clock in again for as many sessions as needed */}
                    <button
                      className="reg-btn"
                      onClick={handleCheckIn}
                      disabled={clockingIn}
                      style={{ opacity: clockingIn ? 0.65 : 1, cursor: clockingIn ? "not-allowed" : "pointer", transition:"all 0.18s" }}
                    >
                      {clockingIn ? "Starting shift…" : "Clock In Again"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── RIGHT: Monthly Stats ── */}
        <div className="card" style={{ marginBottom:0 }}>
          <div className="ch">
            <div className="ct"><Icon n="chart" s={14}/>My Stats — {monthLabel(selMonth)}</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--ink3)", fontWeight:700 }}>
              {Math.round((myStats.present+myStats.late)/Math.max(1,countWorkDays(yr,mo)-myStats.holidays)*100)||0}% attendance
            </div>
          </div>
          <div className="cb" style={{ padding:"12px 16px" }}>
            {/* Attendance rate bar */}
            <div style={{ marginBottom:14 }}>
              <div style={{ height:6, background:"var(--brd)", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(100,Math.round((myStats.present+myStats.late)/Math.max(1,countWorkDays(yr,mo)-myStats.holidays)*100)||0)}%`, background:"var(--green)", borderRadius:3, transition:"width 0.4s ease" }}/>
              </div>
            </div>
            {/* Stats grid — 2 columns × 3 rows for tighter vertical footprint */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { v:myStats.present,  l:"Present",  c:"var(--green)",  bg:"var(--green-soft)" },
                { v:myStats.late,     l:"Late",     c:"var(--amber)",  bg:"var(--amber-soft)" },
                { v:myStats.absent,   l:"Absent",   c:"var(--red)",    bg:"var(--red-soft)"   },
                { v:myStats.leave,    l:"Leave",    c:"var(--accent)", bg:"var(--accent-soft)" },
                { v:myStats.holidays, l:"Holidays", c:"var(--purple)", bg:"var(--purple-soft)" },
                { v:countWorkDays(yr,mo)-myStats.holidays, l:"Work Days", c:"var(--teal)", bg:"var(--teal-soft)" },
              ].map(s=>(
                <div key={s.l} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:s.bg, borderRadius:"var(--r8)" }}>
                  <div style={{ fontFamily:"var(--display)", fontWeight:800, fontSize:22, color:s.c, lineHeight:1, minWidth:28, textAlign:"right" }}>{s.v}</div>
                  <div style={{ fontSize:11, color:s.c, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.4px", lineHeight:1.3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:10 }}>
        {["my","calendar","holidays","corrections",...(canViewTeam?["team"]:[]),...(canViewReports?["reports"]:[])].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="my"?"My Log":t==="calendar"?"Calendar":t==="holidays"?`Holidays${holidays.length?` · ${holidays.length}`:""}`:t==="corrections"?`Corrections${canApproveAttendance&&pendingCorrections.length>0?` · ${pendingCorrections.length}`:""}`:t==="team"?"Team Today":"Reports"}
          </div>
        ))}
      </div>

      {tab==="my" && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="attend" s={14}/>My Daily Log — {monthLabel(selMonth)}</div></div>
          <div className="tw" style={{ maxHeight:400, overflowY:"auto",overscrollBehavior:"none" }}>
            <table>
              <thead><tr><th>Date</th><th>Day</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th><th style={{ minWidth:120 }}>Flags</th></tr></thead>
              <tbody>
                {Array.from({length:dim}).map((_,i)=>{
                  const d=i+1;
                  const ds=`${yr}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const dt=new Date(yr,mo-1,d);
                  const dayName=dt.toLocaleDateString("en-IN",{weekday:"short"});
                  const dow=dt.getDay();
                  const isWeekend=dow===0||dow===6;
                  const rawSt=myAtt[ds];
                  const st=rawSt||null;
                  const isFuture=ds>todayStr; const isToday=ds===todayStr;
                  // Always hide weekends from My Log; hide future working days with no record
                  if (isWeekend) return null;
                  if (!rawSt && isFuture && !isToday) return null;
                  const rec = isToday ? null : (clockRecords[currentUser.id]?.[ds] || null);
                  // For today, use the day's first session start — not checkInTime, which
                  // tracks whichever session is currently active/most recent. timeLogs is
                  // append-only, so timeLogs[0] is always the day's first clock-in.
                  const realIn  = isToday ? (timeLogs[0]?.in || checkInTime) : (rec?.clock_in  || null);
                  const realOut = isToday ? checkOutTime : (rec?.clock_out || null);
                  const realHrs = isToday ? totalWorkedHours : (rec?.hours_worked ? Number(rec.hours_worked) : null);
                  // Detect incomplete / missing punch for past non-holiday days
                  const isPast = !isToday && !isFuture;
                  const isMissingIn  = isPast && (st==="present"||st==="late") && !realIn;
                  const isMissingOut = isPast && (st==="present"||st==="late") && realIn && !realOut;
                  const isAbsentWorkday = isPast && st==="absent" && rawSt;
                  const needsFix = isMissingIn || isMissingOut || isAbsentWorkday;
                  const hasPendingCorr = corrections.some(r => r.date === ds && r.status === "pending");
                  const openFixPunchFor = (date) => { setCorrError(""); setCorrForm({ date, reason:"", correctedClockIn:"", correctedClockOut:"" }); setCorrModal(true); };
                  const noteText = st==="late"?"Late arrival":st==="absent"?"Not marked":st==="leave"?"Approved leave":st==="holiday"?"Public holiday":"—";
                  return (
                    <tr key={ds} style={{ background:isToday?"rgba(27,69,245,0.03)":needsFix?"rgba(220,38,38,0.025)":"" }}>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{ds}{isToday&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:6 }}>Today</span>}</td>
                      <td className="t3 tsm">{dayName}</td>
                      <td>{attBadge(st)}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--green)" }}>{realIn||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12, color:"var(--red)" }}>{realOut||"—"}</td>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{isToday ? fmtHours(totalWorkedHours) : (realHrs ? fmtHours(realHrs) : "—")}</td>
                      <td>
                        {needsFix ? (
                          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                            <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 7px", background:"var(--amber-soft)", border:"1px solid rgba(217,119,6,0.3)", borderRadius:10, fontSize:10.5, color:"var(--amber)", fontWeight:700, whiteSpace:"nowrap" }}>
                              ⚠ {isMissingIn?"No punch-in":isMissingOut?"No punch-out":"Absent"}
                            </span>
                            {hasPendingCorr
                              ? <span style={{ fontSize:10.5, color:"var(--ink3)", fontStyle:"italic" }}>Pending…</span>
                              : <button onClick={()=>openFixPunchFor(ds)} style={{ padding:"2px 8px", fontSize:10.5, fontWeight:700, borderRadius:"var(--r6)", border:"1px solid var(--accent)", background:"var(--accent-soft)", color:"var(--accent)", cursor:"pointer", whiteSpace:"nowrap" }}>Fix Punch</button>
                            }
                          </div>
                        ) : (
                          <span className="t3 tsm">{noteText}</span>
                        )}
                      </td>
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
              {[["att-present","Present"],["att-late","Late"],["att-absent","Absent"],["att-leave","Leave"],["att-holiday","Holiday"],["att-wknd","Weekend"]].map(([cls,lbl])=>(
                <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"var(--ink3)" }}>
                  <div className={`att-day ${cls}`} style={{ width:14, height:14, borderRadius:3, fontSize:8, border:"1px solid var(--brd)" }}></div>{lbl}
                </div>
              ))}
            </div>
          </div>
          <div className="cb">
            {(canViewTeam || canViewReports) && (
              <div className="fgrp" style={{ marginBottom:14, maxWidth:240 }}>
                <div className="flbl">View employee</div>
                <select className="fsel" value={selEmpId} onChange={e=>setSelEmpId(e.target.value)}>
                  {calendarEmps.map(e=><option key={e.id} value={e.id}>{e.name}{e.id===currentUser.id?" (You)":""}</option>)}
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
                const dow=new Date(yr,mo-1,d).getDay();
                const isWeekend=dow===0||dow===6;
                const rawSt=((canViewTeam || canViewReports)?selectedAtt:myAtt)[ds];
                const st=rawSt==="holiday"?"holiday":(isWeekend?"weekend":rawSt);
                const isFuture=ds>todayStr; const isToday=ds===todayStr;
                return (
                  <div key={d} className={`att-day ${st==="holiday"?"att-holiday":isWeekend?"att-wknd":isFuture&&!isToday?"att-future":attClass(st)} ${isToday?"att-today":""}`} style={{ fontSize:10 }}>
                    <span style={{ fontSize:11, fontWeight:600 }}>{d}</span>
                    {st&&<span style={{ fontSize:8 }}>{attLabel(st)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab==="holidays" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="cal" s={14}/>Company Holidays — {yr}</div>
            {canApproveAttendance && (
              <button className="btn btn-p" onClick={()=>{ setHolError(""); setHolModal(true); }}><Icon n="plus" s={13}/>Add Holiday</button>
            )}
          </div>
          <div className="tw" style={{ maxHeight:480, overflowY:"auto", overscrollBehavior:"none" }}>
            <table>
              <thead><tr><th style={{ width:130 }}>Date</th><th style={{ width:90 }}>Day</th><th>Holiday Name</th><th>Added By</th>{canApproveAttendance&&<th style={{ width:80 }}>Action</th>}</tr></thead>
              <tbody>
                {holidaysLoading ? (
                  <tr><td colSpan={5}><div className="empty">Loading…</div></td></tr>
                ) : holidays.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty">No holidays defined for {yr}. {canApproveAttendance?"Use \"Add Holiday\" to create one.":"Contact HR to add company holidays."}</div></td></tr>
                ) : holidays.map(h => {
                  const d = new Date(h.holiday_date + "T00:00:00");
                  const dayName = d.toLocaleDateString("en-IN", { weekday:"long" });
                  return (
                    <tr key={h.id}>
                      <td style={{ fontFamily:"var(--mono)", fontSize:12 }}>{h.holiday_date}</td>
                      <td className="t3 tsm">{dayName}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--purple)", flexShrink:0 }}/>
                          <span className="fw7">{h.name}</span>
                        </div>
                      </td>
                      <td className="t3 tsm">{h.created_by || "—"}</td>
                      {canApproveAttendance && (
                        <td>
                          <button className="btn btn-d btn-sm" onClick={()=>removeHoliday(h.id, h.holiday_date)}>Remove</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          <div className="tw" style={{ maxHeight:460, overflowY:"auto",overscrollBehavior:"none" }}>
            <table>
              <thead><tr><th>Employee</th><th>Date Missed</th><th>Current Status</th><th>Explanation</th><th>Punch Fix</th><th>Requested</th><th>Decision</th><th>Actions</th></tr></thead>
              <tbody>
                {corrLoading ? (
                  <tr><td colSpan={8}><div className="empty">Loading…</div></td></tr>
                ) : visibleCorrections.map(r=>{
                  const empId = r.employee_id || r.empId;
                  const emp = ALL_USERS.find(e => e.id === empId);
                  const currentStatus = attendance[empId]?.[r.date];
                  const fixIn = r.corrected_clock_in || r.correctedClockIn;
                  const fixOut = r.corrected_clock_out || r.correctedClockOut;
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          {emp&&<div className="avt" style={{ width:26, height:26, background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div>}
                          <div><div className="fw7">{r.emp_name||r.emp}{empId===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9, marginLeft:4 }}>You</span>}</div><div className="t3 tsm">{empId}</div></div>
                        </div>
                      </td>
                      <td className="mono tsm">{r.date}</td>
                      <td>{attBadge(currentStatus)}</td>
                      <td className="t3 tsm" style={{ maxWidth:260 }}>{r.reason}</td>
                      <td className="mono tsm">
                        {fixIn || fixOut
                          ? <>{fixIn && <div>In: {fixIn}</div>}{fixOut && <div>Out: {fixOut}</div>}</>
                          : <span className="t3">No time given</span>}
                      </td>
                      <td className="mono tsm">{r.requested_at||r.requestedAt}</td>
                      <td>{statusText(r.status)}<div className="t3 tsm">{r.actioned_by||r.actionedBy ? `${r.actioned_by||r.actionedBy} · ${r.actioned_at||r.actionedAt}` : "HR department only"}</div></td>
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
                {!visibleCorrections.length&&<tr><td colSpan={8}><div className="empty">No attendance correction requests found</div></td></tr>}
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
          <div className="tw" style={{ maxHeight:440, overflowY:"auto",overscrollBehavior:"none" }}>
            <table>
              <thead><tr><th>Employee</th><th>Dept</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th></tr></thead>
              <tbody>
                {teamFiltered.map(({emp,status})=>{
                  const tRec = emp.id === currentUser.id ? null : (clockRecords[emp.id]?.[todayStr] || null);
                  const tIn  = emp.id === currentUser.id ? (timeLogs[0]?.in || checkInTime) : (tRec?.clock_in  || null);
                  const tOut = emp.id === currentUser.id ? checkOutTime : (tRec?.clock_out || null);
                  const tHrs = emp.id === currentUser.id
                    ? (checkedIn ? `${fmtHours(totalWorkedHours)} +` : fmtHours(totalWorkedHours))
                    : (tRec?.hours_worked ? fmtHours(Number(tRec.hours_worked)) : "—");
                  return (
                    <tr key={emp.id}>
                      <td><div style={{ display:"flex",alignItems:"center",gap:8 }}><div className="avt" style={{ width:28,height:28,background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div><div className="fw7">{emp.name}{emp.id===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div></div></td>
                      <td><span className="bdg bdg-b">{emp.dept}</span></td>
                      <td>{attBadge(status)}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--green)" }}>{tIn || "—"}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--red)" }}>{tOut || "—"}</td>
                      <td style={{ fontFamily:"var(--mono)",fontSize:12 }}>{tHrs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="reports" && canViewReports && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="analytics" s={14}/>Organisation Attendance — {monthLabel(selMonth)}</div>
          </div>
          <div className="tw" style={{ maxHeight:500, overflowY:"auto",overscrollBehavior:"none" }}>
            <table>
              <thead><tr><th>Employee</th><th>Dept</th><th>Present</th><th>Late</th><th>Absent</th><th>Leave</th><th>Holidays</th><th>Rate</th></tr></thead>
              <tbody>
                {ALL_USERS.map(e=>{
                  const st=getMonthStats(attendance[e.id]||{});
                  const workDays=Math.max(1,countWorkDays(yr,mo)-st.holidays);
                  const pct=Math.round(((st.present+st.late)/workDays)*100)||0;
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
        <Modal title="Missed Punch Request" onClose={()=>{ setCorrError(""); setCorrModal(false); }} footer={<><button className="btn" onClick={()=>{ setCorrError(""); setCorrModal(false); }}>Cancel</button><button className="btn btn-p" onClick={submitCorrection} disabled={corrSaving}>{corrSaving?"Submitting…":"Submit to HR"}</button></>}>
          <div className="fg">
            <div className="fgrp">
              <div className="flbl">Missed attendance date</div>
              <input className="finp" type="date" max={todayStr} value={corrForm.date} onChange={e=>setCorrForm(p=>({...p,date:e.target.value}))} onInput={e=>setCorrForm(p=>({...p,date:e.target.value}))}/>
            </div>
            <div className="fgrp">
              <div className="flbl">Requested status</div>
              <input className="finp" value="Present" readOnly/>
            </div>
            <div className="fgrp">
              <div className="flbl">Actual clock-in time</div>
              <input className="finp" type="time" value={corrForm.correctedClockIn} onChange={e=>setCorrForm(p=>({...p,correctedClockIn:e.target.value}))}/>
            </div>
            <div className="fgrp">
              <div className="flbl">Actual clock-out time</div>
              <input className="finp" type="time" value={corrForm.correctedClockOut} onChange={e=>setCorrForm(p=>({...p,correctedClockOut:e.target.value}))}/>
            </div>
            <div className="fgrp ff">
              <div className="flbl">Explanation for HR</div>
              <textarea className="ftxt" placeholder="Explain why attendance was missed even though you worked from office..." value={corrForm.reason} onChange={e=>setCorrForm(p=>({...p,reason:e.target.value}))} onInput={e=>setCorrForm(p=>({...p,reason:e.target.value}))}/>
            </div>
          </div>
          <div style={{ marginTop:10, fontSize:11.5, color:"var(--ink4)" }}>Only fill in the time(s) that were actually missed — leave the other blank if it was already recorded correctly.</div>
          {corrError && <div style={{ marginTop:12, padding:"10px 12px", background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--red)", fontWeight:600 }}>{corrError}</div>}
          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--amber-soft)", border:"1px solid rgba(176,96,16,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--amber)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="shield" s={13}/> Only the HR department can approve and mark this attendance as present.
          </div>
        </Modal>
      )}

      {holModal && (
        <Modal title="Add Company Holiday" onClose={()=>{ setHolError(""); setHolModal(false); }} footer={<><button className="btn" onClick={()=>{ setHolError(""); setHolModal(false); }}>Cancel</button><button className="btn btn-p" onClick={submitHoliday} disabled={holSaving}>{holSaving?"Adding…":"Add Holiday"}</button></>}>
          <div className="fg">
            <div className="fgrp">
              <div className="flbl">Holiday date</div>
              <input className="finp" type="date" value={holForm.date} onChange={e=>setHolForm(p=>({...p,date:e.target.value}))}/>
            </div>
            <div className="fgrp">
              <div className="flbl">Holiday name</div>
              <input className="finp" type="text" placeholder="e.g. Diwali, Republic Day…" value={holForm.name} onChange={e=>setHolForm(p=>({...p,name:e.target.value}))}/>
            </div>
          </div>
          {holError && <div style={{ marginTop:12, padding:"10px 12px", background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--red)", fontWeight:600 }}>{holError}</div>}
          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--purple-soft)", border:"1px solid rgba(92,53,194,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--purple)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="cal" s={13}/> All employees will be automatically marked as Holiday for this date.
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── LEAVE MODULE ─────────────────────────────────────────────────────────────
// Handles leave applications, approval workflow, balance display, and the
// monthly leave calendar. Visibility of requests is scoped by access level.
const LeaveMod = ({ currentUser, deepLink }) => {
  const visibleEmps = getVisibleEmps(currentUser);
  // "my" | "calendar" | "corrections" (the approvals queue, despite the name) — mirrored
  // to ?tab= in the URL; deepLink lets a notification click jump straight to a sub-tab.
  const [tab, setTab] = useUrlTab("my", deepLink);
  // Leave requests loaded from API
  const [reqs, setReqs] = useState([]);
  const [reqsLoading, setReqsLoading] = useState(true);
  // Leave balances loaded from API
  const [myBalance, setMyBalance] = useState([]);
  const [fil, setFil] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type:"Earned Leave", from:"", to:"", reason:"", empId:currentUser.id });
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const today=new Date(); const yr=today.getFullYear(); const mo=today.getMonth();
  const dim=new Date(yr,mo+1,0).getDate(); const fd=new Date(yr,mo,1).getDay();

  // Load leave requests and balances from API
  useEffect(() => {
    // For HR/Director fetch all; otherwise fetch own
    const url = (currentUser.isHR || isDirector(currentUser))
      ? `${API_URL}/api/leaves`
      : `${API_URL}/api/leaves?employee_id=${currentUser.id}`;
    apiFetch(url)
      .then(r => r.json())
      .then(data => setReqs(data.leaveRequests || []))
      .catch(() => setReqs([]))
      .finally(() => setReqsLoading(false));
    apiFetch(`${API_URL}/api/leaves/balance/${currentUser.id}`)
      .then(r => r.json())
      .then(data => setMyBalance((data.balances || []).map(b => ({
        type: b.leave_type, total: b.total, used: b.used, color: b.color,
      }))))
      .catch(() => setMyBalance([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Field accessor helpers that handle both snake_case (API) and camelCase (legacy)
  const reqEmpId = r => r.employee_id || r.empId;
  const reqFrom  = r => r.from_date   || r.from;
  const reqTo    = r => r.to_date     || r.to;

  const relevantReqs = reqs.filter(r => {
    const eid = reqEmpId(r);
    if (eid === currentUser.id) return true;
    if (canApproveLeaveNew(currentUser, eid)) return true;
    return false;
  });

  const myReqs = reqs.filter(r => reqEmpId(r) === currentUser.id);
  const myFiltered = myReqs.filter(r => fil==="all"||r.status===fil);
  const filtered = relevantReqs.filter(r => fil==="all"||r.status===fil);
  const pendingActionable = relevantReqs.filter(r =>
    r.status==="pending" && reqEmpId(r) !== currentUser.id && canApproveLeaveNew(currentUser, reqEmpId(r))
  );

  const showApproveFor = (r) =>
    r.status==="pending" && reqEmpId(r) !== currentUser.id && canApproveLeaveNew(currentUser, reqEmpId(r));

  const dayS = (d) => {
    const dt=new Date(yr,mo,d);
    if (dt.getDay()===0||dt.getDay()===6) return "wknd";
    const ds=`${yr}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const myLeave=reqs.find(r=>reqEmpId(r)===currentUser.id&&r.status==="approved"&&ds>=reqFrom(r)&&ds<=reqTo(r));
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

  const submit = async () => {
    if (!form.from||!form.to||!form.reason.trim()) { setFormError("Please fill in all fields."); return; }
    const emp = ALL_USERS.find(e => e.id === form.empId);
    const days = Math.max(1, Math.ceil((new Date(form.to) - new Date(form.from)) / 86400000) + 1);
    const autoApprove = isDirector(emp);
    setFormSaving(true); setFormError("");
    try {
      const res = await apiFetch(`${API_URL}/api/leaves`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          employeeId: form.empId,
          empName: emp?.name || currentUser.name,
          leaveType: form.type,
          fromDate: form.from,
          toDate: form.to,
          days,
          reason: form.reason,
          status: autoApprove ? "approved" : "pending",
          approvedBy: autoApprove ? "Auto-approved" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.detail || "Failed to submit."); return; }
      setReqs(p => [data.leaveRequest, ...p]);
      // Auto-approved submissions (a Director applying for themselves) increment
      // leave_used on the server immediately — refresh the balance stat cards/bars
      // now too, or they'd keep showing the pre-submission balance until reload.
      if (autoApprove && form.empId === currentUser.id) {
        apiFetch(`${API_URL}/api/leaves/balance/${currentUser.id}`)
          .then(r => r.json())
          .then(d => setMyBalance((d.balances || []).map(b => ({ type: b.leave_type, total: b.total, used: b.used, color: b.color }))));
      }
      setModal(false);
      setForm({ type:"Earned Leave", from:"", to:"", reason:"", empId:currentUser.id });
      setTab("my");
    } catch { setFormError("Network error. Please try again."); }
    finally { setFormSaving(false); }
  };

  const handleApprove = async (rId) => {
    const orig = reqs.find(x => x.id === rId);
    setReqs(p => p.map(x => x.id === rId ? { ...x, status: "approved", approved_by: currentUser.name, approvedBy: currentUser.name } : x));
    try {
      const res = await apiFetch(`${API_URL}/api/leaves/${rId}/approve`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ approvedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) {
        setReqs(p => p.map(x => x.id === rId ? data.leaveRequest : x));
        // Refresh balance if the approved leave belongs to the current user
        if (data.balances && orig?.employee_id === currentUser.id) {
          setMyBalance(data.balances.map(b => ({ type: b.leave_type, total: b.total, used: b.used, color: b.color })));
        } else if (orig?.employee_id === currentUser.id) {
          apiFetch(`${API_URL}/api/leaves/balance/${currentUser.id}`)
            .then(r => r.json())
            .then(d => setMyBalance((d.balances || []).map(b => ({ type: b.leave_type, total: b.total, used: b.used, color: b.color }))));
        }
      } else if (orig) setReqs(p => p.map(x => x.id === rId ? orig : x));
    } catch { if (orig) setReqs(p => p.map(x => x.id === rId ? orig : x)); }
  };
  const handleReject = async (rId) => {
    const orig = reqs.find(x => x.id === rId);
    setReqs(p => p.map(x => x.id === rId ? { ...x, status: "rejected", approved_by: currentUser.name, approvedBy: currentUser.name } : x));
    try {
      const res = await apiFetch(`${API_URL}/api/leaves/${rId}/reject`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ approvedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) setReqs(p => p.map(x => x.id === rId ? data.leaveRequest : x));
      else if (orig) setReqs(p => p.map(x => x.id === rId ? orig : x));
    } catch { if (orig) setReqs(p => p.map(x => x.id === rId ? orig : x)); }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">Time Off</div>
          <div className="ph-sub">{`Approver: ${getApproverLabel(currentUser.id)}`}</div>
        </div>
        <button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Apply for Leave</button>
      </div>

      <div className="sg">
        {[
          { v:pendingActionable.length, l:"Pending Your Approval", s:"Awaiting action", c:"#B06010" },
          { v:relevantReqs.filter(r=>r.status==="approved").length, l:"Approved", s:"In your scope", c:"#0F8C5A" },
          { v:myBalance.reduce((a,l)=>a+((l.total||0)-(l.used||0)),0), l:"My Available Days", s:"All leave types", c:"#1B45F5" },
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
        {["my","calendar","corrections"].map(t=>(
          <div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
            {t==="my"?"My Log":t==="calendar"?"Calendar":`Leaves${pendingActionable.length>0?` · ${pendingActionable.length} pending`:""}`}
          </div>
        ))}
      </div>

      {tab==="my" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="leave" s={14}/>My Time Off Log</div>
            <div style={{ display:"flex", gap:5 }}>
              {["all","pending","approved","rejected"].map(f=><div key={f} className={`pill${fil===f?" active":""}`} onClick={()=>setFil(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>)}
            </div>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Approver</th><th>Status</th><th>Actioned By</th><th>Actions</th></tr></thead>
              <tbody>
                {reqsLoading ? (
                  <tr><td colSpan={10}><div className="empty">Loading…</div></td></tr>
                ) : myFiltered.map(r=>(
                  <tr key={r.id} style={{ opacity:reqEmpId(r)===currentUser.id&&r.status!=="pending"?0.7:1 }}>
                    <td><div className="fw7">{r.emp_name||r.emp}{reqEmpId(r)===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div></td>
                    <td><span className="bdg bdg-b">{r.leave_type||r.type}</span></td>
                    <td className="t3 mono tsm">{reqFrom(r)}</td>
                    <td className="t3 mono tsm">{reqTo(r)}</td>
                    <td className="fw6">{r.days}d</td>
                    <td className="t3 tsm" style={{ maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{r.reason}</td>
                    <td style={{ fontSize:11,color:"var(--ink3)" }}>{getApproverLabel(reqEmpId(r))}</td>
                    <td>{sbdg(r.status)}</td>
                    <td className="t3 tsm">{r.approved_by||r.approvedBy||"—"}</td>
                    <td>
                      {showApproveFor(r) ? (
                        <div style={{ display:"flex",gap:4 }}>
                          <button className="btn btn-s btn-sm" onClick={()=>handleApprove(r.id)}>Approve</button>
                          <button className="btn btn-d btn-sm" onClick={()=>handleReject(r.id)}>Reject</button>
                        </div>
                      ) : r.status==="pending"&&reqEmpId(r)!==currentUser.id ? (
                        <span className="tsm t3">Not in scope</span>
                      ) : <span className="t3">—</span>}
                    </td>
                  </tr>
                ))}
                {!reqsLoading&&!myFiltered.length&&<tr><td colSpan={10}><div className="empty">No {fil} time off logs found</div></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="my" && (
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

      {tab==="corrections" && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="shield" s={14}/>Time Off Corrections</div>
            <div style={{ display:"flex", gap:5 }}>
              {["all","pending","approved","rejected"].map(f=><div key={f} className={`pill${fil===f?" active":""}`} onClick={()=>setFil(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>)}
            </div>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Approver</th><th>Status</th><th>Actioned By</th><th>Actions</th></tr></thead>
              <tbody>
                {reqsLoading ? (
                  <tr><td colSpan={10}><div className="empty">Loading…</div></td></tr>
                ) : filtered.map(r=>(
                  <tr key={r.id} style={{ opacity:reqEmpId(r)===currentUser.id&&r.status!=="pending"?0.7:1 }}>
                    <td><div className="fw7">{r.emp_name||r.emp}{reqEmpId(r)===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div></td>
                    <td><span className="bdg bdg-b">{r.leave_type||r.type}</span></td>
                    <td className="t3 mono tsm">{reqFrom(r)}</td>
                    <td className="t3 mono tsm">{reqTo(r)}</td>
                    <td className="fw6">{r.days}d</td>
                    <td className="t3 tsm" style={{ maxWidth:160,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{r.reason}</td>
                    <td style={{ fontSize:11,color:"var(--ink3)" }}>{getApproverLabel(reqEmpId(r))}</td>
                    <td>{sbdg(r.status)}</td>
                    <td className="t3 tsm">{r.approved_by||r.approvedBy||"—"}</td>
                    <td>
                      {showApproveFor(r) ? (
                        <div style={{ display:"flex",gap:4 }}>
                          <button className="btn btn-s btn-sm" onClick={()=>handleApprove(r.id)}>Approve</button>
                          <button className="btn btn-d btn-sm" onClick={()=>handleReject(r.id)}>Reject</button>
                        </div>
                      ) : r.status==="pending"&&reqEmpId(r)!==currentUser.id ? (
                        <span className="tsm t3">Not in scope</span>
                      ) : <span className="t3">—</span>}
                    </td>
                  </tr>
                ))}
                {!reqsLoading&&!filtered.length&&<tr><td colSpan={10}><div className="empty">No {fil} time off corrections in your scope</div></td></tr>}
              </tbody>
            </table>
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

      {modal && (
        <Modal title="Apply for Leave" onClose={()=>{ setModal(false); setFormError(""); }} footer={<><button className="btn" onClick={()=>{ setModal(false); setFormError(""); }}>Cancel</button><button className="btn btn-p" onClick={submit} disabled={formSaving}>{formSaving?"Submitting…":"Submit Request"}</button></>}>
          <div className="fg">
            {canManage(currentUser)&&<div className="fgrp ff"><div className="flbl">Applying for</div><select className="fsel" value={form.empId} onChange={e=>setForm(p=>({...p,empId:e.target.value}))}>{visibleEmps.map(e=><option key={e.id} value={e.id}>{e.name}{e.id===currentUser.id?" (You)":""}</option>)}</select></div>}
            <div className="fgrp"><div className="flbl">Leave Type</div><select className="fsel" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{myBalance.length>0?myBalance.map(l=><option key={l.type}>{l.type}</option>):["Earned Leave","Sick Leave","Casual Leave","Maternity/Paternity","Compensatory Off"].map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="fgrp"><div className="flbl">Half Day?</div><select className="fsel"><option>Full Day</option><option>First Half</option><option>Second Half</option></select></div>
            <div className="fgrp"><div className="flbl">From</div><input className="finp" type="date" value={form.from} onChange={e=>setForm(p=>({...p,from:e.target.value}))}/></div>
            <div className="fgrp"><div className="flbl">To</div><input className="finp" type="date" value={form.to} onChange={e=>setForm(p=>({...p,to:e.target.value}))}/></div>
            <div className="fgrp ff"><div className="flbl">Reason</div><textarea className="ftxt" placeholder="Briefly describe your reason..." value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))}/></div>
          </div>
          {formError && <div style={{ marginTop:10, padding:"9px 12px", background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:"var(--r8)", fontSize:12, color:"var(--red)", fontWeight:600 }}>{formError}</div>}
          <div style={{ marginTop:12, padding:"10px 12px", background:"var(--raised)", borderRadius:"var(--r8)", fontSize:12, color:"var(--ink3)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="shield" s={13}/> Approver: <strong>{getApproverLabel(form.empId)}</strong>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── TIME LOG MODULE ──────────────────────────────────────────────────────────
// Allows employees to log hours by project and task. Timesheets auto-submit at 40h.
// HR reviewers see a separate "Review" tab to approve/reject submitted sheets.
const TimeLogMod = ({ currentUser, deepLink }) => {
  // Department-specific project list — falls back to Technology if dept not mapped.
  const deptProjs = DEPT_PROJS[currentUser.dept] || DEPT_PROJS["Technology"];
  // Entries and sheet for current user's selected week.
  // `entries` starts as null (not yet fetched) — used to derive loading state.
  const [entries, setEntries] = useState(null);
  const [currentSheet, setCurrentSheet] = useState({ status:"draft", total_hours:0 });
  // Track which week's data is currently displayed to derive a loading flag without
  // calling setState synchronously inside the effect.
  const [fetchedWeek, setFetchedWeek] = useState(null);
  // All timesheets for HR review — starts as null so the spinner shows before first load.
  const [allSheets, setAllSheets] = useState(null);
  // Currently displayed week (Monday date string).
  const [selectedWeek, setSelectedWeek] = useState(THIS_WEEK);
  const [tab, setTab] = useUrlTab("log", deepLink);
  const [modal, setModal] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [form, setForm] = useState({ date:TODAY_STR, project:deptProjs[0].name, subtask:deptProjs[0].subtasks[0], hours:"", notes:"" });
  const [fil, setFil] = useState("all");
  const [entrySaving, setEntrySaving] = useState(false);

  const isHRReviewer = currentUser.isHR || currentUser.accessLevel >= 4;
  const weekStart = new Date(selectedWeek); const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
  const weekLabel = `${weekStart.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;
  // Derive loading: true while the selected week hasn't been fetched yet.
  const loading = fetchedWeek !== selectedWeek;
  const safeEntries = entries || [];
  const totalHours = safeEntries.reduce((a,e)=>a+Number(e.hours),0);
  const pct = Math.min((totalHours/40)*100, 100);
  const selectedProj = deptProjs.find(p=>p.name===form.project)||deptProjs[0];
  const weekOptions = [THIS_WEEK, LAST_WEEK];

  // Load entries and timesheet when week changes — no synchronous setState.
  useEffect(() => {
    apiFetch(`${API_URL}/api/timelogs/entries/${currentUser.id}?week_key=${selectedWeek}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setCurrentSheet(data.timesheet || { status:"draft", total_hours:0 });
        setFetchedWeek(selectedWeek);
      })
      .catch(() => {
        setEntries([]);
        setCurrentSheet({ status:"draft", total_hours:0 });
        setFetchedWeek(selectedWeek);
      });
  }, [selectedWeek]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all timesheets for HR review tab — initialized as null so spinner shows.
  useEffect(() => {
    if (!isHRReviewer) return;
    apiFetch(`${API_URL}/api/timelogs/sheets/all`)
      .then(r => r.json())
      .then(data => setAllSheets(data.timesheets || []))
      .catch(() => setAllSheets([]));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const sheetStatus = currentSheet?.status || "draft";

  const addEntry = async () => {
    if (!form.date||!form.project||!form.subtask||!form.hours) return;
    if (sheetStatus==="submitted"||sheetStatus==="approved") return;
    setEntrySaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/timelogs/entries`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          employeeId: currentUser.id,
          weekKey: selectedWeek,
          date: form.date,
          project: form.project,
          subtask: form.subtask,
          hours: Number(form.hours),
          notes: form.notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(prev => [...(prev || []), data.entry]);
        setCurrentSheet(data.timesheet);
        setModal(false);
        setForm(f => ({ ...f, hours:"", notes:"" }));
      }
    } catch { /* ignore */ }
    finally { setEntrySaving(false); }
  };

  const removeEntry = async (entryId) => {
    if (sheetStatus!=="draft") return;
    try {
      const res = await apiFetch(`${API_URL}/api/timelogs/entries/${entryId}?employee_id=${currentUser.id}&week_key=${selectedWeek}`, {
        method:"DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setEntries(prev => (prev || []).filter(e => e.id !== entryId));
        setCurrentSheet(data.timesheet);
      }
    } catch { /* ignore */ }
  };

  const grouped = safeEntries.reduce((acc,entry)=>{
    if (!acc[entry.project]) acc[entry.project]={};
    if (!acc[entry.project][entry.subtask]) acc[entry.project][entry.subtask]=[];
    acc[entry.project][entry.subtask].push(entry);
    return acc;
  },{});

  const toggleProject = (proj) => setExpandedProjects(p=>({ ...p,[proj]:!p[proj] }));

  const filteredSheets = (allSheets || []).filter(ts => fil==="all" || ts.status===fil);

  const handleHRApprove = async (sheet) => {
    setAllSheets(prev => prev.map(s =>
      s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? { ...s, status: "approved", approved_by: currentUser.name } : s
    ));
    try {
      const res = await apiFetch(`${API_URL}/api/timelogs/sheets/${sheet.employee_id}/${sheet.week_key}/approve`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ approvedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) setAllSheets(prev => prev.map(s =>
        s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? data.timesheet : s
      ));
      else setAllSheets(prev => prev.map(s =>
        s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? sheet : s
      ));
    } catch { setAllSheets(prev => prev.map(s =>
      s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? sheet : s
    )); }
  };

  const handleHRReject = async (sheet) => {
    setAllSheets(prev => prev.map(s =>
      s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? { ...s, status: "rejected", approved_by: currentUser.name } : s
    ));
    try {
      const res = await apiFetch(`${API_URL}/api/timelogs/sheets/${sheet.employee_id}/${sheet.week_key}/reject`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ approvedBy: currentUser.name }),
      });
      const data = await res.json();
      if (res.ok) setAllSheets(prev => prev.map(s =>
        s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? data.timesheet : s
      ));
      else setAllSheets(prev => prev.map(s =>
        s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? sheet : s
      ));
    } catch { setAllSheets(prev => prev.map(s =>
      s.employee_id===sheet.employee_id && s.week_key===sheet.week_key ? sheet : s
    )); }
  };

  const statusBdg = (s) => {
    if (s==="approved")  return <span className="bdg bdg-g">Approved</span>;
    if (s==="submitted") return <span className="bdg bdg-a">Submitted</span>;
    if (s==="rejected")  return <span className="bdg bdg-r">Rejected</span>;
    return <span className="bdg bdg-gray">Draft</span>;
  };

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
          {sheetStatus==="draft"&&<button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Add Hours</button>}
        </div>
      </div>

      <div style={{ display:"flex",gap:6,marginBottom:14 }}>
        {weekOptions.map(wk=>(
          <div key={wk} className={`pill${selectedWeek===wk?" active":""}`} onClick={()=>setSelectedWeek(wk)} style={{ display:"flex",alignItems:"center",gap:6 }}>
            {wk===THIS_WEEK?"This week":"Last week"}
          </div>
        ))}
      </div>

      <div className="sg">
        {[
          { v:`${totalHours.toFixed(1)}h`, l:"Logged Hours", s:`${(40-totalHours).toFixed(1)}h remaining`, c:totalHours>=40?"#0F8C5A":"#1B45F5" },
          { v:`${Math.round(pct)}%`, l:"Week Progress", s:"40h target", c:pct>=100?"#0F8C5A":pct>=75?"#B06010":"#1B45F5" },
          { v:safeEntries.length, l:"Log Entries", s:"This week", c:"#5C35C2" },
          { v:statusBdg(sheetStatus), l:"Status", s:"", c:"var(--ink3)" },
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
          {sheetStatus==="submitted"&&<div style={{ fontSize:11,color:"var(--amber)",marginTop:5,fontWeight:650 }}>Submitted to HR for approval</div>}
          {sheetStatus==="approved"&&<div style={{ fontSize:11,color:"var(--green)",marginTop:5,fontWeight:650 }}>Approved by {currentSheet?.approved_by||""}</div>}
          {sheetStatus==="draft"&&totalHours<40&&<div style={{ fontSize:11,color:"var(--ink3)",marginTop:5 }}>Auto-submits at 40 hours</div>}
        </div>
      </div>

      <div className="tabs">{["log",...(isHRReviewer?["review"]:[])].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="log"?"My Time Log":"HR Review"}</div>)}</div>

      {tab==="log"&&(
        <div>
          {loading ? (
            <div className="card"><div className="empty">Loading…</div></div>
          ) : safeEntries.length===0 ? (
            <div className="card"><div className="empty" style={{ padding:48 }}><div style={{ fontFamily:"var(--display)",fontSize:16,fontWeight:600,marginBottom:6 }}>No hours logged this week</div>{sheetStatus==="draft"&&<button className="btn btn-p" onClick={()=>setModal(true)}><Icon n="plus" s={13}/>Add Hours</button>}</div></div>
          ) : (
            Object.entries(grouped).map(([project,subtasks])=>{ const projTotal=Object.values(subtasks).flat().reduce((a,e)=>a+Number(e.hours),0); const isOpen=expandedProjects[project]!==false; return (
              <div className="tl-project-row" key={project}>
                <div className="tl-project-hd" onClick={()=>toggleProject(project)}><Icon n={isOpen?"chevdown":"chevright"} s={14}/><Icon n="folder" s={14}/><span style={{ flex:1 }}>{project}</span><span style={{ fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",fontSize:13 }}>{projTotal.toFixed(1)}h</span></div>
                {isOpen&&Object.entries(subtasks).map(([subtask,subEntries])=>{ const stTotal=subEntries.reduce((a,e)=>a+Number(e.hours),0); return (<div key={subtask}><div style={{ padding:"6px 14px 4px 36px",borderTop:"1px solid var(--brd)",background:"var(--raised)",display:"flex",alignItems:"center",gap:8 }}><Icon n="clip" s={12}/><span style={{ fontWeight:600,fontSize:12.5,flex:1 }}>{subtask}</span><span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--teal)",fontWeight:650 }}>{stTotal.toFixed(1)}h</span></div>{subEntries.map(entry=>(<div className="tl-task-row" key={entry.id} style={{ paddingLeft:52 }}><span className="t3 mono tsm" style={{ minWidth:80 }}>{entry.date}</span><span style={{ fontFamily:"var(--mono)",fontWeight:700,color:"var(--accent)",minWidth:42 }}>{entry.hours}h</span><span className="t3 tsm" style={{ flex:1 }}>{entry.notes||"—"}</span>{sheetStatus==="draft"&&<button className="btn btn-d btn-sm" style={{ padding:"2px 7px" }} onClick={()=>removeEntry(entry.id)}>✕</button>}</div>))}</div>);})}
              </div>
            );})
          )}
        </div>
      )}

      {tab==="review"&&isHRReviewer&&(
        <div>
          <div style={{ display:"flex",gap:5,marginBottom:12 }}>{["all","submitted","approved","rejected"].map(f=><div key={f} className={`pill${fil===f?" active":""}`} onClick={()=>setFil(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</div>)}</div>
          {allSheets === null ? (
            <div className="empty">Loading…</div>
          ) : filteredSheets.map(ts=>{
            const emp=ALL_USERS.find(u=>u.id===ts.employee_id);
            return (
              <div className="card" key={`${ts.employee_id}_${ts.week_key}`}>
                <div className="ch">
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}><div className="avt" style={{ width:32,height:32,background:emp?.color||"#aaa" }}>{emp?.firstName[0]}{emp?.lastName[0]}</div><div><div className="fw7">{emp?.name||ts.employee_id}</div><div className="t3 tsm">{emp?.role} · Week of {ts.week_key}</div></div></div>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:14,color:"var(--accent)" }}>{Number(ts.total_hours).toFixed(1)}h</span>{statusBdg(ts.status)}{ts.status==="submitted"&&<div style={{ display:"flex",gap:5 }}><button className="btn btn-s btn-sm" onClick={()=>handleHRApprove(ts)}>Approve</button><button className="btn btn-d btn-sm" onClick={()=>handleHRReject(ts)}>Reject</button></div>}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal&&sheetStatus==="draft"&&(
        <Modal title="Log Hours" onClose={()=>setModal(false)} footer={<><button className="btn" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-p" onClick={addEntry} disabled={entrySaving}>{entrySaving?"Saving…":"Add Entry"}</button></>}>
          <div className="fg">
            <div className="fgrp"><div className="flbl">Date</div><input className="finp" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="fgrp"><div className="flbl">Hours</div><input className="finp" type="number" min="0.5" max="12" step="0.5" placeholder="e.g. 7.5" value={form.hours} onChange={e=>setForm(f=>({...f,hours:e.target.value}))}/></div>
            <div className="fgrp ff"><div className="flbl">Project</div><select className="fsel" value={form.project} onChange={e=>{ const p=deptProjs.find(x=>x.name===e.target.value)||deptProjs[0]; setForm(f=>({...f,project:e.target.value,subtask:p.subtasks[0]})); }}>{deptProjs.map(p=><option key={p.name}>{p.name}</option>)}</select></div>
            <div className="fgrp ff"><div className="flbl">Task</div><select className="fsel" value={form.subtask} onChange={e=>setForm(f=>({...f,subtask:e.target.value}))}>{selectedProj.subtasks.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className="fgrp ff"><div className="flbl">Notes</div><textarea className="ftxt" placeholder="What did you work on?" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── PAYROLL ENGINE ────────────────────────────────────────────────────────────
// All statutory rates are loaded from APP_STATUTORY_CFG (fetched from the DB at
// boot) so HR can update PF/ESI/PT/TDS values without a code change.
// The getFallback* helpers return hardcoded fallbacks ONLY when the DB hasn't
// been seeded yet (e.g. first startup before init_database() seeds the table).

const getStat = (key, fallback) => {
  if (APP_STATUTORY_CFG && APP_STATUTORY_CFG[key] !== undefined) return APP_STATUTORY_CFG[key];
  return fallback;
};
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const monthLabelFromDate = (date) => `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
const buildPayrollMonths = (startYear = CURRENT_YEAR, startMonthIndex = CURRENT_MONTH_INDEX, count = 48) =>
  Array.from({ length:count }, (_, i) => monthLabelFromDate(new Date(startYear, startMonthIndex - i, 1)));
// Only keep months from January 2025 onward — no 2022/2023/2024 archive
const PAYROLL_MONTHS = buildPayrollMonths().filter(m => parseInt(m.split(" ")[1], 10) >= 2025);
const CURRENT_PAYROLL_MONTH = PAYROLL_MONTHS[0];
const parsePayrollMonth = (month) => {
  const [name, yearText] = String(month || "").split(" ");
  const monthIndex = MONTH_NAMES.indexOf(name);
  return {
    monthIndex:monthIndex >= 0 ? monthIndex : 3,
    year:Number(yearText) || CURRENT_YEAR,
  };
};
// Returns the last working day (Mon–Fri) of the given payroll month.
// If the last calendar day falls on Saturday, move back to Friday.
// If it falls on Sunday, move back to Friday.
const defaultPayDateForMonth = (month) => {
  const { monthIndex, year } = parsePayrollMonth(month);
  const d = new Date(year, monthIndex + 1, 0); // last calendar day of month
  const dow = d.getDay(); // 0=Sun, 6=Sat
  if (dow === 0) d.setDate(d.getDate() - 2); // Sunday → Friday
  else if (dow === 6) d.setDate(d.getDate() - 1); // Saturday → Friday
  // (Mon–Fri stays as-is)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Counts Monday–Friday days in a calendar month (monthNum is 1-indexed: 1=Jan).
// Does not exclude company holidays — purely weekday count, same convention
// AttendanceMod's countWorkDays() uses for the monthly stats card.
const countWorkingDaysInMonth = (year, monthNum) => {
  const days = new Date(year, monthNum, 0).getDate();
  let n = 0;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, monthNum - 1, d).getDay();
    if (dow !== 0 && dow !== 6) n++;
  }
  return n;
};
const defaultTotalWorkDaysForMonth = (month) => {
  const { monthIndex, year } = parsePayrollMonth(month);
  return countWorkingDaysInMonth(year, monthIndex + 1);
};
const fiscalMonthNumber = (month) => {
  const { monthIndex } = parsePayrollMonth(month);
  return monthIndex >= 3 ? monthIndex - 2 : monthIndex + 10;
};
// Converts a DB date string ("2026-05-01") back into a payroll month label ("May 2026").
// Parsed manually (not via `new Date(iso)`) so a UTC-midnight date string never
// shifts a day backward in negative-UTC-offset timezones.
const monthLabelFromISODate = (isoDate) => {
  const [y, m] = String(isoDate).split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
};
// payrollRuns: optional map of month label → manually-set pay date (from /api/payroll/runs),
// so the "Credited" date reflects a custom pay date once one has been saved for that month.
const payrollHistoryForMonths = (months, payrollRuns = {}) => months.map((month, i) => ({
  month,
  credited:payrollRuns[month] || defaultPayDateForMonth(month),
  status:i === 0 ? "current" : "paid",
  remarks:i === 0 ? "Current payroll cycle" : "Archived payslip available",
}));
const money = n => `₹${Math.round(Math.abs(n || 0)).toLocaleString("en-IN")}`;
const clampNum = (v, min, max) => Math.min(max, Math.max(min, Number(v) || 0));

// Default slab fallbacks (used only if DB statutory config isn't loaded yet).
const _DEFAULT_PT_SLABS = [{ min:0, max:10000, pt:0 }, { min:10001, max:15000, pt:150 }, { min:15001, max:999999999, pt:200 }];
const _DEFAULT_TDS_SLABS = [
  { min:0, max:250000, rate:0 }, { min:250001, max:500000, rate:0.05 }, { min:500001, max:750000, rate:0.10 },
  { min:750001, max:1000000, rate:0.15 }, { min:1000001, max:1250000, rate:0.20 }, { min:1250001, max:1500000, rate:0.25 },
  { min:1500001, max:999999999, rate:0.30 },
];

// Slab-based income tax — slabs and cess rate loaded from DB, fallback to defaults.
const computeTaxAnnual = (annualTaxableIncome) => {
  const slabs    = getStat("tds_slab_json",  _DEFAULT_TDS_SLABS);
  const cessRate = parseFloat(getStat("tds_cess_rate", 0.04));
  let tax = 0;
  for (const slab of slabs) {
    if (annualTaxableIncome <= slab.min) break;
    tax += (Math.min(annualTaxableIncome, slab.max) - slab.min) * slab.rate;
  }
  return Math.round(tax * (1 + cessRate));
};

// Looks up the correct PT amount for a given gross monthly salary — slabs from DB.
const computePT = grossMonthly => {
  const slabs = getStat("pt_slab_json", _DEFAULT_PT_SLABS);
  return slabs.find(s => grossMonthly >= s.min && grossMonthly <= s.max)?.pt ?? 200;
};

// Only the CEO and HR team members can run payroll for other employees.
const canOperatePayroll    = user => user?.accessLevel >= 4 || user?.isHR === true;
const canOperateOwnPayroll = user => canOperatePayroll(user);
// Only Director (accessLevel ≥ 4) and HR Admin (isHR) can change payroll configuration / templates.
const canConfigurePayroll  = user => user?.accessLevel >= 4 || user?.isHR === true;
// Payroll figures are visible to the payroll operator OR the employee themselves.
const canViewPayrollOf     = (viewer, targetId) => canOperatePayroll(viewer) || canSeeSensitiveOf(viewer, targetId);
// A payslip PDF can only be downloaded once the salary has been processed (not while still Draft).
const isPayslipReleased    = data => !["Draft", "Current"].includes(data?.payrollStatus);

// Default salary structure percentages applied when no DB override exists.
// basic_pct / hra_pct are expressed as % of CTC; transport is a flat monthly amount (₹).
const DEFAULT_STRUCTURE = { basic_pct:50, hra_pct:45, lta_pct:0, transport:2333 };

// ── Core payroll computation ──────────────────────────────────────────────────
// Derives every earning and deduction line item from the employee's CTC
// and the HR-supplied inputs for the month (LOP days, overtime, overrides).
// Returns a rich object consumed by both the UI payslip view and PDF generator.
const calcPayroll = (emp, inputs = {}, customFields = [], structure = DEFAULT_STRUCTURE) => {
  // Clamp all numeric inputs to safe ranges before using them in calculations.
  const lopDays       = clampNum(inputs.lopDays, 0, 31);
  const overtimeHours = clampNum(inputs.overtimeHours, 0, 160);

  // "Override" fields let HR hard-code a statutory deduction instead of using the formula.
  // An empty string or null means "use the calculated value".
  const pfOverride  = inputs.pfOverride  === "" || inputs.pfOverride  == null ? null : clampNum(inputs.pfOverride,  0, 9999999);
  const esiOverride = inputs.esiOverride === "" || inputs.esiOverride == null ? null : clampNum(inputs.esiOverride, 0, 9999999);
  const ptOverride  = inputs.ptOverride  === "" || inputs.ptOverride  == null ? null : clampNum(inputs.ptOverride,  0, 9999999);
  const tdsOverride = inputs.tdsOverride === "" || inputs.tdsOverride == null ? null : clampNum(inputs.tdsOverride, 0, 9999999);

  // payrollMonth is supplied via inputs.month by callers (SalaryMod passes { month }).
  // Fallback to the current payroll month if not provided.
  const payrollMonth = inputs.month || CURRENT_PAYROLL_MONTH;
  const [monthName, year] = String(payrollMonth).split(" "); // e.g. "March 2025"
  const monthIndex = MONTH_NAMES.indexOf(monthName);  // MONTH_NAMES is already defined above
  // Working days (Mon–Fri), not calendar days — respects a manual "Total Work Days"
  // override from the Payroll Run form if one was explicitly set.
  const totalWorkDays = inputs.totalWorkDays ? clampNum(inputs.totalWorkDays, 1, 31) : countWorkingDaysInMonth(parseInt(year), monthIndex + 1);
  const payableDays = totalWorkDays - lopDays;
  // Convert annual CTC (in LPA) to a monthly rupee figure.
  const ctcMonthly = Math.round((emp.ctcLPA * 100000) / 12);

  // Merge the DB-loaded structure over the defaults for this calculation run.
  const s = { ...DEFAULT_STRUCTURE, ...structure };

  // Compute gross component breakdowns from the structure percentages.
  const basic            = Math.round(ctcMonthly * (s.basic_pct / 100));
  const hra              = Math.round(basic * (s.hra_pct / 100));
  const lta              = Math.round(ctcMonthly * (s.lta_pct / 100));
  const transport        = Math.round(s.transport);
  // Special Allowance absorbs any CTC remainder after named components.
  const specialAllowance = Math.max(0, ctcMonthly - basic - hra - lta - transport);

  // Pro-rata earnings based on actual payable days (full month minus LOP).
  const proRataFactor    = payableDays / totalWorkDays;
  const proRataBasic     = Math.round(basic * proRataFactor);
  const proRataHRA       = Math.round(hra * proRataFactor);
  const proRataLTA       = Math.round(lta * proRataFactor);
  // Transport is pro-rated only when there are LOP days; otherwise paid in full.
  const proRataTransport = lopDays > 0 ? Math.round(transport * proRataFactor) : transport;
  const proRataSpecial   = Math.round(specialAllowance * proRataFactor);

  // Overtime is paid at 2× the basic hourly rate (hourly = basic / 31 days / 8 hours).
  const hourlyRate  = Math.round(basic / (31 * 8));
  const overtimePay = Math.round(hourlyRate * overtimeHours * 2);
  // ── Custom earning fields ──
  const activeCustomEarnings = (customFields || []).filter(f => f.active && f.category === "earning").map(f => {
    let amount = 0;
    if (f.calcType === "fixed") amount = clampNum(inputs[`cf_${f.id}`] !== undefined && inputs[`cf_${f.id}`] !== "" ? inputs[`cf_${f.id}`] : f.value, 0, 9999999);
    else if (f.calcType === "pct_basic") amount = Math.round(proRataBasic * f.value / 100);
    else if (f.calcType === "pct_ctc")  amount = Math.round(ctcMonthly * proRataFactor * f.value / 100);
    return { label:f.name, amount, type:"custom", fieldId:f.id, calcType:f.calcType };
  });
  const customEarningsTotal = activeCustomEarnings.reduce((a, e) => a + e.amount, 0);
  const grossEarnings = proRataBasic + proRataHRA + proRataLTA + proRataTransport + proRataSpecial + overtimePay + customEarningsTotal;
  const pfCeiling   = parseFloat(getStat("pf_ceiling",       15000));
  const pfRateEmp   = parseFloat(getStat("pf_rate_employee", 0.12));
  const pfRateEr    = parseFloat(getStat("pf_rate_employer", 0.12));
  const esiLimit    = parseFloat(getStat("esi_gross_limit",  21000));
  const esiRateEmp  = parseFloat(getStat("esi_rate_employee",0.0075));
  const esiRateEr   = parseFloat(getStat("esi_rate_employer",0.0325));
  const pfBase = Math.min(proRataBasic, pfCeiling);
  const calculatedPFEmployee = Math.round(pfBase * pfRateEmp);
  const pfEmployee = pfOverride ?? calculatedPFEmployee;
  const pfEmployer = Math.round(pfBase * pfRateEr);
  const esiEligible = grossEarnings <= esiLimit;
  const calculatedESIEmployee = esiEligible ? Math.round(grossEarnings * esiRateEmp) : 0;
  const esiEmployee = esiOverride ?? calculatedESIEmployee;
  const esiEmployer = esiEligible ? Math.round(grossEarnings * esiRateEr) : 0;
  const professionalTax = ptOverride ?? computePT(grossEarnings);
  const limit80C           = parseFloat(getStat("tds_80c_limit",          150000));
  const standardDeduction  = parseFloat(getStat("tds_standard_deduction",   50000));
  const annualGross = grossEarnings * 12;
  const annual80C = Math.min(pfEmployee * 12, limit80C);
  const annualTaxableIncome = Math.max(0, annualGross - annual80C - standardDeduction);
  const annualTax = computeTaxAnnual(annualTaxableIncome);
  const tdsMonthly = tdsOverride ?? Math.round(annualTax / 12);
  const totalStatutoryDeductions = pfEmployee + esiEmployee + professionalTax + tdsMonthly;
  // ── Custom deduction fields (calculated after gross is known) ──
  const activeCustomDeductions = (customFields || []).filter(f => f.active && f.category === "deduction").map(f => {
    let amount = 0;
    if (f.calcType === "fixed")     amount = clampNum(inputs[`cf_${f.id}`] !== undefined && inputs[`cf_${f.id}`] !== "" ? inputs[`cf_${f.id}`] : f.value, 0, 9999999);
    else if (f.calcType === "pct_gross") amount = Math.round(grossEarnings * f.value / 100);
    return { label:f.name, amount, fieldId:f.id, calcType:f.calcType };
  });
  const customDeductionsTotal = activeCustomDeductions.reduce((a, d) => a + d.amount, 0);
  const totalVoluntaryDeductions = customDeductionsTotal;
  const totalDeductions = totalStatutoryDeductions + totalVoluntaryDeductions;
  const netPay = grossEarnings - totalDeductions;
  const monthNum = fiscalMonthNumber(payrollMonth);
  return {
    month:payrollMonth, employeeId:emp.id, employeeName:emp.name, designation:emp.role, department:emp.dept, pan:emp.pan, uan:emp.uan, pfAccount:emp.pfAccount,
    bank:emp.bank, accountNo:emp.accountNo, ifsc:emp.ifsc, joining:emp.joining, location:emp.loc, email:emp.email,
    gender:emp.gender||"", doj:emp.joining||"", monthNum,
    totalWorkDays, payableDays, lopDays, overtimeHours, hourlyRate, pfBase, grossEarnings,
    earnings:[
      { label:"Basic Salary",        ctcMaster:basic,             amount:proRataBasic,    type:"fixed" },
      { label:"HRA",                 ctcMaster:hra,               amount:proRataHRA,      type:"fixed" },
      ...(proRataLTA > 0 ? [{ label:"Leave Travel Allowance", ctcMaster:lta,       amount:proRataLTA,      type:"fixed" }] : []),
      { label:"Conveyance Allowance",ctcMaster:transport,         amount:proRataTransport,type:"fixed" },
      { label:"Special Allowance",   ctcMaster:specialAllowance,  amount:proRataSpecial,  type:"fixed" },
      ...(overtimePay > 0 ? [{ label:"Overtime Pay", ctcMaster:overtimePay, amount:overtimePay, type:"variable" }] : []),
      ...activeCustomEarnings.filter(e => e.amount > 0).map(e => ({ ...e, ctcMaster:e.amount })),
    ],
    statutory:[
      { label:`Provident Fund (${(pfRateEmp*100).toFixed(0)}%)`, amount:pfEmployee, code:"PF" },
      ...(esiEligible ? [{ label:`ESI (${(esiRateEmp*100).toFixed(2)}%)`, amount:esiEmployee, code:"ESI" }] : []),
      { label:"Professional Tax", amount:professionalTax, code:"PT" },
      { label:"Income Tax (TDS)", amount:tdsMonthly, code:"TDS" },
    ],
    voluntary:[
      ...activeCustomDeductions.filter(d => d.amount > 0),
    ],
    totalStatutoryDeductions, totalVoluntaryDeductions, totalDeductions, netPay, pfEmployer, esiEmployer,
    ctcActual:grossEarnings + pfEmployer + esiEmployer, annualGross, annual80C, annualTaxableIncome, annualTax, tdsMonthly, esiEligible,
    payDate:inputs.payDate || defaultPayDateForMonth(payrollMonth), paymentMode:inputs.paymentMode || "", payrollStatus:inputs.payrollStatus || "Draft",
    taxRegime:inputs.taxRegime || "New Regime", salaryHold:Boolean(inputs.salaryHold), remarks:inputs.remarks || "",
    overrides:{ pf:pfOverride, esi:esiOverride, pt:ptOverride, tds:tdsOverride },
    ytd:{ gross:grossEarnings * monthNum, tax:tdsMonthly * monthNum, pf:pfEmployee * monthNum, net:netPay * monthNum },
  };
};

// ── Payslip HTML document (used for both print/download and email) ─────────────
// Generates a self-contained HTML document that renders the payslip in the
// appointment-letter format. Opens in a new tab; the user clicks "Save as PDF".
const payslipHTMLDoc = (data) => {
  const fmt = n => `₹${Math.round(Math.abs(n || 0)).toLocaleString("en-IN")}`;
  const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const logoURL = window.location.origin + "/doloxe-logo.png";

  const earningRows = data.earnings.map(r => `
    <tr>
      <td class="comp">${esc(r.label)}</td>
      <td class="amt">${fmt(r.amount)}</td>
    </tr>`).join("");

  const deductRows = [...data.statutory, ...data.voluntary].map(r => `
    <tr>
      <td class="comp">${esc(r.label)}</td>
      <td class="amt">${fmt(r.amount)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8">
<title>Pay Slip – ${esc(data.month)} – ${esc(data.employeeName)}</title>
<style>
@page{margin:10mm;size:A4 portrait}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,'Helvetica Neue',sans-serif;font-size:9.5pt;color:#111827;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hdr{background:#0D0D0E;color:#fff;padding:12px 18px;display:flex;align-items:center;justify-content:space-between}
.hdr-left{display:flex;align-items:center;gap:12px}
.co-name{font-size:13pt;font-weight:900;line-height:1.2}
.co-cin{font-size:7.5pt;color:#9CA3AF;margin-top:2px}
.hdr-right{text-align:right}
.slip-lbl{font-size:7pt;color:#9CA3AF;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
.slip-month{font-size:13pt;font-weight:900}
/* Employee info */
.emp-info{padding:10px 18px;background:#F9FAFB;border-bottom:2px solid #111827;display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
.emp-main{}
.emp-name{font-size:13pt;font-weight:900;color:#111827;line-height:1.2}
.emp-sub{font-size:8.5pt;color:#6B7280;margin-top:3px}
.emp-meta{display:flex;gap:20px;margin-top:6px;flex-wrap:wrap}
.emp-kv{font-size:8pt;color:#374151}
.emp-kv b{color:#111827;font-weight:700}
.emp-right{text-align:right;font-size:8.5pt;color:#374151;white-space:nowrap}
.emp-right b{color:#111827;font-weight:700}
/* Employee detail grid */
.emp-grid{width:100%;border-collapse:collapse;border-bottom:2px solid #111827}
.emp-grid td{padding:4px 10px;font-size:8pt;border:1px solid #E5E7EB;vertical-align:top}
.il{color:#6B7280;font-weight:700;width:130px;background:#F9FAFB;white-space:nowrap}
.iv{color:#111827;font-weight:600}
/* Compensation table */
table.sal{width:100%;border-collapse:collapse}
table.sal thead th{font-size:8pt;font-weight:700;color:#6B7280;padding:6px 10px;border-bottom:2px solid #111827;background:#F9FAFB;text-transform:uppercase;letter-spacing:0.3px}
table.sal thead th:not(:first-child){text-align:right}
.sec-hdr td{font-size:7.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;padding:4px 10px;border-top:1px solid #E5E7EB}
.sec-earn td{background:#ECFDF5;color:#059669}
.sec-ded  td{background:#FEF2F2;color:#DC2626}
td.comp{padding:5px 10px;font-size:9pt;color:#374151;border-bottom:1px dashed #E5E7EB}
td.amt{padding:5px 10px;text-align:right;font-size:9pt;font-weight:500;border-bottom:1px dashed #E5E7EB;white-space:nowrap}
.tot-earn td{font-weight:700;font-size:10pt;background:#ECFDF5;color:#065F46;padding:6px 10px;border-top:2px solid #D1FAE5}
.tot-earn td:not(:first-child){text-align:right}
.tot-ded  td{font-weight:700;font-size:10pt;background:#FEF2F2;color:#991B1B;padding:6px 10px;border-top:2px solid #FECACA}
.tot-ded  td:not(:first-child){text-align:right}
/* Net band */
.net-band{background:#0D0D0E;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center}
.net-lbl{font-size:7pt;color:#9CA3AF;font-weight:700;letter-spacing:1px;margin-bottom:3px}
.net-month{font-size:19pt;font-weight:900}
/* Info row (Pay Date / Mode / Status) */
.info-row{display:flex;border-bottom:1px solid #E5E7EB}
.info-cell{flex:1;padding:7px 12px;border-right:1px solid #E5E7EB}
.info-cell:last-child{border-right:none}
.info-lbl{font-size:7pt;color:#9CA3AF;font-weight:700;text-transform:uppercase;margin-bottom:2px;letter-spacing:0.5px}
.info-val{font-size:9.5pt;font-weight:700}
.footer{padding:8px 18px;font-size:7.5pt;color:#9CA3AF;text-align:center;border-top:1px solid #E5E7EB}
</style>
</head><body>

<div class="hdr">
  <div class="hdr-left">
    <img src="${logoURL}" alt="DOLOXE" style="height:44px;object-fit:contain;display:block" onerror="this.style.display='none'">
    <div>
      <div class="co-name">Doloxe India Private Limited</div>
      <div class="co-cin">CIN: U72900TG2021PTC149118 &nbsp;|&nbsp; Pay Slip for the Month of ${esc(data.month)}</div>
    </div>
  </div>
  <div class="hdr-right">
    <div class="slip-lbl">PAY SLIP</div>
    <div class="slip-month">${esc(data.month)}</div>
  </div>
</div>

<div class="emp-info">
  <div class="emp-main">
    <div class="emp-name">${esc(data.employeeName)}</div>
    <div class="emp-sub">${esc(data.employeeId)} &nbsp;·&nbsp; ${esc(data.designation)} &nbsp;·&nbsp; ${esc(data.department)}</div>
    <div class="emp-meta">
      <span class="emp-kv"><b>PAN:</b> ${esc(data.pan||"—")}</span>
      <span class="emp-kv"><b>UAN:</b> ${esc(data.uan||"—")}</span>
      <span class="emp-kv"><b>PF A/c:</b> ${esc(data.pfAccount||"—")}</span>
      <span class="emp-kv"><b>Bank:</b> ${esc(data.bank||"—")} &nbsp;A/c: ${esc(data.accountNo||"—")}</span>
      <span class="emp-kv"><b>IFSC:</b> ${esc(data.ifsc||"—")}</span>
      <span class="emp-kv"><b>Location:</b> ${esc(data.location||"—")}</span>
    </div>
  </div>
  <div class="emp-right">
    <div><b>Pay Date:</b> ${esc(data.payDate)}</div>
    <div style="margin-top:4px"><b>Days Paid:</b> ${data.payableDays} of ${data.totalWorkDays}</div>
    <div style="margin-top:4px"><b>LOP:</b> ${data.lopDays} &nbsp;&nbsp; <b>DOJ:</b> ${esc(data.doj||data.joining||"—")}</div>
    <div style="margin-top:4px"><b>Gender:</b> ${esc(data.gender||"—")}</div>
  </div>
</div>

<div style="padding:8px 18px 4px;font-size:8pt;font-weight:700;letter-spacing:0.5px;color:#374151;text-transform:uppercase;background:#fff;border-bottom:1px solid #E5E7EB">Compensation Schedule</div>

<table class="sal">
  <thead>
    <tr>
      <th style="text-align:left;width:70%">Component</th>
      <th style="width:30%">Amount (₹)</th>
    </tr>
  </thead>
  <tbody>
    <tr class="sec-hdr sec-earn"><td colspan="2">Earnings</td></tr>
    ${earningRows}
    <tr class="tot-earn">
      <td>Gross Earnings</td>
      <td>${fmt(data.grossEarnings)}</td>
    </tr>
    <tr class="sec-hdr sec-ded"><td colspan="2">Deductions</td></tr>
    ${deductRows}
    <tr class="tot-ded">
      <td>Total Deductions</td>
      <td>${fmt(data.totalDeductions)}</td>
    </tr>
  </tbody>
</table>

<div class="net-band">
  <div>
    <div class="net-lbl">NET TAKE-HOME</div>
    <div class="net-month">${fmt(data.netPay)} <span style="font-size:10pt;font-weight:400;color:#9CA3AF">/ month</span></div>
  </div>
</div>

<div class="info-row">
  ${[["Pay Date",data.payDate],["Payment Mode",data.paymentMode||"Bank Transfer"],["Status",data.payrollStatus]].map(([l,v])=>
    `<div class="info-cell"><div class="info-lbl">${l}</div><div class="info-val">${esc(String(v))}</div></div>`).join("")}
</div>

<div class="footer">This is a system-generated payslip and does not require a signature. &nbsp;|&nbsp; For queries, contact DOLOXE Finance Operations.</div>
</body></html>`;
};

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
          <div style="font-size:12px;color:#6b7280;margin-top:20px">A PDF copy of this payslip is attached. This is a system-generated payslip and does not require a signature.</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

// ─── SALARY / PAYROLL MODULE ──────────────────────────────────────────────────
// SalaryMod wraps: (1) run payroll for current month, (2) view/download past
// payslips, (3) configure salary structure %, (4) manage custom earning/deduction
// fields. Only canOperatePayroll users can run team payroll; others see only self.
const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Normalises a DB row (snake_case columns) into the frontend camelCase shape
// used by calcPayroll and the Configure UI.
const dbFieldToFrontend = (f) => ({
  id: String(f.id),
  name: f.name,
  category: f.category,
  calcType: f.calc_type,
  value: parseFloat(f.value),
  active: Boolean(f.active),
  createdBy: f.created_by || "",
  createdAt: f.created_at || "",
});

const SalaryMod = ({ currentUser, deepLink }) => {
  const canRunTeamPayroll = canOperatePayroll(currentUser);
  const canRunOwnPayroll = canRunTeamPayroll || canOperateOwnPayroll(currentUser);
  const scopedEmps = canRunTeamPayroll ? ALL_USERS : [currentUser];
  const [tab, setTab] = useUrlTab(canRunOwnPayroll ? "run" : "slip", deepLink);
  // ── Salary structure — seeded from app-level load, refreshable via Configure tab ──
  const [structure, setStructure] = useState(() => APP_STRUCTURE || DEFAULT_STRUCTURE);
  const [structureEdit, setStructureEdit] = useState({});
  const [structureSaving, setStructureSaving] = useState(false);

  // ── Custom fields — seeded from app-level load, refreshable via Configure tab ──
  const [customFields, setCustomFields] = useState(() => APP_CUSTOM_FIELDS);
  const [cfForm, setCfForm] = useState(null);
  const [cfFormData, setCfFormData] = useState({ name:"", category:"earning", calcType:"fixed", value:0, active:true });

  // ── Statutory deduction config (PF/ESI/PT/TDS) ──
  const [statCfg, setStatCfg] = useState(() => APP_STATUTORY_CFG);
  const [statEdit, setStatEdit] = useState({});
  const [statSaving, setStatSaving] = useState(false);

  const saveStatField = async (configKey, rawValue) => {
    setStatSaving(true);
    try {
      await apiFetch(`${API_URL}/api/payroll/statutory-config/${configKey}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ value:String(rawValue), updatedBy:currentUser.id }),
      });
      // Parse for the local state the same way AppBootstrap does
      let parsed;
      try { parsed = JSON.parse(rawValue); } catch { parsed = rawValue; }
      const updated = { ...(APP_STATUTORY_CFG || {}), [configKey]: parsed };
      APP_STATUTORY_CFG = updated;
      window.__HR_APP_STATUTORY_CFG__ = updated;
      setStatCfg({ ...updated });
      setStatEdit(p => { const n={...p}; delete n[configKey]; return n; });
    } finally { setStatSaving(false); }
  };

  const saveStructureField = async (key, value) => {
    setStructureSaving(true);
    try {
      await apiFetch(`${API}/api/payroll/structure/${key}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ value:parseFloat(value), updatedBy:currentUser.id }),
      });
      const updated = { ...(APP_STRUCTURE || DEFAULT_STRUCTURE), [key]:parseFloat(value) };
      setStructure(updated);
    } catch {
      // ignore save errors for now
    } finally { setStructureSaving(false); }
  };
  const [selId, setSelId] = useState(currentUser.id);
  const [month, setMonth] = useState(CURRENT_PAYROLL_MONTH);
  const BLANK_INPUTS = {
    pfOverride:"", esiOverride:"", ptOverride:"", tdsOverride:"",
    payDate:defaultPayDateForMonth(CURRENT_PAYROLL_MONTH),
    totalWorkDays:defaultTotalWorkDaysForMonth(CURRENT_PAYROLL_MONTH), paymentMode:"",
    payrollStatus:"Draft", taxRegime:"New Regime", salaryHold:false, remarks:"",
  };
  const [inputs, setInputs] = useState(BLANK_INPUTS);
  const [slip, setSlip] = useState(() => calcPayroll(currentUser, { month }, customFields, structure));
  const [bulk, setBulk] = useState([]);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("All");
  const [archiveYear, setArchiveYear] = useState(String(parsePayrollMonth(month).year));
  const [emailModal, setEmailModal] = useState(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  // Manually-set pay dates, persisted server-side (one per month, shared across every
  // employee/session) — map of month label ("May 2026") → "YYYY-MM-DD". Falls back to
  // defaultPayDateForMonth() for any month that hasn't had a custom date saved yet.
  const [payrollRuns, setPayrollRuns] = useState({});
  useEffect(() => {
    apiFetch(`${API}/api/payroll/runs`)
      .then(r => r.json())
      .then(({ payrollRuns: rows }) => {
        const map = {};
        (rows || []).forEach(r => { if (r.payroll_month && r.pay_date) map[monthLabelFromISODate(r.payroll_month)] = r.pay_date; });
        setPayrollRuns(map);
        if (map[month]) setInputs(p => ({ ...p, payDate:map[month] }));
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const emp = scopedEmps.find(e => e.id === selId) || currentUser;
  const preview = calcPayroll(emp, { ...inputs, month }, customFields, structure);
  const canSeeSalary = canViewPayrollOf(currentUser, emp.id);
  const canEditPayroll = canRunOwnPayroll;
  const archiveYears = [...new Set(PAYROLL_MONTHS.map(m => String(parsePayrollMonth(m).year)))];
  const archiveMonths = PAYROLL_MONTHS.filter(m => String(parsePayrollMonth(m).year) === archiveYear);
  const payrollHistory = payrollHistoryForMonths(PAYROLL_MONTHS.slice(0, 18), payrollRuns);
  const input = (key, min = 0, max = 999999) => ({
    value:inputs[key],
    disabled:!canEditPayroll,
    onFocus:e => e.target.select(),
    onChange:e => {
      const raw = e.target.value;
      // allow empty string while user is typing so backspace works naturally
      setInputs(p => ({ ...p, [key]: raw === "" ? "" : clampNum(raw, min, max) }));
    },
    onBlur:e => {
      // once user leaves the field, snap empty back to min (usually 0)
      if(e.target.value === "" || isNaN(Number(e.target.value)))
        setInputs(p => ({ ...p, [key]: min }));
    },
  });
  const textInput = key => ({
    value:inputs[key],
    disabled:!canEditPayroll,
    onChange:e => setInputs(p => ({ ...p, [key]:e.target.value })),
  });
  const setSlipFor = (employee, customInputs = {}) => {
    const mergedInputs = { ...inputs, ...customInputs };
    const data = calcPayroll(employee, { ...mergedInputs, month }, customFields, structure);
    setSlip(data);
    setTab("slip");
    // Save line items to DB
    const lines = [
      ...data.earnings.map(e => ({ line_type:"earning", label:e.label, amount:e.amount, field_config_id:e.fieldId ? parseInt(e.fieldId.replace("cf_",""))||null : null, is_custom:e.type==="custom" })),
      ...data.statutory.map(s => ({ line_type:"deduction", label:s.label, amount:s.amount, field_config_id:null, is_custom:false })),
      ...data.voluntary.map(v => ({ line_type:"deduction", label:v.label, amount:v.amount, field_config_id:v.fieldId ? parseInt(v.fieldId.replace("cf_",""))||null : null, is_custom:!!v.fieldId })),
    ];
    apiFetch(`${API}/api/payroll/payslip-lines`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ employeeId:employee.id, payrollMonth:month, lines }),
    }).catch(()=>{});
    // Persist this month's pay date so it's the same for every employee/session that
    // views this payslip later — not just the local form state of whoever generated it.
    if (mergedInputs.payDate) {
      apiFetch(`${API}/api/payroll/runs/${encodeURIComponent(month)}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ payDate:mergedInputs.payDate, processedBy:currentUser.id }),
      }).catch(()=>{});
      setPayrollRuns(p => ({ ...p, [month]:mergedInputs.payDate }));
    }
  };
  const selectPayslipMonth = (nextMonth, employee = ALL_USERS.find(e => e.id === slip.employeeId) || emp) => {
    const nextPayDate = payrollRuns[nextMonth] || defaultPayDateForMonth(nextMonth);
    const nextTotalWorkDays = defaultTotalWorkDaysForMonth(nextMonth);
    setMonth(nextMonth);
    setArchiveYear(String(parsePayrollMonth(nextMonth).year));
    setInputs(p => ({ ...p, payDate:nextPayDate, totalWorkDays:nextTotalWorkDays }));
    setSlip(calcPayroll(employee, {
      ...inputs,
      month:nextMonth,
      payDate:nextPayDate,
      totalWorkDays:nextTotalWorkDays,
      payrollStatus:nextMonth === PAYROLL_MONTHS[0] ? "Current" : "Paid",
    }, customFields, structure));
  };
  const downloadPayslip = async (data) => {
    const htmlStr = payslipHTMLDoc(data);
    const parsed = new DOMParser().parseFromString(htmlStr, "text/html");
    parsed.querySelector(".print-bar")?.remove();

    const styleEl = document.createElement("style");
    styleEl.textContent = parsed.querySelector("style")?.textContent || "";
    document.head.appendChild(styleEl);

    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#fff;";
    wrapper.innerHTML = parsed.body.innerHTML;
    document.body.appendChild(wrapper);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true, backgroundColor: "#fff", logging: false });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      const pageH = pdf.internal.pageSize.getHeight();
      if (pdfH <= pageH) {
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pdfW, pdfH);
      } else {
        let y = 0;
        while (y < pdfH) {
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, -y, pdfW, pdfH);
          y += pageH;
          if (y < pdfH) pdf.addPage();
        }
      }
      pdf.save(`Payslip_${data.employeeId}_${data.month.replaceAll(" ", "_")}.pdf`);
    } finally {
      document.body.removeChild(wrapper);
      document.head.removeChild(styleEl);
    }
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
      const htmlBody = payslipEmailHtml(emailModal);
      const res = await apiFetch(endpoint, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ to:emailTo, subject, body, htmlBody }),
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
      setBulk(scopedEmps.map(e => calcPayroll(e, { month, totalWorkDays:inputs.totalWorkDays, payDate:inputs.payDate, paymentMode:inputs.paymentMode, payrollStatus:"Processed", taxRegime:inputs.taxRegime }, customFields, structure)));
      setBulkRunning(false);
    }, 700);
  };
  const payrollStats = canRunTeamPayroll ? [
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month },customFields,structure).grossEarnings,0)), l:"Gross Payroll", s:`${scopedEmps.length} employees`, c:"#1B45F5" },
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month },customFields,structure).netPay,0)), l:"Net Payroll", s:"Projected credits", c:"#0F8C5A" },
    { v:money(scopedEmps.reduce((a,e)=>a + calcPayroll(e,{ month },customFields,structure).totalDeductions,0)), l:"Deductions", s:"PF, ESI, PT, TDS", c:"#C8312A" },
    { v:"30 May", l:"Credit Date", s:month, c:"#5C35C2" },
  ] : [
    { v:money(preview.grossEarnings), l:"Gross Salary", s:month, c:"#1B45F5" },
    { v:money(preview.totalDeductions), l:"Deductions", s:"PF, PT, TDS", c:"#C8312A" },
    { v:money(preview.netPay), l:"Net Pay", s:"Estimated credit", c:"#0F8C5A" },
    { v:`₹${currentUser.ctcLPA}L`, l:"Annual CTC", s:"Gross package", c:"#5C35C2" },
  ];
  const departments = ["All", ...new Set(scopedEmps.map(e => e.dept))];

  const renderPayslipCard = (data) => {
    const owner   = ALL_USERS.find(e => e.id === data.employeeId) || emp;
    const allowed = canViewPayrollOf(currentUser, owner.id);
    const released= isPayslipReleased(data);

    const ColHead = ({ label, right }) => (
      <th style={{ padding:"6px 10px", fontSize:10.5, fontWeight:700, color:"var(--ink4)", textAlign: right ? "right" : "left", borderBottom:"2px solid var(--ink)", background:"var(--raised)", whiteSpace:"nowrap" }}>{label}</th>
    );

    return (
      <div style={{ maxWidth:760, margin:"0 auto", background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r12)", overflow:"hidden" }}>
        {/* Header */}
        <div className="slip-h">
          <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
            <div>
              <div style={{ fontFamily:"var(--display)", fontSize:17, fontWeight:800 }}>Doloxe India Private Limited</div>
              <div style={{ fontSize:11, opacity:0.55 }}>CIN: U72900TG2021PTC149118</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, opacity:0.5, fontWeight:700, letterSpacing:1 }}>PAY SLIP</div>
              <div style={{ fontWeight:800, fontSize:15 }}>{data.month}</div>
            </div>
          </div>
        </div>

        {/* Employee info */}
        <div style={{ padding:"12px 20px", background:"var(--raised)", borderBottom:"1px solid var(--brd)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{data.employeeName}</div>
              <div style={{ fontSize:11.5, color:"var(--ink3)", marginTop:2 }}>{data.employeeId} · {data.designation} · {data.department}</div>
            </div>
            <div style={{ textAlign:"right", fontSize:11.5, color:"var(--ink3)" }}>
              <div><span style={{ fontWeight:600 }}>Pay Date:</span> {data.payDate}</div>
              <div><span style={{ fontWeight:600 }}>Days:</span> {data.payableDays} &nbsp;·&nbsp; <span style={{ fontWeight:600 }}>LOP:</span> {data.lopDays}</div>
            </div>
          </div>
          <div style={{ marginTop:6, display:"flex", gap:16, flexWrap:"wrap", fontSize:11, color:"var(--ink4)" }}>
            {[["PAN", data.pan], ["UAN", data.uan], ["Bank", data.bank], ["A/c", data.accountNo], ["IFSC", data.ifsc]].map(([k, v]) =>
              <span key={k}><b style={{ color:"var(--ink3)" }}>{k}:</b> {allowed ? v : "••••••"}</span>
            )}
          </div>
        </div>

        {/* Payroll status notice for unreleased slips */}
        {!released && (
          <div style={{ padding:"10px 20px", background:"var(--amber-soft)", borderBottom:"1px solid rgba(176,96,16,0.2)", display:"flex", alignItems:"center", gap:8 }}>
            <Icon n="info" s={14} style={{ color:"var(--amber)" }}/>
            <span style={{ fontSize:12, color:"var(--amber)", fontWeight:600 }}>Payslip is in <b>{data.payrollStatus}</b> state. PDF download will be available once salary is marked <b>Processed</b>.</span>
          </div>
        )}

        {allowed ? (
          <>
            {/* Compensation Schedule table */}
            <div style={{ padding:"14px 20px 0", marginBottom:0 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:0.5, color:"var(--ink3)", marginBottom:10, textTransform:"uppercase" }}>Compensation Schedule</div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      <ColHead label="Component"/>
                      <ColHead label="Amount (₹)" right/>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Earnings */}
                    <tr><td colSpan={2} style={{ padding:"8px 14px 4px", fontSize:10.5, fontWeight:700, color:"var(--green)", letterSpacing:0.5, background:"var(--green-soft)", borderTop:"1px solid var(--brd)" }}>EARNINGS</td></tr>
                    {data.earnings.map(r => (
                      <tr key={r.label} style={{ borderBottom:"1px dashed var(--brd)" }}>
                        <td style={{ padding:"5px 10px 5px 14px", fontSize:12.5, color:"var(--ink2)" }}>{r.label}</td>
                        <td style={{ padding:"5px 10px", fontSize:12.5, textAlign:"right", fontWeight:500, color:"var(--ink)" }}>{money(r.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ background:"var(--green-soft)" }}>
                      <td style={{ padding:"6px 10px 6px 14px", fontSize:12.5, fontWeight:700, color:"var(--green)" }}>Gross Earnings</td>
                      <td style={{ padding:"6px 10px", fontSize:12.5, fontWeight:700, textAlign:"right", color:"var(--green)" }}>{money(data.grossEarnings)}</td>
                    </tr>

                    {/* Deductions */}
                    <tr><td colSpan={2} style={{ padding:"8px 14px 4px", fontSize:10.5, fontWeight:700, color:"var(--red)", letterSpacing:0.5, background:"var(--red-soft)", borderTop:"1px solid var(--brd)" }}>DEDUCTIONS</td></tr>
                    {[...data.statutory, ...data.voluntary].map(r => (
                      <tr key={r.label} style={{ borderBottom:"1px dashed var(--brd)" }}>
                        <td style={{ padding:"5px 10px 5px 14px", fontSize:12.5, color:"var(--ink2)" }}>{r.label}</td>
                        <td style={{ padding:"5px 10px", fontSize:12.5, textAlign:"right", fontWeight:500, color:"var(--ink)" }}>{money(r.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ background:"var(--red-soft)" }}>
                      <td style={{ padding:"6px 10px 6px 14px", fontSize:12.5, fontWeight:700, color:"var(--red)" }}>Total Deductions</td>
                      <td style={{ padding:"6px 10px", fontSize:12.5, fontWeight:700, textAlign:"right", color:"var(--red)" }}>{money(data.totalDeductions)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Net Take-Home band */}
            <div style={{ margin:"0", padding:"14px 20px", background:"var(--ink2)" }}>
              <div style={{ fontSize:10, color:"#9CA3AF", fontWeight:700, letterSpacing:1, marginBottom:4 }}>NET TAKE-HOME</div>
              <div style={{ fontSize:24, fontWeight:800, color:"#FFFFFF" }}>{money(data.netPay)} <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:400 }}>/ month</span></div>
            </div>

            {/* Payment & Status info */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", borderTop:"1px solid var(--brd)", borderBottom:"1px solid var(--brd)" }}>
              {[["Pay Date", data.payDate], ["Payment Mode", data.paymentMode || "—"], ["Status", data.payrollStatus]].map(([l, v], i) => (
                <div key={l} style={{ padding:"10px 14px", borderRight: i < 2 ? "1px solid var(--brd)" : "none" }}>
                  <div className="if-l">{l}</div>
                  <div style={{ fontWeight:700, fontSize:12.5 }}>{v}</div>
                </div>
              ))}
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
        <select className="fsel" style={{ width:180, alignSelf:"center" }} value={month} onChange={e=>selectPayslipMonth(e.target.value)}>
          {PAYROLL_MONTHS.map(m=><option key={m}>{m}</option>)}
        </select>
      </div>
      <div className="tabs">{(
        canRunTeamPayroll
          ? (canConfigurePayroll(currentUser)
              ? ["run","slip","bulk","history","configure"]
              : ["run","slip","bulk","history"])
          : canRunOwnPayroll
            ? ["run","slip"]
            : ["slip"]
      ).map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="run"?"Payroll Run":t==="slip"?"Pay Slip":t==="bulk"?"Bulk Process":t==="configure"?"⚙ Configure":"History"}</div>)}</div>
      <div className="sg">{payrollStats.map((s,i)=><div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10, fontSize:20 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>)}</div>

      {tab==="run"&&(
        <div className="g2" style={{ alignItems:"start" }}>
          <div className="card" style={{ marginBottom:0 }}>
            <div className="ch"><div className="ct"><Icon n="user" s={14}/>{canRunTeamPayroll ? "Employee Selection" : "Employee"}</div></div>
            <div style={{ padding:0, maxHeight:470, overflowY:"auto",overscrollBehavior:"none" }}>
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
              {customFields.filter(f=>f.active).length > 0 ? (
                <>
                  <div className="flbl" style={{ marginBottom:8 }}>Custom Fields</div>
                  <div className="fg" style={{ marginBottom:14 }}>
                    {customFields.filter(f=>f.active).map(f => (
                      <div key={f.id} className="fgrp">
                        <div className="flbl" style={{ display:"flex", justifyContent:"space-between" }}>
                          <span>{f.name}</span>
                          <span className={`bdg ${f.category==="earning"?"bdg-g":"bdg-r"}`} style={{ fontSize:9 }}>{f.category==="earning"?"Earning":"Deduction"}</span>
                        </div>
                        {f.calcType === "fixed"
                          ? <input className="finp" type="number" min="0" disabled={!canEditPayroll}
                              value={inputs[`cf_${f.id}`] !== undefined ? inputs[`cf_${f.id}`] : f.value}
                              onFocus={e=>e.target.select()}
                              onChange={e=>{ const raw=e.target.value; setInputs(p=>({...p,[`cf_${f.id}`]:raw===""?"":clampNum(raw,0,9999999)})); }}
                              onBlur={e=>{ if(e.target.value===""||isNaN(Number(e.target.value))) setInputs(p=>({...p,[`cf_${f.id}`]:0})); }}/>
                          : <input className="finp" readOnly value={
                              f.calcType==="pct_basic" ? `Auto: ${f.value}% of Basic`
                              : f.calcType==="pct_ctc" ? `Auto: ${f.value}% of CTC`
                              : `Auto: ${f.value}% of Gross`}/>
                        }
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(27,69,245,0.15)", borderRadius:"var(--r8)", padding:"10px 14px", fontSize:12, color:"var(--accent)", marginBottom:14 }}>
                  No custom fields yet. Go to <strong>⚙ Configure</strong> tab to add earnings or deductions.
                </div>
              )}
              <div className="flbl" style={{ marginBottom:8 }}>Statutory Overrides</div>
              <div className="fg" style={{ marginBottom:14 }}>
                <div className="fgrp"><div className="flbl">PF Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("pfOverride")}/></div>
                <div className="fgrp"><div className="flbl">ESI Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("esiOverride")}/></div>
                <div className="fgrp"><div className="flbl">PT Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("ptOverride")}/></div>
                <div className="fgrp"><div className="flbl">TDS Override</div><input className="finp" type="number" min="0" placeholder="Auto" {...input("tdsOverride")}/></div>
              </div>
              <div style={{ background:"var(--raised)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:12, marginBottom:14 }}>
                <div className="flbl" style={{ marginBottom:8 }}>Live Preview</div>
                {canSeeSalary ? <div className="g5">{[["Gross",preview.grossEarnings,"var(--green)"],["PF",preview.statutory.find(s=>s.code==="PF")?.amount || 0,"var(--purple)"],["TDS",preview.tdsMonthly,"var(--amber)"],["Deductions",preview.totalDeductions,"var(--red)"],["Net Pay",preview.netPay,"var(--accent)"]].map(([l,v,c])=><div key={l} style={{ background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r8)", padding:"9px 6px", textAlign:"center" }}><div style={{ fontWeight:800, color:c, fontSize:13 }}>{money(v)}</div><div className="t3" style={{ fontSize:10.5 }}>{l}</div></div>)}</div> : <div className="t3" style={{ textAlign:"center", padding:12 }}>Salary preview is confidential.</div>}
                {canSeeSalary && !preview.esiEligible && <div style={{ marginTop:8, fontSize:11, color:"var(--accent)" }}>ESI is not applicable because gross salary exceeds ₹{(getStat("esi_gross_limit",21000)).toLocaleString("en-IN")}/month.</div>}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-p" disabled={!canEditPayroll} onClick={()=>setSlipFor(emp)}><Icon n="calc" s={13}/>Calculate & Generate Payslip</button>
                <button className="btn" disabled={!canEditPayroll} onClick={()=>setInputs(BLANK_INPUTS)}>Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="slip"&&(
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:10, marginBottom:12 }}>
            <div><div className="fw7" style={{ fontFamily:"var(--display)", fontSize:16 }}>{slip.employeeName}</div><div className="t3 tsm">{slip.month} payslip</div></div>
            <div style={{ display:"flex", gap:7, alignItems:"center" }}>
              {isPayslipReleased(slip)
                ? <button className="btn" onClick={()=>downloadPayslip(slip)}><Icon n="dl" s={13}/>Download PDF</button>
                : <span style={{ fontSize:11.5, color:"var(--amber)", background:"var(--amber-soft)", border:"1px solid rgba(176,96,16,0.2)", borderRadius:"var(--r6)", padding:"5px 10px" }}>
                    PDF available once <b>Processed</b>
                  </span>
              }
              <button className="btn btn-p" onClick={()=>{ setEmailModal(slip); setEmailTo(slip.email); setEmailStatus(""); }}><Icon n="mail" s={13}/>Send Email</button>
            </div>
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
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8 }}>
                {archiveMonths.map(m => {
                  const isActive = slip.month === m;
                  const sample = calcPayroll(ALL_USERS.find(e => e.id === slip.employeeId) || emp, { month:m, payDate:payrollRuns[m] || defaultPayDateForMonth(m), payrollStatus:m === PAYROLL_MONTHS[0] ? "Current" : "Paid" }, customFields, structure);
                  return (
                    <button key={m} className={`btn${isActive ? " btn-p" : ""}`} style={{ flexDirection:"column", alignItems:"flex-start", gap:3, padding:"9px 12px" }} onClick={()=>selectPayslipMonth(m)}>
                      <span>{m}</span>
                      <span style={{ fontFamily:"var(--mono)", fontSize:11, opacity:isActive ? 0.9 : 0.7 }}>{money(sample.netPay)}</span>
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
            {bulk.length === 0 ? <div className="cb t3">Run payroll to generate the monthly payroll register for {scopedEmps.length} employees.</div> : <div className="tw"><table><thead><tr>{["Employee","Dept","Gross","PF","ESI","PT","TDS","Deductions","Net Pay","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{bulk.map(r=>{ const owner=ALL_USERS.find(e=>e.id===r.employeeId); const allowed=canViewPayrollOf(currentUser,r.employeeId); return <tr key={r.employeeId}><td><div style={{ display:"flex", alignItems:"center", gap:8 }}><div className="avt" style={{ width:26, height:26, background:owner.color }}>{owner.firstName[0]}{owner.lastName[0]}</div><div><div className="fw7">{owner.name}</div><div className="t3 tsm">{r.employeeId}</div></div></div></td><td><span className="bdg bdg-b">{r.department}</span></td>{allowed ? <><td className="fw6" style={{ color:"var(--green)" }}>{money(r.grossEarnings)}</td><td>{money(r.statutory.find(s=>s.code==="PF")?.amount || 0)}</td><td>{r.esiEligible ? money(r.statutory.find(s=>s.code==="ESI")?.amount || 0) : "N/A"}</td><td>{money(r.statutory.find(s=>s.code==="PT")?.amount || 0)}</td><td style={{ color:"var(--amber)" }}>{money(r.tdsMonthly)}</td><td style={{ color:"var(--red)" }}>{money(r.totalDeductions)}</td><td className="fw7" style={{ color:"var(--accent)" }}>{money(r.netPay)}</td></> : <td colSpan="7" className="t3">Confidential</td>}<td><div style={{ display:"flex", gap:4 }}><button className="btn btn-sm" onClick={()=>{ setSlip(r); setTab("slip"); }}><Icon n="eye" s={12}/></button>{allowed&&isPayslipReleased(r)&&<button className="btn btn-sm" onClick={()=>downloadPayslip(r)}><Icon n="dl" s={12}/></button>}</div></td></tr>; })}</tbody></table></div>}
          </div>
          {bulk.length > 0&&<div className="g3" style={{ gap:14 }}>{[["PF Challan",bulk.reduce((a,r)=>a+(r.statutory.find(s=>s.code==="PF")?.amount || 0)+r.pfEmployer,0),"var(--purple)"],["ESI Challan",bulk.reduce((a,r)=>a+(r.statutory.find(s=>s.code==="ESI")?.amount || 0)+r.esiEmployer,0),"var(--teal)"],["TDS + PT",bulk.reduce((a,r)=>a+r.tdsMonthly+(r.statutory.find(s=>s.code==="PT")?.amount || 0),0),"var(--amber)"]].map(([l,v,c])=><div key={l} className="card" style={{ marginBottom:0, borderTop:`3px solid ${c}` }}><div className="cb"><div className="flbl">{l}</div><div style={{ fontFamily:"var(--mono)", fontWeight:800, fontSize:18, color:c }}>{money(v)}</div></div></div>)}</div>}
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
            <div className="tw"><table><thead><tr>{["Employee","Dept","Monthly Gross","Net Pay","YTD Net","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{scopedEmps.filter(e=>historyFilter==="All"||e.dept===historyFilter).map(e=>{ const data=calcPayroll(e,{ month, payDate:payrollRuns[month] || defaultPayDateForMonth(month), payrollStatus:month === PAYROLL_MONTHS[0] ? "Current" : "Paid" },customFields,structure); const allowed=canViewPayrollOf(currentUser,e.id); return <tr key={e.id}><td><div style={{ display:"flex", alignItems:"center", gap:8 }}><div className="avt" style={{ width:28, height:28, background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div><div className="fw7">{e.name}</div><div className="t3 tsm">{e.id}</div></div></div></td><td><span className="bdg bdg-b">{e.dept}</span></td><td>{allowed ? money(data.grossEarnings) : "Confidential"}</td><td className="fw7" style={{ color:"var(--green)" }}>{allowed ? money(data.netPay) : "Confidential"}</td><td style={{ color:"var(--accent)" }}>{allowed ? money(data.ytd.net) : "Confidential"}</td><td><button className="btn btn-sm" onClick={()=>{ setSlip(data); setTab("slip"); }}><Icon n="eye" s={12}/></button></td></tr>; })}</tbody></table></div>
          </div>
        </div>
      )}

      {tab==="configure"&&canConfigurePayroll(currentUser)&&(
        <div>
          {/* ── Salary Structure ── */}
          <div className="card" style={{ marginBottom:14 }}>
            <div className="ch">
              <div><div className="ct">Salary Structure</div><div className="t3 tsm">Edit the core salary components. Changes apply to all future payroll calculations immediately.</div></div>
              {structureSaving&&<span className="bdg bdg-a">Saving…</span>}
            </div>
            <div className="cb">
              <div className="fg">
                {[
                  { key:"basic_pct", label:"Basic Salary",                 unit:"%", desc:"% of monthly CTC",       max:100 },
                  { key:"hra_pct",   label:"House Rent Allowance (HRA)",   unit:"%", desc:"% of Basic Salary",      max:100 },
                  { key:"lta_pct",   label:"Leave Travel Allowance (LTA)", unit:"%", desc:"% of monthly CTC",       max:100 },
                  { key:"transport", label:"Transport Allowance",          unit:"₹", desc:"Fixed amount per month",  max:50000 },
                ].map(({ key, label, unit, desc, max }) => (
                  <div key={key} className="fgrp">
                    <div className="flbl" style={{ display:"flex", justifyContent:"space-between" }}>
                      <span>{label}</span><span className="bdg bdg-b" style={{ fontSize:9 }}>{unit==="%"?"% Based":"Fixed ₹"}</span>
                    </div>
                    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                      <input className="finp" type="number" min="0" max={max} step={unit==="₹"?100:0.5}
                        value={structureEdit[key]!==undefined ? structureEdit[key] : (structure[key]??"")}
                        onChange={e=>setStructureEdit(p=>({...p,[key]:e.target.value}))} style={{ flex:1 }}/>
                      <span className="t3" style={{ minWidth:16 }}>{unit}</span>
                      <button className="btn btn-sm btn-p" disabled={structureSaving}
                        onClick={()=>saveStructureField(key, structureEdit[key]!==undefined ? structureEdit[key] : structure[key])}>Save</button>
                    </div>
                    <div className="t3 tsm">{desc}</div>
                  </div>
                ))}
                <div className="fgrp">
                  <div className="flbl" style={{ display:"flex", justifyContent:"space-between" }}>
                    <span>Special Allowance</span><span className="bdg bdg-gray" style={{ fontSize:9 }}>Auto</span>
                  </div>
                  <input className="finp" readOnly value="Auto = CTC − Basic − HRA − LTA − Transport" style={{ background:"var(--raised)", color:"var(--ink3)" }}/>
                  <div className="t3 tsm">Automatically fills the remaining amount — not editable directly</div>
                </div>
              </div>
              <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(27,69,245,0.15)", borderRadius:"var(--r8)", padding:"10px 14px", fontSize:12, color:"var(--accent)", marginTop:8 }}>
                Live preview for ₹12L CTC employee → Basic: ₹{money(Math.round(100000*(structure.basic_pct||40)/100))} · HRA: ₹{money(Math.round(100000*(structure.basic_pct||40)/100*(structure.hra_pct||50)/100))} · LTA: ₹{money(Math.round(100000*(structure.lta_pct||5)/100))} · Transport: ₹{money(structure.transport||1600)} /month
              </div>
            </div>
          </div>

          {/* ── Custom Fields ── */}
          <div className="card">
            <div className="ch">
              <div><div className="ct">Custom Payroll Fields</div><div className="t3 tsm">Add custom earnings and deductions that apply to all payroll runs. Director &amp; HR access only.</div></div>
              <button className="btn btn-p" onClick={()=>{ setCfFormData({ name:"", category:"earning", calcType:"fixed", value:0, active:true }); setCfForm("new"); }}><Icon n="plus" s={13}/>Add Field</button>
            </div>
            {customFields.length === 0 ? (
              <div style={{ padding:32, textAlign:"center", color:"var(--ink3)" }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🧩</div>
                <div className="fw7">No custom fields yet</div>
                <div className="t3 tsm" style={{ marginTop:4 }}>Click "Add Field" to create a new earning or deduction component</div>
              </div>
            ) : (
              <div className="tw">
                <table>
                  <thead><tr>{["Field Name","Category","Calculation","Default Value","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                  <tbody>
                    {customFields.map(f=>(
                      <tr key={f.id}>
                        <td><div className="fw7">{f.name}</div><div className="t3 tsm">ID: {f.id}</div></td>
                        <td><span className={`bdg ${f.category==="earning"?"bdg-g":"bdg-r"}`}>{f.category==="earning"?"Earning":"Deduction"}</span></td>
                        <td><span className="bdg bdg-b">{f.calcType==="fixed"?"Fixed Amount":f.calcType==="pct_basic"?"% of Basic":f.calcType==="pct_ctc"?"% of CTC":"% of Gross"}</span></td>
                        <td className="fw7 mono">{f.calcType==="fixed"?money(f.value):`${f.value}%`}</td>
                        <td><span className={`bdg ${f.active?"bdg-g":"bdg-gray"}`}>{f.active?"Active":"Inactive"}</span></td>
                        <td>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn-sm" onClick={()=>{ setCfFormData({ ...f }); setCfForm(f.id); }}>Edit</button>
                            <button className="btn btn-sm" style={{ color:"var(--red)" }} onClick={async()=>{
                              if(!window.confirm(`Delete "${f.name}"?`)) return;
                              await apiFetch(`${API}/api/payroll/field-configs/${f.id}`,{ method:"DELETE" });
                              setCustomFields(p=>{ const n=p.filter(x=>x.id!==f.id); APP_CUSTOM_FIELDS=n; return n; });
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="card" style={{ marginTop:0 }}>
            <div className="ch"><div className="ct"><Icon n="info" s={14}/>Field Type Guide</div></div>
            <div className="cb">
              <div className="info-grid">
                {[
                  ["Fixed Amount (Earning)","A fixed rupee value added to gross every month. E.g. Car Allowance ₹5,000"],
                  ["% of Basic (Earning)","Automatically calculated as a % of pro-rated Basic. E.g. Education Allowance 10%"],
                  ["% of CTC (Earning)","Automatically calculated as a % of monthly CTC. E.g. Retention Bonus 2%"],
                  ["Fixed Amount (Deduction)","A fixed rupee deduction every month. E.g. Group Health Insurance ₹1,500"],
                  ["% of Gross (Deduction)","Automatically deducted as a % of gross earnings. E.g. VPF 5%"],
                ].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontSize:12 }}>{v}</div></div>)}
              </div>
            </div>
          </div>

          {/* ── Statutory Deduction Config ── */}
          <div className="card" style={{ marginTop:14 }}>
            <div className="ch">
              <div>
                <div className="ct">Statutory Deduction Rates</div>
                <div className="t3 tsm">PF, ESI, Professional Tax and TDS rates stored in the database. Update when legislation changes.</div>
              </div>
              {statSaving && <span className="bdg bdg-a">Saving…</span>}
            </div>
            <div className="cb">
              <div className="fg">
                {[
                  { key:"pf_rate_employee",       label:"PF Employee Rate",           unit:"%",  factor:100, desc:"Employee PF: % of basic salary (capped at PF ceiling)" },
                  { key:"pf_rate_employer",       label:"PF Employer Rate",           unit:"%",  factor:100, desc:"Employer PF contribution rate" },
                  { key:"pf_ceiling",             label:"PF Wage Ceiling",            unit:"₹",  factor:1,   desc:"PF is calculated on min(basic, ceiling). Current EPFO limit: ₹15,000" },
                  { key:"esi_rate_employee",      label:"ESI Employee Rate",          unit:"%",  factor:100, desc:"Employee ESI: % of gross salary" },
                  { key:"esi_rate_employer",      label:"ESI Employer Rate",          unit:"%",  factor:100, desc:"Employer ESI contribution rate" },
                  { key:"esi_gross_limit",        label:"ESI Gross Salary Limit",     unit:"₹",  factor:1,   desc:"ESI applies only when monthly gross ≤ this amount" },
                  { key:"tds_cess_rate",          label:"Health & Education Cess",    unit:"%",  factor:100, desc:"Cess applied on computed income tax (currently 4%)" },
                  { key:"tds_80c_limit",          label:"Section 80C Annual Limit",   unit:"₹",  factor:1,   desc:"Max annual deduction under Section 80C" },
                  { key:"tds_standard_deduction", label:"Standard Deduction",         unit:"₹",  factor:1,   desc:"Annual standard deduction for salaried employees" },
                ].map(({ key, label, unit, factor, desc }) => {
                  const rawStored = statCfg?.[key];
                  const displayVal = rawStored !== undefined ? (unit === "%" ? (parseFloat(rawStored) * factor).toFixed(factor === 100 ? 2 : 0) : parseFloat(rawStored)) : "";
                  const editVal = statEdit[key] !== undefined ? statEdit[key] : displayVal;
                  return (
                    <div key={key} className="fgrp">
                      <div className="flbl" style={{ display:"flex", justifyContent:"space-between" }}>
                        <span>{label}</span><span className="bdg bdg-r" style={{ fontSize:9 }}>Statutory</span>
                      </div>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <input className="finp" type="number" min="0" step={unit==="₹" ? 100 : 0.01}
                          value={editVal}
                          onChange={e => setStatEdit(p => ({ ...p, [key]: e.target.value }))}
                          style={{ flex:1 }}/>
                        <span className="t3" style={{ minWidth:16 }}>{unit}</span>
                        <button className="btn btn-sm btn-p" disabled={statSaving}
                          onClick={() => {
                            // Convert display % back to decimal for storage
                            const val = unit === "%" ? parseFloat(editVal) / factor : parseFloat(editVal);
                            saveStatField(key, String(val));
                          }}>Save</button>
                      </div>
                      <div className="t3 tsm">{desc}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ background:"var(--amber-soft)", border:"1px solid rgba(176,96,16,0.2)", borderRadius:"var(--r8)", padding:"10px 14px", fontSize:12, color:"var(--amber)", marginTop:8 }}>
                <strong>PT and TDS slabs</strong> (JSON arrays) can be updated directly in the database via <code>payroll_statutory_config</code> table rows <code>pt_slab_json</code> and <code>tds_slab_json</code> when the government revises tax brackets.
              </div>
            </div>
          </div>
        </div>
      )}

      {cfForm!==null&&(
        <Modal title={cfForm==="new"?"Add Custom Payroll Field":"Edit Custom Payroll Field"} onClose={()=>setCfForm(null)}
          footer={<>
            <button className="btn" onClick={()=>setCfForm(null)}>Cancel</button>
            <button className="btn btn-p" onClick={async()=>{
              if(!cfFormData.name.trim()){ alert("Field name is required."); return; }
              if(cfFormData.value < 0){ alert("Value must be 0 or more."); return; }
              if(cfForm==="new"){
                const res = await apiFetch(`${API}/api/payroll/field-configs`,{
                  method:"POST", headers:{"Content-Type":"application/json"},
                  body:JSON.stringify({ name:cfFormData.name, category:cfFormData.category, calcType:cfFormData.calcType, value:cfFormData.value, active:cfFormData.active, createdBy:currentUser.id }),
                });
                const data = await res.json();
                if(data.ok) setCustomFields(p=>{ const n=[...p, dbFieldToFrontend(data.field)]; APP_CUSTOM_FIELDS=n; return n; });
              } else {
                const res = await apiFetch(`${API}/api/payroll/field-configs/${cfForm}`,{
                  method:"PUT", headers:{"Content-Type":"application/json"},
                  body:JSON.stringify({ name:cfFormData.name, category:cfFormData.category, calcType:cfFormData.calcType, value:cfFormData.value, active:cfFormData.active }),
                });
                const data = await res.json();
                if(data.ok) setCustomFields(p=>{ const n=p.map(f=>f.id===cfForm ? dbFieldToFrontend(data.field) : f); APP_CUSTOM_FIELDS=n; return n; });
              }
              setCfForm(null);
            }}>{cfForm==="new"?"Create Field":"Save Changes"}</button>
          </>}>
          <div className="fg" style={{ marginBottom:0 }}>
            <div className="fgrp" style={{ gridColumn:"1/-1" }}><div className="flbl">Field Name *</div><input className="finp" placeholder="e.g. Car Allowance" value={cfFormData.name} onChange={e=>setCfFormData(p=>({...p,name:e.target.value}))}/></div>
            <div className="fgrp"><div className="flbl">Category</div>
              <select className="fsel" value={cfFormData.category} onChange={e=>setCfFormData(p=>({...p,category:e.target.value,calcType:e.target.value==="earning"?"fixed":"fixed"}))}>
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </select>
            </div>
            <div className="fgrp"><div className="flbl">Calculation Type</div>
              <select className="fsel" value={cfFormData.calcType} onChange={e=>setCfFormData(p=>({...p,calcType:e.target.value}))}>
                <option value="fixed">Fixed Amount (₹)</option>
                {cfFormData.category==="earning"&&<option value="pct_basic">% of Basic Salary</option>}
                {cfFormData.category==="earning"&&<option value="pct_ctc">% of Monthly CTC</option>}
                {cfFormData.category==="deduction"&&<option value="pct_gross">% of Gross Earnings</option>}
              </select>
            </div>
            <div className="fgrp"><div className="flbl">{cfFormData.calcType==="fixed"?"Default Amount (₹)":"Percentage (%)"}</div>
              <input className="finp" type="number" min="0" max={cfFormData.calcType==="fixed"?999999:100}
                value={cfFormData.value} onChange={e=>setCfFormData(p=>({...p,value:parseFloat(e.target.value)||0}))}/>
            </div>
            <div className="fgrp"><div className="flbl">Status</div>
              <select className="fsel" value={cfFormData.active?"active":"inactive"} onChange={e=>setCfFormData(p=>({...p,active:e.target.value==="active"}))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="fgrp" style={{ gridColumn:"1/-1" }}>
              <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(27,69,245,0.15)", borderRadius:"var(--r8)", padding:"10px 12px", fontSize:12, color:"var(--accent)" }}>
                {cfFormData.calcType==="fixed"&&cfFormData.category==="earning"&&`This field adds ₹${(cfFormData.value||0).toLocaleString("en-IN")} to every employee's gross earnings each month. HR can override the amount per employee during payroll run.`}
                {cfFormData.calcType==="pct_basic"&&`This field auto-calculates ${cfFormData.value||0}% of each employee's pro-rated Basic Salary. No manual entry needed during payroll run.`}
                {cfFormData.calcType==="pct_ctc"&&`This field auto-calculates ${cfFormData.value||0}% of each employee's monthly CTC. No manual entry needed during payroll run.`}
                {cfFormData.calcType==="fixed"&&cfFormData.category==="deduction"&&`This field deducts ₹${(cfFormData.value||0).toLocaleString("en-IN")} from every employee's net pay each month. HR can override per employee during payroll run.`}
                {cfFormData.calcType==="pct_gross"&&`This field auto-deducts ${cfFormData.value||0}% of each employee's gross earnings. No manual entry needed during payroll run.`}
              </div>
            </div>
          </div>
        </Modal>
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


const EMPTY_EDIT_FORM = {
  phone:"", location:"", gender:"", dob:"",
  bank_name:"", bank_account_no:"", ifsc:"", uan:"", pan:"", aadhaar:"", pf_account:"",
  first_name:"", middle_name:"", last_name:"",
  department:"", designation:"", email:"",
  annual_ctc_lpa:"", emp_type:"", notice_period:"",
  mgr_id:"", access_level:"", date_of_joining:"",
  employee_id:"",
};

const EMPTY_CREATE_FORM = {
  first_name:"", middle_name:"", last_name:"", email:"",
  department:"", designation:"", annual_ctc_lpa:"",
  password:"", phone:"", location:"", gender:"",
  dob:"", date_of_joining:"", emp_type:"Full-time",
  notice_period:"", mgr_id:"", access_level:"1", is_hr:false,
  pan:"", aadhaar:"", uan:"", pf_account:"",
  bank_name:"", bank_account_no:"", ifsc:"",
};

const DIR_DEPT_LIST = ["Technology","Human Resources","Finance","Marketing","Operations","Sales","Design","Data & Analytics","Product","Legal"];
const EMP_TYPES     = ["Full-time","Contract","Intern"];
const GENDERS       = ["Male","Female","Other","Prefer not to say"];
const ACCESS_LEVELS = [["1","Employee"],["2","Lead"],["3","Manager"],["4","Director"]];

const DirectoryMod = ({ currentUser, onCurrentUserUpdate }) => {
  const canViewDirectory   = canOperatePayroll(currentUser);
  const canManageEmployees = canOperatePayroll(currentUser);
  const [allEmps, setAllEmps] = useState(ALL_USERS);
  const visibleEmps = useMemo(() => canViewDirectory ? allEmps : allEmps.filter(e=>e.id===currentUser.id), [canViewDirectory, allEmps, currentUser.id]);
  const [sel, setSel]       = useState(currentUser.id);
  const [srch, setSrch]     = useState("");
  const [fil, setFil]       = useState("All");
  const [profTab, setProfTab] = useState("profile");

  // Edit modal state
  const [editOpen, setEditOpen]     = useState(false);
  const [editTab, setEditTab]       = useState("contact");
  const [editForm, setEditForm]     = useState(EMPTY_EDIT_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [editErr, setEditErr]       = useState("");

  // Add employee modal state
  const [addOpen, setAddOpen]   = useState(false);
  const [addTab, setAddTab]     = useState("basic");
  const [addForm, setAddForm]   = useState(EMPTY_CREATE_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addErr, setAddErr]     = useState("");

  const depts    = useMemo(() => ["All",...[...new Set(visibleEmps.map(e=>e.dept))]], [visibleEmps]);
  const filtered = useMemo(() => visibleEmps.filter(e=>(fil==="All"||e.dept===fil)&&(e.name.toLowerCase().includes(srch.toLowerCase())||e.role.toLowerCase().includes(srch.toLowerCase()))), [visibleEmps, fil, srch]);
  const emp      = visibleEmps.find(e=>e.id===sel)||currentUser;
  const canSeeSensitive      = canSeeSensitiveOf(currentUser, sel);
  const canEditThisEmployee  = canManageEmployees || currentUser.accessLevel >= 3 || sel === currentUser.id;
  const handleSelectEmployee = id => { setSel(id); setProfTab("profile"); };

  const openEdit = () => {
    setEditErr(""); setEditTab("contact");
    setEditForm({
      phone: emp.phone||"", location: emp.loc||"", gender: emp.gender||"",
      dob: emp.dob||"", bank_name: emp.bank||"", bank_account_no: emp.accountNo||"",
      ifsc: emp.ifsc||"", uan: emp.uan||"", pan: emp.pan||"",
      aadhaar: emp.aadhaar||"", pf_account: emp.pfAccount||"",
      first_name: emp.firstName||"", middle_name: emp.middleName||"",
      last_name: emp.lastName||"", department: emp.dept||"",
      designation: emp.role||"", email: emp.email||"",
      annual_ctc_lpa: emp.ctcLPA!=null ? String(emp.ctcLPA) : "",
      emp_type: emp.empType||"Full-time", notice_period: emp.noticePeriod||"",
      mgr_id: emp.mgr||"", access_level: String(emp.accessLevel||1),
      date_of_joining: emp.joining||"",
      employee_id: emp.id||"",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setEditSaving(true); setEditErr("");
    try {
      // Snapshot of original values — same mapping used in openEdit.
      const orig = {
        phone: emp.phone||"", location: emp.loc||"", gender: emp.gender||"",
        dob: emp.dob||"", bank_name: emp.bank||"", bank_account_no: emp.accountNo||"",
        ifsc: emp.ifsc||"", uan: emp.uan||"", pan: emp.pan||"",
        aadhaar: emp.aadhaar||"", pf_account: emp.pfAccount||"",
        first_name: emp.firstName||"", middle_name: emp.middleName||"",
        last_name: emp.lastName||"", department: emp.dept||"",
        designation: emp.role||"", email: emp.email||"",
        annual_ctc_lpa: emp.ctcLPA!=null ? String(emp.ctcLPA) : "",
        emp_type: emp.empType||"Full-time", notice_period: emp.noticePeriod||"",
        mgr_id: emp.mgr||"", access_level: String(emp.accessLevel||1),
        date_of_joining: emp.joining||"",
        employee_id: emp.id||"",
      };
      // Only send fields the user actually changed (diff-based).
      // This lets empty string mean "cleared" rather than "unchanged".
      const norm = v => (v === null || v === undefined) ? "" : String(v);
      const changed = {};
      for (const k of Object.keys(orig)) {
        if (norm(editForm[k]) !== norm(orig[k])) changed[k] = editForm[k];
      }
      if (!Object.keys(changed).length) { setEditOpen(false); return; }
      const body = { ...changed, requestor_id: currentUser.id };
      if ("annual_ctc_lpa" in body) body.annual_ctc_lpa = parseFloat(body.annual_ctc_lpa);
      if ("access_level" in body)   body.access_level   = parseInt(body.access_level, 10);
      // employee_id in the form maps to new_employee_id in the API (URL already carries the old id)
      if ("employee_id" in body) { body.new_employee_id = body.employee_id; delete body.employee_id; }
      const oldId = emp.id;  // capture before the API call — may change if we're renaming
      const res  = await apiFetch(`${API_URL}/api/employees/${emp.id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = Array.isArray(data.detail)
          ? data.detail.map(e => e.msg || JSON.stringify(e)).join("; ")
          : (data.detail || "Save failed.");
        console.error("[saveEdit] error:", res.status, data);
        setEditErr(errMsg);
        return;
      }
      console.log("[saveEdit] success:", data.employee);
      const updated = data.employee;
      // Use oldId for the map lookup — updated.id may be a new employee_id after rename
      ALL_USERS = ALL_USERS.map(e => e.id === oldId ? updated : e);
      window.__HR_ALL_USERS__ = ALL_USERS;
      setAllEmps([...ALL_USERS]);
      setSel(updated.id);  // keep selection pointing at the (possibly renamed) employee
      if (oldId === currentUser.id && onCurrentUserUpdate) onCurrentUserUpdate(updated);
      setEditOpen(false);
    } catch(err) { console.error("[saveEdit] catch:", err); setEditErr("Network error. Try again."); }
    finally { setEditSaving(false); }
  };

  const saveAdd = async () => {
    if (!addForm.first_name.trim()||!addForm.last_name.trim()||!addForm.email.trim()||
        !addForm.department||!addForm.designation.trim()||!addForm.annual_ctc_lpa||!addForm.password.trim()) {
      setAddErr("First name, last name, email, department, designation, CTC and password are required."); return;
    }
    setAddSaving(true); setAddErr("");
    try {
      const body = { ...addForm, requestor_id: currentUser.id };
      body.annual_ctc_lpa = parseFloat(body.annual_ctc_lpa);
      body.access_level   = parseInt(body.access_level, 10);
      const res  = await apiFetch(`${API_URL}/api/employees`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setAddErr(data.detail || "Create failed."); return; }
      const newEmp = data.employee;
      ALL_USERS = [...ALL_USERS, newEmp];
      window.__HR_ALL_USERS__ = ALL_USERS;
      setAllEmps([...ALL_USERS]);
      setAddOpen(false);
      setAddForm(EMPTY_CREATE_FORM);
      setSel(newEmp.id);
    } catch { setAddErr("Network error. Try again."); }
    finally { setAddSaving(false); }
  };

  const ef = (k, v) => setEditForm(p=>({...p,[k]:v}));
  const af = (k, v) => setAddForm(p=>({...p,[k]:v}));

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">People</div>
          <div className="ph-title">{canViewDirectory ? "Employee Directory" : "My Profile"}</div>
          <div className="ph-sub">{canViewDirectory ? `${allEmps.length} employees across ${[...new Set(allEmps.map(e=>e.dept))].length} departments · Director & HR access` : "Your personal HR profile — only you and HR can view your details"}</div>
        </div>
        {canManageEmployees && (
          <button className="btn btn-p" onClick={()=>{ setAddErr(""); setAddForm(EMPTY_CREATE_FORM); setAddTab("basic"); setAddOpen(true); }}><Icon n="plus" s={13}/>Add Employee</button>
        )}
      </div>
      {canViewDirectory && (
        <div style={{ display:"flex",gap:7,marginBottom:14,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ flex:1,minWidth:200,display:"flex",alignItems:"center",gap:8,background:"var(--surface)",border:"1.5px solid var(--brd)",borderRadius:"var(--r8)",padding:"0 11px",height:36,transition:"border-color 0.15s" }}>
            <Icon n="search" s={13}/><input style={{ border:"none",outline:"none",flex:1,fontFamily:"var(--font)",fontSize:13,color:"var(--ink)",background:"transparent" }} placeholder="Search by name, role..." value={srch} onChange={e=>setSrch(e.target.value)}/>
          </div>
          {depts.map(d=><div key={d} className={`pill${fil===d?" active":""}`} onClick={()=>setFil(d)}>{d}</div>)}
        </div>
      )}
      <div className="g2" style={{ alignItems:"start" }}>
        {canViewDirectory && (
        <div className="card" style={{ marginBottom:0 }}>
          <div className="ch"><div className="ct"><Icon n="users" s={14}/>{filtered.length} Employees</div></div>
          <div style={{ padding:0,maxHeight:500,overflowY:"auto",overscrollBehavior:"none" }}>
            {filtered.map(e=>(
              <div key={e.id} className={`emp-row${sel===e.id?" sel":""}`} onClick={()=>handleSelectEmployee(e.id)}>
                <div className="avt" style={{ width:36,height:36,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div>
                <div style={{ flex:1 }}><div className="fw7" style={{ fontSize:13,color:sel===e.id?"var(--accent)":"var(--ink)" }}>{e.name}{e.id===currentUser.id&&<span className="bdg bdg-b" style={{ fontSize:9,marginLeft:4 }}>You</span>}</div><div className="t3 tsm">{e.role}</div></div>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}><span className="bdg bdg-b" style={{ fontSize:10 }}>{e.dept}</span><span className="tsm t3">{e.loc}</span></div>
              </div>
            ))}
          </div>
        </div>
        )}
        {emp&&(
          <div className="card" style={{ marginBottom:0 }}>
            <div style={{ padding:"14px 16px",borderBottom:"1px solid var(--brd)",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div className="avt" style={{ width:44,height:44,fontSize:15,background:emp.color }}>{emp.firstName[0]}{emp.lastName[0]}</div>
                <div><div className="fw7" style={{ fontSize:15,fontFamily:"var(--display)" }}>{emp.name}</div><div className="t3 tsm">{emp.role} · {emp.dept}</div></div>
              </div>
              <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                <span className="bdg bdg-b">{emp.loc}</span>
                {canEditThisEmployee && (
                  <button className="btn" style={{ fontSize:12,padding:"4px 10px" }} onClick={openEdit}><Icon n="edit" s={12}/>Edit</button>
                )}
              </div>
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
                  <div className="info-grid">{[["Date of Joining",emp.joining],["Tenure",`${Math.floor((new Date()-new Date(emp.joining))/31536000000)} years`],["Employment Type",emp.empType],["Notice Period",emp.noticePeriod],["Annual CTC",canSeeSensitiveOf(currentUser,emp.id)?`₹${emp.ctcLPA} LPA`:"Confidential"],["Location",emp.loc],["Manager",emp.mgr?allEmps.find(e=>e.id===emp.mgr)?.name||"—":"None"],["Performance",`${emp.perf}/5.0`]].map(([k,v])=><div key={k} className="if"><div className="if-l">{k}</div><div style={{ fontWeight:600,fontSize:12.5 }}>{v}</div></div>)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Employee Modal ── */}
      {editOpen && (
        <Modal title={`Edit — ${emp.name}`} onClose={()=>setEditOpen(false)} footer={
          <><button className="btn" onClick={()=>setEditOpen(false)}>Cancel</button><button className="btn btn-p" onClick={saveEdit} disabled={editSaving}>{editSaving?"Saving…":"Save Changes"}</button></>
        }>
          {editErr && <div style={{ padding:"9px 12px",background:"#fef2f2",borderRadius:"var(--r8)",fontSize:12,color:"var(--red)",marginBottom:12 }}>{editErr}</div>}
          <div style={{ display:"flex",borderBottom:"1px solid var(--brd)",marginBottom:14 }}>
            {["contact","banking",...((canManageEmployees||currentUser.accessLevel>=3)?["employment"]:[])].map(t=>(
              <div key={t} className={`tab${editTab===t?" active":""}`} onClick={()=>setEditTab(t)} style={{ padding:"7px 13px",fontSize:12,cursor:"pointer" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
            ))}
          </div>
          {editTab==="contact"&&(
            <div className="fg">
              <div className="fgrp"><div className="flbl">Phone</div><input className="finp" value={editForm.phone} onChange={e=>ef("phone",e.target.value)} placeholder="+91 98765 43210"/></div>
              <div className="fgrp"><div className="flbl">Location</div><input className="finp" value={editForm.location} onChange={e=>ef("location",e.target.value)} placeholder="City, State"/></div>
              <div className="fgrp"><div className="flbl">Gender</div><select className="fsel" value={editForm.gender} onChange={e=>ef("gender",e.target.value)}><option value="">— select —</option>{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Date of Birth</div><input className="finp" type="date" value={editForm.dob} onChange={e=>ef("dob",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">PAN</div><input className="finp" value={editForm.pan} onChange={e=>ef("pan",e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10}/></div>
              <div className="fgrp"><div className="flbl">Aadhaar</div><input className="finp" value={editForm.aadhaar} onChange={e=>ef("aadhaar",e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14}/></div>
            </div>
          )}
          {editTab==="banking"&&(
            <div className="fg">
              <div className="fgrp"><div className="flbl">Bank Name</div><input className="finp" value={editForm.bank_name} onChange={e=>ef("bank_name",e.target.value)} placeholder="HDFC Bank"/></div>
              <div className="fgrp"><div className="flbl">Account Number</div><input className="finp" value={editForm.bank_account_no} onChange={e=>ef("bank_account_no",e.target.value)} placeholder="12345678901234"/></div>
              <div className="fgrp"><div className="flbl">IFSC Code</div><input className="finp" value={editForm.ifsc} onChange={e=>ef("ifsc",e.target.value.toUpperCase())} placeholder="HDFC0001234"/></div>
              <div className="fgrp"><div className="flbl">UAN</div><input className="finp" value={editForm.uan} onChange={e=>ef("uan",e.target.value)} placeholder="100987654321"/></div>
              <div className="fgrp ff"><div className="flbl">PF Account</div><input className="finp" value={editForm.pf_account} onChange={e=>ef("pf_account",e.target.value)} placeholder="MH/BAN/12345/000/0000001"/></div>
            </div>
          )}
          {editTab==="employment"&&(canManageEmployees||currentUser.accessLevel>=3)&&(
            <div className="fg">
              <div className="fgrp ff">
                <div className="flbl">Employee ID</div>
                <input className="finp" value={editForm.employee_id} onChange={e=>ef("employee_id",e.target.value.toUpperCase())} placeholder="EMP-0042" style={{fontFamily:"monospace",letterSpacing:"0.04em"}}/>
                <div style={{fontSize:11,color:"#888",marginTop:3}}>Changing this ID updates all records. Use with caution.</div>
              </div>
              {canManageEmployees&&<>
              <div className="fgrp"><div className="flbl">First Name</div><input className="finp" value={editForm.first_name} onChange={e=>ef("first_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Last Name</div><input className="finp" value={editForm.last_name} onChange={e=>ef("last_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Middle Name</div><input className="finp" value={editForm.middle_name} onChange={e=>ef("middle_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Email</div><input className="finp" type="email" value={editForm.email} onChange={e=>ef("email",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Department</div><select className="fsel" value={editForm.department} onChange={e=>ef("department",e.target.value)}>{DIR_DEPT_LIST.map(d=><option key={d}>{d}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Designation</div><input className="finp" value={editForm.designation} onChange={e=>ef("designation",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Date of Joining</div><input className="finp" type="date" value={editForm.date_of_joining} onChange={e=>ef("date_of_joining",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Annual CTC (LPA)</div><input className="finp" type="number" step="0.1" min="0" value={editForm.annual_ctc_lpa} onChange={e=>ef("annual_ctc_lpa",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Employment Type</div><select className="fsel" value={editForm.emp_type} onChange={e=>ef("emp_type",e.target.value)}>{EMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Notice Period</div><input className="finp" value={editForm.notice_period} onChange={e=>ef("notice_period",e.target.value)} placeholder="30 days"/></div>
              <div className="fgrp ff"><div className="flbl">Manager</div><select className="fsel" value={editForm.mgr_id} onChange={e=>ef("mgr_id",e.target.value)}><option value="">— No manager —</option>{allEmps.filter(e=>e.id!==emp.id).map(e=><option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Access Level</div><select className="fsel" value={editForm.access_level} onChange={e=>ef("access_level",e.target.value)}>{ACCESS_LEVELS.map(([v,l])=><option key={v} value={v}>{l} (Level {v})</option>)}</select></div>
              </>}
            </div>
          )}
        </Modal>
      )}

      {/* ── Add Employee Modal ── */}
      {addOpen && (
        <Modal title="Add New Employee" onClose={()=>setAddOpen(false)} footer={
          <><button className="btn" onClick={()=>setAddOpen(false)}>Cancel</button><button className="btn btn-p" onClick={saveAdd} disabled={addSaving}>{addSaving?"Creating…":"Create Employee"}</button></>
        }>
          {addErr && <div style={{ padding:"9px 12px",background:"#fef2f2",borderRadius:"var(--r8)",fontSize:12,color:"var(--red)",marginBottom:12 }}>{addErr}</div>}
          <div style={{ display:"flex",borderBottom:"1px solid var(--brd)",marginBottom:14 }}>
            {["basic","employment","identity"].map(t=>(
              <div key={t} className={`tab${addTab===t?" active":""}`} onClick={()=>setAddTab(t)} style={{ padding:"7px 13px",fontSize:12,cursor:"pointer" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>
            ))}
          </div>
          {addTab==="basic"&&(
            <div className="fg">
              <div className="fgrp"><div className="flbl">First Name <span style={{color:"var(--red)"}}>*</span></div><input className="finp" value={addForm.first_name} onChange={e=>af("first_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Last Name <span style={{color:"var(--red)"}}>*</span></div><input className="finp" value={addForm.last_name} onChange={e=>af("last_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Middle Name</div><input className="finp" value={addForm.middle_name} onChange={e=>af("middle_name",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Email <span style={{color:"var(--red)"}}>*</span></div><input className="finp" type="email" value={addForm.email} onChange={e=>af("email",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Phone</div><input className="finp" value={addForm.phone} onChange={e=>af("phone",e.target.value)} placeholder="+91 98765 43210"/></div>
              <div className="fgrp"><div className="flbl">Gender</div><select className="fsel" value={addForm.gender} onChange={e=>af("gender",e.target.value)}><option value="">— select —</option>{GENDERS.map(g=><option key={g}>{g}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Date of Birth</div><input className="finp" type="date" value={addForm.dob} onChange={e=>af("dob",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Location</div><input className="finp" value={addForm.location} onChange={e=>af("location",e.target.value)} placeholder="City, State"/></div>
              <div className="fgrp"><div className="flbl">Initial Password <span style={{color:"var(--red)"}}>*</span></div><input className="finp" type="password" value={addForm.password} onChange={e=>af("password",e.target.value)} placeholder="Min 6 characters"/></div>
            </div>
          )}
          {addTab==="employment"&&(
            <div className="fg">
              <div className="fgrp"><div className="flbl">Department <span style={{color:"var(--red)"}}>*</span></div><select className="fsel" value={addForm.department} onChange={e=>af("department",e.target.value)}><option value="">— select —</option>{DIR_DEPT_LIST.map(d=><option key={d}>{d}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Designation <span style={{color:"var(--red)"}}>*</span></div><input className="finp" value={addForm.designation} onChange={e=>af("designation",e.target.value)} placeholder="e.g. Software Engineer"/></div>
              <div className="fgrp"><div className="flbl">Annual CTC (LPA) <span style={{color:"var(--red)"}}>*</span></div><input className="finp" type="number" step="0.1" min="0" value={addForm.annual_ctc_lpa} onChange={e=>af("annual_ctc_lpa",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Date of Joining</div><input className="finp" type="date" value={addForm.date_of_joining} onChange={e=>af("date_of_joining",e.target.value)}/></div>
              <div className="fgrp"><div className="flbl">Employment Type</div><select className="fsel" value={addForm.emp_type} onChange={e=>af("emp_type",e.target.value)}>{EMP_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Notice Period</div><input className="finp" value={addForm.notice_period} onChange={e=>af("notice_period",e.target.value)} placeholder="30 days"/></div>
              <div className="fgrp ff"><div className="flbl">Manager</div><select className="fsel" value={addForm.mgr_id} onChange={e=>af("mgr_id",e.target.value)}><option value="">— No manager —</option>{allEmps.map(e=><option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}</select></div>
              <div className="fgrp"><div className="flbl">Access Level</div><select className="fsel" value={addForm.access_level} onChange={e=>af("access_level",e.target.value)}>{ACCESS_LEVELS.map(([v,l])=><option key={v} value={v}>{l} (Level {v})</option>)}</select></div>
              <div className="fgrp" style={{ alignItems:"center",justifyContent:"flex-start",gap:10,flexDirection:"row",paddingTop:18 }}>
                <input type="checkbox" id="addIsHR" checked={addForm.is_hr} onChange={e=>af("is_hr",e.target.checked)} style={{ width:16,height:16 }}/>
                <label htmlFor="addIsHR" className="flbl" style={{ marginBottom:0,cursor:"pointer" }}>HR Admin access</label>
              </div>
            </div>
          )}
          {addTab==="identity"&&(
            <div className="fg">
              <div className="fgrp"><div className="flbl">PAN</div><input className="finp" value={addForm.pan} onChange={e=>af("pan",e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10}/></div>
              <div className="fgrp"><div className="flbl">Aadhaar</div><input className="finp" value={addForm.aadhaar} onChange={e=>af("aadhaar",e.target.value)} placeholder="XXXX XXXX XXXX" maxLength={14}/></div>
              <div className="fgrp"><div className="flbl">UAN</div><input className="finp" value={addForm.uan} onChange={e=>af("uan",e.target.value)} placeholder="100987654321"/></div>
              <div className="fgrp"><div className="flbl">PF Account</div><input className="finp" value={addForm.pf_account} onChange={e=>af("pf_account",e.target.value)} placeholder="MH/BAN/12345/000/0000001"/></div>
              <div className="fgrp"><div className="flbl">Bank Name</div><input className="finp" value={addForm.bank_name} onChange={e=>af("bank_name",e.target.value)} placeholder="HDFC Bank"/></div>
              <div className="fgrp"><div className="flbl">Account Number</div><input className="finp" value={addForm.bank_account_no} onChange={e=>af("bank_account_no",e.target.value)} placeholder="12345678901234"/></div>
              <div className="fgrp"><div className="flbl">IFSC Code</div><input className="finp" value={addForm.ifsc} onChange={e=>af("ifsc",e.target.value.toUpperCase())} placeholder="HDFC0001234"/></div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

// ─── ORG CHART ─────────────────────────────────────────────────────────────────
const OrgMod = ({ currentUser }) => {
  const isFullView = canViewAll(currentUser);
  const empScrollRef = useRef(null);
  const fullScrollRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const main = document.querySelector('.main');
      if (!main) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        main.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };
    const els = [empScrollRef.current, fullScrollRef.current].filter(Boolean);
    els.forEach(el => el.addEventListener('wheel', handler, { passive: false }));
    return () => els.forEach(el => el.removeEventListener('wheel', handler));
  }, [isFullView]);

  const renderOrgCard = (emp, extra) => {
    const isYou = emp.id === currentUser.id;
    const cls = isYou ? "org-card is-you" : emp.accessLevel >= 3 ? "org-card is-root" : emp.accessLevel === 2 ? "org-card is-lead" : "org-card";
    return (
      <div className={cls} style={{ minWidth:100, maxWidth:118, ...extra }}>
        <div className="avt" style={{ width:34, height:34, fontSize:12, background:emp.color, margin:"0 auto" }}>{emp.firstName[0]}{emp.lastName[0]}</div>
        <div className="org-card-name">{emp.firstName}<br/>{emp.lastName}</div>
        <div className="org-card-role">{emp.role.split(" ").slice(0,3).join(" ")}</div>
        {isYou && <div className="org-card-badge" style={{ background:"var(--green-soft)",color:"var(--green)" }}>You</div>}
      </div>
    );
  };

  const renderTeamGroup = (lead) => {
    const members = (lead.reports || []).map(id => ALL_USERS.find(u => u.id === id)).filter(Boolean);
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        {renderOrgCard(lead)}
        {members.length > 0 && <>
          <div className="org-connector-v"/>
          <div style={{ position:"relative", padding:"12px 10px 10px", border:"1px solid var(--brd)", borderRadius:"var(--r12)", background:"var(--raised)" }}>
            <div style={{ position:"absolute", top:-10, left:10, background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r999)", padding:"2px 10px", fontSize:9, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
              {lead.role.split(" ").slice(0,2).join(" ")} · {members.length}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth: members.length <= 3 ? members.length * 126 : 400 }}>
              {members.map(m => <div key={m.id}>{renderOrgCard(m)}</div>)}
            </div>
          </div>
        </>}
      </div>
    );
  };

  // Build manager chain from current user up to root (for employee view).
  const buildManagerChain = (emp) => {
    const chain = [];
    let cur = emp;
    while (cur.mgr) {
      const mgr = ALL_USERS.find(u => u.id === cur.mgr);
      if (!mgr || chain.find(c => c.id === mgr.id)) break;
      chain.unshift(mgr);
      cur = mgr;
    }
    return chain;
  };

  const ceo = ALL_USERS.find(u => !u.mgr);
  const deptHeads = ceo?.reports?.map(id => ALL_USERS.find(u => u.id === id)).filter(Boolean) || [];
  const mgrChain = isFullView ? [] : buildManagerChain(currentUser);
  const directReports = (currentUser.reports || []).map(id => ALL_USERS.find(u => u.id === id)).filter(Boolean);
  // Team peers: everyone who shares the same direct manager
  const teamPeers = currentUser.mgr ? ALL_USERS.filter(u => u.mgr === currentUser.mgr && u.id !== currentUser.id) : [];

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">Organisation</div>
          <div className="ph-title">Org Chart</div>
          <div className="ph-sub">{isFullView ? "Full company hierarchy" : "Your position in the reporting chain"}</div>
        </div>
      </div>

      {/* ── Employee view: reporting chain ── */}
      {!isFullView && (
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="org" s={14}/>My Reporting Chain</div>
            <div className="t3 tsm">{currentUser.dept} · {currentUser.role}</div>
          </div>
          <div ref={empScrollRef} style={{ padding:"28px 20px", overflowX:"auto", overscrollBehavior:"none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
              {/* Manager chain above */}
              {mgrChain.map(mgr => (
                <div key={mgr.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                  {renderOrgCard(mgr)}
                  <div className="org-connector-v" style={{ height: 24 }}/>
                </div>
              ))}
              {/* Current user + team peers at the same level */}
              {teamPeers.length > 0 ? (
                <div style={{ position:"relative", padding:"16px 12px 12px", border:"1px solid var(--brd)", borderRadius:"var(--r12)", background:"var(--raised)" }}>
                  <div style={{ position:"absolute", top:-10, left:12, background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r999)", padding:"2px 10px", fontSize:9, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
                    {currentUser.dept} Team · {teamPeers.length + 1}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth: (teamPeers.length + 1) <= 4 ? (teamPeers.length + 1) * 126 : 520 }}>
                    {teamPeers.map(p => <div key={p.id}>{renderOrgCard(p)}</div>)}
                    <div>{renderOrgCard(currentUser)}</div>
                  </div>
                </div>
              ) : (
                renderOrgCard(currentUser)
              )}
              {/* Direct reports below */}
              {directReports.length > 0 && <>
                <div className="org-connector-v" style={{ height:24 }}/>
                <div style={{ position:"relative", padding:"16px 12px 12px", border:"1px solid var(--brd)", borderRadius:"var(--r12)", background:"var(--raised)" }}>
                  <div style={{ position:"absolute", top:-10, left:12, background:"var(--surface)", border:"1px solid var(--brd)", borderRadius:"var(--r999)", padding:"2px 10px", fontSize:9, fontWeight:700, color:"var(--ink4)", textTransform:"uppercase", letterSpacing:"0.5px", whiteSpace:"nowrap" }}>
                    Direct Reports · {directReports.length}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth: directReports.length <= 3 ? directReports.length * 126 : 420 }}>
                    {directReports.map(r => <div key={r.id}>{renderOrgCard(r)}</div>)}
                  </div>
                </div>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* ── Full org tree (managers/directors) ── */}
      {isFullView && (
        <div className="card">
          <div className="ch"><div className="ct"><Icon n="org" s={14}/>Full Org Tree</div></div>
          <div ref={fullScrollRef} style={{ padding:"24px 20px", overflowX:"auto", overscrollBehavior:"none" }}>
            {ceo && <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:24 }}>
              {renderOrgCard(ceo)}
              <div className="org-connector-v" style={{ height:28 }}/>
              <div style={{ width:"60%", height:1, background:"var(--brd2)" }}/>
            </div>}
            {deptHeads.map(head => {
              const subManagers = (head.reports || []).map(id => ALL_USERS.find(u => u.id === id)).filter(Boolean);
              return (
                <div key={head.id} className="org-dept-section">
                  <div className="org-dept-header"><div className="org-dept-line"/><div className="org-dept-title">{head.dept}</div><div className="org-dept-line"/></div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:16 }}>
                    {renderOrgCard(head)}
                    {subManagers.length > 0 && <div className="org-connector-v" style={{ height:24 }}/>}
                  </div>
                  {subManagers.length > 0 && (
                    <div style={{ display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap" }}>
                      {subManagers.map(mgr => <div key={mgr.id}>{renderTeamGroup(mgr)}</div>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── PERFORMANCE ───────────────────────────────────────────────────────────────
const PerfMod = ({ currentUser, deepLink }) => {
  const [tab, setTab] = useUrlTab("goals", deepLink);
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [gTitle, setGTitle]     = useState("");
  const [gTarget, setGTarget]   = useState("");
  const [gNotes, setGNotes]     = useState("");
  const [gProgress, setGProgress] = useState(0);
  const [gStatus, setGStatus]   = useState("on-track");
  const [gIsKey, setGIsKey]     = useState(false);
  const [gSaving, setGSaving]   = useState(false);
  const [reviews, setReviews]           = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rvEmployeeId, setRvEmployeeId] = useState(currentUser.id);
  const [rvPeriod, setRvPeriod]         = useState("");
  const [rvScore, setRvScore]           = useState("");
  const [rvFeedback, setRvFeedback]     = useState("");
  const [rvStatus, setRvStatus]         = useState("pending");
  const [rvDate, setRvDate]             = useState("");
  const [rvSaving, setRvSaving]         = useState(false);


  const [reviewTarget, setReviewTarget] = useState(currentUser.id);

  const visibleEmps = getVisibleEmps(currentUser);
  const quarter = currentQuarterLabel();
  const canAddReview = canManage(currentUser) || currentUser.isHR;

  useEffect(() => {
    apiFetch(`${API_URL}/api/goals?employee_id=${currentUser.id}`)
      .then(r => r.json())
      .then(d => setGoals(d.goals || []))
      .catch(() => {})
      .finally(() => setGoalsLoading(false));
  }, [currentUser.id]);

  const loadReviews = (empId) => {
    apiFetch(`${API_URL}/api/perf/reviews/${empId}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => { loadReviews(reviewTarget); }, [reviewTarget]);

  const openGoalModal = () => {
    setGTitle(""); setGTarget(""); setGNotes(""); setGProgress(0); setGStatus("on-track"); setGIsKey(false);
    setShowGoalModal(true);
  };

  const handleAddGoal = async () => {
    if (!gTitle.trim()) return;
    setGSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/goals`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: currentUser.id, title: gTitle.trim(), target: gTarget.trim(), notes: gNotes.trim(), isKey: gIsKey, progress: Number(gProgress), status: gStatus, quarter }),
      });
      const data = await res.json();
      if (data.ok) { setGoals(p => [data.goal, ...p]); setShowGoalModal(false); }
    } catch { /* ignore */ } finally { setGSaving(false); }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    setGoals(p => p.filter(g => g.id !== id));
    try { await apiFetch(`${API_URL}/api/goals/${id}`, { method: "DELETE" }); } catch { /* ignore */ }
  };

  const openReviewModal = () => {
    setRvEmployeeId(currentUser.id); setRvPeriod(""); setRvScore("");
    setRvFeedback(""); setRvStatus("pending"); setRvDate("");
    setShowReviewModal(true);
  };

  const handleAddReview = async () => {
    if (!rvPeriod.trim()) return;
    setRvSaving(true);
    try {
      const res = await apiFetch(`${API_URL}/api/perf/reviews`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: rvEmployeeId, reviewerId: currentUser.id, period: rvPeriod.trim(), score: rvScore ? parseFloat(rvScore) : null, feedback: rvFeedback.trim(), status: rvStatus, reviewDate: rvDate || null }),
      });
      const data = await res.json();
      if (data.ok) { if (rvEmployeeId === reviewTarget) loadReviews(reviewTarget); setShowReviewModal(false); }
    } catch { /* ignore */ } finally { setRvSaving(false); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setReviews(p => p.filter(r => r.id !== id));
    try { await apiFetch(`${API_URL}/api/perf/reviews/${id}`, { method: "DELETE" }); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="ph"><div><div className="ph-eyebrow">People</div><div className="ph-title">Performance</div><div className="ph-sub">Goals, OKRs and review cycles</div></div><button className="btn btn-p" onClick={openGoalModal}><Icon n="plus" s={13}/>Add Goal</button></div>
      <div className="sg">{[
        { v:currentUser.perf,l:"My Perf Score",s:"Last review",c:"#0F8C5A" },
        { v:goals.filter(g=>g.status==="on-track").length,l:"On Track",s:"Active goals",c:"#1B45F5" },
        { v:goals.filter(g=>g.status==="at-risk").length,l:"At Risk",s:"Need attention",c:"#B06010" },
        { v:quarter,l:"Current Quarter",s:"Review cycle",c:"#5C35C2" },
      ].map((s,i)=>(
        <div className="sc" key={i}>
          <div className="sc-accent" style={{ background:s.c }}/>
          <div className="sc-val" style={{ marginTop:10 }}>{s.v}</div>
          <div className="sc-lbl">{s.l}</div>
          <div className="sc-sub">{s.s}</div>
        </div>
      ))}</div>
      <div className="tabs">{["goals","reviews",...(canManage(currentUser)?["team"]:[])].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t==="goals"?"My Goals":t==="reviews"?"Reviews":"Team"}</div>)}</div>
      {tab==="goals"&&<div className="card"><div className="ch"><div className="ct"><Icon n="target" s={14}/>My Goals — {quarter}</div></div><div style={{ padding:0 }}>{goalsLoading?<div className="cb t3 tsm" style={{ textAlign:"center",padding:24 }}>Loading…</div>:goals.length===0?<div className="cb t3 tsm" style={{ textAlign:"center",padding:32 }}>No goals yet — click <strong>Add Goal</strong> to get started.</div>:goals.map((g)=>(<div key={g.id} style={{ padding:"12px 14px",borderBottom:"1px solid var(--brd)" }}><div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:6 }}><div style={{ flex:1 }}><div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:2 }}><div className="fw7" style={{ fontSize:13 }}>{g.title}</div>{g.is_key&&<span className="bdg bdg-p" style={{ fontSize:9.5 }}>KEY</span>}</div>{(g.target||g.notes)&&<div className="t3 tsm">{g.target?"Target: "+g.target:""}{g.target&&g.notes?" · ":""}{g.notes}</div>}</div><span className={`bdg ${g.status==="on-track"?"bdg-g":"bdg-a"}`}>{g.status==="on-track"?"On Track":"At Risk"}</span><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:g.progress>=75?"var(--green)":"var(--amber)",minWidth:38,textAlign:"right" }}>{g.progress}%</span><button className="btn btn-sm" style={{ padding:"3px 7px",color:"var(--red)",background:"var(--red-soft)",borderColor:"transparent" }} onClick={()=>handleDeleteGoal(g.id)}><Icon n="x" s={11}/></button></div><div className="pt" style={{ height:5 }}><div className="pf" style={{ width:`${g.progress}%`,background:g.status==="on-track"?"var(--green)":"var(--amber)" }}/></div></div>))}</div></div>}
      {tab==="reviews"&&(
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="star" s={14}/>Review Cycles</div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              {canAddReview && (
                <select className="fsel" style={{ fontSize:12,height:30,padding:"0 8px" }} value={reviewTarget} onChange={e=>{ setReviewTarget(e.target.value); }}>
                  {visibleEmps.map(e=><option key={e.id} value={e.id}>{e.name}{e.id===currentUser.id?" (You)":""}</option>)}
                </select>
              )}
              {canAddReview && <button className="btn btn-p btn-sm" onClick={openReviewModal}><Icon n="plus" s={12}/>Add Review</button>}
            </div>
          </div>
          <div className="cb">
            {reviewsLoading ? <div className="t3 tsm" style={{ textAlign:"center",padding:24 }}>Loading…</div>
            : reviews.length === 0 ? <div className="t3 tsm" style={{ textAlign:"center",padding:32 }}>No reviews yet{canAddReview ? " — click Add Review to create one." : "."}</div>
            : reviews.map(r => (
              <div key={r.id} className="review-card" style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px 0",borderBottom:"1px solid var(--brd)" }}>
                {r.score ? <div className="score-circle" style={{ background:r.score>=4.5?"var(--green-soft)":"var(--accent-soft)",color:r.score>=4.5?"var(--green)":"var(--accent)",flexShrink:0 }}>{r.score}</div>
                : <div className="score-circle" style={{ background:"var(--raised)",color:"var(--ink4)",fontSize:12,flexShrink:0 }}>TBD</div>}
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex",gap:7,alignItems:"center",marginBottom:3 }}>
                    <div className="fw7" style={{ fontSize:13 }}>{r.period}</div>
                    {r.status==="complete"?<span className="bdg bdg-g">Done</span>:<span className="bdg bdg-a">Pending</span>}
                  </div>
                  <div className="t3 tsm">{r.reviewer_id ? (ALL_USERS.find(e=>e.id===r.reviewer_id)?.name || r.reviewer_id) : "—"}{r.review_date ? " · "+r.review_date : ""}</div>
                  {r.feedback && <div style={{ fontSize:12,color:"var(--ink2)",marginTop:6,padding:"6px 10px",background:"var(--raised)",borderRadius:"var(--r8)",borderLeft:"2px solid var(--accent)" }}>{r.feedback}</div>}
                </div>
                {canAddReview && <button className="btn btn-sm" style={{ color:"var(--red)",background:"var(--red-soft)",borderColor:"transparent",flexShrink:0 }} onClick={()=>handleDeleteReview(r.id)}><Icon n="x" s={11}/></button>}
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="team"&&canManage(currentUser)&&<div className="card"><div className="ch"><div className="ct"><Icon n="users" s={14}/>Team Performance</div></div><div className="tw"><table><thead><tr><th>Employee</th><th>Role</th><th>Score</th><th>Rating</th></tr></thead><tbody>{visibleEmps.filter(e=>e.id!==currentUser.id).map(e=><tr key={e.id}><td><div style={{ display:"flex",alignItems:"center",gap:8 }}><div className="avt" style={{ width:26,height:26,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div className="fw7">{e.name}</div></div></td><td className="t3 tsm">{e.role}</td><td><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:e.perf>=4.5?"var(--green)":e.perf>=4?"var(--accent)":"var(--amber)" }}>{e.perf}</span></td><td><span className={`bdg ${e.perf>=4.5?"bdg-g":e.perf>=4?"bdg-b":"bdg-a"}`}>{e.perf>=4.5?"Excellent":e.perf>=4?"Good":"Needs Work"}</span></td></tr>)}</tbody></table></div></div>}

      {showGoalModal&&<Modal title="Add Goal" onClose={()=>setShowGoalModal(false)} footer={
        <><button className="btn btn-ghost" onClick={()=>setShowGoalModal(false)}>Cancel</button><button className="btn btn-p" onClick={handleAddGoal} disabled={!gTitle.trim()||gSaving}>{gSaving?"Saving…":"Add Goal"}</button></>
      }>
        <div className="fg">
          <div className="ff" style={{ gridColumn:"1/-1" }}><label className="flbl">Goal Title *</label><input className="finp" placeholder="e.g. Improve customer satisfaction score" value={gTitle} onChange={e=>setGTitle(e.target.value)}/></div>
          <div className="ff"><label className="flbl">Target / Metric</label><input className="finp" placeholder="e.g. NPS ≥ 70" value={gTarget} onChange={e=>setGTarget(e.target.value)}/></div>
          <div className="ff"><label className="flbl">Status</label><select className="fsel" value={gStatus} onChange={e=>setGStatus(e.target.value)}><option value="on-track">On Track</option><option value="at-risk">At Risk</option></select></div>
          <div className="ff" style={{ gridColumn:"1/-1" }}><label className="flbl">Progress — {gProgress}%</label><input type="range" min={0} max={100} value={gProgress} onChange={e=>setGProgress(e.target.value)} style={{ width:"100%",accentColor:"var(--accent)",display:"block",marginTop:6 }}/></div>
          <div className="ff" style={{ gridColumn:"1/-1" }}><label className="flbl">Notes</label><textarea className="ftxt" rows={2} placeholder="Any additional context…" value={gNotes} onChange={e=>setGNotes(e.target.value)}/></div>
          <div className="ff" style={{ gridColumn:"1/-1" }}><label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }}><input type="checkbox" checked={gIsKey} onChange={e=>setGIsKey(e.target.checked)} style={{ accentColor:"var(--accent)",width:15,height:15 }}/><span className="flbl" style={{ margin:0,letterSpacing:0,textTransform:"none",fontSize:13,fontWeight:600 }}>Mark as Key Result</span></label></div>
        </div>
      </Modal>}

      {showReviewModal&&<Modal title="Add Performance Review" onClose={()=>setShowReviewModal(false)} footer={
        <><button className="btn btn-ghost" onClick={()=>setShowReviewModal(false)}>Cancel</button><button className="btn btn-p" onClick={handleAddReview} disabled={!rvPeriod.trim()||rvSaving}>{rvSaving?"Saving…":"Add Review"}</button></>
      }>
        <div className="fg">
          {canAddReview&&<div className="ff" style={{ gridColumn:"1/-1" }}><label className="flbl">Employee *</label><select className="fsel" value={rvEmployeeId} onChange={e=>setRvEmployeeId(e.target.value)}>{visibleEmps.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div>}
          <div className="ff"><label className="flbl">Period *</label><input className="finp" placeholder="e.g. Q2 2026 or Annual 2025" value={rvPeriod} onChange={e=>setRvPeriod(e.target.value)}/></div>
          <div className="ff"><label className="flbl">Status</label><select className="fsel" value={rvStatus} onChange={e=>setRvStatus(e.target.value)}><option value="pending">Pending</option><option value="complete">Complete</option></select></div>
          <div className="ff"><label className="flbl">Score (1–5)</label><input className="finp" type="number" min="1" max="5" step="0.1" placeholder="Leave blank if TBD" value={rvScore} onChange={e=>setRvScore(e.target.value)}/></div>
          <div className="ff"><label className="flbl">Review Date</label><input className="finp" type="date" value={rvDate} onChange={e=>setRvDate(e.target.value)}/></div>
          <div className="ff" style={{ gridColumn:"1/-1" }}><label className="flbl">Feedback</label><textarea className="ftxt" rows={3} placeholder="Write your review comments here…" value={rvFeedback} onChange={e=>setRvFeedback(e.target.value)}/></div>
        </div>
      </Modal>}

    </div>
  );
};

// ─── DOCUMENTS ─────────────────────────────────────────────────────────────────
const DOC_CATS = ["Offer Letter","Payslip","Tax","PF","Policy","Other"];
const DOC_ICONS = { "Offer Letter":"📄","Payslip":"💰","Tax":"🧾","PF":"🏦","Policy":"📋","Other":"📎" };

const DocsMod = ({ currentUser }) => {
  const canManage = canOperatePayroll(currentUser);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFil, setCatFil] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(currentUser.id);
  const [empSearch, setEmpSearch] = useState("");

  // Upload form state
  const [upFile, setUpFile] = useState(null);
  const [upCat, setUpCat] = useState("Other");
  const [upDesc, setUpDesc] = useState("");
  const [upEmpId, setUpEmpId] = useState(currentUser.id);
  const [saving, setSaving] = useState(false);

  const API_DOCS = `${API_URL}/api/documents`;

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);
      const qs = canManage ? "" : `?employee_id=${currentUser.id}`;
      try {
        const res = await apiFetch(`${API_DOCS}${qs}`);
        const data = await res.json();
        setDocs(data.documents || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [API_DOCS, canManage, currentUser.id]);


  const selectedEmp = ALL_USERS.find(u => u.id === selectedEmpId) || null;
  const empDocCount = (empId) => docs.filter(d => d.employee_id === empId).length;

  const visibleEmps = canManage
    ? ALL_USERS.filter(u => empSearch
        ? u.name.toLowerCase().includes(empSearch.toLowerCase()) || u.id.toLowerCase().includes(empSearch.toLowerCase())
        : true)
    : [];

  const profileDocs = docs.filter(d => d.employee_id === selectedEmpId);
  const cats = ["All", ...DOC_CATS.filter(c => profileDocs.some(d => d.category === c))];
  const filtered = profileDocs.filter(d => catFil === "All" || d.category === catFil);

  const handleUpload = async () => {
    if (!upFile) { alert("Please select a file."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("file", upFile);
      fd.append("employeeId", upEmpId);
      fd.append("uploadedBy", currentUser.id);
      fd.append("category", upCat);
      fd.append("description", upDesc);
      const res = await apiFetch(`${API_DOCS}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.ok) { setDocs(p => [data.document, ...p]); setShowUpload(false); setUpFile(null); setUpDesc(""); }
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const fmtSize = (b) => b ? (b < 1024 ? `${b} B` : b < 1048576 ? `${(b/1024).toFixed(1)} KB` : `${(b/1048576).toFixed(1)} MB`) : "";
  const fmtDate = (s) => s ? new Date(s).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "";

  return (
    <div>
      <div className="ph">
        <div>
          <div className="ph-eyebrow">Documents</div>
          <div className="ph-title">Document Vault</div>
          <div className="ph-sub">Upload and manage letters, payslips, tax documents and policies</div>
        </div>
        <button className="btn btn-p" onClick={() => { setUpEmpId(selectedEmpId); setShowUpload(true); }}><Icon n="plus" s={13}/> Upload Document</button>
      </div>

      {/* Stats — always based on the selected employee's docs */}
      <div className="sg">
        {[
          { v: profileDocs.length, l: "Total", s: "In vault", c: "#1B45F5" },
          { v: profileDocs.filter(d=>d.category==="Tax").length, l: "Tax Docs", s: "Form 16 etc.", c: "#B06010" },
          { v: profileDocs.filter(d=>d.category==="Payslip").length, l: "Payslips", s: "Salary slips", c: "#0F8C5A" },
          { v: profileDocs.filter(d=>d.category==="Policy").length, l: "Policies", s: "HR policies", c: "#5C35C2" },
        ].map((s,i) => (
          <div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>
        ))}
      </div>

      {canManage ? (
        /* Two-pane layout for HR/Director */
        <div className="dir-pane">

          {/* Left: Employee sidebar */}
          <div className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ padding:"10px 12px", borderBottom:"1px solid var(--brd)", background:"var(--raised)" }}>
              <div className="fw6" style={{ fontSize:12, marginBottom:6 }}>Employees</div>
              <input
                className="finp"
                style={{ fontSize:12, padding:"5px 8px", width:"100%", boxSizing:"border-box" }}
                placeholder="Search…"
                value={empSearch}
                onChange={e => setEmpSearch(e.target.value)}
              />
            </div>
            <div style={{ maxHeight:520, overflowY:"auto" }}>
              {visibleEmps.map(u => {
                const cnt = empDocCount(u.id);
                const active = u.id === selectedEmpId;
                return (
                  <div
                    key={u.id}
                    onClick={() => { setSelectedEmpId(u.id); setCatFil("All"); }}
                    style={{
                      display:"flex", alignItems:"center", gap:9, padding:"9px 12px",
                      borderBottom:"1px solid var(--brd)",
                      background: active ? "var(--accent-soft)" : "transparent",
                      cursor:"pointer", transition:"background .15s",
                    }}
                  >
                    <div className="avt" style={{ width:30, height:30, fontSize:11, background:u.color, flexShrink:0 }}>
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="fw6" style={{ fontSize:12, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", color: active?"var(--accent)":"var(--ink)" }}>{u.name}</div>
                      <div className="t3" style={{ fontSize:11 }}>{u.dept || u.department || ""}</div>
                    </div>
                    {cnt > 0 && <span className="bdg bdg-b" style={{ fontSize:10, flexShrink:0 }}>{cnt}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected employee's documents */}
          <div className="card" style={{ padding:0 }}>
            {/* Profile header */}
            {selectedEmp && (
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderBottom:"1px solid var(--brd)", background:"var(--raised)" }}>
                <div className="avt" style={{ width:38, height:38, fontSize:13, background:selectedEmp.color }}>
                  {selectedEmp.firstName?.[0]}{selectedEmp.lastName?.[0]}
                </div>
                <div>
                  <div className="fw7" style={{ fontSize:14 }}>{selectedEmp.name}</div>
                  <div className="t3 tsm">{selectedEmp.id} · {selectedEmp.dept || selectedEmp.department || selectedEmp.designation || ""}</div>
                </div>
              </div>
            )}
            <div className="ch" style={{ borderBottom:"1px solid var(--brd)" }}>
              <div className="ct" style={{ fontSize:13 }}><Icon n="doc" s={13}/>Documents</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {cats.map(c => <div key={c} className={`pill${catFil===c?" active":""}`} onClick={() => setCatFil(c)} style={{ fontSize:12 }}>{c}</div>)}
              </div>
            </div>
            <div style={{ padding:0 }}>
              {loading && <div style={{ padding:"32px",textAlign:"center",color:"var(--ink4)" }}>Loading…</div>}
              {!loading && filtered.length === 0 && (
                <div style={{ padding:"48px 20px", textAlign:"center" }}>
                  <div style={{ fontSize:32, marginBottom:12 }}>📂</div>
                  <div style={{ fontWeight:600, marginBottom:6 }}>No documents yet</div>
                  <div className="t3 tsm">Click "Upload Document" to add a document for {selectedEmp?.name || "this employee"}.</div>
                </div>
              )}
              {!loading && filtered.map((d) => (
                <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:"1px solid var(--brd)" }}>
                  <div style={{ width:34, height:34, borderRadius:"var(--r8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, background:"var(--accent-soft)", flexShrink:0 }}>
                    {DOC_ICONS[d.category] || "📎"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="fw6" style={{ fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.original_name}</div>
                    <div className="t3 tsm">{fmtSize(d.file_size)} · {fmtDate(d.created_at)}{d.description ? ` · ${d.description}` : ""}</div>
                  </div>
                  <span className="bdg bdg-b" style={{ flexShrink:0 }}>{d.category}</span>
                  <a href={`${API_URL}/api/documents/${d.id}/view`} target="_blank" rel="noreferrer" className="btn btn-sm btn-p" style={{ textDecoration:"none", flexShrink:0 }}><Icon n="eye" s={12}/> View</a>
                  <a href={`${API_URL}/api/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>↓ Download</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Single-pane for regular employees — own docs only */
        <div className="card">
          <div className="ch">
            <div className="ct"><Icon n="doc" s={14}/>My Documents</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {cats.map(c => <div key={c} className={`pill${catFil===c?" active":""}`} onClick={() => setCatFil(c)}>{c}</div>)}
            </div>
          </div>
          <div style={{ padding:0 }}>
            {loading && <div style={{ padding:"32px",textAlign:"center",color:"var(--ink4)" }}>Loading…</div>}
            {!loading && filtered.length === 0 && (
              <div style={{ padding:"48px 20px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📂</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>No documents yet</div>
                <div className="t3 tsm">Your HR team will upload documents here for you.</div>
              </div>
            )}
            {!loading && filtered.map((d) => (
              <div key={d.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderBottom:"1px solid var(--brd)" }}>
                <div style={{ width:36, height:36, borderRadius:"var(--r8)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, background:"var(--accent-soft)", flexShrink:0 }}>
                  {DOC_ICONS[d.category] || "📎"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="fw6" style={{ fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.original_name}</div>
                  <div className="t3 tsm">{fmtSize(d.file_size)} · {fmtDate(d.created_at)}{d.description ? ` · ${d.description}` : ""}</div>
                </div>
                <span className="bdg bdg-b" style={{ flexShrink:0 }}>{d.category}</span>
                <a href={`${API_URL}/api/documents/${d.id}/view`} target="_blank" rel="noreferrer" className="btn btn-sm btn-p" style={{ textDecoration:"none", flexShrink:0 }}><Icon n="eye" s={12}/> View</a>
                <a href={`${API_URL}/api/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ textDecoration:"none", flexShrink:0 }}>↓ Download</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {showUpload && (
        <Modal title={`Upload Document${canManage && selectedEmp ? ` — ${selectedEmp.name}` : ""}`}
          onClose={() => { setShowUpload(false); setUpFile(null); setUpDesc(""); }}
          footer={<>
            <button className="btn btn-ghost" onClick={() => { setShowUpload(false); setUpFile(null); setUpDesc(""); }}>Cancel</button>
            <button className="btn btn-p" onClick={handleUpload} disabled={saving || !upFile}>{saving ? "Uploading…" : "Upload"}</button>
          </>}>
          <div className="fg">
            <div className="ff" style={{ gridColumn:"1/-1" }}>
              <label className="flbl">File *</label>
              <input type="file" onChange={e => setUpFile(e.target.files[0])} style={{ width:"100%", padding:"7px 10px", border:"1px solid var(--brd2)", borderRadius:"var(--r8)", fontSize:13, background:"var(--surface)", boxSizing:"border-box" }}/>
            </div>
            <div className="ff">
              <label className="flbl">Category</label>
              <select className="fsel" value={upCat} onChange={e => setUpCat(e.target.value)}>
                {DOC_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {canManage && (
              <div className="ff">
                <label className="flbl">Employee</label>
                <select className="fsel" value={upEmpId} onChange={e => setUpEmpId(e.target.value)}>
                  {ALL_USERS.map(u => <option key={u.id} value={u.id}>{u.name} ({u.id})</option>)}
                </select>
              </div>
            )}
            <div className="ff" style={{ gridColumn:"1/-1" }}>
              <label className="flbl">Description (optional)</label>
              <input className="finp" type="text" value={upDesc} onChange={e => setUpDesc(e.target.value)} placeholder="e.g. Offer letter — joining date 1 Jan 2025"/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
const ANN_CATS = ["Company","HR","IT","Facility","Celebration"];
const ANN_CAT_STYLE = { Company:"bdg-b", HR:"bdg-p", Celebration:"bdg-g", IT:"bdg-a", Facility:"bdg-t" };
const ANN_EMPTY_FORM = { title:"", body:"", category:"Company", isImportant:false };
const API_ANN = (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/api/announcements";

const AnnMod = ({ currentUser }) => {
  const canManage = canOperatePayroll(currentUser); // Director + HR only
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState(null);       // null=closed | "new" | {id} = edit
  const [formData, setFormData] = useState(ANN_EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Load from API
  useEffect(() => {
    apiFetch(API_ANN)
      .then(r => r.json())
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cats = ["All", ...ANN_CATS.filter(c => announcements.some(a => a.category === c))];
  const filtered = announcements.filter(a => filter === "All" || a.category === filter);

  const openNew = () => { setFormData(ANN_EMPTY_FORM); setForm("new"); };
  const openEdit = (a) => { setFormData({ title:a.title, body:a.body, category:a.category, isImportant:a.is_important }); setForm(a.id); };

  const handleSave = async () => {
    if (!formData.title.trim()) { alert("Title is required."); return; }
    if (!formData.body.trim())  { alert("Body is required."); return; }
    setSaving(true);
    try {
      if (form === "new") {
        const res = await apiFetch(API_ANN, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ ...formData, authorId:currentUser.id, authorName:currentUser.name }),
        });
        const data = await res.json();
        if (data.ok) setAnnouncements(p => [data.announcement, ...p]);
      } else {
        const res = await apiFetch(`${API_ANN}/${form}`, {
          method:"PUT", headers:{"Content-Type":"application/json"},
          body:JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.ok) setAnnouncements(p => p.map(a => a.id === form ? data.announcement : a));
      }
      setForm(null);
    } catch (error) {
      console.error(error);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await apiFetch(`${API_ANN}/${id}`, { method:"DELETE" });
      setAnnouncements(p => p.filter(a => a.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (error) { console.error(error); } finally { setDeleting(null); }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div className="ph">
        <div>
          <div className="ph-eyebrow">Communications</div>
          <div className="ph-title">Announcements</div>
          <div className="ph-sub">Company news, HR updates and important notices</div>
        </div>
        {canManage && (
          <button className="btn btn-p" onClick={openNew}><Icon n="plus" s={13}/>Post Announcement</button>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="sg" style={{ marginBottom:14 }}>
        {[
          { v:announcements.length,                                            l:"Total",       c:"var(--accent)" },
          { v:announcements.filter(a=>a.is_important).length,                  l:"Important",   c:"var(--red)" },
          { v:announcements.filter(a=>a.category==="HR").length,               l:"HR",          c:"var(--purple)" },
          { v:announcements.filter(a=>a.category==="Company").length,          l:"Company",     c:"var(--accent)" },
        ].map((s,i) => (
          <div className="sc" key={i}>
            <div className="sc-accent" style={{ background:s.c }}/>
            <div className="sc-val" style={{ marginTop:10, fontSize:22 }}>{s.v}</div>
            <div className="sc-lbl">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Filter pills ── */}
      <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {cats.map(c => <div key={c} className={`pill${filter===c?" active":""}`} onClick={()=>setFilter(c)}>{c}</div>)}
      </div>

      {/* ── Announcement list ── */}
      {loading ? (
        <div style={{ padding:40, textAlign:"center", color:"var(--ink3)" }}>Loading announcements…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding:48, textAlign:"center", color:"var(--ink3)" }}>
          <div style={{ fontSize:36, marginBottom:10 }}>📢</div>
          <div className="fw7" style={{ fontSize:15 }}>No announcements yet</div>
          {canManage && <div className="t3 tsm" style={{ marginTop:6 }}>Click "Post Announcement" to publish one</div>}
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.map(a => {
            const isOpen = expanded === a.id;
            return (
              <div key={a.id} className="card" style={{ marginBottom:0, borderLeft:`3px solid ${a.is_important?"var(--red)":"var(--accent)"}` }}>
                {/* Title row */}
                <div style={{ padding:"14px 18px", cursor:"pointer" }} onClick={()=>setExpanded(isOpen ? null : a.id)}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7, flexWrap:"wrap" }}>
                    <span className={`bdg ${ANN_CAT_STYLE[a.category]||"bdg-gray"}`}>{a.category}</span>
                    {a.is_important && <span className="bdg bdg-r" style={{ fontSize:10 }}>⚠ Important</span>}
                    <span className="t3 tsm" style={{ marginLeft:"auto" }}>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN",{ day:"numeric", month:"short", year:"numeric" }) : ""}</span>
                  </div>
                  <div style={{ fontWeight:700, fontSize:13.5, marginBottom:4 }}>{a.title}</div>
                  {!isOpen && (
                    <div className="t3 tsm" style={{ lineHeight:1.65 }}>
                      {a.body.length > 160 ? a.body.substring(0,160)+"…" : a.body}
                    </div>
                  )}
                </div>

                {/* Expanded body */}
                {isOpen && (
                  <div style={{ padding:"0 18px 14px" }}>
                    <div className="t3" style={{ lineHeight:1.75, whiteSpace:"pre-wrap", fontSize:13 }}>{a.body}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:14, paddingTop:12, borderTop:"1px solid var(--brd)" }}>
                      <div style={{ fontSize:11.5, color:"var(--ink4)" }}>
                        Posted by <span style={{ fontWeight:600, color:"var(--ink3)" }}>{a.author_name || "—"}</span>
                      </div>
                      {canManage && (
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="btn btn-sm" onClick={e=>{e.stopPropagation();openEdit(a);}}>Edit</button>
                          <button className="btn btn-sm" style={{ color:"var(--red)" }} disabled={deleting===a.id}
                            onClick={e=>{e.stopPropagation();handleDelete(a.id);}}>
                            {deleting===a.id?"Deleting…":"Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Post / Edit Modal ── */}
      {form !== null && (
        <Modal
          title={form === "new" ? "Post New Announcement" : "Edit Announcement"}
          onClose={() => setForm(null)}
          footer={<>
            <button className="btn" onClick={()=>setForm(null)}>Cancel</button>
            <button className="btn btn-p" onClick={handleSave} disabled={saving}>
              <Icon n="plus" s={13}/>{saving ? "Saving…" : form==="new" ? "Post Announcement" : "Save Changes"}
            </button>
          </>}
        >
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <div className="fgrp">
              <div className="flbl">Title *</div>
              <input className="finp" placeholder="e.g. Q2 Results — Record Growth!" value={formData.title}
                onChange={e=>setFormData(p=>({...p,title:e.target.value}))}/>
            </div>
            <div className="fgrp">
              <div className="flbl">Body *</div>
              <textarea className="finp" rows={5} placeholder="Write the full announcement here…"
                style={{ resize:"vertical", fontFamily:"inherit", lineHeight:1.6 }}
                value={formData.body} onChange={e=>setFormData(p=>({...p,body:e.target.value}))}/>
            </div>
            <div className="g2" style={{ gap:10 }}>
              <div className="fgrp">
                <div className="flbl">Category</div>
                <select className="fsel" value={formData.category} onChange={e=>setFormData(p=>({...p,category:e.target.value}))}>
                  {ANN_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="fgrp">
                <div className="flbl">Priority</div>
                <select className="fsel" value={formData.isImportant?"important":"normal"}
                  onChange={e=>setFormData(p=>({...p,isImportant:e.target.value==="important"}))}>
                  <option value="normal">Normal</option>
                  <option value="important">⚠ Important</option>
                </select>
              </div>
            </div>
            <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(27,69,245,0.15)", borderRadius:"var(--r8)", padding:"10px 12px", fontSize:12, color:"var(--accent)" }}>
              This announcement will be visible to <strong>all employees</strong> immediately after posting.
            </div>
          </div>
        </Modal>
      )}
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
        { v:"—",l:"Attrition YTD",s:"No data yet",c:"#C8312A" },
        { v:`₹${Math.round(totalPayroll/100000).toFixed(1)}L`,l:"Monthly Payroll",s:"Gross",c:"#0F8C5A" },
        { v:avgPerf,l:"Avg Perf",s:isCompanyWide?"Company":"Your team",c:"#5C35C2" },
      ].map((s,i)=>(
        <div className="sc" key={i}><div className="sc-accent" style={{ background:s.c }}/><div className="sc-val" style={{ marginTop:10 }}>{s.v}</div><div className="sc-lbl">{s.l}</div><div className="sc-sub">{s.s}</div></div>
      ))}</div>
      <div className="tabs">{["overview","employees"].map(t=><div key={t} className={`tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</div>)}</div>
      {tab==="overview"&&<div className="g2">
        <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Headcount by Dept</div></div><div className="cb"><div style={{ display:"flex",alignItems:"flex-end",gap:10,height:140,justifyContent:"space-around",borderBottom:"1px solid var(--brd)",paddingBottom:8,marginBottom:8 }}>{deptCount.map((d,i)=>{ const h=Math.round((d.count/maxCount)*110); return (<div key={d.name} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1 }}><div style={{ fontFamily:"var(--mono)",fontWeight:750,fontSize:12,color:barColors[i%barColors.length] }}>{d.count}</div><div style={{ width:32,height:h,borderRadius:"var(--r4) var(--r4) 0 0",background:barColors[i%barColors.length] }}/><div style={{ fontSize:9,color:"var(--ink3)",textAlign:"center" }}>{d.name.slice(0,5)}</div></div>);})}
        </div></div></div>
        <div className="card" style={{ marginBottom:0 }}><div className="ch"><div className="ct">Payroll by Dept</div></div><div className="cb">{payroll.sort((a,b)=>b.cost-a.cost).map((p,i)=>(<div key={p.dept} className="lbar"><div style={{ minWidth:110 }}><div style={{ fontWeight:650,fontSize:12 }}>{p.dept}</div></div><div style={{ flex:1,margin:"0 10px" }} className="lbar-t"><div className="lbar-f" style={{ width:`${(p.cost/totalPayroll)*100}%`,background:barColors[i%barColors.length] }}/></div><span style={{ fontFamily:"var(--mono)",fontWeight:700,fontSize:12,color:"var(--accent)",minWidth:60,textAlign:"right" }}>₹{Math.round(p.cost/1000)}K</span></div>))}</div></div>
      </div>}
      {tab==="employees"&&<div className="card"><div className="ch"><div className="ct">Employee Performance & Payroll</div></div><div className="tw" style={{ maxHeight:500,overflowY:"auto",overscrollBehavior:"none" }}><table><thead><tr><th>Employee</th><th>Dept</th><th>CTC</th><th>Net/mo</th><th>Score</th><th>Rating</th></tr></thead><tbody>{scopedEmps.map(e=>{ const mon=Math.round(e.ctcLPA*100000/12);const b=Math.round(mon*0.40);const g=mon;const d=Math.round(b*0.12)+200+Math.round(g*0.10);const n=g-d;const canSee=canSeeSensitiveOf(currentUser,e.id); return <tr key={e.id}><td><div style={{ display:"flex",alignItems:"center",gap:7 }}><div className="avt" style={{ width:26,height:26,background:e.color }}>{e.firstName[0]}{e.lastName[0]}</div><div className="fw7">{e.name}</div></div></td><td><span className="bdg bdg-b">{e.dept}</span></td><td className="fw6 mono">{canSee?`₹${e.ctcLPA}L`:"—"}</td><td className="fw6 mono" style={{ color:"var(--green)" }}>{canSee?`₹${Math.round(n/1000)}K`:"—"}</td><td><span style={{ fontFamily:"var(--mono)",fontWeight:750,color:e.perf>=4.5?"var(--green)":e.perf>=4?"var(--accent)":"var(--amber)" }}>{e.perf}</span></td><td><span className={`bdg ${e.perf>=4.5?"bdg-g":e.perf>=4?"bdg-b":"bdg-a"}`}>{e.perf>=4.5?"Excellent":e.perf>=4?"Good":"Needs Work"}</span></td></tr>; })}</tbody></table></div></div>}
    </div>
  );
};

// ─── NAVIGATION PAGES REGISTRY ────────────────────────────────────────────────
// Single source of truth for all sidebar navigation items.
//   id       — matches the switch-case key in HRApp.renderPage()
//   l        — display label in the sidebar
//   i        — Icon component key (defined in the Icon lookup table above)
//   grp      — sidebar section heading (People / Work / Finance / Resources / Insights)
//   minLevel — minimum accessLevel required to see this page (1 = all employees)
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
  { id:"analytics",  l:"Analytics",      i:"analytics",grp:"Insights",  minLevel:2 }, // Lead+ only
];

// ─── APP SHELL ─────────────────────────────────────────────────────────────────
// AppBootstrap is the true root export. It handles the one-time data load from
// the backend API before handing off to HRApp. During loading it renders a
// spinner; on error it renders a retry screen — both using GS styles.
export default function AppBootstrap() {
  // Show login first; bootstrap fires only after a valid token is in place.
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [ready, setReady]   = useState(false);
  const [error, setError]   = useState(null);

  // Run bootstrap only after the user has authenticated
  useEffect(() => {
    if (!authed) return;
    Promise.all([
      apiFetch(`${API_URL}/api/employees/all`).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      apiFetch(`${API_URL}/api/payroll/structure`).then(r => r.json()).catch(() => ({ structure: [] })),
      apiFetch(`${API_URL}/api/payroll/field-configs`).then(r => r.json()).catch(() => ({ fieldConfigs: [] })),
      apiFetch(`${API_URL}/api/payroll/statutory-config`).then(r => r.json()).catch(() => ({ statutoryConfig: [] })),
    ])
      .then(([empData, structData, cfData, statData]) => {
        ALL_USERS = empData.employees;
        window.__HR_ALL_USERS__ = ALL_USERS;

        const s = {};
        (structData.structure || []).forEach(row => { s[row.component_key] = parseFloat(row.value); });
        if (Object.keys(s).length) APP_STRUCTURE = { ...DEFAULT_STRUCTURE, ...s };
        window.__HR_APP_STRUCTURE__ = APP_STRUCTURE;

        APP_CUSTOM_FIELDS = (cfData.fieldConfigs || []).map(f => ({
          id: String(f.id), name: f.name, category: f.category,
          calcType: f.calc_type, value: parseFloat(f.value),
          active: Boolean(f.active), createdBy: f.created_by || "",
        }));
        window.__HR_APP_CUSTOM_FIELDS__ = APP_CUSTOM_FIELDS;

        if ((statData.statutoryConfig || []).length) {
          const sc = {};
          statData.statutoryConfig.forEach(row => {
            try { sc[row.config_key] = JSON.parse(row.value); }
            catch { sc[row.config_key] = row.value; }
          });
          APP_STATUTORY_CFG = sc;
        }
        window.__HR_APP_STATUTORY_CFG__ = APP_STATUTORY_CFG;

        setReady(true);
      })
      .catch((err) => {
        if (err.message === "401") { clearToken(); setAuthed(false); }
        else setError("Could not connect to the server. Make sure the backend is running.");
      });
  }, [authed]);

  // ── Not logged in yet — show login screen ────────────────────────────────
  if (!authed) {
    return (
      <><GS/>
        <LoginScreen onLogin={(u) => {
          localStorage.setItem("doloxe_user", JSON.stringify(u));
          setAuthed(true);
        }}/>
      </>
    );
  }

  if (error) return (<><GS/><div className="login-wrap" style={{ flexDirection:"column", gap:16, textAlign:"center" }}><div style={{ fontSize:36 }}>⚠️</div><div style={{ fontFamily:"var(--display)", fontSize:18, fontWeight:700 }}>Server Unreachable</div><div style={{ color:"var(--ink3)", fontSize:13, maxWidth:340 }}>{error}</div><button className="btn btn-p" onClick={() => window.location.reload()}>Retry</button></div></>);

  if (!ready) return (<><GS/><div className="login-wrap" style={{ flexDirection:"column", gap:12 }}><div style={{ width:36, height:36, border:"3px solid var(--accent)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/><div style={{ color:"var(--ink3)", fontSize:13 }}>Loading…</div><style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div></>);

  return <HRApp />;
}

// ForceChangePassword — blocks access to the app until the seeded password is replaced.
// Shown automatically when currentUser.mustChangePassword is true.
const ForceChangePassword = ({ currentUser, onChanged }) => {
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [conf, setConf] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (pw) => {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(pw)) return "Password must include at least one number.";
    if (!/[^a-zA-Z0-9]/.test(pw)) return "Password must include at least one special character.";
    return null;
  };

  const handleSubmit = async () => {
    if (!cur || !nw || !conf) { setErr("All fields are required."); return; }
    const pwErr = validate(nw);
    if (pwErr) { setErr(pwErr); return; }
    if (nw !== conf) { setErr("Passwords do not match."); return; }
    setLoading(true); setErr("");
    try {
      const res = await apiFetch(`${API_URL}/api/auth/change-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: currentUser.id, currentPassword: cur, newPassword: nw }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.detail || "Failed to change password."); return; }
      setMsg("Password set successfully! Taking you in…");
      setTimeout(() => onChanged({ ...currentUser, mustChangePassword: false }), 1200);
    } catch { setErr("Cannot reach server."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 40%,#1e3a8a 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Inter,'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:"var(--surface)", borderRadius:16, width:420, maxWidth:"94vw", boxShadow:"0 24px 64px rgba(0,0,0,0.35)", overflow:"hidden" }}>
        <div style={{ background:"var(--ink)", padding:"20px 24px" }}>
          <div style={{ color:"#fff", fontWeight:800, fontSize:16 }}>Set Your Password</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:3 }}>
            {currentUser.name} · First login — choose a secure password
          </div>
        </div>
        <div style={{ padding:"24px" }}>
          {msg ? (
            <div style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--green-soft)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:24, color:"var(--green)" }}>✓</div>
              <div style={{ fontWeight:700, fontSize:15 }}>{msg}</div>
            </div>
          ) : (
            <>
              <p style={{ fontSize:13, color:"var(--ink3)", marginBottom:18, lineHeight:1.6 }}>
                Your account was created with a temporary password. You must set a personal password before continuing.
              </p>
              <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(27,69,245,0.2)", borderRadius:8, padding:"9px 12px", fontSize:12, color:"var(--accent)", marginBottom:18 }}>
                Requirements: at least 8 characters · one number · one special character
              </div>
              <div className="fgrp" style={{ marginBottom:13 }}>
                <div className="flbl">Temporary Password</div>
                <input className="finp" type="password" placeholder="Enter the password you received" value={cur} onChange={e => { setCur(e.target.value); setErr(""); }}/>
              </div>
              <div className="fgrp" style={{ marginBottom:13 }}>
                <div className="flbl">New Password</div>
                <input className="finp" type="password" placeholder="Min 8 chars, 1 number, 1 special char" value={nw} onChange={e => { setNw(e.target.value); setErr(""); }}/>
              </div>
              <div className="fgrp" style={{ marginBottom: err ? 10 : 20 }}>
                <div className="flbl">Confirm New Password</div>
                <input className="finp" type="password" placeholder="Re-enter new password" value={conf} onChange={e => { setConf(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleSubmit()}/>
              </div>
              {err && <div style={{ background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"8px 12px", fontSize:12.5, color:"var(--red)", fontWeight:600, marginBottom:14 }}>{err}</div>}
              <button className="btn btn-p" style={{ width:"100%", padding:"11px", fontSize:14, fontWeight:700 }} onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving…" : "Set Password & Continue →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// HRApp is the authenticated app shell — only rendered after login succeeds.
// It owns the `currentUser` session and the active `page` ID, both of which
// are passed down as props to every module component.
function HRApp() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { const s = localStorage.getItem("doloxe_user"); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  // URL ?page= wins over the last-used page in localStorage, so a shared/bookmarked
  // link (or a notification click that reloaded the tab) lands on the right module.
  const [page, setPage] = useState(() => getUrlParams().get("page") || localStorage.getItem("doloxe_page") || "dir");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // One-shot instruction telling whichever module renders next which sub-tab to land
  // on — set by a notification click (or the page's initial ?tab=), consumed by that
  // module's useUrlTab(), and explicitly cleared on normal sidebar navigation so a
  // stale deep link can't keep forcing the same tab on every later visit.
  const [pendingDeepLink, setPendingDeepLink] = useState(() => {
    const tab = getUrlParams().get("tab");
    return tab ? { tab, key: 0 } : null;
  });
  // Monotonic counter for pendingDeepLink.key — plain ref increment instead of
  // Date.now()/Math.random(), since those read as impure in a render-reachable scope.
  const deepLinkKeyRef = useRef(0);
  const navigateToPage = (pid) => {
    localStorage.setItem("doloxe_page", pid);
    setPendingDeepLink(null);
    setUrlParams({ page: pid, tab: null });
    setPage(pid);
  };

  // Security Settings modal state (Change Password)
  const [cpOpen, setCpOpen] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpErr, setCpErr] = useState("");
  const [cpMsg, setCpMsg] = useState("");
  const [cpLoading, setCpLoading] = useState(false);

  const resetCp = () => {
    setCpOpen(false);
    setCpCurrent(""); setCpNew(""); setCpConfirm(""); setCpErr(""); setCpMsg("");
  };

  const validateNewPassword = (pw) => {
    if (pw.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(pw)) return "Password must include at least one number.";
    if (!/[^a-zA-Z0-9]/.test(pw)) return "Password must include at least one special character.";
    return null;
  };

  const submitChangePassword = async () => {
    if (!cpCurrent || !cpNew || !cpConfirm) { setCpErr("All fields are required."); return; }
    const pwErr = validateNewPassword(cpNew);
    if (pwErr) { setCpErr(pwErr); return; }
    if (cpNew !== cpConfirm) { setCpErr("New passwords do not match."); return; }
    setCpLoading(true); setCpErr("");
    try {
      const res = await apiFetch(`${API_URL}/api/auth/change-password`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ employeeId: currentUser.id, currentPassword: cpCurrent, newPassword: cpNew }),
      });
      const data = await res.json();
      if (!res.ok) { setCpErr(data.detail || "Failed to change password."); return; }
      setCpMsg("Password changed successfully!");
      setCpCurrent(""); setCpNew(""); setCpConfirm("");
    } catch { setCpErr("Cannot reach server."); }
    finally { setCpLoading(false); }
  };

  // ── Notifications ──────────────────────────────────────────────────────────
  const canReceiveNotifs = currentUser?.isHR || currentUser?.accessLevel >= 4;
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [pendingCounts, setPendingCounts] = useState({ leaves: 0, corrections: 0 });

  const loadNotifs = useCallback(async () => {
    if (!currentUser?.isHR && !(currentUser?.accessLevel >= 4)) return;
    try {
      const r = await apiFetch(`${API_URL}/api/notifications?recipient_id=${currentUser.id}`);
      const d = await r.json();
      setNotifs(d.notifications || []);
    } catch { /* network error — retain last state */ }
  }, [currentUser]);

  const loadPendingCounts = useCallback(async () => {
    if (!currentUser?.isHR && !(currentUser?.accessLevel >= 4)) return;
    try {
      const [lr, cr] = await Promise.all([
        apiFetch(`${API_URL}/api/leaves?status=pending`).then(r => r.json()),
        apiFetch(`${API_URL}/api/attendance/corrections?status=pending`).then(r => r.json()),
      ]);
      setPendingCounts({
        leaves: (lr.leaveRequests || []).length,
        corrections: (cr.corrections || []).length,
      });
    } catch { /* network error — retain last state */ }
  }, [currentUser]);

  // 5s (was 10s) — the practical ceiling for "feels real-time" without a persistent
  // connection. A true push (WebSocket/SSE) would need one, and a long-lived connection
  // is unreliable on Render's free tier (the same spin-down behavior that broke
  // JWT_SECRET earlier kills any open socket too) — so this stays plain stateless
  // polling, just tighter, and visibility-aware so a backgrounded tab doesn't keep
  // hitting the API.
  useEffect(() => {
    const refresh = async () => {
      await Promise.all([loadNotifs(), loadPendingCounts()]);
    };
    refresh();
    let t = setInterval(refresh, 5000);
    const onVisibility = () => {
      if (document.hidden) {
        clearInterval(t);
      } else {
        refresh();
        t = setInterval(refresh, 5000);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisibility); };
  }, [loadNotifs, loadPendingCounts]);

  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Global scroll-chain fix: when any inner scroll container reaches its
  // boundary, forward the remaining delta to .main so the page keeps scrolling.
  useEffect(() => {
    const handleWheel = (e) => {
      const main = document.querySelector('.main');
      if (!main) return;
      let el = e.target;
      while (el && el !== main) {
        const { overflowY, overflowX } = window.getComputedStyle(el);
        const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
        const canScrollX = (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth + 1;
        if (canScrollY) {
          const atTop    = el.scrollTop <= 0;
          const atBottom = el.scrollTop >= el.scrollHeight - el.clientHeight - 1;
          if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
            main.scrollTop += e.deltaY;
            e.preventDefault();
          }
          return;
        }
        // Horizontal-only container: let horizontal gestures go to it, but don't
        // block vertical scroll — keep walking up the tree.
        if (canScrollX && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
        el = el.parentElement;
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);

  const unreadCount = notifs.filter(n => !n.is_read).length;
  const pendingTotal = pendingCounts.leaves + pendingCounts.corrections;
  const badgeCount = pendingTotal > 0 ? pendingTotal : unreadCount;

  const openNotifs = async () => {
    setNotifOpen(true);
    // Always fetch fresh notifications when opening the panel so every
    // request submitted since the last poll is immediately visible.
    try {
      const r = await apiFetch(`${API_URL}/api/notifications?recipient_id=${currentUser.id}`);
      const d = await r.json();
      const fresh = d.notifications || [];
      setNotifs(fresh);
      if (fresh.some(n => !n.is_read)) {
        await apiFetch(`${API_URL}/api/notifications/read-all?recipient_id=${currentUser.id}`, { method: "PUT" });
        setNotifs(fresh.map(n => ({ ...n, is_read: true })));
      }
    } catch { /* ignore */ }
  };

  const clearNotifs = async () => {
    try {
      await apiFetch(`${API_URL}/api/notifications?recipient_id=${currentUser.id}`, { method: "DELETE" });
      setNotifs([]);
    } catch { /* ignore */ }
  };

  // Maps a notification's type to exactly where approving/rejecting it lives —
  // both the top-level module and the sub-tab inside it.
  const NOTIF_DEST = {
    attendance_correction: { page: "attendance", tab: "corrections" },
    leave_request:         { page: "leaves",     tab: "corrections" }, // LeaveMod's approvals queue, internally still named "corrections"
  };
  const handleNotifClick = (n) => {
    const dest = NOTIF_DEST[n.type] || { page: "attendance", tab: "my" };
    localStorage.setItem("doloxe_page", dest.page);
    setUrlParams({ page: dest.page, tab: dest.tab });
    // Incrementing key guarantees this always re-applies, even if the target module
    // is already mounted on the same tab as a previous notification click.
    deepLinkKeyRef.current += 1;
    setPendingDeepLink({ tab: dest.tab, key: deepLinkKeyRef.current });
    setPage(dest.page);
    setNotifOpen(false);
  };

  // Gate the whole app behind login: if no session, render the login screen.
  if (!currentUser) return (<><GS/><LoginScreen onLogin={u => { localStorage.setItem("doloxe_user", JSON.stringify(u)); setCurrentUser(u); navigateToPage("dir"); }}/></>);

  // Force password change on first login before accessing any part of the app.
  if (currentUser.mustChangePassword) return (
    <><GS/><ForceChangePassword currentUser={currentUser} onChanged={u => { localStorage.setItem("doloxe_user", JSON.stringify(u)); setCurrentUser(u); }}/></>
  );

  // Filter the page list to only those the current user's access level permits.
  const visiblePages = PAGES.filter(p => currentUser.accessLevel >= p.minLevel);
  // Derive sidebar section groups in the order they appear in PAGES (preserves order).
  const grps = [...new Set(visiblePages.map(p => p.grp))];

  // Simple switch router — maps the active page key to the corresponding module component.
  const renderPage = () => {
    switch(page) {
      case "dir":        return <DirectoryMod currentUser={currentUser} onCurrentUserUpdate={u=>{ localStorage.setItem("doloxe_user",JSON.stringify(u)); setCurrentUser(u); }}/>;
      case "org":        return <OrgMod currentUser={currentUser}/>;
      case "attendance": return <AttendanceMod currentUser={currentUser} deepLink={pendingDeepLink}/>;
      case "leaves":     return <LeaveMod currentUser={currentUser} deepLink={pendingDeepLink}/>;
      case "timelog":    return <TimeLogMod currentUser={currentUser} deepLink={pendingDeepLink}/>;
      case "perf":       return <PerfMod currentUser={currentUser} deepLink={pendingDeepLink}/>;
      case "docs":       return <DocsMod currentUser={currentUser}/>;
      case "salary":     return <SalaryMod currentUser={currentUser} deepLink={pendingDeepLink}/>;
      case "announce":   return <AnnMod currentUser={currentUser}/>;
      case "analytics":  return <AnalyticsMod currentUser={currentUser}/>;
      default:           return <DirectoryMod currentUser={currentUser} onCurrentUserUpdate={u=>{ localStorage.setItem("doloxe_user",JSON.stringify(u)); setCurrentUser(u); }}/>;
    }
  };


  return (
    <>
      <GS/>
      <div className="app">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="tb-brand">
            <button className="tb-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              <span/><span/><span/>
            </button>
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
            <TopbarClock/>
            {canReceiveNotifs && (
              <div style={{ position:"relative" }} ref={notifRef}>
                <div className="tb-btn" onClick={() => notifOpen ? setNotifOpen(false) : openNotifs()} style={{ position:"relative" }}>
                  <Icon n="bell" s={14}/>
                  {badgeCount > 0 && (
                    <span style={{ position:"absolute", top:-5, right:-5, background:"var(--red)", color:"#fff", borderRadius:"50%", minWidth:16, height:16, fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, padding:"0 3px" }}>
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
                {notifOpen && (
                  <div className="notif-panel" style={{ position:"absolute", right:0, top:"calc(100% + 10px)", width:360, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,0.15)", zIndex:1000, maxHeight:480, display:"flex", flexDirection:"column", overflow:"hidden" }}>
                    <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>Notifications</span>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:12, color:"var(--muted)" }}>
                          {pendingTotal > 0
                            ? [pendingCounts.leaves > 0 && `${pendingCounts.leaves} leave`, pendingCounts.corrections > 0 && `${pendingCounts.corrections} correction`].filter(Boolean).join(", ") + " pending"
                            : unreadCount === 0 ? "All caught up" : `${unreadCount} unread`}
                        </span>
                        {notifs.length > 0 && (
                          <button onClick={clearNotifs} style={{ fontSize:11, color:"var(--muted)", background:"none", border:"none", cursor:"pointer", padding:"2px 6px", borderRadius:4, textDecoration:"underline" }}
                            onMouseEnter={e=>e.currentTarget.style.color="var(--red)"}
                            onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ overflowY:"auto", flex:1 }}>
                      {notifs.length === 0
                        ? <div style={{ padding:24, textAlign:"center", color:"var(--muted)", fontSize:13 }}>No notifications yet</div>
                        : notifs.map(n => (
                          <div key={n.id} onClick={() => handleNotifClick(n)}
                            style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", cursor:"pointer", background: n.is_read ? "transparent" : "rgba(27,69,245,0.04)", transition:"background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background="var(--hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = n.is_read ? "transparent" : "rgba(27,69,245,0.04)"}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                              {!n.is_read && <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", flexShrink:0 }}/>}
                              <span style={{ fontWeight:600, fontSize:13 }}>{n.title}</span>
                              <span style={{ fontSize:10, color:"var(--muted)", marginLeft:"auto", whiteSpace:"nowrap" }}>
                                {(NOTIF_DEST[n.type] || NOTIF_DEST.attendance_correction).page === "leaves" ? "→ Leaves" : "→ Attendance"}
                              </span>
                            </div>
                            <div style={{ fontSize:12, color:"var(--muted)", marginLeft: n.is_read ? 0 : 15 }}>{n.message}</div>
                            <div style={{ fontSize:11, color:"var(--muted)", marginTop:4, marginLeft: n.is_read ? 0 : 15 }}>
                              {new Date(n.created_at).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="tb-user" onClick={() => { setCpOpen(true); setCpErr(""); setCpMsg(""); }} title="Change Password">
              <div className="avt" style={{ width:26, height:26, fontSize:9, background:currentUser.color }}>{currentUser.firstName[0]}{currentUser.lastName[0]}</div>
              <div>
                <div className="tb-uname">{currentUser.firstName} {currentUser.lastName.charAt(0)}.</div>
                <div className="tb-urole">{currentUser.role.split("/")[0].trim()}</div>
              </div>
            </div>
            <button className="btn btn-sm" style={{ color:"var(--red)", borderColor:"rgba(200,49,42,0.2)", background:"var(--red-soft)", gap:5, fontWeight:650 }} onClick={()=>{ localStorage.removeItem("doloxe_user"); clearToken(); setCurrentUser(null); }}>
              <Icon n="logout" s={12}/><span className="sign-out-label">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Sidebar overlay — tapping it closes the sidebar on mobile */}
        <div className={`sb-overlay${sidebarOpen ? " visible" : ""}`} onClick={() => setSidebarOpen(false)}/>

        {/* SIDEBAR */}
        <div className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="sb-user-card">
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
              {visiblePages.filter(p => p.grp === grp).map(p => (
                <div key={p.id} className={`sb-item${page===p.id?" active":""}`} onClick={()=>{ navigateToPage(p.id); setSidebarOpen(false); }}>
                  <Icon n={p.i} s={14}/>
                  <span style={{ flex:1 }}>{p.l}</span>
                </div>
              ))}
            </div>
          ))}

          <div style={{ flex:1 }}/>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="main-inner">
            {renderPage()}
          </div>
        </div>
      </div>

      {/* ── Security Settings modal (Change Password + Recovery Email) ── */}
      {cpOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(8,12,25,0.52)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500 }}>
          <div style={{ background:"var(--surface)", borderRadius:16, width:440, maxWidth:"94vw", border:"1px solid var(--brd)", boxShadow:"var(--shadow-xl)", overflow:"hidden" }}>

            {/* Header */}
            <div style={{ background:"var(--ink)", padding:"16px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:15 }}>Security Settings</div>
                <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11.5, marginTop:2 }}>{currentUser.name} · {currentUser.id}</div>
              </div>
              <button onClick={resetCp} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", width:28, height:28, borderRadius:8, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ padding:"24px 22px" }}>
                {cpMsg ? (
                  <div style={{ textAlign:"center" }}>
                    <div style={{ width:52, height:52, borderRadius:"50%", background:"var(--green-soft)", border:"2px solid rgba(5,150,105,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:22, color:"var(--green)" }}>✓</div>
                    <div style={{ fontWeight:800, fontSize:15, color:"var(--ink)", marginBottom:8 }}>Password Changed</div>
                    <p style={{ fontSize:13, color:"var(--ink3)", marginBottom:20 }}>{cpMsg}</p>
                    <button onClick={resetCp} style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"var(--accent)", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Done</button>
                  </div>
                ) : (
                  <>
                    <div className="fgrp" style={{ marginBottom:14 }}>
                      <div className="flbl">Current Password</div>
                      <input className="finp" type="password" placeholder="Enter current password" value={cpCurrent} onChange={e => { setCpCurrent(e.target.value); setCpErr(""); }}/>
                    </div>
                    <div className="fgrp" style={{ marginBottom:14 }}>
                      <div className="flbl">New Password</div>
                      <input className="finp" type="password" placeholder="Min 8 chars, 1 number, 1 special char" value={cpNew} onChange={e => { setCpNew(e.target.value); setCpErr(""); }}/>
                    </div>
                    <div className="fgrp" style={{ marginBottom:cpErr ? 10 : 20 }}>
                      <div className="flbl">Confirm New Password</div>
                      <input className="finp" type="password" placeholder="Re-enter new password" value={cpConfirm} onChange={e => { setCpConfirm(e.target.value); setCpErr(""); }} onKeyDown={e => e.key === "Enter" && submitChangePassword()}/>
                    </div>
                    {cpErr && <div style={{ background:"var(--red-soft)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:8, padding:"8px 12px", fontSize:12.5, color:"var(--red)", fontWeight:600, marginBottom:14 }}>{cpErr}</div>}
                    <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                      <button className="btn" onClick={resetCp}>Cancel</button>
                      <button className="btn btn-p" onClick={submitChangePassword} disabled={cpLoading}>{cpLoading ? "Saving…" : "Change Password"}</button>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
