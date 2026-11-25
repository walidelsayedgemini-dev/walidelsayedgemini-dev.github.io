import { useCallback, useEffect, useState } from "react";
/* ---------- Theme (dark / light) ---------- */
export type Theme = "dark" | "light";
const apply = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#f6f2e9" : "#0B0E13");
};
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.dataset.theme === "light" ? "light" : "dark"));
  useEffect(() => apply(theme), [theme]);
  const toggle = useCallback(() => {
    setTheme((t) => {
      const n = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", n);
      } catch {}
      return n;
    });
  }, []);
  return { theme, toggle };
}
/* ---------- Soft UI sounds (off by default) ---------- */
let ctx: AudioContext | null = null;
export const soundOn = () => {
  try {
    return localStorage.getItem("sfx") === "1";
  } catch {
    return false;
  }
};
export function tick(freq = 880, dur = 0.07, vol = 0.04) {
  if (!soundOn()) return;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  } catch {}
}
export function useSound() {
  const [on, setOn] = useState(soundOn);
  useEffect(() => {
    if (!on) return;
    const h = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a,button,.card");
      if (el) tick(el.classList.contains("btn") || el.classList.contains("primary") ? 740 : 980);
    };
    const hv = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".card,.svc");
      if (el && !(el as HTMLElement).dataset.hv) {
        (el as HTMLElement).dataset.hv = "1";
        tick(520, 0.05, 0.02);
        setTimeout(() => delete (el as HTMLElement).dataset.hv, 900);
      }
    };
    document.addEventListener("click", h, true);
    document.addEventListener("pointerover", hv, true);
    return () => {
      document.removeEventListener("click", h, true);
      document.removeEventListener("pointerover", hv, true);
    };
  }, [on]);
  const toggle = useCallback(() => {
    setOn((v) => {
      const n = !v;
      try {
        localStorage.setItem("sfx", n ? "1" : "0");
      } catch {}
      if (n) setTimeout(() => tick(660, 0.12, 0.05), 20);
      return n;
    });
  }, []);
  return { on, toggle };
}
