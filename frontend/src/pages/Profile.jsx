import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/pages/Profile.css";
import "../components/Loader/Loader";

import { FaUser, FaEnvelope, FaUserShield, FaCheckCircle, FaCalendarAlt, FaEdit, FaIdBadge} from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";

function Profile() {
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const avatarLetter = profile.name.charAt(0).toUpperCase();

    const fetchProfile = async () => {

        try {
            const response = await api.get("/profile");
            setProfile(response.data);
        }

        catch (error) {
            console.log(error);
            toast.error("Unable to load profile.");
        }

        finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        fetchProfile();
    }, []);

    if (loading) {

        return (

            <>
                <Navbar />
                <Loader />
            </>

        );

    }

    return (

        <>

            <Navbar />

            <div className="profile-container">

                <div className="profile-hero">

                    <div className="profile-avatar">
                        {avatarLetter}
                    </div>

                    <div className="profile-info">

                        <h1>
                            {profile.name}
                        </h1>

                        <h3>
                            {profile.role}
                        </h3>

                        <span className="status-badge">
                            {profile.status}
                        </span>

                    </div>

                    <button className="edit-profile-btn">
                        <FaEdit />
                        Edit Profile
                    </button>

                </div>

            </div>

        </>

    );
}

export default Profile;