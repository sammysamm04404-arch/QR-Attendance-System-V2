import { FaUserCircle, FaEnvelope, FaCircle } from "react-icons/fa";

function ProfileCard({ user }) {

    return (

        <div className="profile-card">

            <div className="profile-header">
                <FaUserCircle className="profile-avatar" />
                <div>
                    <h2>{user.name}</h2>
                    <p>Employee</p>
                </div>
            </div>

            <div className="profile-info">
                <div className="profile-row">
                    <FaEnvelope />
                    <span>{user.email}</span>
                </div>

                <div className="profile-row">
                    <FaCircle className="status-green" />
                    <span>Active</span>
                </div>
            </div>

        </div>

    );

}

export default ProfileCard;