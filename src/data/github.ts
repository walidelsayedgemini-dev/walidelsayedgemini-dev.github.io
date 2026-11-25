import raw from "./github.generated.json";

export interface RepoData {
  name: string;
  private: boolean;
  url: string;
  homepage: string | null;
  createdAt: string;
  pushedAt: string;
  language: string | null;
  languages: Record<string, number>;
  commits: number;
  commitDates: string[];
  hasPages: boolean;
}

export interface FeedItem {
  repo: string;
  date: string;
  msg: string;
}

export const gh = raw as unknown as {
  generatedAt: string;
  profile: {
    login: string;
    name: string;
    bio: string;
    company: string;
    location: string;
    email: string;
    avatar_url: string;
    html_url: string;
    created_at: string;
    public_repos: number;
    followers: number;
  };
  social: string[];
  repos: RepoData[];
  languages: { name: string; bytes: number }[];
  totalCommits: number;
  days: { date: string; count: number; repos: Record<string, number> }[];
  feed: FeedItem[];
};

export const LOGIN = gh.profile.login;
export const EMAIL = gh.profile.email;
export const FACEBOOK = gh.social.find((s) => s.includes("facebook")) ?? "";
export const repoByName = (n: string) => gh.repos.find((r) => r.name === n)!;

export const totalBytes = gh.languages.reduce((a, l) => a + l.bytes, 0);
export const activeDays = gh.days.length;

/** Palette used for language segments (GitHub-ish hues, tuned for the dark theme). */
export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#4DA3FF",
  Dart: "#2DD4BF",
  CSS: "#B084FF",
  JavaScript: "#FFD84D",
  Python: "#6EE7A0",
  Kotlin: "#FF8A5B",
  HTML: "#FF6B6B",
  "C++": "#F472B6",
  CMake: "#94A3B8",
  Java: "#F59E0B",
};

export const fmtBytes = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round(b / 1e3)} KB`);
