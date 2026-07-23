import Loader from "../Loader/Loader";
function CorrectionTable({ loading, requests, onView }) {
  if (loading) {
    return (
      <div className="correction-table-card">
        <Loader />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="correction-table-card">
        <h3>No correction requests found.</h3>
      </div>
    );
  }

  return (
    <div className="correction-table-card">
      <div className="correction-table-wrapper">
        <table className="correction-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Req. Check Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>
                  <div className="employee-info">
                    <strong className="employee-name" title={request.employee_name}>
                      {request.employee_name}
                    </strong>
                    <small className="employee-email">
                      {request.employee_email}
                    </small>
                  </div>
                </td>
                <td>
                  {new Date(request.attendance_date).toLocaleDateString()}
                </td>
                <td>
                  {new Date(request.requested_checkout).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>
                  <span className={`status-badge ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn" onClick={() => onView(request)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CorrectionTable;