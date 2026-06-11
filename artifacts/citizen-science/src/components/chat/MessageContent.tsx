import { useMemo } from "react";
import { Link } from "wouter";
import { ChevronRight, ExternalLink, FlaskConical, Tag, UserRound } from "lucide-react";
import { useListFeaturedProfiles } from "@workspace/api-client-react";
import { CATEGORIES } from "@/lib/categories";
import { LABS, labUrl } from "@/lib/labs";
import { PARTNERS, partnerUrl } from "@/lib/partners";

// Match any bracketed token [[ ... ]] (inner text may not contain brackets).
// Both the fully-qualified [[kind:slug]] form and the bare [[slug]] form the
// model frequently emits are captured here; the actual kind is resolved below.
const TOKEN_REGEX = /\[\[([^[\]]+?)\]\]/g;

type CardKind = "module" | "lab" | "partner" | "scientist";

const CARD_KINDS: readonly CardKind[] = ["module", "lab", "partner", "scientist"];

const MODULE_SLUGS = new Set(CATEGORIES.map((c) => c.slug));
const LAB_SLUGS = new Set(LABS.map((l) => l.slug));
const PARTNER_SLUGS = new Set(PARTNERS.map((p) => p.slug));

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

// Resolve a bare slug to a card kind using a fixed precedence order
// (module → lab → partner → scientist) so resolution is deterministic.
function resolveBareKind(
  slug: string,
  scientistSlugs: Set<string>,
): CardKind | null {
  if (MODULE_SLUGS.has(slug)) return "module";
  if (LAB_SLUGS.has(slug)) return "lab";
  if (PARTNER_SLUGS.has(slug)) return "partner";
  if (scientistSlugs.has(slug)) return "scientist";
  return null;
}

// When a token can't be resolved to a card, we must NEVER show the raw
// "[[ ... ]]" brackets to the user. Strip them to clean, readable text — and
// drop the hidden video marker entirely if it ever slips past the server-side
// stripper. This guarantees no bracketed token can ever leak into the chat,
// regardless of what the model emits or whether the user is signed in.
function unresolvedTokenText(inner: string): string {
  const body = inner.trim();
  if (/^video\?:/i.test(body)) return "";
  return body
    .replace(/^[a-z]+\??:/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

// Hide an in-progress token fragment at the end of a streaming/aborted reply.
// Complete tokens are already consumed by TOKEN_REGEX, so any remaining "[["
// without a closing "]]" after it is a partial marker still arriving — drop it
// (rather than briefly flashing raw brackets) until the rest streams in.
function stripDanglingMarker(text: string): string {
  const open = text.lastIndexOf("[[");
  if (open === -1) return text;
  if (text.indexOf("]]", open) === -1) return text.slice(0, open);
  return text;
}

function ModuleCard({ slug }: { slug: string }) {
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
        {slug}
      </span>
    );
  }

  return (
    <Link
      href={`/category/${category.slug}`}
      className="not-prose inline-flex items-center mx-0.5 group rounded-md border border-[#E2E8F0] bg-white hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden align-middle leading-none"
    >
      <span className="self-stretch w-1 bg-gradient-to-b from-blue-500 to-violet-500" />
      <span className="inline-flex items-center gap-1 px-2 py-0 leading-none">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
          Module
        </span>
        <span className="text-sm font-semibold text-[#0F172A]">{category.name}</span>
        <ChevronRight className="h-3 w-3 text-[#94A3B8] group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

function LabCard({ slug }: { slug: string }) {
  const lab = LABS.find((l) => l.slug === slug);
  if (!lab) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
        {slug}
      </span>
    );
  }

  return (
    <a
      href={labUrl(lab)}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose flex flex-col my-2 mr-1.5 group rounded-xl border border-[#E2E8F0] bg-white hover:border-emerald-300 hover:shadow-md transition-all overflow-hidden max-w-md"
    >
      <span className="flex items-stretch">
        <span className="flex items-center justify-center w-1.5 bg-gradient-to-b from-emerald-500 to-blue-500" />
        <span className="flex-1 px-3.5 py-2.5">
          <span className="flex items-center justify-between gap-2 mb-0.5">
            <span className="flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Lab · {lab.tier}
              </span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-emerald-600 transition-colors" />
          </span>
          <span className="block text-sm font-semibold text-[#0F172A] leading-tight">
            {lab.name}
          </span>
          <span className="block text-xs text-[#64748B] leading-snug mt-1">
            {lab.summary}
          </span>
        </span>
      </span>
    </a>
  );
}

function PartnerCard({ slug }: { slug: string }) {
  const partner = PARTNERS.find((p) => p.slug === slug);
  if (!partner) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
        {slug}
      </span>
    );
  }

  return (
    <a
      href={partnerUrl(partner)}
      target="_blank"
      rel="noopener noreferrer"
      className="not-prose flex flex-col my-2 mr-1.5 group rounded-xl border border-[#E2E8F0] bg-white hover:border-violet-300 hover:shadow-md transition-all overflow-hidden max-w-md"
    >
      <span className="flex items-stretch">
        <span className="flex items-center justify-center w-1.5 bg-gradient-to-b from-violet-500 to-blue-500" />
        <span className="flex-1 px-3.5 py-2.5">
          <span className="flex items-center justify-between gap-2 mb-0.5">
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                Partner
              </span>
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-violet-600 transition-colors" />
          </span>
          <span className="block text-sm font-semibold text-[#0F172A] leading-tight">
            {partner.name}
          </span>
          <span className="block text-xs text-[#64748B] leading-snug mt-1">
            {partner.summary}
          </span>
        </span>
      </span>
    </a>
  );
}

