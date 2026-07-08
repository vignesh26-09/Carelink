import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout, reset } from "../../store/slices/authSlice";

function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate("/");
    };

    return (
        <nav className="navbar">

            <Link to="/">CareLink</Link>

            {!user && (
                <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </>
            )}

            {user?.role === "PATIENT" && (
                <>
                    <Link to="/appointments">
                        My Appointments
                    </Link>

                    <Link to="/doctors">
                        Book Appointment
                    </Link>
                </>
            )}

            {user?.role === "DOCTOR" && (
                <>
                    <Link to="/schedule">
                        My Schedule
                    </Link>

                    <Link to="/consultations">
                        Consultations
                    </Link>
                </>
            )}

            {user?.role === "CLINIC_ADMIN" && (
                <>
                    <Link to="/doctors/manage">
                        Manage Doctors
                    </Link>

                    <Link to="/patients/manage">
                        Manage Patients
                    </Link>

                    <Link to="/appointments/all">
                        All Appointments
                    </Link>
                </>
            )}

            {user && (
                <button onClick={handleLogout}>
                    Logout
                </button>
            )}

        </nav>
    );
}

export default Navbar;