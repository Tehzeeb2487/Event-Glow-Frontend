import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Event {
  id: string;
  name: string;
  type: string;
  budget: number;
  guests: number;
  createdAt: string;

  user?: number;
  date?: string;
  status?: "pending" | "contacted" | "confirmed";
}

export interface Expense {
  id: string;
  eventId: string;
  category: string;
  amount: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  vendorId: string;
  serviceId: string;
  vendorName: string;
  serviceName: string;
  category: string;
  price: number;
  service_count: number;
  date: string;
  notes: string;
  status: "pending" | "paid";
}

export type UserRole = "customer" | "vendor" | "admin";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  image?: string;
  role: UserRole;
  status: string;

  profile_completed?: number;

  business_name?: string;
  description?: string;
  location?: string;
  experience?: string;
}

interface AppState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  events: Event[];
  expenses: Expense[];
  bookings: Booking[];
  loading: boolean;
  login: (user: UserProfile) => void;
  register: (name: string, email: string, password: string, role?: UserRole) => boolean;
  logout: () => void;
  addEvent: (event: Omit<Event, "id" | "createdAt">) => void;
  setUserEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => void;
  addBooking: (booking: Omit<Booking, "id" | "status">) => void;
  markBookingPaid: (bookingId: string) => void;
  updateUser: (data: Partial<UserProfile>) => void;
  deleteAccount: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const login = (userData: UserProfile) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://eventglow-backend.onrender.com/api/auth/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // 🔥 IMPORTANT: backend → frontend mapping
        setIsAuthenticated(true);
        setUser({
          id: data.id,
          name: data.fullname,
          email: data.email,
          role: data.role === "user" ? "customer" : data.role,
          status: data.status,

          profile_completed: data.profile_completed,
          phone: data.phone,
          avatar: data.image
            ? `https://eventglow-backend.onrender.com/uploads/${data.image}`
            : undefined,

          business_name: data.business_name,
          description: data.description,
          location: data.location,
          experience: data.experience,
        });

      } catch (error) {
        console.error("Profile fetch error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const register = (name: string, email: string, password: string, role: UserRole = "customer") => {
    try {
      const usersRaw = localStorage.getItem("eg_users");
      const users: Array<{ name: string; email: string; password: string; role: UserRole; status?: "pending" | "approved" | "rejected" }> =
        usersRaw ? JSON.parse(usersRaw) : [];
      if (users.some((u) => u.email === email)) return false;
      const status = role === "vendor" ? "pending" : "approved";
      users.push({ name, email, password, role, status });
      localStorage.setItem("eg_users", JSON.stringify(users));
    } catch {
      /* ignore */
    }
    // Vendors are NOT auto-logged-in; they wait for admin approval.
    if (role === "vendor") {
      return true;
    }
    setIsAuthenticated(true);
    setUser({ 
      id: Date.now(),
      name, 
      email, 
      role,
      status,
    });
    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const addEvent = (event: Omit<Event, "id" | "createdAt">) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const setUserEvents = setEvents;

  const addExpense = (expense: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const addBooking = (booking: Omit<Booking, "id" | "status">) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: "pending",
    };
    setBookings((prev) => [...prev, newBooking]);
  };

  const markBookingPaid = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "paid" as const } : b))
    );
  };

  const updateUser = (data: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const deleteAccount = () => {
    if (!user) return;
    try {
      const raw = localStorage.getItem("eg_users");
      if (raw) {
        const users = JSON.parse(raw).filter((u: { email: string }) => u.email !== user.email);
        localStorage.setItem("eg_users", JSON.stringify(users));
      }
    } catch { /* ignore */ }
    setIsAuthenticated(false);
    setUser(null);
    setEvents([]);
    setExpenses([]);
    setBookings([]);
  };

  return (
    <AppContext.Provider value={{ isAuthenticated, setExpenses, user, events, expenses, bookings, loading, login, register, logout, addEvent, setUserEvents, addExpense, addBooking, markBookingPaid, updateUser, deleteAccount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
