/**
 * App.jsx — Root React Component
 * ================================
 * The top-level component that Vite's entry point (main.jsx) renders.
 * It simply re-exports AppBootstrap from HRModules.jsx as the default export.
 *
 * Why is it this thin?
 *   All meaningful application logic — routing, authentication, data loading,
 *   and every HRMS module — lives inside HRModules.jsx. Keeping App.jsx as a
 *   pass-through makes it easy to wrap the whole app in a future provider
 *   (e.g. React Context, React Query, a theme provider) without touching
 *   the module code. Just add it here.
 *
 * Component tree (starting from here):
 *   App
 *   └── AppBootstrap       (data loading + error/loading states)
 *       └── HRApp          (authenticated shell — topbar + sidebar + main)
 *           └── LoginScreen | <Module>   (page-level component)
 */

import HRModules from "./HRModules";

function App() {
  // HRModules exports AppBootstrap as its default, which handles:
  //   • Fetching employees / payroll structure / custom fields on mount
  //   • Showing a spinner while loading
  //   • Showing an error screen if the backend is unreachable
  //   • Rendering HRApp once data is ready
  return <HRModules />;
}

export default App;
