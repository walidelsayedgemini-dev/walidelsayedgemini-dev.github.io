import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Lock, X } from "lucide-react";
import { useI18n } from "../i18n";
import { projectData, type Project } from "../data/projects";
import { highlights, previews } from "../data/highlights";
import { LANG_COLORS, fmtBytes } from "../data/github";
import { asset, fmtDay, GithubIcon } from "../lib/util";

export function ProjectModal({ p, onClose }: { p: Project; onClose: () => void }) {
  const { t, pick, lang, num } = useI18n();
  const d = projectData(p);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const items = highlights[p.id] ?? [];
  const video = previews[p.id];

  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [onClose]);

  const total = Object.values(d.languages).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(d.languages)
    .sort((a, b) => b[1] - a[1])
    .filter(([, b]) => b / total >= 0.01)
    .slice(0, 5);

  return createPortal(
    <motion.div className="pm-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div
        className="pm"
        role="dialog"
        aria-modal
        aria-label={pick(p.name)}
        style={{ ["--c" as string]: p.color }}
        initial={{ y: 40, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 24, scale: 0.98, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onMouseDown={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <button ref={closeBtn} className="pm-x" onClick={onClose} aria-label={t("modal.close")}>
          <X size={18} />
        </button>

        <div className="pm-media">
          {video ? (
            <>
              <img className="bg" src={asset(p.cover)} alt="" />
              <video src={asset(video)} poster={asset(p.cover)} autoPlay muted loop playsInline preload="metadata" />
            </>
          ) : (
            <img src={asset(p.cover)} alt="" />
          )}
          <span className="pm-cap">{video ? t("modal.preview") : pick(p.kind)}</span>
        </div>

        <div className="pm-body">
          <div className="card-kind">{pick(p.kind)}</div>
          <h3>{pick(p.name)}</h3>
          <p className="pm-desc">{pick(p.desc)}</p>
          <div className="pm-actions">
            {p.live && (
              <a className="btn primary" href={p.live} target="_blank" rel="noreferrer">
                {t("work.live")} <ArrowUpRight size={16} />
              </a>
            )}
            {d.private ? (
              <span className="btn ghost dis">
                <Lock size={14} /> {t("work.private")}
              </span>
            ) : (
              <a className="btn ghost" href={d.url} target="_blank" rel="noreferrer">
                <GithubIcon width={15} height={15} /> {t("work.repo")}
              </a>
            )}
          </div>

          {items.length > 0 && (
            <>
              <h4>{t("modal.highlights")}</h4>
              <ul className="pm-list">
                {items.map((h, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: lang === "ar" ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.07 }}>
                    {pick(h)}
                  </motion.li>
                ))}
              </ul>
            </>
          )}

          <h4>{t("modal.stack")}</h4>
          <div className="tags">
            {p.tags.map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>

          <h4>{t("modal.facts")}</h4>
          <div className="pm-facts">
            <div>
              <b>{num(d.commits)}</b>
              <small>{t("work.commits")}</small>
            </div>
            <div>
              <b>{fmtDay(d.createdAt, lang, { month: "short", day: "numeric" })}</b>
              <small>{t("modal.first")}</small>
            </div>
            <div>
              <b>{fmtBytes(total)}</b>
              <small>{t("modal.size")}</small>
            </div>
          </div>
          <div className="pm-langs" aria-label={t("modal.langs")}>
            {langs.map(([n, b]) => (
              <span key={n} style={{ flexGrow: b, background: LANG_COLORS[n] ?? "#64748b" }} title={`${n} ${Math.round((b / total) * 100)}%`} />
            ))}
          </div>
          <div className="pm-langs-l">
            {langs.map(([n, b]) => (
              <span key={n}>
                <i style={{ background: LANG_COLORS[n] ?? "#64748b" }} />
                {n} <em>{Math.round((b / total) * 100)}%</em>
              </span>
            ))}
          </div>

        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
