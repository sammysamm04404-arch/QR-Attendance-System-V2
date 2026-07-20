import { path, title } from "framer-motion/client";
import {
    FaUsers,
    FaClipboardList,
    FaChartBar,
    FaCog,
    FaTools
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function QuickAdminActions() {

    const navigate = useNavigate();

    const actions = [

        {
            title: "Employees",
            icon: <FaUsers />,
            path: "/employees"
        },

        {
            title: "Attendance",
            icon: <FaClipboardList />,
            path: "/attendance-management"
        },

        {
            title: "Corrections",
            icon: <FaTools />,
            path: "/attendance-corrections"
        },

        {
            title: "Reports",
            icon: <FaChartBar />,
            path: "/reports"
        },

        {
            title: "Settings",
            icon: <FaCog />,
            path: "/settings"
        }

    ];

    return (

        <div className="quick-admin-actions-card">

            <h2>
                Quick Actions
            </h2>

            <div className="quick-admin-actions-grid">

                {

                    actions.map((action, index) => (

                        <button
                            key={index}
                            className="quick-admin-action-btn"
                            onClick={() => navigate(action.path)}
                        >

                            <div className="quick-admin-action-icon">
                                {action.icon}
                            </div>

                            <span>
                                {action.title}
                            </span>

                        </button>

                    ))

                }

            </div>

        </div>

    );

}

export default QuickAdminActions;