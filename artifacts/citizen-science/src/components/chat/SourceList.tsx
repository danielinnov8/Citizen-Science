import { ExternalLink } from "lucide-react";
import type { WebSource } from "./types";

// Renders the numbered list of web-search grounding citations below a reply.
export function SourceList({ sources }: { sources?: WebSource[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="not-prose mt-3 flex flex-col gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
        Sources
      </span>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <a
            key={`${s.url}-${i}`}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title}
            className="group inline-flex items-center gap-1.5 max-w-[260px] rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded bg-blue-50 text-[9px] font-semibold text-blue-600">
              {i + 1}
            </span>
            <span className="truncate text-xs text-[#334155]">{s.title}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0 text-[#94A3B8] group-hover:text-blue-600 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
