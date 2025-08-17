import {createContext, useContext, useState, useEffect} from "react";
import type { ReactNode } from "react";
import * as authService from "./authService";


type User = {
    id : string;
    username : string;
    email : string;
};

type AuthContextType = {
    user : User | null;
    token : string | null;
    login : (email : string, password : string) => Promise<void>;
    register : (username : string, email : string, password: string) => Promise<void>;
    logout : ()=> void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : {children : ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    const decodeToken = (jwt : string) => {
        try {
            const payload = JSON.parse(atob(jwt.split(".")[1]));
            return payload;
        } catch {
            return null;
        }
    };

    const scheduleAutoLogout = (jwt : string) => {
        const payload = decodeToken(jwt);
        if (!payload?.exp) return;

        const expiryTime = payload.exp * 1000;
        const now = Date.now();

        if (expiryTime <= now) {
            logout();
            return;
        }

        const timeout = expiryTime - now;
        setTimeout(()=> {
            logout();
        },timeout);
    };

    useEffect(()=> {
       if (token) {
        const payload = decodeToken(token);
        if (!payload?.exp || payload.exp * 1000 < Date.now()) {
            logout();
            return;
        }
    
        authService
        .getProfile(token)
        .then((data) => setUser(data))
        .catch(()=> {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
        });

        scheduleAutoLogout(token);
       }
    }, [token]);

    const login = async (email : string, password : string) => {
        const data = await authService.login(email, password)
        setUser(user);
        setToken(data.token);
        localStorage.setItem("token",data.token);
        localStorage.setItme("user", JSON.stringify(user));
    };

    const register = async (username : string, email : string, password : string) => {
        await authService.register(username, email, password);
    }

    const logout = async () => {
        if (!token) return;
        await authService.logout(token);
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