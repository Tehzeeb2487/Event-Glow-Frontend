import StatCard from "@/components/shared/StateCard";
import { Briefcase, CalendarCheck, DollarSign, Star } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

interface PerformanceItem {
  month: string;
  performance: number;
}

interface Bookings {
  event: string;
  client: string;
  date: string;
  status: string;
}

export default function VendorDashboard() {
  const [data, setData] = useState({
    activeServices: 0,
    totalBookings: 0,
    earnings: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceItem[]>([]);
  const [bookings, setBookings] = useState<Bookings[]>([]);

  const fetchRecentBookings = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "https://eventglow-backend.onrender.com/api/vendors/recent-bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setBookings(res.data);
  }

  useEffect(() => {
    fetchRecentBookings();
  }, [])

  const fetchPerformance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/vendors/performance",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPerformanceData(res.data);
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchPerformance();
  }, []);

  const formattedPerformance = performanceData.map(item => ({
    label: item.month,
    value: item.performance,
  }))

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/vendors/dashboard/overview",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setData(res.data);
    } catch(error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Services" value={`${data.activeServices}`} icon={Briefcase} variant="default" />
        <StatCard title="Total Bookings" value={`${data.totalBookings}`} icon={CalendarCheck} variant="success" />
        <StatCard title="Earnings" value={`₹${data.earnings}`} icon={DollarSign} variant="warning" />
        <StatCard title="Avg Rating" value={`${data.avgRating}`} icon={Star} variant="accent" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent bookings */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">Recent Bookings</h3>
          <div className="space-y-3">
            {bookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bookings right now</p>
              ) : (bookings.map((b, i) => {
                const status = b.status.toLowerCase();
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.client}</p>
                      <p className="text-xs text-muted-foreground">{b.event} · {new Date(b.date).toLocaleDateString("en-CA") }</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      status === "confirmed" 
                        ? "bg-success/10 text-success"
                        : status === "cancelled"
                        ? "bg-destructive/10 text-destructive" 
                        : "bg-warning/10 text-warning"
                      }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
              )}
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display text-lg font-semibold text-card-foreground">Monthly Performance</h3>
          <div className="space-y-4">
            {formattedPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No performance data</p>
            ) : (
              formattedPerformance.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-medium text-foreground">{m.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}
