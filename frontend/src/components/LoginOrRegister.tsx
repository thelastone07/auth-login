import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import "../css/LoginOrRegister.css";

function LoginOrRegister() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="auth-container">
      {showRegister ? (
        <>
          <RegisterForm />
          <div className="toggle-container">
            <p className="toggle-text">
              Already have an account?{" "}
              <button className="toggle-btn" onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </div>
        </>
      ) : (
        <>
          <LoginForm />
          <div className="toggle-container">
            <p className="toggle-text">
              Don't have an account?{" "}
              <button className="toggle-btn" onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default LoginOrRegister;
