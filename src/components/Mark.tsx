import { motion } from "framer-motion";
/* Vector W mark: two overlapping chevron slabs. The right chevron cuts a hairline gap out of the left one. `size` = height in px. */
const VB_W = 130.6;
const POLY = {
  L: "0.0,8.0 18.0,8.0 46.6,92.0 28.6,92.0",
  M1: "28.6,92.0 46.6,92.0 68.3,28.0 50.3,28.0",
  M2: "90.1,92.0 72.1,92.0 50.3,28.0 68.3,28.0",
  R: "118.6,8.0 100.6,8.0 72.1,92.0 90.1,92.0",
};
export function Mark({ size = 40, animate = false, id = "mk" }: { size?: number; animate?: boolean; id?: string }) {
  const w = (size * VB_W) / 100;
  const slab = (key: keyof typeof POLY, i: number) =>
    animate ? (
      <motion.polygon
        key={key}
        points={POLY[key]}
        initial={{ opacity: 0, y: i % 2 ? 26 : -26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.1 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
      />
    ) : (
      <polygon key={key} points={POLY[key]} />
    );
  return (
    <svg className={`mark${animate ? " mark-anim" : ""}`} width={w} height={size} viewBox="-6 0 130.6 100" aria-hidden>
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mk1)" }} />
          <stop offset=".55" style={{ stopColor: "var(--mk2)" }} />
          <stop offset="1" style={{ stopColor: "var(--mk3)" }} />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--mk4)" }} />
          <stop offset=".5" style={{ stopColor: "var(--mk5)" }} />
          <stop offset="1" style={{ stopColor: "var(--mk6)" }} />
        </linearGradient>
        <mask id={`${id}-m`}>
          <rect x="-10" y="0" width="139" height="100" fill="#fff" />
          <g fill="#000" stroke="#000" strokeWidth="3.2">
            <polygon points={POLY.M2} />
            <polygon points={POLY.R} />
          </g>
        </mask>
        <clipPath id={`${id}-c`}>
          <polygon points={POLY.L} />
          <polygon points={POLY.M1} />
          <polygon points={POLY.M2} />
          <polygon points={POLY.R} />
        </clipPath>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g mask={`url(#${id}-m)`}>
        <g fill={`url(#${id}-a)`}>
          {slab("L", 0)}
          {slab("M1", 1)}
        </g>
      </g>
      <g fill={`url(#${id}-b)`}>
        {slab("M2", 2)}
        {slab("R", 3)}
      </g>
      {animate && (
        <g clipPath={`url(#${id}-c)`}>
          <motion.rect y="0" width="34" height="100" fill={`url(#${id}-s)`} style={{ skewX: -18 }} initial={{ x: -60 }} animate={{ x: 159 }} transition={{ duration: 1.1, delay: 1.5, ease: "easeInOut" }} />
        </g>
      )}
    </svg>
  );
}
