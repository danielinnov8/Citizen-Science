// Build with Gemini XPRIZE — readiness data.
//
// Source: official competition rules at https://www.geminixprize.com/rules
// (XPRIZE × Google, administered on Devpost). This drives the dev-only /xprize
// readiness dashboard. Statuses reflect this project's current state and are
// intentionally honest — the prize requires a real, revenue-generating,
// AI-native business, so the score is meant to show what's left, not to flatter.

export type ReqStatus = "met" | "partial" | "todo" | "atrisk" | "na";

export interface XprizeRequirement {
  id: string;
  title: string;
  /** What the official rules require. */
  rule: string;
  /** Our current state / assessment for this project. */
  note: string;
  status: ReqStatus;
  /** Whether this item counts toward the readiness score. */
  counts: boolean;
}

export interface XprizeGroup {
  id: string;
  label: string;
  items: XprizeRequirement[];
}

export const COMPETITION = {
  name: "Build with Gemini XPRIZE",
  tagline:
    "A $2M global hackathon to launch a real, AI-native business — real users and real revenue — in 90 days",
  organizers: "XPRIZE × Google · administered on Devpost",
  prizePool: "$2M (25 winners)",
  grandPrize: "$500k (1st) + $200k (2nd)",
  rulesUrl: "https://www.geminixprize.com/rules",
  siteUrl: "https://www.geminixprize.com",
  hashtag: "#BuildWithGemini",
} as const;

// The five competition categories — every submission picks exactly one.
export const CATEGORIES: string[] = [
  "Education & Human Potential",
  "Entrepreneurship & Job Creation",
  "Small Business Services",
  "Money & Financial Access",
  "Professional Services",
];

export interface KeyDate {
  label: string;
  iso: string; // YYYY-MM-DD
  note: string;
}

export const KEY_DATES: KeyDate[] = [
  {
    label: "Submission deadline",
    iso: "2026-08-17",
    note: "Project, demo video & revenue evidence due — 1:00 PM PT.",
  },
  {
    label: "Judging period",
    iso: "2026-08-18",
    note: "Judges review repos, demos & business traction (through Sep 15).",
  },
  {
    label: "Finalist pitch & winners",
    iso: "2026-09-25",
    note: "Live finals in Los Angeles; winners announced.",
  },
];

// The three equally-weighted judging criteria (informational — not separately
// scored on this dashboard).
export const EVALUATION_CRITERIA: { title: string; detail: string }[] = [
  {
    title: "Business Viability",
    detail:
      "Launch a real business with real users and verifiable revenue (Stripe export, bank statement, or P&L) during the 90-day window — projections don't count.",
  },
  {
    title: "AI-Native Operations",
    detail:
      "Run the business through AI agents in production, executing key decisions with minimal human intervention. The hardest criterion to fake — and the most important to win.",
  },
  {
    title: "Category Impact",
    detail:
      "Meaningfully move the needle in your chosen category — either redefine how something works, or reach a scale where widespread adoption is credible.",
  },
];

export const RIGHTS = {
  keep: [
    "Full ownership of your code, product, and business IP (including moral rights)",
    "Right to use open-source software and third-party contractors, as long as you own the result",
    "You keep running, growing, and commercializing your business",
  ],
  grant: [
    "A license for the Sponsor / Devpost to display and promote your submission",
    "Submission must be your sole, original work — no other party's rights or IP violated",
    "Repo access for judging: public (licensed), or private shared with testing@devpost.com & judging@hacker.fund",
  ],
};

