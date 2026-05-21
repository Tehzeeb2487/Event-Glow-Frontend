import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Heart, CalendarDays, Sparkles, ArrowRight, Star, ChevronLeft, ChevronRight, MapPin, Building2, UtensilsCrossed, Flower2, Camera, Music4, CarFront } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import heroImg from "@/assets/hero-wedding.jpg";
import { useState, useEffect } from "react";
import axios from "axios";

interface Banner {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

interface Review {
  id: number;
  booking_id: number;
  rating: number;
  comment: string;
  user_name: string; 
  vendor_name: string;
}

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  location: string;
}

interface Vendor {
  business_name: string;
  categories: string;
  location: string;
  starting_price: number;
  rating: number;
}

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

const steps = [
  { icon: CalendarDays, title: "Choose Your Event", desc: "Select the type of event you want to plan." },
  { icon: Sparkles, title: "Set Your Budget", desc: "Enter your budget and get smart allocation suggestions." },
  { icon: Heart, title: "Enjoy the Day", desc: "Let us handle the rest while you make memories." },
];

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [testimonialApi, setTestimonialApi] = useState<CarouselApi>();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  useEffect(() => {
    Promise.all([
      fetchVendors(),
      fetchReviews(),
      fetchBanner(),
    ]);
  }, []);



  const fetchVendors = async () => {
    try {
      const res = await axios.get("https://eventglow-backend.onrender.com/api/vendors/public");
      setVendors(res.data);
    } catch(err) {
      console.log(err);
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/reviews"
      );
      setReviews(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBanner = async () => {
    try {
      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/banner/"
      );
      setBanner(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetch("https://eventglow-backend.onrender.com/api/services/all")
      .then(res => res.json())
      .then(data => {
        setServices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      });
  }, []);

  const displayTestimonials = reviews.slice(0, 8).map((r) => ({
    name: r.user_name,
    event: r.vendor_name,
    text: r.comment || "Great experience!",
    rating: r.rating,
  }))

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (!testimonialApi) return;

    const updateActive = () => {
      setActiveTestimonial(testimonialApi.selectedScrollSnap());
    };

    updateActive();

    testimonialApi.on("select", updateActive);

    return () => {
      testimonialApi.off("select", updateActive);
    };
  }, [testimonialApi]);

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={banner?.image_url || heroImg} alt="Banner" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 gradient-hero" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground md:text-6xl">
              {
                banner?.title || (
                  <>
                    Plan Your <span className="italic">Perfect</span> Events
                  </>
                )
              }
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/90 md:text-xl">
              {banner?.description || "Smart event planning with intelligent budget optimization. From weddings to corporate gatherings — we make every celebration extraordinary front end."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="rounded-xl bg-primary-foreground px-6 py-3 font-semibold text-primary transition-shadow hover:shadow-lg">
                Get Started <ArrowRight className="ml-2 inline h-4 w-4" />
              </Link>
              <Link to="/services" className="rounded-xl border border-primary-foreground/30 px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Our Services</h2>
          <p className="mt-2 text-muted-foreground">Everything you need for a flawless event</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {services.slice(0, 3).map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-shadow hover:shadow-card-hover">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={s.image_url} alt={s.title} loading="lazy" width={800} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-card-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                <Link to="/services" className="mt-3 inline-flex items-center text-sm font-medium text-primary hover:underline">
                  Learn more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Vendors — Carousel */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Featured Vendors</h2>
              <p className="mt-2 text-muted-foreground">Top-rated professionals for your event</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => scroll("left")} className="flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-muted" aria-label="Scroll left">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => scroll("right")} className="flex h-10 w-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-muted" aria-label="Scroll right">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {vendors.map((v, i) => { 
              const categoriesList = typeof v.categories === "string"
                ? v.categories.split(",").map((c: string) => c.trim())
                : [];
              
              const mainCategory = categoriesList[0] || "Venue";
              const Icon = iconMap[mainCategory] || Building2;
              const color = colorMap[mainCategory] || "bg-primary/10 text-primary";
              const isCatering = mainCategory === "Catering";
              return (
              <motion.div key={v.business_name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="w-72 shrink-0 snap-start rounded-xl border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover">
                <div className={`relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-2xl ${color}`}>
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-background/40 blur-2xl" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-background/80 shadow-card">
                    <Icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
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
              </motion.div>
            )
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <Link to="/vendors" className="inline-flex items-center gap-2 rounded-xl gradient-primary border border-primary/10 px-6 py-3 font-semibold text-primary-foreground shadow-card transition-all hover:shadow-card-hover">
              View All Vendors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
          <p className="mt-2 text-muted-foreground">Three simple steps to your dream event</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                What Our Clients Say
              </h2>
            </div>

            {displayTestimonials.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No reviews yet
              </p>
            ) : (
              <Carousel
                setApi={setTestimonialApi}
                opts={{ align: "start", loop: true }}
                className="mx-auto w-full max-w-6xl"
              >
                <CarouselContent className="-ml-4">
                  {displayTestimonials.map((t, i) => (
                    <CarouselItem
                      key={`${t.name}-${i}`}
                      className="pl-4 md:basis-1/2 lg:basis-1/3"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl border bg-card p-6 shadow-card"
                      >
                        <div className="mb-3 flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`h-4 w-4 ${
                                j < t.rating
                                  ? "fill-current text-warning"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          "{t.text}"
                        </p>

                        <div className="mt-4">
                          <p className="text-sm font-semibold text-foreground">
                            {t.name}
                          </p>

                        <p className="text-xs text-muted-foreground">
                            {t.event}
                          </p>
                        </div>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <CarouselPrevious className="static translate-x-0 translate-y-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" />
        
                  <div className="flex gap-1.5">
                    {displayTestimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => testimonialApi?.scrollTo(i)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          activeTestimonial === i
                            ? "w-6 bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>

                  <CarouselNext className="static translate-x-0 translate-y-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all" />
                </div>
              </Carousel>
            )}
          </div>
        </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="container relative mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">Ready to Plan Your Event?</h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/90">Join thousands of happy clients who planned their perfect events with our smart budget optimizer.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center rounded-xl bg-primary-foreground px-8 py-3 font-semibold text-primary transition-shadow hover:shadow-lg">
            Start Planning Now <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
