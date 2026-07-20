function EmployeeTodayCard({ today }) {

    return (

        <div className="today-card">

            <h3>Today's Attendance</h3>

            <div className="today-grid">

                <div>

                    <h4>Check In</h4>
                    <p>{today.check_in}</p>

                </div>

                <div>

                    <h4>Check Out</h4>
                    <p>{today.check_out}</p>

                </div>

                <div>

                    <h4>Working Hours</h4>
                    <p>{today.working_hours}</p>

                </div>

            </div>

        </div>

    );

}

export default EmployeeTodayCard;