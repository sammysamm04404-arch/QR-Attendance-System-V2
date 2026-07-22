import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/components/Notifications.css";
import { FaEnvelopeOpen } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true); // Prevents premature empty state flash
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [reason, setReason] = useState("Forgot Check Out");
    const [checkoutTime, setCheckoutTime] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchNotifications();

        const notificationTimer = setInterval(() => {
            fetchNotifications(false); // Background polling (doesn't trigger screen loader)
        }, 30000);

        return () => {
            clearInterval(notificationTimer);
        };
    }, []);

    const fetchNotifications = async (showLoader = true) => {
        try {
            const response = await api.get("/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.log(error.response);
            console.log(error.response?.data);
            toast.error(error.response?.data?.detail);
        } finally {
            if (showLoader) {
                setLoading(false); // Turn off loader after initial fetch finishes
            }
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications(false);
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
            setShowResolveModal(false);

            toast.success(
                "Attendance correction request sent successfully."
            );
        } catch (error) {
            console.log(error.response);
            console.log(error.response?.data);
            toast.error(error.response?.data?.detail);
        }
    };

    // Show Loader while fetching initial notification data
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
            <div className="notifications-page">
                <div className="notifications-card">
                    <div className="notifications-header">
                        <h1>Notifications</h1>
                    </div>

                    {notifications.length === 0 ? (
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

                                {!notification.is_read && (
                                    <div className="notification-actions">
                                        {notification.title ===
                                            "Attendance Incomplete" && (
                                            <button
                                                className="resolve-btn"
                                                onClick={() =>
                                                    handleResolve(notification)
                                                }
                                            >
                                                Resolve Now
                                            </button>
                                        )}

                                        <button
                                            className="mark-read-btn"
                                            onClick={() =>
                                                markAsRead(notification.id)
                                            }
                                        >
                                            Mark Read
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showResolveModal && (
                <div className="resolve-modal-overlay">
                    <div className="resolve-modal">
                        <h2>Resolve Attendance</h2>
                        <p>
                            Yesterday's attendance is incomplete. Please
                            provide the correct details below.
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
                                onChange={(e) =>
                                    setCheckoutTime(e.target.value)
                                }
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
        </div>
    );
}

export default Notifications;