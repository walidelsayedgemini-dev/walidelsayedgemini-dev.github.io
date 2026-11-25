import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useI18n } from "../i18n";
import { gh, LOGIN, activeDays } from "../data/github";

/* ---------------- Boot sequence ---------------- */
export function Boot({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const lines = useRef([
    `<b>$</b> gh auth status`,
    `<i>✓</i> Logged in as <b>${LOGIN}</b>`,
    `<b>$</b> git clone --all github.com/${LOGIN}`,
    `<i>✓</i> ${gh.repos.length} repositories · ${gh.totalCommits} commits · ${gh.languages.length} languages · ${activeDays} active days`,
    `<b>$</b> pnpm dev --portfolio walid`,
  ]).current;
  const [shown, setShown] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    document.body.classList.add("locked");
    const timers: number[] = [];
    lines.forEach((_, i) => timers.push(window.setTimeout(() => setShown(i + 1), 320 + i * 430)));
    timers.push(window.setTimeout(() => setExit(true), 320 + lines.length * 430 + 350));
    const skip = () => setExit(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [lines]);

  useEffect(() => {
    if (!exit) return;
    const id = window.setTimeout(() => {
      document.body.classList.remove("locked");
      onDone();
    }, 700);
    return () => clearTimeout(id);
  }, [exit, onDone]);

  return (
    <motion.div
      className="boot"
      initial={{ clipPath: "inset(0 0 0 0)" }}
      animate={{ clipPath: exit ? "inset(0 0 100% 0)" : "inset(0 0 0 0)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      role="status"
      aria-label="Loading"
    >
      <div className="boot-inner">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className="boot-line" dangerouslySetInnerHTML={{ __html: l }} />
        ))}
        <div className="boot-line">
          <span className="boot-caret" />
        </div>
        <div className="boot-bar">
          <motion.span initial={{ width: "0%" }} animate={{ width: `${(shown / lines.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div className="boot-skip">{t("boot.skip")}</div>
      </div>
    </motion.div>
  );
}

/* ---------------- Custom cursor ---------------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const hot = !!(e.target as HTMLElement)?.closest?.("a,button,[data-hot],input");
      ring.current?.classList.toggle("hot", hot);
    };
    const loop = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}

/* ---------------- Scroll progress ---------------- */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const sx = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return <motion.div className="progress" style={{ scaleX: sx }} aria-hidden />;
}

/* ---------------- Marquee ---------------- */
export function Marquee({ items, reverse }: { items: { name: string; repos?: number }[]; reverse?: boolean }) {
  const row = (k: string) =>
    items.map((it, i) => (
      <span className="marquee-item" key={k + i}>
        <span>
          {it.name}
          {it.repos ? <em>×{it.repos}</em> : null}
        </span>
      </span>
    ));
  return (
    <div className={`marquee${reverse ? " rev" : ""}`} aria-hidden>
      <div className="marquee-track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

export function Presence({ children }: { children: React.ReactNode }) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
