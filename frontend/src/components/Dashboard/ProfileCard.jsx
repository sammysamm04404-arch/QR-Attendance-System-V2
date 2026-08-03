import { FaUserCircle, FaEnvelope, FaCircle } from "react-icons/fa";

function ProfileCard({ user }) {

    return (

        <div className="dash-profile-card">

            <div className="dash-profile-header">
                <FaUserCircle className="dash-profile-avatar" />
                <div>
                    <h2>{user.name}</h2>
                    <p>{user.role}</p>
                </div>
            </div>

            <div className="dash-profile-info">
                <div className="dash-profile-row">
                    <FaEnvelope />
                    <span>{user.email}</span>
                </div>

                <div className="dash-profile-row">
                    <FaCircle className="status-green" />
                    <span>Active</span>
                </div>
            </div>

        </div>

    );

}

export default ProfileCard;