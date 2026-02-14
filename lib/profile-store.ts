export interface ProfileLink {
  label: string;
  url: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

export interface UserProfile {
  username: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  otherLinks: ProfileLink[];
  experience: ExperienceItem[];
  skills: string[];
  education: EducationItem[];
  resumeUrl: string;
}

const defaultProfile: UserProfile = {
  username: "",
  email: "",
  phone: "",
  githubUrl: "",
  linkedinUrl: "",
  otherLinks: [],
  experience: [],
  skills: [],
  education: [],
  resumeUrl: "",
};

const STORAGE_KEY = "hireu_profile";

function getKey(userId: string) {
  return `${STORAGE_KEY}_${userId}`;
}

export function getStoredProfile(userId: string): UserProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return { ...defaultProfile };
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return { ...defaultProfile, ...parsed };
  } catch {
    return { ...defaultProfile };
  }
}

export function saveProfile(userId: string, profile: Partial<UserProfile>): void {
  if (typeof window === "undefined") return;
  const current = getStoredProfile(userId);
  const merged = { ...current, ...profile };
  localStorage.setItem(getKey(userId), JSON.stringify(merged));
}
