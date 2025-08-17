import { useAuth } from "./AuthContext";

function LoginForm() {
    const {login} = useAuth();

    async function handleLogin(e : React.FormEvent) {
        e.preventDefault();
        const res = await fetch("http://localhost:5000/auth/login", {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({username : "John_doe", password:"strongpass1"}),
        });

        const data = await res.json();
        if (res.ok) {
            login(data.user, data.token);
        } else {
            alert(data.error);
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username"></input>
            <input type="password" placeholder="Password"></input>
            <button type = "submit">Login</button>
        </form>
    );
}

export default LoginForm;