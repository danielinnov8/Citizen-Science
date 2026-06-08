import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import {
  ChevronRight,
  ArrowLeft,
  Quote,
  ExternalLink,
  Lightbulb,
  Compass,
  Beaker,
  FileText,
  Sparkles,
  ScrollText,
  Milestone,
  Flame,
  MapPin,
  CalendarDays,
} from "lucide-react";
import type { FeaturedProfile } from "@workspace/api-client-react";
import { CATEGORIES } from "@/lib/categories";
import { EXPERIMENTS } from "@/lib/experiments";
import type {
  GreatMindStory as GreatMindStoryData,
  StoryMotif,
} from "@/lib/greatMinds";
import { getTalkableFigure, useAvatarFigure } from "@/lib/talkable";
import { TalkToFigure } from "@/components/TalkToFigure";
import { MessageCircle } from "lucide-react";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Per-figure focal point for the hero portrait crop. Some source photos are
// wide landscape shots where the subject sits off-center, so the default
// object-center crop cuts them off; these tune the focal point.
const PORTRAIT_FOCAL_BY_SLUG: Record<string, string> = {
  "manu-rehani": "object-[70%_center]",
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Field-themed decorative SVG drawn faintly behind the hero. Each motif is tied
// to the figure's discipline so every page feels distinct.
function HeroMotif({ motif, color }: { motif: StoryMotif; color: string }) {
  const common = {
    stroke: color,
    fill: "none",
    strokeWidth: 1,
    vectorEffect: "non-scaling-stroke" as const,
  };
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {motif === "relativity" && (
        <g {...common} opacity={0.5}>
          {[60, 130, 210, 300, 400].map((r) => (
            <ellipse
              key={r}
              cx={400}
              cy={300}
              rx={r}
              ry={r * 0.42}
              transform={`rotate(-18 400 300)`}
            />
          ))}
          <circle cx={400} cy={300} r={6} fill={color} stroke="none" />
        </g>
      )}
      {motif === "radioactivity" && (
        <g {...common} opacity={0.45}>
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              d="M400 300 L 520 110 A 220 220 0 0 1 640 360 Z"
              transform={`rotate(${a} 400 300)`}
              fill={color}
              fillOpacity={0.05}
              stroke={color}
            />
          ))}
          {[80, 160, 260].map((r) => (
            <circle key={r} cx={400} cy={300} r={r} />
          ))}
          <circle cx={400} cy={300} r={10} fill={color} stroke="none" />
        </g>
      )}
      {motif === "electricity" && (
        <g {...common} opacity={0.45}>
          {[120, 320, 520, 680].map((x, i) => (
            <path
              key={x}
              d={`M${x} 40 l -40 220 l 60 0 l -50 300`}
              strokeWidth={1.5}
              opacity={0.7 - i * 0.1}
            />
          ))}
        </g>
      )}
      {motif === "evolution" && (
        <g {...common} opacity={0.45}>
          <path d="M400 600 L400 380" />
          <path d="M400 380 C 300 330, 260 250, 220 150" />
          <path d="M400 380 C 500 330, 540 250, 580 150" />
          <path d="M400 470 C 330 440, 300 400, 250 340" />
          <path d="M400 470 C 470 440, 500 400, 550 340" />
          <path d="M300 250 C 270 210, 250 180, 210 150" />
          <path d="M500 250 C 530 210, 550 180, 590 150" />
          {[
            [220, 150],
            [580, 150],
            [250, 340],
            [550, 340],
            [210, 150],
            [590, 150],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={7} fill={color} stroke="none" />
          ))}
        </g>
      )}
      {motif === "gravity" && (
        <g {...common} opacity={0.45}>
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 80} y1={0} x2={i * 80} y2={600} />
          ))}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = i * 75;
            const dip = 1 - Math.abs(i - 4) / 4;
            return (
              <path
                key={`h${i}`}
                d={`M0 ${y} Q 400 ${y + dip * 90} 800 ${y}`}
              />
            );
          })}
          <circle cx={400} cy={330} r={12} fill={color} stroke="none" />
        </g>
      )}
      {motif === "astronomy" && (
        <g {...common} opacity={0.5}>
          <ellipse cx={400} cy={300} rx={300} ry={120} transform="rotate(-12 400 300)" />
          <ellipse cx={400} cy={300} rx={180} ry={70} transform="rotate(-12 400 300)" />
          <circle cx={400} cy={300} r={8} fill={color} stroke="none" />
          {[
            [120, 90],
            [690, 140],
            [600, 470],
            [180, 480],
            [320, 120],
            [520, 200],
            [250, 360],
          ].map(([cx, cy], i) => (
            <g key={i} fill={color} stroke="none">
              <circle cx={cx} cy={cy} r={i % 2 ? 2 : 3} />
            </g>
          ))}
        </g>
      )}
      {motif === "computing" && (
        <g {...common} opacity={0.4}>
          {Array.from({ length: 9 }).map((_, r) =>
            Array.from({ length: 12 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 70 + 10}
                y={r * 70 + 10}
                width={40}
                height={40}
                rx={6}
                opacity={(r + c) % 3 === 0 ? 0.9 : 0.25}
              />
            )),
          )}
        </g>
      )}
      {motif === "code" && (
        <g opacity={0.32} fill={color}>
          {Array.from({ length: 14 }).map((_, r) =>
            Array.from({ length: 22 }).map((_, c) => (
              <text
                key={`${r}-${c}`}
                x={c * 38 + 8}
                y={r * 44 + 28}
                fontSize={22}
                fontFamily="monospace"
                opacity={(r * 7 + c * 3) % 4 === 0 ? 0.85 : 0.22}
              >
                {(r * 3 + c) % 2}
              </text>
            )),
          )}
        </g>
      )}
    </svg>
  );
}

