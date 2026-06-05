import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "wouter";
import { Users } from "lucide-react";
import { MODERN_MINDS, FRONTIER_MINDS, type Inventor } from "@/lib/inventors";

// The living people from our directory (historical figures excluded).
const PEOPLE: Inventor[] = [...MODERN_MINDS, ...FRONTIER_MINDS];

const INNER_COUNT = 5;
const AUTO_MS = 2600;

interface PlacedNode extends Inventor {
  x: number;
  y: number;
  inner: boolean;
  angle: number;
}

type Endpoint = number | "hub";
interface Edge {
  a: Endpoint;
  b: Endpoint;
}

const HUB = { x: 50, y: 50 };

// Deterministic layout: an inner ring around a central hub plus an outer ring,
// woven together into a connected mesh so it reads as a network, not a wheel.
const NODES: PlacedNode[] = PEOPLE.map((p, i) => {
  const inner = i < INNER_COUNT;
  const idxInRing = inner ? i : i - INNER_COUNT;
  const countInRing = inner ? INNER_COUNT : PEOPLE.length - INNER_COUNT;
  const rx = inner ? 22 : 41;
  const ry = inner ? 20 : 37;
  const baseDeg = inner ? -90 : -90 + 26;
  const angle = (idxInRing / countInRing) * 360 + baseDeg;
  const rad = (angle * Math.PI) / 180;
  return {
    ...p,
    inner,
    angle,
    x: 50 + rx * Math.cos(rad),
    y: 50 + ry * Math.sin(rad),
  };
});

function pointOf(id: Endpoint) {
  return id === "hub" ? HUB : { x: NODES[id].x, y: NODES[id].y };
}

const EDGES: Edge[] = (() => {
  const edges: Edge[] = [];
  const innerIdx: number[] = [];
  const outerIdx: number[] = [];
  NODES.forEach((n, i) => (n.inner ? innerIdx : outerIdx).push(i));

  // Hub spokes to inner ring.
  innerIdx.forEach((i) => edges.push({ a: "hub", b: i }));
  // Inner ring cycle.
  innerIdx.forEach((i, k) =>
    edges.push({ a: i, b: innerIdx[(k + 1) % innerIdx.length] }),
  );
  // Outer ring cycle.
  outerIdx.forEach((i, k) =>
    edges.push({ a: i, b: outerIdx[(k + 1) % outerIdx.length] }),
  );
  // Each outer node links to its angularly-nearest inner node.
  outerIdx.forEach((i) => {
    let best = innerIdx[0];
    let bestDelta = Infinity;
    innerIdx.forEach((j) => {
      const d = Math.abs(((NODES[i].angle - NODES[j].angle + 540) % 360) - 180);
      if (d < bestDelta) {
        bestDelta = d;
        best = j;
      }
    });
    edges.push({ a: i, b: best });
  });
  return edges;
})();

// A few edges carry an animated "signal" pulse for liveliness.
const PULSE_EDGES = EDGES.filter((e) => e.a !== "hub").slice(0, 6);

export function PeopleNetwork() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(
      () => setActive((a) => (a + 1) % NODES.length),
      AUTO_MS,
    );
    return () => clearInterval(t);
  }, [paused]);

  const activeNode = NODES[active];

  const edgesToRender = useMemo(
    () =>
      EDGES.map((e) => {
        const p1 = pointOf(e.a);
        const p2 = pointOf(e.b);
        const isActive = e.a === active || e.b === active;
        return { ...e, p1, p2, isActive };
      }),
    [active],
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        className="relative mx-auto aspect-square w-full"
        onMouseLeave={() => setPaused(false)}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-[16%] rounded-full bg-gradient-to-br from-blue-500/10 to-violet-500/10 blur-3xl" />

        {/* Connection lines */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="pn-edge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <radialGradient id="pn-hub" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#7C3AED" />
            </radialGradient>
          </defs>

          {edgesToRender.map((e, i) => (
            <motion.line
              key={i}
              x1={e.p1.x}
              y1={e.p1.y}
              x2={e.p2.x}
              y2={e.p2.y}
              stroke={e.isActive ? "url(#pn-edge)" : "#CBD5E1"}
              strokeLinecap="round"
              initial={false}
              animate={{
                strokeWidth: e.isActive ? 0.55 : 0.28,
                opacity: e.isActive ? 0.95 : 0.4,
              }}
              transition={{ duration: 0.35 }}
            />
          ))}

          {/* Traveling signal pulses (native SMIL for robust SVG attr animation) */}
          {PULSE_EDGES.map((e, i) => {
            const p1 = pointOf(e.a);
            const p2 = pointOf(e.b);
            const begin = `${i * 0.7}s`;
            return (
              <circle key={`pulse-${i}`} r={0.7} fill="#2563EB" opacity={0}>
                <animate
                  attributeName="cx"
                  values={`${p1.x};${p2.x}`}
                  dur="2.6s"
                  begin={begin}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${p1.y};${p2.y}`}
                  dur="2.6s"
                  begin={begin}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="2.6s"
                  begin={begin}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
        </svg>

        {/* Central hub */}
        <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_40%,#3B82F6,#7C3AED)] text-center text-white shadow-[0_18px_50px_-12px_rgba(124,58,237,0.65)] ring-1 ring-white/25 md:h-24 md:w-24">
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
          <Users className="h-6 w-6 text-white/95 md:h-7 md:w-7" strokeWidth={1.75} />
          <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/80 md:text-[9px]">
            The Network
          </span>
        </div>

        {/* People nodes */}
        {NODES.map((n, i) => {
          const isActive = i === active;
          return (
            <div
              key={n.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onMouseEnter={() => {
                setPaused(true);
                setActive(i);
              }}
            >
              <Link href={`/directory/${n.slug}`}>
                <motion.div
                  className="group relative cursor-pointer"
                  animate={{ scale: isActive ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                >
                  <div
                    className={[
                      "relative overflow-hidden rounded-full border-2 bg-white shadow-md transition-colors duration-300",
                      "h-12 w-12 md:h-[4.25rem] md:w-[4.25rem]",
                      isActive
                        ? "border-blue-500 shadow-[0_0_0_4px_rgba(37,99,235,0.18)]"
                        : "border-white group-hover:border-blue-300",
                    ].join(" ")}
                  >
                    <img
                      src={n.imageUrl}
                      alt={n.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  {/* Name chip on the active node */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0F172A] px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg"
                      >
                        {n.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <div className="relative mx-auto mt-10 h-20 max-w-lg text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-serif text-xl text-[#0F172A]">
              {activeNode.name}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[#2563EB]">
              {activeNode.field}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
              {activeNode.blurb}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
