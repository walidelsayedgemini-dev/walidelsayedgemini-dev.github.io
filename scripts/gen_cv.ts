// Builds the one-page CV (EN + AR) as HTML from the site's own data; scripts/cv_pdf.py prints them to PDF.
// Run: npx tsx scripts/gen_cv.ts && python3 scripts/cv_pdf.py
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { featured, others, skillGroups } from "../src/data/projects";
import { highlights } from "../src/data/highlights";
import { extra } from "../src/data/extra";

type L = "en" | "ar";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FD = `${ROOT}/node_modules/@fontsource-variable`;
const font = (fam: string, dir: string, file: string) =>
  `@font-face{font-family:'${fam}';src:url('file://${FD}/${dir}/files/${file}') format('woff2');font-weight:100 900}`;
const SITE = "walidelsayedgemini-dev.github.io";
const EMAIL = "walidelsayedgemini@gmail.com";
const GH = "github.com/walidelsayedgemini-dev";

const css = `
${font("Bric", "bricolage-grotesque", "bricolage-grotesque-latin-wght-normal.woff2")}
${font("Int", "inter", "inter-latin-wght-normal.woff2")}
${font("Rdx", "readex-pro", "readex-pro-arabic-wght-normal.woff2")}
${font("RdxL", "readex-pro", "readex-pro-latin-wght-normal.woff2")}
${font("Mono", "jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2")}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:210mm;height:297mm}
body{font:8.6pt/1.45 Int,Rdx,sans-serif;color:#1d1f24;background:#fff;display:grid;grid-template-columns:62mm 1fr;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body.ar{font-family:RdxL,Rdx,sans-serif;direction:rtl;font-size:8.5pt;line-height:1.58}
aside{background:#0d1018;color:#e9e6dd;padding:13mm 7mm 10mm 8mm;position:relative;overflow:hidden}
.ar aside{padding:13mm 8mm 10mm 7mm}
aside::before{content:"";position:absolute;inset:0;background:radial-gradient(1.2px 1.2px at 20% 12%,#ffffff88,transparent),radial-gradient(1px 1px at 70% 30%,#ffffff66,transparent),radial-gradient(1.4px 1.4px at 40% 55%,#f3d9a066,transparent),radial-gradient(1px 1px at 85% 75%,#ffffff55,transparent),radial-gradient(1px 1px at 15% 88%,#ffffff55,transparent),radial-gradient(120mm 80mm at 100% 0%,#d4b06a22,transparent 70%);pointer-events:none}
.ph{width:34mm;height:34mm;border-radius:50%;object-fit:cover;border:.6mm solid #d4b06a;display:block;margin:0 auto 6mm;position:relative}
aside h3{font:600 7.4pt Mono,Rdx,monospace;letter-spacing:.16em;text-transform:uppercase;color:#d4b06a;margin:5.5mm 0 2.2mm;position:relative}
.ar aside h3{font-family:Rdx;letter-spacing:0;font-size:8.6pt}
aside ul{list-style:none;position:relative}
.ct li{display:flex;flex-direction:column;margin-bottom:1.9mm;font-size:8pt;word-break:break-all}
.ct li span{font:500 6.6pt Mono,Rdx,monospace;color:#9aa0ad;letter-spacing:.08em;text-transform:uppercase}
.ar .ct li span{font-family:Rdx;letter-spacing:0;font-size:7.4pt}
.ct li b{font-weight:500;color:#f4f1ea;font-size:7.6pt}
.ct li b.lt{direction:ltr;unicode-bidi:isolate}
.ar .ct li b.lt{text-align:right;font-size:7.1pt}
.ct a{color:inherit;text-decoration:none}
.sg{margin-bottom:2.4mm;position:relative}
.sg b{display:block;font-size:8pt;color:#fff;font-weight:600;margin-bottom:.6mm}
.sg div{font-size:7.7pt;color:#c4c8d2;line-height:1.5}
.lg li{font-size:8pt;color:#dfe2e9;margin-bottom:.8mm}
main{padding:12mm 11mm 9mm 10mm;display:flex;flex-direction:column}
.ar main{padding:13mm 10mm 10mm 11mm}
h1{font:700 26pt/1 Bric,Rdx,sans-serif;letter-spacing:-.02em;color:#0d1018}
.ar h1{font-family:Rdx;letter-spacing:0;font-size:24pt;line-height:1.15}
.role{font:600 11.5pt Bric,Rdx,sans-serif;color:#9a7633;margin-top:1.6mm}
.ar .role{font-family:Rdx}
.avail{margin-top:1.4mm;font-size:8pt;color:#5d636f}
h2{font:700 7.8pt Mono,Rdx,monospace;letter-spacing:.18em;text-transform:uppercase;color:#9a7633;margin:4.2mm 0 2mm;display:flex;align-items:center;gap:2.4mm}
.ar h2{font-family:Rdx;letter-spacing:0;font-size:9.4pt}
h2::after{content:"";flex:1;height:.25mm;background:#e7dcc3}
.sum{color:#30343c}
.job{margin-bottom:2.1mm}
.jh{display:flex;justify-content:space-between;gap:3mm;align-items:baseline}
.jh b{font-size:9.6pt;color:#0d1018}
.jh>span{font:500 7.4pt Mono,Rdx,monospace;color:#9a7633;white-space:nowrap}
.ar .jh>span{font-family:Rdx;font-size:8pt}
.jh small{font-weight:400;color:#5d636f;font-size:8pt}
.jp{color:#5d636f;font-size:8.2pt;margin-bottom:.6mm}
.job p{color:#30343c}
.pj{margin-bottom:2.3mm;break-inside:avoid}
.pj .jh b{font-size:9.8pt}
.pj .meta{font-size:7.8pt;color:#5d636f;margin:.3mm 0 .8mm}
.pj .meta i{font-style:normal;color:#9a7633;direction:ltr;unicode-bidi:isolate}
.pj ul{padding-inline-start:4mm;color:#30343c}
.pj li{margin-bottom:.4mm}
.pj li::marker{color:#c49a4c}
.lnk{font:600 7.6pt Int,Rdx,sans-serif;color:#7a5c25;text-decoration:none;white-space:nowrap;border-bottom:.2mm solid #d9c48f}
.more{display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 5mm}
.more div{font-size:8pt;color:#30343c;line-height:1.4}
.more b{color:#0d1018;font-weight:600}
.more span{color:#5d636f}
.more span.lt{direction:ltr;unicode-bidi:isolate;font-size:7.4pt;color:#9a7633}
`;

