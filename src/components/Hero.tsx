import { Mark } from "./Mark";
import { hasJourney } from "../data/extra";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDown, Search, Languages } from "lucide-react";
import { useI18n, type Key } from "../i18n";
import { asset, scrollToId, GithubIcon, usePrefersReduced } from "../lib/util";
import { gh } from "../data/github";
import HeroCanvas from "./HeroCanvas";

export const SECTIONS: { id: string; key: Key }[] = [
  { id: "work", key: "nav.work" },
  { id: "stack", key: "nav.stack" },
  { id: "timeline", key: "nav.timeline" },
  { id: "about", key: "nav.about" },
  ...(hasJourney ? [{ id: "journey", key: "nav.journey" as Key }] : []),
  { id: "contact", key: "nav.contact" },
];

function Logo() {
  return (
    <a href="#top" className="logo" onClick={(e) => (e.preventDefault(), scrollToId("top"))} aria-label="Walid Sayed">
      <Mark size={44} id="nav" />
      <span>walid.sayed</span>
    </a>
  );
}

export function Nav({ openPalette }: { openPalette: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", on);
      io.disconnect();
    };
  }, []);

  return (
    <header className={`nav${solid ? " solid" : ""}`}>
      <Logo />
      <nav className="nav-links" aria-label="Sections">
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={active === s.id ? "on" : ""} onClick={(e) => (e.preventDefault(), scrollToId(s.id))}>
            {t(s.key)}
          </a>
        ))}
      </nav>
      <div className="nav-tools">
        <button className="chip-btn" onClick={openPalette} aria-label={t("nav.search")}>
          <Search size={14} />
          <span className="lbl">{t("nav.search")}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button className="chip-btn" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label="Language">
          <Languages size={14} />
          <span>{lang === "en" ? "عربي" : "EN"}</span>
        </button>
      </div>
    </header>
  );
}

function Split({ text, delay = 0 }: { text: string; delay?: number }) {
  const reduced = usePrefersReduced();
  const { lang } = useI18n();
  // Arabic letters join each other, so animate whole words instead of single characters.
  const chars = lang === "ar" ? [text] : Array.from(text);
  return (
    <>
      {chars.map((c, i) => (
        <motion.span
          className="ch"
          key={i + c}
          initial={reduced ? false : { y: "110%", rotate: 8 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ delay: delay + i * 0.045, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {c}
        </motion.span>
      ))}
    </>
  );
}

const ROLES = {
  en: ["Full-stack developer", "Flutter & React builder", "Game creator", "ICT teacher"],
  ar: ["مطوّر Full-stack", "مطوّر Flutter وReact", "صانع ألعاب", "معلّم ICT"],
};

function RoleSwap() {
  const { lang } = useI18n();
  const [i, setI] = useState(0);
  const reduced = usePrefersReduced();
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((x) => x + 1), 2400);
    return () => clearInterval(id);
  }, [reduced]);
  const list = ROLES[lang];
  const cur = list[i % list.length];
  return (
    <span className="role-swap" aria-live="off">
      <motion.span
        key={lang + cur}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {cur}
      </motion.span>
    </span>
  );
}

export function Hero({ ready }: { ready: boolean }) {
  const { t, num, lang } = useI18n();
  const d = ready ? 0.1 : 99;
  const ring = `${num(gh.repos.length)} REPOS · ${num(gh.totalCommits)} COMMITS · ALEXANDRIA · ICT TEACHER · `;
  return (
    <section className="hero" id="top">
      <HeroCanvas />
      <div className="hero-fade" />
      <div className="wrap hero-grid" style={{ width: "100%" }}>
        <div>
          <motion.div
            className="hero-kick"
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.05 }}
          >
            <span className="dot-live" /> <span>{t("hero.kicker")}</span>
          </motion.div>
          <h1 className="name" aria-label={`${t("hero.first")} ${t("hero.last")}`} key={lang}>
            <span className="row">{ready && <Split text={t("hero.first")} delay={d} />}</span>
            <span className="row outline">{ready && <Split text={t("hero.last")} delay={d + 0.25} />}</span>
          </h1>
          <motion.div
            className="role-line"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <span className="slash">//</span> <RoleSwap />
          </motion.div>
          <motion.p
            className="hero-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.05, duration: 0.8 }}
          >
            {t("hero.intro")}
          </motion.p>
          <motion.div
            className="cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <a className="btn primary" href="#work" onClick={(e) => (e.preventDefault(), scrollToId("work"))}>
              {t("hero.cta1")} <ArrowDown size={16} />
            </a>
            <a className="btn ghost" href={gh.profile.html_url} target="_blank" rel="noreferrer">
              <GithubIcon /> {t("hero.cta2")} <ArrowUpRight size={16} className="arr" />
            </a>
          </motion.div>
        </div>

        <motion.div
          className="portrait"
          initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
          animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <svg className="ring-text" viewBox="0 0 400 400" aria-hidden>
            <defs>
              <path id="circ" d="M200,200 m-176,0 a176,176 0 1,1 352,0 a176,176 0 1,1 -352,0" />
            </defs>
            <text>
              <textPath href="#circ">{ring.repeat(2)}</textPath>
            </text>
          </svg>
          <div className="frame">
            <img src={asset("img/walid.webp")} alt="Walid Sayed" width={460} height={460} fetchPriority="high" />
            <div className="tint" />
          </div>
          <div className="badge-float">
            <b>{num(gh.repos.length)}</b>
            {lang === "ar" ? "منتجات على GitHub" : "products on GitHub"}
          </div>
        </motion.div>
      </div>
      <div className="scroll-cue">
        <i /> {t("hero.scroll")}
      </div>
      <div className="hero-hint">{t("hero.hint")}</div>
    </section>
  );
}
