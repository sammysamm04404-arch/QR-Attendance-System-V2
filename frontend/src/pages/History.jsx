import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/pages/History.css";
import { FaEraser } from "react-icons/fa";
import Loader from "../components/Loader/Loader";

function History() {

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");
    const RECORDS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {

        fetchHistory();

    }, []);

    useEffect(() => {

        setCurrentPage(1);

    }, [search, actionFilter, dateFilter]);

    const fetchHistory = async () => {

        try {

            const response = await api.get("/attendance/my-history");

            setRecords(response.data);

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    };

    const filteredRecords = useMemo(() => {

        return records.filter((record) => {

            const matchAction =
                actionFilter === "All"
                    ? true
                    : record.action === actionFilter;

            const matchSearch =
                record.location_name
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchDate =
                !dateFilter
                    ? true
                    : new Date(record.scan_time)
                          .toISOString()
                          .slice(0, 10) === dateFilter;

            return matchAction && matchSearch && matchDate;

        });

    }, [records, search, actionFilter, dateFilter]);

    const totalPages = Math.ceil(
        filteredRecords.length / RECORDS_PER_PAGE
    );

    const paginatedRecords = filteredRecords.slice(

        (currentPage - 1) * RECORDS_PER_PAGE,

        currentPage * RECORDS_PER_PAGE

    );

    const stats = {

        total: filteredRecords.length,

        checkIn: filteredRecords.filter(
            r => r.action === "Check In"
        ).length,

        break: filteredRecords.filter(
            r => r.action === "Break"
        ).length,

        breakover: filteredRecords.filter(
            r => r.action === "Break Over"
        ).length,

        checkOut: filteredRecords.filter(
            r => r.action === "Check Out"
        ).length

    };

    const formatDate = (date) => {

        return new Date(date).toLocaleDateString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric"

        });

    };

    const formatTime = (date) => {

        return new Date(date).toLocaleTimeString("en-IN", {

            hour: "2-digit",
            minute: "2-digit"

        });

    };

    const clearFilters = () => {
        
        setSearch("");
        setActionFilter("All");
        setDateFilter("");

    };

    return (

        <div>

            <Navbar />

            <div className="history-container">

                <div className="history-header">

                    <h1>
                        Attendance History
                    </h1>

                    <p>
                        View your complete attendance records
                    </p>

                </div>

                <div className="history-stats">

                    <div className="history-stat-card">
                        <h3>Total Records</h3>
                        <span>{stats.total}</span>
                    </div>

                    <div className="history-stat-card">
                        <h3>Check In</h3>
                        <span>{stats.checkIn}</span>
                    </div>

                    <div className="history-stat-card">
                        <h3>Break</h3>
                        <span>{stats.break}</span>
                    </div>

                    <div className="history-stat-card">
                        <h3>Break Over</h3>
                        <span>{stats.breakover}</span>
                    </div>

                    <div className="history-stat-card">
                        <h3>Check Out</h3>
                        <span>{stats.checkOut}</span>
                    </div>

                </div>

                <div className="history-filters">

                    <input type="text" placeholder="Search location..." value={search} onChange={(e) =>setSearch(e.target.value)}/>

                    <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>

                        <option>All</option>
                        <option>Check In</option>
                        <option>Break</option>
                        <option>Break Over</option>
                        <option>Check Out</option>

                    </select>

                    <input type="date" value={dateFilter} onChange={(e) =>setDateFilter(e.target.value)}/>

                    <button onClick={clearFilters}>
                        <FaEraser />
                        Clear
                    </button>

                </div>

                <div className="history-table-container">

                    {

                        loading ?
                        (
                            < Loader />
                        )
                        :
                        (

                            <table className="history-table">
                                <thead>

                                    <tr>

                                        <th>#</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Action</th>
                                        <th>Location</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {
                                        filteredRecords.length === 0 ?
                                        (

                                            <tr>

                                                <td colSpan="5" className="history-empty">
                                                    No Records Found
                                                </td>

                                            </tr>

                                        )
                                        :
                                        (

                                            paginatedRecords.map(

                                                (record, index) => (

                                                    <tr key={record.id}>

                                                        <td>
                                                            {index + 1}
                                                        </td>

                                                        <td>
                                                            {formatDate(record.scan_time)}
                                                        </td>

                                                        <td>
                                                            {formatTime(record.scan_time)}
                                                        </td>

                                                        <td>

                                                            <span
                                                                className={`badge ${record.action.replaceAll(" ", "-").toLowerCase()}`}>
                                                                {record.action}
                                                            </span>

                                                        </td>

                                                        <td>
                                                            {record.location_name}
                                                        </td>

                                                    </tr>

                                                )

                                            )

                                        )

                                    }

                                </tbody>

                            </table>

                        )

                    }

                </div>

                <div className="pagination">

                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                    </button>

                    <span>
                        Page {currentPage} of {totalPages || 1}
                    </span>

                    <button disabled={ currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
                        Next
                    </button>

                </div>

            </div>

        </div>

    );

}

export default History;