import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  location: string;
  features: string[]; 
}

export default function Services() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

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
    fetch("https://eventglow-backend.onrender.com/api/services/all")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((s: any) => ({
          ...s,
          features: parseFeatures(s.features)
        }));
        setServices(formatted);
        setLoading(false);
        console.log(formatted)
      })
      .catch(err => {
        console.error(err)
        setLoading(false);
      });
  }, []);

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
          <h1 className="font-display text-4xl font-bold text-primary-foreground">Our Services</h1>
          <p className="mt-2 text-primary-foreground/80">Comprehensive event planning solutions for every occasion</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-card-hover">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={s.image_url} alt={s.title} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs text-primary font-medium">{s.category}</p>
                <h3 className="font-display text-lg font-semibold text-card-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.features.map((f) => (
                    <span key={f} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{f}</span>
                  ))}
                </div>
                <Link to="/contact" className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline">
                  Book Now <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
