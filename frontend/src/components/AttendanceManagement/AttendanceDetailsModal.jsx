import { useEffect, useState } from "react";
import api from "../../services/api";
import { FaUser, FaEnvelope, FaCalendarAlt, FaClock, FaBusinessTime, FaTimes } from "react-icons/fa";
import Loader from "../Loader/Loader";

function AttendanceDetailsModal({

    open,
    attendance,
    onClose

}){

    const [details,setDetails]=useState(null);

    useEffect(()=>{

        if(open && attendance){
            fetchDetails();
        }

    },[open,attendance]);

    const fetchDetails=async()=>{

        try{

            const response=await api.get(
                `/admin/attendance/${attendance.user_id}/${attendance.date}`
            );

            setDetails(response.data);

        }

        catch(error){
            console.log(error);
        }

    };

    if(!open) return null;

    if(!details){

        return(

            <div className="attendance-modal-overlay">

                <Loader />

            </div>

        );

    }

    return(

        <div className="attendance-modal-overlay">

            <div className="attendance-modal">

                <div className="attendance-modal-header">

                    <h2>
                        Attendance Details
                    </h2>

                    <button onClick={onClose}>
                        <FaTimes/>
                    </button>

                </div>

                <div className="attendance-details-grid">

                    <div className="detail-card">

                        <FaUser/>

                        <div>

                            <label>Name</label>
                            <p>
                                {details.employee.name}
                            </p>

                        </div>

                    </div>

                    <div className="detail-card">

                        <FaEnvelope/>

                        <div>

                            <label>Email</label>

                            <p>
                                {details.employee.email}
                            </p>

                        </div>

                    </div>

                    <div className="detail-card">

                        <FaCalendarAlt/>

                        <div>

                            <label>Date</label>

                            <p>
                                {details.attendance.date}
                            </p>

                        </div>

                    </div>

                    <div className="detail-card">

                        <FaClock/>

                        <div>

                            <label>Check In</label>

                            <p>
                                {
                                    details.attendance.check_in ?
                                    new Date(
                                        details.attendance.check_in
                                    ).toLocaleTimeString()
                                    :
                                    "--"
                                }
                            </p>

                        </div>

                    </div>

                    <div className="detail-card">
                        <FaClock/>

                        <div>

                            <label>Check Out</label>
                            <p>
                                {
                                    details.attendance.check_out ?
                                    new Date(
                                        details.attendance.check_out
                                    ).toLocaleTimeString()
                                    :
                                    "--"
                                }
                            </p>

                        </div>

                    </div>

                    <div className="detail-card">

                        <FaBusinessTime/>

                        <div>

                            <label>Working Hours</label>

                            <p>
                                {details.attendance.working_hours}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default AttendanceDetailsModal;