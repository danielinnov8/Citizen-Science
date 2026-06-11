import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Coins,
  CreditCard,
  Layers,
  Infinity as InfinityIcon,
  ArrowRight,
} from "lucide-react";
import {
  useGetCreditEconomy,
  getGetCreditEconomyQueryKey,
  type CreditTier,
  type CreditTopupPack,
} from "@workspace/api-client-react";
import { LogoIcon, Logo } from "@/components/Logo";

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

function formatNum(value: number): string {
  return value.toLocaleString("en-US");
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

// Planned credit↔USD rate for a paid tier or top-up pack. Derived from the
// economy payload so it tracks the real numbers — never re-typed here.
function usdPerCredit(usd: number, credits: number): number | null {
  if (usd <= 0 || credits <= 0) return null;
  return usd / credits;
}

function formatPerCredit(usd: number, credits: number): string {
  const rate = usdPerCredit(usd, credits);
  if (rate === null) return "—";
  return `$${rate.toFixed(3)}`;
}

export default function Mcp() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, isError } = useGetCreditEconomy({
    query: { queryKey: getGetCreditEconomyQueryKey(), staleTime: 60_000 },
  });

  const paidTiers: CreditTier[] =
    data?.tiers.filter((t) => !t.isGuest && t.monthlyUsd > 0) ?? [];

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
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/mcp" className="text-white transition-colors">Credit economy</Link>
            <Link href="/architecture" className="transition-colors hover:text-white">Architecture</Link>
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
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 lg:py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                <Coins className="h-3 w-3 text-blue-300" />
                Credit economy map
              </span>
              <h1 className="mt-5 font-serif text-5xl lg:text-6xl tracking-tight leading-[1.05]">
                The token &{" "}
                <span className="italic text-blue-300">credit economy</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
                A single blueprint of how credits flow through the platform: what
                every action costs, what each tier grants, how top-ups behave, and
                the planned credit↔money mapping for when Stripe is connected.
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/50">
                Every cost and grant below is read straight from the server's credit
                definitions — the same numbers the system charges in real time.
              </p>
            </motion.div>
          </div>
        </section>

        {isError && (
          <div className="container mx-auto max-w-4xl px-4 lg:px-8 py-16">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              Couldn't load the credit economy right now. Please try again shortly.
            </div>
          </div>
        )}

        {isLoading && (
          <div className="container mx-auto max-w-4xl px-4 lg:px-8 py-16 text-center text-sm text-[#94A3B8]">
            Loading the credit economy…
          </div>
        )}

        {data && (
          <>
            {/* ACTION COSTS */}
            <section className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
                  <Zap className="h-3 w-3 text-blue-600" />
                  What spends credits
                </span>
                <h2 className="mt-4 font-serif text-3xl lg:text-4xl tracking-tight">
                  Cost of every <span className="italic text-blue-600">action</span>
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
                  AI actions are token-metered at roughly{" "}
                  <span className="font-semibold text-[#0F172A]">
                    1 credit per {formatNum(data.tokensPerCredit)} tokens
                  </span>
                  ; the figure shown is the typical/fallback cost. Fixed-price
                  actions charge exactly the amount listed.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                      <th className="px-5 py-3">Action</th>
                      <th className="hidden px-5 py-3 sm:table-cell">What it is</th>
                      <th className="px-5 py-3">Pricing</th>
                      <th className="px-5 py-3 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.actions.map((action) => (
                      <tr
                        key={action.id}
                        className="border-b border-[#F1F5F9] last:border-0 transition-colors hover:bg-blue-50/30"
                        data-testid={`mcp-action-${action.id}`}
                      >
                        <td className="px-5 py-4 font-medium text-[#0F172A]">{action.label}</td>
                        <td className="hidden px-5 py-4 text-[#64748B] sm:table-cell">{action.description}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              action.metered
                                ? "bg-blue-50 text-blue-700"
                                : "bg-violet-50 text-violet-700"
                            }`}
                          >
                            {action.metered ? "Token-metered" : "Fixed"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1 font-semibold tabular-nums text-[#0F172A]">
                            <Zap className="h-3.5 w-3.5 text-blue-600" />
                            {action.metered ? `~${action.credits}` : action.credits}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* TIERS */}
            <section className="bg-white border-y border-[#E2E8F0]">
              <div className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
                <div className="mb-8 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-[#64748B]">
                    <Layers className="h-3 w-3 text-blue-600" />
                    Monthly grants
                  </span>
                  <h2 className="mt-4 font-serif text-3xl lg:text-4xl tracking-tight">
                    What each <span className="italic text-blue-600">tier</span> grants
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
                    Every account gets a pool of credits that resets at the start of
                    each month. Logged-out guests get a small allotment so they can
                    try the copilot before signing up.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {data.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5"
                      data-testid={`mcp-tier-${tier.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-[#0F172A]">{tier.name}</h3>
                        {tier.isGuest && (
                          <span className="rounded-full bg-[#E2E8F0] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                            No account
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-serif text-3xl tracking-tight text-[#0F172A]">
                          {tier.monthlyUsd === 0 ? "Free" : formatUsd(tier.monthlyUsd)}
                        </span>
                        {tier.monthlyUsd > 0 && (
                          <span className="text-xs font-medium text-[#94A3B8]">/ mo</span>
                        )}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#334155] ring-1 ring-[#E2E8F0]">
                        <Zap className="h-4 w-4 text-blue-600" />
                        {formatNum(tier.monthlyCredits)} credits / mo
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* TOP-UPS */}
            <section className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
              <div className="mb-8 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
                  <InfinityIcon className="h-3 w-3 text-blue-600" />
                  Non-expiring credits
                </span>
                <h2 className="mt-4 font-serif text-3xl lg:text-4xl tracking-tight">
                  How <span className="italic text-blue-600">top-ups</span> behave
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
                  Top-up packs are one-time credit purchases that stack on top of the
                  monthly grant and <span className="font-semibold text-[#0F172A]">never expire</span>.
                  Spending always drains the monthly grant first, then top-up credits.
                  (Checkout isn't live yet — these are the planned packs.)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {data.topups.map((pack: CreditTopupPack) => (
                  <div
                    key={pack.id}
                    className={`relative flex flex-col items-center rounded-2xl border bg-white p-6 text-center shadow-sm ${
                      pack.popular ? "border-blue-300 ring-1 ring-blue-200" : "border-[#E2E8F0]"
                    }`}
                    data-testid={`mcp-topup-${pack.id}`}
                  >
                    {pack.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-semibold text-white shadow-md">
                        Best value
                      </span>
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-serif text-3xl tracking-tight text-[#0F172A]">
                      {formatNum(pack.credits)}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">credits</p>
                    <p className="mt-3 text-lg font-semibold text-[#0F172A]">{formatUsd(pack.usd)}</p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      {formatPerCredit(pack.usd, pack.credits)} / credit
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* STRIPE MAPPING (PLANNED) */}
            <section className="relative overflow-hidden bg-[#0B1120] text-white">
              <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
              <div className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />
              <div className="relative container mx-auto max-w-5xl px-4 lg:px-8 py-20 lg:py-24">
                <div className="mb-10 text-center">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: "rgba(96,165,250,0.4)", color: "#93C5FD", backgroundColor: "rgba(96,165,250,0.08)" }}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Planned · Stripe not connected
                  </span>
                  <h2 className="mt-5 font-serif text-3xl lg:text-5xl tracking-tight leading-[1.05]">
                    Credits ↔ money,{" "}
                    <span className="italic text-blue-300">when Stripe is wired up</span>
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
                    This is the intended mapping between credits and real dollars — the
                    blueprint for connecting Stripe later. Nothing here charges money
                    today; it documents what each credit is meant to be worth.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                        <th className="px-5 py-3">Plan</th>
                        <th className="px-5 py-3 text-right">Monthly price</th>
                        <th className="px-5 py-3 text-right">Credits / mo</th>
                        <th className="px-5 py-3 text-right">≈ Per credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paidTiers.map((tier) => (
                        <tr
                          key={tier.id}
                          className="border-b border-white/5 last:border-0"
                          data-testid={`mcp-stripe-tier-${tier.id}`}
                        >
                          <td className="px-5 py-4 font-medium text-white">{tier.name}</td>
                          <td className="px-5 py-4 text-right tabular-nums text-white/80">
                            {formatUsd(tier.monthlyUsd)} / mo
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-white/80">
                            {formatNum(tier.monthlyCredits)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums font-semibold text-blue-300">
                            {formatPerCredit(tier.monthlyUsd, tier.monthlyCredits)}
                          </td>
                        </tr>
                      ))}
                      {data.topups.map((pack) => (
                        <tr
                          key={pack.id}
                          className="border-b border-white/5 last:border-0"
                          data-testid={`mcp-stripe-topup-${pack.id}`}
                        >
                          <td className="px-5 py-4 font-medium text-white">
                            Top-up · {formatNum(pack.credits)} credits
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-white/80">
                            {formatUsd(pack.usd)} one-time
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-white/80">
                            {formatNum(pack.credits)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums font-semibold text-blue-300">
                            {formatPerCredit(pack.usd, pack.credits)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-white/50">
                  Reference target: paid plans price credits at roughly{" "}
                  <span className="font-semibold text-white/80">$0.01 / credit</span>, with
                  larger plans and bigger top-up packs offering a better effective rate.
                  When Stripe is connected, each plan becomes a recurring subscription and
                  each top-up pack a one-time purchase that adds non-expiring credits.
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/pricing"
                    className="btn-metal-blue inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium"
                    data-testid="mcp-cta-pricing"
                  >
                    See the pricing page
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/architecture"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
                    data-testid="mcp-cta-architecture"
                  >
                    <Sparkles className="h-4 w-4" />
                    System architecture
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B1120] text-[#94A3B8] border-t border-white/10">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 py-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo variant="full" theme="dark" />
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
            <Link href="/mcp" className="transition-colors hover:text-white">Credit economy</Link>
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
