import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "../i18n";
import { gh, totalBytes, LANG_COLORS, fmtBytes } from "../data/github";
import { techCloud, skillGroups } from "../data/projects";
const ALIAS: Record<string, string> = { "Node.js / Express": "Express" };
const count = (name: string) => techCloud.find((t) => t.name === (ALIAS[name] ?? name))?.repos;
/* ---------------------------------- SKILLS ---------------------------------- */
export function Stack() {
  const { t, num, pick } = useI18n();
  const barRef = useRef<HTMLDivElement>(null);
  const barIn = useInView(barRef, { once: true, margin: "-10%" });
  const top = gh.languages.slice(0, 7);
  const rest = gh.languages.slice(7).reduce((a, l) => a + l.bytes, 0);
  const segs = [...top.map((l) => ({ ...l, color: LANG_COLORS[l.name] ?? "#64748b" })), { name: t("stack.other"), bytes: rest, color: "#475569" }];
  return (
    <section className="stack" id="stack">
      <div className="wrap">
        <div className="kicker">{t("stack.kicker")}</div>
        <h2 className="h2">{t("stack.title")}</h2>
        <p className="lead">{t("stack.sub")}</p>
        <div className="skills">
          {skillGroups.map((g, i) => (
            <motion.div
              className="skill-group"
              key={g.title.en}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3>
                <span className="mono">0{i + 1}</span> {pick(g.title)}
              </h3>
              <ul>
                {g.items.map((it) => {
                  const c = count(it);
                  return (
                    <li key={it} className="ltr">
                      {it}
                      {c ? <em>×{c}</em> : null}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="bar-head">
          <span>{t("stack.bar")}</span>
          <span className="mono ltr">
            {fmtBytes(totalBytes)} · {num(gh.languages.length)} {t("stats.langs")}
          </span>
        </div>
        <div ref={barRef}>
          <motion.div
            className="langbar"
            role="img"
            aria-label="Language share"
            initial={{ clipPath: "inset(0 100% 0 0 round 14px)" }}
            animate={barIn ? { clipPath: "inset(0 0% 0 0 round 14px)" } : {}}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {segs.map((s, i) => {
              const pct = (s.bytes / totalBytes) * 100;
              return (
                <div key={s.name} className="seg" style={{ background: s.color, flexGrow: s.bytes }} title={`${s.name} — ${fmtBytes(s.bytes)}`} data-i={i}>
                  {pct > 6 && <span>{s.name}</span>}
                </div>
              );
            })}
          </motion.div>
        </div>
        <div className="legend">
          {segs.map((s) => (
            <div className="legend-row" key={s.name}>
              <i style={{ background: s.color }} />
              <span>{s.name}</span>
              <span className="pct ltr">{((s.bytes / totalBytes) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
