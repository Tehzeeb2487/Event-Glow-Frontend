import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import axios from "axios";

const EVENT_TYPES = ["Wedding", "Birthday", "Corporate", "Social", "Conference", "Other"];

export default function Contact() {
  const { isAuthenticated, addEvent } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", eventType: "", budget: "", date: "", message: "", guests: "" });
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.eventType || !form.budget) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!isAuthenticated) {
      // Store pending event data so we can create it after login
      sessionStorage.setItem("pendingEvent", JSON.stringify({
        name: form.name,
        type: form.eventType,
        budget: Number(form.budget) || 0,
        guests: Number(form.guests) || 50,
      }));
      toast.info("Please login to continue");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.post(
        "https://eventglow-backend.onrender.com/api/events/",
        {
          name: form.name,
          email: form.email,
          event_type: form.eventType,
          event_date: form.date,
          budget: form.budget,
          guests: form.guests || 50,
          message: form.message,
          source: "contact"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success("Event submitted successfully!");
      setForm({ name: "", email: "", eventType: "", budget: "", date: "", message: "", guests: ""});
      navigate("/dashboard");
    } catch(err) {
      console.log(err);
      toast.error("Failed to submit event");
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
    <div>
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">Contact & Booking</h1>
          <p className="mt-2 text-primary-foreground/80">Let's start planning your dream event</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <h2 className="mb-6 font-display text-2xl font-bold text-foreground">Book Your Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event Name *</label>
                  <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. My Dream Wedding"
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com"
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event Type *</label>
                  <select value={form.eventType} onChange={(e) => update("eventType", e.target.value)}
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select</option>
                    {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Budget (₹) *</label>
                  <input type="number" value={form.budget} onChange={(e) => update("budget", e.target.value)} placeholder="500000"
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Guests</label>
                  <input type="number" value={form.guests} onChange={(e) => update("guests", e.target.value)} placeholder="100"
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Event Date</label>
                  <input type="date" value={form.date} onChange={(e) => update("date", e.target.value)}
                    className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
                <textarea value={form.message} onChange={(e) => update("message", e.target.value)} rows={4} placeholder="Tell us about your event..."
                  className="w-full rounded-lg border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
                <Send className="h-4 w-4" /> {loading ? "Submitting..." : "Submit Booking"}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Get in Touch</h2>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "hello@eventglow.in" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Address", value: "123 Event Street, Mumbai, Maharashtra, India" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
