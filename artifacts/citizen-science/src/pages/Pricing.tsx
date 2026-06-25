import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Sparkles,
  Compass,
  FlaskConical,
  Rocket,
  Mail,
  Crown,
  Star,
  Megaphone,
  Infinity as InfinityIcon,
  MessageCircle,
  Zap,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { LogoIcon, Logo } from "@/components/Logo";
import {
  useGetBillingPrices,
  useCreateCheckoutSession,
  getGetCreditBalanceQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

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
  monthly: number;
  credits: number;
  cta: string;
  featured?: boolean;
  features: string[];
};

const CONTACT_EMAIL = "56289968+danielinnov8@users.noreply.github.com";

const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For the curious. Start exploring real science, free forever.",
    icon: Compass,
    monthly: 0,
    credits: 200,
    cta: "Get started free",
    features: [
      "~200 AI credits / month",
      "All 14 science categories",
      "Scientists & inventors directory",
      "Starter experiment library",
      "Personal field notebook",
      "No credit card required",
    ],
  },
  {
    id: "researcher",
    name: "Researcher",
    tagline: "For dedicated learners who want the full toolkit.",
    icon: FlaskConical,
    monthly: 20,
    credits: 2000,
    cta: "Start researching",
    featured: true,
    features: [
      "~2,000 AI credits / month",
      "Web-grounded answers + verified video",
      "Full experiment & lab library",
      "Talking-avatar conversations",
      "Advanced notebook analysis",
      "Full progress tracking",
    ],
  },
  {
    id: "pioneer",
    name: "Pioneer",
    tagline: "For power users and builders pushing the frontier.",
    icon: Rocket,
    monthly: 100,
    credits: 12000,
    cta: "Go Pioneer",
    features: [
      "~12,000 AI credits / month",
      "Everything in Researcher",
      "Highest monthly credit allotment",
      "Priority access to new labs & features",
      "Best value per credit",
      "Early access to the roadmap",
    ],
  },
];

type TopupPack = {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
};

const TOPUP_PACKS: TopupPack[] = [
  { id: "pack-500", credits: 500, price: 5 },
  { id: "pack-1500", credits: 1500, price: 12, popular: true },
  { id: "pack-5000", credits: 5000, price: 35 },
];

