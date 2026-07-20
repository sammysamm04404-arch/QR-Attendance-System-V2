import { motion } from "framer-motion";

function DashboardHeader({
    greeting,
    user,
    today,
    liveTime
}) {

    return (

        <motion.div
            className="dashboard-header"
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5 }}
        >

            <div>

                <h1 className="dashboard-title">

                    {greeting},{" "}
                    <span className="user-name">
                        {user.name}
                    </span>

                </h1>

                <p className="dashboard-subtitle">

                    {today}

                </p>

            </div>

            <div className="live-clock">

                <div className="clock-label">

                    Live Time

                </div>

                <div className="clock-time">

                    {liveTime}

                </div>

            </div>

        </motion.div>

    );

}

export default DashboardHeader;