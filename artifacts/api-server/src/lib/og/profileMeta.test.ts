import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { injectProfileMeta } from "./profileMeta";

const BASE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Humanity's Research Network — Citizen Science</title>
    <meta name="description" content="Learn from the greatest minds in history." />
    <link rel="canonical" href="https://citizen-science.org/" />
    <meta property="og:title" content="Humanity's Research Network — Citizen Science" />
    <meta property="og:description" content="Learn from the greatest minds in history." />
    <meta property="og:url" content="https://citizen-science.org/" />
    <meta property="og:image" content="https://citizen-science.org/opengraph-v2.jpg" />
    <meta property="og:image:secure_url" content="https://citizen-science.org/opengraph-v2.jpg" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Humanity's Research Network" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Humanity's Research Network — Citizen Science" />
    <meta name="twitter:description" content="Learn from the greatest minds in history." />
    <meta name="twitter:image" content="https://citizen-science.org/opengraph-v2.jpg" />
  </head>
</html>`;

const ORIGIN = "https://citizen-science.org";

describe("injectProfileMeta", () => {
  it("injects figure title, description, canonical, and og:url", () => {
    const out = injectProfileMeta(
      BASE_HTML,
      {
        name: "Elon Musk",
        summary: "Entrepreneur and engineer who founded SpaceX and leads Tesla.",
        imageUrl: null,
      },
      ORIGIN,
      "elon-musk",
    );
    expect(out).toContain("<title>Elon Musk — Citizen Science</title>");
    expect(out).toContain(
      'content="Entrepreneur and engineer who founded SpaceX and leads Tesla."',
    );
    expect(out).toContain('href="https://citizen-science.org/directory/elon-musk"');
    expect(out).toContain('content="https://citizen-science.org/directory/elon-musk"');
  });

  it("uses the portrait as og:image and switches X to the summary card", () => {
    const portrait = "https://upload.wikimedia.org/wikipedia/commons/elon.jpg";
    const out = injectProfileMeta(
      BASE_HTML,
      { name: "Elon Musk", summary: "Engineer.", imageUrl: portrait },
      ORIGIN,
      "elon-musk",
    );
    expect(out).toContain(`<meta property="og:image" content="${portrait}" />`);
    expect(out).toContain(
      `<meta property="og:image:secure_url" content="${portrait}" />`,
    );
    expect(out).toContain('<meta name="twitter:card" content="summary" />');
    expect(out).toContain('<meta name="twitter:image"');
    // Fixed 1200×630 dimensions/type must not survive a portrait swap
    expect(out).not.toContain("og:image:width");
    expect(out).not.toContain("og:image:height");
    expect(out).not.toContain("og:image:type");
    expect(out).toContain('content="Portrait of Elon Musk"');
  });

  it("keeps the default card (and large-image layout) when no portrait exists", () => {
    const out = injectProfileMeta(
      BASE_HTML,
      { name: "Ada Lovelace", summary: "First programmer.", imageUrl: null },
      ORIGIN,
      "ada-lovelace",
    );
    expect(out).toContain(
      '<meta property="og:image" content="https://citizen-science.org/opengraph-v2.jpg" />',
    );
    expect(out).toContain('content="1200"');
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it("escapes HTML-sensitive characters in names and summaries", () => {
    const out = injectProfileMeta(
      BASE_HTML,
      {
        name: 'Curie & "Co"',
        summary: 'Won <two> Nobel prizes & said "no".',
        imageUrl: null,
      },
      ORIGIN,
      "curie-co",
    );
    expect(out).not.toContain('content="Curie & "Co" — Citizen Science"');
    expect(out).toContain("Curie &amp; &quot;Co&quot;");
    expect(out).toContain("Won &lt;two&gt; Nobel prizes &amp; said &quot;no&quot;.");
  });

  it("truncates long summaries at a word boundary", () => {
    const long = `${"word ".repeat(80)}tail`;
    const out = injectProfileMeta(
      BASE_HTML,
      { name: "X", summary: long, imageUrl: null },
      ORIGIN,
      "x",
    );
    const descMatch = /<meta name="description" content="([^"]*)"/.exec(out);
    expect(descMatch).toBeTruthy();
    expect(descMatch![1].length).toBeLessThanOrEqual(200);
    expect(descMatch![1]).toMatch(/…$/);
  });

  // Guards against template drift: every tag the injector targets must exist
  // exactly once in the real client index.html, or prod injection silently
  // becomes a no-op.
  it("injects into the real client index.html", () => {
    const realHtml = readFileSync(
      path.resolve(process.cwd(), "../citizen-science/index.html"),
      "utf8",
    );
    const out = injectProfileMeta(
      realHtml,
      {
        name: "Elon Musk",
        summary: "Entrepreneur and engineer.",
        imageUrl: "https://upload.wikimedia.org/elon.jpg",
      },
      ORIGIN,
      "elon-musk",
    );
    expect(out).toContain("<title>Elon Musk — Citizen Science</title>");
    expect(out.match(/property="og:url"/g)).toHaveLength(1);
    expect(out).toContain(
      'property="og:url" content="https://citizen-science.org/directory/elon-musk"',
    );
    expect(out).toContain('name="twitter:card" content="summary"');
    expect(out).toContain('name="twitter:image:alt" content="Portrait of Elon Musk"');
    expect(out).not.toContain("og:image:width");
  });
});
