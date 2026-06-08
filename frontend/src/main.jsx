/**
 * main.jsx — React Application Entry Point
 * ==========================================
 * This is the very first JavaScript file executed in the browser.
 * Its only job is to mount the React component tree onto the real DOM.
 *
 * How it works:
 *   1. Vite bundles this file (and every import it references) into a single
 *      JS bundle during `npm run build`, or serves it via HMR during `npm run dev`.
 *   2. index.html has a <div id="root"></div>. createRoot() attaches React's
 *      virtual DOM renderer to that element.
 *   3. render() kicks off the first React render pass — App → AppBootstrap →
 *      (spinner / error / HRApp depending on server state).
 *
 * StrictMode:
 *   Wrapping in <StrictMode> makes React intentionally double-invoke certain
 *   lifecycle hooks in development to help catch side-effect bugs early.
 *   It has no effect in the production build.
 *
 * index.css:
 *   Imported here so Vite bundles it alongside the JS. Contains the Tailwind
 *   base/components/utilities directives plus a few global overrides for the
 *   root element sizing.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount the React app onto the #root div defined in index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
