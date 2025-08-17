import React, {useState} from "react";
import { useAuth } from "./AuthContext";

export default function RegisterForm() {
    const {register} = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleRegister(e : React.FormEvent) {
        e.preventDefault();
        try {
            await register(username, email, password);
        }
        catch (err : any) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleRegister}>
            <input
            type = "text"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            />
            <input
            type = "email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
            <input
            type = "password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            />
            <button type="submit">Register</button>
            {error && <p style={{color : "red"}}>{error}</p>}
        </form>
    );
}