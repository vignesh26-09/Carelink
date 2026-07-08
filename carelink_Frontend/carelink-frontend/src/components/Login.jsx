import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { login, reset } from "../store/slices/authSlice";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
            login({
                email,
                password,
            })
        );
    };

    return (
        <div className="login-container">

            <h2>Login</h2>

            <form onSubmit={handleSubmit}>

                <div>

                    <label htmlFor="email">
                        Email :
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) =>
                            setEmail(e.target.value)
                        }
                        required
                    />

                </div>

                <div>

                    <label htmlFor="password">
                        Password :
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading
                        ? "Logging in..."
                        : "Login"}
                </button>

            </form>

        </div>
    );
}

export default Login;