// Shared soft-noise texture used across the special hero variants.
const HERO_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Grain + worn inner frame + bottom fade shared by the special hero variants.
function HeroDressing({
  fade = "rgba(3,5,4,0.7)",
  grain = 0.1,
}: {
  fade?: string;
  grain?: number;
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen"
        style={{ opacity: grain, backgroundImage: HERO_NOISE }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.05), inset 0 0 140px rgba(0,0,0,0.6)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: `linear-gradient(to top, ${fade}, transparent)` }}
      />
    </>
  );
}

// A glowing periodic-table tile used on Marie Curie's radium hero.
function ElementTile({
  sym,
  num,
  name,
}: {
  sym: string;
  num: string;
  name: string;
}) {
  return (
    <div
      className="relative h-24 w-20 rounded-md border border-emerald-300/40 bg-emerald-400/5 px-2 py-1.5 text-emerald-50"
      style={{
        boxShadow:
          "0 0 26px rgba(74,222,128,0.25), inset 0 0 18px rgba(74,222,128,0.12)",
      }}
    >
      <span className="block text-[10px] leading-none opacity-70">{num}</span>
      <span
        className="mt-1 block text-3xl font-semibold leading-tight"
        style={{ textShadow: "0 0 12px rgba(74,222,128,0.6)" }}
      >
        {sym}
      </span>
      <span className="mt-1 block text-[9px] uppercase tracking-wide opacity-70">
        {name}
      </span>
    </div>
  );
}

// Marie Curie — a darkened laboratory: a glowing radium source, radiation rings,
// spiralling cloud-chamber particle tracks, and glowing element tiles.
function RadiumHero({ y }: { y: MotionValue<number> }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#06120c",
          backgroundImage:
            "radial-gradient(80% 60% at 22% 40%, rgba(34,197,94,0.20), transparent 60%), radial-gradient(70% 70% at 86% 6%, rgba(16,185,129,0.12), transparent 60%), linear-gradient(165deg, #0a1a12 0%, #08140e 55%, #050b08 100%)",
        }}
      />
      {/* Glowing radium source */}
      <div
        className="pointer-events-none absolute left-[20%] top-[44%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        style={{
          background:
            "radial-gradient(circle, rgba(134,239,172,0.55), rgba(16,185,129,0.16) 55%, transparent 72%)",
        }}
      />
      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <filter
              id="radium-glow"
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
            >
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g stroke="#4ade80" filter="url(#radium-glow)">
            <circle cx="240" cy="264" r="74" strokeOpacity="0.22" strokeWidth="1.5" />
            <circle cx="240" cy="264" r="138" strokeOpacity="0.15" strokeWidth="1.5" />
            <circle cx="240" cy="264" r="210" strokeOpacity="0.09" strokeWidth="1.5" />
            <circle cx="240" cy="264" r="292" strokeOpacity="0.05" strokeWidth="1.5" />
          </g>
          <g
            stroke="#bbf7d0"
            strokeLinecap="round"
            fill="none"
            filter="url(#radium-glow)"
          >
            <path d="M240 264 C 380 210, 540 240, 720 150" strokeWidth="1.4" strokeOpacity="0.5" />
            <path d="M240 264 C 330 330, 560 372, 780 340" strokeWidth="1.2" strokeOpacity="0.42" />
            <path d="M240 264 C 320 190, 380 120, 500 92" strokeWidth="1" strokeOpacity="0.36" />
            <path d="M900 430 C 868 388, 912 356, 952 388 C 988 416, 962 458, 916 452 C 876 447, 868 408, 906 396" strokeWidth="1.2" strokeOpacity="0.45" />
            <path d="M1060 150 C 1018 142, 988 184, 1018 214 C 1048 242, 1092 224, 1090 186" strokeWidth="1" strokeOpacity="0.4" />
          </g>
        </svg>
        <div className="absolute right-[7%] top-[14%] flex gap-4 opacity-80">
          <ElementTile sym="Ra" num="88" name="Radium" />
          <ElementTile sym="Po" num="84" name="Polonium" />
        </div>
      </motion.div>
      <HeroDressing fade="rgba(4,11,8,0.72)" />
    </>
  );
}

