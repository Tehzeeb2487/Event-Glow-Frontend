import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { CalendarDays, CreditCard, CheckCircle2, Clock, Star, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ReviewForm from "@/components/shared/ReviewFrom";
import { confirmToast } from "@/lib/confirmToast";
import { toast } from "sonner";
import axios from "axios";
import { Building2, Utensils, Flower, Camera, Music, CarFront, MapPin } from "lucide-react";

interface Review {
  id: number;
  booking_id: number;
  rating: number;
  comment: string;
  vendor_name: string;
}

interface Booking {
  id: number;
  vendorName: string;
  serviceName: string;
  eventName: string;
  category: string;
  date: string;
  price: number;
  status: string;
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
  Venue: "text-primary",
  Catering: "text-success",
  Decoration: "text-accent",
  Photography: "text-warning",
  "Music & DJ": "text-secondary-foreground",
  Transport: "text-muted-foreground",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewing, setReviewing] = useState<{ bookingId: number; vendorName: string; existing?: Review } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchBookings(),
          fetchReviews()
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const fetchReviews = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/reviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviews(res.data.data || []);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load reviews");
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/bookings/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load bookings");
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewing) return;
    
    try {

      const token = localStorage.getItem("token");

      // UPDATE REVIEW
      if (reviewing.existing) {

        await axios.put(
          `https://eventglow-backend.onrender.com/api/reviews/${reviewing.existing.id}`,
          {
            rating,
            comment
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Review updated");

      }

      // CREATE REVIEW
      else {

        await axios.post(
          "https://eventglow-backend.onrender.com/api/reviews",
          {
            booking_id: reviewing.bookingId,
            rating,
            comment
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Review submitted");

      }

      fetchReviews();

      setReviewing(null);

    } catch (err: any) {

      console.log(err);

      toast.error(
        err.response?.data?.message ||
        "Something went wrong"
      );

    }
  };

  const handleDeleteReview = ( reviewId: number ) => {

    confirmToast({

      message: "Delete this review?",

      description:
        "This action cannot be undone.",

      confirmLabel: "Delete",

      variant: "destructive",

      onConfirm: async () => {

        try {

          const token = localStorage.getItem("token");

          await axios.delete(
            `https://eventglow-backend.onrender.com/api/reviews/${reviewId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          fetchReviews();

          toast.success("Review deleted");

        } catch (err) {
          console.log(err);
          toast.error("Failed to delete review");
        }
      },
    });
  };

  const reviewFor = (id: number) => reviews.find((r) => Number(r.booking_id) === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="text-sm text-muted-foreground">Track and manage your vendor bookings.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-card">
          <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-semibold text-foreground">No bookings yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse vendors and book services for your event.</p>
          <button onClick={() => navigate("/dashboard/vendors")} className="mt-4 rounded-lg gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Browse Vendors
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Vendor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const existing = reviewFor(b.id);
                return (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {(() => {
                        const Icon = iconMap[b.category] || MapPin;
                        const color = colorMap[b.category] || "text-primary";
                        return (
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${color}`}/>
                            {b.vendorName}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.serviceName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.eventName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(b.date).toLocaleDateString("en-CA")}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">₹{Number(b.price).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {b.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {b.status === "pending" ? (
                        <button onClick={() => navigate(`/dashboard/checkout/${b.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
                          <CreditCard className="h-3 w-3" /> Pay Now
                        </button>
                      ) : existing ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setReviewing({ bookingId: b.id, vendorName: b.vendorName, existing })}
                            className="inline-flex items-center gap-1 rounded-lg border border-primary/40 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                          >
                            <Pencil className="h-3 w-3" /> Edit Review
                          </button>
                          <button
                            onClick={() => handleDeleteReview(existing.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" /> Delete Review
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewing({ bookingId: b.id, vendorName: b.vendorName })}
                          className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        >
                          <Star className="h-3 w-3" /> Rate Vendor
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reviewing && (
        <ReviewForm
          open={!!reviewing}
          onOpenChange={(o) => !o && setReviewing(null)}
          vendorName={reviewing.vendorName}
          initialRating={reviewing.existing?.rating || 0}
          initialComment={reviewing.existing?.comment || ""}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
