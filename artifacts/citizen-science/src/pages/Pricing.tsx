import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Compass, FlaskConical, GraduationCap, Building2, Mail, Crown, Star, Megaphone, Infinity as InfinityIcon, MessageCircle, Rocket } from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";

type BillingPeriod = "monthly" | "annual";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

type Tier = {
  id: string;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  monthly: number | null;
  annual: number | null;
  customLabel?: string;
  cta: { label: string; href: string; external?: boolean };
  featured?: boolean;
  features: string[];
};

const CONTACT_EMAIL = "56289968+danielinnov8@users.noreply.github.com";

const TIERS: Tier[] = [
  {
    id: "explorer",
    name: "Explorer",
    tagline: "For the curious. Start exploring real science, free forever.",
    icon: Compass,
    monthly: 0,
    annual: 0,
    cta: { label: "Get started free", href: "/login" },
    features: [
      "All 14 science categories",
      "Scientists & inventors directory",
      "Starter experiment library",
      "Personal field notebook",
      "AI copilot — ~10 questions / day",
      "No credit card required",
    ],
  },
  {
    id: "researcher",
    name: "Researcher",
    tagline: "For dedicated learners who want the full toolkit.",
    icon: FlaskConical,
    monthly: 9,
    annual: 84,
    cta: { label: "Start researching", href: "/login" },
    featured: true,
    features: [
      "Everything in Explorer",
      "Unlimited AI copilot",
      "Web-grounded answers + verified video",
      "Full experiment & lab library",
      "Curated video library by topic",
      "Advanced notebook analysis",
      "Full progress tracking",
    ],
  },
  {
    id: "educator",
    name: "Educator",
    tagline: "For teachers running Citizen Science with a classroom.",
    icon: GraduationCap,
    monthly: 29,
    annual: 290,
    cta: { label: "Set up your class", href: "/login" },
    features: [
      "Everything in Researcher",
      "Student cohorts & rosters",
      "Classroom dashboard",
      "Assignments & shared experiments",
      "Bulk student seats",
      "Progress reporting",
    ],
  },
  {
    id: "institution",
    name: "Institution",
    tagline: "For universities, labs, and research partners.",
    icon: Building2,
    monthly: null,
    annual: null,
    customLabel: "Custom",
    cta: { label: "Contact us", href: `mailto:${CONTACT_EMAIL}`, external: true },
    features: [
      "Everything in Educator",
      "API access & data partnerships",
      "White-labeling options",
      "Custom integrations",
      "Dedicated onboarding & support",
      "Volume & site licensing",
    ],
  },
];

function formatPrice(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function PriceBlock({ tier, period }: { tier: Tier; period: BillingPeriod }) {
  if (tier.customLabel) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-4xl tracking-tight text-[#0F172A]">{tier.customLabel}</span>
      </div>
    );
  }

  const monthly = tier.monthly ?? 0;
  const annual = tier.annual ?? 0;

  if (monthly === 0) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-4xl tracking-tight text-[#0F172A]">Free</span>
      </div>
    );
  }

  const display = period === "monthly" ? monthly : Math.round((annual / 12) * 100) / 100;

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-5xl tracking-tight text-[#0F172A]">{formatPrice(display)}</span>
        <span className="text-sm font-medium text-[#64748B]">/ mo</span>
      </div>
      <p className="mt-1 text-xs text-[#94A3B8]">
        {period === "annual" ? `${formatPrice(annual)} billed yearly` : "billed monthly"}
      </p>
    </div>
  );
}

