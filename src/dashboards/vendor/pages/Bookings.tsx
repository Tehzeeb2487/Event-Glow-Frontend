import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirmToast";

interface Booking {
  id: number;
  client: string;
  service: string;
  date: string;
  amount: number;
  bookingStatus: string;
  paymentStatus: string;
}

const statusStyle: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
};

const filters = ["All", "pending", "confirmed", "cancelled"] as const;

export default function Bookings() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      // localStorage se vendor data lo
      const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");

      const res = await axios.get(
        `https://eventglow-backend.onrender.com/api/bookings/vendor`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchStatus =
      activeFilter === "All" || b.bookingStatus === activeFilter;

    const matchSearch =
      !search ||
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.service.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const updateStatus = async (
    bookingId: number,
    status: string
  ) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `https://eventglow-backend.onrender.com/api/bookings/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);

      fetchBookings();

    } catch (err: any) {
      console.log(err);

      toast.error(
        err.response?.data?.message || "Status update failed"
      );
    }
  };

  const handleConfirm = (bookingId: number) => {
    confirmToast({
      message: "Confirm this booking?",
      description: "The customer booking will be confirmed.",
      confirmLabel: "Confirm",
      onConfirm: () => updateStatus(bookingId, "confirmed"),
    });
  };

  const handleCancel = (bookingId: number) => {
    confirmToast({
      message: "Cancel this booking?",
      description: "This booking will be cancelled.",
      confirmLabel: "Cancel Booking",
      variant: "destructive",
      onConfirm: () => updateStatus(bookingId, "cancelled"),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Bookings</h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={activeFilter === f ? "default" : "outline"}
              onClick={() => setActiveFilter(f)}
              className={
                activeFilter === f
                  ? "gradient-primary text-primary-foreground hover:opacity-90"
                  : "hover:bg-primary/10 hover:text-primary hover:border-primary/40"
              }
            >
              {f}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No bookings found</TableCell></TableRow>
            ) : filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-foreground">{b.id}</TableCell>
                <TableCell>{b.client}</TableCell>
                <TableCell>{b.service}</TableCell>
                <TableCell>{new Date(b.date).toLocaleDateString("en-CA")}</TableCell>
                <TableCell>₹{Number(b.amount).toLocaleString()}</TableCell>
                <TableCell>
                  {b.paymentStatus === "paid" ? (
                    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      Paid
                    </span>
                  ) : (
                    <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[b.bookingStatus]}`}>
                    {b.bookingStatus.charAt(0).toUpperCase() + b.bookingStatus.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {b.paymentStatus !== "paid" ? (

                    <span className="text-xs text-muted-foreground">
                      Waiting for payment
                    </span>

                  ) : b.bookingStatus === "pending" ? (

                    <div className="flex gap-1">

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-success hover:bg-success/15 hover:text-success"
                        onClick={() => handleConfirm(b.id)}
                        title="Confirm Booking"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                        onClick={() => handleCancel(b.id)}
                        title="Cancel Booking"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>

                    </div>

                  ) : (

                    <span className="text-xs text-muted-foreground">
                      Action completed
                    </span>

                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