const TXT = {
  en: {
    name: "Walid Sayed",
    role: "Full-stack & Mobile Developer",
    avail: "Alexandria, Egypt · Open to full-time, contract and freelance roles",
    sum: "Full-stack and mobile developer who takes products from idea to release. I have designed, built and shipped nine web and mobile products end-to-end with React, TypeScript, Node, tRPC, Drizzle and Flutter — Arabic-first, bilingual and offline-ready, with automated tests and CI/CD. My teaching background shows in how I work: readable code, clear documentation and calm communication with teammates and users.",
    h: { contact: "Contact", skills: "Skills", lang: "Languages", sum: "Profile", exp: "Experience", proj: "Selected projects", more: "Also built" },
    c: { email: "Email", web: "Portfolio", gh: "GitHub", loc: "Location" },
    loc: "Alexandria, Egypt",
    langs: ["Arabic — native", "English — professional"],
  },
  ar: {
    name: "وليد سيد",
    role: "مطوّر Full-stack وتطبيقات موبايل",
    avail: "الإسكندرية، مصر · متاح للعمل بدوام كامل أو بعقد أو كمشاريع حرة",
    sum: "مطوّر Full-stack وتطبيقات موبايل يأخذ المنتج من الفكرة حتى الإطلاق. صمّمت وبنيت وأطلقت تسعة منتجات ويب وموبايل من البداية للنهاية باستخدام React وTypeScript وNode وtRPC وDrizzle وFlutter — عربية أولًا، ثنائية اللغة، وتعمل دون إنترنت، مع اختبارات آلية وCI/CD. خلفيتي في التدريس تظهر في طريقة عملي: كود مقروء وتوثيق واضح وتواصل هادئ مع الفريق والمستخدمين.",
    h: { contact: "التواصل", skills: "المهارات", lang: "اللغات", sum: "نبذة", exp: "الخبرة", proj: "أبرز المشاريع", more: "منتجات أخرى" },
    c: { email: "البريد", web: "الموقع", gh: "GitHub", loc: "المدينة" },
    loc: "الإسكندرية، مصر",
    langs: ["العربية — اللغة الأم", "الإنجليزية — مستوى مهني"],
  },
} as const;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const host = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

