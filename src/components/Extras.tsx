import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { SECTIONS } from "./Hero";
import { scrollToId } from "../lib/util";
/* right-edge section index */
export function SideDots() {
  const { t } = useI18n();
  const [active, setActive] = useState("top");
  const ids = ["top", ...SECTIONS.map((s) => s.id)];
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []); // eslint-disable-line
  return (
    <nav className="dots" aria-label="Section index">
      {ids.map((id) => (
        <button key={id} className={active === id ? "on" : ""} onClick={() => scrollToId(id)} aria-label={id}>
          <span>{id === "top" ? "00" : t(SECTIONS.find((s) => s.id === id)!.key)}</span>
          <i />
        </button>
      ))}
    </nav>
  );
}
/* scroll reveal for headings + magnetic buttons (fine pointers only) */
export function useFx() {
  useEffect(() => {
    document.documentElement.classList.add("fx");
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2 },
    );
    const scan = () => document.querySelectorAll(".h2:not(.in), .kicker:not(.in), .lead:not(.in), .big:not(.in)").forEach((n) => io.observe(n));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    let off = () => {};
    if (window.matchMedia("(pointer: fine)").matches) {
      const move = (e: PointerEvent) => {
        const el = (e.target as HTMLElement)?.closest?.(".btn, .social, .mail-big") as HTMLElement | null;
        document.querySelectorAll<HTMLElement>(".mag").forEach((m) => {
          if (m !== el) {
            m.style.translate = "";
            m.classList.remove("mag");
          }
        });
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.classList.add("mag");
        el.style.translate = `${(e.clientX - (r.left + r.width / 2)) * 0.22}px ${(e.clientY - (r.top + r.height / 2)) * 0.3}px`;
      };
      window.addEventListener("pointermove", move);
      off = () => window.removeEventListener("pointermove", move);
    }
    return () => {
      io.disconnect();
      mo.disconnect();
      off();
    };
  }, []);
}
