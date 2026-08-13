import React, { useMemo } from "react";
import { Link } from "wouter";
import {
  Sparkles, Users, GraduationCap, FlaskConical,
  ChevronRight, ArrowRight, Clock, UserRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCreditBalance } from "@/components/CreditMeter";
import { useListFeaturedProfiles } from "@workspace/api-client-react";
import { storage } from "@/lib/storage";
import { EXPERIMENTS } from "@/lib/experiments";
import { CATEGORIES } from "@/lib/categories";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const PILLARS = [
  {
    href: "/profile",
    icon: UserRound,
    label: "See my profile",
    sub: "Make it yours",
    bg: "bg-rose-50",
    fg: "text-rose-600",
    border: "border-rose-100",
    hoverBorder: "hover:border-rose-300",
  },
  {
    href: "/agent",
    icon: Sparkles,
    label: "AI Copilot",
    sub: "Ask anything scientific",
    bg: "bg-blue-50",
    fg: "text-blue-600",
    border: "border-blue-100",
    hoverBorder: "hover:border-blue-300",
  },
  {
    href: "/directory",
    icon: Users,
    label: "Great Minds",
    sub: "300+ scientists & inventors",
    bg: "bg-violet-50",
    fg: "text-violet-600",
    border: "border-violet-100",
    hoverBorder: "hover:border-violet-300",
  },
  {
    href: "/mentors",
    icon: GraduationCap,
    label: "Find a Mentor",
    sub: "Living legends & community",
    bg: "bg-emerald-50",
    fg: "text-emerald-600",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  {
    href: "/experiments",
    icon: FlaskConical,
    label: "Experiments",
    sub: "Hands-on science",
    bg: "bg-amber-50",
    fg: "text-amber-600",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-300",
  },
] as const;

const SHOW_CATEGORIES = ["biology", "physics", "astronomy", "chemistry", "neuroscience", "climate-science", "computer-science"];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Dashboard() {
  const { user } = useAuth();
  const { data: credits } = useCreditBalance();
  const { data: profilesData } = useListFeaturedProfiles();

  const prefs = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("cs_preferences") ?? "{}") as Record<string, unknown>; }
    catch { return {}; }
  }, []);

  const started = storage.getStartedExperiments();

  const activeExps = useMemo(() => {
    if (started.length === 0) {
      return EXPERIMENTS.slice(0, 3).map(e => ({ id: e.id, title: e.title, cat: e.categoryId, progress: 0 }));
    }
    return started.slice(0, 3).map(s => {
      const e = EXPERIMENTS.find(x => x.id === s.id);
      return { id: s.id, title: e?.title ?? "Unknown", cat: e?.categoryId ?? "", progress: s.progress };
    });
  }, [started]);

  const featuredMinds = useMemo(() => {
    const all = Array.isArray(profilesData) ? profilesData : (profilesData as { profiles?: unknown[] } | undefined)?.profiles ?? [];
    return (all as { slug: string; name: string; field?: string; imageUrl?: string }[])
      .filter(p => p.imageUrl)
      .slice(0, 12);
  }, [profilesData]);

  const showcaseCategories = useMemo(
    () => CATEGORIES.filter(c => SHOW_CATEGORIES.includes(c.slug)).slice(0, 6),
    [],
  );

  const firstName = user?.name?.split(" ")[0] ?? "there";
  const fields = Array.isArray(prefs.fields) ? (prefs.fields as string[]).slice(0, 2) : [];

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold text-[#64748B] tracking-widest uppercase mb-1.5">
            {greeting()}
          </p>
          <h1 className="text-3xl font-serif tracking-tight text-[#0F172A] mb-2">
            {firstName}.
          </h1>
          <p className="text-[#64748B] text-sm">
            {fields.length > 0
              ? `Your ${fields.join(" & ")} research network awaits.`
              : "Your research network awaits."}
          </p>
        </div>
        {credits && (
          <div className="flex-shrink-0">
            <Link href="/pricing">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 shadow-sm hover:border-blue-200 transition-colors cursor-pointer">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-sm font-semibold text-[#0F172A]">
                  {credits.totalRemaining ?? 0}
                </span>
                <span className="text-xs text-[#64748B]">credits</span>
                <span className="text-[10px] font-medium text-[#94a3b8] border-l border-[#E2E8F0] pl-2 capitalize">
                  {credits.plan ?? "free"}
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* ── Pillars ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-12">
        {PILLARS.map(({ href, icon: Icon, label, sub, bg, fg, border, hoverBorder }) => (
          <Link key={href} href={href}>
            <div className={`group flex flex-col gap-3 p-4 rounded-2xl border bg-white ${border} ${hoverBorder} shadow-sm hover:shadow-md transition-all cursor-pointer`}>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${fg}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F172A] leading-tight">{label}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{sub}</p>
              </div>
              <ArrowRight className={`h-3.5 w-3.5 ${fg} opacity-0 group-hover:opacity-100 transition-opacity mt-auto`} />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Featured minds ───────────────────────────────────────── */}
      {featuredMinds.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">From the Directory</h2>
            <Link href="/directory" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {featuredMinds.map(p => (
              <Link key={p.slug} href={`/directory/${p.slug}`}>
                <div className="flex-shrink-0 w-28 group cursor-pointer">
                  <div className="h-20 w-20 mx-auto rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm group-hover:shadow-md transition-shadow mb-2">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover"
                      onError={e => {
                        const el = e.currentTarget;
                        el.style.display = "none";
                        const parent = el.parentElement;
                        if (parent) {
                          parent.className = parent.className + " bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center";
                          parent.innerHTML = `<span class="text-slate-500 text-lg font-bold">${initials(p.name)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-[#0F172A] text-center leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                    {p.name}
                  </p>
                  {p.field && (
                    <p className="text-[10px] text-[#94a3b8] text-center mt-0.5 line-clamp-1">{p.field}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Continue your work ───────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">
            {started.length > 0 ? "Continue your work" : "Start an experiment"}
          </h2>
          <Link href="/experiments" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            All experiments <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {activeExps.map((exp, i) => (
            <Link key={i} href={`/experiments/${exp.id}`}>
              <div className="group flex flex-col gap-3 p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer h-full">
                <span className="text-[10px] uppercase font-bold text-[#94a3b8] tracking-wider">
                  {exp.cat.replace(/-/g, " ")}
                </span>
                <p className="text-sm font-medium text-[#0F172A] leading-snug flex-1 group-hover:text-blue-700 transition-colors">
                  {exp.title}
                </p>
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  {exp.progress > 0 ? (
                    <>
                      <div className="flex-1 h-1 bg-[#E2E8F0] rounded-full mr-3 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${exp.progress}%` }} />
                      </div>
                      <span className="font-medium">{exp.progress}%</span>
                    </>
                  ) : (
                    <span className="flex items-center gap-1 text-[#94a3b8]">
                      <Clock className="h-3 w-3" /> Not started
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Science fields ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-[#0F172A]">Explore science fields</h2>
          <Link href="/categories" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            All fields <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {showcaseCategories.map(cat => (
            <Link key={cat.slug} href={`/category/${cat.slug}`}>
              <div
                className="group flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeftWidth: 3, borderLeftColor: cat.accent }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{cat.difficulty}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#cbd5e1] group-hover:text-blue-500 flex-shrink-0 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
