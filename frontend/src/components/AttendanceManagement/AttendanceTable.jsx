function AttendanceTable({

    attendance,
    onView

}){

    return(

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

                    {

                        attendance.map((row,index)=>(

                            <tr key={index}>

                                <td>

                                    <strong>
                                        {row.employee}
                                    </strong>
                                    <br/>
                                    {row.email}

                                </td>

                                <td>{row.date}</td>
                                <td>{row.check_in}</td>
                                <td>{row.check_out}</td>
                                <td>{row.working_hours}</td>
                                <td>
                                    <span
                                        className={`status ${row.status.toLowerCase()}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="view-btn" onClick={()=>onView(row)}>
                                        View
                                    </button>
                                </td>

                            </tr>

                        ))

                    }

                </tbody>

            </table>

        </div>

    );

}

export default AttendanceTable;