// Nikola Tesla — high voltage: a glowing discharge orb throwing jagged bolts of
// violet-and-cyan lightning across a dark electrical sky.
function ElectricHero({ y }: { y: MotionValue<number> }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#0a0716",
          backgroundImage:
            "radial-gradient(70% 60% at 26% 40%, rgba(124,58,237,0.30), transparent 60%), radial-gradient(60% 60% at 88% 72%, rgba(34,211,238,0.14), transparent 60%), linear-gradient(165deg, #150b2e 0%, #0d0820 55%, #07041a 100%)",
        }}
      />
      {/* Discharge orb */}
      <div
        className="pointer-events-none absolute left-[24%] top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{
          background:
            "radial-gradient(circle, rgba(196,181,253,0.65), rgba(124,58,237,0.20) 55%, transparent 72%)",
        }}
      />
      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <filter
              id="bolt-glow"
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g
            filter="url(#bolt-glow)"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M300 252 L 372 156 L 340 220 L 486 96 L 442 178 L 580 64" stroke="#c4b5fd" strokeWidth="2.2" strokeOpacity="0.85" />
            <path d="M300 252 L 430 312 L 388 344 L 568 372 L 524 404 L 700 424" stroke="#a78bfa" strokeWidth="1.8" strokeOpacity="0.7" />
            <path d="M300 252 L 238 344 L 280 372 L 188 484 L 240 478" stroke="#67e8f9" strokeWidth="1.6" strokeOpacity="0.62" />
            <path d="M300 252 L 392 240 L 360 270 L 484 258 L 452 294 L 612 290" stroke="#ddd6fe" strokeWidth="1.4" strokeOpacity="0.55" />
            <path d="M992 64 L 950 178 L 1002 156 L 928 300 L 992 268 L 940 412" stroke="#a78bfa" strokeWidth="1.8" strokeOpacity="0.5" />
            <path d="M760 486 L 802 444 M 802 444 L 792 496 M 802 444 L 854 466" stroke="#67e8f9" strokeWidth="1.4" strokeOpacity="0.5" />
            <path d="M1060 470 L 1092 430 M 1092 430 L 1086 482 M 1092 430 L 1136 452" stroke="#c4b5fd" strokeWidth="1.3" strokeOpacity="0.45" />
          </g>
        </svg>
      </motion.div>
      <HeroDressing fade="rgba(7,4,26,0.72)" grain={0.08} />
    </>
  );
}

// Charles Darwin — a naturalist's dark sketchbook: the branching "tree of life",
// his famous "I think" note, and an ammonite fossil spiral, drawn in teal ink.
function NaturalistHero({ y }: { y: MotionValue<number> }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#06120f",
          backgroundImage:
            "radial-gradient(90% 70% at 50% -10%, rgba(13,148,136,0.16), transparent 55%), radial-gradient(70% 70% at 86% 110%, rgba(20,184,166,0.10), transparent 60%), linear-gradient(165deg, #0a1a16 0%, #08140f 55%, #04100b 100%)",
        }}
      />
      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        {/* "I think" — Darwin's notebook caption */}
        <span
          className="absolute left-[42%] top-[9%] -rotate-3 font-['Caveat'] font-semibold text-teal-100 text-3xl sm:text-5xl"
          style={{ opacity: 0.5, textShadow: "0 0 8px rgba(45,212,191,0.35)" }}
        >
          I think
        </span>
        {/* Tree of life branching diagram + species nodes */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <g stroke="#5eead4" strokeLinecap="round" fill="none" opacity="0.45">
            <path d="M620 560 L 620 384" strokeWidth="1.8" />
            <path d="M620 384 C 598 332, 540 322, 500 272" strokeWidth="1.5" />
            <path d="M620 384 C 642 332, 700 322, 744 272" strokeWidth="1.5" />
            <path d="M620 384 C 620 344, 624 322, 614 292" strokeWidth="1.3" />
            <path d="M500 272 C 480 242, 442 236, 420 204" strokeWidth="1.2" />
            <path d="M500 272 C 512 240, 548 234, 562 202" strokeWidth="1.2" />
            <path d="M744 272 C 768 240, 804 234, 820 202" strokeWidth="1.2" />
            <path d="M744 272 C 732 242, 706 236, 692 206" strokeWidth="1.2" />
            <path d="M614 292 C 606 262, 588 254, 574 226" strokeWidth="1.1" />
            <path d="M614 292 C 622 260, 644 254, 658 228" strokeWidth="1.1" />
            <g strokeDasharray="2 8" strokeWidth="1.1">
              <path d="M420 204 L 408 176" />
              <path d="M562 202 L 566 172" />
              <path d="M820 202 L 832 174" />
              <path d="M692 206 L 686 176" />
              <path d="M574 226 L 566 198" />
              <path d="M658 228 L 668 200" />
            </g>
          </g>
          <g fill="#99f6e4" opacity="0.5">
            <circle cx="408" cy="176" r="3" />
            <circle cx="566" cy="172" r="3" />
            <circle cx="832" cy="174" r="3" />
            <circle cx="686" cy="176" r="3" />
            <circle cx="566" cy="198" r="2.5" />
            <circle cx="668" cy="200" r="2.5" />
          </g>
        </svg>
        {/* Ammonite fossil spiral */}
        <svg
          className="absolute right-[9%] bottom-[10%] h-28 w-28"
          viewBox="0 0 100 100"
          fill="none"
          opacity="0.5"
        >
          <path
            d="M90 50 A 40 40 0 0 1 10 50 A 35 35 0 0 1 80 50 A 30 30 0 0 1 20 50 A 25 25 0 0 1 70 50 A 20 20 0 0 1 30 50 A 15 15 0 0 1 60 50 A 10 10 0 0 1 40 50"
            stroke="#5eead4"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
      <HeroDressing fade="rgba(4,16,11,0.72)" />
    </>
  );
}

