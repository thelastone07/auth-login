import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginOrRegister from "./components/LoginOrRegister";
import AnimatedHelloWorld from "./components/AnimatedHelloWorld";
import HelloWorld from "./components/HelloWorld";
import "./css/App.css";


function AnimatedHelloWorldPage() {
  const navigate = useNavigate();

  return (
    <div className="animated-page-container">
      <AnimatedHelloWorld />
      <div className="back-button-overlay">
        <button className="btn btn-overlay" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

// Home Page with user logic
function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSecretClick = () => {
    if (user) {
      navigate("/secret");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="page-container">
      <HelloWorld /> 

      {user ? (
        <div>
          <p className="welcome-message">
            Welcome, <b>{user.username}</b>
          </p>
          <div className="button-container">
            <button className="btn" onClick={logout}>Logout</button>
            <button className="btn" onClick={handleSecretClick}>Animation</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="welcome-message">
            Welcome, <b>Guest</b>
          </p>
          <div className="button-container">
            <button className="btn" onClick={handleLoginClick}>Login</button>
            <button className="btn" onClick={handleSecretClick}>Animation</button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  console.log("App component rendering");

  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />

            {/* Login */}
            <Route path="/login" element={<LoginOrRegister />} />

            {/* Protected */}
            <Route
              path="/secret"
              element={
                <ProtectedRoute>
                  <AnimatedHelloWorldPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
