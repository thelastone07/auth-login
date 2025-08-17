import {Navigate} from "react-router-dom";
import {useAuth} from "./AuthContext";
import React from "react";

type ProtectedRouteProps = {
    children : React.JSX.Element;
};

export default function ProtectedRoute({children}:ProtectedRouteProps) {
    const {user, token} = useAuth();

    if (!token || !user) {
        return <Navigate to="/login" replace/>;
    }
    return children;
}