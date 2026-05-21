import StatCard from "@/components/shared/StateCard";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface RevenueTrend {
  month: string;
  revenue: number;
}

interface Category {
  name: string;
  percent: string;
}

interface ReportsData {
  monthlyRevenue: number;
  growthRate: string;
  newUsers: number;
  bookings: number;
  revenueTrend: RevenueTrend[];
  categories: Category[];
}

export default function Reports() {

  const [reports, setReports] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const maxRevenue = Math.max(
    ...(reports?.revenueTrend.map((d) => d.revenue) || [1])
  );
  const progressColors = [
    "bg-primary",
    "bg-accent",
    "bg-success",
    "bg-warning",
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {

    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/admin/reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReports(res.data.data);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">
          Loading reports...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Reports</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Revenue" value={`₹${Number(reports?.monthlyRevenue || 0).toLocaleString("en-IN")}`} icon={DollarSign} variant="default" />
        <StatCard title="Growth Rate" value={`+${reports?.growthRate || "0%"}`} icon={TrendingUp} variant="success" />
        <StatCard title="New Users" value={`${reports?.newUsers || 0}`} icon={Users} variant="warning" />
        <StatCard title="Bookings" value={`${reports?.bookings || 0}`} icon={BarChart3} variant="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-6 font-display text-lg font-semibold text-card-foreground">Revenue Trend</h3>
          <div className="flex items-end gap-3 h-48">
            {reports?.revenueTrend.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  ₹{(d.revenue / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full rounded-t-lg bg-primary/80 transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-6 font-display text-lg font-semibold text-card-foreground">Event Categories</h3>
          <div className="space-y-4">
            {reports?.categories.map((c, i) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="font-medium text-foreground">{c.percent}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted">
                  <div className={`h-2.5 rounded-full ${progressColors[i % progressColors.length]}`} style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
