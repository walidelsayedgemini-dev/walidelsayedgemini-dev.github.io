import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type Bi = { en: string; ar: string };

const dict = {
  "nav.work": { en: "Work", ar: "الأعمال" },
  "nav.stack": { en: "Stack", ar: "التقنيات" },
  "nav.timeline": { en: "Timeline", ar: "النشاط" },
  "nav.about": { en: "About", ar: "نبذة" },
  "nav.contact": { en: "Contact", ar: "تواصل" },
  "nav.search": { en: "Search / jump", ar: "بحث / انتقال" },
  "hero.kicker": { en: "Alexandria, Egypt · 31.20°N 29.92°E", ar: "الإسكندرية، مصر · ٣١٫٢٠°ش ٢٩٫٩٢°ق" },
  "hero.first": { en: "WALID", ar: "وليد" },
  "hero.last": { en: "SAYED", ar: "سيد" },
  "hero.intro": {
    en: "ICT teacher who ships. Nine apps and games — in Arabic and English — built on GitHub, from prayer times to noir detective games.",
    ar: "معلّم ICT يبني ويُطلق. تسعة تطبيقات وألعاب — بالعربية والإنجليزية — مبنية على GitHub، من مواقيت الصلاة إلى ألعاب التحقيق النوار.",
  },
  "hero.cta1": { en: "Explore the work", ar: "استكشف الأعمال" },
  "hero.cta2": { en: "GitHub profile", ar: "حساب GitHub" },
  "hero.scroll": { en: "scroll", ar: "مرّر" },
  "hero.hint": { en: "move your mouse — the stars move with you", ar: "حرّك الماوس — النجوم تتحرك معك" },
  "stats.title": { en: "The numbers, straight from GitHub", ar: "الأرقام كما هي من GitHub" },
  "stats.repos": { en: "Repositories", ar: "مستودعات" },
  "stats.repos.sub": { en: "public + private", ar: "عامة + خاصة" },
  "stats.commits": { en: "Commits", ar: "كوميت" },
  "stats.commits.sub": { en: "across every repo", ar: "عبر كل المستودعات" },
  "stats.langs": { en: "Languages", ar: "لغات برمجة" },
  "stats.langs.sub": { en: "detected by GitHub", ar: "رصدها GitHub" },
  "stats.days": { en: "Active days", ar: "أيام نشاط" },
  "stats.days.sub": { en: "days with commits", ar: "أيام فيها commits" },
  "live.on": { en: "LIVE", ar: "مباشر" },
  "live.off": { en: "SNAPSHOT", ar: "نسخة محفوظة" },
  "live.push": { en: "last public push", ar: "آخر push عام" },
  "live.public": { en: "public repos", ar: "مستودعات عامة" },
  "live.synced": { en: "synced", ar: "آخر مزامنة" },
  "work.kicker": { en: "Selected work · 09", ar: "الأعمال · ٠٩" },
  "work.title": { en: "Nine products. One keyboard.", ar: "تسعة منتجات. كيبورد واحد." },
  "work.sub": {
    en: "Every card is a real repository. Keep scrolling — the live ones open in a new tab.",
    ar: "كل بطاقة هي مستودع حقيقي. أكمل التمرير — المنشورة منها تُفتح في تبويب جديد.",
  },
  "work.live": { en: "Live demo", ar: "جرّب المشروع" },
  "work.repo": { en: "Source", ar: "الكود" },
  "work.private": { en: "Private repository", ar: "مستودع خاص" },
  "work.commits": { en: "commits", ar: "commit" },
  "stack.kicker": { en: "Stack · measured, not claimed", ar: "التقنيات · مقاسة لا مُدّعاة" },
  "stack.title": { en: "What the code is actually made of", ar: "مِمَّ يتكوّن الكود فعلًا" },
  "stack.sub": {
    en: "Share of code by bytes, as reported by GitHub across all nine repositories.",
    ar: "نسبة الكود بالبايت كما يحسبها GitHub عبر المستودعات التسعة.",
  },
  "stack.other": { en: "Other", ar: "أخرى" },
  "stack.used": { en: "in", ar: "في" },
  "stack.repos": { en: "repos", ar: "مشاريع" },
  "stack.total": { en: "of code in total", ar: "إجمالي الكود" },
  "tl.kicker": { en: "Timeline · every commit", ar: "الخط الزمني · كل commit" },
  "tl.title": { en: "Sixteen days of building", ar: "ستة عشر يومًا من البناء" },
  "tl.sub": {
    en: "Each square is one repo on one day; the brighter it glows, the more commits landed.",
    ar: "كل مربع هو مستودع في يوم؛ كلما زاد توهّجه زاد عدد الـ commits.",
  },
  "tl.commits": { en: "commits", ar: "commit" },
  "tl.feed": { en: "git log — public repositories", ar: "git log — المستودعات العامة" },
  "tl.peak": { en: "Peak day", ar: "أكثر يوم نشاطًا" },
  "tl.first": { en: "First repo", ar: "أول مستودع" },
  "about.kicker": { en: "About", ar: "نبذة" },
  "about.title": { en: "A teacher who got tired of waiting for the tools.", ar: "معلّم مَلّ من انتظار الأدوات، فبناها." },
  "about.p1": {
    en: "I'm Walid — an ICT teacher at Alex Dream Language School in Alexandria. In the classroom I explain how computers think; on GitHub I put that into practice.",
    ar: "أنا وليد — معلّم ICT في مدرسة Alex Dream Language School بالإسكندرية. في الفصل أشرح كيف يفكّر الحاسوب، وعلى GitHub أطبّق ذلك عمليًا.",
  },
  "about.p2": {
    en: "Link Me teaches English to Egyptians with AI pronunciation feedback. Firdaws puts prayer times, Qibla and a Quran library in one calm app. Around them: a noir detective game set in Alexandria, party games, a fitness tracker and a private journal — each shipped offline-first and in two languages.",
    ar: "Link Me تعلّم الإنجليزية للمصريين مع تقييم النطق بالذكاء الاصطناعي. «الفردوس» يجمع مواقيت الصلاة والقبلة ومكتبة القرآن في تطبيق هادئ. وحولهما: لعبة تحقيق نوار في الإسكندرية، وألعاب جماعية، وتطبيق لياقة ومفكرة خاصة — كلها تعمل بدون إنترنت وبلغتين.",
  },
  "about.role": { en: "Role", ar: "الوظيفة" },
  "about.roleV": { en: "ICT Teacher", ar: "معلّم ICT" },
  "about.school": { en: "School", ar: "المدرسة" },
  "about.schoolV": { en: "Alex Dream Language School", ar: "Alex Dream Language School" },
  "about.where": { en: "Based in", ar: "المكان" },
  "about.whereV": { en: "Alexandria, Egypt", ar: "الإسكندرية، مصر" },
  "about.since": { en: "On GitHub since", ar: "على GitHub منذ" },
  "about.builds": { en: "Builds in", ar: "يبني بـ" },
  "about.buildsV": { en: "Arabic & English", ar: "العربية والإنجليزية" },
  "about.c1": { en: "Education tech", ar: "تقنيات التعليم" },
  "about.c1d": { en: "Link Me — a full English-learning platform with AI speaking practice.", ar: "Link Me — منصة كاملة لتعلّم الإنجليزية مع تدريب نطق بالذكاء الاصطناعي." },
  "about.c2": { en: "Games", ar: "ألعاب" },
  "about.c2d": { en: "Noir investigation, Ludo, neon arcade and a party game — playable on a single phone.", ar: "تحقيق نوار، وليدو، وأركيد نيون، ولعبة جماعية — على موبايل واحد." },
  "about.c3": { en: "Everyday apps", ar: "تطبيقات يومية" },
  "about.c3d": { en: "Prayer times, fitness and a private journal — offline-first PWAs and Flutter.", ar: "مواقيت الصلاة واللياقة ومفكرة خاصة — تطبيقات PWA وFlutter تعمل بدون إنترنت." },
  "contact.kicker": { en: "Contact", ar: "تواصل" },
  "contact.title": { en: "Have an idea? Let's ship it.", ar: "عندك فكرة؟ خلّينا نطلقها." },
  "contact.sub": {
    en: "Open to collaborations, freelance builds and teaching tech projects. The fastest way is email.",
    ar: "متاح للتعاون ومشاريع العمل الحر ومشاريع تقنية تعليمية. أسرع وسيلة هي البريد.",
  },
  "contact.copy": { en: "Copy email", ar: "انسخ البريد" },
  "contact.copied": { en: "Copied ✓", ar: "تم النسخ ✓" },
  "contact.mail": { en: "Write an email", ar: "أرسل بريدًا" },
  "foot.built": { en: "Built entirely from GitHub data", ar: "مبني بالكامل من بيانات GitHub" },
  "foot.top": { en: "Back to top ↑", ar: "للأعلى ↑" },
  "pal.placeholder": { en: "Type a command or search a project…", ar: "اكتب أمرًا أو ابحث عن مشروع…" },
  "pal.sections": { en: "Sections", ar: "الأقسام" },
  "pal.projects": { en: "Projects", ar: "المشاريع" },
  "pal.actions": { en: "Actions", ar: "إجراءات" },
  "pal.lang": { en: "Switch to العربية", ar: "التبديل إلى English" },
  "pal.gh": { en: "Open GitHub profile", ar: "افتح حساب GitHub" },
  "pal.fb": { en: "Open Facebook", ar: "افتح Facebook" },
  "pal.mail": { en: "Copy email address", ar: "انسخ البريد الإلكتروني" },
  "pal.empty": { en: "Nothing matches.", ar: "لا نتائج." },
  "pal.hint": { en: "↑↓ navigate · ↵ open · esc close", ar: "↑↓ تنقّل · ↵ فتح · esc إغلاق" },
  "boot.skip": { en: "press any key to skip", ar: "اضغط أي زر للتخطي" },
} satisfies Record<string, Bi>;

export type Key = keyof typeof dict;

interface Ctx {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  pick: (b: Bi) => string;
  num: (n: number, opts?: Intl.NumberFormatOptions) => string;
}

const I18n = createContext<Ctx>(null as unknown as Ctx);

function initialLang(): Lang {
  try {
    const s = localStorage.getItem("lang");
    if (s === "ar" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      dir,
      setLang,
      t: (k) => dict[k][lang],
      pick: (b) => b[lang],
      num: (n, o) => n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", o),
    }),
    [lang, dir, setLang],
  );
  return <I18n.Provider value={value}>{children}</I18n.Provider>;
}

export const useI18n = () => useContext(I18n);
