import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { updateUser } = useApp();

  const [business_name, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("https://eventglow-backend.onrender.com/api/vendors/complete-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_name,
          location,
          description,
          experience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save profile");
        return;
      }

      updateUser({
        profile_completed: 1,
        business_name,
        location,
        description,
        experience,
      });

      toast.success("Profile completed successfully!");
      navigate("/vendor");

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Complete Your Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Fill these details to start using your vendor dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={business_name}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your service"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Experience</label>
              <Input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 3 years"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full gradient-primary text-primary-foreground"
            >
              Save & Continue
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}