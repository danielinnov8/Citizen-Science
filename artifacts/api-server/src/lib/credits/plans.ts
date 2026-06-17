// Credit-based billing model. Every AI action (copilot chat, web-grounded
// research, field-notes analysis, talking avatar) draws down credits, metered
// from Gemini token usage. ~1 credit per 1,000 tokens, with a fixed fallback
// when the provider doesn't report usage.

export type PlanId = "free" | "researcher" | "pioneer";

// Monthly credit grant per plan. Resets at the start of each UTC month.
export const PLAN_MONTHLY_CREDITS: Record<PlanId, number> = {
  free: 200,
  researcher: 2000,
  pioneer: 12000,
};

// Anonymous (logged-out) visitors get a small monthly allotment so they can try
// the copilot before signing up, metered per browser via the anon cookie.
export const GUEST_MONTHLY_CREDITS = 50;

// Roughly one credit per this many tokens.
export const TOKENS_PER_CREDIT = 1000;

// Fixed per-action credit cost used when token usage is unavailable (e.g. the
// provider returned no usageMetadata). Keeps metering honest without a token
// count and roughly tracks each action's typical footprint.
export const FALLBACK_CREDIT_COST = {
  chat: 3,
  research: 5,
  fieldNotes: 2,
  avatar: 50,
  // AI-drafting a mentoring course from the mentor's context.
  courseDraft: 4,
} as const;

// Fixed credits charged when a talking-avatar session is first opened.
// Covers the D-ID stream setup cost regardless of how many messages follow.
export const AVATAR_SESSION_CREDITS = 250;

// Fixed credits charged per spoken message in a talking-avatar session.
// Not token-metered — the cost is predictable and disclosed upfront.
export const AVATAR_MESSAGE_CREDITS = 50;

export type AiAction = keyof typeof FALLBACK_CREDIT_COST;

// Floor for a mentoring course's minimum enrollment price (credits). Mentors
// can charge more, but never less than this. Defined centrally — alongside the
// AI action costs — so the credit economy (and the /MCP credit map) has a single
// source of truth instead of a value hardcoded in the UI.
export const MENTORSHIP_MIN_COURSE_CREDITS = 5;

// ---------------------------------------------------------------------------
// Credit economy blueprint (single source of truth for the /MCP map page)
// ---------------------------------------------------------------------------
// The /MCP reference page renders the platform's whole token/credit economy:
// every credit-consuming action, what each tier grants/costs, how top-ups
// behave, and the *planned* credit↔USD mapping for when Stripe is wired up.
// Everything it shows is derived from the constants below (and the AI action
// costs above) so the page can never drift from what the server actually
// charges. No real payment is taken here — the USD figures are the intended
// pricing blueprint only.

// Planned monthly subscription price (USD) per plan. Stripe is not connected
// yet; these are the intended prices for the future checkout mapping.
export const PLAN_MONTHLY_USD: Record<PlanId, number> = {
  free: 0,
  researcher: 20,
  pioneer: 100,
};

// Human-friendly plan display names.
export const PLAN_NAMES: Record<PlanId, string> = {
  free: "Explorer",
  researcher: "Researcher",
  pioneer: "Pioneer",
};

// Planned one-off top-up packs (non-expiring credits). Placeholder pricing for
// the future Stripe mapping — no live checkout exists today.
export interface CreditTopupPack {
  id: string;
  credits: number;
  usd: number;
  popular?: boolean;
}

export const TOPUP_PACKS: CreditTopupPack[] = [
  { id: "pack-500", credits: 500, usd: 5 },
  { id: "pack-1500", credits: 1500, usd: 12, popular: true },
  { id: "pack-5000", credits: 5000, usd: 35 },
];

export interface CreditActionInfo {
  id: string;
  label: string;
  description: string;
  credits: number;
  // True when the action is token-metered (≈1 credit / 1,000 tokens) and the
  // `credits` figure is the fixed fallback estimate. False for fixed-price
  // actions (e.g. mentee enrollment) where `credits` is the exact charge.
  metered: boolean;
}

