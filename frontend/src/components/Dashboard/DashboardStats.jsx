import { motion } from "framer-motion";
import {
    FaSignInAlt,
    FaSignOutAlt,
    FaBusinessTime,
    FaCircle
} from "react-icons/fa";

function DashboardStats({

    todayAttendance,
    formatTime,
    attendanceStatus

}) {

    const cards = [

        {
            title: "Check In",
            value: formatTime(todayAttendance?.check_in),
            icon: <FaSignInAlt />
        },

        {
            title: "Check Out",
            value: formatTime(todayAttendance?.check_out),
            icon: <FaSignOutAlt />
        },

        {
            title: "Working Hours",
            value: todayAttendance?.working_hours || "--",
            icon: <FaBusinessTime />
        },

        {
            title: "Status",
            value: attendanceStatus,
            icon: <FaCircle />
        }

    ];

    return (

        <div className="stats-grid">

            {

                cards.map((card,index)=>(

                    <motion.div

                        key={card.title}

                        className="stat-card"

                        initial={{
                            opacity:0,
                            y:20
                        }}

                        animate={{
                            opacity:1,
                            y:0
                        }}

                        transition={{
                            delay:index*.1
                        }}

                    >

                        <div className="stat-icon">
                            {card.icon}
                        </div>

                        <div className="stat-title">
                            {card.title}
                        </div>

                        <div className="stat-value">
                            {card.value}
                        </div>

                    </motion.div>

                ))

            }

        </div>

    );

}

export default DashboardStats;