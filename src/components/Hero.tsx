import { Mark } from "./Mark";
import { extra, hasJourney } from "../data/extra";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Search, Languages, Menu, X, Sun, Moon, Volume2, VolumeX, Download, Mail } from "lucide-react";
import { useTheme, useSound } from "../lib/prefs";
import { useI18n, type Key } from "../i18n";
import { asset, scrollToId, GithubIcon, usePrefersReduced } from "../lib/util";
import { EMAIL } from "../data/github";
import { gh } from "../data/github";

export const SECTIONS: { id: string; key: Key }[] = [
  { id: "work", key: "nav.work" },
  { id: "services", key: "nav.services" },
  { id: "stack", key: "nav.stack" },
  { id: "about", key: "nav.about" },
  ...(hasJourney ? [{ id: "journey", key: "nav.journey" as Key }] : []),
  { id: "contact", key: "nav.contact" },
];

function Logo() {
  return (
    <a href="#top" className="logo" onClick={(e) => (e.preventDefault(), scrollToId("top"))} aria-label="Walid Sayed">
      <Mark size={32} loop id="nav" />
      <span>walid.sayed</span>
    </a>
  );
}

export function Nav({ openPalette }: { openPalette: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const { on: sfx, toggle: toggleSfx } = useSound();
  useEffect(() => {
    document.body.classList.toggle("locked", menu);
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [menu]);
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
        <a className="chip-btn cv-btn" href={asset(extra.cvUrl[lang])} target="_blank" rel="noreferrer" download>
          <Download size={14} />
          <span>{t("nav.cv")}</span>
        </a>
        <button className="chip-btn" onClick={openPalette} aria-label={t("nav.search")}>
          <Search size={14} />
          <span className="lbl">{t("nav.search")}</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button className="chip-btn" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label="Language">
          <Languages size={14} />
          <span>{lang === "en" ? "عربي" : "EN"}</span>
        </button>
        <button className="chip-btn icon" onClick={toggleSfx} aria-label={t("nav.sound")} aria-pressed={sfx} title={t("nav.sound")}>
          {sfx ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
        <button className="chip-btn icon" onClick={toggleTheme} aria-label={t("nav.theme")} title={t("nav.theme")}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="chip-btn burger" onClick={() => setMenu((m) => !m)} aria-label="Menu" aria-expanded={menu}>
          {menu ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>
      <div className={`sheet${menu ? " open" : ""}`} aria-hidden={!menu}>
        <nav>
          {SECTIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{ transitionDelay: `${menu ? 80 + i * 60 : 0}ms` }}
              onClick={(e) => (e.preventDefault(), setMenu(false), setTimeout(() => scrollToId(s.id), 60))}
            >
              <small className="mono">0{i + 1}</small>
              {t(s.key)}
            </a>
          ))}
        </nav>
        <div className="sheet-foot">
          <a href={gh.profile.html_url} target="_blank" rel="noreferrer">
            <GithubIcon /> GitHub
          </a>
          <button onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} {t("nav.theme")}
          </button>
          <button onClick={() => (setMenu(false), openPalette())}>
            <Search size={14} /> {t("nav.search")}
          </button>
        </div>
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

export function Hero({ ready }: { ready: boolean }) {
  const { t, num, lang } = useI18n();
  const d = ready ? 0.1 : 99;
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 520], [1, 0]);
  const lift = useTransform(scrollY, [0, 520], [0, -70]);
  const lift2 = useTransform(scrollY, [0, 520], [0, 50]);
  const ring = "FULL-STACK · MOBILE · REACT · TYPESCRIPT · FLUTTER · NODE · ";
  return (
    <section className="hero" id="top">
      <div className="hero-fade" />
      <div className="wrap hero-grid" style={{ width: "100%" }}>
        <motion.div style={{ opacity: fade, y: lift }}>
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
            <span className="slash">//</span> <span className="role-fixed">{t("hero.role")}</span>
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
            <a className="btn ghost" href={asset(extra.cvUrl[lang])} target="_blank" rel="noreferrer" download>
              <Download size={16} /> {t("hero.cta2")}
            </a>
            <a className="btn text" href={`mailto:${EMAIL}`} onClick={(e) => (e.preventDefault(), scrollToId("contact"))}>
              <Mail size={16} /> {t("hero.cta3")}
            </a>
          </motion.div>
        </motion.div>
        <motion.div style={{ y: lift2, opacity: fade }}>

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
            {t("hero.badge")}
          </div>
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
