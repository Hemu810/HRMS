/**
 * postcss.config.js — PostCSS Plugin Pipeline
 * =============================================
 * PostCSS is a CSS processor that runs a chain of plugins on every CSS file
 * Vite handles. This file tells it which plugins to use and in what order.
 *
 * tailwindcss:
 *   Scans source files (per tailwind.config.js → content) and generates
 *   all the utility classes (e.g. `flex`, `text-blue-600`, `rounded-xl`).
 *   It replaces the @tailwind base/components/utilities directives in
 *   index.css with the actual generated CSS.
 *
 * autoprefixer:
 *   Automatically adds vendor prefixes to CSS properties that need them
 *   for cross-browser compatibility — e.g. turns `backdrop-filter: blur()`
 *   into `-webkit-backdrop-filter: blur()` for Safari.
 *   This runs AFTER tailwindcss so it also prefixes Tailwind's output.
 *
 * Order matters: tailwindcss must run before autoprefixer so that
 * autoprefixer sees the final generated CSS (including Tailwind utilities)
 * and can prefix all of it.
 *
 * Vite automatically discovers and uses this file — no extra config in
 * vite.config.js is needed.
 */

export default {
  plugins: {
    tailwindcss: {},   // generate utility classes from source files
    autoprefixer: {},  // add -webkit- and other vendor prefixes
  },
}
