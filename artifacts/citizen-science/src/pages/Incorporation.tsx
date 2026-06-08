import React, { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Scale,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  Clock,
  Wallet,
  Target,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

const BUILD_DATE = "June 6, 2026";

const TLDR: string[] = [
  "Stays a normal taxable for-profit that can raise angel/VC capital and issue stock — nothing about fundraising changes.",
  "Bakes a public-benefit mission into the charter, so it survives new investors, board turnover, or an acquisition.",
  "Gives directors legal cover to weigh society, stakeholders, and the environment alongside shareholder return.",
  "A credible trust signal to mission-aligned partners, schools, and users — without the constraints of a nonprofit.",
];

const WHY_FIT: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "Mission lock-in",
    body: "The general public benefit purpose lives in the Articles of Incorporation, not a marketing page. It carries forward through funding rounds, board changes, and even a sale of the company.",
  },
  {
    icon: Scale,
    title: "Director protection",
    body: "Florida's Benefit Corporation Act lets (and expects) directors to consider stakeholders — employees, community, environment — not just maximizing short-term shareholder profit. That legal cover is hard to get in a plain C-Corp.",
  },
  {
    icon: Building2,
    title: "Still a real for-profit",
    body: "Unlike a nonprofit, you keep private ownership and equity, can distribute profits, and can raise venture or angel capital and issue stock. It's an ordinary taxable corporation with one extra purpose clause.",
  },
  {
    icon: Sparkles,
    title: "Trust signal",
    body: "Being a statutory benefit corporation — with an annual benefit report — is a verifiable commitment that resonates with mission-driven partners, educators, and users.",
  },
];

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Pick & clear a company name",
    body: (
      <>
        Search the name on{" "}
        <a href="https://sunbiz.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
          Sunbiz
        </a>{" "}
        and confirm it's available. It must include a corporate suffix — Inc., Corp., Incorporated, Company, etc.
        Including "benefit corporation" in the name is optional, not required.
      </>
    ),
  },
  {
    title: "Appoint a Florida registered agent",
    body: (
      <>
        This can be you, another person, or a paid service — but the agent needs a physical Florida street address
        (no P.O. boxes) and must be available during business hours.
      </>
    ),
  },
  {
    title: "Draft your Articles of Incorporation",
    body: (
      <>
        The Articles must (a) form a <strong>for-profit corporation</strong> and (b) explicitly state it is a{" "}
        <strong>benefit corporation</strong> with a <strong>general public benefit purpose</strong>. You may add a
        specific public benefit too. The default Sunbiz template does not include benefit-corporation language — you
        have to add it.
      </>
    ),
  },
  {
    title: "File the Articles with the Division of Corporations",
    body: <>File on Sunbiz (online is preferred and fastest). This is the moment your corporation legally exists.</>,
  },
  {
    title: "Get a free EIN from the IRS",
    body: (
      <>
        Apply directly with the IRS — it's free and issued instantly online. Never pay a third party for an EIN.
      </>
    ),
  },
  {
    title: "Adopt bylaws & hold the organizational meeting",
    body: <>Adopt bylaws, appoint initial directors/officers, authorize and issue stock, and set up your records book.</>,
  },
  {
    title: "Set up benefit governance",
    body: (
      <>
        Consider designating a benefit director/officer, and choose the third-party standard you'll use to measure
        your public benefit — the statute lets you pick a recognized standard.
      </>
    ),
  },
  {
    title: "Open a business bank account & handle local licensing",
    body: <>Open a dedicated business account, and obtain any local business tax receipt or licenses your county/city requires.</>,
  },
  {
    title: "Check federal FinCEN BOI reporting status",
    body: (
      <>
        The federal Beneficial Ownership Information (BOI) reporting rule shifted in 2025 and its applicability to
        domestic companies changed. <strong>Verify what currently applies</strong> before assuming you must — or must
        not — file.
      </>
    ),
  },
  {
    title: "Stay compliant every year",
    body: (
      <>
        File the Florida Annual Report each year (due by <strong>May 1</strong>), and prepare and deliver the
        statutorily required <strong>annual benefit report</strong> to shareholders, making it publicly available.
      </>
    ),
  },
];

type CompareRow = {
  option: string;
  missionLock: string;
  capital: string;
  complexity: string;
  cost: string;
  recommended?: boolean;
};

