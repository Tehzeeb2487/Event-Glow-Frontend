import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/vendors", label: "Vendors" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useApp();

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">EventGlow</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span>{user?.name || "Profile"}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Login
              </Link>
              <Link to="/register" className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t md:hidden">
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === link.to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                {isAuthenticated ? (
                  <Link to="/profile" onClick={() => setOpen(false)} className="flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground">
                    <User className="h-4 w-4" /> {user?.name || "Profile"}
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-lg border px-4 py-2 text-center text-sm font-medium text-foreground">Login</Link>
                    <Link to="/register" onClick={() => setOpen(false)} className="flex-1 rounded-lg gradient-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
