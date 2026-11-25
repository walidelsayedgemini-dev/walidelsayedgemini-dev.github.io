import { motion } from "framer-motion";
/* Walid Sayed monogram: a "W" crowned by a single point of light, inside an open ring. */
export function Mark({ size = 40, animate = false, id = "mk" }: { size?: number; animate?: boolean; id?: string }) {
  const draw = (delay: number, dur = 1.1) =>
    animate
      ? { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { duration: dur, delay, ease: [0.65, 0, 0.35, 1] as const } }
      : {};
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" aria-hidden className="mark">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7ebc6" />
          <stop offset="1" stopColor="#c39a55" />
        </linearGradient>
        <radialGradient id={`${id}-l`}>
          <stop offset="0" stopColor="#f7ebc6" stopOpacity=".6" />
          <stop offset="1" stopColor="#f7ebc6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <motion.path d="M58 9.3 A55 55 0 1 0 70 9.3" fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.6" strokeLinecap="round" {...draw(0, 1.4)} />
      <motion.circle
        cx="64" cy="20" r="15" fill={`url(#${id}-l)`}
        {...(animate ? { initial: { opacity: 0, scale: 0.4 }, animate: { opacity: [0, 1, 0.75, 1], scale: 1 }, transition: { duration: 1.6, delay: 1.1 } } : {})}
        style={{ transformOrigin: "64px 20px" }}
      />
      <motion.path d="M28 46 L46 96 L64 44 L82 96 L100 46" fill="none" stroke={`url(#${id}-g)`} strokeWidth="5.5" strokeLinejoin="miter" strokeMiterlimit="10" {...draw(0.35, 1.2)} />
      <motion.path d="M64 44 V30" stroke={`url(#${id}-g)`} strokeWidth="3" fill="none" {...draw(1.2, 0.4)} />
      <motion.path
        d="M64 14 L68.5 20 L64 26 L59.5 20 Z" fill="#fbf1d0"
        {...(animate ? { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: 1.5 } } : {})}
        style={{ transformOrigin: "64px 20px" }}
      />
    </svg>
  );
}
