import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginOrRegister from "./components/LoginOrRegister";

// Hello World Page
function HelloWorld() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  console.log("HelloWorld rendering, user:", user);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSecretClick = () => {
    if (user) {
      navigate('/secret');
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      <h1>Hello World</h1>
      {user ? (
        <div>
          <p>Welcome, <b>{user.username}</b></p>
          <button onClick={logout}>Logout</button>
          <br /><br />
          <button onClick={handleSecretClick}>Secret</button>
        </div>
      ) : (
        <div>
          <button onClick={handleLoginClick}>Login</button>
          <br /><br />
          <button onClick={handleSecretClick}>Secret</button>
        </div>
      )}
    </div>
  );
}

// Protected Secret Page
function SecretPage() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>🔐 Secret Page</h1>
      <p>This is the secret content that only logged-in users can see!</p>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

function App() {
  console.log("App component rendering");
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HelloWorld />} />
          
          {/* Login */}
          <Route path="/login" element={<LoginOrRegister />} />

          {/* Protected */}
          <Route
            path="/secret"
            element={
              <ProtectedRoute>
                <SecretPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

