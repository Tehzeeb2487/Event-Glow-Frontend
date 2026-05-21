import { motion } from "framer-motion";
import { Heart, Users, Award, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const iconMap: any = {
  "Events Planned": Calendar,
  "Happy Clients": Users,
  "Approved Vendors": Award,
  "Reviews": Heart,
};

export default function About() {

  const [about, setAbout] = useState<any>({});
  const [stats, setStats] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);

  useEffect(() => {
    fetchAbout();
    fetchTeam();
  }, []);

  const fetchAbout = async () => {
    try {

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/about"
      );

      setAbout(res.data.about);
      setStats(res.data.stats);

    } catch(err) {
      console.log(err);
    }
  }

  const fetchTeam = async () => {
    try {

      const res = await axios.get(
        "https://eventglow-backend.onrender.com/api/about/team"
      );

      setTeam(res.data);

    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div>
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">About EventGlow</h1>
          <p className="mt-2 text-primary-foreground/80">Crafting celebrations that last a lifetime</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">{about.title}</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {about.description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border bg-card p-6 text-center shadow-card">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {
                    (() => {
                      const Icon = iconMap[s.title];
                      return <Icon className="h-6 w-6"/>
                    })()
                  }
                </div>
                <p className="font-display text-3xl font-bold text-foreground">{s.value}0+</p>
                <p className="text-sm text-muted-foreground">{s.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Our Team</h2>
          <p className="mt-2 text-muted-foreground">Meet the people behind your perfect events</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card p-6 text-center shadow-card transition-shadow hover:shadow-card-hover">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
                {m.initials}
              </div>
              <h3 className="font-display text-base font-semibold text-card-foreground">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
