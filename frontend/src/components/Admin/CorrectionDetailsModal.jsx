import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import Loader from "../Loader/Loader";

function CorrectionDetailsModal({ open, request, onClose, onSuccess }) {
    const [details, setDetails] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open && request) {
            setDetails(null); // Reset details on open
            setRemarks("");
            fetchDetails();
        }
    }, [open, request]);

    const fetchDetails = async () => {
        try {
            const response = await api.get(
                `/admin/corrections/${request.id}`
            );
            setDetails(response.data);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load request details.");
        }
    };

    const approveRequest = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            await api.put(
                `/admin/corrections/${request.id}/approve`
            );

            toast.success("Attendance correction approved.");

            // Instantly switch modal view to Approved (View Only)
            setDetails((prev) => ({ ...prev, status: "Approved" }));

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    const rejectRequest = async () => {
        if (!remarks.trim()) {
            toast.error("Please enter rejection remarks.");
            return;
        }

        if (submitting) return;
        setSubmitting(true);

        try {
            await api.put(
                `/admin/corrections/${request.id}/reject`,
                null,
                {
                    params: {
                        remarks
                    }
                }
            );

            toast.success("Attendance correction rejected.");

            // Instantly switch modal view to Rejected (View Only)
            setDetails((prev) => ({
                ...prev,
                status: "Rejected",
                remarks
            }));

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    if (!details) {
        return (
            <div className="modal-overlay">
                <div className="correction-modal">
                    <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="correction-modal">
                <div className="modal-header">
                    <h2>Attendance Correction</h2>
                </div>

                <div className="modal-body">
                    <div className="detail-row">
                        <strong>Employee</strong>
                        <span>{details.employee?.name}</span>
                    </div>

                    <div className="detail-row">
                        <strong>Email</strong>
                        <span>{details.employee?.email}</span>
                    </div>

                    <div className="detail-row">
                        <strong>Date</strong>
                        <span>
                            {new Date(details.attendance?.date).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="detail-row">
                        <strong>Check In</strong>
                        <span>
                            {details.attendance?.check_in
                                ? new Date(details.attendance.check_in).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                  })
                                : "--"}
                        </span>
                    </div>

                    <div className="detail-row">
                        <strong>Requested Check Out</strong>
                        <span>
                            {new Date(details.requested_checkout).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </span>
                    </div>

                    <div className="detail-column">
                        <strong>Reason</strong>
                        <p>{details.reason}</p>
                    </div>

                    <div className="detail-column">
                        <strong>Notes</strong>
                        <p>{details.notes || "--"}</p>
                    </div>

                    {/* Displays Status Badge */}
                    <div className="detail-row">
                        <strong>Status</strong>
                        <span className={`status-badge ${details.status?.toLowerCase()}`}>
                            {details.status}
                        </span>
                    </div>

                    {/* Action form when pending vs completed */}
                    {details.status === "Pending" ? (
                        <>
                            <textarea
                                placeholder="Remarks (Required for rejection)"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                disabled={submitting}
                            />

                            <div className="modal-buttons">
                                <button
                                    className="approve-btn"
                                    onClick={approveRequest}
                                    disabled={submitting}
                                >
                                    {submitting ? "Approving..." : "Approve"}
                                </button>

                                <button
                                    className="reject-btn"
                                    onClick={rejectRequest}
                                    disabled={submitting}
                                >
                                    {submitting ? "Rejecting..." : "Reject"}
                                </button>

                                <button
                                    className="close-btn"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {details.remarks && (
                                <div className="detail-column">
                                    <strong>Admin Remarks</strong>
                                    <p>{details.remarks}</p>
                                </div>
                            )}

                            <div className="modal-buttons">
                                <button
                                    className="close-btn"
                                    onClick={onClose}
                                    disabled={submitting}
                                >
                                    Close
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CorrectionDetailsModal;