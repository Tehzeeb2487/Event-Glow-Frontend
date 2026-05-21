import { Navigate, Outlet, Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import DashboardSidebar from "./DashboardSidebar";
import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/" replace />;
  // Note: events check removed — Dashboard.tsx renders an empty state with a Create Event CTA

  return (
    <div className="h-screen overflow-hidden bg-background">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} collapsed={sidebarCollapsed} />
      <div className={`flex h-full flex-col transition-[padding-left] duration-300 ${sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <header className="flex h-16 shrink-0 items-center border-b bg-card/80 px-4 backdrop-blur-lg lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="mr-4 rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" aria-label="Open sidebar">
            <Menu className="h-5 w-5" />
          </button>
          <button onClick={() => setSidebarCollapsed((c) => !c)} className="mr-4 hidden rounded-lg p-2 text-muted-foreground hover:bg-muted lg:flex" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <h2 className="font-display text-lg font-semibold text-foreground">Dashboard</h2>
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
