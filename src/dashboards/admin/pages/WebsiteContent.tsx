import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Pencil, Save, X, Image as ImageIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { confirmToast } from "@/lib/confirmToast";
import {
  type Banner,
  type TeamMember,
  type AboutContent,
} from "@/lib/siteContent";
import axios from "axios";

const emptyBanner = (): Banner => ({
  id: "",
  title: "",
  subtitle: "",
  image: "",
  ctaText: "",
  ctaLink: "",
});

export default function WebsiteContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerDraft, setBannerDraft] = useState<Banner | null>(null);
  const [editingBanner, setEditingBanner] = useState(false);
  const [loading, setLoading] = useState(true);

  const [about, setAbout] = useState<AboutContent>({
    storyTitle: "",
    storyDescription: "",
    teamTitle: "",
    teamSubtitle: "",
    team: [],
  });
  const [storyDraft, setStoryDraft] = useState<{ storyTitle: string; storyDescription: string } | null>(null);
  const [editingStory, setEditingStory] = useState(false);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberDraft, setMemberDraft] = useState<TeamMember | null>(null);

  // Add member form (always-empty by default)
  const [newMember, setNewMember] = useState<{ name: string; role: string; initials: string }>({
    name: "",
    role: "",
    initials: "",
  });

  const API_URL = "https://eventglow-backend.onrender.com/api/about";
  const BANNER_API = "https://eventglow-backend.onrender.com/api/banner";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchAbout(),
          fetchBanner(),
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await axios.get(API_URL);

      const aboutData = res.data.about;

      if (aboutData?.id) {
        fetchTeam();
      }

      setAbout((prev) => ({
        ...prev,
        id: aboutData.id?.toString(),
        storyTitle: aboutData.title || "",
        storyDescription: aboutData.description || "",
      }));

    } catch (error) {
      console.log(error);
      toast.error("Failed to load about content");
    }
  };

  const fetchBanner = async () => {
    try {
      const res = await axios.get(BANNER_API);

      const bannerData = Array.isArray(res.data)
        ? res.data[0]
        : res.data;

      if (bannerData) {

        const formattedBanner: Banner = {
          id: res.data.id?.toString() || "",
          title: res.data.title || "",
          subtitle: res.data.description || "",
          image: res.data.image_url || "",
          ctaText: "",
          ctaLink: "",
        };

        setBanners([formattedBanner]);
      }

    } catch (error) {
      console.log(error);
      toast.error("Failed to load banner");
    }
  };

  const fetchTeam = async () => {
    try {

      const res = await axios.get(`${API_URL}/team`);

      const formattedTeam = res.data.map((member: any) => ({
        id: member.id.toString(),
        name: member.name,
        role: member.role,
        initials: member.initials,
      }));

      setAbout((prev) => ({
        ...prev,
        team: formattedTeam,
      }));

    } catch (error) {
      console.log(error);
      toast.error("Failed to load team");
    }
  };

  // ---------- BANNER ----------
  const currentBanner: Banner | null = banners[0] ?? null;

  const startEditBanner = () => {
    setBannerDraft(currentBanner ? { ...currentBanner } : emptyBanner());
    setEditingBanner(true);
  };

  const cancelEditBanner = () => {
    setBannerDraft(null);
    setEditingBanner(false);
  };

  const saveBanner = async () => {

    if (!bannerDraft) return;

    if (!bannerDraft.title.trim() || !bannerDraft.image.trim()) {
      toast.error("Title and image URL are required");
      return;
    }

    try {

      const token = localStorage.getItem("token");

      // UPDATE
      if (bannerDraft.id) {

        await axios.put(
          `${BANNER_API}/${bannerDraft.id}`,
          {
            title: bannerDraft.title,
            description: bannerDraft.subtitle,
            image_url: bannerDraft.image,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Banner updated");

      }

      // CREATE
      else {

        const res = await axios.post(
          BANNER_API,
          {
            title: bannerDraft.title,
            description: bannerDraft.subtitle,
            image_url: bannerDraft.image,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newBanner = {
          ...bannerDraft,
          id: res.data.id?.toString(),
        };

        setBanners([newBanner]);

        toast.success("Banner added");
      }

      setEditingBanner(false);
      setBannerDraft(null);

    } catch (error) {
      console.log(error);
      toast.error("Failed to save banner");
    }
  };

  const deleteBanner = () => {

    if (!currentBanner) return;

    confirmToast({
      message: "Delete banner?",
      confirmLabel: "Delete",
      variant: "destructive",

      onConfirm: async () => {

        try {

          const token = localStorage.getItem("token");

          await axios.delete(
            `${BANNER_API}/${currentBanner.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );  

          setBanners([]);

          toast.success("Banner deleted");

        } catch (error) {
          console.log(error);
          toast.error("Failed to delete banner");
        }
      },
    });
  };

  // ---------- ABOUT: STORY ----------
  const startEditStory = () => {
    setStoryDraft({ storyTitle: about.storyTitle, storyDescription: about.storyDescription });
    setEditingStory(true);
  };

  const cancelEditStory = () => {
    setStoryDraft(null);
    setEditingStory(false);
  };

  const saveStory = async () => {

    if (!storyDraft) return;

    try {

      const token = localStorage.getItem("token");

      // UPDATE
      if (about.id) {

        await axios.put(
          `${API_URL}/${about.id}`,
          {
            title: storyDraft.storyTitle,
            description: storyDraft.storyDescription,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("About updated");
      }

      // CREATE
      else {

        const res = await axios.post(
          API_URL,
          {
            title: storyDraft.storyTitle,
            description: storyDraft.storyDescription,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAbout((prev) => ({
          ...prev,
          id: res.data.id?.toString(),
        }));

        toast.success("About added");
      }

      setAbout((prev) => ({
        ...prev,
        storyTitle: storyDraft.storyTitle,
        storyDescription: storyDraft.storyDescription,
      }));

      setEditingStory(false);
      setStoryDraft(null);

    } catch (error) {
      console.log(error);
      toast.error("Failed to save about");
    }
  };

  const deleteAbout = () => {

    if (!about.id) return;

    confirmToast({
      message: "Delete about content?",
      confirmLabel: "Delete",
      variant: "destructive",

      onConfirm: async () => {

        try {

          const token = localStorage.getItem("token");

          await axios.delete(
            `${API_URL}/${about.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );  

          setAbout({
            id: "",
            storyTitle: "",
            storyDescription: "",
            teamTitle: "",
            teamSubtitle: "",
            team: [],
          });

          toast.success("About deleted");

        } catch (error) {
          console.log(error);
          toast.error("Failed to delete about");
        }
      },
    });
  };

  // ---------- ABOUT: TEAM ----------
  const startEditMember = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setMemberDraft({ ...m });
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setMemberDraft(null);
  };

  const saveMember = async () => {

    if (!memberDraft) return;

    try {

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/team/${memberDraft.id}`,
        {
          name: memberDraft.name,
          role: memberDraft.role,
          initials: memberDraft.initials,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchTeam();

      cancelEditMember();

      toast.success("Member updated");

    } catch (error) {
      console.log(error);
      toast.error("Failed to update member");
    }
  };

  const removeMember = (id: string) => {

    confirmToast({
      message: "Delete team member?",
      confirmLabel: "Delete",
      variant: "destructive",

      onConfirm: async () => {

        try {
          const token = localStorage.getItem("token");

          await axios.delete(
            `${API_URL}/team/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          fetchTeam();

          toast.success("Member removed");

        } catch (error) {
          console.log(error);
          toast.error("Failed to delete member");
        }

      },
    });
  };

  const addMember = async () => {

    if (!newMember.name.trim() || !newMember.role.trim()) {
      toast.error("Please fill name and role");
      return;
    }

    try {

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/team`,
        {
          name: newMember.name,
          role: newMember.role,
          initials:
            newMember.initials ||
            newMember.name.charAt(0).toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchTeam();

      setNewMember({
        name: "",
        role: "",
        initials: "",
      });

      toast.success("Member added");

    } catch (error) {
      console.log(error);
      toast.error("Failed to add member");
    }
  };

  const hasAbout = Boolean(
    about.id ||
    about.storyTitle ||
    about.storyDescription
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading website content...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Manage Website</h2>
        <p className="text-sm text-muted-foreground">Manage public-facing content (home banner & about page).</p>
      </div>

      <Tabs defaultValue="banner" className="w-full">
        <TabsList>
          <TabsTrigger value="banner" className="gap-2"><ImageIcon className="h-4 w-4" /> Home Banner</TabsTrigger>
          <TabsTrigger value="about" className="gap-2"><Users className="h-4 w-4" /> About Page</TabsTrigger>
        </TabsList>

        {/* ============ BANNER TAB ============ */}
         <TabsContent value="banner" className="mt-6">

          {/* NO BANNER */}
          {!currentBanner && !editingBanner && (
            <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              <h3 className="font-display text-xl font-semibold text-card-foreground">
                Home Banner
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Right now there is no banner set.
              </p>

              <Button
                onClick={startEditBanner}
                className="mt-6 gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Banner
              </Button>
            </div>
          )}

          {/* SHOW BANNER */}
          {currentBanner && !editingBanner && (
            <div className="overflow-hidden rounded-2xl border bg-card shadow-card">

              <div className="relative aspect-[16/7] overflow-hidden bg-muted">
                <img
                  src={currentBanner.image}
                  alt={currentBanner.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="font-display text-3xl font-bold">
                    {currentBanner.title}
                  </h3>

                  {currentBanner.subtitle && (
                    <p className="mt-2 max-w-2xl text-sm text-white/90">
                      {currentBanner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4">
                <Button
                  className="gradient-primary text-primary-foreground"
                  size="icon" 
                  variant="ghost"
                  onClick={startEditBanner}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={deleteBanner}
                  className="border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* EDITING */}
          {editingBanner && bannerDraft && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border bg-card p-6 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-card-foreground">
                  {currentBanner ? "Edit Banner" : "Add Banner"}
                </h3>
        
                <button
                  onClick={cancelEditBanner}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Banner Title"
                  value={bannerDraft.title}
                  onChange={(e) =>
                    setBannerDraft({
                      ...bannerDraft,
                      title: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="Image URL"
                  value={bannerDraft.image}
                  onChange={(e) =>
                    setBannerDraft({
                      ...bannerDraft,
                      image: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="CTA Text"
                  value={bannerDraft.ctaText}
                  onChange={(e) =>
                    setBannerDraft({
                      ...bannerDraft,
                      ctaText: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="CTA Link"
                  value={bannerDraft.ctaLink}
                  onChange={(e) =>
                    setBannerDraft({
                      ...bannerDraft,
                      ctaLink: e.target.value,
                    })
                  }
                />
              </div>

              <Textarea
                rows={4}
                placeholder="Banner Description"
                value={bannerDraft.subtitle}
                onChange={(e) =>
                  setBannerDraft({
                    ...bannerDraft,
                    subtitle: e.target.value,
                  })
                }
              />

              <div className="flex justify-end gap-3">
                <Button className="hover:bg-muted hover:text-foreground hover:border-border" variant="outline" onClick={cancelEditBanner}>
                  Cancel
                </Button>

                <Button
                  onClick={saveBanner}
                  className="gradient-primary text-primary-foreground"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </motion.div>
          )}

        </TabsContent>

        {/* ============ ABOUT TAB ============ */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {/* NO ABOUT */}
          {!hasAbout && !editingStory && (
            <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center">
              <h3 className="font-display text-xl font-semibold text-card-foreground">
                About Section
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Right now there is no about content.
              </p>

              <Button
                onClick={startEditStory}
                className="mt-6 gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Add About
              </Button>
            </div>
          )}

          {/* ABOUT EXISTS */}
          {(hasAbout || editingStory) && (
            <div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold text-card-foreground">Our Story</h3>
                {!editingStory && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={startEditStory} className="gradient-primary text-primary-foreground">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={deleteAbout}
                      className="border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>  
                  </div>
                )}
              </div>

              {editingStory && storyDraft ? (
                <>
                  <Input
                    placeholder="Section title"
                    value={storyDraft.storyTitle}
                    onChange={(e) => setStoryDraft({ ...storyDraft, storyTitle: e.target.value })}
                  />
                  <Textarea
                    rows={5}
                    placeholder="Description"
                    value={storyDraft.storyDescription}
                    onChange={(e) => setStoryDraft({ ...storyDraft, storyDescription: e.target.value })}
                  />
                  <div className="flex justify-end gap-2">
                    <Button className="hover:bg-muted hover:text-foreground hover:border-border" variant="outline" size="sm" onClick={cancelEditStory}>Cancel</Button>
                    <Button size="sm" onClick={saveStory} className="gradient-primary text-primary-foreground">
                      <Save className="h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-display text-base font-semibold text-card-foreground">{about.storyTitle}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{about.storyDescription}</p>
                </>
              )}
            </div>
          )}

          {/* OUR TEAM */}
          {hasAbout && (<div className="rounded-xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-display text-lg font-semibold text-card-foreground">Our Team</h3>

            {/* Members list */}
            <div className="space-y-3">
              {about.team.map((m) => {
                const isEditing = editingMemberId === m.id && memberDraft;
                return (
                  <div key={m.id} className="rounded-lg border bg-muted/30 p-3">
                    {isEditing ? (
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                        <Input
                          placeholder="Name"
                          value={memberDraft!.name}
                          onChange={(e) => setMemberDraft({ ...memberDraft!, name: e.target.value })}
                        />
                        <Input
                          placeholder="Role"
                          value={memberDraft!.role}
                          onChange={(e) => setMemberDraft({ ...memberDraft!, role: e.target.value })}
                        />
                        <Input
                          placeholder="Initials"
                          value={memberDraft!.initials}
                          onChange={(e) => setMemberDraft({ ...memberDraft!, initials: e.target.value })}
                        />
                        <div className="flex items-center gap-1">
                          <Button size="sm" onClick={saveMember} className="gradient-primary text-primary-foreground">
                            <Save className="h-4 w-4" /> Save
                          </Button>
                          <Button className="hover:bg-muted hover:text-foreground hover:border-border" size="icon" variant="ghost" onClick={cancelEditMember} aria-label="Cancel">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                            {m.initials || m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-card-foreground">{m.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button className="hover:bg-muted hover:text-foreground hover:border-border" size="sm" variant="outline" onClick={() => startEditMember(m)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" className="border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive" onClick={() => removeMember(m.id)}>
                            <Trash2 className="h-3 w-3" /> 
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {about.team.length === 0 && (
                <p className="text-sm text-muted-foreground">No team members yet.</p>
              )}
            </div>

            {/* Add member form (always empty by default) */}
            <div className="rounded-lg border border-dashed bg-background p-3 space-y-3">
              <p className="text-sm font-medium text-card-foreground">Add Member</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_auto]">
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
                <Input
                  placeholder="Role"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                />
                <Input
                  placeholder="Initials"
                  value={newMember.initials}
                  onChange={(e) => setNewMember({ ...newMember, initials: e.target.value })}
                />
                <Button onClick={addMember} className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </div>)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
