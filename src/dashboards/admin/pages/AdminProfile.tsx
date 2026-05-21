import { useState, useEffect } from "react";
import { Camera, Save, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { confirmToast } from "@/lib/confirmToast";

export default function AdminProfile() {
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Admin User");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
      if (user) {
        setEmail(user.email);
        setName(user.name || "");
        setPhone(user.phone || "")
        setAvatar(user.avatar || null);
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
          email: email
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
      });

      toast.success("Profile updated successfully!");
      setEditing(false);

    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  const handleCancel = () => {
    setName(user?.name || "Admin User");
    setPhone(user?.phone || "");
    setEmail(user?.email || "");
    setAvatar(user?.avatar || null);
    setEditing(false);
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
                {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : (user?.name?.charAt(0) || "A")}
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
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
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
                <span className="text-sm text-muted-foreground">Phone</span>
                <span className="text-sm font-medium text-foreground">{phone}</span>
              </div>
              <div className="flex justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">Admin</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
