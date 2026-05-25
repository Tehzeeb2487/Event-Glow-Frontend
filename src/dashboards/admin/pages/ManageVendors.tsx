import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, Trash2, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import { confirmToast } from "@/lib/confirmToast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Briefcase, Star, FileText, Building2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  email: string;
  image?: string;
  category: string;
  bookings: number;
  rating: number;
  status: "Verified" | "Pending" | "Suspended" | "Rejected";

  business_name?:string;
  description?: string;
  location?: string;
  experience?: string;
  source: "mock" | "registered";
}

const statusStyle: Record<string, string> = {
  Verified: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Suspended: "bg-destructive/10 text-destructive",
  Rejected: "bg-destructive/10 text-destructive",
};

export default function ManageVendors() {
  const [registered, setRegistered] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const filters = ["All", "Verified", "Pending", "Rejected"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch("https://eventglow-backend.onrender.com/api/vendors/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // 👉 sirf vendors filter karo
      const vendorsData = data.map((v: any) => ({
        id: v.id,
        name: v.fullname,
        email: v.email,
        image: v.image,
        bookings: v.bookings || 0,
        rating: v.rating ? Number(v.rating).toFixed(1) : 0,
        status:
          v.status === "approved"
            ? "Verified"
            : v.status === "rejected"
            ? "Rejected"
            : "Pending",

        business_name: v.business_name,
        description: v.description,
        location: v.location,
        experience: v.experience,
        source: "registered",
      }));

      setRegistered(vendorsData);
        
    } catch (err) {
      console.log("Error fetching vendors", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const vendors = registered;

  const filtered = vendors.filter((v) => {
    const matchStatus = 
      activeFilter === "All" || 
        v.status?.toLowerCase() === activeFilter.toLowerCase();

    const matchSearch = 
      !search || 
        v.name.toLowerCase().includes(search.toLowerCase()) || 
        v.email.toLowerCase().includes(search.toLowerCase())

    return matchSearch && matchStatus;
  });

  const performAction = async (vendor: Vendor, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("token");

      const url = 
        action === "approve"
          ? `https://eventglow-backend.onrender.com/api/admin/vendors/approve/${vendor.id}`
          : `https://eventglow-backend.onrender.com/api/admin/vendors/reject/${vendor.id}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      console.log("API response:", data);

      await fetchVendors();

      toast.success(data.message);
    } catch(err: any) {
      console.log(err);
      toast.error(err.message || "Active failed");
    }
  };

  const handleApprove = (v: Vendor) => {
    confirmToast({
      message: "Approve this vendor?",
      description: `${v.name} will be able to log in and access the vendor dashboard.`,
      confirmLabel: "Approve",
      onConfirm: () => performAction(v, "approve"),
    });
  };

  const handleReject = (v: Vendor) => {
    confirmToast({
      message: "Reject this vendor?",
      description: `${v.name} will not be able to log in.`,
      confirmLabel: "Reject",
      variant: "destructive",
      onConfirm: () => performAction(v, "reject"),
    });
  };

  const handleDelete = (v: Vendor) => {
    confirmToast({
      message: "Are you sure you want to delete?",
      description: `${v.name} will be permanently removed.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");

          const res = await fetch(`https://eventglow-backend.onrender.com/api/users/${v.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if (!res.ok) throw new Error(data.message);

          // UI update
          setRegistered((prev) => prev.filter((x) => x.id !== v.id));

          toast.success("Vendor deleted successfully");
        } catch (err: any) {
          console.log(err);
          toast.error(err.message || "Delete failed");
        }
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Verified":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "Pending":
        return <Clock className="h-4 w-4 text-warning" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "Suspended":
        return <Ban className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Manage Vendors</h2>
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading Vendors...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No vendors found</TableCell></TableRow>
            ) :filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium text-foreground">{v.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">

                    {v.image ? (
                      <img
                        src={`https://eventglow-backend.onrender.com/uploads/${v.image}`}
                        alt={v.name}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {v.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-foreground">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{v.bookings}</TableCell>
                <TableCell>{v.rating ? `⭐ ${v.rating}` : "—"}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[v.status]}`}>
                    {v.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {v.status !== "Verified" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-success hover:bg-success/15 hover:text-success"
                        onClick={() => handleApprove(v)}
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {v.status !== "Suspended" && v.status !== "Rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-warning hover:bg-warning/15 hover:text-warning"
                        onClick={() => handleReject(v)}
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => handleDelete(v)}
                      title="Delete vendor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => setSelected(v)}
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl border bg-card shadow-card-hover">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Vendor Details</DialogTitle>
            <DialogDescription>Full information for the selected vendor.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 pt-2" >

              <div className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">

                {selected.image ? (
                  <img
                    src={`https://eventglow-backend.onrender.com/uploads/${selected.image}`}
                    alt={selected.name}
                    className="h-14 w-14 rounded-full object-cover border shadow-md"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground shadow-md">
                    {selected.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="font-display font-semibold text-foreground truncate">
                    {selected.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selected.email}
                  </div>
                </div>
              </div>

              <div className="grid gap-2.5 text-sm">
                <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />Business Name
                  </span>
                  <span className="font-medium">{selected.business_name || "—"}</span>
                </div>

                <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />Location
                  </span>
                  <span className="font-medium">{selected.location || "—"}</span>
                </div>

                <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />Experience
                  </span>
                  <span className="font-medium">{selected.experience || "—"}</span>
                </div>

                <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />Rating
                  </span>
                  <span className="font-medium">
                    {selected.rating ? `⭐ ${selected.rating}` : "—"}
                  </span>
                </div>

                <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {getStatusIcon(selected.status)} Status
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>

                <div className="rounded-lg bg-muted/50 px-4 py-2.5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                    <FileText className="h-4 w-4" />Description
                  </div>
                  <div className="font-medium">{selected.description || "—"}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
