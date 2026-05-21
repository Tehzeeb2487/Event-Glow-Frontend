import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Camera, Save, ArrowRight, Pencil, LogOut, CalendarDays, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { confirmToast } from "@/lib/confirmToast";
import axios from "axios";

export default function WebsiteProfile() {
  const { user, updateUser, logout } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [email, setEmail] = useState(user?.email);
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email);
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://eventglow-backend.onrender.com/api/events/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEventsData(res.data.data);

      } catch (err) {
        console.log(err);
        toast.error("Failed to load events");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const handleImageUpload = async (file: File) => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("https://eventglow-backend.onrender.com/api/auth/profile/image", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      const imageUrl = `https://eventglow-backend.onrender.com/uploads/${data.image}`;

      updateUser({
        avatar: imageUrl,
      });

      setAvatarPreview(imageUrl);
      
      toast.success("Image updated");
    } else {
      toast.error("Image upload failed");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDeleteImage = () => {
    confirmToast({
      message: "Remove profile image?",
      confirmLabel: "Remove",
      variant: "destructive",
      onConfirm: async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("https://eventglow-backend.onrender.com/api/auth/profile/image", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAvatarPreview(null);
          updateUser({ avatar: undefined });
          toast.success("Image deleted");
        } else {
          toast.error(data.message || "Delete failed");
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://eventglow-backend.onrender.com/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: name,
          email: email
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      // ✅ UI update
      updateUser({
        name,
        email,
        avatar: avatarPreview || undefined,
      });

      toast.success("Profile updated successfully!");
      setEditing(false);

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email);
    setAvatarPreview(user?.avatar || null);
    setEditing(false);
  };

  const handleLogout = () => {
    confirmToast({
      message: "Logout?",
      description: "Are you sure you want to log out?",
      confirmLabel: "Logout",
      variant: "destructive",
      onConfirm: async () => {

        const token = localStorage.getItem("token");

        try {
          await fetch("https://eventglow-backend.onrender.com/api/auth/logout",{
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.log("Logout API error", err);
        }
        logout();
        navigate("/");
      },
    });
  };

  const role = user?.role || "customer";
  const isCustomer = role === "customer";
  const hasEvents = eventsData.length > 0;

  const dashboardPath = role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/dashboard";

  const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div>
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">My Profile</h1>
          <p className="mt-2 text-primary-foreground/80">Manage your account details</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className={`grid gap-8 ${isCustomer ? "lg:grid-cols-[1fr_1fr]" : "max-w-lg mx-auto"}`}>
          {/* LEFT: profile */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-foreground">Profile Details</h2>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="hover:bg-primary/10 hover:text-primary hover:border-primary/40">
                    <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                  </Button>
                )}
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || "U"
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-md">
                      <Camera className="h-4 w-4" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                  {editing && avatarPreview && (
                    <button 
                      onClick={handleDeleteImage}
                      className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/80"
                    >
                      <Trash2 size={16} className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {!editing && (
                  <div className="text-center">
                    <p className="font-display text-lg font-semibold text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                )}
              </div>

              {editing ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCancel} className="flex-1 hover:bg-muted hover:text-foreground hover:border-border">Cancel</Button>
                    <Button onClick={handleSave} className="flex-1 gradient-primary text-primary-foreground">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
                      {role}
                    </span>
                  </div>

                  {/* Role-based dashboard CTA */}
                  {!isCustomer ? (
                    <Button
                      onClick={() => navigate(dashboardPath)}
                      className="w-full gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : hasEvents ? (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Create an event via the Contact page to access your dashboard.
                    </p>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: events list (customers only) */}
          {isCustomer && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="mb-4 font-display text-xl font-semibold text-foreground">My Events</h2>
                {loadingEvents ? (
                  <p className="text-sm text-muted-foreground">Loading events...</p>
                ) : hasEvents ? (
                  <div className="space-y-3">
                    {eventsData.map((event) => (
                      <div key={event.id} className="flex items-center justify-between rounded-lg border bg-background p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <CalendarDays className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{event.name}</p>
                            <p className="text-xs text-muted-foreground">{event.event_type} · {event.guests} guests</p>
                          </div>
                        </div>
                        <p className="font-display text-sm font-bold text-foreground">{fmt(event.budget)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/60" />
                    <p className="mt-3 text-sm text-muted-foreground">No events yet.</p>
                    <Button onClick={() => navigate("/contact")} variant="outline" size="sm" className="mt-3 hover:bg-primary/10 hover:text-primary hover:border-primary/40">
                      Create an Event
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
