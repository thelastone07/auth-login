import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import "../css/LoginForm.css";

function LoginForm() {
    const { login, googleLogin } = useAuth();
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

    async function handleGoogleLogin(credential: string) {
        try {
            await googleLogin(credential);
            setSuccess("Google login successful");
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err: any) {
            setSuccess(err.error || "Google login failed");
        }
    }


    return (
        <div className="login-form-container">
        <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
                <input
                    className="form-input"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <input
                    className="form-input"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button className="submit-btn" type="submit">Login</button>
            {success && <p className={success.includes("failed") ? "error-message" : "success-message"}>{success}</p>}
        </form>
        <div className="google-login-section">
            <div className="google-login-container">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      handleGoogleLogin(credentialResponse.credential);
                    }
                  }}
                  onError={() => setSuccess("Google login failed")}
                />
            </div>
        </div>
      </div>
        
    );
}

export default LoginForm;
