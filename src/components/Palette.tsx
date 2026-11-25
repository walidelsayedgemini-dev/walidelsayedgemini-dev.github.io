import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CornerDownLeft, Hash, Rocket, Globe, Mail, Languages } from "lucide-react";
import { useI18n } from "../i18n";
import { projects, projectData } from "../data/projects";
import { gh, EMAIL, FACEBOOK } from "../data/github";
import { extra } from "../data/extra";
import { asset } from "../lib/util";
import { scrollToId, GithubIcon, FacebookIcon } from "../lib/util";
import { SECTIONS } from "./Hero";

interface Item {
  group: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function Palette({ onClose, onCopied }: { onClose: () => void; onCopied: () => void }) {
  const { t, pick, lang, setLang } = useI18n();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const items = useMemo<Item[]>(() => {
    const out: Item[] = [];
    SECTIONS.forEach((s) =>
      out.push({ group: t("pal.sections"), label: t(s.key), hint: `#${s.id}`, icon: <Hash />, run: () => scrollToId(s.id) }),
    );
    projects.forEach((p) => {
      const d = projectData(p);
      out.push({
        group: t("pal.projects"),
        label: pick(p.name),
        hint: d.private ? "private" : p.live ? "live" : "repo",
        icon: <Rocket />,
        run: () => window.dispatchEvent(new CustomEvent("open-project", { detail: p.id })),
      });
    });
    out.push(
      { group: t("pal.actions"), label: t("pal.lang"), icon: <Languages />, run: () => setLang(lang === "en" ? "ar" : "en") },
      { group: t("pal.actions"), label: t("pal.gh"), icon: <GithubIcon />, run: () => window.open(gh.profile.html_url, "_blank", "noopener") },
      ...(extra.cvUrl[lang] ? [{ group: t("pal.actions"), label: t("pal.cv"), icon: <Mail />, run: () => window.open(asset(extra.cvUrl[lang]), "_blank", "noopener") }] : []),
      ...(FACEBOOK ? [{ group: t("pal.actions"), label: t("pal.fb"), icon: <FacebookIcon />, run: () => window.open(FACEBOOK, "_blank", "noopener") }] : []),
      {
        group: t("pal.actions"),
        label: t("pal.mail"),
        hint: EMAIL,
        icon: <Mail />,
        run: () => navigator.clipboard?.writeText(EMAIL).then(onCopied, onCopied),
      },
      { group: t("pal.actions"), label: "Language: " + lang.toUpperCase(), icon: <Globe />, run: () => setLang(lang === "en" ? "ar" : "en") },
    );
    return out;
  }, [t, pick, lang, setLang, onCopied]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => (i.label + " " + (i.hint ?? "") + " " + i.group).toLowerCase().includes(s)) : items;
  }, [items, q]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    list.current?.querySelector<HTMLElement>(".sel")?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const run = (i: Item | undefined) => {
    if (!i) return;
    onClose();
    setTimeout(i.run, 120);
  };

  let lastGroup = "";
  return (
    <motion.div className="pal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
      <motion.div
        className="pal"
        role="dialog"
        aria-modal
        aria-label="Command palette"
        initial={{ y: -20, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("pal.placeholder")}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setSel((s) => Math.min(filtered.length - 1, s + 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setSel((s) => Math.max(0, s - 1)));
            if (e.key === "Enter") run(filtered[sel]);
          }}
        />
        <div className="pal-list" ref={list}>
          {filtered.length === 0 && <div className="pal-group">{t("pal.empty")}</div>}
          {filtered.map((it, i) => {
            const head = it.group !== lastGroup ? <div className="pal-group">{it.group}</div> : null;
            lastGroup = it.group;
            return (
              <div key={it.group + it.label + i}>
                {head}
                <button className={`pal-item${i === sel ? " sel" : ""}`} onMouseEnter={() => setSel(i)} onClick={() => run(it)}>
                  {it.icon}
                  <span>{it.label}</span>
                  {it.hint && <small className="ltr">{it.hint}</small>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="pal-foot">
          <CornerDownLeft size={11} style={{ display: "inline", verticalAlign: "-1px" }} /> {t("pal.hint")}
        </div>
      </motion.div>
    </motion.div>
  );
}
