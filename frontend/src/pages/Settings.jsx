import React, { useState } from "react";
import "../styles/pages/Settings.css";

function Settings({ user, onLogout }) {

  const email = user?.email || "";
  const isVerified = user?.isVerified || false;

  // Local Component States
  const [darkMode, setDarkMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. HANDLE PASSWORD INPUT CHANGE
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. CHANGE PASSWORD ACTION (Connect to your actual endpoint)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      // REPLACE THIS FETCH CALL WITH YOUR ACTUAL BACKEND ENDPOINT & METHOD
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass token here if you use JWT Bearer tokens:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password.");
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }

    // Trigger password reset via email if user forgot current password
    const handleForgotPassword = async () => {
    if (!email) {
        setMessage({ type: "error", text: "No email address associated with this account." });
        return;
    }

    try {
        // Call your existing forgot-password API endpoint
        const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link.");
        }

        setMessage({ 
        type: "success", 
        text: `Password reset link sent to ${email}. Check your inbox!` 
        });
    } catch (err) {
        setMessage({ type: "error", text: err.message || "Could not process request." });
    }
    };
  };

  // 3. EMAIL VERIFICATION RESEND ACTION
  const handleResendEmail = async () => {
    setMessage({ type: "", text: "" });
    try {
      // REPLACE WITH YOUR ACTUAL VERIFICATION RESEND API
      const response = await fetch("/api/user/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send email.");

      setMessage({ type: "success", text: "Verification link sent to your email!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Could not resend email." });
    }
  };

  // 4. DARK MODE TOGGLE
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account security and preferences.</p>
      </div>

      {/* Global Alert Message Display */}
      {message.text && (
        <div className={`settings-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-container">
        {/* 1. EMAIL VERIFICATION */}
        <div className="settings-card">
          <div className="card-header-row">
            <div>
              <h3>Email Verification</h3>
              <p className="card-desc">Your account email address and status.</p>
            </div>
            <span className={`status-pill ${isVerified ? "verified" : "unverified"}`}>
              {isVerified ? "Verified" : "Unverified"}
            </span>
          </div>

          <div className="email-row-box">
            <span className="email-address">{email || "No email available"}</span>
            {!isVerified && (
              <button 
                type="button" 
                className="action-btn secondary"
                onClick={handleResendEmail}
              >
                Resend Verification
              </button>
            )}
          </div>
        </div>

        {/* CHANGE PASSWORD CARD WITH FORGOT PASSWORD OPTION */}
        <div className="settings-card">
        <h3>Change Password</h3>
        <p className="card-desc">Update your password to keep your account secure.</p>

        <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
            <div className="label-with-action">
                <label>Current Password</label>
                <button
                type="button"
                className="forgot-link-btn"
                onClick={handleForgotPassword}
                >
                Forgot current password?
                </button>
            </div>
            <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
            />
            </div>

            <div className="form-grid-2">
            <div className="form-group">
                <label>New Password</label>
                <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
                />
            </div>

            <div className="form-group">
                <label>Confirm New Password</label>
                <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
                />
            </div>
            </div>

            <div className="form-actions">
            <button type="submit" className="action-btn primary" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
            </button>
            </div>
        </form>
        </div>

        {/* 3. DARK MODE */}
        <div className="settings-card">
          <div className="toggle-row">
            <div>
              <h3>Dark Mode</h3>
              <p className="card-desc">Switch between light and dark themes.</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleThemeToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;