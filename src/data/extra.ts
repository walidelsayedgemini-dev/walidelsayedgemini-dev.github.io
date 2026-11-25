import type { Bi } from "../i18n";

/**
 * Personal details that are NOT on GitHub.
 * Fill any of them in and the matching section (and nav link) appears automatically.
 */
export interface Entry {
  title: Bi; // degree / job title
  place: Bi; // university / employer
  period: Bi; // e.g. { en: "2018 – 2022", ar: "٢٠١٨ – ٢٠٢٢" }
  note?: Bi;
}
export interface Quote {
  text: Bi;
  name: Bi;
  role?: Bi;
}

export const extra: {
  /** CV PDFs in /public/cv, generated from verified GitHub data by scripts/gen_cv.ts. Replace with your own CV any time. */
  cvUrl: Bi;
  education: Entry[];
  experience: Entry[];
  testimonials: Quote[];
} = {
  cvUrl: { en: "cv/Walid-Sayed-CV-EN.pdf", ar: "cv/Walid-Sayed-CV-AR.pdf" },
  education: [],
  experience: [
    {
      title: { en: "Full-stack & Mobile Developer", ar: "مطوّر Full-stack وتطبيقات موبايل" },
      place: { en: "Independent · product development", ar: "مستقل · تطوير منتجات" },
      period: { en: "Current", ar: "حاليًا" },
      note: {
        en: "Designed, built and shipped nine products end-to-end — including Link Me (English-learning platform, React + tRPC + Drizzle), Firdaws (Flutter + native Kotlin) and The Last Thread (TypeScript game, Android via Capacitor). Own the full cycle: UI, APIs, data, testing, CI/CD and deployment.",
        ar: "صمّمت وبنيت وأطلقت تسعة منتجات من البداية للنهاية — منها Link Me (منصة لتعلّم الإنجليزية بـ React وtRPC وDrizzle)، و«الفردوس» (Flutter مع Kotlin أصلي)، و«الخيط الأخير» (لعبة TypeScript على أندرويد عبر Capacitor). أتولّى الدورة كاملة: الواجهة وواجهات API والبيانات والاختبار وCI/CD والنشر.",
      },
    },
    {
      title: { en: "ICT Teacher", ar: "معلّم ICT" },
      place: { en: "Alex Dream Language School · Alexandria", ar: "Alex Dream Language School · الإسكندرية" },
      period: { en: "Current", ar: "حاليًا" },
      note: {
        en: "Teach computing and digital skills, turning technical topics into clear, practical lessons — the same clarity I bring to code reviews, documentation and teamwork.",
        ar: "أُدرّس الحاسب والمهارات الرقمية، وأحوّل الموضوعات التقنية إلى دروس واضحة وعملية — وهو الوضوح نفسه الذي أنقله إلى مراجعة الكود والتوثيق والعمل الجماعي.",
      },
    },
  ],
  testimonials: [],
};

export const hasJourney = extra.education.length + extra.experience.length + extra.testimonials.length > 0;
