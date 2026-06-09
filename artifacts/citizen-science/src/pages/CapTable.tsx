import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  PieChart,
  Hammer,
  Wallet,
  Users,
  TrendingUp,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Scale,
  Vote,
  Coins,
} from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

const BUILD_DATE = "June 8, 2026";

const AUTHORIZED_SHARES = 10_000_000;

type Holder = {
  name: string;
  role: string;
  klass: string;
  shares: number;
  pct: number;
  // Tailwind classes for the stacked ownership bar and the legend/table dot.
  bar: string;
  dot: string;
  note: string;
};

// CLASS A — Voting shares (control). Founders hold 70% of the vote today
// (35% each); the remaining 30% of voting power is authorized but unissued.
const VOTING_TABLE: Holder[] = [
  {
    name: "Daniel Innovate",
    role: "Founder & CEO — concept, brand & platform",
    klass: "Class A — Voting",
    shares: 3_500_000,
    pct: 35,
    bar: "bg-blue-600",
    dot: "bg-blue-600",
    note: "As the full-time operator who originated the concept, created the brand, and is building the platform, Daniel holds an equal share of voting control with Manu — together the founders direct the company and protect its mission.",
  },
  {
    name: "Manu Rehani",
    role: "Co-Founder, Investor & Strategic Advisor",
    klass: "Class A — Voting",
    shares: 3_500_000,
    pct: 35,
    bar: "bg-violet-600",
    dot: "bg-violet-600",
    note: "Manu holds an equal voting stake to Daniel. Even though his economic ownership is smaller, voting parity gives both founders a genuine partnership over the company's direction and key decisions.",
  },
  {
    name: "Reserved Voting Power",
    role: "Authorized, unissued — held by the company",
    klass: "Class A — Unissued",
    shares: 3_000_000,
    pct: 30,
    bar: "bg-slate-300",
    dot: "bg-slate-300",
    note: "30% of the voting power is authorized but not yet issued, so the two founders together control 70% of all votes cast today. This headroom lets the company extend voting rights deliberately in future — without diluting founder control by accident.",
  },
];

// CLASS B — Commercial / economic shares (ownership). The 25% reserved pools
// stay intact; the remaining 75% is split 60/40 between the founders.
const ECONOMIC_TABLE: Holder[] = [
  {
    name: "Daniel Innovate",
    role: "Founder & CEO — concept, brand & platform",
    klass: "Class B — Economic",
    shares: 4_500_000,
    pct: 45,
    bar: "bg-blue-600",
    dot: "bg-blue-600",
    note: "Of the 75% economic ownership held by the founders, Daniel takes 60% (45% of the whole). As the builder carrying product and execution risk full-time, he holds the larger economic stake.",
  },
  {
    name: "Manu Rehani",
    role: "Co-Founder, Investor & Strategic Advisor",
    klass: "Class B — Economic",
    shares: 3_000_000,
    pct: 30,
    bar: "bg-violet-600",
    dot: "bg-violet-600",
    note: "Manu takes 40% of the founders' economic ownership (30% of the whole) — capital, credibility (12 patents, two exits), and network rather than daily operations. A meaningful, well-aligned stake proportional to that contribution.",
  },
  {
    name: "Founding Members Pool",
    role: "Reserved — early team & founding contributors",
    klass: "Option pool (ESOP)",
    shares: 1_250_000,
    pct: 12.5,
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    note: "Set aside to bring on the founding team — early engineers, scientists, and operators — with equity grants that vest as they join and contribute. Economic only; unissued until granted.",
  },
  {
    name: "Future Investor Reserve",
    role: "Reserved — seed / angel round",
    klass: "Authorized, unissued",
    shares: 1_250_000,
    pct: 12.5,
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    note: "Held back for the first priced round of outside capital. Authorized but not yet issued — a seed raise would issue economic shares from here (and may expand the option pool), diluting Class B holders pro-rata.",
  },
];

const RATIONALE: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    icon: Vote,
    title: "Founders keep voting control",
    body: "Class A separates votes from economics. Daniel and Manu each hold 35% of the vote — 70% combined — so the people building the company keep control of its mission and direction, regardless of how the economics are split.",
  },
  {
    icon: Coins,
    title: "Economics reward the builder",
    body: "Class B splits the founders' 75% economic ownership 60/40 — Daniel 45%, Manu 30%. The person carrying full-time product and execution risk earns the larger economic share, while voting power stays equal.",
  },
  {
    icon: Users,
    title: "Equity for the founding team",
    body: "A 12.5% economic pool is reserved so the earliest employees and founding contributors share in the upside. Grants are issued from this pool as people join — it doesn't dilute the founders until it's actually used.",
  },
  {
    icon: TrendingUp,
    title: "Room for the first raise",
    body: "12.5% of the economics is held in reserve for the first angel/seed investors, so there's headroom to raise without an emergency re-slice. New money issues Class B shares from here and dilutes economic holders proportionally.",
  },
];

