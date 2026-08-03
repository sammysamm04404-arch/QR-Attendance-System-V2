import { useNavigate } from "react-router-dom";

import {
    FaCalendarCheck,
    FaHistory,
    FaUser,
    FaCog
} from "react-icons/fa";

function QuickActions() {

    const navigate = useNavigate();

    const actions = [

        {
            title: "Attendance",
            icon: <FaCalendarCheck />,
            action: () => navigate("/attendance")
        },

        {
            title: "History",
            icon: <FaHistory />,
            action: () => navigate("/history")
        },

        {
            title: "Profile",
            icon: <FaUser />,
            action: () => navigate("/profile")
        },

        {
            title: "Settings",
            icon: <FaCog />,
            action: () => navigate("/settings")
        }

    ];

    return (

        <div className="dash-quick-actions-card">

            <h2>Quick Actions</h2>

            <div className="dash-quick-actions-grid">

                {

                    actions.map((item,index)=>(

                        <button

                            key={index}

                            className="dash-quick-action-btn"

                            onClick={item.action}

                        >

                            <div className="dash-quick-action-icon">

                                {item.icon}

                            </div>

                            <span>

                                {item.title}

                            </span>

                        </button>

                    ))

                }

            </div>

        </div>

    );

}

export default QuickActions;