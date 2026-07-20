import api from "../../services/api";
import { toast } from "react-hot-toast";

function DeleteEmployeeModal({
    open,
    employee,
    onClose,
    onSuccess
}){

    if(!open) return null;

    const handleDelete = async()=>{

        try{

            await api.delete(
                `/admin/employees/${employee.id}`
            );

            toast.success("Employee deleted successfully.");

            onSuccess();
            onClose();
        }

        catch(error){
            toast.error(
                error.response?.data?.detail ||
                "Delete failed."
            );
        }
    };

    return(

        <div className="modal-overlay">

            <div className="delete-modal">

                <h2>
                    Delete Employee
                </h2>

                <p>
                    Are you sure you want to delete
                    <strong>
                        {" "}{employee.name}
                    </strong>
                    ?
                </p>

                <div className="delete-buttons">

                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>

                    <button className="delete-btn" onClick={handleDelete}>
                        Delete
                    </button>

                </div>

            </div>

        </div>

    );

}

export default DeleteEmployeeModal;