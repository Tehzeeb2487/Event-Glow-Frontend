import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">EventGlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">Making every celebration unforgettable with smart planning and budget optimization.</p>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {["Services", "Vendors", "Gallery", "About"].map((l) => (
                <Link key={l} to={`/${l.toLowerCase()}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Services</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>Wedding Planning</span>
              <span>Birthday Events</span>
              <span>Corporate Events</span>
              <span>Budget Optimization</span>
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@eventglow.in</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Mumbai, India</span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EventGlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
