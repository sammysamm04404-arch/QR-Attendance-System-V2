import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { MdAdminPanelSettings, MdPerson } from "react-icons/md";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

function EmployeeTable({ employees = [], onEdit, onDelete }) {
    const navigate = useNavigate();

    // Filter out Admin users so only standard employees are listed
    const regularEmployees = employees.filter((employee) => employee.role !== "Admin");

    return (
        <div className="employee-table">
            {regularEmployees.map((employee) => (
                <div 
                    className="employee-card" 
                    key={employee.id} 
                    onClick={() => navigate(`/employees/${employee.id}`)}
                >
                    <div className="employee-left">
                        <div className="employee-avatar">
                            {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3>{employee.name}</h3>
                            <p>{employee.email}</p>
                        </div>
                    </div>

                    <div className="employee-middle">
                        <span className="role-badge">
                            <MdPerson /> Employee
                        </span>

                        {employee.status === "Active" ? (
                            <span className="status-active">
                                <BsCheckCircleFill /> Active
                            </span>
                        ) : (
                            <span className="status-inactive">
                                <BsXCircleFill /> Inactive
                            </span>
                        )}
                    </div>

                    <div className="employee-actions">
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(employee); }}>
                            <FaEdit />
                        </button>
                        <button className="table-delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(employee); }}>
                            <FaTrashAlt />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default EmployeeTable;