import "./Loader.css";
import logo from "../../../public/sinley_solution.png"; 

function Loader() {
    return (
        <div className="loader-overlay">

            <div className="loader-container">

                <div className="loader-ring"></div>

                <div className="loader-logo">
                    <img src={logo} alt="Logo" />
                </div>

            </div>

        </div>
    );
}

export default Loader;