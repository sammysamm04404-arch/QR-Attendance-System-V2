import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function AddEmployeeModal({

    open,
    onClose,
    onSuccess

}) {

    const [form, setForm] = useState({

        name: "",
        email: "",
        password: "",
        status: "Active"

    });

    const handleChange = (e) => {

        setForm({

            ...form,
            [e.target.name]: e.target.value

        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await api.post(
                "/admin/employees",
                form
            );

            onSuccess();
            toast.success("Employee created successfully!");
            onClose();

            setForm({

                name: "",
                email: "",
                password: "",
                status: "Active"

            });

        }

        catch (error) {

            /*alert(
                error.response?.data?.detail ||
                "Failed to create employee."
            );*/
            toast.error(error.response?.data?.detail || "Failed to create employee.")

        }

    };

    if (!open) return null;

    return (

        <div className="modal-overlay">

            <div className="modal-card">

                <h2>
                    Add Employee
                </h2>

                <form onSubmit={handleSubmit}>

                    <label>
                        Full Name *
                    </label>

                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Email *
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Password *
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <label>
                        Status *
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >

                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>

                    </select>

                    <div className="modal-buttons">

                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>

                        <button type="submit" className="save-btn">
                            Save Employee
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddEmployeeModal;