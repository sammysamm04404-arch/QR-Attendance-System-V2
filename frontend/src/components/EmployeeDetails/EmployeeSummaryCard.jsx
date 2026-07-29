function EmployeeSummaryCard({ summary }) {

    return (

        <div className="employee-summary-card">

            <h3>Attendance Summary</h3>

            <div className="employee-summary-grid">

                <div>

                    <h2>{summary.present_days}</h2>
                    <p>Present Days</p>

                </div>

                <div>

                    <h2>{summary.late_days}</h2>
                    <p>Late Days</p>

                </div>

                <div>

                    <h2>{summary.average_hours}</h2>
                    <p>Average Hours</p>

                </div>

            </div>

        </div>

    );

}

export default EmployeeSummaryCard;