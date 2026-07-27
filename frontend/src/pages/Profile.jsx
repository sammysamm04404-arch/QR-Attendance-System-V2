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
    const [showEditModal, setShowEditModal] = useState(false);

    const [editData, setEditData] = useState({
        name: "",
        email: ""
    });

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

    const handleInputChange = (e) => {

        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));

    };

    const updateProfile = async () => {

        if (!editData.name.trim()) {
            toast.error("Name is required.");
            return;
        }

        if (!editData.email.trim()) {
            toast.error("Email is required.");
            return;
        }

        try {
            await api.put("/profile", editData);
            toast.success("Profile updated successfully.");
            setShowEditModal(false);
            fetchProfile();
        }

        catch (error) {
            console.log(error);
            toast.error( error.response?.data?.detail || "Unable to update profile.");
        }

    };

    if (loading) {

        return (

            <>
                <Navbar />
                <Loader />
            </>

        );

    }

    if (!profile) {
        return (
            <>
                <Navbar />
                <div className="profile-loading">
                    Unable to load profile.
                </div>
            </>
        );
    }

    const avatarLetter = profile.name.charAt(0).toUpperCase();

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

                    <button className="edit-profile-btn" onClick={() => { setEditData({ name: profile.name, email: profile.email }); setShowEditModal(true);}}>
                        <FaEdit />
                        Edit Profile
                    </button>

                </div>

                <div className="profile-content">

                    {/* Personal Information */}

                    <div className="profile-card">

                        <div className="card-header">

                            <h2>
                                Personal Information
                            </h2>

                        </div>

                        <div className="profile-details">

                            <div className="detail-item">

                                <FaUser className="detail-icon"/>

                                <div>
                                    <span>Name</span>
                                    <h4>{profile.name}</h4>
                                </div>

                            </div>

                            <div className="detail-item">

                                <FaEnvelope className="detail-icon"/>
                                <div>
                                    <span>Email</span>
                                    <h4>{profile.email}</h4>
                                </div>

                            </div>

                            <div className="detail-item">

                                <FaUserShield className="detail-icon"/>
                                <div>
                                    <span>Role</span>
                                    <h4>{profile.role}</h4>
                                </div>

                            </div>

                            <div className="detail-item">

                                <FaCheckCircle className="detail-icon"/>
                                <div>
                                    <span>Status</span>
                                    <h4>{profile.status}</h4>
                                </div>

                            </div>

                            <div className="detail-item">

                                <FaCalendarAlt className="detail-icon"/>

                                <div>

                                    <span>Member Since</span>
                                    <h4>
                                        {new Date(profile.created_at).toLocaleDateString()}
                                    </h4>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* Summary */}

                    <div className="profile-card">

                        <div className="card-header">

                            <h2>
                                Account Summary
                            </h2>

                        </div>

                        <div className="summary-grid">

                            <div className="summary-box">

                                <FaIdBadge/>
                                <h3>
                                    {profile.id}
                                </h3>
                                <p>User ID</p>

                            </div>

                            <div className="summary-box">

                                <FaUserShield/>
                                <h3>
                                    {profile.role}
                                </h3>
                                <p>Role</p>

                            </div>

                            <div className="summary-box">

                                <FaCheckCircle/>
                                <h3>
                                    {profile.status}
                                </h3>
                                <p>Status</p>

                            </div>

                            <div className="summary-box">

                                <FaCalendarAlt/>
                                <h3>
                                    {new Date(profile.created_at).getFullYear()}
                                </h3>
                                <p>Member Since</p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {
                showEditModal && (

                    <div className="profile-modal-overlay">

                        <div className="profile-modal">

                            <h2>Edit Profile</h2>

                            <div className="profile-form-group">

                                <label>Full Name</label>
                                <input type="text" name="name" value={editData.name} onChange={handleInputChange}/>

                            </div>

                            <div className="profile-form-group">

                                <label>Email Address</label>
                                <input type="email" name="email" value={editData.email} onChange={handleInputChange}/>

                            </div>

                            <div className="profile-modal-buttons">

                                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>

                                <button className="save-btn" onClick={updateProfile}>
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </div>

                )
            }

        </>

    );
}

export default Profile;