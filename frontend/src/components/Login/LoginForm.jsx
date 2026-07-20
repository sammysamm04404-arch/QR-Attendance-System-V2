import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./LoginForm.css";

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