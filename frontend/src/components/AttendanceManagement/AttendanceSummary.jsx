import { FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

function AttendanceSummary({ atmsummary }) {

    if (!atmsummary) return null;

    const cards = [

        {
            title: "Total Records",
            value: atmsummary.total_records,
            icon: <FaUsers />
        },

        {
            title: "Present",
            value: atmsummary.present,
            icon: <FaCheckCircle />
        },

        {
            title: "Late",
            value: atmsummary.late,
            icon: <FaClock />
        },

        {
            title: "Absent",
            value: atmsummary.absent,
            icon: <FaTimesCircle />
        }

    ];

    return (

        <div className="attendance-atmsummary">

            {

                cards.map((card, index) => (

                    <div className="attendance-atmsummary-card" key={index}>

                        <div className="atmsummary-icon">
                            {card.icon}
                        </div>

                        <div>
                            <h3>{card.value}</h3>
                            <p>{card.title}</p>
                        </div>

                    </div>

                ))

            }

        </div>

    );

}

export default AttendanceSummary;