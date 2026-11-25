import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Lock, Radio, Check } from "lucide-react";
import { useI18n } from "../i18n";
import { projects, projectData, featured, others, type Project } from "../data/projects";
import { highlights } from "../data/highlights";
const ProjectModal = lazy(() => import("./ProjectModal").then((m) => ({ default: m.ProjectModal })));
import { asset, usePrefersReduced, GithubIcon } from "../lib/util";

function Card({ p, i, onOpen }: { p: Project; i: number; onOpen: () => void }) {
  const { t, pick, num } = useI18n();
  const d = projectData(p);
  const ref = useRef<HTMLElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sy = useSpring(ry, { stiffness: 160, damping: 18 });
  const reduced = usePrefersReduced();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || e.pointerType === "touch") return;
    const r = ref.current!.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 12);
    rx.set(-(py - 0.5) * 10);
    ref.current!.style.setProperty("--mx", `${px * 100}%`);
    ref.current!.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      ref={ref}
      className="card"
      style={{ ["--c" as string]: p.color, rotateX: sx, rotateY: sy, transformPerspective: 1100 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("a")) onOpen();
      }}
      initial={{ opacity: 0, y: 70, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      onViewportEnter={() => ref.current?.classList.add("in")}
      transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="glare" />
      <div className="card-media">
        <img className="cv" src={asset(p.cover)} alt={`${pick(p.name)} — ${pick(p.kind)}`} loading="lazy" decoding="async" width={1280} height={800} />
        <span className="card-idx">{String(i + 4).padStart(2, "0")}</span>
        {p.live ? (
          <span className="vis live">
            <Radio /> LIVE
          </span>
        ) : d.private ? (
          <span className="vis">
            <Lock /> {t("work.private")}
          </span>
        ) : (
          <span className="vis">
            <GithubIcon width={12} height={12} /> Public
          </span>
        )}
        {p.shot && (
          <div className="shot">
            <div className="bar">
              <i />
              <i />
              <i />
            </div>
            <img src={asset(p.shot)} alt="" loading="lazy" decoding="async" />
          </div>
        )}
        {p.shotM && <img className="shotm" src={asset(p.shotM)} alt="" loading="lazy" decoding="async" />}
      </div>
      <div className="card-body">
        <div className="card-kind">{pick(p.kind)}</div>
        <h3>{pick(p.name)}</h3>
        <p>{pick(p.desc)}</p>
        <div className="tags">
          {p.tags.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="card-foot">
          <span className="cm">
            {num(d.commits)} {t("work.commits")}
          </span>
          <div className="card-links">
            <button className="lnk" onClick={onOpen}>
              {t("work.details")}
            </button>
            {p.live && (
              <a className="lnk main" href={p.live} target="_blank" rel="noreferrer">
                {t("work.live")} <ArrowUpRight />
              </a>
            )}
            {d.private ? (
              <span className="lnk dis">
                <Lock /> {t("work.private")}
              </span>
            ) : (
              <a className="lnk" href={d.url} target="_blank" rel="noreferrer">
                <GithubIcon width={12} height={12} /> {t("work.repo")}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function Case({ p, i, onOpen }: { p: Project; i: number; onOpen: () => void }) {
  const { t, pick, num } = useI18n();
  const d = projectData(p);
  const items = (highlights[p.id] ?? []).slice(0, 3);
  const total = Object.values(d.languages).reduce((a, b) => a + b, 0) || 1;
  const langs = Object.entries(d.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n, b]) => `${n} ${Math.round((b / total) * 100)}%`);
  return (
    <motion.article
      className={`case${i % 2 ? " flip" : ""}`}
      style={{ ["--c" as string]: p.color }}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="case-media" onClick={onOpen} aria-label={`${pick(p.name)} — ${t("work.details")}`}>
        <img className="cv" src={asset(p.cover)} alt="" loading="lazy" decoding="async" width={1280} height={800} />
        {p.shot && (
          <div className="shot">
            <div className="bar">
              <i />
              <i />
              <i />
            </div>
            <img src={asset(p.shot)} alt="" loading="lazy" decoding="async" />
          </div>
        )}
        {p.shotM && <img className="shotm" src={asset(p.shotM)} alt="" loading="lazy" decoding="async" />}
        <span className="vis live">
          <Radio /> LIVE
        </span>
      </button>
      <div className="case-body">
        <div className="case-top mono">
          <span>{String(i + 1).padStart(2, "0")}</span>
          <i />
          <span>{t("work.featured")}</span>
        </div>
        <div className="card-kind">{pick(p.kind)}</div>
        <h3>{pick(p.name)}</h3>
        <p className="case-desc">{pick(p.desc)}</p>
        <dl className="case-facts">
          {p.role && (
            <div>
              <dt>{t("work.role")}</dt>
              <dd>{pick(p.role)}</dd>
            </div>
          )}
          {p.platform && (
            <div>
              <dt>{t("work.platform")}</dt>
              <dd>{pick(p.platform)}</dd>
            </div>
          )}
        </dl>
        {items.length > 0 && (
          <>
            <div className="case-label">{t("work.built")}</div>
            <ul className="case-list">
              {items.map((h, k) => (
                <li key={k}>
                  <Check size={15} />
                  <span>{pick(h)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <div className="tags">
          {p.tags.map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>
        <div className="case-metrics mono">
          <span>
            <b>{num(d.commits)}</b> {t("work.commits")}
          </span>
          <span className="ltr">{langs.join(" · ")}</span>
        </div>
        <div className="case-cta">
          {p.live && (
            <a className="btn primary" href={p.live} target="_blank" rel="noreferrer">
              {t("work.live")} <ArrowUpRight size={16} className="arr" />
            </a>
          )}
          <button className="btn ghost" onClick={onOpen}>
            {t("modal.highlights")}
          </button>
          {d.private ? (
            <span className="lnk dis">
              <Lock /> {t("work.private")}
            </span>
          ) : (
            <a className="lnk" href={d.url} target="_blank" rel="noreferrer">
              <GithubIcon width={12} height={12} /> {t("work.repo")}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
export function Work() {
  const { t } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => setOpenId((e as CustomEvent<string>).detail);
    window.addEventListener("open-project", h);
    const m = location.hash.match(/^#p\/([\w-]+)/);
    let id = 0;
    if (m && projects.some((x) => x.id === m[1])) {
      id = window.setTimeout(() => {
        document.getElementById("work")?.scrollIntoView();
        setOpenId(m[1]);
      }, sessionStorage.getItem("booted") === "1" ? 400 : 1900);
    }
    return () => {
      window.removeEventListener("open-project", h);
      clearTimeout(id);
    };
  }, []);
  useEffect(() => {
    const base = location.pathname + location.search;
    history.replaceState(null, "", openId ? `${base}#p/${openId}` : location.hash.startsWith("#p/") ? `${base}#work` : location.href.replace(location.origin, ""));
  }, [openId]);
  const openProject = projects.find((x) => x.id === openId);
  return (
    <section id="work">
      <div className="wrap work-head">
        <div className="kicker">{t("work.kicker")}</div>
        <h2 className="h2">{t("work.title")}</h2>
        <p className="lead">{t("work.sub")}</p>
      </div>
      <div className="wrap cases">
        {featured.map((p, i) => (
          <Case key={p.id} p={p} i={i} onOpen={() => setOpenId(p.id)} />
        ))}
      </div>
      <div className="wrap">
        <div className="more-head">
          <h3>{t("work.more")}</h3>
          <span className="mono">{String(others.length).padStart(2, "0")}</span>
        </div>
        <div className="work-grid">
          {others.map((p, i) => (
            <Card key={p.id} p={p} i={i} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      </div>
      <AnimatePresence>{openProject && (
          <Suspense fallback={null}>
            <ProjectModal p={openProject} onClose={() => setOpenId(null)} />
          </Suspense>
        )}</AnimatePresence>
    </section>
  );
}
