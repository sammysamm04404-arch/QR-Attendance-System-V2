function EmployeeProfileCard({ employee }) {

    return (

        <div className="employee-profile-card">

            <div className="profile-avatar">
                {employee.name.charAt(0).toUpperCase()}
            </div>

            <div className="profile-info">

                <h2>{employee.name}</h2>
                <p>{employee.email}</p>

            </div>

            <div className="profile-status">

                <span className="role-badge">
                    {employee.role}
                </span>

                <span className={
                    employee.status === "Active"
                    ? "status-active"
                    : "status-inactive"
                }>
                    {employee.status}
                </span>

            </div>

        </div>

    );

}

export default EmployeeProfileCard;