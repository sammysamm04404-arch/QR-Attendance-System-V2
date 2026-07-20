import { FaUserFriends } from "react-icons/fa";

function EmployeeHeader({
    onAddEmployee
})  
    {

    return (

        <div className="employee-header">

            <div>

                <h1>
                    <FaUserFriends className="header-icon" />
                    Employee Management
                </h1>

                <p>
                    Manage all employees, roles and account status from one place.
                </p>

            </div>

            <button className="add-employee-btn" onClick={onAddEmployee}>
                + Add Employee
            </button>

        </div>

    );

}

export default EmployeeHeader;