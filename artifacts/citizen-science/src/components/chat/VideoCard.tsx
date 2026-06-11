import { Youtube } from "lucide-react";
import type { VerifiedVideo } from "./types";

// Renders a single verified video as a privacy-friendly embedded player.
export function VideoCard({
  video,
  label = "Recommended video",
}: {
  video?: VerifiedVideo;
  label?: string;
}) {
  if (!video) return null;

  return (
    <div className="not-prose mt-3 max-w-md">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
        {label}
      </span>
      <div className="mt-1.5 overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}`}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <div className="flex items-start gap-2 px-3.5 py-2.5">
          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-red-50">
            <Youtube className="h-3.5 w-3.5 text-red-600" />
          </span>
          <div className="min-w-0">
            <span className="block text-sm font-semibold leading-tight text-[#0F172A]">
              {video.title}
            </span>
            <span className="mt-0.5 block truncate text-xs text-[#64748B]">
              {video.channel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
