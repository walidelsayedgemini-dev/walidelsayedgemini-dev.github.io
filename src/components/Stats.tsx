import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../i18n";
import { gh, LOGIN } from "../data/github";
import { techCloud, projects } from "../data/projects";
import { useCountUp, timeAgo } from "../lib/util";
import { Marquee } from "./Chrome";

function Stat({ to, label, sub, i }: { to: number; label: string; sub: string; i: number }) {
  const { num } = useI18n();
  const { ref, val } = useCountUp(to);
  return (
    <motion.div
      className="stat"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="n" ref={ref as React.RefObject<HTMLDivElement>}>
        {num(val)}
      </div>
      <div className="l">{label}</div>
      <div className="s">{sub}</div>
    </motion.div>
  );
}

interface Live {
  publicRepos: number;
  pushedAt: string;
}

function useLive(): Live | null {
  const [live, setLive] = useState<Live | null>(null);
  useEffect(() => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 7000);
    (async () => {
      try {
        const [u, r] = await Promise.all([
          fetch(`https://api.github.com/users/${LOGIN}`, { signal: ctl.signal }).then((x) => (x.ok ? x.json() : Promise.reject())),
          fetch(`https://api.github.com/users/${LOGIN}/repos?sort=pushed&per_page=1`, { signal: ctl.signal }).then((x) => (x.ok ? x.json() : Promise.reject())),
        ]);
        setLive({ publicRepos: u.public_repos, pushedAt: r[0]?.pushed_at ?? gh.generatedAt });
      } catch {
        /* offline / rate-limited: keep the baked snapshot */
      }
    })();
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, []);
  return live;
}

export function Stats() {
  const { t, lang, num } = useI18n();
  const live = useLive();
  const liveCount = projects.filter((p) => p.live).length;
  return (
    <>
      <Marquee items={techCloud.slice(0, 14)} />
      <section className="stats" id="stats">
        <div className="wrap">
          <div className="stats-head">
            <div>
              <div className="kicker">{t("stats.kicker")}</div>
              <h2 className="h2" style={{ marginBottom: 0 }}>
                {t("stats.title")}
              </h2>
            </div>
            <div className={`live-pill${live ? "" : " off"}`} role="status">
              <span className="dot-live" />
              <b>{live ? t("live.on") : t("live.off")}</b>
              {live ? (
                <>
                  <span>
                    {num(live.publicRepos)} {t("live.public")}
                  </span>
                  <span>
                    · {t("live.push")}: {timeAgo(live.pushedAt, lang)}
                  </span>
                </>
              ) : (
                <span>
                  {t("live.synced")}: {new Date(gh.generatedAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium" })}
                </span>
              )}
            </div>
          </div>
          <div className="stat-grid">
            <Stat i={0} to={projects.length} label={t("stats.repos")} sub={t("stats.repos.sub")} />
            <Stat i={1} to={liveCount} label={t("stats.live")} sub={t("stats.live.sub")} />
            <Stat i={2} to={gh.totalCommits} label={t("stats.commits")} sub={t("stats.commits.sub")} />
            <Stat i={3} to={techCloud.length} label={t("stats.tech")} sub={t("stats.tech.sub")} />
          </div>
        </div>
      </section>
    </>
  );
}
