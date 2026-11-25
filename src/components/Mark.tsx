import { motion } from "framer-motion";
import big from "../assets/mark.webp";
import small from "../assets/mark-sm.webp";
/* Interlocked W+S ligature with a star. Metallic gold artwork; `size` = height in px. */
const RATIO = 1218 / 1118;
export function Mark({ size = 40, animate = false }: { size?: number; animate?: boolean; id?: string }) {
  const w = Math.round(size * RATIO);
  const markUrl = animate || size > 90 ? big : small;
  const mask = { WebkitMaskImage: `url(${markUrl})`, maskImage: `url(${markUrl})` } as const;
  return (
    <span className={`mark${animate ? " mark-anim" : ""}`} style={{ width: w, height: size }} aria-hidden>
      <motion.img
        src={markUrl}
        alt=""
        draggable={false}
        width={w}
        height={size}
        {...(animate
          ? {
              initial: { opacity: 0, filter: "blur(14px)", scale: 0.9, clipPath: "inset(100% 0% 0% 0%)" },
              animate: { opacity: 1, filter: "blur(0px)", scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
              transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] },
            }
          : {})}
      />
      {animate && <span className="mark-shine" style={mask} />}
    </span>
  );
}
