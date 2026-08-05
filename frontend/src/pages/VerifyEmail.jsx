import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiArrowRight,
    FiHome,
} from "react-icons/fi";
import { toast } from "react-toastify";

import api from "../services/api";
import Loader from "../components/Loader";

import "../styles/pages/VerifyEmail.css";

export default function VerifyEmail() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        verifyEmail();

    }, []);

    const verifyEmail = async () => {

        if (!token) {

            toast.error("Verification token not found.");

            setStatus("error");
            setLoading(false);
            return;
        }

        try {

            const response = await api.post("/auth/verify-email", {
                token,
            });

            toast.success(
                response.data.message ||
                "Email verified successfully!"
            );

            setStatus("success");

        } catch (error) {

            toast.error(
                error.response?.data?.detail ||
                "Unable to verify your email."
            );

            setStatus("error");

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return (
            <div className="verify-email-page">
                <Loader />

                <div className="verify-card">
                    <FiLoader className="verify-icon spinning" />

                    <h2>Verifying your email...</h2>

                    <p>
                        Please wait while we verify your account.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-email-page">

            <div className="verify-card">

                {status === "success" ? (
                    <>

                        <div className="icon success">
                            <FiCheckCircle />
                        </div>

                        <h1>Email Verified</h1>

                        <p>
                            Your email address has been verified successfully.
                            You can now log in to your account.
                        </p>

                        <button
                            className="verify-btn"
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                            <FiArrowRight />
                        </button>

                    </>
                ) : (
                    <>

                        <div className="icon error">
                            <FiXCircle />
                        </div>

                        <h1>Verification Failed</h1>

                        <p>
                            This verification link is invalid, expired,
                            or has already been used.
                        </p>

                        <button
                            className="verify-btn secondary"
                            onClick={() => navigate("/")}
                        >
                            <FiHome />
                            Go Home
                        </button>

                    </>
                )}

            </div>

        </div>
    );
}