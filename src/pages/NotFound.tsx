import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
          <Heart className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-lg text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-6 inline-block rounded-lg gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          Go Home
        </Link>
      </div>
    </div>
  );
}