const TERMS: { icon: React.ComponentType<{ className?: string }>; title: string; body: React.ReactNode }[] = [
  {
    icon: Clock,
    title: "Vesting protects everyone",
    body: (
      <>
        Founder and team shares — both Class A and Class B — should vest over{" "}
        <strong>4 years with a 1-year cliff</strong>. If a founder or early hire leaves early, their unvested shares
        return to the company, so equity tracks ongoing contribution, not just the day you started.
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Mission stays protected",
    body: (
      <>
        The dual-class structure is built so <strong>voting control and the public-benefit mission</strong> stay with
        the founders through future rounds. Outside capital comes in as economic (Class B) shares — it shares in the
        upside without being able to vote the mission away.
      </>
    ),
  },
  {
    icon: Scale,
    title: "Fully-diluted, at formation",
    body: (
      <>
        Both classes are shown <strong>fully-diluted</strong> — they already count the reserved pools as if issued.
        That's the honest view of voting power and economic ownership, and the basis any future investor will price
        against.
      </>
    ),
  },
];

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">{eyebrow}</p>
      <h2 className="font-serif text-3xl lg:text-4xl tracking-tight leading-tight text-[#0F172A]">{title}</h2>
    </div>
  );
}

function fmtShares(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtPct(n: number): string {
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

function ClassOverviewCard({
  icon: Icon,
  label,
  title,
  blurb,
  rows,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  blurb: string;
  rows: Holder[];
}) {
  return (
    <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{label}</p>
          <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-[#64748B]">{blurb}</p>

      <div className="mt-6 flex h-5 w-full overflow-hidden rounded-full">
        {rows.map((h) => (
          <div
            key={h.name}
            className={`${h.bar} h-full`}
            style={{ width: `${h.pct}%` }}
            title={`${h.name} — ${fmtPct(h.pct)}`}
          />
        ))}
      </div>
      <div className="mt-6 grid gap-x-6 gap-y-3">
        {rows.map((h) => (
          <div key={h.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-[#334155]">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${h.dot}`} />
              {h.name}
            </span>
            <span className="shrink-0 text-sm font-semibold text-[#0F172A]">{fmtPct(h.pct)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassTable({
  label,
  title,
  ownershipHeader,
  rows,
}: {
  label: string;
  title: string;
  ownershipHeader: string;
  rows: Holder[];
}) {
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{label}</p>
        <h3 className="mt-1 text-xl font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]">
              <th className="px-4 py-3 font-semibold">Holder</th>
              <th className="px-4 py-3 font-semibold">Share class</th>
              <th className="px-4 py-3 text-right font-semibold">Shares</th>
              <th className="px-4 py-3 text-right font-semibold">{ownershipHeader}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.name} className="border-b border-[#F1F5F9] last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2 font-medium text-[#0F172A]">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${h.dot}`} />
                    {h.name}
                  </span>
                  <span className="mt-0.5 block pl-[18px] text-xs text-[#94A3B8]">{h.role}</span>
                </td>
                <td className="px-4 py-3 text-[#475569]">{h.klass}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[#475569]">{fmtShares(h.shares)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-[#0F172A]">{fmtPct(h.pct)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E2E8F0] bg-[#F8FAFC] font-semibold text-[#0F172A]">
              <td className="px-4 py-3" colSpan={2}>
                Total authorized
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{fmtShares(AUTHORIZED_SHARES)}</td>
              <td className="px-4 py-3 text-right tabular-nums">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default function CapTable() {
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
          <Link
            href="/incorporation"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Incorporation
          </Link>
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
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <PieChart className="h-3 w-3 text-blue-300" />
                Public cap table · proposed dual-class structure
              </span>
              <h1 className="mt-5 font-serif text-4xl lg:text-6xl tracking-tight leading-[1.05]">
                Two classes:{" "}
                <span className="italic text-blue-300">votes</span> and{" "}
                <span className="italic text-violet-300">economics</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                A proposed founding equity split for <strong className="text-white/90">Daniel Innovate</strong> and{" "}
                <strong className="text-white/90">Manu Rehani</strong> that separates{" "}
                <strong className="text-white/90">voting control</strong> from{" "}
                <strong className="text-white/90">economic ownership</strong>. Class A keeps the founders in control of
                the mission; Class B rewards the builder and reserves equity for the team and first investors. Published
                openly, the way a public research network should operate.
              </p>

              {/* Quick split summary */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    <Vote className="h-3.5 w-3.5" /> Class A · Voting
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Daniel 35% · Manu 35% — <strong className="text-white/90">70% founder control</strong>, 30% voting
                    power reserved.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
                    <Coins className="h-3.5 w-3.5" /> Class B · Economics
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Daniel 45% · Manu 30% — a <strong className="text-white/90">60/40 founder split</strong>, with 25%
                    reserved for team & investors.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-4 text-sm leading-relaxed text-amber-100/90">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p>
                  <strong className="text-amber-200">A starting-point proposal, not a binding agreement.</strong>{" "}
                  This is not a securities offering or legal/tax advice. Final ownership, vesting, and terms must be
                  set in formal documents (stock purchase agreements and board consents) with a licensed attorney.
                  Figures as of <strong>{BUILD_DATE}</strong>.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 lg:px-8 py-16 lg:py-20 space-y-20">
          {/* OWNERSHIP OVERVIEW */}
          <section>
            <SectionHeading
              eyebrow="At a glance"
              title={
                <>
                  Voting vs. economic <span className="italic text-blue-600">overview</span>
                </>
              }
            />
            <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              Two separate dimensions. Class A decides <strong>who controls votes</strong>; Class B decides{" "}
              <strong>who owns the economics</strong>. They are deliberately not the same — that's what lets the
              founders share control equally while the builder earns the larger economic stake.
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <ClassOverviewCard
                icon={Vote}
                label="Class A · Control"
                title="Voting power"
                blurb="Who gets a say in the company's direction. Founders hold 70% of the vote today; 30% is reserved."
                rows={VOTING_TABLE}
              />
              <ClassOverviewCard
                icon={Coins}
                label="Class B · Ownership"
                title="Economic ownership"
                blurb="Who owns the upside. The founders' 75% splits 60/40, with 25% reserved for team and investors."
                rows={ECONOMIC_TABLE}
              />
            </div>
          </section>

          {/* THE CAP TABLES */}
          <section>
            <SectionHeading
              eyebrow="The tables"
              title={
                <>
                  Fully-diluted <span className="italic text-blue-600">cap table</span>
                </>
              }
            />
            <div className="space-y-10">
              <ClassTable
                label="Class A — Voting shares"
                title="Voting power (control)"
                ownershipHeader="Voting power"
                rows={VOTING_TABLE}
              />
              <ClassTable
                label="Class B — Commercial shares"
                title="Economic ownership"
                ownershipHeader="Economic ownership"
                rows={ECONOMIC_TABLE}
              />
            </div>
            <p className="mt-4 text-xs text-[#94A3B8]">
              Each class is based on {fmtShares(AUTHORIZED_SHARES)} authorized shares. Share counts are illustrative —
              only the relative percentages, and the split of votes from economics, matter at this stage.
            </p>
          </section>

          {/* RATIONALE */}
          <section>
            <SectionHeading
              eyebrow="Why two classes"
              title={
                <>
                  The thinking behind the <span className="italic text-blue-600">structure</span>
                </>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {RATIONALE.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-colors hover:border-blue-200"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-[#0F172A]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{card.body}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HOLDER NOTES */}
          <section>
            <SectionHeading
              eyebrow="Line by line"
              title={
                <>
                  Each <span className="italic text-blue-600">position</span> explained
                </>
              }
            />

            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              <Vote className="h-4 w-4" /> Class A — Voting
            </h3>
            <div className="space-y-4">
              {VOTING_TABLE.map((h) => (
                <div key={h.name} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${h.dot}`} />
                      {h.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#475569]">
                      {fmtPct(h.pct)} · {h.klass}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{h.note}</p>
                </div>
              ))}
            </div>

            <h3 className="mb-4 mt-10 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-violet-600">
              <Coins className="h-4 w-4" /> Class B — Economic
            </h3>
            <div className="space-y-4">
              {ECONOMIC_TABLE.map((h) => (
                <div key={h.name} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${h.dot}`} />
                      {h.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#475569]">
                      {fmtPct(h.pct)} · {h.klass}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{h.note}</p>
                </div>
              ))}
            </div>
          </section>

          {/* TERMS */}
          <section>
            <SectionHeading
              eyebrow="How it holds up"
              title={
                <>
                  Vesting, control &amp; <span className="italic text-blue-600">dilution</span>
                </>
              }
            />
            <div className="space-y-4">
              {TERMS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                      <Icon className="h-4 w-4 text-blue-600" />
                      {row.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{row.body}</p>
                  </div>
                );
              })}
            </div>

            {/* Closing note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-5 text-sm leading-relaxed text-[#475569]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p>
                Reminder: this is an illustrative proposal to align the founders, not a binding cap table, securities
                offering, or legal/tax advice. Both share classes, vesting, and round terms must be finalized in formal
                documents with a licensed attorney before any shares are issued.
              </p>
            </div>
          </section>

          {/* Bottom nav */}
          <div className="flex flex-col gap-4 border-t border-[#E2E8F0] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/incorporation"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to incorporation
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              View pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F172A] text-[#64748B] py-12">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo variant="full" theme="dark" />
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/incorporation" className="hover:text-white transition-colors">Incorporation</Link>
            <Link href="/risk" className="hover:text-white transition-colors">Risk</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="text-sm text-right">
            &copy; {new Date().getFullYear()} Citizen Science.
          </div>
        </div>
      </footer>
    </div>
  );
}