function formatPrice(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function formatCredits(value: number) {
  return value.toLocaleString("en-US");
}

// ── Checkout hook ────────────────────────────────────────────────────────────

function useCheckout() {
  const { isAuthenticated } = useAuth();
  const mutation = useCreateCheckoutSession();
  const [loading, setLoading] = useState<string | null>(null);

  // Returns true when it has initiated a redirect (to /login or Stripe), false
  // when nothing happened (missing priceId, failed/empty session) so callers
  // can recover instead of leaving the user on a dead-end loading state.
  const checkout = async (
    priceId: string | undefined,
    key: string,
  ): Promise<boolean> => {
    if (!priceId) return false;

    if (!isAuthenticated) {
      // Remember the intended purchase so we can resume it right after the
      // user signs in/up — the transaction happens before any onboarding.
      try {
        window.localStorage.setItem("cs.pendingCheckout", priceId);
        window.localStorage.setItem("cs.postAuthRedirect", "/pricing");
      } catch {
        /* ignore */
      }
      window.location.href = "/login";
      return true;
    }

    setLoading(key);
    try {
      const result = await mutation.mutateAsync({ data: { priceId } });
      if (result.url) {
        window.location.href = result.url;
        return true;
      }
      return false;
    } catch {
      // error is surfaced via mutation state
      return false;
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading, error: mutation.error };
}

// ── Checkout result banner ───────────────────────────────────────────────────

function CheckoutBanner() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const status = params.get("checkout");
  const [visible, setVisible] = useState(!!status);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "success") {
      void queryClient.invalidateQueries({ queryKey: getGetCreditBalanceQueryKey() });
    }
  }, [status, queryClient]);

  if (!visible || !status) return null;

  const isSuccess = status === "success";

  return (
    <div
      className={`fixed top-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border px-5 py-3 shadow-xl backdrop-blur-md text-sm font-medium transition-all ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
      )}
      <span>
        {isSuccess
          ? "Payment complete! Your plan has been upgraded."
          : "Checkout canceled. No charge was made."}
      </span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-2 rounded-full p-0.5 opacity-60 hover:opacity-100"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Price block ──────────────────────────────────────────────────────────────

function PriceBlock({ tier }: { tier: Tier }) {
  if (tier.monthly === 0) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-4xl tracking-tight text-[#0F172A]">
          Free
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-5xl tracking-tight text-[#0F172A]">
          {formatPrice(tier.monthly)}
        </span>
        <span className="text-sm font-medium text-[#64748B]">/ mo</span>
      </div>
      <p className="mt-1 text-xs text-[#94A3B8]">billed monthly</p>
    </div>
  );
}

// ── Tier card ────────────────────────────────────────────────────────────────

function TierCard({
  tier,
  priceId,
  onCheckout,
  isLoading,
}: {
  tier: Tier;
  priceId: string | undefined;
  onCheckout: (priceId: string | undefined, key: string) => void;
  isLoading: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const Icon = tier.icon;
  const featured = tier.featured;
  const isFree = tier.id === "free";

  const handleClick = () => {
    if (isFree) return;
    onCheckout(priceId, tier.id);
  };

  const ctaDisabled = !isFree && !priceId && isAuthenticated;
  const ctaLabel = isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <>
      {tier.cta}
      <ArrowRight className="h-4 w-4" />
    </>
  );

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

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-[#0F172A]">
        {tier.name}
      </h3>
      <p className="mt-1.5 min-h-[40px] text-sm leading-relaxed text-[#64748B]">
        {tier.tagline}
      </p>

      <div className="mt-5 min-h-[88px]">
        <PriceBlock tier={tier} />
      </div>

      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
          featured
            ? "bg-blue-50 text-blue-700"
            : "bg-[#F8FAFC] text-[#334155]"
        }`}
      >
        <Zap
          className={`h-4 w-4 ${featured ? "text-blue-600" : "text-[#64748B]"}`}
        />
        ~{formatCredits(tier.credits)} credits / month
      </div>

      {isFree ? (
        <Link
          href="/login"
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors btn-metal-ink`}
          data-testid={`pricing-cta-${tier.id}`}
        >
          {tier.cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading || ctaDisabled}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            featured ? "btn-metal-blue" : "btn-metal-ink"
          }`}
          data-testid={`pricing-cta-${tier.id}`}
        >
          {ctaLabel}
        </button>
      )}

      <ul className="mt-6 space-y-3 border-t border-[#F1F5F9] pt-6 text-sm">
        {tier.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[#334155]"
          >
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                featured
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-50 text-green-600"
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

// ── Top-up packs ─────────────────────────────────────────────────────────────

function TopupPacks({
  pricesData,
  onCheckout,
  loadingKey,
}: {
  pricesData: { topups: { id: string; packId?: string | null; creditAmount?: number | null }[] } | undefined;
  onCheckout: (priceId: string | undefined, key: string) => void;
  loadingKey: string | null;
}) {
  return (
    <section
      id="topups"
      className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20"
    >
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-medium text-[#64748B]">
          <Zap className="h-3 w-3 text-blue-600" />
          Need more this month?
        </span>
        <h2 className="mt-4 font-serif text-3xl lg:text-4xl tracking-tight">
          Top up your <span className="italic text-blue-600">credits</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#64748B]">
          One-time credit packs that never expire — they stack on top of your
          monthly allotment. Buy more whenever you run low, no plan change
          required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TOPUP_PACKS.map((pack) => {
          const stripePack = pricesData?.topups.find(
            (t) => t.packId === pack.id,
          );
          const priceId = stripePack?.id;
          const isLoading = loadingKey === pack.id;

          return (
            <div
              key={pack.id}
              className={`relative flex flex-col items-center rounded-2xl border bg-white p-6 text-center transition-all ${
                pack.popular
                  ? "border-blue-300 shadow-lg shadow-blue-900/10 ring-1 ring-blue-200"
                  : "border-[#E2E8F0] shadow-sm hover:border-blue-200 hover:shadow-md"
              }`}
              data-testid={`topup-card-${pack.id}`}
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
                {formatCredits(pack.credits)}
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                credits
              </p>
              <p className="mt-3 text-lg font-semibold text-[#0F172A]">
                {formatPrice(pack.price)}
              </p>
              <button
                type="button"
                onClick={() => onCheckout(priceId, pack.id)}
                disabled={!priceId || isLoading}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                  priceId && !isLoading
                    ? "btn-metal-blue"
                    : "cursor-not-allowed border border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8]"
                }`}
                data-testid={`topup-cta-${pack.id}`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : priceId ? (
                  <>
                    Buy now
                    <ExternalLink className="h-3.5 w-3.5" />
                  </>
                ) : (
                  "Coming soon"
                )}
              </button>
            </div>
          );
        })}
      </div>
      {!pricesData?.topups.length && (
        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Top-up purchases are not yet live — these packs are a preview of
          what&apos;s coming.
        </p>
      )}
    </section>
  );
}

// ── Founding member section ──────────────────────────────────────────────────

const FOUNDING_PERKS: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    icon: InfinityIcon,
    title: "Lifetime Researcher access",
    description:
      "Every paid Researcher feature, unlocked forever. You never pay a subscription again.",
  },
  {
    icon: Star,
    title: "Featured on our homepage",
    description:
      "Your name and photo in the founding members showcase, seen by every visitor.",
  },
  {
    icon: Megaphone,
    title: "A shout-out in every newsletter",
    description:
      "We thank our founders by name in all newsletters going out to the community.",
  },
  {
    icon: Crown,
    title: "Founding Member badge",
    description:
      "A permanent badge across the platform marking you as one of the originals.",
  },
  {
    icon: MessageCircle,
    title: "A direct line to the founders",
    description:
      "Private channel to the team — share ideas and help shape the roadmap.",
  },
  {
    icon: Rocket,
    title: "Early access to everything",
    description:
      "Be first to try new labs and features, and help name what we build next.",
  },
];

const FOUNDING_SPOTS = 100;

function FoundingMember() {
  const { isAuthenticated } = useAuth();
  const { data: prices } = useGetBillingPrices();
  const mutation = useCreateCheckoutSession();
  const [loading, setLoading] = useState(false);

  const foundingPriceId = prices?.founding?.[0]?.id;

  const handleCheckout = async () => {
    if (!foundingPriceId) return;
    if (!isAuthenticated) {
      try {
        window.localStorage.setItem("cs.pendingCheckout", foundingPriceId);
        window.localStorage.setItem("cs.postAuthRedirect", "/pricing");
      } catch {
        /* ignore */
      }
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const result = await mutation.mutateAsync({ data: { priceId: foundingPriceId } });
      if (result.url) window.location.href = result.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="founding"
      className="relative overflow-hidden bg-[#0B1120] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={GRID_BG}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[460px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[360px] w-[360px] translate-x-1/2 rounded-full bg-blue-600/20 blur-[140px]" />

      <div className="relative container mx-auto max-w-6xl px-4 lg:px-8 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
              style={{
                borderColor: "rgba(212,175,55,0.4)",
                color: "#E4C75B",
                backgroundColor: "rgba(212,175,55,0.08)",
              }}
            >
              <Crown className="h-3.5 w-3.5" />
              Founding Member · limited to {FOUNDING_SPOTS}
            </span>
            <h2 className="mt-5 font-serif text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Help us build{" "}
              <span className="italic" style={{ color: "#E4C75B" }}>
                humanity&apos;s research network
              </span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              For the believers who want to do more than subscribe. Founding
              members fund the mission, get everything for life, and are
              celebrated as the people who made it possible.
            </p>

            <div className="mt-8 flex items-end gap-3">
              <span
                className="font-serif text-6xl tracking-tight"
                style={{ color: "#E4C75B" }}
              >
                $2,500
              </span>
              <span className="pb-2 text-sm font-medium text-white/60">
                one-time · lifetime
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => void handleCheckout()}
                disabled={loading || !foundingPriceId}
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[#0B1120] transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  backgroundImage:
                    "linear-gradient(to bottom right, #F4D77B, #E4C75B 45%, #C9A93B)",
                  border: "1px solid #E4C75B",
                }}
                data-testid="founding-cta"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                Become a founding member
              </button>
              <span className="inline-flex items-center justify-center gap-2 text-sm text-white/50">
                Only {FOUNDING_SPOTS} spots — first come, first served
              </span>
            </div>
          </div>

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
                    style={{
                      backgroundColor: "rgba(212,175,55,0.12)",
                      color: "#E4C75B",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-white">
                    {perk.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">
                    {perk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I really use Citizen Science for free?",
    a: "Yes. The Free plan is free forever, no card required — browse every science category, the inventor directory, starter experiments, and keep a personal field notebook. You also get ~200 AI credits each month to use the copilot and other AI features.",
  },
  {
    q: "What is an AI credit?",
    a: "Credits are how we meter the AI features — the science copilot, web-grounded research, notebook analysis, and talking-avatar conversations. Roughly 1 credit covers about 1,000 tokens of AI work, so a typical copilot question costs only a few credits. Your monthly allotment resets at the start of each month.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "The AI features pause until your monthly credits reset, you buy a top-up pack, or you upgrade your plan. Everything else — browsing categories, the directory, experiments, and your notebook — keeps working as normal.",
  },
  {
    q: "Do top-up credits expire?",
    a: "No. Top-up packs are one-time purchases that stack on top of your monthly allotment and never expire.",
  },
  {
    q: "Can I change or cancel my plan later?",
    a: "Absolutely. Upgrade, downgrade, or cancel anytime through the subscription management portal — your notebook and progress stay with your account.",
  },
  {
    q: "What is a Founding Member?",
    a: `A one-time $2,500 lifetime membership for early believers in the mission. Founders get every Researcher feature for life, a permanent Founding Member badge, a featured spot on our homepage, a shout-out in every newsletter, a direct line to the team, and early access to new features. It's limited to the first ${FOUNDING_SPOTS} members.`,
  },
];

// ── Main page ────────────────────────────────────────────────────────────────

export default function Pricing() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: pricesData } = useGetBillingPrices();
  const { checkout, loading } = useCheckout();
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const checkoutStatus = new URLSearchParams(search).get("checkout");
  const [resuming, setResuming] = useState(false);
  const resumedRef = useRef(false);

  // Resume a purchase that was started before sign-in: as soon as the user is
  // authenticated, kick off Stripe checkout — before onboarding runs.
  useEffect(() => {
    if (resumedRef.current) return;
    if (!isAuthenticated) return;
    if (checkoutStatus) return; // returning from Stripe — don't restart
    let pending: string | null = null;
    try {
      pending = window.localStorage.getItem("cs.pendingCheckout");
    } catch {
      /* ignore */
    }
    if (!pending) return;
    resumedRef.current = true;
    setResuming(true);
    try {
      window.localStorage.removeItem("cs.pendingCheckout");
      window.localStorage.removeItem("cs.postAuthRedirect");
    } catch {
      /* ignore */
    }
    void checkout(pending, "resume").then((started) => {
      // If the session couldn't be created (503/network/empty url), release the
      // overlay so the user isn't stuck — they're now signed in and can retry
      // from the card directly.
      if (!started) setResuming(false);
    });
  }, [isAuthenticated, checkoutStatus, checkout]);

  // After a successful payment, pass the user through: new users go to
  // onboarding, returning users go straight to their dashboard.
  useEffect(() => {
    if (checkoutStatus !== "success") return;
    try {
      window.localStorage.removeItem("cs.pendingCheckout");
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => {
      setLocation(hasCompletedOnboarding ? "/dashboard" : "/onboarding");
    }, 1800);
    return () => window.clearTimeout(t);
  }, [checkoutStatus, hasCompletedOnboarding, setLocation]);

  const getPlanPriceId = (planId: string) =>
    pricesData?.subscriptions.find((s) => s.planId === planId)?.id;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      <CheckoutBanner />
      {resuming && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-[#0B1120]/80 text-white backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
          <p className="text-sm font-medium text-white/80">
            Starting secure checkout…
          </p>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1120]/90 text-white backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg tracking-tight"
          >
            <LogoIcon className="h-8 w-8" />
            <span>Citizen Science™</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/#vision" className="transition-colors hover:text-white">
              Vision
            </Link>
            <Link
              href="/#discover"
              className="transition-colors hover:text-white"
            >
              Discover
            </Link>
            <Link href="/#impact" className="transition-colors hover:text-white">
              Impact
            </Link>
            <Link href="/pricing" className="text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="btn-metal-blue inline-flex items-center rounded-full px-6 py-2 text-sm font-medium transition-colors"
            >
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
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={GRID_BG}
          />
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
                Start free and explore real science forever. Every plan comes
                with AI credits — upgrade or top up when you&apos;re ready for
                more. No hidden fees.
              </p>
            </motion.div>
          </div>
        </section>

        {/* PRICING TIERS */}
        <section className="relative">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <div className="-mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 lg:items-start">
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  priceId={getPlanPriceId(tier.id)}
                  onCheckout={checkout}
                  isLoading={loading === tier.id}
                />
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-[#94A3B8]">
              Every plan includes a monthly pool of AI credits that power the
              copilot, web research, notebook analysis, and talking avatars.
              ~1&nbsp;credit&nbsp;≈&nbsp;1,000 tokens. Prices in USD.
            </p>
          </div>
        </section>

        {/* TOP-UP PACKS */}
        <TopupPacks
          pricesData={pricesData}
          onCheckout={checkout}
          loadingKey={loading}
        />

        {/* FOUNDING MEMBER */}
        <div className="mt-20 lg:mt-24">
          <FoundingMember />
        </div>

        {/* FAQ */}
        <section className="container mx-auto max-w-3xl px-4 lg:px-8 py-20 lg:py-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl lg:text-4xl tracking-tight">
              Frequently asked{" "}
              <span className="italic text-blue-600">questions</span>
            </h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6"
              >
                <h3 className="text-base font-semibold text-[#0F172A]">
                  {faq.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-[#0B1120] text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={GRID_BG}
          />
          <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-[150px]" />
          <div className="relative container mx-auto max-w-3xl px-4 lg:px-8 py-20 text-center">
            <h2 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">
              Ready to start exploring?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
              Join free today. No card, no commitment — just your curiosity and
              a notebook ready to fill.
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
            <Link
              href="/pricing"
              className="transition-colors hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/categories"
              className="transition-colors hover:text-white"
            >
              Categories
            </Link>
            <Link href="/brand" className="transition-colors hover:text-white">
              Brand
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science™.
          </div>
        </div>
      </footer>
    </div>
  );
}
