export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  image?: string;
}

export interface AboutContent {
  id?: string;
  storyTitle: string;
  storyDescription: string;
  teamTitle: string;
  teamSubtitle: string;
  team: TeamMember[];
}

// TEMPORARY localStorage for banner only

const BANNERS_KEY = "eg_banners";

export function getBanners(): Banner[] {
  try {
    const raw = localStorage.getItem(BANNERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBanners(banners: Banner[]) {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
}