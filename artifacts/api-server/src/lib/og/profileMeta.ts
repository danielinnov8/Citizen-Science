// Per-figure Open Graph / Twitter / canonical injection for /directory/:slug.
//
// Share crawlers (X, iMessage, LinkedIn, Facebook) never execute JavaScript, so
// client-side meta updates are invisible to them — the tags must be present in
// the HTML the server returns. The SPA fallback in app.ts calls this to rewrite
// the static index.html meta with figure-specific values.

export interface ProfileOgData {
  name: string;
  summary: string;
  imageUrl: string | null;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function truncate(value: string, max = 200): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function setMetaContent(html: string, tagPattern: RegExp, value: string): string {
  return html.replace(tagPattern, (tag) =>
    tag.replace(/content="[^"]*"/, `content="${escapeAttr(value)}"`),
  );
}

export function injectProfileMeta(
  html: string,
  profile: ProfileOgData,
  origin: string,
  slug: string,
): string {
  const title = `${profile.name} — Citizen Science`;
  const description = truncate(profile.summary);
  const pageUrl = `${origin}/directory/${slug}`;
  const hasPortrait = Boolean(profile.imageUrl);
  const image = hasPortrait ? profile.imageUrl! : `${origin}/opengraph-v2.jpg`;

  let out = html;

  out = out.replace(/<title>[^]*?<\/title>/, `<title>${escapeText(title)}</title>`);
  out = setMetaContent(out, /<meta name="description"[^>]*>/, description);
  out = out.replace(/<link rel="canonical"[^>]*>/, (tag) =>
    tag.replace(/href="[^"]*"/, `href="${escapeAttr(pageUrl)}"`),
  );

  out = setMetaContent(out, /<meta property="og:title"[^>]*>/, title);
  out = setMetaContent(out, /<meta property="og:description"[^>]*>/, description);
  out = setMetaContent(out, /<meta property="og:url"[^>]*>/, pageUrl);
  out = setMetaContent(out, /<meta property="og:image"[^>]*>/, image);
  out = setMetaContent(out, /<meta property="og:image:secure_url"[^>]*>/, image);
  out = setMetaContent(
    out,
    /<meta property="og:image:alt"[^>]*>/,
    hasPortrait
      ? `Portrait of ${profile.name}`
      : `${profile.name} — Citizen Science`,
  );

  if (hasPortrait) {
    // Portrait aspect ratios are unknown and not 1200×630 — drop the fixed
    // dimensions/type so crawlers read the real image, and use the small
    // square "summary" card on X so faces aren't cropped by the 1.91:1
    // large-image crop.
    out = out.replace(
      /\s*<meta property="og:image:(?:width|height|type)"[^>]*\/>/g,
      "",
    );
    out = setMetaContent(out, /<meta name="twitter:card"[^>]*>/, "summary");
    out = setMetaContent(
      out,
      /<meta name="twitter:image:alt"[^>]*>/,
      `Portrait of ${profile.name}`,
    );
  }

  out = setMetaContent(out, /<meta name="twitter:title"[^>]*>/, title);
  out = setMetaContent(out, /<meta name="twitter:description"[^>]*>/, description);
  out = setMetaContent(out, /<meta name="twitter:image"[^>]*>/, image);

  return out;
}
