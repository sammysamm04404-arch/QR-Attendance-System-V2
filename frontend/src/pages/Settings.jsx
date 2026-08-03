import React, { useEffect, useState } from "react";
import {
    FiSettings,
    FiLock,
    FiMoon,
    FiLogOut,
    FiMail,
    FiEye,
    FiEyeOff,
    FiShield,
    FiCheckCircle,
    FiAlertCircle,
    FiSun
} from "react-icons/fi";

import api from "../services/api";
import { COLORS } from "../theme/theme";
import "../styles/pages/Settings.css";
import Loader from "../components/Loader/Loader";
import ConfirmationModal from "../components/ConfirmationModal";
import Navbar from "../components/Navbar";

function Settings({ onLogout }) {

  const [user, setUser] = useState(null);

  const [loadingUser, setLoadingUser] = useState(true);

  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(
      localStorage.getItem("theme") === "dark"
  );

  const [passwordData, setPasswordData] = useState({

      currentPassword: "",

      newPassword: "",

      confirmPassword: ""

  });

  const [showPassword, setShowPassword] = useState({

    current: false,

    new: false,

    confirm: false

  });

  const [passwordStrength, setPasswordStrength] =
      useState({

        label: "Weak",

        percentage: 0,

        color: "#ef4444"

      });

  const [sendingVerification,
      setSendingVerification] = useState(false);

  const [changingPassword,
      setChangingPassword] = useState(false);


  const [showLogoutModal,
      setShowLogoutModal] = useState(false);


  const [alert,setAlert] = 
    useState({

      type: "",

      message: ""

    });

  const calculatePasswordStrength = (password) => {

    let score = 0;

    if (password.length >= 8)
      score++;

    if (/[A-Z]/.test(password))
      score++;

    if (/[a-z]/.test(password))
      score++;

    if (/[0-9]/.test(password))
      score++;

    if (/[^A-Za-z0-9]/.test(password))
      score++;

    if (score <= 2) {

      setPasswordStrength({

        label: "Weak",

        percentage: 35,

        color: "#ef4444"

      });

    }

    else if (score === 3 || score === 4) {

      setPasswordStrength({

        label: "Medium",

        percentage: 70,

        color: "#f59e0b"

      });

    }

    else {

      setPasswordStrength({

        label: "Strong",

        percentage: 100,

        color: "#22c55e"

      });

    }

  };

   
  useEffect(() => {

    fetchProfile();

  }, []);

  useEffect(() => {

    if (darkMode) {

      document.body.classList.add("dark-mode");

      localStorage.setItem(
        "theme",
        "dark"
      );

    }

    else {

      document.body.classList.remove(
        "dark-mode"
      );

      localStorage.setItem(
        "theme",
        "light"
      );

    }

  }, [darkMode]);

  const fetchProfile = async () => {

    try {

      const response =await api.get("/profile");

      setUser(response.data);

    }

    catch (error) {

      setAlert({ type: "error", message:error?.response?.data?.detail || "Unable to load profile."});

    }

    finally {

      setLoadingUser(false);

    }

  };

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setPasswordData(prev => ({

      ...prev,

      [name]: value

    }));

    if (name === "newPassword") {

      calculatePasswordStrength(value);

    }

  };

  const togglePassword = (field) => {

    setShowPassword(prev => ({

      ...prev,

      [field]: !prev[field]

    }));

  };

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setAlert({type: "", message: ""});

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {

      setAlert({type: "error", message:"Passwords do not match."});

      return;

    }

    try {

      setChangingPassword(true);

      const response = await api.post("/auth/change-password",
      {

        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword

      }
      );

      setAlert({ type: "success", message:response.data.message || "Password updated successfully."});

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: ""});

      setPasswordStrength({ label: "Weak", percentage: 0, color: "#ef4444"});

    }

    catch (error) {

      setAlert({type: "error", message: error.response?.data?.detail || "Unable to change password."});

    }

    finally {

      setChangingPassword(false);

    }

  };

  const handleForgotPassword = async () => {

    if (!user?.email) {

      setAlert({ type: "error", message: "User email not found."});
      return;

    }

    try {

      setLoading(true);

      const response =await api.post("/auth/forgot-password",
        {
          email: user.email
        }
      );

      setAlert({ type: "success", message: response.data.message || "Reset link sent successfully."});

    }

    catch (error) {

      setAlert({ type: "error", message: error.response?.data?.detail || "Unable to send reset email."});

    }

    finally {
      setLoading(false);
    }

  };

  const sendVerificationEmail = async () => {

    try {
      setSendingVerification(true);
      const response =await api.post("/auth/send-verification-email");
      setAlert({ type: "success", message: response.data.message});
    }

    catch (error) {
      setAlert({ type: "error", message: error.response?.data?.detail || "Unable to send verification email."});
    }

    finally {

      setSendingVerification(false);

    }

  };

  
  const toggleDarkMode = () => {

    setDarkMode(!darkMode);

  };

  const confirmLogout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

      if (onLogout) {
        onLogout();
      }

  };

  useEffect(() => {

    if (!alert.message)
      return;

    const timer = setTimeout(() => {

      setAlert({type: "", message: ""});

    }, 5000);

    return () => clearTimeout(timer);

  }, [alert]);

  if (loadingUser) {

    return (

      <div className="settings-loading">

          <Loader />

        </div>

    );

  }

  return (
    <>

    <Navbar />

    <div className="settings-page">

      <div className="settings-hero">

        <div>

          <div className="hero-icon">
            <FiSettings />
          </div>

          <h1>Settings</h1>
          <p>
            Manage your account security,
            appearance and preferences.
          </p>

        </div>

        <div className="hero-right">

          <div className="hero-chip">
            <FiShield />
            Enterprise Security
          </div>

        </div>

      </div>

      {
        alert.message && ( <div className={`settings-alert ${alert.type}`}>
          {
            alert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />
          }

          <span>

            {alert.message}

          </span>

          </div>

        )
      }

      <div className="settings-summary">

        <div className="summary-card">

          <div className="summary-icon security">

            <FiLock />

          </div>

          <div>

            <h3>
              Security
            </h3>

            <p>
              Password Protected
            </p>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon email">

            <FiMail />

          </div>

          <div>

            <h3>
              Email
            </h3>

            <p>

              {
                user?.email_verified ? "Verified" : "Verification Pending"
              }

            </p>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon appearance">

            {
              darkMode ? <FiMoon /> : <FiSun />
            }

          </div>

          <div>

            <h3>
              Theme
            </h3>

            <p>
              {
                darkMode ? "Dark Mode" : "Light Mode"
              }
            </p>

          </div>

        </div>

        <div className="summary-card">

          <div className="summary-icon account">
            <FiShield />
          </div>

          <div>

            <h3>
              Account
            </h3>

            <p>
              {
                user?.role || "Employee"

              }

            </p>

          </div>

        </div>

      </div>

      <div className="settings-grid">

        <div className="settings-card password-card">

          <div className="card-header">

            <div className="card-icon">
              <FiLock />
            </div>

            <div>

              <h2>
                Change Password
              </h2>

              <p>
                Update your account password to keep your account secure.
              </p>

            </div>

          </div>

          <form className="settings-form" onSubmit={handleChangePassword}>

            <div className="form-group">

              <div className="label-row">

                <label>
                  Current Password
                </label>

                <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                  Forgot Password?
                </button>

              </div>

              <div className="password-field">

                <input type={showPassword.current ? "text" : "password"} name="currentPassword" placeholder="Enter current password" value={passwordData.currentPassword} onChange={handleInputChange} required />

                <button type="button" className="eye-btn" onClick={() => togglePassword("current")}>
                  {
                    showPassword.current ? <FiEyeOff /> : <FiEye />
                  }
                </button>

              </div>

            </div>

            <div className="form-group">

              <label>
                New Password
              </label>

              <div className="password-field">

                <input type={ showPassword.new ? "text" : "password" } name="newPassword" placeholder="Enter new password" value={passwordData.newPassword} onChange={handleInputChange} required />

                <button type="button" className="eye-btn" onClick={() => togglePassword("new") }>
                  {
                    showPassword.new ? <FiEyeOff /> : <FiEye />
                  }
                </button>

            </div>

            <div className="password-strength">

              <div className="strength-bar">

                <div className="strength-fill" style={{ width: `${passwordStrength.percentage}%`, background: passwordStrength.color }}/>

              </div>

              <span style={{ color: passwordStrength.color }}>
                {
                  passwordStrength.label

                }

              </span>

            </div>

          </div>

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <div className="password-field">

              <input type={ showPassword.confirm ? "text" : "password" } name="confirmPassword" placeholder="Confirm password" value={passwordData.confirmPassword} onChange={handleInputChange} required />

              <button type="button" className="eye-btn" onClick={() => togglePassword("confirm") }>
                {
                  showPassword.confirm ? <FiEyeOff /> : <FiEye />
                }
              </button>

            </div>

          </div>

          <div className="password-actions">

            <button className="primary-btn" disabled={changingPassword}>
              {
                changingPassword ? "Updating..." : "Update Password"
              }
            </button>

          </div>

        </form>

      </div>

      <div className="settings-right">

        <div className="settings-card">

          <div className="card-header">

            <div className="card-icon">
              <FiMail />
            </div>

            <div>

              <h2>
                Email Verification
              </h2>

              <p>
                Verify your email to secure your account and enable password recovery.
              </p>

            </div>

          </div>

          <div className="verification-box">

            <div className="verification-status">

              {
                user?.email_verified ? 
                  <> 
                    <span className="status-badge verified">
                      <FiCheckCircle />
                      Verified
                    </span>

                    <small>
                      Your email address has already been verified.
                    </small>

                  </> : <>
                    <span className="status-badge pending">
                      <FiAlertCircle />
                       Verification Pending
                    </span>

                    <small>
                      Please verify your email to improve account security.
                    </small>

                  </>

              }

            </div>

            {

              !user?.email_verified && (
                <button className="primary-btn" onClick={ sendVerificationEmail } disabled={ sendingVerification }>
                  {
                    sendingVerification ? "Sending..." : "Send Verification Email"
                  }
                </button>
              )

            }

          </div>

        </div>

        <div className="settings-card">

          <div className="card-header">

            <div className="card-icon">

              {
                darkMode ? <FiMoon /> : <FiSun />
              }

            </div>

            <div>

              <h2>
                Appearance
              </h2>

              <p>
                Customize your application theme.
              </p>

            </div>

          </div>

          <div className="toggle-container">

            <div>

              <h4>
                Dark Mode
              </h4>

              <small>
                Reduce eye strain during night usage.
              </small>

            </div>

            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode}/>
              <span className="slider"></span>
            </label>

          </div>

        </div>

        <div className="settings-card logout-card">

          <div className="card-header">

            <div className="card-icon logout">

              <FiLogOut />

            </div>

            <div>

              <h2>
                Logout
              </h2>

              <p>
                Sign out securely from this device.
              </p>

            </div>

          </div>

          <button className="setting-logout-btn" onClick={() => setShowLogoutModal(true) }>
            Logout Account
          </button>

        </div>

      </div>
    
    </div>

  </div>
  
    <ConfirmationModal
      isOpen={showLogoutModal}
      title="Logout"
      message="Are you sure you want to logout from this device?"
      confirmText="Logout"
      cancelText="Cancel"
      onConfirm={confirmLogout}
      onCancel={() => setShowLogoutModal(false)}
    />
    </>
  );
}

export default Settings;