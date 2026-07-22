import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBackspace, FaReact } from "react-icons/fa";

import Navbar from "../components/Navbar";
import api from "../services/api";

import EmployeeProfileCard from "../components/EmployeeDetails/EmployeeProfileCard";
import EmployeeTodayCard from "../components/EmployeeDetails/EmployeeTodayCard";
import EmployeeSummaryCard from "../components/EmployeeDetails/EmployeeSummaryCard";
import EmployeeHistoryTable from "../components/EmployeeDetails/EmployeeHistoryTable";
import Loader from "../components/Loader/Loader";

import "../styles/pages/EmployeeDetails.css";

function EmployeeDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [employeeData,setEmployeeData]=useState(null);

    useEffect(()=>{

        fetchEmployee();

    },[id]);

    const fetchEmployee=async()=>{

        try{
            const response=await api.get(`/admin/employees/${id}`);
            setEmployeeData(response.data);
        }

        catch(error){
            console.log(error);
        }

    };

    if(!employeeData){

        return <Loader />

    }

    return(

        <>

            <Navbar/>

            <div className="employee-details-page">

                <button className="back-btn" onClick={()=>navigate("/employees")}>
                    Back
                </button>

                <EmployeeProfileCard
                    employee={employeeData.employee}
                />

                <div className="details-grid">

                    <EmployeeTodayCard
                        today={employeeData.today}
                    />

                    <EmployeeSummaryCard
                        summary={employeeData.summary}
                    />

                </div>

                <EmployeeHistoryTable
                    history={employeeData.history}
                />

            </div>

        </>

    );

}

export default EmployeeDetails;