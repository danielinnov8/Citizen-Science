import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  Users,
  Zap,
  ChevronRight,
  AlertTriangle,
  ArrowBigUp,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { useListChallenges, getListChallengesQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { simulatedChallengeUpvotes } from "@/lib/challengeSim";

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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const DOMAIN_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  climate:      { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500" },
  energy:       { bg: "bg-yellow-50",   text: "text-yellow-700",   dot: "bg-yellow-500" },
  health:       { bg: "bg-rose-50",     text: "text-rose-700",     dot: "bg-rose-500" },
  food:         { bg: "bg-orange-50",   text: "text-orange-700",   dot: "bg-orange-500" },
  water:        { bg: "bg-sky-50",      text: "text-sky-700",      dot: "bg-sky-500" },
  education:    { bg: "bg-violet-50",   text: "text-violet-700",   dot: "bg-violet-500" },
  "AI safety":  { bg: "bg-purple-50",   text: "text-purple-700",   dot: "bg-purple-500" },
  biodiversity: { bg: "bg-green-50",    text: "text-green-700",    dot: "bg-green-500" },
  "mental health": { bg: "bg-pink-50",  text: "text-pink-700",     dot: "bg-pink-500" },
  inequality:   { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-500" },
  peace:        { bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "text-red-600" },
  high:     { label: "High",     color: "text-orange-500" },
  medium:   { label: "Medium",   color: "text-yellow-600" },
};

function domainStyle(domain: string) {
  return DOMAIN_COLORS[domain] ?? { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" };
}

const ALL_DOMAINS = [
  "All", "climate", "energy", "health", "food", "water", "education",
  "AI safety", "biodiversity", "mental health", "inequality", "peace",
];

export function Challenges() {
  const [search, setSearch] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");
  const [view, setView] = useState<"list" | "grid">("list");

  const { data: challenges = [], isLoading } = useListChallenges({
    query: { queryKey: getListChallengesQueryKey(), staleTime: 1000 * 60, refetchOnWindowFocus: false },
  });

  const filtered = useMemo(() => {
    let list = [...challenges];
    if (activeDomain !== "All") {
      list = list.filter((c) => c.domain === activeDomain);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q),
      );
    }
    // Rank by upvotes (descending) so the most-supported challenges lead.
    list.sort((a, b) => simulatedChallengeUpvotes(b.slug) - simulatedChallengeUpvotes(a.slug));
    return list;
  }, [challenges, activeDomain, search]);

  const totalMembers = challenges.reduce((sum, c) => sum + c.memberCount, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[#0F172A] text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 50% -10%, #3B82F6 0%, transparent 60%)," +
              "radial-gradient(ellipse 60% 40% at 100% 100%, #7C3AED 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 mb-6">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              Humanity's Greatest Challenges
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-4">
              The{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                25 Problems
              </span>
              <br />
              That Define Our Generation
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed mb-10">
              From climate change to AI safety, these are the defining challenges of our time. Join the global movement of scientists, engineers, and citizens working to solve them.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                {challenges.length} active challenges
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {totalMembers.toLocaleString()} members joined
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div className="sticky top-14 z-10 bg-white/95 backdrop-blur border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search challenges…"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-4 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-1 min-w-0">
            {ALL_DOMAINS.map((domain) => {
              const active = activeDomain === domain;
              const ds = domain !== "All" ? domainStyle(domain) : null;
              return (
                <button
                  key={domain}
                  type="button"
                  onClick={() => setActiveDomain(domain)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-[#0F172A] text-white"
                      : ds
                        ? `${ds.bg} ${ds.text} hover:opacity-80`
                        : "bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]",
                  )}
                >
                  {ds && <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-white" : ds.dot)} />}
                  {domain}
                </button>
              );
            })}
          </div>
          <div className="shrink-0 flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                view === "list" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#94A3B8] hover:text-[#475569]",
              )}
            >
              <ListIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                view === "grid" ? "bg-white text-[#0F172A] shadow-sm" : "text-[#94A3B8] hover:text-[#475569]",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-[#E2E8F0] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-[#94A3B8]">
            <AlertTriangle className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm font-medium">No challenges match your filters</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setActiveDomain("All"); }}
              className="mt-3 text-xs text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : view === "list" ? (
          <div className="space-y-2.5">
            {filtered.map((challenge, i) => {
              const ds = domainStyle(challenge.domain);
              const urgency = URGENCY_CONFIG[challenge.urgency] ?? { label: challenge.urgency, color: "text-slate-500" };
              const upvotes = simulatedChallengeUpvotes(challenge.slug);
              return (
                <Reveal key={challenge.slug} delay={Math.min(i * 0.03, 0.25)}>
                  <Link href={`/challenges/${challenge.slug}`}>
                    <div className="group flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 cursor-pointer">
                      <div className="w-6 shrink-0 text-center text-sm font-bold text-[#CBD5E1]">
                        {i + 1}
                      </div>

                      <div className="flex w-14 shrink-0 flex-col items-center gap-0.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] py-1.5">
                        <ArrowBigUp className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold tabular-nums text-[#0F172A]">{upvotes}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              ds.bg, ds.text,
                            )}
                          >
                            <span className={cn("h-1.5 w-1.5 rounded-full", ds.dot)} />
                            {challenge.domain}
                          </span>
                          <span className={cn("text-[10px] font-bold uppercase tracking-wide", urgency.color)}>
                            {urgency.label}
                          </span>
                        </div>
                        <h3 className="text-[15px] font-semibold text-[#0F172A] leading-snug group-hover:text-blue-700 transition-colors truncate">
                          {challenge.title}
                        </h3>
                        <p className="text-[13px] text-[#64748B] leading-relaxed line-clamp-1">
                          {challenge.summary}
                        </p>
                      </div>

                      <span className="hidden sm:flex items-center gap-1 text-[12px] text-[#94A3B8] shrink-0">
                        <Users className="h-3.5 w-3.5" />
                        {challenge.memberCount.toLocaleString()}
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#CBD5E1] shrink-0 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((challenge, i) => {
              const ds = domainStyle(challenge.domain);
              const urgency = URGENCY_CONFIG[challenge.urgency] ?? { label: challenge.urgency, color: "text-slate-500" };
              const upvotes = simulatedChallengeUpvotes(challenge.slug);
              return (
                <Reveal key={challenge.slug} delay={Math.min(i * 0.04, 0.3)}>
                  <Link href={`/challenges/${challenge.slug}`}>
                    <div className="group h-full flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            ds.bg, ds.text,
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", ds.dot)} />
                          {challenge.domain}
                        </span>
                        <span className={cn("text-[11px] font-bold uppercase tracking-wide", urgency.color)}>
                          {urgency.label}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#0F172A] leading-snug mb-2 group-hover:text-blue-700 transition-colors flex-1">
                        {challenge.title}
                      </h3>

                      <p className="text-[13px] text-[#64748B] leading-relaxed line-clamp-3 mb-4">
                        {challenge.summary}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F1F5F9]">
                        <div className="flex items-center gap-3 text-[12px] text-[#94A3B8]">
                          <span className="flex items-center gap-1 font-semibold text-emerald-600">
                            <ArrowBigUp className="h-3.5 w-3.5" />
                            {upvotes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {challenge.memberCount.toLocaleString()}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[12px] font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          Explore <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
