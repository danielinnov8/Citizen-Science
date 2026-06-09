import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  ShieldAlert,
  Users,
  Activity,
  Server,
  Cpu,
  Lock,
  Eye,
  Gavel,
  Swords,
  Cloud,
  PieChart,
  TrendingDown,
  FileText,
  Scale,
  Clock,
  Coins,
  Wallet,
  Vote,
  ShieldCheck,
} from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

const BUILD_DATE = "June 9, 2026";

type RiskCard = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

// 1) OPERATIONAL RISKS
const OPERATIONAL: RiskCard[] = [
  {
    icon: Users,
    title: "Founder & key-person dependency",
    body: "The company depends heavily on its two founders for vision, product, and execution. The loss of either — or a breakdown in the partnership — would materially set the venture back. Vesting and clear roles mitigate this, but do not remove it.",
  },
  {
    icon: Activity,
    title: "Execution & delivery risk",
    body: "This is an early-stage prototype. Shipping a reliable, scalable product on time is hard, and roadmaps slip. Features may take longer, cost more, or land differently than planned.",
  },
  {
    icon: Server,
    title: "Reliance on third-party AI services",
    body: "Core features sit on top of outside providers — Gemini for the copilot and field-notes, ElevenLabs for voice, D-ID for talking avatars, and the YouTube Data API for video. Price changes, outages, deprecations, or policy shifts at any of them directly affect what we can offer.",
  },
  {
    icon: Cpu,
    title: "API cost & quota exposure",
    body: "AI usage is metered and billed per request. Heavy usage, abuse, or a viral spike can run up real costs, and free-tier quotas can throttle features. The credit system and rate limits manage this, but margins remain sensitive to provider pricing.",
  },
  {
    icon: Lock,
    title: "Data, privacy & security",
    body: "We store user accounts, notebooks, and observations. A breach, leak, or mishandling of personal data carries legal, financial, and reputational consequences. Security is an ongoing obligation, never finished.",
  },
  {
    icon: Eye,
    title: "Content accuracy & trust",
    body: "AI can be wrong or confidently misleading. Inaccurate science guidance erodes trust and could cause harm if users act on it. Grounding, trusted-source curation, and disclaimers reduce — but cannot eliminate — this risk.",
  },
  {
    icon: Gavel,
    title: "Regulatory & compliance",
    body: "Education, minors, AI output, and data protection are all increasingly regulated. New rules around AI transparency, COPPA-style child safety, or consumer protection could force product changes or limit certain features.",
  },
  {
    icon: Swords,
    title: "Competition",
    body: "Large, well-funded platforms in edtech and general AI could build similar features quickly. Differentiation rests on community, curation, and mission — advantages that must be earned and defended continuously.",
  },
  {
    icon: Cloud,
    title: "Platform & hosting concentration",
    body: "The app runs on a small number of hosting and infrastructure providers. Outages, account actions, or pricing changes at a key vendor could disrupt availability or raise operating costs with little notice.",
  },
];

// 2) DILUTION — explanatory cards
const DILUTION_NOTES: RiskCard[] = [
  {
    icon: PieChart,
    title: "Issuing the Future Investor Reserve",
    body: "12.5% of the economics is held back, unissued, for the first priced round. When a seed raise closes, shares are issued from this reserve to new investors — converting reserved headroom into real ownership held by outsiders.",
  },
  {
    icon: Users,
    title: "Expanding the option (ESOP) pool",
    body: "Hiring usually requires topping up the employee option pool. Investors often insist the pool be expanded before they invest, so the top-up dilutes existing holders rather than the new money — a subtle but real cost to founders.",
  },
  {
    icon: TrendingDown,
    title: "Future priced rounds dilute everyone",
    body: "Each new priced round (seed, then Series A and beyond) issues fresh shares. Every existing holder's percentage shrinks pro-rata — founders, team, and prior investors alike — even as the company's total value ideally grows.",
  },
  {
    icon: FileText,
    title: "SAFEs & convertible notes",
    body: "Early money often comes in as SAFEs or convertible notes that don't set a price immediately. They convert into equity at the next priced round — typically at a discount or valuation cap — creating additional dilution that only becomes visible once they convert.",
  },
  {
    icon: Scale,
    title: "Anti-dilution & pro-rata rights",
    body: "Investors may negotiate pro-rata rights (to buy enough in later rounds to keep their percentage) and anti-dilution protection (re-pricing if a later round is lower, a 'down round'). Both shift more of the future dilution onto founders and the team.",
  },
];

