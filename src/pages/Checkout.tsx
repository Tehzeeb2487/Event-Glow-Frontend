import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, ArrowLeft, ShieldCheck, Smartphone, Lock, Zap, Receipt } from "lucide-react";
import axios from "axios";

export default function Checkout() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const [method, setMethod] = useState("upi");

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/bookings/my",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const found = res.data.data.find(
        (b: any) => b.id === Number(bookingId)
      );

      setBooking(found);
    } catch (err) {
      console.log(err);
    }
  };

  const handlePay = async () => {
    try {
      setProcessing(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const token = localStorage.getItem("token");

      await axios.put(
        `https://eventglow-backend.onrender.com/api/bookings/pay/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaid(true);
      toast.success("Booking Confirmed Successfully!");

    } catch (err) {
      console.log(err);
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  // const booking = bookings.find((b) => b.id === Number(bookingId));

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-lg font-semibold text-foreground">Booking not found</h2>
        <button onClick={() => navigate("/dashboard/my-bookings")} className="mt-4 text-sm text-primary hover:underline">← Back to Bookings</button>
      </div>
    );
  }

  if (booking.status === "paid" || paid) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">Booking Confirmed Successfully!</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your booking with {booking.vendorName} has been confirmed.</p>
        <button onClick={() => navigate("/dashboard/my-bookings")} className="mt-6 rounded-lg gradient-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button onClick={() => navigate("/dashboard/my-bookings")} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Bookings
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-card p-6 shadow-card space-y-4">
        <h1 className="font-display text-xl font-bold text-foreground">Checkout</h1>

        <div className="space-y-3 rounded-xl bg-muted/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vendor</span>
            <span className="font-medium text-foreground">{booking.vendorName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium text-foreground">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium text-foreground">{new Date(booking.date).toLocaleDateString("en-CA")}</span>
          </div>
          {booking.notes && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Notes</span>
              <span className="font-medium text-foreground">{booking.notes}</span>
            </div>
          )}
          <div className="border-t border-dashed pt-3 flex items-center justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display text-lg font-bold text-primary">₹{booking.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-success/5 border border-success/20 p-3 text-xs text-success">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Secure payment simulation — no real charges.</span>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">
            Select Payment Method
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMethod("upi")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all
                ${method === "upi"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
            >
              <Smartphone className="h-4 w-4" />
              UPI Payment
            </button>
            <button
              type="button"
              onClick={() => setMethod("card")}
              className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all
                ${method === "card"
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
            >
              <CreditCard className="h-4 w-4" />
              Card Payment
            </button>
          </div>
          {method === "upi" && (
            <input
              type="text"
              placeholder="example@upi"
              autoComplete="off"
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {method === "card" && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="4111 1111 1111 1111"
                maxLength={19}
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="text"
                placeholder="Card Holder Name"
                className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  maxLength={3}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </div>

        <button onClick={handlePay} disabled={processing}
          className="flex w-full items-center justify-center gap-2 rounded-lg gradient-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          <CreditCard className="h-4 w-4" />
          {processing ? "Processing..." : "Proceed to Pay"}
        </button>
        
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex flex-wrap items-center justify-center gap-1 transition-all">
            <Lock className="h-3 w-3" /> 
            Encrypted
          </span>
          <span className="flex flex-wrap items-center justify-center gap-1 transition-all">
            <Zap className="h-3 w-3" /> 
            Instant Confirmation
          </span>
          <span className="flex flex-wrap items-center justify-center gap-1 transition-all">
            <Receipt className="h-3 w-3" /> 
            Demo Payment
          </span>
        </div>
      </motion.div>
    </div>
  );
}
