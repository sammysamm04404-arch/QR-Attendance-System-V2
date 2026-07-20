import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles = [] }) {

    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");

    const location = useLocation();

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );

    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(role)
    ) {

        if (role === "Admin") {

            return <Navigate to="/AdminDashboard" replace />;

        }

        return <Navigate to="/dashboard" replace />;

    }

    return children;

}

export default ProtectedRoute;