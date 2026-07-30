import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { FaEnvelopeOpen } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";

// Admin components
import CorrectionTable from "../components/Admin/CorrectionTable";
import CorrectionDetailsModal from "../components/Admin/CorrectionDetailsModal";

// Styles
import "../styles/components/Notifications.css";
import "../styles/pages/CorrectionRequests.css";

function Notifications() {
    // Check local storage for user role
    const userRole = localStorage.getItem("user_role");
    const isAdmin = userRole === "Admin";

    // Common Loading State
    const [loading, setLoading] = useState(true);

    // Notification States
    const [notifications, setNotifications] = useState([]);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [reason, setReason] = useState("Forgot Check Out");
    const [checkoutTime, setCheckoutTime] = useState("");
    const [notes, setNotes] = useState("");

    // Admin Correction Request States
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            if (isAdmin) {
                await Promise.all([fetchNotifications(false), fetchRequests(false)]);
            } else {
                await fetchNotifications(false);
            }
            setLoading(false);
        };

        loadInitialData();

        // Interval to auto-refresh notifications (and requests for admin)
        const notificationTimer = setInterval(() => {
            fetchNotifications(false);
            if (isAdmin) {
                fetchRequests(false);
            }
        }, 30000);

        return () => {
            clearInterval(notificationTimer);
        };
    }, [isAdmin]);

    // Notification Fetch
    const fetchNotifications = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.log(error.response);
            console.log(error.response?.data);
            toast.error(error.response?.data?.detail);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // Admin Requests Fetch
    const fetchRequests = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const response = await api.get("/admin/corrections");
            setRequests(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications(false);
            // Notify Navbar to instantly update the unread counter badge
            window.dispatchEvent(new Event("unreadCountUpdated"));
        } catch (error) {
            console.log(error);
        }
    };

    const handleResolve = (notification) => {
        setSelectedNotification(notification);
        setReason("Forgot Check Out");
        setCheckoutTime("");
        setNotes("");
        setShowResolveModal(true);
    };

    const handleSubmitRequest = async () => {
        try {
            await api.post("/attendance-corrections/request", {
                notification_id: selectedNotification.id,
                reason,
                checkout_time: checkoutTime,
                notes
            });

            fetchNotifications(false);
            if (isAdmin) fetchRequests(false);
            setShowResolveModal(false);
            window.dispatchEvent(new Event("unreadCountUpdated"));

            toast.success("Attendance correction request sent successfully.");
        } catch (error) {
            console.log(error.response);
            console.log(error.response?.data);
            toast.error(error.response?.data?.detail);
        }
    };

    // Filter Admin Requests
    const filteredRequests = requests.filter((request) => {
        const matchSearch =
            request.employee_name
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            request.employee_email
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchStatus =
            status === "All" ? true : request.status === status;

        return matchSearch && matchStatus;
    });

    const hasNotifications = notifications.length > 0;
    const hasRequests = requests.length > 0;

    if (loading) {
        return (
            <div>
                <Navbar />
                <Loader />
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            {/* SCENARIO 1: Admin and BOTH lists are empty */}
            {isAdmin && !hasNotifications && !hasRequests && (
                <div className="notifications-page" style={{ minHeight: "auto", paddingBottom: "30px" }}>
                    <div className="notifications-card">
                        <div className="notifications-header">
                            <h1>Notifications & Requests</h1>
                        </div>
                        <div className="empty-notification">
                            You are all set !!
                            <FaEnvelopeOpen />
                        </div>
                    </div>
                </div>
            )}

            {/* SCENARIO 2: Render Notifications (Standard User OR Admin with notifications) */}
            {(!isAdmin || hasNotifications) && (
                <div
                    className="notifications-page"
                    style={{
                        minHeight: "auto",
                        paddingBottom: isAdmin && hasRequests ? "0px" : undefined,
                        marginBottom: isAdmin && hasRequests ? "30px" : undefined
                    }}
                >
                    <div className="notifications-card">
                        <div className="notifications-header">
                            <h1>Notifications</h1>
                        </div>

                        {!hasNotifications ? (
                            <div className="empty-notification">
                                You are all set !!
                                <FaEnvelopeOpen />
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`notification-item ${
                                        notification.is_read ? "read" : "unread"
                                    }`}
                                >
                                    <div className="notification-content">
                                        <h3>{notification.title}</h3>
                                        <p>{notification.message}</p>
                                    </div>

                                    {!notification.is_closed && (
                                        <div className="notification-actions">
                                            {notification.title === "Attendance Incomplete" && (
                                                <button
                                                    className="resolve-btn"
                                                    onClick={() => handleResolve(notification)}
                                                >
                                                    Resolve Now
                                                </button>
                                            )}

                                            {!notification.is_read && (
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* SCENARIO 3: Admin Correction Requests (Only rendered when requests exist) */}
            {isAdmin && hasRequests && (
                <div
                    className="correction-page"
                    style={{
                        minHeight: "auto",
                        paddingTop: "0px",
                        marginTop: "0px"
                    }}
                >
                    <div className="correction-header">
                        <h1>Attendance Corrections</h1>
                        <p>Review employee attendance correction requests.</p>
                    </div>

                    <div className="correction-filters">
                        <input
                            type="text"
                            placeholder="Search Employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option>All</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                        </select>
                    </div>

                    <CorrectionTable
                        loading={false}
                        requests={filteredRequests}
                        onView={(request) => {
                            setSelectedRequest(request);
                            setDetailsOpen(true);
                        }}
                    />
                </div>
            )}

            {/* User Resolve Attendance Modal */}
            {showResolveModal && (
                <div className="resolve-modal-overlay">
                    <div className="resolve-modal">
                        <h2>Resolve Attendance</h2>
                        <p>
                            Yesterday's attendance is incomplete. Please provide
                            the correct details below.
                        </p>

                        <div className="form-group">
                            <label>Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            >
                                <option>Forgot Check Out</option>
                                <option>Network Issue</option>
                                <option>Emergency</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Actual Check Out Time</label>
                            <input
                                type="time"
                                value={checkoutTime}
                                onChange={(e) => setCheckoutTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Additional Notes</label>
                            <textarea
                                rows="4"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter additional details..."
                            />
                        </div>

                        <div className="resolve-buttons">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowResolveModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmitRequest}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Details Modal */}
            {isAdmin && (
                <CorrectionDetailsModal
                    open={detailsOpen}
                    request={selectedRequest}
                    onClose={() => {
                        setDetailsOpen(false);
                        fetchRequests(false);
                    }}
                />
            )}
        </div>
    );
}

export default Notifications;