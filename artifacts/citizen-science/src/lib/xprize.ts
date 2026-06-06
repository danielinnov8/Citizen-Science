// Future Vision XPRIZE — readiness data.
//
// Source: official competition rules at https://futurevisionxprize.com/rules
// (Peter Diamandis / XPRIZE Foundation / Google / Range). This drives the
// dev-only /xprize readiness dashboard. Statuses reflect this project's current
// state and are intentionally honest — most submission materials are not yet
// produced, so the score is meant to show what's left, not to flatter.

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
  name: "Future Vision XPRIZE",
  tagline: "World's largest film competition — a hopeful, technology-forward vision of humanity's future",
  organizers: "Peter Diamandis · XPRIZE Foundation · Google · Range",
  prizePool: "$3.5M+",
  grandPrize: "$2.5M production funding + $100k cash",
  rulesUrl: "https://futurevisionxprize.com/rules",
  siteUrl: "https://futurevisionxprize.com/",
  hashtag: "#FutureVisionXPRIZE",
} as const;

export interface KeyDate {
  label: string;
  iso: string; // YYYY-MM-DD
  note: string;
}

export const KEY_DATES: KeyDate[] = [
  { label: "Submission deadline", iso: "2026-08-15", note: "Video + treatment + cover sheet due." },
  { label: "Finalist script draft", iso: "2026-09-10", note: "Top 10 finalists develop a first-draft script." },
  { label: "Winner announcement", iso: "2026-09-25", note: "Moonshot Gathering, in person in Los Angeles." },
];

// Judging dimensions (informational — not scored on this dashboard).
export const EVALUATION_CRITERIA: { title: string; detail: string }[] = [
  {
    title: "Concept quality & execution",
    detail: "Is the story compelling and well-realized within production constraints?",
  },
  {
    title: "Scale & ambition",
    detail: "Does the vision think big enough about humanity's future?",
  },
  {
    title: "Mission alignment",
    detail: "Does it genuinely portray a technology-enabled future where everyone can thrive?",
  },
  {
    title: "Technology-forward storytelling",
    detail: "Is advanced technology meaningfully integrated into the narrative?",
  },
];

export const RIGHTS = {
  keep: [
    "Full ownership of your original work",
    "Control of your YouTube channel",
    "Right to promote your work",
  ],
  grant: [
    "Range exclusivity from submission through Sep 25, 2026",
    "First right of development for Range during the competition",
    "Competition may feature your work in official playlists / promotion",
    "Google producing credit(s) if selected for feature development (terms negotiated in good faith)",
  ],
};

