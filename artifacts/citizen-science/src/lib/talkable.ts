import { useQuery } from "@tanstack/react-query";

// Front-end registry of which great-minds figures support the live "Talk to …"
// avatar experience. This is only a UI hint for labeling/showing the button
// without a round trip — the server is always the source of truth for whether a
// figure is actually talkable and whether the feature is configured (see the
// /api/avatar/figures/:slug capability endpoint below).
export interface TalkableFigure {
  slug: string;
  firstName: string;
}

const TALKABLE: Record<string, TalkableFigure> = {
  "albert-einstein": { slug: "albert-einstein", firstName: "Albert" },
};

export function getTalkableFigure(slug: string): TalkableFigure | undefined {
  return TALKABLE[slug];
}

// Mirrors the avatar provider catalog returned by the API.
export type AvatarProviderStatus = "available" | "coming_soon";
export interface AvatarProviderInfo {
  id: string;
  label: string;
  status: AvatarProviderStatus;
  configured: boolean;
}

// Server response for GET /api/avatar/figures/:slug.
export interface AvatarFigureCapability {
  slug: string;
  talkable: boolean;
  available: boolean;
  name?: string;
  firstName?: string;
  reason?: string;
  providers: AvatarProviderInfo[];
}

async function fetchFigureCapability(slug: string): Promise<AvatarFigureCapability> {
  const res = await fetch(`/api/avatar/figures/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    throw new Error(`Failed to load avatar capability (${res.status})`);
  }
  return (await res.json()) as AvatarFigureCapability;
}

// Public capability check used by the profile page to decide whether to render
// the "Talk to {firstName}" button (and whether it should be enabled).
export function useAvatarFigure(slug: string | undefined) {
  return useQuery({
    queryKey: ["avatar-figure", slug],
    queryFn: () => fetchFigureCapability(slug as string),
    enabled: !!slug,
    staleTime: 60_000,
    retry: false,
  });
}
