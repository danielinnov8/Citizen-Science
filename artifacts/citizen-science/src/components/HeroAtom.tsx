import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * A subtle atom with an electron cloud rendered behind the hero content.
 * It slowly spins on its own, and reacts to page scroll: as you scroll down,
 * the whole atom drifts up, rotates a touch further, and softly fades — giving
 * a sense that the structure responds to movement without stealing focus.
 */
export function HeroAtom() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Track this element's progress through the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Scroll-driven transforms (disabled when the user prefers reduced motion).
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduceMotion ? 1 : 1.25]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.7, 1],
    reduceMotion ? [0.9, 0.9, 0.9] : [0.9, 0.5, 0],
  );

  // Three electron orbits, each tilted differently so they read as a cloud.
  const orbits = [
    { rx: 230, ry: 92, tilt: 0, dur: 14, delay: 0, color: "#60A5FA" },
    { rx: 230, ry: 92, tilt: 60, dur: 18, delay: -3, color: "#818CF8" },
    { rx: 230, ry: 92, tilt: -60, dur: 22, delay: -7, color: "#34D399" },
  ];

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-0 flex items-start justify-end overflow-hidden translate-x-16 -translate-y-16"
      aria-hidden="true"
    >
      <motion.div
        style={{ rotate: scrollRotate, y, scale, opacity }}
        className="relative"
      >
        {/* Slow autonomous spin wrapper */}
        <motion.div
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 120, repeat: Infinity, ease: "linear" }
          }
          className="relative h-[520px] w-[520px]"
        >
          {/* Electron cloud glow */}
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[80px]" />

          <svg
            viewBox="-260 -260 520 520"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            {orbits.map((o, i) => (
              <g key={i} transform={`rotate(${o.tilt})`}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx={o.rx}
                  ry={o.ry}
                  stroke={o.color}
                  strokeOpacity="0.22"
                  strokeWidth="1"
                />
                {/* Orbiting electron */}
                <motion.circle
                  r="5"
                  fill={o.color}
                  fillOpacity="0.9"
                  style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          cx: [o.rx, 0, -o.rx, 0, o.rx],
                          cy: [0, o.ry, 0, -o.ry, 0],
                        }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          duration: o.dur,
                          delay: o.delay,
                          repeat: Infinity,
                          ease: "linear",
                        }
                  }
                />
              </g>
            ))}

            {/* Nucleus */}
            <circle r="14" fill="#93C5FD" fillOpacity="0.18" />
            <circle r="7" fill="#BFDBFE" fillOpacity="0.85" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
