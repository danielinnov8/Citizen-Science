import { Beaker, ChevronDown, ListChecks, Wrench } from "lucide-react";
import type { ProfileNobelPrize } from "@workspace/api-client-react";
import {
  buildNobelFootsteps,
  stripMotivationHtml,
} from "@/lib/nobelFootsteps";

/**
 * "Follow in Their Footsteps" for Nobel laureates: a set of safe, hands-on
 * activities derived from the laureate's actual prize category and motivation
 * (see `nobelFootsteps.ts`). Each card expands to reveal materials and steps.
 *
 * Renders nothing when the profile has no prizes, so it is safe to drop into
 * any profile layout. `accent` lets the cinematic story layouts tint it to the
 * figure's theme; the standard profile layout uses the default green.
 */
export function NobelFootsteps({
  name,
  prizes,
  accent = "#16A34A",
  variant = "standard",
  className = "",
}: {
  name: string;
  prizes: ProfileNobelPrize[] | undefined | null;
  accent?: string;
  /** `cinematic` matches the large serif headings of the story layout. */
  variant?: "standard" | "cinematic";
  className?: string;
}) {
  const footsteps = buildNobelFootsteps(name, prizes);
  if (footsteps.length === 0 || !prizes || prizes.length === 0) return null;

  const lead = prizes[0];
  const motivation = stripMotivationHtml(lead.motivation || "");

  const cinematic = variant === "cinematic";
  const titleClassName = cinematic
    ? "flex items-center gap-3 font-serif text-3xl sm:text-4xl tracking-tight mb-4"
    : "flex items-center gap-2 text-xl font-bold tracking-tight mb-2";
  const iconClassName = cinematic ? "h-7 w-7" : "h-5 w-5";
  const introClassName = cinematic
    ? "text-base text-[#475569] leading-relaxed mb-8 max-w-2xl"
    : "text-sm text-[#64748B] leading-relaxed mb-4";

  return (
    <section className={className}>
      <h2 className={titleClassName}>
        <Beaker className={iconClassName} style={{ color: accent }} />
        Follow in Their Footsteps
      </h2>
      <p className={introClassName}>
        Hands-on activities inspired by {name}&rsquo;s {lead.awardYear} Nobel
        Prize in {lead.category}
        {motivation ? <> — {motivation}.</> : "."}
      </p>
      <div className="space-y-3">
        {footsteps.map((f) => (
          <details
            key={f.id}
            className="group rounded-xl border border-[#E2E8F0] bg-white open:shadow-sm transition-shadow"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="font-semibold text-[#0F172A]">{f.title}</div>
                <div className="mt-0.5 text-xs text-[#94A3B8]">
                  {f.difficulty} · {f.estimatedTime}
                </div>
                <p className="mt-2 text-sm text-[#475569] leading-relaxed">
                  {f.hook}
                </p>
              </div>
              <ChevronDown
                className="mt-1 h-5 w-5 flex-shrink-0 text-[#94A3B8] transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="space-y-4 border-t border-[#F1F5F9] px-4 pb-4 pt-4">
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#64748B]">
                  <Wrench className="h-3.5 w-3.5" />
                  What you&rsquo;ll need
                </h3>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {f.materials.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#334155]"
                    >
                      <span
                        className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ background: accent }}
                      />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#64748B]">
                  <ListChecks className="h-3.5 w-3.5" />
                  Steps
                </h3>
                <ol className="space-y-2">
                  {f.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-[#334155]">
                      <span
                        className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{ background: `${accent}1f`, color: accent }}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
