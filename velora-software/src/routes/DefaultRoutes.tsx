import { lazy } from "react"
import { Navigate, Route, Routes } from "react-router"
import ProtectedRoute from "../components/ProtectedRoutes"

// Each page loads on demand, so the landing and booking pages stay light.
const Home = lazy(() => import("../pages/Home"))
const Login = lazy(() => import("../pages/Login"))
const Register = lazy(() => import("../pages/Register"))
const BusinessOnboarding = lazy(() => import("../pages/BusinessOnboarding"))
const BusinessSelection = lazy(() => import("../pages/BusinessSelection"))
const DashboardOverview = lazy(() => import("../pages/DashboardOverview"))
const DashboardLayout = lazy(() => import("../pages/dashboard/DashboardLayout"))
const BookingsPage = lazy(() => import("../pages/dashboard/BookingsPage"))
const CustomersPage = lazy(() => import("../pages/dashboard/CustomersPage"))
const ServicesPage = lazy(() => import("../pages/dashboard/ServicesPage"))
const TeamPage = lazy(() => import("../pages/dashboard/TeamPage"))
const SchedulePage = lazy(() => import("../pages/dashboard/SchedulePage"))
const NotificationsPage = lazy(() => import("../pages/dashboard/NotificationsPage"))
const AnalyticsPage = lazy(() => import("../pages/dashboard/AnalyticsPage"))
const SettingsPage = lazy(() => import("../pages/dashboard/SettingsPage"))
const BookingPage = lazy(() => import("../pages/public/BookingPage"))
const ManageBooking = lazy(() => import("../pages/public/ManageBooking"))
const NotFound = lazy(() => import("../pages/NotFound"))

function DefaultRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer-facing, no account needed */}
      <Route path="/book/:businessRef" element={<BookingPage />} />
      <Route path="/manage/:token" element={<ManageBooking />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding/business" element={<BusinessOnboarding />} />
        <Route path="/businesses" element={<BusinessSelection />} />

        <Route path="/dashboard/:businessId" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default DefaultRoutes
