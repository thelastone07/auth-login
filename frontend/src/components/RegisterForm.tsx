import React, {useState} from "react";
import { useAuth } from "./AuthContext";

export default function RegisterForm() {
    const {register} = useAuth();
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
            setSuccess("Registration successful! You can now log in.");
        }
        catch (err : any) {
            setErrors([err.message || "registration failed."]);
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <input
            type = "text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
            />
            <input
            type = "email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            />
            <input
            type = "password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            />
            <button type="submit">Register</button>
            {errors.length > 0 && (
                <ul>
                    {errors.map((err,i)=>(
                        <li key={i}>{err}</li>
                    ))}
                </ul>
            )}

            {success && <p>{success}</p>}
        </form>
    );
}