type DilutionRow = {
  name: string;
  role: string;
  before: number | null;
  after: number;
  dot: string;
  bar: string;
};

// Illustrative seed-round dilution. "Before" mirrors the Class B (economic)
// holders and percentages defined on the Cap Table page, so the two pages stay
// in sync. The round sells 15% of the post-money company to new investors and
// tops up the option pool by 5% — a uniform 0.80 dilution factor on existing
// economic holders (45→36, 30→24, 12.5→10, 12.5→10), summing to 100%.
const DILUTION_TABLE: DilutionRow[] = [
  {
    name: "Daniel Innovate",
    role: "Founder & CEO",
    before: 45,
    after: 36,
    dot: "bg-blue-600",
    bar: "bg-blue-600",
  },
  {
    name: "Manu Rehani",
    role: "Co-Founder & Investor",
    before: 30,
    after: 24,
    dot: "bg-violet-600",
    bar: "bg-violet-600",
  },
  {
    name: "Founding Members Pool",
    role: "Early team (ESOP)",
    before: 12.5,
    after: 10,
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  {
    name: "Future Investor Reserve",
    role: "Pre-seed reserve",
    before: 12.5,
    after: 10,
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  {
    name: "New Seed Investors",
    role: "This round — new money",
    before: null,
    after: 15,
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  {
    name: "Expanded Option Pool",
    role: "Top-up for new hires",
    before: null,
    after: 5,
    dot: "bg-slate-400",
    bar: "bg-slate-400",
  },
];

// 3) FINANCIAL CONTROL
const FINANCIAL: RiskCard[] = [
  {
    icon: Clock,
    title: "Runway & burn",
    body: "The company spends before it earns. If revenue or fundraising lags behind spending, runway shortens and the company may have to raise on worse terms, cut scope, or stop. Disciplined burn and a clear runway buffer are essential.",
  },
  {
    icon: Coins,
    title: "Revenue concentration",
    body: "Income relies on a small number of streams — credit packs and subscriptions. Until the base is broad, a dip in conversion, churn, or a single large customer leaving has an outsized effect on the top line.",
  },
  {
    icon: Wallet,
    title: "Cash management & signatory controls",
    body: "Funds must be protected with basic controls: a dedicated business account, dual approval for large payments, defined signatories, and separation of duties — so no single person can move material money unchecked.",
  },
  {
    icon: Vote,
    title: "Board & voting control",
    body: "The dual-class structure keeps voting control with the founders, and protective provisions reserve major decisions (new stock, debt, sale) for explicit approval. This guards direction — but investors will negotiate their own protective rights as they come in.",
  },
  {
    icon: Scale,
    title: "Founder control vs. investor rights",
    body: "Each round trades some control for capital: board seats, information rights, consent thresholds, and veto rights. Balancing founder operating control against legitimate investor protections is an ongoing negotiation, not a one-time settlement.",
  },
  {
    icon: ShieldCheck,
    title: "Mission & benefit-corp protection",
    body: "Forming as a benefit corporation bakes the public-benefit mission into the charter, giving directors legal cover to weigh stakeholders alongside returns. It protects the mission through funding and turnover — but adds an annual benefit-report obligation.",
  },
  {
    icon: FileText,
    title: "Reporting & bookkeeping discipline",
    body: "Clean books, timely tax filings, and accurate cap-table and equity records are non-negotiable. Sloppy records create tax exposure, scare off investors during diligence, and can mask problems until they're expensive to fix.",
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

function fmtPct(n: number): string {
  return Number.isInteger(n) ? `${n}%` : `${n.toFixed(1)}%`;
}

function CardGrid({ cards }: { cards: RiskCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
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
  );
}

function StackedBar({ rows, mode }: { rows: DilutionRow[]; mode: "before" | "after" }) {
  const segments = rows
    .map((r) => ({ ...r, value: mode === "before" ? r.before ?? 0 : r.after }))
    .filter((r) => r.value > 0);
  return (
    <div className="flex h-5 w-full overflow-hidden rounded-full">
      {segments.map((s) => (
        <div
          key={s.name}
          className={`${s.bar} h-full`}
          style={{ width: `${s.value}%` }}
          title={`${s.name} — ${fmtPct(s.value)}`}
        />
      ))}
    </div>
  );
}

export default function Risk() {
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
            href="/cap-table"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Cap table
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
                <ShieldAlert className="h-3 w-3 text-blue-300" />
                Risk disclosure · for founders & prospective investors
              </span>
              <h1 className="mt-5 font-serif text-4xl lg:text-6xl tracking-tight leading-[1.05]">
                The <span className="italic text-blue-300">risks</span> we're taking on,{" "}
                <span className="italic text-violet-300">in the open</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                Every early venture carries real risk. In the same spirit as our public cap table and incorporation
                guide, we lay out — honestly — the main risks across three areas:{" "}
                <strong className="text-white/90">operations</strong>,{" "}
                <strong className="text-white/90">future dilution</strong> on the cap table, and{" "}
                <strong className="text-white/90">financial control</strong>. Knowing them is the first step to
                managing them.
              </p>

              {/* Quick summary */}
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                    <Activity className="h-3.5 w-3.5" /> Operational
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    People, execution, third-party AI, security, and competition.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300">
                    <PieChart className="h-3.5 w-3.5" /> Dilution
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    How ownership shrinks as the company raises future capital.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    <Wallet className="h-3.5 w-3.5" /> Financial
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    Runway, controls, board power, and reporting discipline.
                  </p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-4 text-sm leading-relaxed text-amber-100/90">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p>
                  <strong className="text-amber-200">Illustrative only — not legal, financial, or investment advice.</strong>{" "}
                  This page is an internal aid to think clearly about risk, not a securities offering, prospectus, or
                  forecast. The dilution example uses made-up round terms for explanation. Any real decision must be
                  made with licensed legal and financial advisors. Figures as of <strong>{BUILD_DATE}</strong>.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 lg:px-8 py-16 lg:py-20 space-y-20">
          {/* OPERATIONAL RISKS */}
          <section>
            <SectionHeading
              eyebrow="Area one"
              title={
                <>
                  Operational <span className="italic text-blue-600">risks</span>
                </>
              }
            />
            <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              The day-to-day risks of building and running the product — the people, the partners we depend on, and the
              realities of shipping software that people trust.
            </p>
            <CardGrid cards={OPERATIONAL} />
          </section>

          {/* DILUTION RISK */}
          <section>
            <SectionHeading
              eyebrow="Area two"
              title={
                <>
                  Dilution risk on the future <span className="italic text-blue-600">cap table</span>
                </>
              }
            />
            <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              Ownership is not fixed. As the company raises money and hires, new shares are issued and everyone's
              percentage shrinks — ideally against a much larger pie. Here's how dilution happens, and a concrete
              illustration of a first seed round.
            </p>
            <CardGrid cards={DILUTION_NOTES} />

            {/* Before / after illustration */}
            <div className="mt-10">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Illustrative example</p>
                <h3 className="mt-1 text-xl font-semibold text-[#0F172A]">
                  Before vs. after a seed round
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
                  In this made-up scenario, the company sells <strong>15%</strong> of the post-money company to new seed
                  investors and tops up the option pool by <strong>5%</strong> for future hires. That issues new shares
                  equal to 20% of the company, so every existing economic holder is diluted by the same factor (×0.80).
                  The "before" column matches the Class B economic ownership on the{" "}
                  <Link href="/cap-table" className="text-blue-600 hover:text-blue-700">
                    cap table
                  </Link>
                  .
                </p>
              </div>

              {/* Stacked bars */}
              <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Before — today</p>
                    <StackedBar rows={DILUTION_TABLE} mode="before" />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      After — post seed round
                    </p>
                    <StackedBar rows={DILUTION_TABLE} mode="after" />
                  </div>
                </div>

                {/* Legend / table */}
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[#0F172A]">
                        <th className="px-3 py-3 font-semibold">Holder</th>
                        <th className="px-3 py-3 text-right font-semibold">Before</th>
                        <th className="px-3 py-3 text-right font-semibold">After</th>
                        <th className="px-3 py-3 text-right font-semibold">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DILUTION_TABLE.map((r) => {
                        const change = r.before === null ? r.after : r.after - r.before;
                        const isNew = r.before === null;
                        return (
                          <tr key={r.name} className="border-b border-[#F1F5F9] last:border-0">
                            <td className="px-3 py-3">
                              <span className="flex items-center gap-2 font-medium text-[#0F172A]">
                                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.dot}`} />
                                {r.name}
                              </span>
                              <span className="mt-0.5 block pl-[18px] text-xs text-[#94A3B8]">{r.role}</span>
                            </td>
                            <td className="px-3 py-3 text-right tabular-nums text-[#475569]">
                              {r.before === null ? "—" : fmtPct(r.before)}
                            </td>
                            <td className="px-3 py-3 text-right font-semibold tabular-nums text-[#0F172A]">
                              {fmtPct(r.after)}
                            </td>
                            <td
                              className={`px-3 py-3 text-right font-semibold tabular-nums ${
                                isNew ? "text-rose-600" : "text-amber-600"
                              }`}
                            >
                              {isNew ? `+${fmtPct(change)} (new)` : `−${fmtPct(Math.abs(change))}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[#E2E8F0] font-semibold text-[#0F172A]">
                        <td className="px-3 py-3">Total</td>
                        <td className="px-3 py-3 text-right tabular-nums">100%</td>
                        <td className="px-3 py-3 text-right tabular-nums">100%</td>
                        <td className="px-3 py-3 text-right tabular-nums text-[#94A3B8]">—</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-[#94A3B8]">
                  Note: voting control (Class A) is unaffected in this illustration — new investors come in as economic
                  (Class B) shares, which is the whole point of the dual-class structure. Real rounds also involve
                  valuation, SAFEs/notes converting, and negotiated pool top-ups, so actual numbers will differ.
                </p>
              </div>
            </div>
          </section>

          {/* FINANCIAL CONTROL */}
          <section>
            <SectionHeading
              eyebrow="Area three"
              title={
                <>
                  Financial <span className="italic text-blue-600">control</span>
                </>
              }
            />
            <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              Staying solvent, in control, and credible. How the company manages cash, who controls major decisions,
              and the discipline needed to keep the books — and the mission — sound.
            </p>
            <CardGrid cards={FINANCIAL} />

            {/* Closing note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-5 text-sm leading-relaxed text-[#475569]">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p>
                Reminder: this is an illustrative risk overview to align the founders and inform prospective partners —
                not a binding document, forecast, securities offering, or legal/financial advice. The dilution scenario
                uses invented round terms purely to explain the mechanics. Validate everything with licensed advisors
                before acting.
              </p>
            </div>
          </section>

          {/* Bottom nav */}
          <div className="flex flex-col gap-4 border-t border-[#E2E8F0] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/cap-table"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to cap table
            </Link>
            <Link
              href="/incorporation"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              View incorporation guide
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
            <Link href="/cap-table" className="hover:text-white transition-colors">Cap table</Link>
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
