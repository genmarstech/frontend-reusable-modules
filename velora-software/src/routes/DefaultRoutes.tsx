import { lazy } from "react"
import { Navigate, Route, Routes } from "react-router"
import ProtectedRoute from "../components/ProtectedRoutes"

// Each page loads on demand, so the landing and booking pages stay light.
const MarketingLayout = lazy(() => import("../pages/marketing/MarketingLayout"))
const Home = lazy(() => import("../pages/marketing/Home"))
const Features = lazy(() => import("../pages/marketing/Features"))
const Solutions = lazy(() => import("../pages/marketing/Solutions"))
const HowItWorks = lazy(() => import("../pages/marketing/HowItWorks"))
const About = lazy(() => import("../pages/marketing/About"))
const Terms = lazy(() => import("../pages/marketing/Legal").then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import("../pages/marketing/Legal").then((m) => ({ default: m.Privacy })))
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
const PaymentsPage = lazy(() => import("../pages/dashboard/PaymentsPage"))
const SettingsPage = lazy(() => import("../pages/dashboard/SettingsPage"))
const BookingPage = lazy(() => import("../pages/public/BookingPage"))
const ManageBooking = lazy(() => import("../pages/public/ManageBooking"))
const NotFound = lazy(() => import("../pages/NotFound"))

function DefaultRoutes() {
  return (
    <Routes>
      {/* Public site: each part has its own page */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
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
          <Route path="payments" element={<PaymentsPage />} />
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
