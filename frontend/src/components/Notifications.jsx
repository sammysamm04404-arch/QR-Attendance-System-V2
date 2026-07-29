import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/components/Notifications.css";
import { FaEnvelopeOpen, FaExclamationTriangle, FaClipboardList } from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";
import CorrectionTable from "../components/CorrectionTable"; // Import CorrectionTable

function Notifications() {
  // Personal Notifications State
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin Corrections Table State
  const [isAdmin, setIsAdmin] = useState(false);
  const [correctionRequests, setCorrectionRequests] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Modal State for Personal Resolution
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [reason, setReason] = useState("Forgot Check Out");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [notes, setNotes] = useState("");

  // Modal State for Viewing/Approving Employee Request
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAdminActionModal, setShowAdminActionModal] = useState(false);

  useEffect(() => {
    fetchData();

    const timer = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // 1. Fetch personal notifications for the logged-in user (Admin or Regular)
      const notifRes = await api.get("/notifications");
      setNotifications(notifRes.data);

      // 2. Check user role from localStorage or API response
      const currentUser = JSON.parse(localStorage.getItem("user_role"));
      const userIsAdmin = currentUser === "Admin"
      setIsAdmin(userIsAdmin);

      // 3. If user is Admin, fetch pending employee correction requests
      if (userIsAdmin) {
        fetchAdminCorrectionRequests();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to load notifications.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const fetchAdminCorrectionRequests = async () => {
    try {
      setTableLoading(true);
      const res = await api.get("/attendance-corrections/requests");
      setCorrectionRequests(res.data);
    } catch (error) {
      console.error("Failed to load employee requests", error);
    } finally {
      setTableLoading(false);
    }
  };

  // --- PERSONAL ACTIONS ---
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchData(false);
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

  const handleSubmitPersonalRequest = async () => {
    try {
      await api.post("/attendance-corrections/request", {
        notification_id: selectedNotification.id,
        reason,
        checkout_time: checkoutTime,
        notes,
      });

      toast.success("Your correction request was submitted successfully.");
      setShowResolveModal(false);
      fetchData(false);
      window.dispatchEvent(new Event("unreadCountUpdated"));
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit request");
    }
  };

  // --- ADMIN ACTIONS (Reviewing Employee Requests) ---
  const handleViewEmployeeRequest = (request) => {
    setSelectedRequest(request);
    setShowAdminActionModal(true);
  };

  const handleApproveOrReject = async (status) => {
    try {
      await api.put(`/attendance-corrections/${selectedRequest.id}/review`, {
        status, // "APPROVED" or "REJECTED"
      });
      toast.success(`Request ${status.toLowerCase()} successfully.`);
      setShowAdminActionModal(false);
      fetchAdminCorrectionRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Action failed.");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <Loader />
      </div>
    );
  }

  // Filter personal "Attendance Incomplete" / "Forgot Check Out" notifications
  const personalIncompleteNotifs = notifications.filter(
    (n) => n.title === "Attendance Incomplete" && !n.is_closed
  );

  return (
    <div>
      <Navbar />
      <div className="notifications-page">
        <div className="notifications-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
          
          {/* SECTION 1: ADMIN'S OWN FORGOT CHECK-OUT WARNING BANNER */}
          {personalIncompleteNotifs.length > 0 && (
            <div
              className="personal-warning-banner"
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <FaExclamationTriangle style={{ color: "#dc2626", fontSize: "24px", flexShrink: 0 }} />
                <div>
                  <h3 style={{ margin: 0, color: "#991b1b", fontSize: "1.1rem" }}>
                    Action Required: Your Attendance is Incomplete!
                  </h3>
                  <p style={{ margin: "4px 0 0 0", color: "#7f1d1d", fontSize: "0.9rem" }}>
                    You forgot to check out yesterday. Please resolve your own entry before handling employee requests.
                  </p>
                </div>
              </div>
              <button
                className="resolve-btn"
                style={{
                  background: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onClick={() => handleResolve(personalIncompleteNotifs[0])}
              >
                Resolve My Check-out
              </button>
            </div>
          )}

          {/* SECTION 2: REGULAR PERSONAL NOTIFICATIONS */}
          <div className="notifications-card" style={{ marginBottom: "32px" }}>
            <div className="notifications-header">
              <h1>My Notifications</h1>
            </div>

            {notifications.length === 0 ? (
              <div className="empty-notification">
                You are all set !! <FaEnvelopeOpen />
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.is_read ? "read" : "unread"}`}
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

          {/* SECTION 3: ADMIN CORRECTION REQUESTS TABLE (ONLY VISIBLE TO ADMINS) */}
          {isAdmin && (
            <div className="admin-corrections-section">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <FaClipboardList style={{ fontSize: "20px", color: "#2563eb" }} />
                <h2 style={{ margin: 0, fontSize: "1.35rem", color: "#0f172a" }}>
                  Employee Attendance Correction Requests
                </h2>
              </div>

              {/* Renders CorrectionTable component */}
              <CorrectionTable
                loading={tableLoading}
                requests={correctionRequests}
                onView={handleViewEmployeeRequest}
              />
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Personal Attendance Resolve Modal */}
      {showResolveModal && (
        <div className="resolve-modal-overlay">
          <div className="resolve-modal">
            <h2>Resolve My Attendance</h2>
            <p>Yesterday's attendance is incomplete. Please provide details.</p>

            <div className="form-group">
              <label>Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)}>
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
                placeholder="Enter details..."
              />
            </div>

            <div className="resolve-buttons">
              <button className="cancel-btn" onClick={() => setShowResolveModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleSubmitPersonalRequest}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Admin View/Approve Request Modal */}
      {showAdminActionModal && selectedRequest && (
        <div className="resolve-modal-overlay">
          <div className="resolve-modal">
            <h2>Review Correction Request</h2>
            <p style={{ marginBottom: "16px" }}>
              <strong>Employee:</strong> {selectedRequest.employee_name} ({selectedRequest.employee_email})
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>Date:</strong> {new Date(selectedRequest.attendance_date).toLocaleDateString()}
            </p>

            <div className="form-group">
              <label>Reason Given:</label>
              <p style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                {selectedRequest.reason || "N/A"}
              </p>
            </div>

            <div className="resolve-buttons" style={{ marginTop: "24px" }}>
              <button
                className="cancel-btn"
                style={{ background: "#ef4444", color: "#fff", border: "none" }}
                onClick={() => handleApproveOrReject("REJECTED")}
              >
                Reject
              </button>
              <button
                className="submit-btn"
                style={{ background: "#10b981", color: "#fff", border: "none" }}
                onClick={() => handleApproveOrReject("APPROVED")}
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;