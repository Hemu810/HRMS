/**
 * tailwind.config.js — Tailwind CSS Configuration
 * =================================================
 * Tells Tailwind which files to scan for class names and how to extend
 * the default design system.
 *
 * `content` (critical):
 *   Tailwind uses PurgeCSS under the hood — it scans every file listed here
 *   for class-name strings and only includes those classes in the final CSS.
 *   Without the right paths, production builds will be missing styles.
 *     - "./index.html"          → catches classes in the HTML shell
 *     - "./src/**\/*.{js,ts,jsx,tsx}" → catches classes in all source files
 *
 * `theme.extend`:
 *   Lets you ADD to Tailwind's defaults without replacing them.
 *   Currently empty — the design system uses CSS custom properties (--accent,
 *   --shadow-md, etc.) defined in the GS component rather than Tailwind tokens,
 *   so no custom colours or spacing need to be added here.
 *
 * `plugins`:
 *   Where you'd add official Tailwind plugins like @tailwindcss/forms or
 *   @tailwindcss/typography if needed. Currently none are used.
 *
 * Note: Tailwind v3 is installed (not v4). The @tailwind directives in
 * frontend/src/index.css are the actual injection point for the generated CSS.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Add custom design tokens here if you want them available as Tailwind
      // utility classes. e.g.:
      //   colors: { brand: '#2563EB' }
      // gives you `text-brand`, `bg-brand`, etc.
    },
  },
  plugins: [],
}
