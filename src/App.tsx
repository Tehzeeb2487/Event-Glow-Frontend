import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import ScrollToTop from "./components/ScrollToTop";
import PublicLayout from "./components/layout/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import PublicVendors from "./pages/PublicVendors";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import WebsiteProfile from "./pages/WebsiteProfile";
import Dashboard from "./pages/Dashboard";
import BudgetOptimization from "./pages/BudgetOptimization";
import CreateEvent from "./pages/CreateEvent";
import Expenses from "./pages/Expenses";
import Vendors from "./pages/Vendors";
import Profile from "./pages/Profile";
import MyBookings from "./pages/MyBookings";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

// Vendor Dashboard
import VendorLayout from "./dashboards/vendor/layout/VendorLayout";
import VendorDashboard from "./dashboards/vendor/pages/VendorDashboard";
import MyServices from "./dashboards/vendor/pages/MyServices";
import Bookings from "./dashboards/vendor/pages/Bookings";
import Earnings from "./dashboards/vendor/pages/Earnings";
import VendorProfile from "./dashboards/vendor/pages/VendorProfile";
import AdminProfile from "./dashboards/admin/pages/AdminProfile";
import ProfileSetup from "./dashboards/vendor/pages/ProfileSetup";

// Admin Dashboard
import AdminLayout from "./dashboards/admin/layout/AdminLayout";
import AdminDashboard from "./dashboards/admin/pages/AdminDashboard";
import ManageUsers from "./dashboards/admin/pages/ManageUsers";
import ManageVendors from "./dashboards/admin/pages/ManageVendors";
import ManageEvents from "./dashboards/admin/pages/ManageEvents";
import Reports from "./dashboards/admin/pages/Reports";
import WebsiteContent from "./dashboards/admin/pages/WebsiteContent";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
    <TooltipProvider>
      <Sonner position="top-center" />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/vendors" element={<PublicVendors />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<WebsiteProfile />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Customer Dashboard */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/create-event" element={<CreateEvent />} />
              <Route path="/dashboard/budget-optimization" element={<BudgetOptimization />} />
              <Route path="/dashboard/expenses" element={<Expenses />} />
              <Route path="/dashboard/vendors" element={<Vendors />} />
              <Route path="/dashboard/my-bookings" element={<MyBookings />} />
              <Route path="/dashboard/checkout/:bookingId" element={<Checkout />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>

            {/* Vendor Dashboard */}
            <Route element={<VendorLayout />}>
              <Route path="/vendor" element={<VendorDashboard />} />
              <Route path="/vendor/services" element={<MyServices />} />
              <Route path="/vendor/bookings" element={<Bookings />} />
              <Route path="/vendor/earnings" element={<Earnings />} />
              <Route path="/vendor/profile" element={<VendorProfile />} />
              <Route path="/vendor/profile-setup" element={<ProfileSetup />} />
            </Route>

            {/* Admin Dashboard */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/vendors" element={<ManageVendors />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/content" element={<WebsiteContent />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
    </TooltipProvider>
      </AppProvider>
  </QueryClientProvider>
);

export default App;
