import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Utensils, Flower, Camera, Music, Star, X, CalendarDays, FileText, ArrowLeft, CheckCircle2, CarFront, Building2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

interface VendorService {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  about: string;
  icon: typeof MapPin;
  color: string;
  services: VendorService[];
  service_count: number;
}

const iconMap: any = {
  Venue: Building2,
  Catering: Utensils,
  Decoration: Flower,
  Photography: Camera,
  "Music & DJ": Music,
  Transport: CarFront,
};

const colorMap: any = {
  Venue: "bg-primary/10 text-primary",
  Catering: "bg-success/10 text-success",
  Decoration: "bg-accent/10 text-accent",
  Photography: "bg-warning/10 text-warning",
  "Music & DJ": "bg-secondary text-secondary-foreground",
  Transport: "bg-muted text-muted-foreground",
};

export default function Vendors() {
  const { events } = useApp();
  const navigate = useNavigate();
  const [activeVendor, setActiveVendor] = useState<Vendor | null>(null);
  const [selectedService, setSelectedService] = useState<VendorService | null>(null);
  const [step, setStep] = useState<"details" | "book">("details");
  const [bookingForm, setBookingForm] = useState({ date: "", notes: "", eventId: "" });
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/vendors/public"
      );

      setVendors(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const openVendor = async (v: any) => {
    const res = await axios.get(`https://eventglow-backend.onrender.com/api/vendors/services/${v.id}`);
    setActiveVendor(res.data);
    setSelectedService(null);
    setStep("details");
  };

  const closeAll = () => {
    setActiveVendor(null);
    setSelectedService(null);
    setStep("details");
  };

  const proceedToBook = () => {
    if (!selectedService) { toast.error("Please select a service first"); return; }
    setStep("book");
  };

  const handleBook = async () => {
    if (!activeVendor || !selectedService) return;
    if (!bookingForm.date) { toast.error("Please select a date"); return; }
    if (!bookingForm.eventId) {
      toast.error("Please select an event");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "https://eventglow-backend.onrender.com/api/bookings",
        {
          service_id: selectedService.id,
          booking_date: bookingForm.date,
          notes: bookingForm.notes,
          event_id: bookingForm.eventId,
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Booking created successfully");

      closeAll();
      navigate("/dashboard/my-bookings");
    } catch (err) {
      console.log(err);
      toast.error("Booking failed");
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading vendors...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Vendor Suggestions</h1>
        <p className="text-sm text-muted-foreground">Browse recommended vendors for your events.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {vendors.map((v, i) => {
          const category = v.categories?.split(",")[0] || "Venue";
          const Icon = iconMap[category] || MapPin;
          const color = colorMap[category] || "bg-primary/10 text-primary";
          const isCatering = category === "Catering";
          const expColor = 
            v.experience >= 10 
              ? "bg-green-100 text-green-700"
              :v.experience >=5
              ? "bg-warning/10 text-warning"
              : "bg-muted text-muted-foreground"
          return (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-card-foreground">{v.business_name}</p>
                <p className="text-xs text-muted-foreground">{v.categories} · {v.location} · {v.service_count} services</p>
              </div>
            </div>
            <div className="mb-2">
              {v.experience && (
                <span className={`text-xs px-2.5 py-1 rounded-full ${expColor}`}>
                  {v.experience} yrs exp
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-display text-base font-semibold text-primary">
                ₹{v.starting_price 
                  ? Number(v.starting_price).toLocaleString() 
                  : "N/A"}
                {isCatering && "/plate"}
              </p>
              <div className="flex items-center gap-1 text-warning">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-semibold">{v.rating ? Number(v.rating).toFixed(1) : "N/A"}</span>
              </div>
            </div>
            <button
              onClick={() => openVendor(v)}
              className="w-full rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              View Details
            </button>
          </motion.div>
        )})}
      </div>

      {/* Vendor Details / Booking Modal */}
      {activeVendor && (
        
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={closeAll}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-card-hover space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "details" ? (
              (() => {
                const category = 
                  activeVendor?.services?.length > 0
                    ? activeVendor.services[0].category 
                    : "Venue";

                const Icon = iconMap[category] || MapPin;
                const color = colorMap[category] || "bg-primary/10 text-primary";

                return (
                  <>
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center justify-between">
                              <h2 className="font-display text-lg font-bold">
                                {activeVendor.name}
                              </h2>

                              <div className="flex items-center gap-1 text-xs font-semibold text-warning ms-2">
                                <Star className="h-4 w-4 fill-current" />
                                {activeVendor.rating ? Number(activeVendor.rating).toFixed(1) : "N/A"}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {category} · {activeVendor.location} · {activeVendor.service_count} services
                            </p>
                          </div>
                        </div>
                        <button onClick={closeAll} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 pr-1">
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Select a Service</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
                        {activeVendor.services.map((s: any) => {
                          const isSel = selectedService?.id === s.id;
                          return (
                            <div
                              key={s.id}
                              onClick={() => setSelectedService(s)}
                              className={`cursor-pointer rounded-xl border shadow-card p-3 transition-all ${
                                isSel
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-background hover:border-muted-foreground/50"
                              }`}
                            >
                              {s.image_url && (
                                <div className="mb-2 h-24 w-full overflow-hidden rounded-md">
                                  <img src={s.image_url} className="h-full w-full object-cover" />
                                </div>
                              )}
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-semibold">{s.title}</p>
                                  <span className="text-xs text-muted-foreground line-clamp-1 text-primary">
                                    {parseFeatures(s.features).slice(0, 2).join(" • ")}
                                  </span>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {s.description}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="font-display text-base font-bold text-primary">
                                    ₹{Number(s.price).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={proceedToBook}
                        disabled={!selectedService}
                        className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Book Service
                      </button>
                    </div>
                  </>
                )
             })()
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep("details")}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={closeAll} className="text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Confirm Booking</h2>
                  <p className="text-sm text-muted-foreground">
                    {activeVendor.name} — {selectedService?.title}
                  </p>
                  <p className="mt-1 font-display text-base font-bold text-foreground">
                    ₹{selectedService?.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <CalendarDays className="h-4 w-4" /> Event Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <FileText className="h-4 w-4" /> Notes (optional)
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    placeholder="Any special requirements..."
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Select Event *
                  </label>

                  <select
                    value={bookingForm.eventId || ""}
                    onChange={(e) =>
                      setBookingForm((p) => ({ ...p, eventId: e.target.value }))
                    }
                    className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Choose your event
                    </option>

                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleBook}
                  className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Confirm Booking
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
