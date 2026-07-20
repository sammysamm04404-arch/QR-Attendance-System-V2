import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function QRLanding() {

    const navigate = useNavigate();

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (token) {

            navigate("/attendance", { replace: true });

        } else {

            navigate("/login", {
                replace: true,
                state: {
                    from: "/attendance"
                }
            });

        }

    }, []);

    return (

        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                background: "#f8fafc"
            }}
        >

            <h1>QR Attendance</h1>

            <p>Checking authentication...</p>

        </div>

    );

}

export default QRLanding;