export const REQUIREMENT_GROUPS: XprizeGroup[] = [
  {
    id: "eligibility",
    label: "Eligibility",
    items: [
      {
        id: "worldwide",
        title: "Open worldwide",
        rule: "The competition is open to entrants worldwide.",
        note: "Assumed met — confirm no entrant is in an excluded/sanctioned region.",
        status: "met",
        counts: true,
      },
      {
        id: "age",
        title: "Individuals at the age of majority",
        rule: "Individual entrants must be at least the age of majority where they reside at time of entry.",
        note: "Met — founding team are adults.",
        status: "met",
        counts: true,
      },
      {
        id: "small-org",
        title: "Individual or small organization (< 25 employees)",
        rule: "Eligible: individuals, or organizations (corp, nonprofit, LLC, partnership) with fewer than 25 employees, organized at time of entry.",
        note: "Met — small founding team.",
        status: "met",
        counts: true,
      },
    ],
  },
  {
    id: "technical",
    label: "Technical requirements",
    items: [
      {
        id: "gemini-api",
        title: "Uses the Gemini API for ≥ 1 LLM call",
        rule: "Projects with LLM functionality must use the Gemini API for at least one LLM call in the deployed application.",
        note: "Met — the science copilot, field-notes analyzer, and talking-avatar brain all call the Gemini API in production.",
        status: "met",
        counts: true,
      },
      {
        id: "google-cloud",
        title: "Uses ≥ 1 Google Cloud product",
        rule: "A project must use at least one product from Google Cloud (Cloud Run, Vertex AI, etc.).",
        note: "Met — the app is deployed on Google Cloud Run.",
        status: "met",
        counts: true,
      },
      {
        id: "working-link",
        title: "Working project link",
        rule: "Provide access to a working project (live site, functioning demo, or test build); include login credentials if it's gated.",
        note: "Met — the app is deployed and reachable; provide guest access or judge test credentials.",
        status: "met",
        counts: true,
      },
    ],
  },
  {
    id: "submission",
    label: "Submission package",
    items: [
      {
        id: "category",
        title: "Select one of the five categories",
        rule: "Choose the single competition category your project competes in.",
        note: "Education & Human Potential is the natural fit — confirm and select at submission.",
        status: "todo",
        counts: true,
      },
      {
        id: "repo",
        title: "Public code repository URL",
        rule: "Submit a repo URL containing all source code; public (with licensing) or private and shared with testing@devpost.com & judging@hacker.fund.",
        note: "Not done — prepare a clean repo and set the right access for judges.",
        status: "todo",
        counts: true,
      },
      {
        id: "description",
        title: "Written project description",
        rule: "A text description of how the project meets the requirements and its relevance to the chosen category.",
        note: "Not yet written.",
        status: "todo",
        counts: true,
      },
      {
        id: "demo-video",
        title: "Demo video (< 3 minutes)",
        rule: "A demonstration video under 3 minutes, uploaded to YouTube, Vimeo, or Youku, in English or subtitled.",
        note: "We have a Launch Film artifact — trim the final cut to < 3:00, ensure English narration/subtitles, and upload.",
        status: "partial",
        counts: true,
      },
    ],
  },
  {
    id: "business",
    label: "Business viability (judged)",
    items: [
      {
        id: "real-users",
        title: "Real, active users",
        rule: "Demonstrate a real, active (ideally paying) user base, with a high-level breakdown of who they are and any testimonials.",
        note: "GAP: the prototype has real auth but no real user base yet — needs genuine users acquired during the build window.",
        status: "atrisk",
        counts: true,
      },
      {
        id: "revenue",
        title: "Verifiable revenue",
        rule: "Generate real revenue, proven with hard evidence: a Stripe dashboard export, corporate bank statement, or documented P&L ledger.",
        note: "GAP: no payments/monetization yet — would need to ship paid plans and actually collect revenue.",
        status: "atrisk",
        counts: true,
      },
      {
        id: "revenue-by-month",
        title: "Revenue broken out by month (May–Aug)",
        rule: "Report revenue for each calendar month of the build period: May, June, July, and August 2026.",
        note: "Blocked until revenue exists; start tracking by month now.",
        status: "todo",
        counts: true,
      },
      {
        id: "costs",
        title: "Total costs disclosed",
        rule: "Report total costs during the hackathon (excluding marketing/acquisition), with a one-sentence description of what they cover.",
        note: "Track hosting, AI API usage, and any contractor costs from now.",
        status: "todo",
        counts: true,
      },
      {
        id: "marketing-spend",
        title: "Marketing & acquisition spend disclosed",
        rule: "Report total marketing and customer-acquisition spend during the build period — must be disclosed even if zero.",
        note: "Track spend (or report $0).",
        status: "todo",
        counts: true,
      },
    ],
  },
  {
    id: "ai-native",
    label: "AI-native operations (judged)",
    items: [
      {
        id: "ai-runs-business",
        title: "AI agents run the business in production",
        rule: "The core product and business workflow must be operated by AI agents making key execution decisions with minimal human intervention — ideally end-to-end (sales, support, fulfillment, billing).",
        note: "GAP: the app uses AI features, but the business itself is not yet run autonomously by AI agents — this is the highest-leverage, hardest-to-fake criterion.",
        status: "atrisk",
        counts: true,
      },
      {
        id: "ai-narrative",
        title: "AI-native written narrative (500–1000 words)",
        rule: "A case study explaining daily human-vs-AI tasks, operational workflows, and the economic opportunities created beyond the founding layer.",
        note: "Not yet written.",
        status: "todo",
        counts: true,
      },
    ],
  },
];

export type ReadinessSummary = {
  score: number; // 0-100
  met: number;
  partial: number;
  open: number; // todo + atrisk
  total: number;
};

export function computeReadiness(groups: XprizeGroup[] = REQUIREMENT_GROUPS): ReadinessSummary {
  const items = groups.flatMap((g) => g.items).filter((i) => i.counts);
  let metWeight = 0;
  let met = 0;
  let partial = 0;
  let open = 0;
  for (const it of items) {
    if (it.status === "met") {
      met += 1;
      metWeight += 1;
    } else if (it.status === "partial") {
      partial += 1;
      metWeight += 0.5;
    } else {
      open += 1;
    }
  }
  const total = items.length;
  const score = total === 0 ? 0 : Math.round((metWeight / total) * 100);
  return { score, met, partial, open, total };
}

export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = new Date(`${iso}T00:00:00`);
  const ms = target.getTime() - from.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
