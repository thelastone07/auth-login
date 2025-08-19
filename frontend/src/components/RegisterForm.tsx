import React, {useState} from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/RegisterForm.css";

export default function RegisterForm() {
    const {register, login} = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [success, setSuccess] = useState<string | null>(null);

    function validateForm() {
        const newErrors : string[] = [];
        if (!username || username.length <3)
            newErrors.push("Username must be at least 3 characters.");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        newErrors.push("Invalid email format.");
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
        newErrors.push(
            "Password must be at least 8 characters, contain 1 uppercase letter and 1 number."
            );
        }
        setErrors(newErrors);
        return newErrors.length === 0;
    }

    async function handleRegister(e : React.FormEvent) {
        e.preventDefault();
        setErrors([]);
        setSuccess(null);
        if (!validateForm()) return;

        try {
            await register(username, email, password);
            await login(username, password);
            setSuccess("Successfully logged in.");
            // Redirect to home page after successful registration and login
            setTimeout(() => {
                navigate('/');
            }, 1000);
        }
        catch (err : any) {
            setErrors([err.error || "registration failed."]);
        }
    }

    return (
        <div className="register-form-container">
            <form className="register-form" onSubmit={handleRegister}>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        className="form-input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="submit-btn" type="submit">Register</button>
                {errors.length > 0 && (
                    <ul className="error-list">
                        {errors.map((err,i)=>(
                            <li key={i} className="error-item">{err}</li>
                        ))}
                    </ul>
                )}

                {success && <p className="success-message">{success}</p>}
            </form>
        </div>
    );
}