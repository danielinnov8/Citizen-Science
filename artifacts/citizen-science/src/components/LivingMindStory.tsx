import { useRef } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Rocket,
  Radar,
  GraduationCap,
} from "lucide-react";
import type { FeaturedProfile } from "@workspace/api-client-react";
import { CATEGORIES } from "@/lib/categories";
import { selectFootstepExperiments } from "@/lib/experiments";
import type { LivingMindStory as LivingMindStoryData, LivingMotif } from "@/lib/livingMinds";
import { useMentorCta } from "@/lib/useMentorCta";
import { NobelBadge } from "@/components/NobelBadge";
import { NobelFootsteps } from "@/components/NobelFootsteps";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

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
// to the living figure's modern discipline so every page feels distinct.
function HeroMotif({ motif, color }: { motif: LivingMotif; color: string }) {
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
      {motif === "space" && (
        <g {...common} opacity={0.5}>
          {/* Orbital ellipses */}
          {[110, 200, 300].map((r) => (
            <ellipse
              key={r}
              cx={400}
              cy={300}
              rx={r}
              ry={r * 0.38}
              transform="rotate(-22 400 300)"
            />
          ))}
          <circle cx={400} cy={300} r={9} fill={color} stroke="none" />
          {/* A rising rocket arc */}
          <path d="M120 560 C 260 460, 360 360, 560 120" strokeDasharray="3 9" strokeWidth={1.4} />
          {/* Scattered stars */}
          {[
            [120, 90],
            [690, 140],
            [600, 470],
            [180, 470],
            [320, 110],
            [520, 200],
            [260, 350],
            [700, 360],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 2 ? 2 : 3} fill={color} stroke="none" />
          ))}
        </g>
      )}
      {motif === "neural" && (
        <g {...common} opacity={0.4}>
          {(() => {
            const cols = [120, 300, 480, 660];
            const rows = [120, 220, 320, 420, 500];
            const nodes = cols.map((x) => rows.map((y) => [x, y] as const));
            return (
              <>
                {nodes.slice(0, -1).map((col, ci) =>
                  col.map(([x1, y1], ri) =>
                    nodes[ci + 1].map(([x2, y2], rj) => (
                      <line
                        key={`${ci}-${ri}-${rj}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        strokeOpacity={(ri + rj) % 3 === 0 ? 0.5 : 0.12}
                      />
                    )),
                  ),
                )}
                {nodes.flat().map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={5} fill={color} stroke="none" />
                ))}
              </>
            );
          })()}
        </g>
      )}
      {motif === "genome" && (
        <g {...common} opacity={0.45}>
          {/* Double helix */}
          {(() => {
            const turns = Array.from({ length: 26 });
            const strandA: string[] = [];
            const strandB: string[] = [];
            turns.forEach((_, i) => {
              const y = i * 24;
              const x = 400 + Math.sin(i * 0.6) * 150;
              const x2 = 400 - Math.sin(i * 0.6) * 150;
              strandA.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
              strandB.push(`${i === 0 ? "M" : "L"}${x2} ${y}`);
            });
            return (
              <>
                <path d={strandA.join(" ")} strokeWidth={1.6} />
                <path d={strandB.join(" ")} strokeWidth={1.6} />
                {turns.map((_, i) => {
                  if (i % 2) return null;
                  const y = i * 24;
                  const x = 400 + Math.sin(i * 0.6) * 150;
                  const x2 = 400 - Math.sin(i * 0.6) * 150;
                  return (
                    <line key={i} x1={x} y1={y} x2={x2} y2={y} strokeOpacity={0.5} />
                  );
                })}
              </>
            );
          })()}
        </g>
      )}
      {motif === "web" && (
        <g {...common} opacity={0.42}>
          {(() => {
            const pts = [
              [400, 300],
              [180, 140],
              [640, 150],
              [120, 420],
              [690, 440],
              [400, 90],
              [400, 520],
              [260, 300],
              [560, 300],
            ];
            return (
              <>
                {pts.slice(1).map(([x, y], i) => (
                  <line key={i} x1={400} y1={300} x2={x} y2={y} strokeOpacity={0.4} />
                ))}
                {[
                  [1, 5],
                  [5, 2],
                  [2, 4],
                  [4, 6],
                  [6, 3],
                  [3, 1],
                  [7, 8],
                ].map(([a, b], i) => (
                  <line
                    key={`e${i}`}
                    x1={pts[a][0]}
                    y1={pts[a][1]}
                    x2={pts[b][0]}
                    y2={pts[b][1]}
                    strokeOpacity={0.2}
                  />
                ))}
                {pts.map(([x, y], i) => (
                  <circle
                    key={`n${i}`}
                    cx={x}
                    cy={y}
                    r={i === 0 ? 8 : 4}
                    fill={color}
                    stroke="none"
                  />
                ))}
              </>
            );
          })()}
        </g>
      )}
      {motif === "chip" && (
        <g {...common} opacity={0.4}>
          <rect x={300} y={210} width={200} height={180} rx={10} strokeWidth={1.6} />
          <rect x={340} y={250} width={120} height={100} rx={6} strokeOpacity={0.6} />
          {/* Pins */}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 230 + i * 28;
            return (
              <g key={i}>
                <line x1={300} y1={y} x2={240} y2={y} />
                <line x1={500} y1={y} x2={560} y2={y} />
              </g>
            );
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const x = 320 + i * 28;
            return (
              <g key={`v${i}`}>
                <line x1={x} y1={210} x2={x} y2={150} />
                <line x1={x} y1={390} x2={x} y2={450} />
              </g>
            );
          })}
          {/* Traces */}
          {[120, 680].map((x) => (
            <path key={x} d={`M${x} 80 L ${x} 300 L ${x === 120 ? 240 : 560} 300`} strokeOpacity={0.3} />
          ))}
        </g>
      )}
      {motif === "exoplanet" && (
        <g {...common} opacity={0.5}>
          <circle cx={250} cy={280} r={70} strokeWidth={1.6} />
          <ellipse cx={250} cy={280} rx={140} ry={42} transform="rotate(-16 250 280)" />
          {/* Distant sun + transit dots */}
          <circle cx={650} cy={150} r={40} strokeOpacity={0.5} />
          <circle cx={650} cy={150} r={5} fill={color} stroke="none" />
          {[
            [120, 90],
            [710, 420],
            [560, 520],
            [180, 480],
            [400, 120],
            [480, 320],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={i % 2 ? 2 : 3} fill={color} stroke="none" />
          ))}
        </g>
      )}
      {motif === "nature" && (
        <g {...common} opacity={0.42}>
          {/* Branching canopy */}
          <path d="M400 600 L 400 360" strokeWidth={1.8} />
          <path d="M400 360 C 320 320, 280 250, 240 170" strokeWidth={1.4} />
          <path d="M400 360 C 480 320, 520 250, 560 170" strokeWidth={1.4} />
          <path d="M400 440 C 350 410, 320 370, 280 320" strokeWidth={1.2} />
          <path d="M400 440 C 450 410, 480 370, 520 320" strokeWidth={1.2} />
          {/* Leaves */}
          {[
            [240, 170],
            [560, 170],
            [280, 320],
            [520, 320],
            [330, 250],
            [470, 250],
          ].map(([cx, cy], i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={16}
              ry={8}
              transform={`rotate(${i % 2 ? 35 : -35} ${cx} ${cy})`}
              fill={color}
              fillOpacity={0.18}
            />
          ))}
        </g>
      )}
      {motif === "molecule" && (
        <g {...common} opacity={0.42}>
          {/* Hexagonal ring (benzene-like) */}
          {(() => {
            const cx = 400;
            const cy = 300;
            const r = 120;
            const pts = Array.from({ length: 6 }).map((_, i) => {
              const a = (Math.PI / 3) * i - Math.PI / 2;
              return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
            });
            return (
              <>
                {pts.map(([x, y], i) => {
                  const [x2, y2] = pts[(i + 1) % 6];
                  return <line key={i} x1={x} y1={y} x2={x2} y2={y2} strokeWidth={1.6} />;
                })}
                {pts.map(([x, y], i) => {
                  const ax = cx + (x - cx) * 1.7;
                  const ay = cy + (y - cy) * 1.7;
                  return (
                    <g key={`b${i}`}>
                      <line x1={x} y1={y} x2={ax} y2={ay} strokeOpacity={0.5} />
                      <circle cx={ax} cy={ay} r={7} fill={color} stroke="none" />
                    </g>
                  );
                })}
                {pts.map(([x, y], i) => (
                  <circle key={`v${i}`} cx={x} cy={y} r={6} fill={color} stroke="none" />
                ))}
              </>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

export function LivingMindStory({
  story,
  profile,
}: {
  story: LivingMindStoryData;
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
  const { startMentorship, isJoining } = useMentorCta();
  const firstName = story.name.split(/\s+/)[0] || story.name;

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

  const relatedExperiments = selectFootstepExperiments(
    story.slug,
    relatedCategorySlugs,
  );

  return (
    <div className="w-full animate-in fade-in duration-500 pb-32">
      {/* ===== Cinematic hero ===== */}
      <div
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          backgroundColor: theme.heroTo,
          backgroundImage: `
            radial-gradient(55rem 38rem at 8% -15%, ${theme.accent}40, transparent 60%),
            radial-gradient(48rem 48rem at 100% -8%, ${theme.accentDeep}66, transparent 55%),
            radial-gradient(42rem 36rem at 88% 120%, ${theme.accent}26, transparent 62%),
            linear-gradient(165deg, ${theme.heroFrom} 0%, ${theme.heroTo} 55%, #05070d 100%)
          `,
        }}
      >
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
        {/* Photographic hero backdrop (when provided) with parallax */}
        {theme.heroImage && (
          <motion.div
            style={{ y: motifY }}
            className="pointer-events-none absolute inset-0"
          >
            <img
              src={theme.heroImage}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-60"
            />
            {/* Darken the left edge for legible text without recoloring the photo */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(105deg, ${theme.heroFrom}f2 0%, ${theme.heroFrom}b8 32%, ${theme.heroFrom}40 58%, transparent 100%)`,
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-48"
              style={{
                background: `linear-gradient(to top, ${theme.heroTo}, transparent)`,
              }}
            />
          </motion.div>
        )}
        {/* Field motif with parallax (skipped when a photo backdrop is set) */}
        {!theme.heroImage && (
          <motion.div
            style={{ y: motifY }}
            className="pointer-events-none absolute inset-0 opacity-70"
          >
            <HeroMotif motif={theme.motif} color={theme.accent} />
          </motion.div>
        )}
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
            background: "linear-gradient(to top, rgba(2,4,10,0.6), transparent)",
          }}
        />

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
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
                style={{
                  color: "#fff",
                  background: `${theme.accent}26`,
                  border: `1px solid ${theme.accent}55`,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: theme.accent }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ background: theme.accent }}
                  />
                </span>
                Shaping the Future
              </div>
              <h1 className="font-serif text-white tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                {story.name}
              </h1>
              <p className="mt-5 max-w-xl text-lg sm:text-xl text-white/75 leading-relaxed font-serif italic">
                {story.tagline}
              </p>
              {profile?.nobelPrizes && profile.nobelPrizes.length > 0 && (
                <NobelBadge prizes={profile.nobelPrizes} className="mt-6" />
              )}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Beaker className="h-4 w-4" style={{ color: theme.accent }} />
                  {story.field}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays
                    className="h-4 w-4"
                    style={{ color: theme.accent }}
                  />
                  {story.born}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" style={{ color: theme.accent }} />
                  {story.base}
                </span>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => startMentorship(story.slug)}
                  disabled={isJoining}
                  className="group/cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-70"
                  style={{
                    background: theme.accent,
                    boxShadow: `0 16px 30px -12px ${theme.accent}`,
                  }}
                >
                  <GraduationCap className="h-4 w-4" />
                  Be mentored by {firstName}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-0.5" />
                </button>
                <Link
                  href="/mentors"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  All mentors
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Portrait */}
            <motion.div style={{ y: portraitY }} className="relative mx-auto">
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
                  className="h-full w-full object-cover"
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
              A life shaping {story.field.toLowerCase()}
            </h2>
          </Reveal>
          <div className="space-y-5">
            {story.biography.map((para, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p
                  className={`leading-relaxed text-[#334155] ${
                    i === 0
                      ? "text-xl sm:text-2xl text-[#0F172A] font-serif"
                      : "text-lg"
                  }`}
                >
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* What they're building now */}
        {story.buildingNow.length > 0 && (
          <section className="pb-2">
            <Reveal>
              <div
                className="rounded-3xl px-7 py-10 sm:px-12 sm:py-12 text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.accentDeep} 130%)`,
                }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-40">
                  <HeroMotif motif={theme.motif} color={theme.accent} />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <Rocket className="h-6 w-6" style={{ color: theme.accent }} />
                    <div
                      className="text-xs font-bold uppercase tracking-[0.2em]"
                      style={{ color: theme.accent }}
                    >
                      Right Now
                    </div>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-8">
                    What They&apos;re Building Now
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    {story.buildingNow.map((c, i) => (
                      <div
                        key={i}
                        className="rounded-2xl p-5 backdrop-blur-sm"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <h3 className="font-semibold text-lg text-white mb-1.5">
                          {c.title}
                        </h3>
                        <p className="text-white/70 leading-relaxed text-[15px]">
                          {c.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {/* First pull quote */}
        {story.quotes[0] && (
          <Reveal>
            <figure
              className="relative rounded-3xl px-7 py-10 sm:px-12 sm:py-14 my-10 overflow-hidden"
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
                The Journey So Far
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
                        <div
                          className="sm:hidden text-sm font-bold mb-0.5"
                          style={{ color: theme.accentDeep }}
                        >
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
                Breakthroughs &amp; Contributions
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
                    <h3 className="font-semibold text-lg text-[#0F172A] mb-2">
                      {c.title}
                    </h3>
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

        {/* Impact — why it matters now */}
        {story.impact.length > 0 && (
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
                  <div className="flex items-center gap-3 mb-2">
                    <Radar className="h-6 w-6" style={{ color: theme.accent }} />
                    <div
                      className="text-xs font-bold uppercase tracking-[0.2em]"
                      style={{ color: theme.accent }}
                    >
                      Why It Matters Now
                    </div>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mb-6">
                    The Impact
                  </h2>
                  <div className="space-y-4 max-w-2xl">
                    {story.impact.map((para, i) => (
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

        {/* Footsteps — custom Nobel experiments for laureates, otherwise the
            generic category experiments. */}
        {profile?.nobelPrizes && profile.nobelPrizes.length > 0 ? (
          <section className="pb-14 lg:pb-20">
            <Reveal>
              <NobelFootsteps
                name={story.name}
                prizes={profile.nobelPrizes}
                accent={theme.accent}
                variant="cinematic"
              />
            </Reveal>
          </section>
        ) : (
          relatedExperiments.length > 0 && (
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
          )
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
  );
}
