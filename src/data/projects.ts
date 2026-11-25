import type { Bi } from "../i18n";
import { repoByName } from "./github";

export interface Project {
  id: string;
  repo: string;
  name: Bi;
  kind: Bi;
  desc: Bi;
  tags: string[];
  cover: string;
  shot?: string;
  shotM?: string;
  live?: string;
  color: string;
  contain?: boolean;
}

/** Everything below is taken from each repository's README, package.json / pubspec.yaml and file tree. */
export const projects: Project[] = [
  {
    id: "linkme",
    repo: "LinkMe",
    name: { en: "Link Me", ar: "Link Me" },
    kind: { en: "English-learning platform", ar: "منصة تعلّم الإنجليزية" },
    desc: {
      en: "Teaches English to Egyptians in Egyptian Arabic: two cartoon mentors, an AI pronunciation lab with a 0–100% score, daily streaks, IELTS and Business English tracks, mistake bank and study heatmap.",
      ar: "منصة لتعلّم الإنجليزية باللهجة المصرية: مرشدان كرتونيان، ومعمل نطق بالذكاء الاصطناعي بنسبة من ٠ إلى ١٠٠٪، وشعلة التزام يومية، ومسارات IELTS وإنجليزي الأعمال، وبنك أخطاء وخريطة نشاط.",
    },
    tags: ["React 19", "TypeScript", "tRPC", "Drizzle", "Express", "Docker", "Vercel"],
    cover: "img/cover-linkme.webp",
    shot: "img/shot-linkme.webp",
    shotM: "img/shotm-linkme.webp",
    live: "https://link-me-alpha.vercel.app",
    color: "#4D8DFF",
  },
  {
    id: "firdaws",
    repo: "islamic_prayer_app",
    name: { en: "Firdaws", ar: "الفردوس" },
    kind: { en: "Prayer companion · Flutter", ar: "رفيق الصلاة · Flutter" },
    desc: {
      en: "A calm Arabic RTL app: prayer times, Qibla, Hijri calendar, tasbih, Quran and azkar library, plus a 30-game hall. Native Kotlin services drive the adhan alarms on Android; the web build ships on GitHub Pages.",
      ar: "تطبيق عربي هادئ: مواقيت الصلاة، والقبلة، والتقويم الهجري، والسبحة، ومكتبة القرآن والأذكار، وقاعة بها ٣٠ لعبة. خدمات Kotlin الأصلية تشغّل تنبيهات الأذان على أندرويد، ونسخة الويب منشورة على GitHub Pages.",
    },
    tags: ["Flutter", "Dart", "Kotlin", "GitHub Actions", "GitHub Pages"],
    cover: "img/cover-firdaws.webp",
    shot: "img/shot-firdaws.webp",
    shotM: "img/shotm-firdaws.webp",
    live: "https://walidelsayedgemini-dev.github.io/islamic_prayer_app/",
    color: "#2DD4A8",
  },
  {
    id: "lastthread",
    repo: "the-last-thread",
    name: { en: "The Last Thread", ar: "الخيط الأخير" },
    kind: { en: "Noir detective game", ar: "لعبة تحقيق نوار" },
    desc: {
      en: "A click-and-explore noir game set in Abis and Alexandria: your uncle vanished and left a red thread on the door. Fully Arabic, Egyptian dialogue, interactive map — playable in the browser and packaged as an Android APK with Capacitor.",
      ar: "لعبة تحقيق نوار بأسلوب النقر والاستكشاف في أبيس والإسكندرية: خالك اختفى وترك خيطًا أحمر على الباب. بالعربية الكاملة وبالعامية المصرية، وخريطة تفاعلية — تعمل في المتصفح وكتطبيق أندرويد APK عبر Capacitor.",
    },
    tags: ["TypeScript", "Vite", "Three.js", "Capacitor", "Vitest", "Playwright"],
    cover: "img/cover-lastthread.webp",
    shot: "img/shot-lastthread.webp",
    shotM: "img/shotm-lastthread.webp",
    live: "https://walidelsayedgemini-dev.github.io/the-last-thread/",
    color: "#FF4D5E",
  },
  {
    id: "cheese",
    repo: "who-ate-the-cheese",
    name: { en: "Who Ate the Cheese?", ar: "مين أكل الجبنة؟" },
    kind: { en: "Party game · PWA + Android", ar: "لعبة جماعية · PWA وأندرويد" },
    desc: {
      en: "Pass one phone around and catch the mouse who ate the cheese. Mobile-first social deduction in Egyptian Arabic and English, fully offline, with 3D characters, QR content packs and themes — now at v1.12.",
      ar: "لمّوا الصحاب على موبايل واحد وقفّشوا الفار اللي أكل الجبنة. لعبة استنتاج اجتماعي بالمصري والإنجليزي، بدون إنترنت، بشخصيات ثلاثية الأبعاد وحزم محتوى بـ QR وثيمات — الإصدار ١٫١٢.",
    },
    tags: ["React", "Zustand", "Framer Motion", "PWA", "Capacitor"],
    cover: "img/cover-cheese.webp",
    color: "#FFC83D",
  },
  {
    id: "arcade",
    repo: "yaseen-arcade",
    name: { en: "Yaseen Arcade", ar: "أركيد ياسين" },
    kind: { en: "10 neon mini-games", ar: "١٠ ألعاب نيون" },
    desc: {
      en: "Ten neon two-player games on one phone — air hockey, sumo, tanks, penalty shootout and more. Offline, ad-free, 60fps, with daily missions, coin shop, a four-player cup and replay video export (v1.6).",
      ar: "عشر ألعاب نيون للاعبين على موبايل واحد — هوكي وسومو ودبابات وضربات جزاء وغيرها. بدون إنترنت وبدون إعلانات و٦٠ إطارًا في الثانية، مع مهام يومية ومتجر عملات وكأس لأربعة لاعبين وتصدير فيديو الإعادة (v1.6).",
    },
    tags: ["React", "TypeScript", "Canvas", "Capacitor", "Framer Motion"],
    cover: "img/cover-arcade.webp",
    color: "#B14DFF",
  },
  {
    id: "ludo",
    repo: "yaseenludo",
    name: { en: "Yaseen Ludo", ar: "ليدو ياسين" },
    kind: { en: "Board game with personality", ar: "لعبة لوحية بشخصية" },
    desc: {
      en: "Ludo with Egyptian characters — a pharaoh, a football captain, a falcon, a grandma — each with 4 expressions, bots with three difficulty levels, board materials, skin trails and cinematic victory scenes.",
      ar: "ليدو بشخصيات مصرية — فرعون وكابتن كرة وصقر وحاجّة — لكل منها ٤ تعبيرات، وبوتات بثلاث مستويات صعوبة، وخامات لوحة، وآثار حركة للـ skins، ومشاهد فوز سينمائية.",
    },
    tags: ["React", "tRPC", "Drizzle", "Zustand", "Framer Motion"],
    cover: "img/cover-ludo.webp",
    color: "#F5A524",
  },
  {
    id: "crime",
    repo: "ysn-crime-files",
    name: { en: "YSN Crime Files", ar: "ملفات ياسين الجنائية" },
    kind: { en: "Noir deduction game", ar: "لعبة استنتاج نوار" },
    desc: {
      en: "An offline noir crime and social-guessing game: killer, fixer and detective roles, a corkboard dossier, interrogation transcripts, mini-games and cinematic transitions — in Arabic and English.",
      ar: "لعبة جريمة وتخمين اجتماعي نوار تعمل بدون إنترنت: أدوار القاتل والمزوّر والمحقق، ولوحة أدلة، ومحاضر استجواب، وألعاب مصغّرة وانتقالات سينمائية — بالعربية والإنجليزية.",
    },
    tags: ["React", "TypeScript", "Zustand", "Tailwind", "PWA"],
    cover: "img/cover-crime.webp",
    color: "#FF2E54",
  },
  {
    id: "fit",
    repo: "ysn-fit",
    name: { en: "YSN Fit", ar: "YSN Fit" },
    kind: { en: "Fitness PWA · offline", ar: "PWA للياقة · بدون إنترنت" },
    desc: {
      en: "A premium offline fitness app: activity rings, interactive front/back muscle map, an animated SVG demo for every exercise, live workout player with voice coach, Egyptian foods database and a 15-badge progress system.",
      ar: "تطبيق لياقة متكامل بدون إنترنت: حلقات النشاط، وخريطة عضلات تفاعلية أمامية وخلفية، وعرض SVG متحرك لكل تمرين، ومشغّل تمرين حي بمدرّب صوتي، وقاعدة أطعمة مصرية ونظام ١٥ شارة.",
    },
    tags: ["React 18", "Vite", "Tailwind v4", "Recharts", "PWA"],
    cover: "img/cover-fit.webp",
    color: "#22D3EE",
  },
  {
    id: "journal",
    repo: "ysn-journal",
    name: { en: "Yaseen Journal", ar: "مفكرة ياسين" },
    kind: { en: "Private journal · PWA", ar: "مفكرة خاصة · PWA" },
    desc: {
      en: "A private offline journal that turns moods into a galaxy of memories: canvas star-field, liquid waves, voice notes with waveforms, time-capsule letters, mood insights and a month-in-review video.",
      ar: "مفكرة خاصة بدون إنترنت تحوّل مزاجك إلى مجرّة من الذكريات: حقل نجوم بالـ Canvas، وأمواج سائلة، وملاحظات صوتية بموجات، ورسائل كبسولة زمن، وتحليلات للمزاج وفيديو ملخّص الشهر.",
    },
    tags: ["React", "Canvas 2D", "IndexedDB", "Recharts", "PWA"],
    cover: "img/cover-journal.webp",
    color: "#8B7CFF",
  },
];

export const projectData = (p: Project) => repoByName(p.repo);

/** Technologies actually found in package.json / pubspec.yaml; counts verified from those files. */
export const techCloud: { name: string; repos?: number }[] = [
  { name: "React", repos: 7 },
  { name: "TypeScript", repos: 8 },
  { name: "Framer Motion", repos: 7 },
  { name: "Zustand", repos: 5 },
  { name: "Recharts", repos: 5 },
  { name: "PWA / Workbox", repos: 5 },
  { name: "Capacitor", repos: 3 },
  { name: "tRPC", repos: 3 },
  { name: "Drizzle ORM", repos: 3 },
  { name: "Express", repos: 3 },
  { name: "Radix UI", repos: 3 },
  { name: "Tailwind CSS" },
  { name: "Vite" },
  { name: "Flutter" },
  { name: "Dart" },
  { name: "Kotlin" },
  { name: "Three.js" },
  { name: "Vitest" },
  { name: "Playwright" },
  { name: "Docker" },
  { name: "GitHub Actions" },
  { name: "GitHub Pages" },
  { name: "Vercel" },
  { name: "MySQL" },
  { name: "Stripe" },
  { name: "Canvas 2D" },
  { name: "Python" },
];
