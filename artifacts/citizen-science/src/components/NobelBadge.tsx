import { Award } from "lucide-react";
import type { ProfileNobelPrize } from "@workspace/api-client-react";

/**
 * Visual marker for Nobel laureates. Renders nothing when the profile has no
 * Nobel prizes, so it is safe to drop into any profile surface.
 *
 * Variants:
 *  - "pill"  — compact amber pill (cards, hero overlays)
 *  - "chip"  — same pill but smaller, for tight card corners
 *  - "detail" — pill plus a list of each prize (category + year) for headers
 */
export function NobelBadge({
  prizes,
  variant = "pill",
  className = "",
}: {
  prizes: ProfileNobelPrize[] | undefined | null;
  variant?: "pill" | "chip" | "detail";
  className?: string;
}) {
  if (!prizes || prizes.length === 0) return null;

  const isChip = variant === "chip";
  const pill = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 font-semibold text-amber-800 ${
        isChip ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Award className={isChip ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Nobel Laureate
    </span>
  );

  if (variant !== "detail") {
    return <span className={className}>{pill}</span>;
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {pill}
      <ul className="flex flex-wrap gap-1.5">
        {prizes.map((p, i) => (
          <li
            key={`${p.categoryCode}-${p.awardYear}-${i}`}
            className="inline-flex items-center gap-1 rounded-md bg-amber-50/70 px-2 py-0.5 text-xs text-amber-800 ring-1 ring-amber-200"
          >
            <span className="font-medium">{p.category}</span>
            <span className="text-amber-600">{p.awardYear}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
