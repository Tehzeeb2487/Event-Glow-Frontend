import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Save, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { confirmToast } from "@/lib/confirmToast";

export default function VendorProfile() {
  const { user, updateUser, deleteAccount, loading } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Vendor Demo");
  const [phone, setPhone] = useState(user?.phone || "");
  const [business, setBusiness] = useState(user?.business_name || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email);
  const [description, setDescription] = useState(user?.description || "");
  const [location, setLocation] = useState(user?.location || "");
  const [experience, setExperience] = useState(user?.experience || "");

  if (loading) {
    return (
      <div className="flex item-center justify-center h-[60vh]">
        <p>Loading...</p>
      </div>
    )
  }

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || null);

      setBusiness(user.business_name || "");
      setDescription(user.description || "");
      setLocation(user.location || "");
      setExperience(user.experience || "");
    }
  }, [user]);

  const handleImageUpload = async (file: File) => {
    const token = localStorage.getItem("token");
  
    const formData = new FormData();
    formData.append("image", file);
  
    const res = await fetch("https://eventglow-backend.onrender.com/api/auth/profile/image", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  
    const data = await res.json();
  
    if (res.ok) {
      const imageUrl = `https://eventglow-backend.onrender.com/uploads/${data.image}`;
  
      updateUser({
        avatar: imageUrl,
      });
  
      setAvatar(imageUrl);
        
      toast.success("Image updated");
    } else {
      toast.error("Image upload failed");
    }
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDeleteImage = () => {
    confirmToast({
      message: "Remove profile image?",
      confirmLabel: "Remove",
      variant: "destructive",
      onConfirm: async () => {
        const token = localStorage.getItem("token");

        const res = await fetch("https://eventglow-backend.onrender.com/api/auth/profile/image", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setAvatar(null);
          updateUser({ avatar: undefined });
          toast.success("Image deleted");
        } else {
          toast.error(data.message || "Delete failed");
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`https://eventglow-backend.onrender.com/api/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullname: name,
          phone: phone, 
          email: email,
          // for vendor
          business_name: business,
          description: description,
          location: location,
          experience: experience
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Update failed");
        return;
      }

      // ✅ UI update
      updateUser({
        name,
        phone,
        email,
        avatar: avatar || undefined,

        business_name: business,
        description: description,
        location: location,
        experience: experience,
      });

      toast.success("Profile updated successfully!");
      setEditing(false);

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleCancel = () => {
    if (loading || !user) {
      return <p>Loading...</p>
    }

    setName(user.name || "");
    setPhone(user.phone || "");
    setEmail(user.email || "");
    setAvatar(user.avatar || null);

    // 👇 vendor fields reset too
    setBusiness(user.business_name || "");
    setDescription(user.description || "");
    setLocation(user.location || "");
    setExperience(user.experience || "");

    setEditing(false);
  };

  const handleDelete = () => {
    confirmToast({
      message: "Are you sure you want to delete your account?",
      description: "This action is permanent and cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        const token = localStorage.getItem("token");

        try {
          const res = await fetch("https://eventglow-backend.onrender.com/api/auth/delete", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          if(!res.ok) {
            toast.error(data.message || "Delete failed");
            return;
          }

          navigate("/", {replace: true});
          deleteAccount();
          toast.success("Account deleted successfully");
        } catch (err){
          console.error(err);
          toast.error("Server error");
        }
        
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Profile</h2>
        {!editing && (
          <Button variant="outline" onClick={() => setEditing(true)} className="hover:bg-primary/10 hover:text-primary hover:border-primary/40">
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg">
        <div className="rounded-2xl border bg-card p-6 shadow-card space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
                {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : (user?.name?.charAt(0) || "V")}
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-md">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
              )}
              {editing && avatar && (
                <button 
                  onClick={handleDeleteImage}
                  className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:bg-destructive/80"
                >
                  <Trash2 size={16} className="h-4 w-4" />
                </button>
              )}
            </div>
            {!editing && (
              <div className="text-center">
                <p className="font-display text-lg font-semibold text-foreground">{name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            )}
          </div>

          {editing ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Business Name</label>
                <Input value={business} onChange={(e) => setBusiness(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Experience</label>
                <Input value={experience} onChange={(e) => setExperience(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel} className="flex-1 hover:bg-muted hover:text-foreground hover:border-border">Cancel</Button>
                <Button onClick={handleSave} className="flex-1 gradient-primary text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Business</span>
                <span className="text-sm text-right font-medium text-foreground">{business || "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="text-sm text-right font-medium text-foreground">{location || "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm text-right font-medium text-foreground">{description || "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Experience</span>
                <span className="text-sm font-medium text-foreground">{experience || "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium text-foreground">{phone}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Vendor</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
              <p className="mt-1 text-xs text-muted-foreground">Permanently delete your vendor account and all associated data.</p>
            </div>
            <Button variant="outline" onClick={handleDelete} className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete Account
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
