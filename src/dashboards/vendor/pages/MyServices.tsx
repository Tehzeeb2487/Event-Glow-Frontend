import { useState, useEffect } from "react";
import { Music, Utensils,Flower, Plus, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { confirmToast } from "@/lib/confirmToast";
import { MapPin, Building2, Camera, CarFront } from "lucide-react";


interface Service {
  id: string;
  title: string;
  price: string;
  bookings: number;
  category: string;
  description: string;
  image_url: string;
  location: string;
  features: string[] | string
}

const categories = ["Select Category","Venue","Catering","Decoration","Photography","Music & DJ","Transport"];
const categoryColorMap: Record<string, string> = {
  Venue: "bg-primary/10 text-primary",
  Catering: "bg-success/10 text-success",
  Decoration: "bg-accent/10 text-accent",
  Photography: "bg-warning/10 text-warning",
  "Music & DJ": "bg-secondary text-secondary-foreground",
  Transport: "bg-muted text-muted-foreground",
};

export default function MyServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category: "", description: "", location: ""});
  const [image, setImage] = useState<File | null>(null);
  const [features, setFeatures] = useState("");
  const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Venue: Building2,
    Catering: Utensils,
    Decoration: Flower,
    Photography: Camera,
    "Music & DJ": Music,
    Transport: CarFront,
  };

  const parseFeatures = (features: any): string[] => {
    try {
      if (!features) return [];
      if (Array.isArray(features)) return features;
      return JSON.parse(features);
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `https://eventglow-backend.onrender.com/api/services/vendor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setServices(Array.isArray(data) ? data : data.services || []);
      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchServices();
  }, [user])

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", price: "", category: "", description: "", location: "" });
    setShowModal(true);
  };

  const openEdit = (s: Service) => {
    
    setEditingId(s.id);
    setForm({ name: s.title, price: s.price, category: s.category, description: s.description, location: s.location || "" });
    setFeatures(parseFeatures(s.features).join(", "));
    
    setImage(null);
    setShowModal(true);
  };

  const askDelete = (s: Service) => {
    confirmToast({
      message: "Delete this service?",
      description: `"${s.title}" will be permanently removed.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        
        const token = localStorage.getItem("token");

        await fetch(`https://eventglow-backend.onrender.com/api/services/${s.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setServices((prev) => prev.filter((x) => x.id !== s.id));
        toast.success("Deleted");
      },
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("description", form.description);
    formData.append("location", form.location);
    if (image) {
      formData.append("image", image);
    }
    formData.append(
      "features",
      JSON.stringify(features.split(",").map(f => f.trim()))
    );

    try {
      let res;

      if (editingId) {
        res = await fetch(
          `https://eventglow-backend.onrender.com/api/services/${editingId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      } else {
        res = await fetch("https://eventglow-backend.onrender.com/api/services", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast.success(editingId ? "Updated" : "Created");

      // refresh list
      window.location.reload(); // quick fix
      // instead of reload
      setServices(prev => {
        if (editingId) {
          return prev.map(s => s.id === editingId ? data : s);
        }
        return [...prev, data];
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">My Services</h2>
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => {
          const Icon = categoryIconMap[s.category?.trim()] || Camera;
          const color = categoryColorMap[s.category?.trim()] || "bg-primary/10 text-primary";
          return (
            <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {s.image_url && (
                <div className="mb-3 h-32 w-full overflow-hidden rounded-lg">
                  <img
                    src={s.image_url}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-md font-medium ${color}`}>
                  {s.category}
                </span>
              </div>
              
              <h3 className="mt-3 font-display text-lg font-semibold text-card-foreground">{s.title}</h3>
              <span className="text-xs text-muted-foreground">
                {parseFeatures(s.features).slice(0, 2).join(" • ")}
              </span>
              <div className="mt-2 flex items-center justify-between">
                <p className="font-display text-base font-bold text-primary">
                  {s.price}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {s.bookings} bookings
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                  {s.location || "Location not set"}
              </div>
              {s.description && <p className="mt-1 text-xs text-muted-foreground italic">{s.description}</p>}
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary/40" onClick={() => openEdit(s)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" onClick={() => askDelete(s)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card-hover space-y-4"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingId ? "Edit Service" : "Add New Service"}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Service Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Photography" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Price</label>
                  <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. ₹25,000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Image</label>
                  <Input 
                    type="file"
                    accept="image/*"
                    className="w-full text-sm"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Features</label>
                  <Input 
                    value={features}
                    placeholder="e.g. Venue, Decor"
                    onChange={(e) => setFeatures(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Delhi"
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full gradient-primary text-primary-foreground">
                {editingId ? "Update Service" : "Add Service"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
