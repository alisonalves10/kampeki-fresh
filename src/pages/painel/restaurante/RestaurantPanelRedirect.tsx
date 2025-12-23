import { Navigate } from 'react-router-dom';

// Restaurant Panel reuses the existing AdminLayout
// Just redirect to /admin for now - will be refactored later
export default function RestaurantPanelRedirect() {
  return <Navigate to="/admin" replace />;
}
