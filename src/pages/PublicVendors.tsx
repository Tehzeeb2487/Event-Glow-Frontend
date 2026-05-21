import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, Building2, UtensilsCrossed, Flower2, Camera, Music4, Star, CarFront } from "lucide-react";

const categories = ["All", "Venue", "Catering", "Decoration", "Photography", "Music & DJ", "Transport"];
const iconMap: any = {
  Venue: Building2,
  Catering: UtensilsCrossed,
  Decoration: Flower2,
  Photography: Camera,
  "Music & DJ": Music4,
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

export default function PublicVendors() {
  const [filter, setFilter] = useState("All");
  const [vendors, setVendors] = useState<any[]>([]);
  const filtered =
  filter === "All"
    ? vendors
    : vendors.filter((v) => {
        const categoriesList = typeof v.categories === "string"
          ? v.categories.split(",").map((c: string) => c.trim())
          : [];

        return categoriesList.includes(filter);
      });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchVendors();
  }, [])

  const fetchVendors = async () => {
    try {
      const res = await axios.get("https://eventglow-backend.onrender.com/api/vendors/public");
      setVendors(res.data);
    } catch(err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">Our Vendors</h1>
          <p className="mt-2 text-primary-foreground/80">Handpicked professionals for your special day</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === c ? "gradient-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:bg-muted"
              }`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v, i) => {
            const categoriesList = typeof v.categories === "string"
              ? v.categories.split(",").map((c: string) => c.trim())
              : [];

            const mainCategory = categoriesList[0] || "Venue";
            const Icon = iconMap[mainCategory] || Building2;
            const color = colorMap[mainCategory] || "bg-primary/10 text-primary";
            const isCatering = mainCategory === "Catering";
            const expColor = 
              v.experience >= 10 
                ? "bg-green-100 text-green-700"
                :v.experience >=5
                ? "bg-warning/10 text-warning"
                : "bg-muted text-muted-foreground"

            return (<motion.div key={v.business_name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
              <div className={`relative mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl ${color}`}>
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-background/40 blur-2xl" />
                <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-background/30 blur-3xl" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background/80 shadow-card">
                  <Icon className="h-9 w-9" />
                </div>
              </div>
              <div className="mb-3 flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-card-foreground">{v.business_name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> 
                      {mainCategory || "Venue"} · {v.location}
                  </p>
                </div>
              </div>
              <div className="mb-2">
                {v.experience && (
                  <span className={`text-xs px-2.5 py-1 rounded-full ${expColor}`}>
                    {v.experience} yrs exp
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold text-foreground">
                  ₹{v.starting_price 
                    ? Number(v.starting_price).toLocaleString() 
                    : "N/A"}
                  {isCatering && "/plate"}
                </p>
                <span className="flex items-center gap-1 text-xs font-semibold text-warning">
                  <Star className="h-3.5 w-3.5 fill-current" /> {v.rating ? Number(v.rating).toFixed(1) : "N/A"}
                </span>
              </div>
            </motion.div>)
          })}
        </div>
      </section>
    </div>
  );
}
