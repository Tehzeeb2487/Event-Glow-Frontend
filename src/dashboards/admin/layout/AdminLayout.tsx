import { useState } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { Menu, PanelLeftClose, PanelLeft, ExternalLink } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import AdminSidebar from "./AdminSidebar";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, user, loading } = useApp();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} />

      <div className={`flex flex-1 flex-col transition-[padding-left] duration-300 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur-lg lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted lg:flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Admin Dashboard</h1>
          <div className="ml-auto">
            <Button asChild variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary hover:border-primary/40">
              <Link to="/">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Go to Website</span>
                <span className="sm:hidden">Website</span>
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
