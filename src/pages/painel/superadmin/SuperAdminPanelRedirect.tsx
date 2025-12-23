import { Navigate } from 'react-router-dom';

// SuperAdmin Panel reuses the existing AdminLayout with full access
// Just redirect to /admin for now - will be refactored later
export default function SuperAdminPanelRedirect() {
  return <Navigate to="/admin" replace />;
}
