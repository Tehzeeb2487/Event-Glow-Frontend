import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApp } from "@/contexts/AppContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, PhoneCall } from "lucide-react";
import { confirmToast } from "@/lib/confirmToast";

const statusStyle: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  contacted: "bg-primary/10 text-primary",
  pending: "bg-warning/10 text-warning",
};

export default function ManageEvents() {
  const { events, setUserEvents } = useApp();
  const filters = ["All", "pending", "contacted", "confirmed"];
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filteredEvents = events.filter((e) => {
    const matchStatus =
      activeFilter === "All" ||
      e.status?.toLowerCase() === activeFilter.toLowerCase();

    const userName = String(e.user || "").toLowerCase();
    const eventName = String(e.name || "").toLowerCase();
    const searchText = search.toLowerCase();

    const matchSearch =
      !search ||
        eventName.includes(searchText) ||
        userName.includes(searchText);

    return matchStatus && matchSearch;
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://eventglow-backend.onrender.com/api/events/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserEvents(
          (res.data.data || []).map((e: any) => ({
            id: e.id.toString(),
            user: e.fullname,
            name: e.name,
            type: e.event_type,
            date: e.event_date,
            budget: Number(e.budget),
            guests: Number(e.guests),
            createdAt: e.created_at || "",
            status: e.status || "Pending",
          }))
        );

      } catch (err) {
        console.log(err);
        toast.error("Failed to load events");
      }
    };

    fetchEvents();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: "pending" | "contacted" | "confirmed"
  ) => {

    const actionText =
      status === "contacted"
        ? "mark as contacted"
        : "confirm this event";

    confirmToast({
      message: `Are you sure you want to ${actionText}?`,
      description:
        status === "contacted"
          ? "Customer will be marked as contacted."
          : "Event booking will be confirmed.",
      confirmLabel:
        status === "contacted"
          ? "Contact"
          : "Confirm",

      onConfirm: async () => {

        try {

          const token = localStorage.getItem("token");

          await axios.put(
            `https://eventglow-backend.onrender.com/api/events/status/${id}`,
            { status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setUserEvents(
            events.map((event) =>
              event.id === id
                ? { ...event, status }
                : event
            )
          );

          toast.success(
            status === "contacted"
              ? "Event marked as contacted"
              : "Event confirmed successfully"
          );

        } catch (err) {

          console.log(err);

          toast.error("Failed to update status");

        }

      },
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Manage Events</h2>

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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 
            ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
            ) : filteredEvents.map((e) => {
              const rawStatus = e.status || "pending";
              const formatStatus = (status?: string) => {
                if (!status) return "Active";
                return status.charAt(0).toUpperCase() + status.slice(1);
              };
              const formattedStatus = formatStatus(e.status);
              return (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-foreground">{e.id}</TableCell>
                  <TableCell>{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.user}</TableCell>
                  <TableCell>{e.type}</TableCell>
                  <TableCell>₹{e.budget}</TableCell>
                  <TableCell>{e.date ? new Date(e.date).toLocaleDateString("en-CA") : "-"}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[rawStatus]}`}>
                      {formattedStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">

                      {rawStatus !== "contacted" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleStatusChange(e.id, "contacted")}
                          title="Mark as Contacted"
                        >
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                      )}

                      {rawStatus !== "confirmed" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-success hover:bg-success/10 hover:text-success"
                          onClick={() => handleStatusChange(e.id, "confirmed")}
                          title="Confirm Event"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                    </div>
                  </TableCell>
                </TableRow>
              )}
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
