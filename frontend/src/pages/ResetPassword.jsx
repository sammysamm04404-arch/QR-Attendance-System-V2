import React, { useEffect, useState } from "react";
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheckCircle,
    FiAlertCircle
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

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

    const [alert, setAlert] = useState({
        type: "",
        message: ""
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false
    });

    const [passwordStrength, setPasswordStrength] = useState({
        label: "Weak",
        percentage: 0,
        color: "#ef4444"
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {

        if (!token) {

            setAlert({
                type: "error",
                message: "Invalid password reset link."
            });

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

            setAlert({
                type: "error",
                message:
                    error.response?.data?.detail ||
                    "Reset link has expired."
            });

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

            setPasswordStrength({
                label: "Weak",
                percentage: 35,
                color: "#ef4444"
            });

        }

        else if (score <= 4) {

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

        setAlert({
            type: "",
            message: ""
        });

        if (passwordData.newPassword !== passwordData.confirmPassword) {

            setAlert({
                type: "error",
                message: "Passwords do not match."
            });

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

            setAlert({
                type: "success",
                message: response.data.message || "Password reset successfully."
            });

            setTimeout(() => {

                navigate("/login");

            }, 3000);

        }

        catch (error) {

            setAlert({
                type: "error",
                message: error.response?.data?.detail || "Unable to reset password."
            });

        }

        finally {
            setSubmitting(false);
        }

    };

    useEffect(() => {

        if (!alert.message) return;

        const timer = setTimeout(() => {

            setAlert({
                type: "",
                message: ""
            });

        }, 5000);

        return () => clearTimeout(timer);

    }, [alert]);

    if (loading) {

        return (

            <div className="reset-loading">

                <Loader />

            </div>

        );

    }

    if (!validToken) {

        return (

            <div className="reset-page">

                <div className="reset-card">

                    <div className="reset-header">

                        <div className="reset-icon">
                            <FiLock />
                        </div>

                        <h1>Reset Password</h1>

                        <p>
                            Create a new secure password for your account.
                        </p>

                        <div className="email-chip">
                            {userEmail}
                        </div>

                    </div>

                    {
                        alert.message && (

                            <div className={`reset-alert ${alert.type}`}>

                                {
                                    alert.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />
                                }

                                <span>
                                    {alert.message}
                                </span>

                            </div>

                        )
                    }

                    <form className="reset-form" onSubmit={handleResetPassword}>

                        <div className="form-group">

                            <label>
                                New Password
                            </label>

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
                                    {
                                        showPassword.new ? <FiEyeOff /> : <FiEye />
                                    }
                                </button>

                            </div>

                        </div>

                        <div className="password-strength">

                            <div className="strength-bar">

                                <div className="strength-fill" style={{ width: `${passwordStrength.percentage}%`, background: passwordStrength.color}}/>

                            </div>

                            <span style={{ color: passwordStrength.color }}>
                                {passwordStrength.label}
                            </span>

                        </div>

                        <div className="form-group">

                            <label>
                                Confirm Password
                            </label>

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
                                    {
                                        showPassword.confirm ? <FiEyeOff /> : <FiEye />
                                    }
                                </button>

                            </div>

                        </div>

                        <div className="reset-actions">

                            <button type="submit" className="primary-btn" disabled={submitting}>
                                {
                                    submitting ? "Updating Password..." : "Reset Password"
                                }
                            </button>

                        </div>

                        <div className="login-link">

                            <button type="button" className="secondary-btn" onClick={() => navigate("/login")}>
                                Back to Login
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        );

    }

};

export default ResetPassword;