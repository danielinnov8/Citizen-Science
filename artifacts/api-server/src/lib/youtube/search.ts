import { TRUSTED_CHANNELS, isTrustedChannel } from "./allowlist";

// A candidate video resolved from the YouTube Data API, already restricted to
// the trusted-channel allowlist.
export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  description: string;
}

export function isYouTubeConfigured(): boolean {
  return !!process.env.YOUTUBE_API_KEY;
}

interface SearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelId?: string;
    channelTitle?: string;
  };
}

interface SearchResponse {
  items?: SearchItem[];
}

const API_BASE = "https://www.googleapis.com/youtube/v3/search";

// Search YouTube for a topic and return candidate videos restricted to the
// trusted-channel allowlist. Returns an empty array (never throws) when the
// API key is missing, the request fails, or nothing matches — so the chat
// reply degrades gracefully and is never blocked on video lookup.
export async function searchTrustedVideos(
  topic: string,
  options: { signal?: AbortSignal; maxResults?: number } = {},
): Promise<YouTubeVideo[]> {
  const query = topic.trim();
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!query || !apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    // Embeddable + safe-search, ordered by relevance. Pull a wider net so the
    // allowlist filter still leaves a few candidates to score.
    videoEmbeddable: "true",
    safeSearch: "strict",
    order: "relevance",
    maxResults: String(options.maxResults ?? 25),
    q: query.slice(0, 200),
  });

  let res: globalThis.Response;
  try {
    res = await fetch(`${API_BASE}?${params.toString()}`, {
      signal: options.signal,
    });
  } catch {
    return [];
  }

  if (!res.ok) {
    return [];
  }

  let data: SearchResponse;
  try {
    data = (await res.json()) as SearchResponse;
  } catch {
    return [];
  }

  const seen = new Set<string>();
  const videos: YouTubeVideo[] = [];
  for (const item of data.items ?? []) {
    const id = item.id?.videoId;
    const channelId = item.snippet?.channelId;
    if (!id || seen.has(id) || !isTrustedChannel(channelId)) {
      continue;
    }
    seen.add(id);
    videos.push({
      id,
      title: item.snippet?.title ?? "",
      channelId: channelId as string,
      channelTitle: item.snippet?.channelTitle ?? "",
      description: item.snippet?.description ?? "",
    });
  }

  return videos;
}

// Re-export for callers that want to display/inspect the allowlist.
export { TRUSTED_CHANNELS };
