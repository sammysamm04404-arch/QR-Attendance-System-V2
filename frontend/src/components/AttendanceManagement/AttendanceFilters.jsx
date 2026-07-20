import { FaSearch, FaFilter, FaEraser} from "react-icons/fa";

function AttendanceFilters({

    search,
    setSearch,
    status,
    setStatus,
    singleDate,
    setSingleDate,
    fromDate,
    setFromDate,
    toDate,
    setToDate

}) {

    const clearFilters = () => {

        setSearch("");
        setStatus("All");
        setSingleDate("");
        setFromDate("");
        setToDate("");

    };

    return (

        <div className="attendance-filters">

            <div className="attendance-search">

                <FaSearch />
                <input type="text" placeholder="Search Employee..." value={search} onChange={(e)=>setSearch(e.target.value)}/>

            </div>

            <div className="filter-group">

                <FaFilter/>
                <input type="date" value={singleDate} onChange={(e)=>setSingleDate(e.target.value)}/>

            </div>

            <div className="filter-group">

                <div className="filter-label">
                    <label>From:</label>
                </div>
                <input type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)}/>

            </div>

            <div className="filter-group">

                <div className="filter-label">
                    <label>To:</label>
                </div>
                <input type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)}/>

            </div>

            <div className="filter-group">

                <select value={status} onChange={(e)=>setStatus(e.target.value)}>
                    <option>All</option>
                    <option>Present</option>
                    <option>Late</option>
                    <option>Absent</option>
                </select>

            </div>

            <button className="clear-filter-btn" onClick={clearFilters}>
                <FaEraser/>
                Clear
            </button>

        </div>

    );

}

export default AttendanceFilters;