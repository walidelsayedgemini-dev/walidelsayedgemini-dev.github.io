import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight, Lock, Radio } from "lucide-react";
import { useI18n } from "../i18n";
import { projects, projectData, type Project } from "../data/projects";
const ProjectModal = lazy(() => import("./ProjectModal").then((m) => ({ default: m.ProjectModal })));
import { asset, useMedia, usePrefersReduced, GithubIcon } from "../lib/util";

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
        <span className="card-idx">{String(i + 1).padStart(2, "0")}</span>
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

export function Work() {
  const { t, num, dir } = useI18n();
  const wide = useMedia("(min-width: 901px)");
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [h, setH] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      const d = Math.max(0, track.current.scrollWidth - window.innerWidth);
      setDist(d);
      setH(d + window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [wide, dir]);

  const { scrollYProgress } = useScroll({ target: pin, offset: ["start start", "end end"] });
  const sign = dir === "rtl" ? 1 : -1;
  const x = useTransform(scrollYProgress, [0, 1], [0, sign * dist]);
  const smooth = useSpring(x, { stiffness: 120, damping: 28, mass: 0.4 });
  const [cur, setCur] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => setOpenId((e as CustomEvent<string>).detail);
    window.addEventListener("open-project", h);
    return () => window.removeEventListener("open-project", h);
  }, []);
  const openProject = projects.find((x) => x.id === openId);
  useLayoutEffect(() => scrollYProgress.on("change", (v) => setCur(Math.min(projects.length, Math.floor(v * projects.length) + 1))), [scrollYProgress]);

  return (
    <section id="work">
      <div className="wrap work-head">
        <div className="kicker">{t("work.kicker")}</div>
        <h2 className="h2">{t("work.title")}</h2>
        <p className="lead">{t("work.sub")}</p>
      </div>
      <div className="work-pin" ref={pin} style={wide ? { height: h || "100svh" } : undefined}>
        <div className="work-sticky">
          {wide && (
            <div className="work-meter" aria-hidden>
              <span>
                {num(cur).padStart(2, dir === "rtl" ? "٠" : "0")} / {num(projects.length).padStart(2, dir === "rtl" ? "٠" : "0")}
              </span>
              <div className="bar">
                <motion.span style={{ scaleX: scrollYProgress }} />
              </div>
            </div>
          )}
          <motion.div className="work-track" ref={track} style={wide ? { x: smooth } : undefined}>
            {projects.map((p, i) => (
              <Card key={p.id} p={p} i={i} onOpen={() => setOpenId(p.id)} />
            ))}
          </motion.div>
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
