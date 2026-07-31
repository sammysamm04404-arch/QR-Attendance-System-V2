import React, { useState, useEffect } from "react";
import api from "../services/api";
import { COLORS } from "../theme/theme"; 
import "../styles/pages/Settings.css";

function Settings({ onLogout }) {
  const [userEmail, setUserEmail] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setAlert({ type: "error", text: "Session expired. Please log in again." });
      setLoadingUser(false);
      return;
    }

    try {
      const response = await api.get("/profile");
        
      if (!response.ok) {
        throw new Error("Failed to load user profile.");
      }

      const data = await response.data;
      setUserEmail(data.email || "");
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setLoadingUser(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlert({ type: "error", text: "New passwords do not match." });
      return;
    }

    const token = localStorage.getItem("access_token");
    setSubmittingPassword(true);

    try {
      const response = await fetch("/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update password.");
      }

      setAlert({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!userEmail) {
      setAlert({ type: "error", text: "No email address found for this user." });
      return;
    }

    setAlert({ type: "", text: "" });

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send reset link.");
      }

      setAlert({
        type: "success",
        text: `Password reset link sent to ${userEmail}`,
      });
    } catch (err) {
      setAlert({ type: "error", text: err.message });
    }
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    if (onLogout) onLogout();
  };

  return (
    <div className="settings-page" style={{ backgroundColor: COLORS.background }}>
      <div className="settings-header">
        <h1 style={{ color: COLORS.text }}>Settings</h1>
        <p style={{ color: COLORS.secondaryText }}>
          Manage account security, theme, and session actions.
        </p>
      </div>

      {alert.text && (
        <div
          className="settings-alert"
          style={{
            backgroundColor: alert.type === "success" ? "#DCFCE7" : "#FEE2E2",
            color: alert.type === "success" ? COLORS.success : COLORS.danger,
            borderColor: alert.type === "success" ? COLORS.success : COLORS.danger,
          }}
        >
          {alert.text}
        </div>
      )}

      <div className="settings-container">
        {/* ACCOUNT EMAIL DISPLAY */}
        <div className="settings-card" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <h3 style={{ color: COLORS.text }}>Account Information</h3>
          <p className="card-desc" style={{ color: COLORS.secondaryText }}>
            Your registered account email.
          </p>
          <div className="email-display-box" style={{ borderColor: COLORS.border }}>
            <span style={{ color: COLORS.text }}>
              {loadingUser ? "Loading..." : userEmail || "No email available"}
            </span>
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="settings-card" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <h3 style={{ color: COLORS.text }}>Change Password</h3>
          <p className="card-desc" style={{ color: COLORS.secondaryText }}>
            Update your password to keep your account secure.
          </p>

          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <div className="label-row">
                <label style={{ color: COLORS.text }}>Current Password</label>
                <button
                  type="button"
                  className="forgot-btn"
                  style={{ color: COLORS.primary }}
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
                style={{ borderColor: COLORS.border, color: COLORS.text }}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label style={{ color: COLORS.text }}>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={handleInputChange}
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ color: COLORS.text }}>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={handleInputChange}
                  style={{ borderColor: COLORS.border, color: COLORS.text }}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-primary"
                style={{ backgroundColor: COLORS.primary }}
                disabled={submittingPassword}
              >
                {submittingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

        {/* DARK MODE TOGGLE */}
        <div className="settings-card" style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <div className="toggle-row">
            <div>
              <h3 style={{ color: COLORS.text }}>Dark Mode</h3>
              <p className="card-desc" style={{ color: COLORS.secondaryText, margin: 0 }}>
                Switch between light and dark themes.
              </p>
            </div>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={handleThemeToggle} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;