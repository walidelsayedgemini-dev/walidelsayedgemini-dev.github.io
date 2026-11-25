import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";
export type Bi = { en: string; ar: string };

const dict = {
  "nav.work": { en: "Work", ar: "الأعمال" },
  "nav.stack": { en: "Skills", ar: "المهارات" },
  "nav.about": { en: "About", ar: "نبذة" },
  "nav.contact": { en: "Contact", ar: "تواصل" },
  "nav.search": { en: "Search / jump", ar: "بحث / انتقال" },
  "hero.kicker": { en: "Open to full-time & freelance roles · Alexandria, Egypt", ar: "متاح للعمل بدوام كامل ومشاريع حرة · الإسكندرية، مصر" },
  "hero.first": { en: "WALID", ar: "وليد" },
  "hero.last": { en: "SAYED", ar: "سيد" },
  "hero.intro": { en: "I design, build and ship production-ready web and mobile products with React, TypeScript and Flutter — Arabic-first, bilingual and offline-ready. Nine products delivered end-to-end, three of them live.", ar: "أصمّم وأبني وأُطلق منتجات ويب وموبايل جاهزة للإنتاج باستخدام React وTypeScript وFlutter — عربية أولًا، ثنائية اللغة، وتعمل دون إنترنت. تسعة منتجات نفّذتها من الفكرة حتى الإطلاق، ثلاثة منها منشورة للجمهور." },
  "hero.cta1": { en: "View selected work", ar: "شاهد أبرز الأعمال" },
  "hero.cta2": { en: "Download CV", ar: "حمّل السيرة الذاتية" },
  "hero.scroll": { en: "scroll", ar: "مرّر" },
  "stats.title": { en: "Impact at a glance", ar: "الإنجاز في لمحة" },
  "stats.repos": { en: "Products shipped", ar: "منتج مُطلَق" },
  "stats.repos.sub": { en: "web apps, mobile apps & games", ar: "تطبيقات ويب وموبايل وألعاب" },
  "stats.commits": { en: "Commits", ar: "Commit" },
  "stats.commits.sub": { en: "across 9 repositories", ar: "عبر ٩ مستودعات" },
  "stats.langs": { en: "Languages", ar: "لغات برمجة" },
  "live.on": { en: "LIVE", ar: "مباشر" },
  "live.off": { en: "SNAPSHOT", ar: "نسخة محفوظة" },
  "live.push": { en: "last public push", ar: "آخر push عام" },
  "live.public": { en: "public repos", ar: "مستودعات عامة" },
  "live.synced": { en: "synced", ar: "آخر مزامنة" },
  "work.kicker": { en: "Selected work", ar: "أبرز الأعمال" },
  "work.title": { en: "Products I designed, built and shipped.", ar: "منتجات صمّمتها وبنيتها وأطلقتها." },
  "work.sub": { en: "Three in-depth case studies, then six more products. Private repositories can be walked through live in an interview.", ar: "ثلاث دراسات حالة مفصّلة، ثم ستة منتجات أخرى. المستودعات الخاصة يمكن عرضها مباشرة خلال المقابلة." },
  "work.live": { en: "Live demo", ar: "جرّب المشروع" },
  "work.repo": { en: "Source", ar: "الكود" },
  "work.private": { en: "Private · demo on request", ar: "خاص · عرض عند الطلب" },
  "work.commits": { en: "commits", ar: "commit" },
  "stack.kicker": { en: "Skills", ar: "المهارات" },
  "stack.title": { en: "The toolkit behind the products.", ar: "الأدوات التي بُنيت بها المنتجات." },
  "stack.sub": { en: "Grouped by discipline. The number next to a tool is how many of my repositories use it, verified from their package files.", ar: "مقسّمة حسب المجال. الرقم بجوار الأداة هو عدد مستودعاتي التي تستخدمها، من واقع ملفات الحزم." },
  "stack.other": { en: "Other", ar: "أخرى" },
  "stack.used": { en: "in", ar: "في" },
  "stack.repos": { en: "repos", ar: "مشاريع" },
  "stack.total": { en: "of code in total", ar: "إجمالي الكود" },
  "about.kicker": { en: "About", ar: "نبذة" },
  "about.title": { en: "A developer with a teacher's clarity.", ar: "مطوّر بوضوح المعلّم." },
  "about.p1": { en: "I'm Walid Sayed, a full-stack and mobile developer based in Alexandria, Egypt. I take products from idea to release: interface design, front-end, APIs and databases, native mobile, testing and deployment.", ar: "أنا وليد سيد، مطوّر Full-stack وتطبيقات موبايل من الإسكندرية، مصر. أنقل المنتج من الفكرة إلى الإطلاق: تصميم الواجهة، والواجهة الأمامية، وواجهات API وقواعد البيانات، وتطبيقات الموبايل الأصلية، والاختبار والنشر." },
  "about.p2": { en: "I also teach ICT at Alex Dream Language School, and it shapes how I work: I write readable code, explain technical decisions in plain language, and design for real users in Arabic and English. I'm ready to bring that ownership and communication to a product team.", ar: "أعمل أيضًا معلّمًا لمادة ICT في مدرسة Alex Dream Language School، وهذا ينعكس على طريقة عملي: أكتب كودًا مقروءًا، وأشرح القرارات التقنية بلغة بسيطة، وأصمّم لمستخدمين حقيقيين بالعربية والإنجليزية. وأنا جاهز لنقل هذه المسؤولية ومهارة التواصل إلى فريق منتج." },
  "about.role": { en: "Role", ar: "الدور" },
  "about.roleV": { en: "Full-stack & Mobile Developer", ar: "مطوّر Full-stack وموبايل" },
  "about.school": { en: "Also", ar: "أيضًا" },
  "about.schoolV": { en: "ICT Teacher · Alex Dream Language School", ar: "معلّم ICT · Alex Dream Language School" },
  "about.since": { en: "Availability", ar: "التوفّر" },
  "about.builds": { en: "Works in", ar: "لغات العمل" },
  "about.buildsV": { en: "Arabic & English", ar: "العربية والإنجليزية" },
  "about.c1": { en: "End-to-end ownership", ar: "مسؤولية كاملة من البداية للنهاية" },
  "about.c1d": { en: "From the first sketch to a store-ready build — nine products taken all the way to release.", ar: "من أول رسم تخطيطي حتى نسخة جاهزة للمتجر — تسعة منتجات وصلت إلى الإطلاق." },
  "about.c2": { en: "Clear communication", ar: "تواصل واضح" },
  "about.c2d": { en: "Teaching every day: I document, explain trade-offs and help teammates learn fast.", ar: "أُدرّس يوميًا: أوثّق، وأشرح المفاضلات التقنية، وأساعد زملائي على التعلّم بسرعة." },
  "about.c3": { en: "Performance & craft", ar: "الأداء والإتقان" },
  "about.c3d": { en: "Offline-first, fast on mid-range phones, polished in both RTL and LTR.", ar: "تعمل دون إنترنت، وسريعة على الهواتف المتوسطة، ومتقنة في الاتجاهين RTL وLTR." },
  "contact.kicker": { en: "Contact", ar: "تواصل" },
  "contact.title": { en: "Have a role in mind? Let's talk.", ar: "عندك فرصة مناسبة؟ لنتحدث." },
  "contact.sub": { en: "Open to full-time positions, contract work and freelance projects. Email is the fastest way to reach me — my CV is one click away.", ar: "متاح لوظائف بدوام كامل وعقود ومشاريع حرة. البريد الإلكتروني أسرع وسيلة للتواصل — وسيرتي الذاتية على بُعد نقرة." },
  "contact.copy": { en: "Copy email", ar: "انسخ البريد" },
  "contact.copied": { en: "Copied ✓", ar: "تم النسخ ✓" },
  "contact.mail": { en: "Write an email", ar: "أرسل بريدًا" },
  "foot.built": { en: "Full-stack & Mobile Developer · Alexandria, Egypt", ar: "مطوّر Full-stack وموبايل · الإسكندرية، مصر" },
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
  "work.details": { en: "Case study", ar: "التفاصيل" },
  "modal.close": { en: "Close", ar: "إغلاق" },
  "modal.highlights": { en: "What's inside", ar: "ماذا بداخله" },
  "modal.stack": { en: "Built with", ar: "التقنيات" },
  "modal.facts": { en: "Repository facts", ar: "بيانات المستودع" },
  "modal.first": { en: "First commit", ar: "أول commit" },
  "modal.last": { en: "Last push", ar: "آخر push" },
  "modal.size": { en: "Code size", ar: "حجم الكود" },
  "modal.langs": { en: "Languages", ar: "اللغات" },
  "modal.preview": { en: "Recorded from the live site", ar: "مسجّل من الموقع الحي" },
  "nav.services": { en: "Expertise", ar: "التخصصات" },
  "nav.theme": { en: "Switch theme", ar: "تبديل المظهر" },
  "nav.sound": { en: "UI sounds", ar: "أصوات الواجهة" },
  "svc.kicker": { en: "Expertise", ar: "الخبرات" },
  "svc.title": { en: "What I bring to a team.", ar: "ما أضيفه لأي فريق." },
  "svc.sub": { en: "Every strength below is backed by shipped code — tap a project name to open its case study.", ar: "كل نقطة قوة هنا مدعومة بكود مُطلَق فعلًا — اضغط على اسم المشروع لفتح تفاصيله." },
  "svc.1": { en: "Front-end engineering", ar: "هندسة الواجهات الأمامية" },
  "svc.1d": { en: "React 19 and TypeScript interfaces with clean state management (Zustand), fluid motion and responsive, accessible layouts.", ar: "واجهات React 19 وTypeScript بإدارة حالة منظّمة (Zustand) وحركة سلسة وتصميم متجاوب يراعي سهولة الوصول." },
  "svc.2": { en: "Full-stack & APIs", ar: "Full-stack وواجهات API" },
  "svc.2d": { en: "Type-safe APIs with tRPC and Express, relational data with Drizzle ORM and MySQL, containerised with Docker.", ar: "واجهات API آمنة الأنواع بـ tRPC وExpress، وبيانات علائقية بـ Drizzle ORM وMySQL، مع حاويات Docker." },
  "svc.3": { en: "Mobile apps", ar: "تطبيقات الموبايل" },
  "svc.3d": { en: "Flutter apps with native Kotlin services, and web apps packaged for Android with Capacitor — offline-first.", ar: "تطبيقات Flutter بخدمات Kotlin أصلية، وتطبيقات ويب مُغلّفة لأندرويد عبر Capacitor — تعمل دون إنترنت." },
  "svc.4": { en: "Arabic-first, bilingual UX", ar: "تجربة عربية أولًا وثنائية اللغة" },
  "svc.4d": { en: "Full RTL layouts, natural Arabic copy and an English switch designed in from day one — not bolted on.", ar: "واجهات RTL كاملة ونصوص عربية طبيعية وتبديل للإنجليزية مصمّم من البداية — لا مُضاف لاحقًا." },
  "svc.proof": { en: "Proof", ar: "الدليل" },
  "svc.cta": { en: "Hiring for a role like this?", ar: "تبحث عن مطوّر لدور كهذا؟" },
  "svc.cta.btn": { en: "Email me about a role", ar: "راسلني بخصوص وظيفة" },
  "nav.journey": { en: "Experience", ar: "الخبرة العملية" },
  "journey.kicker": { en: "Experience", ar: "الخبرة" },
  "journey.title": { en: "Where I work.", ar: "أين أعمل." },
  "journey.edu": { en: "Education", ar: "التعليم" },
  "journey.exp": { en: "Experience", ar: "الخبرة" },
  "journey.say": { en: "What people say", ar: "ماذا يقولون" },
  "pal.cv": { en: "Download CV", ar: "حمّل السيرة الذاتية" },
  "contact.cv": { en: "Download CV", ar: "حمّل السيرة الذاتية" },
  "nav.cv": { en: "CV", ar: "السيرة الذاتية" },
  "hero.role": { en: "Full-stack & Mobile Developer", ar: "مطوّر Full-stack وتطبيقات موبايل" },
  "hero.cta3": { en: "Get in touch", ar: "تواصل معي" },
  "hero.badge": { en: "products shipped", ar: "منتجات مُطلَقة" },
  "stats.kicker": { en: "By the numbers", ar: "بالأرقام" },
  "stats.live": { en: "Live in production", ar: "منشورة للجمهور" },
  "stats.live.sub": { en: "public — try them today", ar: "متاحة للتجربة الآن" },
  "stats.tech": { en: "Technologies", ar: "تقنية" },
  "stats.tech.sub": { en: "used in shipped code", ar: "مستخدمة في كود مُطلَق" },
  "work.featured": { en: "Case study", ar: "دراسة حالة" },
  "work.more": { en: "More products", ar: "منتجات أخرى" },
  "work.role": { en: "My role", ar: "دوري" },
  "work.platform": { en: "Platform", ar: "المنصة" },
  "work.built": { en: "Key work", ar: "أبرز ما نفّذته" },
  "svc.5": { en: "Interactive graphics & games", ar: "رسوميات تفاعلية وألعاب" },
  "svc.5d": { en: "Three.js and Canvas 2D scenes, generated audio and 60 fps game loops that run smoothly on mid-range phones.", ar: "مشاهد Three.js وCanvas 2D وصوت مولَّد برمجيًا وحلقات ألعاب بـ ٦٠ إطارًا تعمل بسلاسة على الهواتف المتوسطة." },
  "svc.6": { en: "Quality & delivery", ar: "الجودة والتسليم" },
  "svc.6d": { en: "Unit tests with Vitest, end-to-end tests with Playwright, CI/CD on GitHub Actions, deploys to Vercel and GitHub Pages.", ar: "اختبارات وحدات بـ Vitest واختبارات شاملة بـ Playwright وCI/CD على GitHub Actions ونشر على Vercel وGitHub Pages." },
  "svc.cta.free": { en: "Freelance project", ar: "مشروع حر" },
  "stack.bar": { en: "Code by language, as measured by GitHub", ar: "توزيع الكود حسب اللغة كما يقيسه GitHub" },
  "about.sinceV": { en: "Full-time · Contract · Freelance", ar: "دوام كامل · عقد · عمل حر" },
  "boot.sub": { en: "Full-stack & Mobile Developer", ar: "مطوّر Full-stack وتطبيقات موبايل" },
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

const DESC = {
  en: "Walid Sayed — full-stack & mobile developer in Alexandria, Egypt. Nine products shipped with React, TypeScript, Node, Flutter and Capacitor; Arabic-first, bilingual and offline-ready. Open to full-time and freelance roles.",
  ar: "وليد سيد — مطوّر Full-stack وتطبيقات موبايل من الإسكندرية، مصر. تسعة منتجات مُطلَقة بـ React وTypeScript وNode وFlutter وCapacitor، عربية أولًا وثنائية اللغة وتعمل دون إنترنت. متاح للعمل بدوام كامل ومشاريع حرة.",
};
const I18n = createContext<Ctx>(null as unknown as Ctx);

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    if (q === "ar" || q === "en") return q;
  } catch {
    /* ignore */
  }
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
    document.title = lang === "ar" ? "وليد سيد — مطوّر Full-stack وتطبيقات موبايل | React · TypeScript · Flutter" : "Walid Sayed — Full-stack & Mobile Developer | React · TypeScript · Flutter";
    document.querySelector('meta[name="description"]')?.setAttribute("content", lang === "ar" ? DESC.ar : DESC.en);
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
