import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRight,
  Sparkles,
  CreditCard,
  Coins,
  Crown,
  Handshake,
  ShoppingCart,
  Building2,
  HeartHandshake,
  Check,
  TrendingUp,
  Repeat,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";
import { LABS } from "@/lib/labs";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

const CONTACT_EMAIL = "info@citizen-science.org";

type Maturity = "Live" | "Live · ramping" | "In build" | "Planned";

type RevModel =
  | { kind: "monthly"; perUser: number }
  | { kind: "cumulative"; convRate: number; price: number; cap: number }
  | { kind: "flat"; monthly: number };

type Strategy = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  model: string;
  maturity: Maturity;
  rev: RevModel;
  summary: string;
  points: string[];
  cta?: { label: string; href: string; external?: boolean };
};

const REFERRAL_PARTNERS = LABS.length;
const ACTIVE_REFERRALS = LABS.filter((l) => l.referralUrl).length;

const STRATEGIES: Strategy[] = [
  {
    id: "subscriptions",
    name: "Credit subscriptions",
    icon: CreditCard,
    model: "Recurring revenue",
    maturity: "Live",
    rev: { kind: "monthly", perUser: 1.6 },
    summary:
      "Three simple tiers. Money buys a monthly pool of credits, and every AI feature draws those credits down based on real usage.",
    points: [
      "Free — ~200 credits / month, no card required",
      "Researcher — $20 / month, ~2,000 credits",
      "Pioneer — $100 / month, ~12,000 credits",
      "Usage metered by actual AI tokens consumed",
    ],
    cta: { label: "See the plans", href: "/pricing" },
  },
  {
    id: "topups",
    name: "Credit top-up packs",
    icon: Coins,
    model: "Usage / consumption",
    maturity: "In build",
    rev: { kind: "monthly", perUser: 0.2 },
    summary:
      "When a member runs out of monthly credits, they can buy a one-time pack instead of waiting for the next refill. Top-up credits never expire.",
    points: [
      "On-demand packs for heavy users",
      "Non-expiring — buy now, use anytime",
      "Smooths revenue beyond flat subscriptions",
      "Prompted automatically at the out-of-credits moment",
    ],
    cta: { label: "See top-ups", href: "/pricing#topups" },
  },
  {
    id: "founding",
    name: "Founding members",
    icon: Crown,
    model: "One-time · lifetime",
    maturity: "Live",
    rev: { kind: "cumulative", convRate: 0.005, price: 2500, cap: 100 },
    summary:
      "A limited run of lifetime memberships for early believers who want to fund the mission directly — capital up front, plus a community of champions.",
    points: [
      "$2,500 one-time, limited to the first 100",
      "Lifetime access to every paid feature",
      "Homepage feature + Founding Member badge",
      "Early non-dilutive capital to build with",
    ],
    cta: { label: "Become a founder", href: "/pricing#founding" },
  },
  {
    id: "referrals",
    name: "Lab & kit referrals",
    icon: Handshake,
    model: "Referral commissions",
    maturity: "Live · ramping",
    rev: { kind: "monthly", perUser: 0.22 },
    summary:
      "When the copilot points a curious member to a real test kit or lab — DNA, microbiome, soil, water, air — we earn a referral commission on partners who offer one.",
    points: [
      `${REFERRAL_PARTNERS} curated lab & test-kit partners`,
      `${ACTIVE_REFERRALS} live referral link${ACTIVE_REFERRALS === 1 ? "" : "s"} earning today`,
      "Recommendations stay genuinely useful first",
      "More partner programs added over time",
    ],
    cta: { label: "Browse the labs", href: "/experiments" },
  },
  {
    id: "affiliate",
    name: "Amazon Associates",
    icon: ShoppingCart,
    model: "Affiliate commissions",
    maturity: "Live",
    rev: { kind: "monthly", perUser: 0.1 },
    summary:
      "Any Amazon product the copilot mentions — a microscope, a soil kit, a textbook — is automatically tagged with our Associates ID, so helpful gear recommendations earn a small commission.",
    points: [
      "Auto-tagged across copilot replies & sources",
      "Zero extra cost to the member",
      "Scales with every science conversation",
      "Fully transparent, on-brand recommendations",
    ],
  },
  {
    id: "institutional",
    name: "Institutional & API",
    icon: Building2,
    model: "B2B / licensing",
    maturity: "Planned",
    rev: { kind: "monthly", perUser: 0.45 },
    summary:
      "Schools, universities, labs, and research partners need seats, dashboards, and data. Bespoke licensing and API access turn the platform into infrastructure.",
    points: [
      "Classroom cohorts & bulk student seats",
      "API access & data partnerships",
      "White-labeling and custom integrations",
      "Volume & site licensing for institutions",
    ],
    cta: { label: "Talk to us", href: `mailto:${CONTACT_EMAIL}`, external: true },
  },
  {
    id: "grants",
    name: "Grants & mission capital",
    icon: HeartHandshake,
    model: "Non-dilutive",
    maturity: "Planned",
    rev: { kind: "flat", monthly: 16700 },
    summary:
      "As a public-benefit company, we're built to attract grants, prizes, and philanthropic capital aligned with widening access to real science.",
    points: [
      "Science & education foundation grants",
      "Prize capital (XPRIZE-style challenges)",
      "Aligned philanthropic partnerships",
      "Funds the always-free Explorer tier",
    ],
  },
];

