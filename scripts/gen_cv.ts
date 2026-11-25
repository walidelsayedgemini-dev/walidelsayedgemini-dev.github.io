// Builds a one-page CV (EN + AR) as PDF purely from verified GitHub data. Run: npx tsx scripts/gen_cv.ts
import { writeFileSync } from "node:fs";
import { projects } from "../src/data/projects";
import { gh, repoByName, fmtBytes, totalBytes } from "../src/data/github";
import { techCloud } from "../src/data/projects";

const FD = "/home/ubuntu/walidfolio/node_modules/@fontsource-variable";
const font = (fam: string, dir: string, file: string) => `@font-face{font-family:'${fam}';src:url('file://${FD}/${dir}/files/${file}') format('woff2');font-weight:100 900}`;
const css = `
${font("Bric", "bricolage-grotesque", "bricolage-grotesque-latin-wght-normal.woff2")}
${font("Int", "inter", "inter-latin-wght-normal.woff2")}
${font("Rdx", "readex-pro", "readex-pro-arabic-wght-normal.woff2")}
${font("RdxL", "readex-pro", "readex-pro-latin-wght-normal.woff2")}
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0}
body{width:210mm;height:297mm;padding:14mm 15mm;font:10pt/1.5 Int,Rdx,sans-serif;color:#1c1a16;background:#fffdf8;position:relative;overflow:hidden}
body.ar{font-family:RdxL,Rdx,sans-serif;direction:rtl}
.bar{position:absolute;inset:0 0 auto 0;height:5mm;background:linear-gradient(90deg,#a98445,#e6c887,#a98445)}
header{display:flex;gap:6mm;align-items:center;margin-top:3mm;padding-bottom:5mm;border-bottom:.3mm solid #d9b872}
.ph{width:25mm;height:25mm;border-radius:50%;object-fit:cover;border:.5mm solid #d4b06a}
h1{font:700 25pt/1 Bric,Rdx,sans-serif;letter-spacing:-.01em}
.ar h1{font-family:Rdx;letter-spacing:0}
.role{color:#8a6a2e;font-weight:600;margin-top:1.5mm;font-size:10.5pt}
.ct{margin-top:2mm;font-size:8pt;color:#555;display:flex;flex-wrap:wrap;gap:1mm 4mm}
h2{font:700 8.8pt Int,Rdx,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#8a6a2e;margin:6.5mm 0 2.6mm;display:flex;align-items:center;gap:2mm}
.ar h2{letter-spacing:0;font-size:9.5pt;font-family:Rdx}
h2::after{content:"";flex:1;height:.25mm;background:#e8d9b4}
p.sum{font-size:10pt}
.pr{display:grid;grid-template-columns:1fr 1fr;gap:3.6mm 6mm}
.p{break-inside:avoid;border-inline-start:.7mm solid #d4b06a;padding-inline-start:2.4mm}
.p b{font-size:10.3pt}.p i{font-style:normal;color:#8a6a2e;font-size:8.4pt;margin-inline-start:1.5mm}
.p div{font-size:8.8pt;color:#444}.p em{font-style:normal;font-size:8pt;color:#777;direction:ltr;unicode-bidi:isolate;display:inline-block}
.sk{display:flex;flex-wrap:wrap;gap:1.4mm}
.sk span{border:.25mm solid #d9c48f;border-radius:10mm;padding:.5mm 2.4mm;font-size:8.6pt;background:#fbf4e1}
.st{display:flex;gap:6mm;margin-top:1mm}.st div{font-size:8.6pt;color:#666}.st b{display:block;font:700 17pt Bric,Rdx;color:#1c1a16}
body.ar>*:not(footer):not(.bar){zoom:.9}
footer{position:absolute;bottom:9mm;inset-inline:14mm;font-size:7pt;color:#999;display:flex;justify-content:space-between}
`;
const TXT = {
  en: {
    role: "ICT Teacher · App & Game Developer",
    loc: "Alexandria, Egypt",
    sum: "ICT teacher at Alex Dream Language School in Alexandria who builds and ships real products. Nine apps and games on GitHub — in Arabic and English, offline-first — from an English-learning platform with AI pronunciation feedback to prayer-time apps and noir detective games.",
    h: { sum: "Profile", work: "Selected projects", stack: "Technology", num: "GitHub in numbers", exp: "Work" },
    priv: "private repository", live: "live",
    st: ["repositories", "commits", "languages", "days of activity"],
    job: ["ICT Teacher", "Alex Dream Language School · Alexandria"],
    foot: "Generated from GitHub data on",
  },
  ar: {
    role: "معلّم ICT · مطوّر تطبيقات وألعاب",
    loc: "الإسكندرية، مصر",
    sum: "معلّم ICT في مدرسة Alex Dream Language School بالإسكندرية، يبني منتجات حقيقية ويُطلقها. تسعة تطبيقات وألعاب على GitHub بالعربية والإنجليزية وتعمل بدون إنترنت — من منصة لتعلّم الإنجليزية مع تقييم النطق بالذكاء الاصطناعي إلى تطبيقات مواقيت الصلاة وألعاب التحقيق النوار.",
    h: { sum: "نبذة", work: "أبرز المشاريع", stack: "التقنيات المستخدمة", num: "GitHub بالأرقام", exp: "العمل" },
    priv: "مستودع خاص", live: "يعمل أونلاين",
    st: ["مستودعات", "كوميت", "لغات", "أيام نشاط"],
    job: ["معلّم ICT", "Alex Dream Language School · الإسكندرية"],
    foot: "أُنشئ تلقائيًا من بيانات GitHub بتاريخ",
  },
} as const;
const nf = (n: number, l: "en" | "ar") => (l === "ar" ? String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]) : String(n));
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function page(l: "en" | "ar") {
  const T = TXT[l];
  const days = gh.days.length;
  const projs = projects.map((p) => {
    const r = repoByName(p.repo);
    const flag = r.private ? T.priv : p.live ? T.live : "";
    return `<div class="p"><b>${esc(p.name[l])}</b><i>${esc(p.kind[l])}</i><div>${esc(p.tags.slice(0, 5).join(" · "))}</div>${flag ? `<em>${flag}${p.live ? " · " + p.live.replace(/^https?:\/\//, "") : ""}</em>` : ""}</div>`;
  }).join("");
  const tech = techCloud.map((t) => `<span>${esc(t.name)}</span>`).join("");
  const langs = gh.languages.filter((x) => x.bytes / totalBytes >= 0.01).slice(0, 6).map((x) => `<span>${esc(x.name)} ${Math.round((x.bytes / totalBytes) * 100)}%</span>`).join("");
  return `<!doctype html><html lang="${l}"><meta charset="utf-8"><style>${css}</style><body class="${l}"><div class="bar"></div>
<header><img class="ph" src="file:///home/ubuntu/walidfolio/public/img/walid.webp"><div><h1>${l === "ar" ? "وليد سيد ياسين إبراهيم" : "Walid Sayed Yaseen Ibrahim"}</h1><div class="role">${T.role}</div>
<div class="ct"><span>${T.loc}</span><span>${gh.profile.email}</span><span>github.com/${gh.profile.login}</span><span>walidelsayedgemini-dev.github.io</span></div></div></header>
<h2>${T.h.sum}</h2><p class="sum">${T.sum}</p>
<h2>${T.h.exp}</h2><div class="p"><b>${T.job[0]}</b><div>${T.job[1]}</div></div>
<h2>${T.h.work}</h2><div class="pr">${projs}</div>
<h2>${T.h.stack}</h2><div class="sk">${tech}</div>
<h2>${T.h.num}</h2><div class="st"><div><b>${nf(gh.repos.length, l)}</b>${T.st[0]}</div><div><b>${nf(gh.totalCommits, l)}</b>${T.st[1]}</div><div><b>${nf(gh.languages.length, l)}</b>${T.st[2]}</div><div><b>${nf(days, l)}</b>${T.st[3]}</div><div><b dir="ltr">${fmtBytes(totalBytes)}</b>${l === "ar" ? "كود" : "code"}</div></div>
<div class="sk" style="margin-top:2.5mm">${langs}</div>
<footer><span>${T.foot} ${gh.generatedAt.slice(0, 10)}</span><span dir="ltr">walidelsayedgemini-dev.github.io</span></footer></body></html>`;
}
for (const l of ["en", "ar"] as const) writeFileSync(`/tmp/cv-${l}.html`, page(l));
console.log("ok");
