import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { MapPin, Utensils, Palette, MoreHorizontal } from "lucide-react";
import axios from "axios";

const EVENT_TYPES = ["Wedding", "Birthday", "Corporate", "Social", "Conference", "Other"];

const BUDGET_SPLIT = [
  { label: "Venue", pct: 40, icon: MapPin, variant: "bg-primary/10 text-primary" },
  { label: "Food", pct: 30, icon: Utensils, variant: "bg-success/10 text-success" },
  { label: "Decoration", pct: 15, icon: Palette, variant: "bg-accent/10 text-accent" },
  { label: "Others", pct: 15, icon: MoreHorizontal, variant: "bg-warning/10 text-warning" },
];

export default function CreateEvent() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [guests, setGuests] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const budgetNum = Number(budget) || 0;
  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !budget || !guests) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://eventglow-backend.onrender.com/api/events/",
        {
          name,
          event_type: type,
          event_date: date,
          budget: Number(budget),
          guests: guests,
          source: "dashboard"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Event created!");
      setSubmitted(true);
      navigate("/dashboard");
    } catch(err) {
      console.log(err);
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Create New Event</h1>
        <p className="text-sm text-muted-foreground">Fill in event details and get an automatic budget breakdown.</p>
      </div>

      <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
        className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Event Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Annual Gala"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Event Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. Annual Gala"
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Event Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">Select type</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Total Budget (₹)</label>
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500000"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Number of Guests</label>
            <input type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="100"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          {loading ? "Creating..." : "Create Event"}
        </button>
      </motion.form>

      {(budgetNum > 0 || submitted) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Budget Optimization</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {BUDGET_SPLIT.map((item) => {
              const amount = (budgetNum * item.pct) / 100;
              return (
                <div key={item.label} className="rounded-xl border bg-card p-5 shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.variant}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.pct}% of budget</p>
                    </div>
                  </div>
                  <div className="mb-2 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full gradient-primary" />
                  </div>
                  <p className="font-display text-lg font-bold text-card-foreground">{fmt(amount)}</p>
                </div>
              );
            })}
          </div>
          {submitted && (
            <button onClick={() => navigate("/dashboard/budget-optimization")} className="rounded-lg border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              View Budget Optimization →
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
