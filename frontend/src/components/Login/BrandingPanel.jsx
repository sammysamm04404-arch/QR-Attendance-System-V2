import {
    MdQrCodeScanner,
    MdVerifiedUser,
    MdLocationOn,
    MdSecurity
} from "react-icons/md";
import sinley_solution from "../../../public/sinley_solution.png";

import "./BrandingPanel.css";

function BrandingPanel() {

    return (

        <div className="branding-panel">

            <div>

                <div className="branding-logo">

                    <img src={sinley_solution} />

                </div>

                <h1>

                    QR Attendance System

                </h1>

                <p>

                    Smart Employee Attendance Platform

                </p>

            </div>

            <div className="branding-features">

                <div>

                    <MdVerifiedUser />

                    <span>Secure Authentication</span>

                </div>

                <div>

                    <MdQrCodeScanner />

                    <span>QR Based Attendance</span>

                </div>

                <div>

                    <MdLocationOn />

                    <span>Live Location Tracking</span>

                </div>

                <div>

                    <MdSecurity />

                    <span>Enterprise Security</span>

                </div>

            </div>

        </div>

    );

}

export default BrandingPanel;