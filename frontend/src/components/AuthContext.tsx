import {createContext, useContext, useState, useEffect} from "react";
import type { ReactNode } from "react";

interface User {
    id : string;
    username : string;
    email : string;
}

interface AuthContextType {
    user : User | null;
    token : string | null;
    login : (user : User, token : string) => void;
    register : (username : string, email : string, password: string) => Promise<void>;
    logout : ()=> void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : {children : ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(()=> {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (user : User, token : string) => {
        setUser(user);
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItme("user", JSON.stringify(user));
    };

    const register = async (username : string, email : string, password : string) => {
        const res = await fetch("http://localhost:5000/auth/register", {
            method : "POST",
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({username, email, password}),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Registration Failed");
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };
    return (
        <AuthContext.Provider value = {{user, token, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}