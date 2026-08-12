import { Navigate, useLocation } from "react-router-dom";
import { getStoredAdminSession } from "../services/authService";

function AdminRoute({ children }) {
  const location = useLocation();
  return getStoredAdminSession()
    ? children
    : <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
}

export default AdminRoute;