const MATURITY_STYLES: Record<Maturity, string> = {
  Live: "bg-green-50 text-green-700 ring-1 ring-green-200",
  "Live · ramping": "bg-green-50 text-green-700 ring-1 ring-green-200",
  "In build": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Planned: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const PRINCIPLES: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Free forever stays free",
    body: "Access to real science can't sit behind a hard paywall. The Explorer tier is permanent — paid plans fund it.",
  },
  {
    icon: Repeat,
    title: "Pay for what you use",
    body: "Credits track actual usage, so light users are never overcharged and heavy users can simply buy more.",
  },
  {
    icon: TrendingUp,
    title: "Aligned, not extractive",
    body: "Referrals and affiliates only ever surface genuinely useful kits and gear — recommendations earn trust first.",
  },
];

const MIX: { label: string; value: string; note: string }[] = [
  { label: "Recurring", value: "Subscriptions", note: "Predictable monthly base" },
  { label: "Usage", value: "Top-ups", note: "Scales with power users" },
  { label: "Performance", value: "Referrals & affiliate", note: "Earns as members act" },
  { label: "Capital", value: "Founders & grants", note: "Funds the mission" },
];

const REV_COLORS: Record<string, string> = {
  subscriptions: "#2563EB",
  institutional: "#7C3AED",
  referrals: "#16A34A",
  topups: "#0EA5E9",
  affiliate: "#F59E0B",
  founding: "#EAB308",
  grants: "#14B8A6",
};

const STRATEGY_LABEL: Record<string, string> = Object.fromEntries(
  STRATEGIES.map((s) => [s.id, s.name]),
);

// 0 → 100,000 active users, in 10k steps
const USER_POINTS = Array.from({ length: 11 }, (_, i) => i * 10_000);

function streamRevenue(s: Strategy, users: number): number {
  switch (s.rev.kind) {
    case "monthly":
      return s.rev.perUser * users;
    case "cumulative":
      return Math.min(users * s.rev.convRate, s.rev.cap) * s.rev.price;
    case "flat":
      return s.rev.monthly;
  }
}

function formatMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${Math.round(v)}`;
}

function formatUsers(v: number): string {
  if (v >= 1_000) return `${v / 1_000}k`;
  return `${v}`;
}

const SCALING = STRATEGIES.filter((s) => s.rev.kind === "monthly");

const COMBINED_DATA = USER_POINTS.map((u) => {
  const row: Record<string, number> = { users: u };
  let total = 0;
  for (const s of SCALING) {
    const v = streamRevenue(s, u);
    row[s.id] = v;
    total += v;
  }
  row.total = total;
  return row;
});

const BLENDED_ARPU = SCALING.reduce(
  (sum, s) => sum + (s.rev.kind === "monthly" ? s.rev.perUser : 0),
  0,
);
const MRR_AT_100K = BLENDED_ARPU * 100_000;

function MiniRevChart({ s }: { s: Strategy }) {
  const color = REV_COLORS[s.id] ?? "#2563EB";
  const data = USER_POINTS.map((u) => ({ users: u, value: streamRevenue(s, u) }));
  const caption =
    s.rev.kind === "monthly"
      ? `~$${s.rev.perUser.toFixed(2)}/user · mo`
      : s.rev.kind === "cumulative"
        ? `one-time · caps ${formatMoney(s.rev.cap * s.rev.price)}`
        : "flat · not user-driven";
  return (
    <div className="mt-5 border-t border-[#F1F5F9] pt-4">
      <div className="flex items-center justify-between text-[11px] font-medium text-[#94A3B8]">
        <span>Revenue · 0–100k users</span>
        <span>{caption}</span>
      </div>
      <div className="mt-2 h-[68px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
            <defs>
              <linearGradient id={`mini-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.32} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#mini-${s.id})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CombinedTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string | number; value?: number; color?: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0);
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white/95 p-3 shadow-lg backdrop-blur">
      <p className="text-xs font-semibold text-[#0F172A]">{formatUsers(Number(label))} active users</p>
      <div className="mt-2 space-y-1">
        {payload
          .slice()
          .reverse()
          .map((p) => (
            <div key={String(p.dataKey)} className="flex items-center justify-between gap-6 text-xs">
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                {STRATEGY_LABEL[String(p.dataKey)] ?? p.dataKey}
              </span>
              <span className="font-medium tabular-nums text-[#0F172A]">{formatMoney(p.value ?? 0)}/mo</span>
            </div>
          ))}
        <div className="mt-1 flex items-center justify-between gap-6 border-t border-[#F1F5F9] pt-1 text-xs">
          <span className="font-semibold text-[#0F172A]">Total MRR</span>
          <span className="font-semibold tabular-nums text-blue-600">{formatMoney(total)}/mo</span>
        </div>
      </div>
    </div>
  );
}

