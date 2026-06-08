/**
 * vite.config.js — Vite Build Configuration
 * ============================================
 * Vite is the build tool and development server for this React frontend.
 *
 * What Vite does:
 *   - `npm run dev`   → starts a lightning-fast dev server with Hot Module
 *     Replacement (HMR). Changes to .jsx/.css files appear in the browser
 *     instantly without a full page reload.
 *   - `npm run build` → bundles all source files into optimised static assets
 *     in the frontend/dist/ folder, ready for deployment to any static host
 *     (Vercel, Netlify, Nginx, etc.).
 *   - `npm run preview` → serves the built dist/ folder locally for a
 *     production-like preview before deploying.
 *
 * @vitejs/plugin-react:
 *   Adds JSX transform support (so you don't need to import React in every
 *   file), Fast Refresh (React's own HMR), and Babel-based JSX compilation.
 *   Without this plugin, Vite wouldn't understand .jsx files at all.
 *
 * PostCSS / Tailwind:
 *   Vite automatically picks up postcss.config.js from the project root and
 *   runs PostCSS (including Tailwind and Autoprefixer) on every CSS file it
 *   processes — no extra config needed here for CSS.
 *
 * VITE_API_URL environment variable:
 *   Defined in frontend/.env (or injected by the hosting platform).
 *   Used in HRModules.jsx as:
 *     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
 *   Only variables prefixed with VITE_ are exposed to the browser bundle
 *   (others stay server-side only).
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),  // enables JSX, Fast Refresh, and Babel transforms for .jsx files
  ],
})
