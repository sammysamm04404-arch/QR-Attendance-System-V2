import { FaUsers, FaUserCheck, FaUserTimes, FaClock } from "react-icons/fa";

function AdminStats({ data }) {

    const cards = [

        {
            title: "Total Employees",
            value: data.total_employees,
            icon: <FaUsers />,
            color: "#4F46E5"
        },

        {
            title: "Present Today",
            value: data.present_today,
            icon: <FaUserCheck />,
            color: "#10B981"
        },

        {
            title: "Absent Today",
            value: data.absent_today,
            icon: <FaUserTimes />,
            color: "#EF4444"
        },

        {
            title: "Late Today",
            value: data.late_today,
            icon: <FaClock />,
            color: "#F59E0B"
        }

    ];

    return (

        <div className="admin-stats">

            {

                cards.map((card, index) => (

                    <div key={index} className="admin-stat-card">

                        <div className="admin-stat-icon" style={{ background: card.color }}>
                            {card.icon}
                        </div>

                        <div className="admin-stat-content">

                            <h3>
                                {card.title}
                            </h3>

                            <h1>
                                {card.value}
                            </h1>

                        </div>

                    </div>

                ))

            }

        </div>

    );

}

export default AdminStats;