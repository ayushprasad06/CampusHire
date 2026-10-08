import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, getToken } from "../api/auth.js";

function ProtectedRoute({ allowedRoles }) {
    const token = getToken();
    const user = getCurrentUser();

    // Not logged in
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Role not allowed
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role)
    ) {
        const role = user.role?.toLowerCase();

        if (role === "student") {
            return (
                <Navigate
                    to="/student/dashboard"
                    replace
                />
            );
        }

        if (role === "recruiter") {
            return (
                <Navigate
                    to="/recruiter/dashboard"
                    replace
                />
            );
        }

        if (role === "admin") {
            return (
                <Navigate
                    to="/admin/dashboard"
                    replace
                />
            );
        }

        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;