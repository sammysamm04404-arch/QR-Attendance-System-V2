import React from "react";

function AttendanceHeader({ onExport, exporting }) {
    return (
        <div className="attendance-header">
            <div>
                <h1>Attendance Management</h1>
                <p>View and manage all employee attendance.</p>
            </div>

            {onExport && (
                <button
                    className="export-btn"
                    onClick={onExport}
                    disabled={exporting}
                >
                    {exporting ? "Exporting..." : "Export Excel"}
                </button>
            )}
        </div>
    );
}

export default AttendanceHeader;