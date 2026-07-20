import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import "../styles/pages/Dashboard.css";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardStats from "../components/Dashboard/DashboardStats";
import ProfileCard from "../components/Dashboard/ProfileCard";
import ProgressCard from "../components/Dashboard/ProgressCard";
import WeeklyChart from "../components/Dashboard/WeeklyChart";
import QuickActions from "../components/Dashboard/QuickActions";
import AttendanceSummary from "../components/Dashboard/AttendanceSummary";

function Dashboard() {

    const [dashboardData, setDashboardData] = useState(null);
    const [user, setUser] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [weeklyChart, setWeeklyChart] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    useEffect(() => {

    fetchDashboard();

    const timer = setInterval(() => {
        setCurrentTime(new Date());
    },1000);

    return () => clearInterval(timer);

    },[]);

    const fetchDashboard = async () => {

    try {

        const response = await api.get("/dashboard");
        const data = response.data;
        setDashboardData(data);
        setUser(data.user);
        setTodayAttendance(data.today);
        setWeeklyChart(data.weekly_chart);
        setAttendanceSummary(data.attendance_summary);

    }

    catch(error){
        console.log(error);
    }

    };

    if (!user) {
        return (
            <div className="dashboard-loading">
                <div className="loader"></div>
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    const hour = currentTime? currentTime.getHours():0 ;
    let greeting = "Good Evening";
    if (hour < 12) {
        greeting = "Good Morning";
    }  

    else if (hour < 17) {
        greeting = "Good Afternoon";
    }

    const today = currentTime.toLocaleDateString("en-IN", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const liveTime = currentTime.toLocaleTimeString("en-IN", {

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const formatTime = (time) => {

        if (!time) return "--";
        return new Date(time).toLocaleTimeString("en-IN",{

            hour:"2-digit",
            minute:"2-digit"

        });

    };

    let attendanceStatus = "Not Checked In";

    if(todayAttendance?.check_in && !todayAttendance?.check_out){

        attendanceStatus="Working";

    }

    if(todayAttendance?.check_in && todayAttendance?.check_out){

        attendanceStatus="Completed";

    }

    return (

        <div>

            <Navbar />

                <div className="dashboard-container">
                    <DashboardHeader 
                        greeting={greeting}
                        user={user}
                        today={today}
                        liveTime={liveTime}
                    />
                    
                    <DashboardStats
                        todayAttendance={todayAttendance}
                        formatTime={formatTime}
                        attendanceStatus={attendanceStatus}
                    />

                    <div className="dashboard-bottom">
                        <ProfileCard user={user} />
                        <ProgressCard 
                            todayAttendance={todayAttendance}
                            currentTime={currentTime}    
                        />
                    </div>

                    <div className="dashboard-lower">
                        <WeeklyChart 
                            data={weeklyChart}
                        />
                        <QuickActions />
                    </div>

                    <AttendanceSummary 
                        summary={attendanceSummary}
                    />
                    
                </div>

            </div>

        );

}

export default Dashboard;