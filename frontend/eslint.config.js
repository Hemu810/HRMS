/**
 * eslint.config.js — ESLint Code Quality Rules
 * ==============================================
 * ESLint statically analyses JavaScript/JSX files for bugs and style issues
 * without running the code. Run manually with `npm run lint` or automatically
 * in your IDE with the ESLint extension.
 *
 * This project uses the new "flat config" format (ESLint v9+), where rules
 * are composed as an array of config objects instead of the older .eslintrc
 * JSON/YAML files.
 *
 * Plugins used:
 *
 *   @eslint/js (js.configs.recommended):
 *     Core JavaScript rules — catches undefined variables, unreachable code,
 *     duplicate keys, etc.
 *
 *   eslint-plugin-react-hooks (reactHooks.configs.flat.recommended):
 *     Enforces the Rules of Hooks:
 *       - Hooks must only be called at the top level (not inside conditions/loops).
 *       - Hooks must only be called from React function components or custom hooks.
 *     Also enforces exhaustive-deps for useEffect/useCallback/useMemo to
 *     prevent stale-closure bugs.
 *
 *   eslint-plugin-react-refresh (reactRefresh.configs.vite):
 *     Ensures every component file only exports React components, not plain
 *     values. This is required for Vite's Fast Refresh (HMR) to work correctly —
 *     if a file exports a non-component, HMR falls back to a full page reload.
 *
 * globalIgnores(['dist']):
 *   Skips the built output folder — no point linting minified bundles.
 *
 * globals.browser:
 *   Tells ESLint that browser globals like `window`, `document`, `fetch`,
 *   and `console` are available without being explicitly imported.
 */

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignore the built output directory — lint source only.
  globalIgnores(['dist']),
  {
    // Apply this config block to all JS and JSX source files.
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,               // core JS rules
      reactHooks.configs.flat.recommended,  // Rules of Hooks + exhaustive-deps
      reactRefresh.configs.vite,            // Fast Refresh export constraints
    ],
    languageOptions: {
      globals: globals.browser,             // recognise window, document, fetch, etc.
      parserOptions: {
        ecmaFeatures: { jsx: true },        // enable JSX syntax parsing
      },
    },
  },
])
