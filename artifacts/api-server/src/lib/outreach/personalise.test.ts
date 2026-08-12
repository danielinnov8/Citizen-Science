import { describe, expect, it } from "vitest";
import {
  buildDraftEmailHtml,
  buildEmailHtml,
  buildPlainBody,
} from "./personalise";

describe("buildPlainBody", () => {
  it("merges {{name}} and {{opening}} into the template", () => {
    const out = buildPlainBody(
      "Hi Ada, your work on computing inspires us.",
      "{{opening}}\n\n{{name}}, we'd love to have you.\n\n— Daniel",
      { name: "Ada Lovelace" },
    );
    expect(out).toBe(
      "Hi Ada, your work on computing inspires us.\n\nAda Lovelace, we'd love to have you.\n\n— Daniel",
    );
  });
});

describe("buildDraftEmailHtml", () => {
  it("wraps blank-line-separated paragraphs and converts single newlines to <br>", () => {
    const html = buildDraftEmailHtml("First line\nsecond line\n\nNew paragraph");
    expect(html).toContain("<p");
    expect(html).toContain("First line<br>second line");
    // Body paragraphs carry the margin style; the footer paragraph doesn't.
    expect((html.match(/margin:0 0 16px 0;/g) ?? []).length).toBe(2);
    expect(html).toContain("unsubscribe");
  });

  it("matches buildEmailHtml output for the same merged content", () => {
    const template = "{{opening}}\n\nBody for {{name}}.";
    const merged = buildPlainBody("Opening here.", template, { name: "Grace" });
    expect(buildDraftEmailHtml(merged)).toBe(
      buildEmailHtml("Opening here.", template, { name: "Grace" }),
    );
  });
});