export const REQUIREMENT_GROUPS: XprizeGroup[] = [
  {
    id: "eligibility",
    label: "Eligibility",
    items: [
      {
        id: "worldwide",
        title: "Open worldwide (no sanctioned regions)",
        rule: "Open globally except US-embargoed regions: Crimea, Cuba, Iran, North Korea, Syria.",
        note: "Assumed met — confirm no team member resides in a sanctioned region.",
        status: "met",
        counts: true,
      },
      {
        id: "age",
        title: "Participants 18+ to claim prize money",
        rule: "Must be 18+ to receive prizes; minors may enter with guardian consent and support.",
        note: "Confirm everyone who would receive prize money is 18+.",
        status: "todo",
        counts: true,
      },
      {
        id: "no-conflicts",
        title: "No conflicting exclusivity deals",
        rule: "Participants must not have exclusive / first-look deals that preclude participation.",
        note: "Confirm no existing studio/first-look commitments on this concept.",
        status: "todo",
        counts: true,
      },
      {
        id: "no-experience",
        title: "No professional experience required",
        rule: "Fresh voices welcome regardless of filmmaking background.",
        note: "No barrier — informational.",
        status: "met",
        counts: false,
      },
    ],
  },
  {
    id: "registration",
    label: "Registration",
    items: [
      {
        id: "register",
        title: "Register on the official competition site",
        rule: "Complete registration (contact, background, initial project info) to enter.",
        note: "Not done yet — this is the gating first step and unlocks the rest.",
        status: "todo",
        counts: true,
      },
      {
        id: "sponsor-trailer",
        title: "Obtain the 15-sec sponsor trailer",
        rule: "After registering, you receive a required 15s sponsor trailer to append to the video.",
        note: "Blocked until registration is complete.",
        status: "todo",
        counts: true,
      },
    ],
  },
  {
    id: "video",
    label: "Video submission",
    items: [
      {
        id: "length",
        title: "≤ 3 minutes (+ 15s sponsor trailer)",
        rule: "Max 3:00 of content, plus the appended 15-second sponsor trailer.",
        note: "We have a Launch Film artifact — verify the final cut is ≤ 3:00 before export.",
        status: "partial",
        counts: true,
      },
      {
        id: "type",
        title: "Trailer or short film",
        rule: "Acceptable formats: trailer or short film; any approach (live action, animation, AI, hybrid).",
        note: "Our cinematic launch film fits this format.",
        status: "met",
        counts: true,
      },
      {
        id: "format",
        title: "MP4 / MOV, 1080p minimum",
        rule: "Technical format must be MP4 or MOV at ≥1080p resolution.",
        note: "Currently a browser-rendered React/Framer video — must be EXPORTED to MP4/MOV ≥1080p.",
        status: "todo",
        counts: true,
      },
      {
        id: "general-audience",
        title: "General-audience appropriate",
        rule: "No explicit violence, language, or sexual content.",
        note: "Content is wholesome / science-positive — met.",
        status: "met",
        counts: true,
      },
      {
        id: "english",
        title: "English voiced or subtitled",
        rule: "All submissions must be voiced or subtitled in English.",
        note: "Confirm the film has English VO or subtitles before export.",
        status: "todo",
        counts: true,
      },
      {
        id: "original",
        title: "100% original — no copyrighted/brand material",
        rule: "All content original. No copyrighted characters/worlds/storylines, no recognizable brands/IP without permission, licensed stock only.",
        note: "RISK: the web app uses real people's portraits & names (Einstein, Turing, etc.) and device brand names (Apple Watch, Fitbit…). Ensure NONE of these appear in the FILM unless cleared, and that all music/footage is original or licensed.",
        status: "atrisk",
        counts: true,
      },
      {
        id: "endcard",
        title: "Append the sponsor end card",
        rule: "Videos must include the provided 15s sponsor end card (XPRIZE, PHD Ventures, Google, Range).",
        note: "Add the official end card once received via registration.",
        status: "todo",
        counts: true,
      },
    ],
  },
  {
    id: "written",
    label: "Written materials",
    items: [
      {
        id: "treatment",
        title: "Treatment (up to 12 pages)",
        rule: "Every submission needs a treatment of no more than 12 pages.",
        note: "Not yet written.",
        status: "todo",
        counts: true,
      },
      {
        id: "coversheet",
        title: "1-page cover sheet",
        rule: "Logline (1 sentence) + Synopsis (≤300 words) + Personal Statement (≤300 words).",
        note: "Not yet written.",
        status: "todo",
        counts: true,
      },
      {
        id: "written-english",
        title: "Written materials in English",
        rule: "All written submissions must be in English.",
        note: "Trivially satisfiable once materials are drafted — informational.",
        status: "na",
        counts: false,
      },
    ],
  },
  {
    id: "youtube",
    label: "YouTube & distribution",
    items: [
      {
        id: "unlisted",
        title: "Submit via unlisted YouTube link",
        rule: "Publish as an unlisted YouTube video and submit the link through the competition site.",
        note: "Do this at submission time (after export + sponsor card).",
        status: "todo",
        counts: true,
      },
      {
        id: "hashtag",
        title: "Include #FutureVisionXPRIZE",
        rule: "The hashtag must appear in the video title or description.",
        note: "Add to title/description when publishing.",
        status: "todo",
        counts: true,
      },
      {
        id: "desc",
        title: "Link competition site + tag partners",
        rule: "Description must link the official site and should tag competition partners.",
        note: "Add to description when publishing.",
        status: "todo",
        counts: true,
      },
      {
        id: "public",
        title: "Go public after content review",
        rule: "After review, publish on your own channel with public visibility.",
        note: "Later step — happens after the competition reviews your unlisted submission.",
        status: "na",
        counts: false,
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
