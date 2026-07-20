function EmployeeHistoryTable({ history }) {

    return (

        <div className="history-card">

            <h3>Attendance History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Hours</th>
                    </tr>
                </thead>

                <tbody>
                    {

                        history.map((row, index) => (

                            <tr key={index}>
                                <td>{row.date}</td>
                                <td>{row.check_in}</td>
                                <td>{row.check_out}</td>
                                <td>{row.working_hours}</td>
                            </tr>

                        ))

                    }
                </tbody>

            </table>

        </div>

    );

}

export default EmployeeHistoryTable;