/* Modern W: two chevrons on different depth planes. In the preloader the outline is drawn from nothing, fills in, and the mark
 * takes one full turn (the planes separate while it spins). In the nav (`loop`) it periodically spins out and returns. */
const W = 118.64;
const VA = "0,8 18,8 37.55,65.5 50.32,28 68.32,28 46.56,92 28.56,92";
const VB = "118.64,8 100.64,8 81.09,65.5 68.32,28 50.32,28 72.08,92 90.08,92";
const VBOX = `-6 0 ${W + 12} 100`;

export function Mark({ size = 40, animate = false, loop = false, id = "mk" }: { size?: number; animate?: boolean; loop?: boolean; id?: string }) {
  const cls = `mk${animate ? " mk-boot" : ""}${loop ? " mk-loop" : ""}`;
  const grad = (k: string, a: string, b: string, c: string) => (
    <linearGradient id={`${id}-${k}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style={{ stopColor: `var(--${a})` }} />
      <stop offset=".55" style={{ stopColor: `var(--${b})` }} />
      <stop offset="1" style={{ stopColor: `var(--${c})` }} />
    </linearGradient>
  );
  return (
    <span className={cls} style={{ ["--s" as string]: `${size}px` }} aria-hidden>
      <span className="mk-rot">
        <svg className="mk-a" viewBox={VBOX}>
          <defs>
            {grad("a", "mk1", "mk2", "mk3")}
            <mask id={`${id}-m`}>
              <rect x="-10" y="0" width={W + 20} height="100" fill="#fff" />
              <polygon points={VB} fill="#000" stroke="#000" strokeWidth="3.4" strokeLinejoin="miter" />
            </mask>
          </defs>
          <polygon className="mk-fill" points={VA} fill={`url(#${id}-a)`} mask={`url(#${id}-m)`} />
          {animate && <polygon className="mk-line" points={VA} pathLength={1} />}
        </svg>
        <svg className="mk-b" viewBox={VBOX}>
          <defs>{grad("b", "mk4", "mk5", "mk6")}</defs>
          <polygon className="mk-fill" points={VB} fill={`url(#${id}-b)`} />
          {animate && <polygon className="mk-line" points={VB} pathLength={1} />}
        </svg>
      </span>
    </span>
  );
}