// Old-school chalkboard hero used for Einstein: a dark slate board with his
// famous equations sketched in chalk, the marquee E = mc² circled by hand.
function ChalkboardHero({ y }: { y: MotionValue<number> }) {
  const eq = "pointer-events-none absolute select-none font-['Caveat'] font-semibold text-white";
  return (
    <>
      {/* Slate board base */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#0a0d0b",
          backgroundImage:
            "radial-gradient(120% 90% at 50% -10%, rgba(255,255,255,0.05), transparent 55%), radial-gradient(90% 70% at 14% 6%, rgba(150,175,160,0.05), transparent 55%), linear-gradient(165deg, #121713 0%, #0b0f0d 55%, #060807 100%)",
        }}
      />
      {/* Soft chalk-dust haze + board vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -12%, rgba(255,255,255,0.06), transparent 55%), radial-gradient(90% 70% at 88% 112%, rgba(170,200,180,0.05), transparent 60%)",
        }}
      />

      {/* Chalk equations with gentle parallax */}
      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        {/* Marquee equation, circled in chalk */}
        <div className="absolute left-[4%] bottom-[10%] -rotate-3" style={{ opacity: 0.22 }}>
          <div className="relative inline-block px-5 py-3">
            <span
              className="font-['Caveat'] font-bold text-white leading-none text-[4.5rem] sm:text-[7rem]"
              style={{ textShadow: "0 0 3px rgba(255,255,255,0.4)" }}
            >
              E = mc²
            </span>
            <svg
              className="absolute -inset-1 h-full w-full"
              viewBox="0 0 300 110"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M16 58 C 42 16, 124 8, 204 15 C 272 21, 296 42, 284 66 C 272 94, 176 104, 92 99 C 34 96, 8 84, 16 58 Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>

        {/* General relativity field equation */}
        <span className={`${eq} left-[28%] top-[7%] rotate-2 text-2xl sm:text-4xl`} style={{ opacity: 0.13 }}>
          R<sub>μν</sub> − ½ R g<sub>μν</sub> + Λ g<sub>μν</sub> = (8πG ∕ c⁴) T<sub>μν</sub>
        </span>

        {/* Mass–energy–momentum relation */}
        <span className={`${eq} left-[7%] top-[10%] -rotate-2 text-xl sm:text-3xl`} style={{ opacity: 0.12 }}>
          E² = (mc²)² + (pc)²
        </span>

        {/* Lorentz factor */}
        <span className={`${eq} right-[6%] top-[6%] rotate-3 text-xl sm:text-3xl`} style={{ opacity: 0.11 }}>
          γ = 1 ∕ √(1 − v²∕c²)
        </span>

        {/* Spacetime interval */}
        <span className={`${eq} right-[5%] bottom-[12%] -rotate-2 text-lg sm:text-2xl`} style={{ opacity: 0.1 }}>
          ds² = −c²dt² + dx² + dy² + dz²
        </span>

        {/* Photoelectric quantum */}
        <span className={`${eq} left-[46%] bottom-[16%] rotate-1 text-xl sm:text-3xl`} style={{ opacity: 0.1 }}>
          E = hf
        </span>
      </motion.div>

      {/* Chalk grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Worn board frame + inner shadow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.06), inset 0 0 140px rgba(0,0,0,0.65)",
        }}
      />

      {/* Bottom fade into the body */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to top, rgba(3,5,4,0.7), transparent)" }}
      />
    </>
  );
}

