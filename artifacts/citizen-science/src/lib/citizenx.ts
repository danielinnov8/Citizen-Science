import { CATEGORIES } from "@/lib/categories";

// The Massive Transformative Purpose that anchors the whole CitizenX program.
export const CITIZENX_MTP = "Democratize discovery — anyone can advance human knowledge.";

export const CITIZENX_TAGLINE =
  "A global, member-run movement turning curious people everywhere into working scientists.";

// Category options reused by the publish-experiment authoring form.
export const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({
  slug: c.slug,
  name: c.name,
}));

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

// Format an ISO timestamp into a friendly event date + time.
export function formatEventDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface CitizenXPillar {
  key: "organize" | "host" | "publish";
  title: string;
  tagline: string;
  description: string;
  cta: string;
  href: string;
}

export const CITIZENX_PILLARS: CitizenXPillar[] = [
  {
    key: "organize",
    title: "Organize",
    tagline: "Start a local chapter",
    description:
      "Bring CitizenX to your city or campus. Build a community of curious minds and coordinate real research where you live.",
    cta: "Apply to organize",
    href: "/citizenx/organize",
  },
  {
    key: "host",
    title: "Host",
    tagline: "Run a discovery event",
    description:
      "Convene people around an experiment, a field study, or a talk. Events are how communities turn curiosity into contribution.",
    cta: "Host an event",
    href: "/citizenx/host",
  },
  {
    key: "publish",
    title: "Publish",
    tagline: "Share your experiment",
    description:
      "Author a shareable, step-by-step experiment under your own name. Inspire others to replicate, remix, and build on your work.",
    cta: "Publish an experiment",
    href: "/citizenx/publish",
  },
];
