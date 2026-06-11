import type { WebSource, VerifiedVideo } from "./types";

// Callbacks fired as a streamed chat reply arrives. `onContent` receives the
// full accumulated text each time (not just the delta) so callers can render
// the growing message directly; `onSources` receives the full de-duped list.
export interface StreamChatCallbacks {
  onContent: (accumulated: string) => void;
  onSources: (sources: WebSource[]) => void;
  onVideo: (video: VerifiedVideo) => void;
}

// The terminal outcome of a streamed chat request. Callers switch on `kind` to
// decide what to show — distinct cases for credit/rate limits vs. errors vs. an
// empty reply keep the UI copy at the call site (which differs per surface).
export type StreamOutcome =
  | { kind: "ok"; accumulated: string }
  | { kind: "empty" }
  | { kind: "aborted" }
  | { kind: "limit"; message: string; href: string }
  | { kind: "rate"; message: string }
  | { kind: "stream-error"; message: string; accumulated: string }
  | { kind: "network-error" };

// POST a chat request and parse the SSE stream, invoking callbacks as content,
// sources, and a verified video arrive. Handles the 402 (out of credits) and
// 429 (rate limit) responses and aborts gracefully. Never throws — every
// failure is mapped to a `StreamOutcome`.
export async function streamChatRequest(
  url: string,
  body: unknown,
  signal: AbortSignal,
  cb: StreamChatCallbacks,
): Promise<StreamOutcome> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") return { kind: "aborted" };
    return { kind: "network-error" };
  }

  if (res.status === 402) {
    let data: { error?: string; isGuest?: boolean; upgradeHref?: string } = {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    return {
      kind: "limit",
      message:
        data.error ||
        "You're out of credits. Top up or upgrade your plan to keep going.",
      href: data.upgradeHref || (data.isGuest ? "/login" : "/pricing"),
    };
  }

  if (res.status === 429) {
    let data: { error?: string; limitReached?: boolean; upgradeHref?: string } =
      {};
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    if (data.limitReached) {
      return {
        kind: "limit",
        message:
          data.error ||
          "You've reached today's free limit. Upgrade for unlimited access.",
        href: data.upgradeHref || "/pricing",
      };
    }
    return {
      kind: "rate",
      message:
        data.error || "Too many requests. Please slow down and try again shortly.",
    };
  }

  if (!res.ok || !res.body) {
    if (signal.aborted) return { kind: "aborted" };
    return { kind: "network-error" };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  let sources: WebSource[] = [];
  let streamError: string | null = null;

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        try {
          const payload = JSON.parse(dataLine.slice(5).trim()) as {
            content?: string;
            sources?: WebSource[];
            video?: VerifiedVideo;
            done?: boolean;
            error?: string;
          };
          if (payload.error) {
            streamError = payload.error;
          }
          if (payload.content) {
            accumulated += payload.content;
            cb.onContent(accumulated);
          }
          if (Array.isArray(payload.sources) && payload.sources.length > 0) {
            const merged = [...sources];
            const seen = new Set(merged.map((s) => s.url));
            for (const s of payload.sources) {
              if (s && typeof s.url === "string" && !seen.has(s.url)) {
                seen.add(s.url);
                merged.push({ title: s.title || s.url, url: s.url });
              }
            }
            sources = merged;
            cb.onSources(sources);
          }
          if (
            payload.video &&
            typeof payload.video.id === "string" &&
            payload.video.id
          ) {
            cb.onVideo(payload.video);
          }
          if (payload.done) {
            break;
          }
        } catch {
          /* skip malformed */
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") return { kind: "aborted" };
    if (accumulated) return { kind: "ok", accumulated };
    return { kind: "network-error" };
  }

  if (streamError) return { kind: "stream-error", message: streamError, accumulated };
  if (!accumulated) return { kind: "empty" };
  return { kind: "ok", accumulated };
}
