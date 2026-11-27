import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/auth-context";
import { PageLoading } from "./ui";

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <PageLoading label="Checking your session..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