function TierCard({ tier, period }: { tier: Tier; period: BillingPeriod }) {
  const Icon = tier.icon;
  const featured = tier.featured;

  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 lg:p-7 transition-all ${
        featured
          ? "border-blue-300 shadow-xl shadow-blue-900/10 ring-1 ring-blue-200 lg:-translate-y-3"
          : "border-[#E2E8F0] shadow-sm hover:border-blue-200 hover:shadow-md"
      }`}
      data-testid={`pricing-card-${tier.id}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-md">
            <Sparkles className="h-3 w-3" />
            Most popular
          </span>
        </div>
      )}

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          featured ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#0F172A]">{tier.name}</h3>
      <p className="mt-1.5 min-h-[40px] text-sm leading-relaxed text-[#64748B]">{tier.tagline}</p>

      <div className="mt-5 min-h-[88px]">
        <PriceBlock tier={tier} period={period} />
      </div>

      {tier.cta.external ? (
        <a
          href={tier.cta.href}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors ${
            featured ? "btn-metal-blue" : "btn-metal-ink"
          }`}
          data-testid={`pricing-cta-${tier.id}`}
        >
          {tier.cta.label}
          <ArrowRight className="h-4 w-4" />
        </a>
      ) : (
        <Link
          href={tier.cta.href}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors ${
            featured ? "btn-metal-blue" : "btn-metal-ink"
          }`}
          data-testid={`pricing-cta-${tier.id}`}
        >
          {tier.cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <ul className="mt-6 space-y-3 border-t border-[#F1F5F9] pt-6 text-sm">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[#334155]">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                featured ? "bg-blue-100 text-blue-700" : "bg-green-50 text-green-600"
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FOUNDING_PERKS: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }[] = [
  {
    icon: InfinityIcon,
    title: "Lifetime Researcher access",
    description: "Every paid Researcher feature, unlocked forever. You never pay a subscription again.",
  },
  {
    icon: Star,
    title: "Featured on our homepage",
    description: "Your name and photo in the founding members showcase, seen by every visitor.",
  },
  {
    icon: Megaphone,
    title: "A shout-out in every newsletter",
    description: "We thank our founders by name in all newsletters going out to the community.",
  },
  {
    icon: Crown,
    title: "Founding Member badge",
    description: "A permanent badge across the platform marking you as one of the originals.",
  },
  {
    icon: MessageCircle,
    title: "A direct line to the founders",
    description: "Private channel to the team — share ideas and help shape the roadmap.",
  },
  {
    icon: Rocket,
    title: "Early access to everything",
    description: "Be first to try new labs and features, and help name what we build next.",
  },
];

const FOUNDING_SPOTS = 100;

function FoundingMember() {
  return (
    <section id="founding" className="relative overflow-hidden bg-[#0B1120] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[360px] w-[360px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />

      <div className="relative container mx-auto max-w-6xl px-4 lg:px-8 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          {/* Left: pitch + price */}
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{ borderColor: "rgba(212,175,55,0.4)", color: "#E4C75B", backgroundColor: "rgba(212,175,55,0.08)" }}
            >
              <Crown className="h-3.5 w-3.5" />
              Founding Member · limited to {FOUNDING_SPOTS}
            </span>
            <h2 className="mt-5 font-serif text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Help us build{" "}
              <span className="italic" style={{ color: "#E4C75B" }}>humanity&apos;s research network</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              For the believers who want to do more than subscribe. Founding members fund
              the mission, get everything for life, and are celebrated as the people who
              made it possible.
            </p>

            <div className="mt-8 flex items-end gap-3">
              <span className="font-serif text-6xl tracking-tight" style={{ color: "#E4C75B" }}>$2,500</span>
              <span className="pb-2 text-sm font-medium text-white/60">one-time · lifetime</span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:56289968+danielinnov8@users.noreply.github.com?subject=Founding%20Member%20—%20Citizen%20Science"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[#0B1120] transition-transform hover:scale-[1.02]"
                style={{ backgroundImage: "linear-gradient(to bottom right, #F4D77B, #E4C75B 45%, #C9A93B)", border: "1px solid #E4C75B" }}
                data-testid="founding-cta"
              >
                <Crown className="h-4 w-4" />
                Become a founding member
              </a>
              <span className="inline-flex items-center justify-center gap-2 text-sm text-white/50">
                Only {FOUNDING_SPOTS} spots — first come, first served
              </span>
            </div>
          </div>

          {/* Right: perks */}
          <div className="grid gap-3 sm:grid-cols-2">
            {FOUNDING_PERKS.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition-colors hover:border-white/20"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#E4C75B" }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-white">{perk.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{perk.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I really use Citizen Science for free?",
    a: "Yes. The Explorer plan is free forever, no card required. It's our mission-accessibility tier — browse every science category, the inventor directory, starter experiments, and keep a personal field notebook.",
  },
  {
    q: "What's the difference between monthly and annual billing?",
    a: "Annual billing gives you roughly two months free compared to paying month to month. You can switch billing periods at any time.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Absolutely. Upgrade, downgrade, or cancel whenever you like — your notebook and progress stay with your account.",
  },
  {
    q: "Do you offer pricing for schools and institutions?",
    a: "Yes. The Educator plan is built for classrooms with student cohorts and bulk seats, and Institution offers custom terms for universities, labs, and partners. Reach out and we'll tailor a plan.",
  },
  {
    q: "What is a Founding Member?",
    a: `A one-time $2,500 lifetime membership for early believers in the mission. Founders get every Researcher feature for life, a permanent Founding Member badge, a featured spot on our homepage, a shout-out in every newsletter, a direct line to the team, and early access to new features. It's limited to the first ${FOUNDING_SPOTS} members.`,
  },
];

export default function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

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
            <Link href="/#discover" className="transition-colors hover:text-white">Discover</Link>
            <Link href="/#impact" className="transition-colors hover:text-white">Impact</Link>
            <Link href="/pricing" className="text-white transition-colors">Pricing</Link>
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
                Pricing
              </span>
              <h1 className="mt-5 font-serif text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                Science for everyone,{" "}
                <span className="italic text-blue-300">at every level</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                Start free and explore real science forever. Upgrade when you're ready
                for the full copilot, labs, and classroom tools. No hidden fees.
              </p>
            </motion.div>
          </div>
        </section>

        {/* PRICING */}
        <section className="relative">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            {/* Billing toggle */}
            <div className="-mt-8 flex justify-center">
              <div
                role="radiogroup"
                aria-label="Billing period"
                className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white p-1 shadow-md"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={period === "monthly"}
                  onClick={() => setPeriod("monthly")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    period === "monthly" ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                  data-testid="billing-toggle-monthly"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={period === "annual"}
                  onClick={() => setPeriod("annual")}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    period === "annual" ? "bg-[#0F172A] text-white" : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                  data-testid="billing-toggle-annual"
                >
                  Annual
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      period === "annual" ? "bg-green-400/20 text-green-300" : "bg-green-50 text-green-700"
                    }`}
                  >
                    Save ~17%
                  </span>
                </button>
              </div>
            </div>

            {/* Tier grid */}
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:items-start">
              {TIERS.map((tier) => (
                <TierCard key={tier.id} tier={tier} period={period} />
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-[#94A3B8]">
              All paid plans include a free Explorer account to start. Prices in USD.
            </p>
          </div>
        </section>

        {/* FOUNDING MEMBER */}
        <div className="mt-20 lg:mt-24">
          <FoundingMember />
        </div>

        {/* FAQ */}
        <section className="container mx-auto max-w-3xl px-4 lg:px-8 py-20 lg:py-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
              Frequently asked <span className="italic text-blue-600">questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
                <h3 className="text-base font-semibold text-[#0F172A]">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#0B1120] text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
          <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[150px]" />
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 text-center">
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">
              Ready to start exploring?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
              Join free today. No card, no commitment — just your curiosity and a
              notebook ready to fill.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="btn-metal-blue inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
                data-testid="pricing-cta-bottom-join"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
                data-testid="pricing-cta-bottom-contact"
              >
                <Mail className="h-4 w-4" />
                Talk to us
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
            <Link href="/categories" className="transition-colors hover:text-white">Categories</Link>
            <Link href="/brand" className="transition-colors hover:text-white">Brand</Link>
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science™.
          </div>
        </div>
      </footer>
    </div>
  );
}
