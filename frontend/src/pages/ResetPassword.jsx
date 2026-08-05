import React, { useEffect, useState } from "react";
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";
import Loader from "../components/Loader/Loader";
import "../styles/pages/ResetPassword.css";

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [userEmail, setUserEmail] = useState("");

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });

    const [resetpasswordStrength, setresetPasswordStrength] = useState({
        label: "Weak",
        percentage: 0,
        color: "#ef4444"
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid password reset link.")
            setLoading(false);
            return;
        }

        validateToken();
    }, []);

    const validateToken = async () => {
        try {
            const response = await api.get(
                `/auth/validate-reset-token/${token}`
            );
            setValidToken(true);
            setUserEmail(response.data.email);
        } 
        catch (error) {
            setValidToken(false);
            toast.error(error.response?.data?.detail || "Reset link has expired or is invalid.")
        } 
        finally {
            setLoading(false);
        }
    };

    const togglePassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const calculatePasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            setresetPasswordStrength({
                label: "Weak",
                percentage: 35,
                color: "#ef4444"
            });
        } 
        else if (score <= 4) {
            setresetPasswordStrength({
                label: "Medium",
                percentage: 70,
                color: "#f59e0b"
            });
        } 
        else {
            setresetPasswordStrength({
                label: "Strong",
                percentage: 100,
                color: "#22c55e"
            });
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

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Password do not match.");
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post(
                "/auth/reset-password",
                {
                    token,
                    new_password: passwordData.newPassword
                }
            );

            toast.success(response.data.message || "Password reset successfully.");

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } 
        catch (error) {
            toast.error(error.response?.data?.detail || "Unable to reset password.");
        } 
        finally {
            setSubmitting(false);
        }
    };

    // 1. Loading State
    if (loading) {
        return (
            <div className="reset-loading">
                <Loader />
            </div>
        );
    }

    // 2. Invalid Token State (Renders Error Card)
    if (!validToken) {
        return (
            <div className="reset-page">
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-icon">
                            <FiLock />
                        </div>
                        <h1>Invalid or Expired Link</h1>
                        <p>{alert.message || "This password reset link is invalid or has expired."}</p>
                    </div>
                    <div className="login-link" style={{ marginTop: "20px" }}>
                        <button type="button" className="reset-primary-btn" onClick={() => navigate("/login")}>
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Valid Token State (Renders Form)
    return (
        <div className="reset-page">
            <div className="reset-card">
                <div className="reset-header">
                    <div className="reset-icon">
                        <FiLock />
                    </div>
                    <h1>Reset Password</h1>
                    <p>Create a new secure password for your account.</p>
                    {userEmail && <div className="email-chip">{userEmail}</div>}
                </div>

                <form className="reset-form" onSubmit={handleResetPassword}>
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="password-field">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                name="newPassword"
                                placeholder="Enter your new password"
                                value={passwordData.newPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" className="eye-btn" onClick={() => togglePassword("new")}>
                                {showPassword.new ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="password-reset-strength">
                        <div className="reset-strength-bar">
                            <div 
                                className="reset-strength-fill" 
                                style={{ width: `${resetpasswordStrength.percentage}%`, background: resetpasswordStrength.color }}
                            />
                        </div>
                        <span style={{ color: resetpasswordStrength.color }}>
                            {resetpasswordStrength.label}
                        </span>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="password-field">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm your new password"
                                value={passwordData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" className="eye-btn" onClick={() => togglePassword("confirm")}>
                                {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="reset-actions">
                        <button type="submit" className="reset-primary-btn" disabled={submitting}>
                            {submitting ? "Updating Password..." : "Reset Password"}
                        </button>
                    </div>

                    <div className="login-link">
                        <button type="button" className="reset-secondary-btn" onClick={() => navigate("/login")}>
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;