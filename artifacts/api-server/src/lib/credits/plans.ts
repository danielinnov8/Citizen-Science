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
  avatar: 2,
  // AI-drafting a mentoring course from the mentor's context.
  courseDraft: 4,
} as const;

export type AiAction = keyof typeof FALLBACK_CREDIT_COST;

// Floor for a mentoring course's minimum enrollment price (credits). Mentors
// can charge more, but never less than this. Defined centrally — alongside the
// AI action costs — so the credit economy (and the /MCP credit map) has a single
// source of truth instead of a value hardcoded in the UI.
export const MENTORSHIP_MIN_COURSE_CREDITS = 5;

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
