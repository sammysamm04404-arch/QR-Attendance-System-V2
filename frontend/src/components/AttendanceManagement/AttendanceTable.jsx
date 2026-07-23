function AttendanceTable({ attendance = [], onView }) {
  // Filter out any admin rows before rendering
  const filteredAttendance = attendance.filter(
    (row) => row.role?.toLowerCase() !== "admin" && !row.is_admin
  );

  return (
    <div className="attendance-table">
      <table>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((row, index) => (
              <tr key={index}>
                <td>
                  <div className="employee-info">
                    {row.employee}
                    <span className="employee-email">{row.email}</span>
                  </div>
                </td>
                <td>{row.date}</td>
                <td>{row.check_in}</td>
                <td>{row.check_out}</td>
                <td>{row.working_hours}</td>
                <td>
                  <span
                    className={`status ${row.status.toLowerCase()}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => onView(row)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No attendance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;