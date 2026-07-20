import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

function AuthRedirect() {

    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {

        const checkSession = async () => {

            const token = localStorage.getItem("access_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                await api.get("/users/me");
                setAuthenticated(true);
            }

            catch {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user_role");
            }

            finally {
                setLoading(false);
            }

        };

        checkSession();

    }, []);

    const role = localStorage.getItem("user_role");

    if (loading) {

        return <h2 style={{ padding: "40px" }}>Checking Session...</h2>;

    }

    if (!authenticated) {

        return <Navigate to="/login" replace />;

    }

    return role === "admin"

        ? <Navigate to="/AdminDashboard" replace />

        : <Navigate to="/dashboard" replace />;
}

export default AuthRedirect;