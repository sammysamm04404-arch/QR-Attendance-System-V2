import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginForm.css";
import toast  from "react-hot-toast";

function LoginForm({
    email,
    password,
    setEmail,
    setPassword,
    errors,
    showPassword,
    setShowPassword,
    loading,
    handleLogin
}) {

    const [sendingReset, setSendingReset] = useState(false);

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email address first.");
            return;
        }

        try {
            setSendingReset(true);
            const response = await api.post("/auth/forgot-password", { email });
            toast.success(response.data.message || "Reset link sent successfully.");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Unable to send reset email.");
        } finally {
            setSendingReset(false);
        }
    };

    return (

        <div className="login-form-container">

            <h2>Welcome Back</h2>

            <p className="login-description">
                Sign in to continue to your account.
            </p>

            <div className="input-group">

                <label>Email Address *</label>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "input error" : "input"}
                    placeholder="Enter your email"
                />

                {
                    errors.email &&
                    <span className="error-text">
                        {errors.email}
                    </span>
                }

            </div>

            <div className="input-group">

                <label>Password *</label>

                <div className="password-wrapper">

                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={errors.password ? "input error" : "input"}
                        placeholder="Enter your password"
                    />

                    <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {
                            showPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                        }
                    </button>

                </div>

                {
                    errors.password &&
                    <span className="error-text">
                        {errors.password}
                    </span>
                }

            </div>

            <button type="button" className="forgot-link" onClick={handleForgotPassword} disabled={sendingReset}>
                {sendingReset ? "Sending..." : "Forgot Password?"}
            </button>

            <button
                className="login-btn"
                onClick={handleLogin}
                disabled={loading}
            >
                {
                    loading
                        ? "Signing In..."
                        : "Sign In"
                }
            </button>

        </div>

    );

}

export default LoginForm;