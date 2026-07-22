import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

import AdminHeader from "../components/Admin/AdminHeader";
import AdminStats from "../components/Admin/AdminStats";
import AdminChart from "../components/Admin/AdminCharts";
import RecentActivity from "../components/Admin/RecentActivity";
import QuickAdminActions from "../components/Admin/QuickAdminActions";
import Loader from "../components/Loader/Loader";

import "../styles/pages/AdminDashboard.css";

function AdminDashboard() {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {

        try {

            const response = await api.get("/admin/dashboard");

            setDashboard(response.data);

        }

        catch (error) {

            console.log(error);

        }

    };

    if (!dashboard) {

        return (

            <div>

                <Navbar />

                <Loader />

            </div>

        );

    }

    return (

        <div>

            <Navbar />

            <div className="admin-dashboard">

                <AdminHeader />

                <AdminStats data={dashboard} />

                <div className="admin-middle">

                    <AdminChart
                        data={dashboard.weekly_chart}
                    />

                    <RecentActivity
                        activities={dashboard.recent_activity}
                    />

                </div>

                <QuickAdminActions />

            </div>

        </div>

    );

}

export default AdminDashboard;