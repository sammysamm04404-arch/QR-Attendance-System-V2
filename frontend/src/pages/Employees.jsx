import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../services/api";

import EmployeeHeader from "../components/Employee/EmployeeHeader";
import EmployeeSearch from "../components/Employee/EmployeeSearch";
import EmployeeTable from "../components/Employee/EmployeeTable";
import EmployeePagination from "../components/Employee/EmployeePagination";
import AddEmployeeModal from "../components/Employee/EmployeeModal";
import EditEmployeeModal from "../components/Employee/EditEmployeeModal";
import DeleteEmployeeModal from "../components/Employee/DeleteEmployeeModal";
import Loader from "../components/Loader/Loader";

import "../styles/pages/Employee.css";

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteEmployee, setDeleteEmployee] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        fetchEmployees();
    }, [page]);

    const fetchEmployees = async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }
        try {
            const response = await api.get(`/admin/employees?page=${page}&limit=10`);
            setEmployees(response.data.employees);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false); // Stop loader after fetch finishes
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.email.toLowerCase().includes(search.toLowerCase())
    );

    // Render Full Page Loader until data is ready
    if (loading) {
        return (
            <div>
                <Navbar />
                <Loader />
            </div>
        );
    }

    return (
        <div>
            <Navbar />

            <div className="employees-page">
                <EmployeeHeader
                    onAddEmployee={() => setShowModal(true)}
                />

                <EmployeeSearch
                    search={search}
                    setSearch={setSearch}
                />

                <EmployeeTable
                    employees={filteredEmployees}
                    onEdit={(employee) => {
                        setSelectedEmployee(employee);
                        setEditOpen(true);
                    }}
                    onDelete={(employee) => {
                        setDeleteEmployee(employee);
                        setDeleteOpen(true);
                    }}
                />

                <AddEmployeeModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => fetchEmployees(false)}
                />

                <EditEmployeeModal
                    open={editOpen}
                    employee={selectedEmployee}
                    onClose={() => setEditOpen(false)}
                    onSuccess={() => fetchEmployees(false)}
                />

                <DeleteEmployeeModal
                    open={deleteOpen}
                    employee={deleteEmployee}
                    onClose={() => setDeleteOpen(false)}
                    onSuccess={() => fetchEmployees(false)}
                />

                <EmployeePagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />
            </div>
        </div>
    );
}

export default Employees;