import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

import CorrectionTable from "../components/Admin/CorrectionTable";
import CorrectionDetailsModal from "../components/Admin/CorrectionDetailsModal";
import Loader from "../components/Loader/Loader";

import "../styles/pages/CorrectionRequests.css";

function CorrectionRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }
        try {
            const response = await api.get("/admin/corrections");
            setRequests(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter((request) => {
        const matchSearch =
            request.employee_name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            request.employee_email
                .toLowerCase()
                .includes(search.toLowerCase());

        const matchStatus =
            status === "All" ? true : request.status === status;

        return matchSearch && matchStatus;
    });

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

            <div className="correction-page">
                <div className="correction-header">
                    <h1>Attendance Corrections</h1>
                    <p>
                        Review employee attendance correction requests.
                    </p>
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
                    loading={loading}
                    requests={filteredRequests}
                    onView={(request) => {
                        setSelectedRequest(request);
                        setDetailsOpen(true);
                    }}
                />
            </div>

            <CorrectionDetailsModal
                open={detailsOpen}
                request={selectedRequest}
                onClose={() => {
                    setDetailsOpen(false);
                    fetchRequests(false);
                }}
            />
        </div>
    );
}

export default CorrectionRequests;