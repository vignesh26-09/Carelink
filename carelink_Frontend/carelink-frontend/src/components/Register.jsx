import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { register, reset } from "../store/slices/authSlice";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        user,
        isLoading,
        isSuccess,
        isError,
        message,
    } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isError) {
            alert(message);
        }

        if (isSuccess || user) {
            navigate("/");
        }

        dispatch(reset());
    }, [
        isError,
        isSuccess,
        user,
        message,
        dispatch,
        navigate,
    ]);

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(
            register({
                email,
                password,
                fullName,
                bloodGroup,
                emergencyContact,
            })
        );
    };

    return (
        <div className="register-container">
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="email">Email *</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="patient@carelink.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">Password *</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Choose a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="bloodGroup">Blood Group *</label>
                    <input
                        id="bloodGroup"
                        type="text"
                        placeholder="e.g. O+"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="emergencyContact">Emergency Contact *</label>
                    <input
                        id="emergencyContact"
                        type="text"
                        placeholder="1234567890"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">
                    {isLoading ? "Registering..." : "Register"}
                </button>

            </form>
        </div>
    );
}

export default Register;