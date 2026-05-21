import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { toast } from "sonner";
import StatCard from "../components/shared/StateCard";
import { TrendingDown, PiggyBank, Plus } from "lucide-react";
import axios from "axios";

const CATEGORIES = ["Venue", "Catering", "Decoration", "Photography", "Music & DJ", "Transport"];

export default function Expenses() {
  const { events, expenses, setExpenses } = useApp();
  const [eventId, setEventId] = useState(events[0]?.id || "");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const selectedEvent = events.find((e) => e.id === eventId);
  const eventExpenses = expenses.filter(
    (e) => String(e.eventId) === String(eventId)
  );
  const totalSpent = eventExpenses.reduce((s, e) => s + e.amount, 0);
  const remaining = (selectedEvent?.budget || 0) - totalSpent;

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/expenses/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // map to your context format
      const formatted = (res.data.data || []).map((e: any) => ({
        id: e.id,
        eventId: e.event_id.toString(),
        category: e.category,
        amount: Number(e.amount),
        createdAt: e.created_at,
      }));

      // you need setter in context
      setExpenses(formatted);
      console.log(res.data.data);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load expenses");
    }
  };

  useEffect(() => {
    if (events.length > 0 && !eventId) {
      setEventId(events[0].id);
    }
    fetchExpenses();
  }, [events]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!category || !amount || !eventId) {
        toast.error("Fill all fields");
        return;
      }

      const token = localStorage.getItem("token");

      await axios.post(
        "https://eventglow-backend.onrender.com/api/expenses",
        {
          event_id: eventId,
          category,
          amount
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Expense added");

      setCategory("");
      setAmount("");

      // IMPORTANT
      fetchExpenses();

    } catch (err) {
      console.log(err);
      toast.error("Failed to add expense");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Expense Tracker</h1>
        <p className="text-sm text-muted-foreground">Track spending for each event.</p>
      </div>

      {/* Event selector */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">Select Event</label>
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}
          className="w-full max-w-xs rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Total Spent" value={fmt(totalSpent)} icon={TrendingDown} variant="warning" />
        <StatCard title="Remaining" value={fmt(remaining)} icon={PiggyBank} variant={remaining >= 0 ? "success" : "default"} />
      </div>

      {/* Add expense */}
      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleAdd}
        className="rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-card-foreground">Add Expense</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Amount (₹)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10000"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>
      </motion.form>

      {/* Expense list */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="border-b px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-card-foreground">Expense History</h2>
        </div>
        {eventExpenses.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">No expenses yet for this event.</p>
        ) : (
          <div className="divide-y">
            {eventExpenses.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{exp.category}</p>
                  <p className="text-xs text-muted-foreground">{exp.createdAt}</p>
                </div>
                <p className="font-display text-sm font-bold text-foreground">{fmt(exp.amount)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