function ScaleChart() {
  return (
    <div className="h-[360px] w-full sm:h-[440px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={COMBINED_DATA} margin={{ top: 8, right: 16, bottom: 28, left: 14 }}>
          <defs>
            {SCALING.map((s) => (
              <linearGradient key={s.id} id={`area-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={REV_COLORS[s.id]} stopOpacity={0.92} />
                <stop offset="100%" stopColor={REV_COLORS[s.id]} stopOpacity={0.55} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="users"
            type="number"
            domain={[0, 100_000]}
            ticks={USER_POINTS}
            tickFormatter={formatUsers}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={{ stroke: "#E2E8F0" }}
            label={{ value: "Active users", position: "insideBottom", offset: -14, fontSize: 12, fill: "#64748B" }}
          />
          <YAxis
            tickFormatter={formatMoney}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
            tickLine={false}
            axisLine={false}
            width={62}
            label={{ value: "Revenue / month", angle: -90, position: "insideLeft", fontSize: 12, fill: "#64748B", style: { textAnchor: "middle" } }}
          />
          <Tooltip content={<CombinedTooltip />} />
          <Legend
            verticalAlign="top"
            align="left"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
            formatter={(value) => STRATEGY_LABEL[String(value)] ?? value}
          />
          {SCALING.map((s) => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              stackId="rev"
              stroke={REV_COLORS[s.id]}
              strokeWidth={1.5}
              fill={`url(#area-${s.id})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StrategyCard({ s }: { s: Strategy }) {
  const Icon = s.icon;
  return (
    <div
      className="flex h-full flex-col rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md lg:p-7"
      data-testid={`monetize-card-${s.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${MATURITY_STYLES[s.maturity]}`}>
          {s.maturity}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#0F172A]">{s.name}</h3>
      <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-blue-600/80">{s.model}</p>
      <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{s.summary}</p>

      <ul className="mt-5 space-y-2.5 border-t border-[#F1F5F9] pt-5 text-sm">
        {s.points.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[#334155]">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <MiniRevChart s={s} />

      {s.cta && (
        <div className="mt-6 pt-1">
          {s.cta.external ? (
            <a
              href={s.cta.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              data-testid={`monetize-cta-${s.id}`}
            >
              {s.cta.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href={s.cta.href}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
              data-testid={`monetize-cta-${s.id}`}
            >
              {s.cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function Monetize() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1120]/90 text-white backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <LogoIcon className="h-8 w-8" />
            <span>Citizen Science™</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/#vision" className="transition-colors hover:text-white">Vision</Link>
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/monetize" className="text-white transition-colors">Revenue</Link>
            <Link href="/cap-table" className="transition-colors hover:text-white">Cap table</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-white/70 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/login" className="btn-metal-blue inline-flex items-center rounded-full px-6 py-2 text-sm font-medium transition-colors">
              Join
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#0B1120] text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/30 blur-[150px]" />
            <div className="absolute top-10 right-1/4 h-[420px] w-[420px] translate-x-1/2 rounded-full bg-violet-600/25 blur-[150px]" />
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={GRID_BG} />
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 lg:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <Sparkles className="h-3 w-3 text-blue-300" />
                Revenue model
              </span>
              <h1 className="mt-5 font-serif text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                How we sustain{" "}
                <span className="italic text-blue-300">the mission</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                Widening access to real science only works if it pays for itself. Here is
                every way Citizen Science earns — a diversified model that keeps the
                Explorer tier free forever.
              </p>
            </motion.div>
          </div>
        </section>

        {/* REVENUE MIX STRIP */}
        <section className="relative">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <div className="-mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MIX.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-md"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600/80">{m.label}</p>
                  <p className="mt-1.5 text-lg font-semibold tracking-tight text-[#0F172A]">{m.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STRATEGIES GRID */}
        <section className="container mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
              Every <span className="italic text-blue-600">revenue stream</span>
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[#64748B]">
              Seven complementary streams — recurring, usage-based, performance, and
              mission capital — so no single one carries the whole company.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STRATEGIES.map((s) => (
              <StrategyCard key={s.id} s={s} />
            ))}
          </div>
        </section>

        {/* REVENUE AT SCALE */}
        <section id="revenue" className="scroll-mt-16 bg-white border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
            <div className="mb-8 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600">
                <BarChart3 className="h-4 w-4" />
                Projected revenue
              </span>
              <h2 className="mt-3 font-serif text-3xl lg:text-4xl tracking-tight">
                Revenue <span className="italic text-blue-600">as we grow</span>
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#64748B]">
                Monthly revenue (Y) plotted against active users (X). Each stream that scales
                with the audience is stacked, so together they compound into total MRR. These
                are an illustrative model, not a forecast — assumptions are listed below.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium text-[#94A3B8]">Blended ARPU</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#0F172A]">${BLENDED_ARPU.toFixed(2)}</p>
                <p className="text-[11px] text-[#94A3B8]">/ active user / mo</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium text-[#94A3B8]">MRR @ 100k users</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#0F172A]">{formatMoney(MRR_AT_100K)}</p>
                <p className="text-[11px] text-[#94A3B8]">monthly recurring</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium text-[#94A3B8]">ARR @ 100k users</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#0F172A]">{formatMoney(MRR_AT_100K * 12)}</p>
                <p className="text-[11px] text-[#94A3B8]">annual run-rate</p>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                <p className="text-xs font-medium text-[#94A3B8]">Streams that scale</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-[#0F172A]">{SCALING.length}</p>
                <p className="text-[11px] text-[#94A3B8]">of {STRATEGIES.length} total</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6">
              <ScaleChart />
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Per-user assumptions</p>
                <ul className="mt-3 space-y-1.5 text-sm text-[#334155]">
                  {SCALING.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-4">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: REV_COLORS[s.id] }} />
                        {s.name}
                      </span>
                      <span className="tabular-nums text-[#64748B]">
                        {s.rev.kind === "monthly" ? `~$${s.rev.perUser.toFixed(2)} / user / mo` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Not shown on the curve</p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#64748B]">
                  <li>
                    <span className="font-medium text-[#334155]">Founding members</span> — one-time
                    $2,500, capped at the first 100 ($250K total), so it doesn't scale with users.
                  </li>
                  <li>
                    <span className="font-medium text-[#334155]">Grants &amp; mission capital</span> —
                    lumpy, non-dilutive funding modeled as a flat baseline, independent of user count.
                  </li>
                  <li>
                    Each per-user figure already blends paid-conversion rate, commission rate, and
                    basket size. Illustrative only.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="bg-white border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8 py-16 lg:py-20">
            <div className="mb-10 text-center">
              <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
                How we monetize <span className="italic text-blue-600">without compromise</span>
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {PRINCIPLES.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#0F172A]">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{p.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#0B1120] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
          <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[150px]" />
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 text-center">
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">
              Want to back the mission?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
              Start on a plan, become a founding member, or partner with us. Every path
              helps put real science in more hands.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="btn-metal-blue inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
                data-testid="monetize-cta-pricing"
              >
                Explore the plans
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
                data-testid="monetize-cta-contact"
              >
                Partner with us
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B1120] text-[#94A3B8] border-t border-white/10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo variant="full" theme="dark" />
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/monetize" className="transition-colors hover:text-white">Revenue</Link>
            <Link href="/cap-table" className="transition-colors hover:text-white">Cap table</Link>
            <Link href="/incorporation" className="transition-colors hover:text-white">Incorporation</Link>
            <Link href="/brand" className="transition-colors hover:text-white">Brand</Link>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science™.
          </div>
        </div>
      </footer>
    </div>
  );
}
