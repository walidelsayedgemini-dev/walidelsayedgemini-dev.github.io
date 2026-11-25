import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useI18n } from "../i18n";
import { Mark } from "./Mark";

/* ---------------- Preloader: the monogram draws itself ---------------- */
export function Boot({ onDone, onExit }: { onDone: () => void; onExit?: () => void }) {
  const { lang } = useI18n();
  const [exit, setExit] = useState(false);
  useEffect(() => {
    document.body.classList.add("locked");
    const t = window.setTimeout(() => setExit(true), 2700);
    const skip = () => setExit(true);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, []);
  useEffect(() => {
    if (!exit) return;
    onExit?.();
    const id = window.setTimeout(() => {
      document.body.classList.remove("locked");
      onDone();
    }, 900);
    return () => clearTimeout(id);
  }, [exit, onDone, onExit]);
  return (
    <motion.div
      className="boot"
      initial={{ opacity: 1 }}
      animate={{ opacity: exit ? 0 : 1, scale: exit ? 1.04 : 1 }}
      transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
      role="status"
      aria-label="Loading"
    >
      <div className="boot-halo" />
      <div className="boot-stack">
        <Mark size={150} animate id="boot" />
        <motion.div className="boot-name" initial={{ opacity: 0, y: 14, letterSpacing: "0.5em" }} animate={{ opacity: 1, y: 0, letterSpacing: "0.34em" }} transition={{ duration: 1.1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          WALID SAYED
        </motion.div>
        <motion.div className="boot-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 1.0 }}>
          {lang === "ar" ? "مطوّر برمجيات · الإسكندرية" : "Software developer · Alexandria"}
        </motion.div>
        <div className="boot-line2"><motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.7, ease: [0.65, 0, 0.35, 1] }} /></div>
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
