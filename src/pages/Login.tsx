import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Heart, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Login() {
  const { isAuthenticated, user, events, login, setUserEvents } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Already logged in — redirect based on role
  if (isAuthenticated && user) {
    if (user.role === "vendor") {
      if (!user.profile_completed) {
        return <Navigate to="/vendor/profile-setup" />
      }
      return <Navigate to="/vendor" replace />
    }
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    return <Navigate to={events.length > 0 ? "/dashboard" : "/contact"} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("https://eventglow-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if(!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      
      // 🔥 NEW: profile API call
      const profileRes = await fetch("https://eventglow-backend.onrender.com/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await profileRes.json();

      if (!profileRes.ok) {
        toast.error("Failed to fetch profile");
        setLoading(false);
        return;
      }

      // 🔥 BLOCK unapproved vendors
      if (profileData.role === "vendor" && profileData.status !== "approved") {
        toast.error("Your account is not approved yet");
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }
      
      login({
        id: profileData.id,
        name: profileData.fullname,
        email: profileData.email,
        role: profileData.role === "user" ? "customer" : profileData.role,
        status: profileData.status || "approved",

        profile_completed: profileData.profile_completed,
        phone: profileData.phone,
        avatar: profileData.image
          ? profileData.image
          : undefined,

        business_name: profileData.business_name,
        description: profileData.description,
        location: profileData.location,
        experience: profileData.experience
      });

      const token = data.token;
      
      // 🔥 fetch events first
      const eventRes = await fetch("https://eventglow-backend.onrender.com/api/events/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const eventResult = await eventRes.json();

      // 🔥 ROLE BASED NAVIGATION (only once)
      if (profileData.role === "vendor") {
        toast.success("Welcome, Vendor!");
        navigate("/vendor");
        return;
      }

      if (profileData.role === "admin") {
        toast.success("Welcome, Admin!");
        navigate("/admin");
        return;
      }

      // 🔥 CUSTOMER FLOW
      const pending = sessionStorage.getItem("pendingEvent");

      if (pending) {
        try {
          const eventData = JSON.parse(pending);

          await fetch("https://eventglow-backend.onrender.com/api/events", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: eventData.name,
              event_type: eventData.type,
              budget: eventData.budget,
              guests: eventData.guests,
              source: "contact"
            }),
          });

          sessionStorage.removeItem("pendingEvent");
          toast.success("Welcome back! Your event has been created.");
          navigate("/dashboard");
          return;

        } catch {
          sessionStorage.removeItem("pendingEvent");
        }
      }

      // 🔥 final decision
      if (eventResult.data && eventResult.data.length > 0) {
        setUserEvents(eventResult.data || []);
        navigate("/dashboard");
      } else {
        navigate("/contact");
      }

      toast.success("Welcome back!");

    }catch (error){
      console.error(error);
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your EventGlow account</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full rounded-lg border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to Home</Link>
        </p>
      </motion.div>
    </div>
  );
}
