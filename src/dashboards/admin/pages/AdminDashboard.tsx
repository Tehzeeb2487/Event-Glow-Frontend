import StatCard from "@/components/shared/StateCard";
import { Users, Store, CalendarCheck, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";


interface RecentRegistration {
  name: string;
  role: string;
  date: string;
}

interface PlatformStats {
  userGrowth: string;
  vendorRetention: string;
  bookingRate: string;
  satisfaction: number;
}

interface DashboardData {
  totalUsers: number;
  activeVendors: number;
  eventsThisMonth: number;
  totalRevenue: number;
  recentRegistrations: RecentRegistration[];
  platformStats: PlatformStats;
}

export default function AdminDashboard() {
  const [dashboard, setDachboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/admin/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setDachboard(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Admin Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={`${dashboard?.totalUsers || 0}`} icon={Users} variant="default" />
        <StatCard title="Active Vendors" value={`${dashboard?.activeVendors || 0}`} icon={Store} variant="success" />
        <StatCard title="Events This Month" value={`${dashboard?.eventsThisMonth || 0}`} icon={CalendarCheck} variant="warning" />
        <StatCard title="Revenue" value={`₹${Number(dashboard?.totalRevenue || 0).toLocaleString("en-IN")}`} icon={DollarSign} variant="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">Recent Registrations</h3>
          <div className="space-y-3">
            {dashboard?.recentRegistrations.map((r, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-CA")}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  r.role === "Vendor" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                }`}>
                  {r.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">Platform Stats</h3>
          <div className="space-y-4">
            {[
              {
                label: "User Growth",
                value: Number(dashboard?.platformStats?.userGrowth || 0),
              },
              {
                label: "Vendor Retention",
                value: Number(dashboard?.platformStats?.vendorRetention || 0),
              },
              {
                label: "Booking Rate",
                value: Number(dashboard?.platformStats?.bookingRate || 0),
              },
              {
                label: "Satisfaction",
                value: Number(dashboard?.platformStats?.satisfaction || 0),
              },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${s.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
