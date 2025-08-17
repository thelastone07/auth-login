import { AuthProvider } from "./components/AuthContext";

function App() {
  return (
    <AuthProvider>
      <html>hello</html>
    </AuthProvider>
  );
}

export default App;