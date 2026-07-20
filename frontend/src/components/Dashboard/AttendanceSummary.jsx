import {
    FaCalendarCheck,
    FaClock,
    FaUserCheck,
    FaBusinessTime
} from "react-icons/fa";

function AttendanceSummary({ summary }) {

    if (!summary) {

        return null;

    }

    const items = [

        {

            title: "Present Days",

            value: summary.present_days,

            icon: <FaUserCheck />

        },

        {

            title: "Attendance %",

            value: `${summary.attendance_percentage}%`,

            icon: <FaCalendarCheck />

        },

        {

            title: "Average Hours",

            value: summary.average_hours,

            icon: <FaClock />

        },

        {

            title: "Late Entries",

            value: summary.late_entries,

            icon: <FaBusinessTime />

        }

    ];

    return (

        <div className="attendance-summary-card">

            <h2>

                Attendance Summary

            </h2>

            <div className="attendance-summary-grid">

                {

                    items.map((item,index)=>(

                        <div

                            key={index}

                            className="attendance-summary-item"

                        >

                            <div className="attendance-summary-icon">

                                {item.icon}

                            </div>

                            <div>

                                <h3>

                                    {item.value}

                                </h3>

                                <p>

                                    {item.title}

                                </p>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default AttendanceSummary;