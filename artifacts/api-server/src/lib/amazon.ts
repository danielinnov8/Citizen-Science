// Amazon Associates auto-tagging. Any amazon.com link the copilot produces —
// in its reply text or in cited web sources — gets our associate tag appended
// so qualifying purchases are credited to us.

// ── MASTER AMAZON ASSOCIATES TAG (single config value) ──────────────────────
// To change the storefront tag, edit this one line.
export const AMAZON_ASSOCIATE_TAG = "citizenscie00-20";

// Matches amazon.com plus subdomains (www., smile.) and regional TLDs
// (amazon.co.uk, amazon.ca, amazon.de, ...).
const AMAZON_HOST_RE = /(^|\.)amazon\.[a-z]{2,3}(\.[a-z]{2})?$/i;

/**
 * Append our associate tag to an Amazon URL, replacing any existing `tag`
 * param and leaving every other query param intact. Non-Amazon or unparseable
 * URLs are returned unchanged.
 */
export function tagAmazonUrl(rawUrl: string): string {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return rawUrl;
  }
  if (!AMAZON_HOST_RE.test(url.hostname)) return rawUrl;
  url.searchParams.set("tag", AMAZON_ASSOCIATE_TAG);
  return url.toString();
}

// Find http(s) URLs in free text. Trailing sentence punctuation is handled by
// the caller so it isn't swallowed into the link.
const URL_RE = /https?:\/\/[^\s<>"'`]+/gi;

/**
 * Rewrite every Amazon URL found in a block of text, tagging it with our
 * associate tag. Trailing punctuation (e.g. a period or closing paren) is
 * preserved outside the link.
 */
export function tagAmazonUrlsInText(text: string): string {
  return text.replace(URL_RE, (match) => {
    const trailing = match.match(/[).,;:!?\]]+$/)?.[0] ?? "";
    const core = trailing ? match.slice(0, -trailing.length) : match;
    return tagAmazonUrl(core) + trailing;
  });
}

/**
 * Streaming-safe Amazon tagger. Text arrives in arbitrary chunks, so a URL can
 * be split across chunk boundaries. This buffers the trailing run of
 * non-whitespace characters (a potential in-progress URL) and only emits text
 * up to the last whitespace, tagging any complete URLs in the emitted span.
 * Call flush() once the stream ends to release the final buffered word.
 */
export class AmazonTagger {
  private buffer = "";

  push(text: string): string {
    this.buffer += text;
    const lastWs = Math.max(
      this.buffer.lastIndexOf(" "),
      this.buffer.lastIndexOf("\n"),
      this.buffer.lastIndexOf("\t"),
    );
    if (lastWs === -1) return ""; // whole buffer may still be an unfinished URL
    const emit = this.buffer.slice(0, lastWs + 1);
    this.buffer = this.buffer.slice(lastWs + 1);
    return tagAmazonUrlsInText(emit);
  }

  flush(): string {
    const out = tagAmazonUrlsInText(this.buffer);
    this.buffer = "";
    return out;
  }
}