function page(l: L) {
  const T = TXT[l];
  const skills = skillGroups
    .map((g) => `<div class="sg"><b>${esc(g.title[l])}</b><div dir="ltr" style="text-align:${l === "ar" ? "right" : "left"}">${esc(g.items.join(" · "))}</div></div>`)
    .join("");
  const jobs = extra.experience
    .map((e) => `<div class="job"><div class="jh"><b>${esc(e.title[l])}</b><span>${esc(e.period[l])}</span></div><div class="jp">${esc(e.place[l])}</div>${e.note ? `<p>${esc(e.note[l])}</p>` : ""}</div>`)
    .join("");
  const feat = featured
    .map((p) => {
      const hl = (highlights[p.id] || []).slice(0, 2).map((h) => `<li>${esc(h[l])}</li>`).join("");
      const link = p.live ? `<a class="lnk" href="${p.live}">${l === "ar" ? "رابط مباشر ↗" : "Live demo ↗"}</a>` : "";
      return `<div class="pj"><div class="jh"><b>${esc(p.name[l])} <small>— ${esc(p.kind[l])}</small></b>${link}</div>
<div class="meta">${p.role ? esc(p.role[l]) + " · " : ""}<i>${esc(p.tags.slice(0, 6).join(" · "))}</i></div><ul>${hl}</ul></div>`;
    })
    .join("");
  const more = others
    .map((p) => `<div><b>${esc(p.name[l])}</b> <span>— ${esc(p.kind[l])}</span><br><span class="lt">${esc(p.tags.slice(0, 3).join(" · "))}</span></div>`)
    .join("");
  return `<!doctype html><html lang="${l}" dir="${l === "ar" ? "rtl" : "ltr"}"><meta charset="utf-8"><title>${esc(T.name)} — CV</title><style>${css}</style><body class="${l}">
<aside>
<img class="ph" src="file://${ROOT}/public/img/walid.webp" alt="">
<h3>${T.h.contact}</h3>
<ul class="ct"><li><span>${T.c.email}</span><b class="lt"><a href="mailto:${EMAIL}">${EMAIL}</a></b></li><li><span>${T.c.web}</span><b class="lt"><a href="https://${SITE}/">${SITE}</a></b></li><li><span>${T.c.gh}</span><b class="lt"><a href="https://${GH}">${GH}</a></b></li><li><span>${T.c.loc}</span><b>${T.loc}</b></li></ul>
<h3>${T.h.skills}</h3>${skills}
<h3>${T.h.lang}</h3><ul class="lg">${T.langs.map((x) => `<li>${x}</li>`).join("")}</ul>
</aside>
<main>
<h1>${T.name}</h1><div class="role">${T.role}</div><div class="avail">${T.avail}</div>
<h2>${T.h.sum}</h2><p class="sum">${esc(T.sum)}</p>
<h2>${T.h.exp}</h2>${jobs}
<h2>${T.h.proj}</h2>${feat}
<h2>${T.h.more}</h2><div class="more">${more}</div>
</main></body></html>`;
}
for (const l of ["en", "ar"] as const) writeFileSync(`/tmp/cv-${l}.html`, page(l));
console.log("ok");
