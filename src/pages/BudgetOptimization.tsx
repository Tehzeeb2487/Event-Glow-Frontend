import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Utensils, Palette, MoreHorizontal } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";

const BUDGET_SPLIT = [
  { label: "Venue", pct: 40, icon: MapPin, variant: "bg-primary/10 text-primary" },
  { label: "Food", pct: 30, icon: Utensils, variant: "bg-success/10 text-success" },
  { label: "Decoration", pct: 15, icon: Palette, variant: "bg-accent/10 text-accent" },
  { label: "Others", pct: 15, icon: MoreHorizontal, variant: "bg-warning/10 text-warning" },
];

export default function BudgetOptimization() {
  const { events } = useApp();

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Budget Optimization</h1>
        <p className="text-sm text-muted-foreground">View the recommended budget split for every event you create.</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold text-card-foreground">No events yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Create an event to see Venue, Food, Decoration, and Others budget allocations.</p>
          <Link to="/dashboard/create-event" className="mt-4 inline-flex rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <motion.section
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-card-foreground">{event.name}</h2>
                  <p className="text-xs text-muted-foreground">{event.type} · {event.guests} guests</p>
                </div>
                <p className="font-display text-base font-bold text-card-foreground">Total Budget: {fmt(event.budget)}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {BUDGET_SPLIT.map((item) => {
                  const amount = (event.budget * item.pct) / 100;

                  return (
                    <div key={item.label} className="rounded-xl border bg-background p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.variant}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.pct}% allocation</p>
                        </div>
                      </div>

                      <Progress value={item.pct} className="mb-3 h-2 bg-muted" />

                      <p className="font-display text-lg font-bold text-foreground">{fmt(amount)}</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </div>
  );
}