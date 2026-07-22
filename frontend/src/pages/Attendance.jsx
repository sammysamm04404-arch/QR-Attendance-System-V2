import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/pages/Attendance.css";
import Loader from "../components/Loader/Loader";

function Attendance() {
    const [attendance, setAttendance] = useState(null);
    const [allowedActions, setAllowedActions] = useState([]);
    const [locationName, setLocationName] = useState("Fetching location...");
    const [locationAllowed, setLocationAllowed] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTodayAttendance();
        fetchAllowedActions();
        fetchCurrentLocation();
    }, []);

    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get("/attendance/today");
            setAttendance(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchAllowedActions = async () => {
        try {
            const response = await api.get("/attendance/allowed-actions");
            setAllowedActions(response.data.allowed_actions);
        } catch (error) {
            console.log(error);
        }
    };

    const LOCATION_IQ_TOKEN = "pk.fd7c0402d3fe8872c9293361cab469d3"; 

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationName("Location not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    const response = await fetch(
                        `https://us1.locationiq.com/v1/reverse?key=${LOCATION_IQ_TOKEN}&lat=${latitude}&lon=${longitude}&format=json`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch data from LocationIQ");
                    }

                    const data = await response.json();
                    const road =
                        data.address.road ||
                        data.address.suburb ||
                        data.address.village ||
                        "";

                    const city =
                        data.address.city ||
                        data.address.town ||
                        data.address.county ||
                        "";

                    const location = `${road}, ${city}`;
                    const formattedLocation = location.replace(/^, |, $/g, '');
                    setLocationAllowed(true);
                    setLocationName(formattedLocation || "Unknown Location");
                } catch (error) {
                    console.error("API Error:", error);
                    setLocationName("Unknown Location");
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                setLocationAllowed(false);
                setLocationName("Location Permission Denied");
            }
        );
    };

    const handleAttendance = async (action) => {
        if (!locationAllowed) {
            alert("Please enable location permission.");
            return;
        }

        try {
            setActionLoading(true); // Show loader immediately on button click
            const token = localStorage.getItem("access_token");

            await api.post(
                "/attendance/scan",
                {
                    action: action,
                    location_name: locationName
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Re-fetch data after action completes
            await fetchTodayAttendance();
            await fetchAllowedActions();
        } catch (error) {
            alert(error.response?.data?.detail || "Something went wrong");
        } finally {
            setActionLoading(false); // Hide loader once everything finishes or fails
        }
    };

    const formatTime = (time) => {
        if (!time) return "--";
        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // Shows Loader during initial page load AND during action requests
    if (!attendance || actionLoading) {
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
            <div className="attendance-container">
                {!locationAllowed && (
                    <div className="location-warning">
                        <h3>⚠️ Location Permission Required</h3>
                        <p>
                            Please enable location access in your browser settings to record attendance.
                        </p>
                    </div>
                )}

                <h1 className="page-title">Attendance</h1>
                <p className="page-subtitle">
                    Today • {today} • 📍 {locationName}
                </p>

                <div className="summary-container">
                    <div className="summary-card">
                        <div className="summary-title">Total Records</div>
                        <div className="summary-value">
                            {attendance.total_records ?? 0}
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-title">Check In</div>
                        <div className="summary-value">
                            {formatTime(attendance.check_in)}
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-title">Check Out</div>
                        <div className="summary-value">
                            {formatTime(attendance.check_out)}
                        </div>
                    </div>
                </div>

                <div className="action-section">
                    <h2 className="action-title">Available Actions</h2>
                    <div className="action-buttons">
                        {allowedActions.map((action) => (
                            <button
                                key={action}
                                className="action-button"
                                disabled={!locationAllowed || locationName === "Fetching location..."}
                                onClick={() => handleAttendance(action)}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="timeline-section">
                    <h2 className="timeline-title">Today's Activity</h2>
                    {attendance.today_history?.map((record, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-line">
                                <div
                                    className={`timeline-dot ${
                                        record.action === "Check In"
                                            ? "green"
                                            : record.action === "Break"
                                            ? "orange"
                                            : record.action === "Break Over"
                                            ? "blue"
                                            : "red"
                                    }`}
                                ></div>
                                {index !== attendance.today_history.length - 1 && (
                                    <div className="timeline-connector"></div>
                                )}
                            </div>

                            <div className="timeline-content">
                                <h3>{record.action}</h3>
                                <p>🕒 {formatTime(record.scan_time)}</p>
                                <p>📍 {record.location_name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Attendance;