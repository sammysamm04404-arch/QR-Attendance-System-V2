import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../services/api";
import "../styles/pages/Profile.css";

import {FaUser, FaEnvelope, FaUserShield, FaCheckCircle, FaCalendarAlt, FaEdit, FaIdBadge, FaCopy, FaCheck, FaTimes, FaShieldAlt} from "react-icons/fa";
import toast from "react-hot-toast";
import Loader from "../components/Loader/Loader";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 260, damping: 20 } 
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);

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
    setEditData((prev) => ({ ...prev, [name]: value }));
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
      toast.error(error.response?.data?.detail || "Unable to update profile.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("User ID copied!");
    setTimeout(() => setCopied(false), 2000);
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
          <p>Unable to load profile details.</p>
        </div>
      </>
    );
  }

  const avatarLetter = profile.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="profile-wrapper">
      <Navbar />

      <motion.div 
        className="profile-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HERO SECTION */}
        <motion.div className="profile-hero" variants={itemVariants}>
          <div className="hero-background-shapes">
            <span className="glow-orb orb-1"></span>
            <span className="glow-orb orb-2"></span>
          </div>

          <div className="hero-main-content">
            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {avatarLetter}
              </div>
              <span className="live-status-dot" title="Account Active"></span>
            </div>

            <div className="profile-info">
              <div className="profile-title-row">
                <h1>{profile.name}</h1>
                <span className="role-pill">
                  <FaShieldAlt className="pill-icon" />
                  {profile.role}
                </span>
              </div>

              <div className="status-badge-container">
                <span className={`status-badge ${profile.status?.toLowerCase()}`}>
                  <span className="pulse-indicator"></span>
                  {profile.status} Account
                </span>
              </div>
            </div>
          </div>

          <motion.button 
            className="edit-profile-btn" 
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { 
              setEditData({ name: profile.name, email: profile.email }); 
              setShowEditModal(true);
            }}
          >
            <FaEdit />
            <span>Edit Profile</span>
          </motion.button>
        </motion.div>

        {/* CONTENT GRID */}
        <div className="profile-content">
          {/* Personal Information */}
          <motion.div className="profile-card" variants={itemVariants}>
            <div className="card-header">
              <h2>Personal Information</h2>
              <span className="card-subtitle">Manage your credentials & account identity</span>
            </div>

            <div className="profile-details">
              <div className="detail-item">
                <div className="icon-wrapper">
                  <FaUser className="detail-icon"/>
                </div>
                <div>
                  <span>Full Name</span>
                  <h4>{profile.name}</h4>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-wrapper">
                  <FaEnvelope className="detail-icon"/>
                </div>
                <div>
                  <span>Email Address</span>
                  <h4>{profile.email}</h4>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-wrapper">
                  <FaUserShield className="detail-icon"/>
                </div>
                <div>
                  <span>System Role</span>
                  <h4>{profile.role}</h4>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-wrapper">
                  <FaCheckCircle className="detail-icon"/>
                </div>
                <div>
                  <span>Account Status</span>
                  <h4>{profile.status}</h4>
                </div>
              </div>

              <div className="detail-item">
                <div className="icon-wrapper">
                  <FaCalendarAlt className="detail-icon"/>
                </div>
                <div>
                  <span>Member Since</span>
                  <h4>{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Summary */}
          <motion.div className="profile-card" variants={itemVariants}>
            <div className="card-header">
              <h2>Account Overview</h2>
              <span className="card-subtitle">Quick metrics and stats</span>
            </div>

            <div className="summary-grid">
              <motion.div 
                className="summary-box clickable" 
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => copyToClipboard(profile.id)}
              >
                <div className="summary-box-top">
                  <FaIdBadge />
                </div>
                <h3>#{profile.id}</h3>
                <p>User ID</p>
              </motion.div>

              <motion.div className="summary-box" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <FaUserShield />
                <h3>{profile.role}</h3>
                <p>Access Level</p>
              </motion.div>

              <motion.div className="summary-box" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <FaCheckCircle />
                <h3>{profile.status}</h3>
                <p>Current Status</p>
              </motion.div>

              <motion.div className="summary-box" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <FaCalendarAlt />
                <h3>{new Date(profile.created_at).getFullYear()}</h3>
                <p>Joined Year</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div 
            className="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div 
              className="profile-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Edit Profile</h2>
                <button className="close-modal-btn" onClick={() => setShowEditModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <div className="profile-form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter full name"
                />
              </div>

              <div className="profile-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={editData.email} 
                  onChange={handleInputChange} 
                  placeholder="Enter email address"
                />
              </div>

              <div className="profile-modal-buttons">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <motion.button 
                  className="save-btn" 
                  onClick={updateProfile}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Profile;