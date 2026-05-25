import { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, Calendar, Activity, User as UserIcon, Trash2, Phone } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { confirmToast } from "@/lib/confirmToast";
import { toast } from "sonner";

interface User {
  id: number;
  fullname: string;
  email: string;
  image?: string;
  phone?: string;
  role: string;
  events: 0;
  created_at: string;
  status: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<User | null>(null);
  const filters = ["All", "Active", "Inactive"];
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = users.filter((u) => {
    const matchStatus = 
      activeFilter === "All" || 
        u.status?.toLowerCase() === activeFilter.toLowerCase();

    const matchSearch = 
      !search || 
        u.fullname.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())

    return matchSearch && matchStatus;
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("token");

        const res = await fetch("https://eventglow-backend.onrender.com/api/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.log("Error fetching users", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleView = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://eventglow-backend.onrender.com/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.log("Error fetching user", err);
    }
  };

  const handleDelete = (u: User) => {
    confirmToast({
      message: "Are you sure you want to delete?",
      description: `${u.fullname} will be permanently removed.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try { 
          const token = localStorage.getItem("token");
          
          const res = await fetch(`https://eventglow-backend.onrender.com/api/users/${u.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if(!res.ok) {
            throw new Error(data.message || "Delete failed");
          }

          setUsers((prev) => prev.filter((x) => x.id !== u.id));
          toast.success("User deleted successfully");
        } catch(err: any) {
          console.log("Delete error:", err);
          toast.error(err.message || "Something went wrong");
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Manage Users</h2>
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Joined</TableHead>
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
                  Loading Users...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
            ) : filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium text-foreground">{u.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
    
                    {u.image ? (
                      <img
                        src={`https://eventglow-backend.onrender.com/uploads/${u.image}`}
                        alt={u.fullname}
                        className="h-10 w-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                        {u.fullname.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="font-medium text-foreground">{u.fullname}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{u.events || 0}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString("en-CA")}</TableCell>
                <TableCell>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    u.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    {u.status || "Active"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleView(u.id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                      onClick={() => handleDelete(u)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle className="font-display text-lg">User Details</DialogTitle>
            <DialogDescription>Full information for the selected user.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 rounded-xl border bg-muted/40 p-4">
                {selected.image ? (
                  <img
                    src={`https://eventglow-backend.onrender.com/uploads/${selected.image}`}
                    alt={selected.fullname}
                    className="h-14 w-14 rounded-full object-cover border shadow-md"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground shadow-md">
                    {selected.fullname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-display font-semibold text-foreground truncate">{selected.fullname}</div>
                  <div className="text-xs text-muted-foreground">{selected.id}</div>
                </div>
              </div>
              <div className="grid gap-2.5 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" /> Email
                  </span>
                  <span className="font-medium text-foreground truncate">{selected.email}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" /> Phone No.
                  </span>
                  <span className="font-medium text-foreground truncate">{selected.phone}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Joined
                  </span>
                  <span className="font-medium text-foreground">{new Date(selected.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" /> Events
                  </span>
                  <span className="font-medium text-foreground">{selected.events}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <UserIcon className="h-4 w-4" /> Status
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    selected.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    {selected.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
