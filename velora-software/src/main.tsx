import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
// Page styles share some class names, so load them all up front in a fixed order.
// Pages are code-split, but this keeps the cascade the same on every page.
import "./pages/Home.css";
import "./pages/marketing/marketing.css";
import "./pages/marketing/marketing-refresh.css";
import "./pages/Login.css";
import "./pages/Register.css";
import "./pages/BusinessOnboarding.css";
import "./pages/BusinessSelection.css";
import "./pages/DashboardOverview.css";
import "./styles/dashboard.css";
import "./styles/dashboard-refresh.css";
import "./styles/booking.css";
import "./styles/auth-refresh.css";
import "./styles/brand.css";
import "./styles/responsive.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import DefaultRoutes from "./routes/DefaultRoutes";
import { PageLoading } from "./components/ui";
import { RouteErrorBoundary } from "./components/ErrorBoundary";
import ScrollManager from "./components/ScrollManager";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <ScrollManager />
            <AuthProvider>
                <RouteErrorBoundary>
                    <Suspense fallback={<PageLoading />}>
                        <DefaultRoutes />
                    </Suspense>
                </RouteErrorBoundary>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
