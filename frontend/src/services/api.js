import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

let isSessionExpired = false;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check if the error came from the login request
        const isLoginRequest = error.config?.url?.includes("/auth/login");

        if (
            error.response?.status === 401 &&
            !isSessionExpired &&
            !isLoginRequest // <-- Only run this block if it's NOT a login request
        ) {
            isSessionExpired = true;

            toast.error(
                "Your session has expired. Please login again.",
                {
                    position: "top-right",
                    autoClose: 2500,
                    closeOnClick: true,
                    pauseOnHover: true
                }
            );

            localStorage.removeItem("access_token");
            localStorage.removeItem("user");

            setTimeout(() => {
                window.location.href = "/login";
            }, 2500);
        }

        return Promise.reject(error);
    }
);

export default api;