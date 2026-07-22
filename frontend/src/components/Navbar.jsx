import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";
import "../styles/components/Navbar.css";
import toast from "react-hot-toast";
import { FaBell, FaBars, FaTimes } from "react-icons/fa";

function Navbar() {
    const navigate = useNavigate();
    const role = localStorage.getItem("user_role");
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [correctionCount, setCorrectionCount] = useState(0);

    const fetchNotificationCount = async () => {
        try {
            const response = await api.get("/notifications/unread-count");
            setNotificationCount(response.data.count);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchPendingCorrections = async () => {
        try {
            const response = await api.get(
                "/admin/corrections/pending-count"
            );
            setCorrectionCount(response.data.count);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchNotificationCount();
        fetchPendingCorrections();

        // Listen for immediate updates triggered from Notifications page
        const handleCountUpdate = () => {
            fetchNotificationCount();
            fetchPendingCorrections();
        };

        window.addEventListener("unreadCountUpdated", handleCountUpdate);

        const timer = setInterval(() => {
            fetchNotificationCount();
            fetchPendingCorrections();
        }, 20000);

        return () => {
            clearInterval(timer);
            window.removeEventListener("unreadCountUpdated", handleCountUpdate);
        };
    }, []);

    const handleLogout = () => {
        setShowLogoutModal(false);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_role");
        toast.success("Logged out successfully");
        window.location.href = "/login";
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-left">
                    <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>

                    <div className="logo">
                        QR Attendance System
                    </div>
                </div>

                <div className="nav-right">
                    <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                        {role === "Admin" ? (
                            <>
                                <Link className="nav-link" to="/AdminDashboard" onClick={() => setMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link className="nav-link" to="/Employees" onClick={() => setMenuOpen(false)}>
                                    Employees
                                </Link>
                                <Link className="nav-link" to="/attendance-management" onClick={() => setMenuOpen(false)}>
                                    Attendance
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/dashboard" onClick={() => setMenuOpen(false)}>
                                    Dashboard
                                </Link>
                                <Link className="nav-link" to="/attendance" onClick={() => setMenuOpen(false)}>
                                    Attendance
                                </Link>
                                <Link className="nav-link" to="/history" onClick={() => setMenuOpen(false)}>
                                    History
                                </Link>
                                <Link className="nav-link" to="/profile" onClick={() => setMenuOpen(false)}>
                                    Profile
                                </Link>
                            </>
                        )}

                        <button className="logout-btn" onClick={() => { setMenuOpen(false); setShowLogoutModal(true) }}>
                            Logout
                        </button>
                    </div>

                    {role === "Admin" ? (
                        <Link className="notification-link" to="/attendance-corrections" onClick={() => setMenuOpen(false)}>
                            <div className="notification-wrapper">
                                <FaBell className="notification-icon" />
                                {correctionCount > 0 && (
                                    <span className="notification-count">
                                        {correctionCount > 99 ? "99+" : correctionCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link className="notification-link" to="/notifications" onClick={() => setMenuOpen(false)}>
                            <div className="notification-wrapper">
                                <FaBell className="notification-icon" />
                                {notificationCount > 0 && (
                                    <span className="notification-count">
                                        {notificationCount > 99 ? "99+" : notificationCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )}
                </div>
            </nav>

            <ConfirmationModal
                isOpen={showLogoutModal}
                title="Logout"
                message="Are you sure you want to logout from the QR Attendance System?"
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutModal(false)}
            />
        </>
    );
}

export default Navbar;