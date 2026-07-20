import { useEffect, useState } from "react";
import { toast } from "react-hot-toast"
import api from "../../services/api";

function EditEmployeeModal({
    open,
    employee,
    onClose,
    onSuccess
}){

    const [form,setForm]=useState({

        name:"",
        email:"",
        status:"Active"

    });

    useEffect(()=>{

        if(employee){

            setForm({

                name:employee.name,
                email:employee.email,
                status:employee.status

            });

        }

    },[employee]);

    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:e.target.value

        });

    };

    const handleSubmit=async(e)=>{

        e.preventDefault();

        try{

            await api.put(
                `/admin/employees/${employee.id}`,
                form
            );
            onSuccess();
            onClose();
            toast.success("Employee updated sucessfully!");

        }

        catch(error){

            /*alert(

                error.response?.data?.detail ||

                "Update Failed"

            );*/
            toast.error(error.response?.data?.detail || "Update Failed");

        }

    };

    if(!open) return null;

    return(

        <div className="modal-overlay">

            <div className="modal-card">

                <h2>
                    Edit Employee
                </h2>

                <form onSubmit={handleSubmit}>

                    <label>
                        Full Name
                    </label>

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <label>
                        Email
                    </label>

                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <label>
                        Status
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >

                        <option>
                            Active
                        </option>

                        <option>
                            Inactive
                        </option>

                    </select>

                    <div className="modal-buttons">

                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>

                        <button className="save-btn">
                            Update Employee
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditEmployeeModal;