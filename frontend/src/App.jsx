import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthRedirect from "./components/AuthRedirect";
import QRLanding from "./pages/QRLanding";
import AdminDashboard from "./pages/AdminDashboard";
import Employees from "./pages/Employees";
import EmployeeDetails from "./pages/EmployeeDetails";
import AttendanceManagement from "./pages/AttendanceManagement";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./components/Notifications";
import CorrectionRequests from "./pages/CorrectionRequests";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<AuthRedirect />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/attendance/scan"
                    element={<QRLanding />}
                />

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <Attendance />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/history"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <History />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute allowedRoles={["Employee"]}>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/AdminDashboard"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/Employees"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <Employees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance-management"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AttendanceManagement />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/attendance-corrections"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <CorrectionRequests />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employees/:id"
                    element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <EmployeeDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>

    );

}

export default App;