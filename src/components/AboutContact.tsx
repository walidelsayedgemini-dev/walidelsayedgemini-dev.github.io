import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Copy, Mail, Check } from "lucide-react";
import { useI18n } from "../i18n";
import { gh, EMAIL, FACEBOOK } from "../data/github";
import { extra } from "../data/extra";
import { Mark } from "./Mark";
import { asset, fmtDay, GithubIcon, FacebookIcon, scrollToId } from "../lib/util";

const rise = (d = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-8%" },
  transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function About() {
  const { t, lang } = useI18n();
  const pic = useRef<HTMLDivElement>(null);
  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || !pic.current) return;
    const r = pic.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    pic.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  };
  const reset = () => pic.current && (pic.current.style.transform = "");
  const p = gh.profile;
  return (
    <section className="about" id="about">
      <div className="wrap about-grid">
        <motion.div className="about-photo" {...rise()} onPointerMove={tilt} onPointerLeave={reset}>
          <div className="pic" ref={pic}>
            <img src={asset("img/walid.webp")} alt={p.name} loading="lazy" width={460} height={460} />
            <div className="coords ltr">31.2001° N · 29.9187° E · Alexandria</div>
          </div>
          <div className="facts">
            <div className="fact">
              <span>{t("about.role")}</span>
              <span>{t("about.roleV")}</span>
            </div>
            <div className="fact">
              <span>{t("about.school")}</span>
              <span className="ltr">{t("about.schoolV")}</span>
            </div>
            <div className="fact">
              <span>{t("about.where")}</span>
              <span>{t("about.whereV")}</span>
            </div>
            <div className="fact">
              <span>{t("about.since")}</span>
              <span>{fmtDay(p.created_at, lang, { month: "long", year: "numeric" })}</span>
            </div>
            <div className="fact">
              <span>{t("about.builds")}</span>
              <span>{t("about.buildsV")}</span>
            </div>
          </div>
        </motion.div>

        <div className="about-text">
          <motion.div className="kicker" {...rise()}>
            {t("about.kicker")}
          </motion.div>
          <motion.h2 className="h2" {...rise(0.05)}>
            {t("about.title")}
          </motion.h2>
          <motion.p {...rise(0.1)}>{t("about.p1")}</motion.p>
          <motion.p {...rise(0.15)}>{t("about.p2")}</motion.p>
          <div className="pillars">
            {(["c1", "c2", "c3"] as const).map((k, i) => (
              <motion.div className="pillar" key={k} {...rise(0.1 * i)}>
                <div className="no">0{i + 1}</div>
                <h4>{t(`about.${k}` as "about.c1")}</h4>
                <p>{t(`about.${k}d` as "about.c1d")}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact({ onCopied }: { onCopied: () => void }) {
  const { t, lang } = useI18n();
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    onCopied();
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <motion.div className="kicker" {...rise()}>
          {t("contact.kicker")}
        </motion.div>
        <motion.h2 className="big" {...rise(0.05)}>
          {lang === "en" ? (
            <>
              Have an idea? <span className="serif">Let's ship it.</span>
            </>
          ) : (
            <>
              عندك فكرة؟ <span className="serif">خلّينا نطلقها.</span>
            </>
          )}
        </motion.h2>
        <motion.p className="lead" {...rise(0.1)}>
          {t("contact.sub")}
        </motion.p>
        <motion.div className="mail-row" {...rise(0.15)}>
          <a className="mail-big" href={`mailto:${EMAIL}`} data-hot>
            {EMAIL}
          </a>
          <button className="btn ghost" onClick={copy}>
            {done ? <Check /> : <Copy />} {done ? t("contact.copied") : t("contact.copy")}
          </button>
          <a className="btn primary" href={`mailto:${EMAIL}`}>
            <Mail /> {t("contact.mail")} <ArrowUpRight className="arr" />
          </a>
        </motion.div>
        <motion.div className="socials" {...rise(0.2)}>
          <a className="social" href={gh.profile.html_url} target="_blank" rel="noreferrer">
            <GithubIcon />
            <span>
              <small>GitHub</small>
              <span className="ltr">@{gh.profile.login}</span>
            </span>
          </a>
          {extra.cvUrl && (
            <a className="social" href={asset(extra.cvUrl)} target="_blank" rel="noreferrer" download>
              <span>
                <small>CV</small>
                {t("contact.cv")}
              </span>
            </a>
          )}
          {FACEBOOK && (
            <a className="social" href={FACEBOOK} target="_blank" rel="noreferrer">
              <FacebookIcon />
              <span>
                <small>Facebook</small>
                {lang === "ar" ? "الصفحة الشخصية" : "Profile"}
              </span>
            </a>
          )}
        </motion.div>
        <footer className="footer">
          <span className="foot-id">
            <Mark size={34} id="foot" />
            © {new Date().getFullYear()} {gh.profile.name?.split("(")[0].trim()} · {t("foot.built")} · <span className="ltr">{new Date(gh.generatedAt).toISOString().slice(0, 10)}</span>
          </span>
          <button onClick={() => scrollToId("top")}>{t("foot.top")}</button>
        </footer>
      </div>
    </section>
  );
}
