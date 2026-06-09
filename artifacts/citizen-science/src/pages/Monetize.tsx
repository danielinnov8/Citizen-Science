import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
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

type Strategy = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  model: string;
  maturity: Maturity;
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
