import { TRUSTED_CHANNELS, isTrustedChannel } from "./allowlist";

// A candidate video resolved from the YouTube Data API.
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

// Run a raw YouTube Data API search and return de-duplicated candidate videos
// (no channel filtering). Returns an empty array (never throws) when the API
// key is missing, the request fails, or nothing matches — so callers degrade
// gracefully and are never blocked on a video lookup.
async function searchYouTube(
  query: string,
  options: { signal?: AbortSignal; maxResults?: number } = {},
): Promise<YouTubeVideo[]> {
  const q = query.trim();
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!q || !apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    // Embeddable + safe-search, ordered by relevance.
    videoEmbeddable: "true",
    safeSearch: "strict",
    order: "relevance",
    maxResults: String(options.maxResults ?? 25),
    q: q.slice(0, 200),
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
    if (!id || !channelId || seen.has(id)) {
      continue;
    }
    seen.add(id);
    videos.push({
      id,
      title: item.snippet?.title ?? "",
      channelId,
      channelTitle: item.snippet?.channelTitle ?? "",
      description: item.snippet?.description ?? "",
    });
  }

  return videos;
}

// Search YouTube for a topic, restricted to the trusted-channel allowlist. Used
// by the science copilot so a surfaced explainer always comes from a reputable
// science/education channel.
export async function searchTrustedVideos(
  topic: string,
  options: { signal?: AbortSignal; maxResults?: number } = {},
): Promise<YouTubeVideo[]> {
  const all = await searchYouTube(topic, options);
  return all.filter((v) => isTrustedChannel(v.channelId));
}

// The distinctive surname token of a figure's name, used to coarse-filter
// candidate titles. Drops common honorifics and short particles so e.g.
// "Sir Tim Berners-Lee" → "berners-lee" and "Jane Goodall" → "goodall".
const NAME_STOPWORDS = new Set([
  "dr",
  "dr.",
  "prof",
  "prof.",
  "professor",
  "sir",
  "dame",
  "mr",
  "mr.",
  "mrs",
  "ms",
  "the",
]);

function figureNameTokens(figureName: string): string[] {
  return figureName
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !NAME_STOPWORDS.has(t));
}

// True when a candidate video title plausibly refers to the figure — it must
// contain the figure's surname token. Titles are the most reliable signal;
// descriptions are routinely keyword-stuffed, so they're not trusted here.
function titleMentionsFigure(title: string, nameTokens: string[]): boolean {
  if (nameTokens.length === 0) return false;
  const haystack = title.toLowerCase();
  const surname = nameTokens[nameTokens.length - 1];
  return haystack.includes(surname);
}

// Search YouTube for a genuine interview/talk/lecture that features a specific
// figure. Unlike `searchTrustedVideos` this is NOT restricted to the science
// allowlist (the figure's own talks live on many channels), so the bar is held
// by (a) a strict query, (b) a surname-in-title pre-filter, and (c) the caller's
// downstream Gemini relevance gate. Returns [] (never throws) on any failure.
export async function searchFigureInterviews(
  figureName: string,
  topic: string,
  options: { signal?: AbortSignal; maxResults?: number } = {},
): Promise<YouTubeVideo[]> {
  const name = figureName.trim();
  if (!name) return [];

  const cleanTopic = topic.trim();
  const query = cleanTopic
    ? `${name} interview talk ${cleanTopic}`
    : `${name} interview talk lecture`;

  const all = await searchYouTube(query, options);
  const nameTokens = figureNameTokens(name);
  return all.filter((v) => titleMentionsFigure(v.title, nameTokens));
}

// Re-export for callers that want to display/inspect the allowlist.
export { TRUSTED_CHANNELS };