function ScientistCard({ slug }: { slug: string }) {
  const { data: profiles } = useListFeaturedProfiles();
  const profile = profiles?.find((p) => p.slug === slug);
  if (!profile) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
        {slug}
      </span>
    );
  }

  return (
    <Link
      href={`/directory/${profile.slug}`}
      className="not-prose inline-flex items-center mx-0.5 group rounded-md border border-[#E2E8F0] bg-white hover:border-violet-300 hover:shadow-sm transition-all overflow-hidden align-middle leading-none"
    >
      <span className="self-stretch w-1 bg-gradient-to-b from-violet-500 to-blue-500" />
      <span className="inline-flex items-center gap-1 px-2 py-0 leading-none">
        <UserRound className="h-3 w-3 text-violet-600" />
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
          Scientist
        </span>
        <span className="text-sm font-semibold text-[#0F172A]">{profile.name}</span>
        <span className="text-xs text-[#64748B]">· {profile.field}</span>
        <ChevronRight className="h-3 w-3 text-[#94A3B8] group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

type ContentPart =
  | { type: "text"; value: string }
  | { type: "module"; slug: string }
  | { type: "lab"; slug: string }
  | { type: "partner"; slug: string }
  | { type: "scientist"; slug: string };

// Renders an assistant reply, turning inline [[kind:slug]] tokens into clickable
// cards and guaranteeing no raw bracket token ever leaks to the user.
export function MessageContent({ content }: { content: string }) {
  const { data: profiles } = useListFeaturedProfiles();
  const scientistSlugs = useMemo(
    () => new Set((profiles ?? []).map((p) => p.slug)),
    [profiles],
  );

  const parts = useMemo<ContentPart[]>(() => {
    const out: ContentPart[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(TOKEN_REGEX.source, "g");
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        out.push({ type: "text", value: content.slice(lastIndex, match.index) });
      }

      const inner = match[1];
      const colon = inner.indexOf(":");

      let resolved: CardKind | null = null;
      let slug = "";

      if (colon !== -1) {
        // Fully-qualified [[kind:slug]] — trust an explicit, valid prefix.
        const prefix = inner.slice(0, colon).trim().toLowerCase() as CardKind;
        if ((CARD_KINDS as readonly string[]).includes(prefix)) {
          resolved = prefix;
          slug = normalizeSlug(inner.slice(colon + 1));
        }
      } else {
        // Bare [[slug]] — resolve the kind by looking the slug up in the
        // app's catalogs in a fixed precedence order.
        slug = normalizeSlug(inner);
        resolved = resolveBareKind(slug, scientistSlugs);
      }

      if (resolved && slug) {
        out.push({ type: resolved, slug });
      } else {
        // Could not resolve to a card. Never leak the raw "[[ ... ]]" brackets
        // to the user — strip them to clean text (and drop the hidden video
        // marker if it ever slips past the server-side stripper).
        const fallback = unresolvedTokenText(inner);
        if (fallback) out.push({ type: "text", value: fallback });
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      const tail = stripDanglingMarker(content.slice(lastIndex));
      if (tail) out.push({ type: "text", value: tail });
    }
    return out;
  }, [content, scientistSlugs]);

  return (
    <div className="text-[15px] leading-relaxed text-[#0F172A] whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.type === "module") return <ModuleCard key={i} slug={part.slug} />;
        if (part.type === "lab") return <LabCard key={i} slug={part.slug} />;
        if (part.type === "partner") return <PartnerCard key={i} slug={part.slug} />;
        if (part.type === "scientist") return <ScientistCard key={i} slug={part.slug} />;
        return <span key={i}>{part.value}</span>;
      })}
    </div>
  );
}
