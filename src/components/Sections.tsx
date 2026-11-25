import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useI18n } from "../i18n";
import { gh, totalBytes, LANG_COLORS, fmtBytes, repoByName } from "../data/github";
import { techCloud } from "../data/projects";
import { projects } from "../data/projects";
import { fmtDay } from "../lib/util";
import { Marquee } from "./Chrome";

/* ---------------------------------- STACK ---------------------------------- */
export function Stack() {
  const { t, lang, num } = useI18n();
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
              <div
                key={s.name}
                className="seg"
                style={{ background: s.color, flexGrow: s.bytes }}
                title={`${s.name} — ${fmtBytes(s.bytes)}`}
                data-i={i}
              >
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

        <p className="big-total">
          <b className="ltr">{fmtBytes(totalBytes)}</b> {t("stack.total")} · {num(gh.languages.length)} {t("stats.langs")}
        </p>
      </div>

      <div className="tech-wrap" aria-label={lang === "ar" ? "التقنيات المستخدمة" : "Technologies used"}>
        <Marquee items={techCloud.slice(0, 14)} />
        <Marquee items={techCloud.slice(14).concat(techCloud.slice(0, 5))} reverse />
      </div>
    </section>
  );
}

/* -------------------------------- TIMELINE --------------------------------- */
function dayRange() {
  const first = new Date(gh.days[0].date + "T00:00:00Z").getTime();
  const last = new Date(gh.days[gh.days.length - 1].date + "T00:00:00Z").getTime();
  const out: string[] = [];
  for (let t = first; t <= last; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

export function Timeline() {
  const { t, lang, num, pick } = useI18n();
  const hmRef = useRef<HTMLDivElement>(null);
  const hmIn = useInView(hmRef, { once: true, margin: "-5%" });
  const days = dayRange();
  const byDay = new Map(gh.days.map((d) => [d.date, d]));
  const peak = gh.days.reduce((a, b) => (b.count > a.count ? b : a));
  const first = [...gh.repos].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
  const maxCell = Math.max(...gh.days.flatMap((d) => Object.values(d.repos)));
  const maxDay = peak.count;
  const rows = projects.map((p) => ({ p, d: repoByName(p.repo) })).sort((a, b) => a.d.createdAt.localeCompare(b.d.createdAt));
  const feed = gh.feed.slice(0, 40);
  const cols = { ["--cols" as string]: days.length } as React.CSSProperties;

  return (
    <section className="timeline" id="timeline">
      <div className="wrap">
        <div className="kicker">{t("tl.kicker")}</div>
        <h2 className="h2">{t("tl.title")}</h2>
        <p className="lead">{t("tl.sub")}</p>

        <div className="tl-meta">
          <div>
            <b>{num(gh.totalCommits)}</b>
            {t("tl.commits")}
          </div>
          <div>
            <b>{fmtDay(peak.date, lang)}</b>
            {t("tl.peak")} · {num(peak.count)} {t("tl.commits")}
          </div>
          <div>
            <b>{fmtDay(first.createdAt, lang, { month: "short", day: "numeric", year: "numeric" })}</b>
            {t("tl.first")} · {first.name}
          </div>
        </div>

        <div className="hm-scroll">
          <div className="hm" style={cols} ref={hmRef}>
            <div className="bars" style={cols} aria-hidden>
              <span />
              {days.map((d, i) => {
                const c = byDay.get(d)?.count ?? 0;
                return (
                  <motion.div
                    key={d}
                    className="b"
                    style={{ height: `${Math.max(2, (c / maxDay) * 100)}%`, opacity: c ? 1 : 0.15 }}
                    initial={{ scaleY: 0 }}
                    animate={hmIn ? { scaleY: 1 } : {}}
                    transition={{ delay: i * 0.04, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {c > 20 && <em>{c}</em>}
                  </motion.div>
                );
              })}
              <span />
            </div>
            <div className="hm-row hm-head" style={cols}>
              <span />
              {days.map((d) => (
                <div className="hm-cell" key={d}>
                  {new Date(d + "T00:00:00Z").getUTCDate()}
                </div>
              ))}
              <span />
            </div>
            {rows.map(({ p, d }, ri) => (
              <div className="hm-row" key={p.id} style={cols}>
                <span className="hm-name ltr">{d.name}</span>
                {days.map((day, ci) => {
                  const c = byDay.get(day)?.repos[d.name] ?? 0;
                  const a = c ? 0.18 + 0.82 * Math.sqrt(c / maxCell) : 0;
                  return (
                    <motion.div
                      key={day}
                      className={`hm-cell${c ? " on" : ""}`}
                      style={c ? ({ ["--a" as string]: a.toFixed(2) } as React.CSSProperties) : undefined}
                      initial={{ opacity: 0, scale: 0.4 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: ri * 0.05 + ci * 0.02, duration: 0.4 }}
                    >
                      {c > 0 && (
                        <span className="hm-tip">
                          {pick(p.name)} · {fmtDay(day, lang)} · {num(c)}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
                <span className="hm-tot">{num(d.commits)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="term" role="log" aria-label={t("tl.feed")}>
          <div className="term-bar">
            <i style={{ background: "#ff5f57" }} />
            <i style={{ background: "#febc2e" }} />
            <i style={{ background: "#28c840" }} />
            <span>{t("tl.feed")}</span>
          </div>
          <div className="term-body">
            <div className="term-scroll">
              {[...feed, ...feed].map((f, i) => (
                <div className="log" key={i}>
                  <span className="d">{f.date.slice(0, 16).replace("T", " ")}</span>
                  <span className="r">{f.repo}</span>
                  <span className="m">{f.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
