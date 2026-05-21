import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Store, CalendarCheck, BarChart3, LogOut, Shield, User as UserIcon, FileText,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { confirmToast } from "@/lib/confirmToast";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Manage Users", icon: Users },
  { to: "/admin/vendors", label: "Manage Vendors", icon: Store },
  { to: "/admin/events", label: "Manage Events", icon: CalendarCheck },
  { to: "/admin/content", label: "Website Content", icon: FileText },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
];

export default function AdminSidebar({
  open,
  onClose,
  collapsed = false,
}: {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useApp();

  const handleLogout = () => {
    confirmToast({
      message: "Logout?",
      description: "Are you sure you want to log out of the Admin panel?",
      confirmLabel: "Logout",
      variant: "destructive",
      onConfirm: async () => {

        const token = localStorage.getItem("token");

        try {
          await fetch("https://eventglow-backend.onrender.com/api/auth/logout",{
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.log("Logout API error", err);
        }
        navigate("/", { replace: true });
        logout();
      },
    });
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r bg-card/95 backdrop-blur-lg transition-all duration-300 lg:translate-x-0 ${
          collapsed ? "lg:w-16" : "lg:w-64"
        } ${open ? "translate-x-0 w-64" : "-translate-x-full w-64"}`}
      >
        <Link to="/admin" onClick={onClose} className="flex h-16 items-center gap-2 border-b px-5 hover:bg-muted/50 transition-colors">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(260,70%,55%)] to-[hsl(290,65%,50%)] text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-foreground">Admin Panel</span>
          )}
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t bg-card/95 p-4 space-y-3">
          {!collapsed && user && (
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || "U"
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}
