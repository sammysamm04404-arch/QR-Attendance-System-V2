import { useState } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pages/Login.css";
import BrandingPanel from "../components/Login/BrandingPanel";
import LoginForm from "../components/Login/LoginForm";
import toast from "react-hot-toast";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/dashboard";
    const handleLogin = async () => {

        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        }
        else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            newErrors.email = "Please enter a valid email";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "access_token",
                response.data.access_token
            );
            localStorage.setItem("user_role",response.data.user_role);

            toast.success("Login Successful!");
            navigate(from, {
                replace: true
            });

        }
        catch (error) {

            if (error.response) {

                const message = error.response?.data?.detail || "Invalid email or password";
                toast.error(message);

               // setErrors({
               //     password:message
               // });

            }

            else {

                toast.error("Something went wrong! please try again later.");
                //setErrors({
                //    password: "Server not responding"
                //});

            }

        }
        finally {

            setLoading(false);

        }

    };

    return (

    <div className="login-page">

        <BrandingPanel />

        <LoginForm
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            errors={errors}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            handleLogin={handleLogin}
        />

    </div>

    );
}

export default Login;