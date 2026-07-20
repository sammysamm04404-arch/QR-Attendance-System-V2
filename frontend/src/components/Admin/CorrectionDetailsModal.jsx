import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function CorrectionDetailsModal({

    open,
    request,
    onClose

}) {

    const [details, setDetails] = useState(null);
    const [remarks, setRemarks] = useState("");

    useEffect(() => {

        if (open && request) {
            fetchDetails();
        }

    }, [open, request]);

    const fetchDetails = async () => {

        try {

            const response = await api.get(

                `/admin/corrections/${request.id}`

            );
            setDetails(response.data);

        }

        catch (error) {
            console.log(error);
        }

    };

    const approveRequest = async () => {

        try {

            await api.put(

                `/admin/corrections/${request.id}/approve`

            );

            toast.success("Attendance correction approved.");
            onClose();

        }

        catch (error) {
            toast.error(error.response?.data?.detail || "Something went wrong.");
        }

    };

    const rejectRequest = async () => {

        if (!remarks.trim()) {
            toast.error("Please enter rejection remarks.");
            return;
        }

        try {

            await api.put(
                `/admin/corrections/${request.id}/reject`,
                null,

                {

                    params: {
                        remarks
                    }

                }

            );

            toast.success("Attendance correction rejected.");
            onClose();

        }

        catch (error) {

            toast.error(error.response?.data?.detail || "Something went wrong.");

        }

    };

    if (!open) return null;

    if (!details) {

        return (

            <div className="modal-overlay">

                <div className="correction-modal">
                    <h3>Loading...</h3>
                </div>

            </div>

        );

    }

    return (

        <div className="modal-overlay">

            <div className="correction-modal">

                <div className="modal-header">

                    <h2>
                        Attendance Correction
                    </h2>

                </div>

                <div className="modal-body">

                    <div className="detail-row">

                        <strong>
                            Employee
                        </strong>

                        <span>
                            {details.employee.name}
                        </span>

                    </div>

                    <div className="detail-row">

                        <strong>
                            Email
                        </strong>

                        <span>
                            {details.employee.email}
                        </span>

                    </div>

                    <div className="detail-row">

                        <strong>
                            Date
                        </strong>

                        <span>

                            {
                                new Date(
                                    details.attendance.date
                                ).toLocaleDateString()
                            }

                        </span>

                    </div>

                    <div className="detail-row">

                        <strong>
                            Check In
                        </strong>

                        <span>

                            {
                                details.attendance.check_in
                                    ?
                                    new Date(
                                        details.attendance.check_in
                                    ).toLocaleTimeString([],{
                                        hour:"2-digit",
                                        minute:"2-digit"
                                    })
                                    :
                                    "--"
                            }

                        </span>

                    </div>

                    <div className="detail-row">

                        <strong>
                            Existing Check Out
                        </strong>

                        <span>

                            {

                                details.attendance.check_out

                                    ?

                                    new Date(

                                        details.attendance.check_out

                                    ).toLocaleTimeString([],{

                                        hour:"2-digit",

                                        minute:"2-digit"

                                    })

                                    :

                                    "--"

                            }

                        </span>

                    </div>

                    <div className="detail-row">

                        <strong>
                            Requested Check Out
                        </strong>

                        <span>

                            {

                                new Date(

                                    details.requested_checkout

                                ).toLocaleTimeString([],{

                                    hour:"2-digit",
                                    minute:"2-digit"

                                })

                            }

                        </span>

                    </div>

                    <div className="detail-column">

                        <strong>
                            Reason
                        </strong>

                        <p>
                            {details.reason}
                        </p>

                    </div>

                    <div className="detail-column">

                        <strong>
                            Notes
                        </strong>

                        <p>
                            {details.notes || "--"}
                        </p>

                    </div>

                    {

                        details.status === "Pending" && (

                            <>

                                <textarea placeholder="Remarks (Required for rejection)" value={remarks} onChange={(e)=>setRemarks(e.target.value)}/>

                                <div className="modal-buttons">

                                    <button className="approve-btn" onClick={approveRequest}>
                                        Approve
                                    </button>

                                    <button className="reject-btn" onClick={rejectRequest}>
                                        Reject
                                    </button>

                                </div>

                            </>

                        )

                    }

                    <button className="close-btn" onClick={onClose}>
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}

export default CorrectionDetailsModal;