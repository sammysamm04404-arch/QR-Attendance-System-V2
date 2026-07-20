import { FaSearch } from "react-icons/fa";

function EmployeeSearch({

    search,
    setSearch

}){

    return(

        <div className="employee-search-container">

            <div className="search-box">

                <FaSearch className="search-icon"/>

                <input
                    type="text"
                    placeholder="Search employee by name or email..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

            </div>

        </div>

    );

}

export default EmployeeSearch;