// Manu Rehani's cited Relevance Memory Model, typeset faithfully in HTML so it
// can be tinted to sit subtly on the dark hero.
function RmmEquation({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap italic font-serif ${className}`}
      style={style}
    >
      <span>
        RMM(token<sub>N</sub>)
      </span>
      <span>=</span>
      <span>
        PMM(token<sub>N</sub>)
      </span>
      <span>×</span>
      {/* 1 / 2d */}
      <span className="inline-flex flex-col items-center leading-none not-italic">
        <span className="px-1">1</span>
        <span className="border-t border-current px-1">2d</span>
      </span>
      {/* Σ with limits */}
      <span className="inline-flex flex-col items-center leading-none not-italic text-[0.5em] -mx-0.5">
        <span>d</span>
        <span className="text-[2.1em] leading-none">Σ</span>
        <span>i=−d</span>
      </span>
      <span>
        ( (PMM(token<sub>N−1</sub>) × PF(token<sub>N</sub>, token<sub>N−1</sub>))
        <sub>i</sub> )
      </span>
    </span>
  );
}

// Manu Rehani — behavioral intelligence rendered abstractly: soft red and blue
// signal curves drifting across a dark field, anchored by the actual cited
// Relevance Memory Model equation.
function MarketsHero({ y }: { y: MotionValue<number> }) {
  const tag =
    "pointer-events-none absolute select-none font-mono tracking-tight";
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: "#05080f",
          backgroundImage:
            "radial-gradient(72% 60% at 24% 34%, rgba(59,130,246,0.14), transparent 62%), radial-gradient(64% 60% at 82% 72%, rgba(239,68,68,0.10), transparent 62%), linear-gradient(165deg, #0a1020 0%, #070a14 55%, #04060c 100%)",
        }}
      />
      {/* Soft color anchors, kept faint */}
      <div
        className="pointer-events-none absolute left-[28%] top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(96,165,250,0.28), rgba(37,99,235,0.08) 55%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[18%] top-[60%] h-64 w-64 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(248,113,113,0.24), rgba(239,68,68,0.07) 55%, transparent 72%)",
        }}
      />

      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <defs>
            <filter id="ma-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
          </defs>
          {/* Abstract drifting signal curves — soft and low-contrast */}
          <g
            fill="none"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#ma-soft)"
          >
            <path
              d="M-60 252 C 240 300, 420 218, 640 270 C 880 326, 1040 224, 1260 268"
              stroke="#60a5fa"
              strokeWidth="2"
              opacity="0.16"
            />
            <path
              d="M-60 320 C 200 262, 360 384, 600 322 C 840 262, 1000 366, 1260 300"
              stroke="#3b82f6"
              strokeWidth="2"
              opacity="0.3"
            />
            <path
              d="M-60 362 C 220 424, 380 300, 620 362 C 860 424, 1020 300, 1260 352"
              stroke="#ef4444"
              strokeWidth="2"
              opacity="0.28"
            />
            <path
              d="M-60 430 C 260 388, 440 470, 660 420 C 900 366, 1060 452, 1260 408"
              stroke="#f87171"
              strokeWidth="1.5"
              opacity="0.14"
            />
          </g>
        </svg>

        {/* The actual cited equation — the centerpiece, kept quiet */}
        <RmmEquation
          className="left-1/2 top-[13%] -translate-x-1/2 text-[0.62rem] sm:text-sm md:text-base text-slate-100"
          style={{ position: "absolute", opacity: 0.34 }}
        />

        {/* A couple of faint, authentic accents */}
        <span
          className={`${tag} hidden sm:block left-[6%] bottom-[18%] text-xs uppercase tracking-[0.25em] text-sky-200`}
          style={{ opacity: 0.32 }}
        >
          Design for Relevance Fit
        </span>
        <span
          className={`${tag} hidden sm:block left-[40%] bottom-[24%] text-xs text-rose-200`}
          style={{ opacity: 0.3 }}
        >
          PF(token<sub>N</sub>, token<sub>N−1</sub>)
        </span>
      </motion.div>

      <HeroDressing fade="rgba(4,6,12,0.74)" grain={0.07} />
    </>
  );
}

export function GreatMindStory({
  story,
  profile,
}: {
  story: GreatMindStoryData;
  profile?: FeaturedProfile;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const motifY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const { theme } = story;
  const heroVariant = theme.heroVariant;

  // ----- Live "Talk to {figure}" avatar experience -----
  const [talkOpen, setTalkOpen] = useState(false);
  const talkable = getTalkableFigure(story.slug);
  const { data: avatarCap } = useAvatarFigure(talkable ? story.slug : undefined);
  // Show the button when the figure is talkable; the server confirms whether it
  // is actually available (keys configured). Until the capability check
  // resolves we optimistically render based on the static talkable config.
  const showTalk = !!talkable;
  const talkAvailable = avatarCap ? avatarCap.available : false;
  const firstName = talkable?.firstName ?? story.name.split(" ")[0];
  const avatarProviders = avatarCap?.providers ?? [];

  function handleTalkClick() {
    // The live experience is open to everyone — no sign-in required.
    setTalkOpen(true);
  }

  // Merge DB-backed enrichment when available, falling back to authored content.
  const relatedCategorySlugs =
    profile?.relatedCategorySlugs && profile.relatedCategorySlugs.length > 0
      ? profile.relatedCategorySlugs
      : story.relatedCategorySlugs;

  const sources =
    profile?.sources && profile.sources.length > 0
      ? profile.sources
      : story.sources;

  const patents = profile?.patents ?? [];

  const relatedCategories = relatedCategorySlugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

  const relatedExperiments = EXPERIMENTS.filter((e) =>
    relatedCategorySlugs.includes(e.categoryId),
  ).slice(0, 4);

  return (
    <>
    <div className="w-full animate-in fade-in duration-500 pb-32">
      {/* ===== Cinematic hero ===== */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={
          heroVariant
            ? { backgroundColor: "#070b08" }
            : {
                backgroundColor: theme.heroTo,
                backgroundImage: `
            radial-gradient(55rem 38rem at 8% -15%, ${theme.accent}40, transparent 60%),
            radial-gradient(48rem 48rem at 100% -8%, ${theme.accentDeep}66, transparent 55%),
            radial-gradient(42rem 36rem at 88% 120%, ${theme.accent}26, transparent 62%),
            linear-gradient(165deg, ${theme.heroFrom} 0%, ${theme.heroTo} 55%, #05070d 100%)
          `,
              }
        }
      >
        {heroVariant === "chalkboard" ? (
          <ChalkboardHero y={motifY} />
        ) : heroVariant === "radium" ? (
          <RadiumHero y={motifY} />
        ) : heroVariant === "electric" ? (
          <ElectricHero y={motifY} />
        ) : heroVariant === "naturalist" ? (
          <NaturalistHero y={motifY} />
        ) : heroVariant === "markets" ? (
          <MarketsHero y={motifY} />
        ) : (
          <>
            {/* Fine grid that dissolves toward the edges */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage: `linear-gradient(${theme.accent}1f 1px, transparent 1px), linear-gradient(90deg, ${theme.accent}1f 1px, transparent 1px)`,
                backgroundSize: "52px 52px",
                maskImage:
                  "radial-gradient(ellipse 78% 68% at 50% 0%, black, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 78% 68% at 50% 0%, black, transparent 80%)",
              }}
            />
            {/* Field motif with parallax */}
            <motion.div
              style={{ y: motifY }}
              className="pointer-events-none absolute inset-0 opacity-70"
            >
              <HeroMotif motif={theme.motif} color={theme.accent} />
            </motion.div>
            {/* Soft accent glows for depth */}
            <div
              className="pointer-events-none absolute -top-40 right-0 h-[34rem] w-[34rem] rounded-full blur-[120px] opacity-40"
              style={{ background: theme.accent }}
            />
            <div
              className="pointer-events-none absolute top-1/3 -left-28 h-[26rem] w-[26rem] rounded-full blur-[120px] opacity-20"
              style={{ background: theme.accentDeep }}
            />
            {/* Filmic grain */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />
            {/* Bottom fade for a clean transition into the body */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
              style={{
                background:
                  "linear-gradient(to top, rgba(2,4,10,0.6), transparent)",
              }}
            />
          </>
        )}

        <div className="relative max-w-6xl mx-auto px-6 lg:px-10 pt-8 pb-16 lg:pt-10 lg:pb-24">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm font-medium text-white/55 mb-10 lg:mb-16">
            <Link href="/directory" className="hover:text-white transition-colors">
              Directory
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-white/90">{story.name}</span>
          </div>

          <motion.div
            style={{ opacity: heroFade }}
            className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center"
          >
            {/* Text */}
            <div className="order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
                style={{
                  color: "#fff",
                  background: `${theme.accent}26`,
                  border: `1px solid ${theme.accent}55`,
                }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Great Minds of the Past
              </div>
              <h1 className="font-serif text-white tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                {story.name}
              </h1>
              {story.tagline && (
                <p className="mt-5 max-w-xl text-lg sm:text-xl text-white/75 leading-relaxed font-serif italic">
                  {story.tagline}
                </p>
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Beaker className="h-4 w-4" style={{ color: theme.accent }} />
                  {story.field}
                </span>
                {story.lifespan && (
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays
                      className="h-4 w-4"
                      style={{ color: theme.accent }}
                    />
                    {story.lifespan}
                  </span>
                )}
                {story.birthplace && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: theme.accent }} />
                    {story.birthplace}
                  </span>
                )}
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <span
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium text-white/90"
                  style={{ border: `1px solid ${theme.accent}55` }}
                >
                  {story.era}
                </span>
              </div>

              {showTalk && (
                <div className="mt-8">
                  <button
                    onClick={handleTalkClick}
                    disabled={!!avatarCap && !talkAvailable}
                    className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
                      boxShadow: `0 18px 40px -12px ${theme.accent}99`,
                    }}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ background: "#fff" }}
                      />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                    </span>
                    <MessageCircle className="h-4 w-4" />
                    Talk to {firstName}
                  </button>
                  <p className="mt-2.5 text-xs text-white/55">
                    {!avatarCap
                      ? "A live, AI re-creation — speak face to face."
                      : talkAvailable
                        ? "A live, AI re-creation — speak face to face."
                        : (avatarCap.reason ??
                          "The live avatar isn't available right now.")}
                  </p>
                </div>
              )}
            </div>

            {/* Portrait */}
            {story.imageUrl && (
              <motion.div
                style={{ y: portraitY }}
                className="relative mx-auto order-1 lg:order-2"
              >
                <div
                  className="absolute -inset-3 rounded-[2rem] opacity-40 blur-2xl"
                  style={{ background: theme.accent }}
                />
                <div
                  className="relative aspect-[4/5] w-[18rem] sm:w-[20rem] rounded-[1.75rem] overflow-hidden"
                  style={{
                    border: `1px solid ${theme.accent}66`,
                    boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
                  }}
                >
                  <img
                    src={story.imageUrl}
                    alt={story.name}
                    className={`h-full w-full object-cover ${
                      PORTRAIT_FOCAL_BY_SLUG[story.slug] ?? "object-center"
                    }`}
                  />
                  <div
                    className="absolute inset-0 mix-blend-soft-light opacity-40"
                    style={{ background: theme.accent }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.45), transparent 55%)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* Biography / story */}
        <section className="py-14 lg:py-20">
          <Reveal>
            <div
              className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
              style={{ color: theme.accent }}
            >
              The Story
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-7">
              A life in pursuit of {story.field.toLowerCase()}
            </h2>
          </Reveal>
          <div className="space-y-5">
            {story.biography.map((para, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={`leading-relaxed text-[#334155] ${
                    i === 0 ? "text-xl sm:text-2xl text-[#0F172A] font-serif" : "text-lg"
                  }`}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* First pull quote */}
        {story.quotes[0] && (
          <Reveal>
            <figure
              className="relative rounded-3xl px-7 py-10 sm:px-12 sm:py-14 my-4 overflow-hidden"
              style={{ background: theme.accentSoft }}
            >
              <Quote
                className="absolute top-6 left-6 h-10 w-10 opacity-15"
                style={{ color: theme.accent }}
              />
              <blockquote className="relative font-serif italic text-2xl sm:text-3xl leading-snug text-[#0F172A] text-center max-w-2xl mx-auto">
                &ldquo;{story.quotes[0]}&rdquo;
              </blockquote>
              <figcaption className="mt-6 text-center text-sm font-semibold uppercase tracking-wider text-[#64748B]">
                — {story.name}
              </figcaption>
            </figure>
          </Reveal>
        )}

        {/* Timeline */}
        {story.timeline.length > 0 && (
          <section className="py-14 lg:py-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-10">
                <Milestone className="h-7 w-7" style={{ color: theme.accent }} />
                A Life in Moments
              </h2>
            </Reveal>
            <div className="relative">
              <div
                className="absolute left-[7px] top-2 bottom-2 w-px sm:left-[calc(7rem+7px)]"
                style={{ background: `${theme.accent}33` }}
              />
              <div className="space-y-7">
                {story.timeline.map((t, i) => (
                  <Reveal key={i} delay={i * 0.04}>
                    <div className="relative flex gap-5 sm:gap-7">
                      <div className="hidden sm:block w-28 flex-shrink-0 text-right">
                        <span
                          className="font-serif text-2xl"
                          style={{ color: theme.accentDeep }}
                        >
                          {t.year}
                        </span>
                      </div>
                      <div className="relative flex-shrink-0 pt-2">
                        <span
                          className="block h-3.5 w-3.5 rounded-full ring-4 ring-white"
                          style={{ background: theme.accent }}
                        />
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="sm:hidden text-sm font-bold mb-0.5" style={{ color: theme.accentDeep }}>
                          {t.year}
                        </div>
                        <h3 className="font-semibold text-lg text-[#0F172A]">
                          {t.title}
                        </h3>
                        <p className="text-[#64748B] leading-relaxed mt-0.5">
                          {t.detail}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contributions */}
        {story.contributions.length > 0 && (
          <section className="py-14 lg:py-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-10">
                <Lightbulb className="h-7 w-7" style={{ color: theme.accent }} />
                What They Gave the World
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {story.contributions.map((c, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div
                    className="h-full rounded-2xl bg-white border p-6"
                    style={{ borderColor: `${theme.accent}26` }}
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl mb-4 font-serif text-lg"
                      style={{
                        background: theme.accentSoft,
                        color: theme.accentDeep,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    {c.title && (
                      <h3 className="font-semibold text-lg text-[#0F172A] mb-2">
                        {c.title}
                      </h3>
                    )}
                    <p className="text-[#475569] leading-relaxed">{c.detail}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Remaining quotes */}
        {story.quotes.length > 1 && (
          <section className="py-6">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                <Quote className="h-7 w-7" style={{ color: theme.accent }} />
                In Their Words
              </h2>
            </Reveal>
            <div className="space-y-4">
              {story.quotes.slice(1).map((q, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <blockquote
                    className="rounded-r-2xl p-6 text-lg sm:text-xl font-serif italic text-[#0F172A]"
                    style={{
                      borderLeft: `4px solid ${theme.accent}`,
                      background: theme.accentSoft,
                    }}
                  >
                    &ldquo;{q}&rdquo;
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Legacy */}
        {story.legacy.length > 0 && (
          <section className="py-14 lg:py-20">
            <Reveal>
              <div
                className="rounded-3xl px-7 py-10 sm:px-12 sm:py-14 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.accentDeep} 130%)`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-50">
                  <HeroMotif motif={theme.motif} color={theme.accent} />
                </div>
                <div className="relative">
                  <div
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-4"
                    style={{ color: theme.accent }}
                  >
                    Why It Still Matters
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-6">
                    The Legacy
                  </h2>
                  <div className="space-y-4 max-w-2xl">
                    {story.legacy.map((para, i) => (
                      <p
                        key={i}
                        className="text-lg leading-relaxed text-white/80"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* Did you know */}
        {story.didYouKnow.length > 0 && (
          <section className="pb-14 lg:pb-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                <Flame className="h-7 w-7" style={{ color: theme.accent }} />
                Did You Know?
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-3 gap-4">
              {story.didYouKnow.map((fact, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div
                    className="h-full rounded-2xl bg-white border p-5"
                    style={{ borderColor: `${theme.accent}26` }}
                  >
                    <Sparkles
                      className="h-5 w-5 mb-3"
                      style={{ color: theme.accent }}
                    />
                    <p className="text-[#334155] leading-relaxed text-[15px]">
                      {fact}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Patents (only when present from DB) */}
        {patents.length > 0 && (
          <section className="pb-14 lg:pb-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                <FileText className="h-7 w-7" style={{ color: theme.accent }} />
                Patents
              </h2>
            </Reveal>
            <ul className="space-y-3">
              {patents.map((p, i) => (
                <li key={i}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4 transition-colors"
                    style={{ borderColor: `${theme.accent}26` }}
                  >
                    <FileText className="h-5 w-5 flex-shrink-0 text-[#94A3B8] mt-0.5" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-[#0F172A]">
                        {p.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64748B]">
                        <span className="font-mono font-medium text-[#475569]">
                          {p.number}
                        </span>
                        {p.year && (
                          <>
                            <span className="text-[#CBD5E1]">·</span>
                            <span>{p.year}</span>
                          </>
                        )}
                        <span className="text-[#CBD5E1]">·</span>
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ color: theme.accentDeep }}
                        >
                          {hostname(p.url)}
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Related categories */}
        {relatedCategories.length > 0 && (
          <section className="pb-14 lg:pb-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                <Compass className="h-7 w-7" style={{ color: theme.accent }} />
                Explore Their Fields
              </h2>
            </Reveal>
            <Reveal>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="inline-flex items-center gap-2 bg-white border rounded-full px-4 py-2 text-sm font-medium transition-colors hover:shadow-sm"
                    style={{ borderColor: `${theme.accent}33` }}
                  >
                    {c.name}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </Reveal>
          </section>
        )}

        {/* Related experiments */}
        {relatedExperiments.length > 0 && (
          <section className="pb-14 lg:pb-20">
            <Reveal>
              <h2 className="flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                <Beaker className="h-7 w-7" style={{ color: theme.accent }} />
                Follow in Their Footsteps
              </h2>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedExperiments.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.04}>
                  <Link
                    href={`/experiments/${e.id}`}
                    className="group block bg-white rounded-xl border p-4 transition-colors hover:shadow-sm"
                    style={{ borderColor: `${theme.accent}26` }}
                  >
                    <div className="font-semibold text-[#0F172A]">{e.title}</div>
                    <div className="text-xs text-[#64748B] mt-1">
                      {e.difficulty} · {e.estimatedTime}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="pb-14">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#94A3B8] mb-3">
              <ScrollText className="h-4 w-4" />
              Sources
            </h2>
            <ol className="space-y-2">
              {sources.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-[#94A3B8]">{i + 1}.</span>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:underline break-all"
                    style={{ color: theme.accentDeep }}
                  >
                    {s.title || hostname(s.url)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}

        <div>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
        </div>
      </div>
    </div>

    {talkOpen && talkable && (
      <TalkToFigure
        slug={story.slug}
        name={avatarCap?.name ?? story.name}
        firstName={firstName}
        portraitUrl={story.imageUrl}
        accent={theme.accent}
        providers={avatarProviders}
        onClose={() => setTalkOpen(false)}
      />
    )}
    </>
  );
}