// Descriptions are presentational, but every credit figure is read from the
// constants above so the table on /MCP matches what the server charges.
export const CREDIT_ACTIONS: CreditActionInfo[] = [
  {
    id: "chat",
    label: "Copilot chat",
    description: "A turn with the AI science copilot (with verified-video lookup).",
    credits: FALLBACK_CREDIT_COST.chat,
    metered: true,
  },
  {
    id: "research",
    label: "Web-grounded research",
    description: "A Google-Search-grounded answer with cited sources.",
    credits: FALLBACK_CREDIT_COST.research,
    metered: true,
  },
  {
    id: "fieldNotes",
    label: "Field-notes analysis",
    description: "Structured analysis of a notebook observation.",
    credits: FALLBACK_CREDIT_COST.fieldNotes,
    metered: true,
  },
  {
    id: "avatar-session",
    label: "Talking-avatar session",
    description: "Opening a live talking-avatar session (one-time charge per conversation).",
    credits: AVATAR_SESSION_CREDITS,
    metered: false,
  },
  {
    id: "avatar-message",
    label: "Talking-avatar message",
    description: "Each spoken message sent to a live avatar persona.",
    credits: AVATAR_MESSAGE_CREDITS,
    metered: false,
  },
  {
    id: "courseDraft",
    label: "AI course draft",
    description: "Drafting a mentoring course from the mentor's context.",
    credits: FALLBACK_CREDIT_COST.courseDraft,
    metered: true,
  },
  {
    id: "enrollment",
    label: "Mentee course enrollment",
    description:
      "Pay-what-you-want enrollment in a mentor's course (minimum shown; credits go to the mentor).",
    credits: MENTORSHIP_MIN_COURSE_CREDITS,
    metered: false,
  },
];

export interface CreditTierInfo {
  id: string; // "guest" | PlanId
  name: string;
  monthlyCredits: number;
  monthlyUsd: number;
  isGuest: boolean;
}

export interface CreditEconomy {
  tokensPerCredit: number;
  actions: CreditActionInfo[];
  tiers: CreditTierInfo[];
  topups: CreditTopupPack[];
}

// Assemble the full economy blueprint from the constants above. This is the
// single payload the /MCP page reads, so the UI can never re-type a cost.
export function buildCreditEconomy(): CreditEconomy {
  const planTiers: CreditTierInfo[] = (
    ["free", "researcher", "pioneer"] as PlanId[]
  ).map((id) => ({
    id,
    name: PLAN_NAMES[id],
    monthlyCredits: PLAN_MONTHLY_CREDITS[id],
    monthlyUsd: PLAN_MONTHLY_USD[id],
    isGuest: false,
  }));

  const guestTier: CreditTierInfo = {
    id: "guest",
    name: "Guest",
    monthlyCredits: GUEST_MONTHLY_CREDITS,
    monthlyUsd: 0,
    isGuest: true,
  };

  return {
    tokensPerCredit: TOKENS_PER_CREDIT,
    actions: CREDIT_ACTIONS,
    tiers: [guestTier, ...planTiers],
    topups: TOPUP_PACKS,
  };
}

const VALID_PLANS = new Set<PlanId>(["free", "researcher", "pioneer"]);

export function normalizePlan(plan: string | null | undefined): PlanId {
  return plan && VALID_PLANS.has(plan as PlanId) ? (plan as PlanId) : "free";
}

// Monthly credit grant for a stored plan value (defaults to free).
export function monthlyCreditsForPlan(plan: string | null | undefined): number {
  return PLAN_MONTHLY_CREDITS[normalizePlan(plan)];
}

// Convert a Gemini token count into billing credits. Always at least 1 so any
// real call costs something, even a tiny one.
export function tokensToCredits(tokens: number): number {
  if (!Number.isFinite(tokens) || tokens <= 0) return 0;
  return Math.max(1, Math.ceil(tokens / TOKENS_PER_CREDIT));
}

// Credits to charge for an action: derived from tokens when available,
// otherwise the action's fixed fallback cost.
export function creditsForUsage(
  action: AiAction,
  tokens: number | null | undefined,
): number {
  if (typeof tokens === "number" && tokens > 0) {
    return tokensToCredits(tokens);
  }
  return FALLBACK_CREDIT_COST[action];
}
