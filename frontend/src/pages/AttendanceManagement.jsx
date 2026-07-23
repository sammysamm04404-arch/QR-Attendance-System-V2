import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import api from "../services/api";

import AttendanceHeader from "../components/AttendanceManagement/AttendanceHeader";
import AttendanceFilters from "../components/AttendanceManagement/AttendanceFilters";
import AttendanceTable from "../components/AttendanceManagement/AttendanceTable";
import AttendancePagination from "../components/AttendanceManagement/AttendancePagination";
import AttendanceDetailsModal from "../components/AttendanceManagement/AttendanceDetailsModal";
import AttendanceSummary from "../components/AttendanceManagement/AttendanceSummary";
import Loader from "../components/Loader/Loader";

import "../styles/pages/AttendanceManagement.css";

function AttendanceManagement() {
    const [attendance, setAttendance] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All");
    const [singleDate, setSingleDate] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [atmsummary, setATMSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, [
        page,
        search,
        status,
        singleDate,
        fromDate,
        toDate
    ]);

    const fetchAttendance = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }
        try {
            const params = new URLSearchParams();

            params.append("page", page);
            params.append("limit", 10);

            if (search) params.append("search", search);
            if (status !== "All") params.append("status", status);
            if (singleDate) params.append("single_date", singleDate);
            if (fromDate) params.append("from_date", fromDate);
            if (toDate) params.append("to_date", toDate);

            const response = await api.get(
            `/admin/attendance?${params.toString()}`
            );

            // Filter out admin users from backend data if present
            const nonAdminAttendance = (response.data.attendance || []).filter(
            (item) => item.role !== "Admin"
            );

            setAttendance(nonAdminAttendance);
            setTotalPages(response.data.total_pages);
            setATMSummary(response.data.summary);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
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

    return (
        <>
            <Navbar />

            <div className="attendance-page">
                <AttendanceHeader />

                <AttendanceSummary
                    atmsummary={atmsummary}
                />

                <AttendanceFilters
                    search={search}
                    setSearch={setSearch}
                    status={status}
                    setStatus={setStatus}
                    singleDate={singleDate}
                    setSingleDate={setSingleDate}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                />

                <AttendanceTable
                    attendance={attendance}
                    onView={(row) => {
                        setSelectedAttendance(row);
                        setDetailsOpen(true);
                    }}
                />

                <AttendancePagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />

                <AttendanceDetailsModal
                    open={detailsOpen}
                    attendance={selectedAttendance}
                    onClose={() => setDetailsOpen(false)}
                />
            </div>
        </>
    );
}

export default AttendanceManagement;