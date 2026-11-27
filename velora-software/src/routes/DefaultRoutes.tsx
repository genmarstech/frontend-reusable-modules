import { Navigate, Route, Routes } from "react-router"
import Home from "../pages/Home"
import Login from "../pages/Login"
import Register from "../pages/Register"
import BusinessOnboarding from "../pages/BusinessOnboarding"
import ProtectedRoute from "../components/ProtectedRoutes"
import BusinessSelection from "../pages/BusinessSelection"
import DashboardOverview from "../pages/DashboardOverview"
import DashboardLayout from "../pages/dashboard/DashboardLayout"
import BookingsPage from "../pages/dashboard/BookingsPage"
import CustomersPage from "../pages/dashboard/CustomersPage"
import ServicesPage from "../pages/dashboard/ServicesPage"
import TeamPage from "../pages/dashboard/TeamPage"
import SchedulePage from "../pages/dashboard/SchedulePage"
import NotificationsPage from "../pages/dashboard/NotificationsPage"
import AnalyticsPage from "../pages/dashboard/AnalyticsPage"
import SettingsPage from "../pages/dashboard/SettingsPage"
import BookingPage from "../pages/public/BookingPage"
import ManageBooking from "../pages/public/ManageBooking"
import NotFound from "../pages/NotFound"

function DefaultRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer-facing, no account needed */}
      <Route path="/book/:businessId" element={<BookingPage />} />
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
