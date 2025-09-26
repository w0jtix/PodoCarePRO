import { useLocation, Navigate, Outlet } from "react-router-dom";
import AuthService from "../services/AuthService";
import { FunctionComponent } from "react";



function RequireAuth({ children }: { children: JSX.Element }) {
    const location = useLocation();
    const user = AuthService.getCurrentUser();
    if(!user || !user.token) {
        return <Navigate to="/login" state={{ fromt: location }} replace/>;
    }
    return children;
}

export const Main: FunctionComponent = () => {
    return (
        <RequireAuth>
            <Outlet />
        </RequireAuth>
    )
}