const COMPARE: CompareRow[] = [
  {
    option: "Florida Benefit Corporation",
    missionLock: "Strong — in the charter",
    capital: "Full — stock & VC/angel",
    complexity: "Low–Medium",
    cost: "~$70 to start, ~$150/yr",
    recommended: true,
  },
  {
    option: "Florida C-Corp (standard)",
    missionLock: "None",
    capital: "Full — stock & VC/angel",
    complexity: "Low",
    cost: "~$70 to start, ~$150/yr",
  },
  {
    option: "Florida LLC",
    missionLock: "None (weak via op. agreement)",
    capital: "Limited — harder for VC/stock",
    complexity: "Low",
    cost: "~$125 to start, ~$139/yr",
  },
  {
    option: "Delaware Public Benefit Corp (PBC)",
    missionLock: "Strong — in the charter",
    capital: "Full — VC's preferred home",
    complexity: "Medium–High",
    cost: "Higher (DE franchise tax + foreign-qualify in FL)",
  },
  {
    option: "Nonprofit / 501(c)(3)",
    missionLock: "Maximum — locked by law",
    capital: "None — no equity, no profit distribution",
    complexity: "High",
    cost: "$600+ IRS filing + ongoing compliance",
  },
  {
    option: 'B Corp certification (B Lab)',
    missionLock: "Brand/contractual, not legal entity",
    capital: "N/A — it's a badge, not a structure",
    complexity: "Added on top of an entity",
    cost: "Annual fee scaled to revenue",
  },
];

type CostRow = { item: string; amount: string; note?: string };

const COST_ONE_TIME: CostRow[] = [
  { item: "FL Articles of Incorporation filing", amount: "~$35" },
  { item: "Registered-agent designation fee", amount: "~$35", note: "Required at filing" },
  { item: "EIN from the IRS", amount: "Free" },
  { item: "Certified copy (optional)", amount: "~$8.75" },
  { item: "Certificate of status (optional)", amount: "~$8.75" },
];

const COST_RECURRING: CostRow[] = [
  { item: "FL Annual Report", amount: "~$150 / yr", note: "Due May 1 — ~$400 penalty if late" },
  { item: "Registered-agent service (optional)", amount: "$0 (DIY) – $300 / yr" },
];

const COST_TOTALS: { label: string; first: string; recurring: string; tone: "recommended" | "default" }[] = [
  { label: "DIY minimum (via Sunbiz)", first: "~$70 to start", recurring: "~$150 / yr", tone: "recommended" },
  { label: "Budget formation / RA service", first: "~$200–$400 first year", recurring: "~$150 / yr + service", tone: "default" },
  { label: "Attorney-assisted", first: "~$600–$2,600 first year", recurring: "~$150 / yr", tone: "default" },
];

const SPEED: { method: string; time: string }[] = [
  { method: "Online Sunbiz filing", time: "Typically ~2–14 business days (varies with backlog)" },
  { method: "Mail filing", time: "Noticeably slower — weeks" },
  { method: "EIN (IRS online)", time: "Instant" },
];

const EXECUTION: { title: string; when: string; how: string }[] = [
  {
    title: "DIY online via Sunbiz",
    when: "Budget-sensitive and comfortable drafting the benefit-corp language yourself.",
    how: "Use Sunbiz e-file. The default template lacks benefit-corporation language — manually add the general public benefit purpose and benefit-corporation statement to your Articles. Cheapest and fastest practical route.",
  },
  {
    title: "Online formation service",
    when: "You want registered-agent service, reminders, and minimal hassle bundled together.",
    how: "Services like Northwest, ZenBusiness, or Bizee/LegalZoom work — but confirm they actually support benefit-corporation Articles. Many default to a plain corporation and will not add the benefit purpose unless asked.",
  },
  {
    title: "Attorney / CPA",
    when: "Raising outside capital soon, multiple founders, or you want custom bylaws, equity, and benefit-report governance done right.",
    how: "Highest cost, lowest personal effort and risk. Best when the governance and cap table need to be airtight from day one.",
  },
  {
    title: "Delaware Public Benefit Corp",
    when: "ONLY if you plan to raise institutional VC that expects a Delaware entity.",
    how: "Adds Delaware franchise tax, a Delaware registered agent, and the need to foreign-qualify in Florida to operate here. For most early-stage cases, a Florida benefit corp is simpler and cheaper.",
  },
];

