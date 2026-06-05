import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lightbulb,
  Users,
  Eye,
  BookOpen,
  Sparkles,
  Globe2,
  type LucideIcon,
} from "lucide-react";

interface Stage {
  name: string;
  icon: LucideIcon;
  blurb: string;
}

const STAGES: Stage[] = [
  {
    name: "Curiosity",
    icon: Lightbulb,
    blurb: "A question sparks. Someone wonders why — and decides to find out.",
  },
  {
    name: "Participation",
    icon: Users,
    blurb: "Anyone can join. A phone, a sensor, or a backyard becomes a lab.",
  },
  {
    name: "Observation",
    icon: Eye,
    blurb: "Real data flows in — measurements, photos, and field notes from everywhere.",
  },
  {
    name: "Knowledge",
    icon: BookOpen,
    blurb: "AI and researchers turn millions of observations into understanding.",
  },
  {
    name: "Discovery",
    icon: Sparkles,
    blurb: "Patterns emerge. New findings reshape what we thought we knew.",
  },
  {
    name: "Impact",
    icon: Globe2,
    blurb: "Discoveries drive real change — and inspire the next wave of curiosity.",
  },
];

const N = STAGES.length;
const RADIUS = 38; // in 0-100 viewBox units
const AUTO_MS = 3200;

export function Flywheel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % N), AUTO_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused]);

  const ActiveIcon = STAGES[active].icon;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Ring (md+) */}
      <div
        className="relative mx-auto hidden aspect-square w-full md:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        {/* Soft ambient glow */}
        <div className="pointer-events-none absolute inset-[14%] rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-2xl" />

        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="fw-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          {/* Dotted decorative track, slowly rotating */}
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.4"
            strokeDasharray="0.4 2.4"
            strokeLinecap="round"
            className="origin-center animate-[spin_70s_linear_infinite]"
          />

          {/* Progress arc that sweeps to the active stage */}
          <motion.circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="url(#fw-grad)"
            strokeWidth="1.4"
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            initial={false}
            animate={{ pathLength: active / N + 0.001 }}
            transition={{ type: "spring", stiffness: 60, damping: 18 }}
          />
        </svg>

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 p-5 text-center text-white shadow-[0_20px_60px_-15px_rgba(37,99,235,0.6)] ring-1 ring-white/20">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.28 }}
              className="flex flex-col items-center"
            >
              <ActiveIcon className="mb-2 h-6 w-6 text-white/90" strokeWidth={1.75} />
              <span className="font-serif text-xl leading-tight">{STAGES[active].name}</span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
                Stage {String(active + 1).padStart(2, "0")}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stage nodes */}
        {STAGES.map((stage, i) => {
          const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
          const x = 50 + RADIUS * Math.cos(angle);
          const y = 50 + RADIUS * Math.sin(angle);
          const isActive = i === active;
          const Icon = stage.icon;
          return (
            <button
              key={stage.name}
              type="button"
              onClick={() => setActive(i)}
              aria-label={stage.name}
              aria-pressed={isActive}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <motion.span
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={[
                  "flex h-[4.5rem] w-[4.5rem] flex-col items-center justify-center rounded-full border text-center transition-colors duration-300",
                  isActive
                    ? "border-transparent bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg"
                    : "border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm group-hover:border-blue-300 group-hover:shadow-md",
                ].join(" ")}
              >
                <Icon
                  className={isActive ? "h-5 w-5 text-white" : "h-5 w-5 text-blue-500"}
                  strokeWidth={1.75}
                />
                <span className="mt-0.5 px-1 text-[11px] font-semibold leading-tight">
                  {stage.name}
                </span>
              </motion.span>
              {isActive && (
                <motion.span
                  layoutId="fw-node-ring"
                  className="pointer-events-none absolute inset-0 -m-1 rounded-full ring-2 ring-blue-400/50"
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail caption under the ring (md+) */}
      <div className="relative mx-auto mt-10 hidden h-16 max-w-lg text-center md:block">
        <AnimatePresence mode="wait">
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-base leading-relaxed text-[#475569]"
          >
            {STAGES[active].blurb}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Mobile: interactive vertical stepper */}
      <div className="space-y-2 md:hidden">
        {STAGES.map((stage, i) => {
          const isActive = i === active;
          const Icon = stage.icon;
          return (
            <button
              key={stage.name}
              type="button"
              onClick={() => {
                setPaused(true);
                setActive(i);
              }}
              className={[
                "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isActive
                  ? "border-blue-200 bg-blue-50/60"
                  : "border-[#E2E8F0] bg-white",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white"
                    : "bg-blue-50 text-blue-600",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold text-blue-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-[#0F172A]">{stage.name}</span>
                </span>
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="mt-1 block text-sm leading-relaxed text-[#64748B]"
                    >
                      {stage.blurb}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
