import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [success, setSuccess] = useState("");
    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            await login(username, password);
            setSuccess("Successful");
            // Redirect to home page after successful login
            setTimeout(() => {
                navigate('/');
            }, 1000);
        }
        catch (err : any) {
            setSuccess(err.error || "Invalid credentials")
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Login</button>
            {success && <p>{success}</p>}
        </form>
    );
}

export default LoginForm;
