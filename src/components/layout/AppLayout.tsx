import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import Navbar from "./Navbar";

export default function AppLayout() {
  const { isAuthenticated, loading } = useApp();
  const location = useLocation();

  const isProtectedRoute = 
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/vendor") || 
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/vendor/profile-setup");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && isProtectedRoute) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
