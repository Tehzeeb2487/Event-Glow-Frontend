import { useApp } from "@/contexts/AppContext";
import StatCard from "../components/shared/StateCard";
import { Wallet, TrendingDown, PiggyBank, CalendarDays, MapPin, Utensils, Palette, MoreHorizontal } from "lucide-react";
import { motion} from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function Dashboard() {
  const { events, expenses, user, setExpenses, setUserEvents } = useApp();
  const totalBudget = events.reduce((s, e) => s + e.budget, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = totalBudget - totalExpenses;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const [eventsRes, expensesRes] = await Promise.all([
          axios.get(
            "https://eventglow-backend.onrender.com/api/events/my",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          axios.get(
            "https://eventglow-backend.onrender.com/api/expenses/my",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        setUserEvents(
          (eventsRes.data.data || []).map((e: any) => ({
            id: e.id.toString(),
            name: e.name,
            type: e.event_type,
            budget: Number(e.budget),
            guests: Number(e.guests),
            createdAt: e.created_at || "",
          }))
        );

        setExpenses(
          (expensesRes.data.data || []).map((e: any) => ({
            id: e.id,
            eventId: e.event_id.toString(),
            category: e.category,
            amount: Number(e.amount),
            createdAt: e.created_at,
          }))
        );

      } catch (err) {
        console.log(err);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const chartData = events.map((event) => {
    const eventExpenses = expenses.filter((ex) => ex.eventId === event.id).reduce((s, ex) => s + ex.amount, 0);
    return { name: event.name.length > 12 ? event.name.slice(0, 12) + "…" : event.name, budget: event.budget, spent: eventExpenses };
  });

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {user?.name} 👋</h1>
        <p className="text-sm text-muted-foreground">Here's an overview of your events and budgets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Budget" value={fmt(totalBudget)} icon={Wallet} variant="default" />
        <StatCard title="Total Expenses" value={fmt(totalExpenses)} icon={TrendingDown} variant="warning" />
        <StatCard title="Remaining" value={fmt(remaining)} icon={PiggyBank} variant="success" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Budget vs Expenses</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} formatter={(value) => fmt(Number(value))} />
              <Bar dataKey="budget" name="Budget" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
              </Bar>
              <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill="hsl(var(--accent))" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Budget Optimization */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-5 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Budget Optimization</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create an event to see budget optimization.</p>
        ) : (
          <div className="space-y-5">
            {events.map((event) => {
              const splits = [
                { label: "Venue", pct: 40, icon: MapPin, variant: "bg-primary/10 text-primary" },
                { label: "Food", pct: 30, icon: Utensils, variant: "bg-success/10 text-success" },
                { label: "Decoration", pct: 15, icon: Palette, variant: "bg-accent/10 text-accent" },
                { label: "Others", pct: 15, icon: MoreHorizontal, variant: "bg-warning/10 text-warning" },
              ];
              return (
                <div key={event.id} className="rounded-lg border bg-background p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">{event.name} — {fmt(event.budget)}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {splits.map((s) => {
                      const amount = (event.budget * s.pct) / 100;
                      return (
                        <div key={s.label} className="rounded-lg border bg-card p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.variant}`}>
                              <s.icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-card-foreground">{s.label}</p>
                              <p className="text-[10px] text-muted-foreground">{s.pct}%</p>
                            </div>
                          </div>
                          <div className="mb-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full gradient-primary" />
                          </div>
                          <p className="font-display text-sm font-bold text-card-foreground">{fmt(amount)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-card-foreground">Your Events</h2>
          <Link to="/dashboard/create-event" className="rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            + New Event
          </Link>
        </div>
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-lg border bg-background p-4 transition-shadow hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                  <CalendarDays className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{event.type} · {event.guests} guests</p>
                </div>
              </div>
              <p className="font-display text-sm font-bold text-foreground">{fmt(event.budget)}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