const CHECKLIST: string[] = [
  "Brainstorm and clear a name on Sunbiz (with a corporate suffix).",
  "Decide your registered agent (yourself vs. a paid service).",
  "Draft Articles with for-profit + benefit-corporation + general public benefit language.",
  "File the Articles online via Sunbiz.",
  "Get a free EIN from the IRS.",
  "Adopt bylaws, hold the organizational meeting, and issue stock.",
  "Open a business bank account; handle local licenses.",
  "Verify current FinCEN BOI reporting requirements.",
  "Calendar the May 1 Annual Report and your annual benefit report.",
];

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">{eyebrow}</p>
      <h2 className="font-serif text-3xl lg:text-4xl tracking-tight leading-tight text-[#0F172A]">{title}</h2>
    </div>
  );
}

export default function Incorporation() {
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
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
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
                <Landmark className="h-3 w-3 text-blue-300" />
                Internal guide · for-profit formation
              </span>
              <h1 className="mt-5 font-serif text-4xl lg:text-6xl tracking-tight leading-[1.05]">
                Forming a Florida{" "}
                <span className="italic text-blue-300">Benefit Corporation</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                A step-by-step strategic guide to legally forming this company as a mission-driven,
                for-profit benefit corporation — why it fits "Humanity's Research Network", how the
                alternatives compare, what it costs, how long it takes, and the best way to actually
                do it.
              </p>

              {/* Disclaimer */}
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-4 text-sm leading-relaxed text-amber-100/90">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <p>
                  <strong className="text-amber-200">This is general information, not legal or tax advice.</strong>{" "}
                  Confirm current fees and requirements with the Florida Division of Corporations
                  (Sunbiz) and a licensed attorney/CPA before filing. Statutory fees and federal
                  reporting rules change — all figures here are as of <strong>{BUILD_DATE}</strong> and
                  must be verified on Sunbiz.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 lg:px-8 py-16 lg:py-20 space-y-20">
          {/* TL;DR */}
          <section>
            <SectionHeading
              eyebrow="Recommendation"
              title={
                <>
                  TL;DR — form a <span className="italic text-blue-600">Florida Benefit Corporation</span>
                </>
              }
            />
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8 shadow-sm">
              <ul className="space-y-4">
                {TLDR.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#334155]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* WHY IT FITS */}
          <section>
            <SectionHeading
              eyebrow="Why this structure"
              title={
                <>
                  Why a benefit corporation likely fits <span className="italic text-blue-600">this company</span>
                </>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {WHY_FIT.map((card) => {
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
            <p className="mt-6 rounded-2xl bg-[#F1F5F9] p-5 text-sm leading-relaxed text-[#475569]">
              <strong className="text-[#0F172A]">On the alternatives:</strong> a nonprofit is ruled out because the
              goal is an ordinary <strong>for-profit</strong> with private ownership and equity. A plain C-Corp or LLC
              is legal but offers no mission lock-in or stakeholder protection. And "B Corp" is a private{" "}
              <strong>certification</strong> from B Lab — a badge, not a legal entity. You can be a statutory benefit
              corporation without B Corp certification, and vice versa.
            </p>
          </section>

          {/* STEPS */}
          <section>
            <SectionHeading
              eyebrow="The process"
              title={
                <>
                  Step-by-step: forming a Florida <span className="italic text-blue-600">benefit corporation</span>
                </>
              }
            />
            <ol className="space-y-5">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-sm font-semibold text-white">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-base font-semibold text-[#0F172A]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* COMPARISON */}
          <section>
            <SectionHeading eyebrow="Decision matrix" title="Alternatives compared" />
            <div className="overflow-x-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A]">
                    <th className="px-4 py-3 font-semibold">Option</th>
                    <th className="px-4 py-3 font-semibold">Mission lock-in</th>
                    <th className="px-4 py-3 font-semibold">Capital raising</th>
                    <th className="px-4 py-3 font-semibold">Complexity</th>
                    <th className="px-4 py-3 font-semibold">Rough cost</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row) => (
                    <tr
                      key={row.option}
                      className={`border-b border-[#F1F5F9] last:border-0 ${
                        row.recommended ? "bg-blue-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-[#0F172A]">
                        <span className="flex items-center gap-2">
                          {row.option}
                          {row.recommended && (
                            <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                              Pick
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#475569]">{row.missionLock}</td>
                      <td className="px-4 py-3 text-[#475569]">{row.capital}</td>
                      <td className="px-4 py-3 text-[#475569]">{row.complexity}</td>
                      <td className="px-4 py-3 text-[#475569]">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#94A3B8]">
              Costs are rough, as of {BUILD_DATE}. Verify current figures on Sunbiz and with the relevant agency.
            </p>
          </section>

          {/* COST */}
          <section>
            <SectionHeading
              eyebrow="The numbers"
              title={
                <>
                  Cost <span className="italic text-blue-600">breakdown</span>
                </>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  One-time, to incorporate
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {COST_ONE_TIME.map((row) => (
                    <li key={row.item} className="flex items-baseline justify-between gap-4">
                      <span className="text-[#475569]">
                        {row.item}
                        {row.note && <span className="block text-xs text-[#94A3B8]">{row.note}</span>}
                      </span>
                      <span className="shrink-0 font-medium text-[#0F172A]">{row.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Recurring
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {COST_RECURRING.map((row) => (
                    <li key={row.item} className="flex items-baseline justify-between gap-4">
                      <span className="text-[#475569]">
                        {row.item}
                        {row.note && <span className="block text-xs text-[#94A3B8]">{row.note}</span>}
                      </span>
                      <span className="shrink-0 font-medium text-[#0F172A]">{row.amount}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 rounded-xl bg-[#F1F5F9] p-3 text-xs leading-relaxed text-[#475569]">
                  Other optional paths: an online formation service runs ~$0 base + state fees (up to ~$300+ by tier);
                  attorney-assisted formation runs ~$500–$2,500+ one-time.
                </p>
              </div>
            </div>

            {/* Computed totals */}
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {COST_TOTALS.map((total) => (
                <div
                  key={total.label}
                  className={`rounded-2xl border p-5 ${
                    total.tone === "recommended"
                      ? "border-blue-300 bg-blue-50/60 ring-1 ring-blue-200"
                      : "border-[#E2E8F0] bg-white shadow-sm"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">{total.label}</p>
                  <p className="mt-3 font-serif text-2xl tracking-tight text-[#0F172A]">{total.first}</p>
                  <p className="mt-1 text-sm text-[#64748B]">then {total.recurring}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SPEED */}
          <section>
            <SectionHeading
              eyebrow="Timelines"
              title={
                <>
                  How fast is <span className="italic text-blue-600">each path</span>
                </>
              }
            />
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <ul className="divide-y divide-[#F1F5F9]">
                {SPEED.map((row) => (
                  <li key={row.method} className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-[#0F172A]">{row.method}</span>
                    <span className="text-right text-sm text-[#64748B]">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-3 text-xs text-[#94A3B8]">
              Florida historically does not offer paid expedited corporate filing, so filing online is the fastest
              practical route. Timelines fluctuate — verify current Sunbiz processing times.
            </p>
          </section>

          {/* EXECUTION */}
          <section>
            <SectionHeading
              eyebrow="How to actually do it"
              title={
                <>
                  Best execution <span className="italic text-blue-600">per method</span>
                </>
              }
            />
            <div className="space-y-4">
              {EXECUTION.map((row) => (
                <div key={row.title} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-[#0F172A]">
                    <Target className="h-4 w-4 text-blue-600" />
                    {row.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#334155]">
                    <span className="font-semibold text-[#0F172A]">When to pick it: </span>
                    {row.when}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                    <span className="font-semibold text-[#0F172A]">How to do it well: </span>
                    {row.how}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CHECKLIST */}
          <section>
            <SectionHeading
              eyebrow="Do this now"
              title={
                <>
                  Closing <span className="italic text-blue-600">checklist</span>
                </>
              }
            />
            <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8 shadow-sm">
              <ul className="space-y-3">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#334155]">
                    <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Closing note */}
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F1F5F9] p-5 text-sm leading-relaxed text-[#475569]">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p>
                Reminder: this guide is educational reference, not legal or tax advice. Florida benefit corporations
                exist under the Florida Benefit Corporation Act (Ch. 607, Part III, effective July 1, 2014). Confirm
                every fee, deadline, and federal reporting requirement on{" "}
                <a href="https://sunbiz.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                  Sunbiz
                </a>{" "}
                and with a licensed attorney/CPA before you file.
              </p>
            </div>
          </section>

          {/* Bottom nav */}
          <div className="flex flex-col gap-4 border-t border-[#E2E8F0] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <Link
              href="/cap-table"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              View the cap table
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
            <Link href="/cap-table" className="hover:text-white transition-colors">Cap table</Link>
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
