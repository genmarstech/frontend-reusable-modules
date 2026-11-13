import { Route, Routes } from "react-router"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import BusinessOnboarding from "../pages/BusinessOnboarding"
import ProtectedRoute from "../components/ProtectedRoutes"
import BusinessSelection from "../pages/BusinessSelection"
import DashboardOverview from "../pages/DashboardOverview"

function DefaultRoutes() {
  return (
    <>
        <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/login" element={<Login /> }/>
            <Route path="/register" element={<Register /> }/>
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/onboarding/business"
                    element={<BusinessOnboarding />}
                />

                <Route path="/businesses" element={<BusinessSelection />}/>

                <Route path="/dashboard/:businessId/overview" element={<DashboardOverview />}/>

            </Route>
        </Routes>
    </>
  )
}

export default DefaultRoutes