import { afterEach, describe, expect, it } from "vitest";
import {
  buildDraftEmailHtml,
  buildEmailHtml,
  buildPlainBody,
  normalizeReason,
  profileUrl,
} from "./personalise";

describe("buildPlainBody", () => {
  it("is a short invite: personalised because-clause, profile link, social proof", () => {
    const out = buildPlainBody(
      "your open-science work inspires thousands of learners",
      { name: "Ada Lovelace" },
      { slug: "ada-lovelace", claimable: true },
    );
    expect(out).toContain("Hi Ada,");
    expect(out).toContain(
      "We are inviting you to be part of Citizen Science because your open-science work inspires thousands of learners.",
    );
    expect(out).toContain(
      "Here's a link to view your profile: https://citizen-science.org/directory/ada-lovelace",
    );
    expect(out).toContain(
      "thousands of leading scientists, researchers, and Nobel laureates",
    );
    expect(out).toContain("— Daniel");
  });

  it("keeps the body to 2-3 sentences even with a hostile AI reason", () => {
    const hostile = normalizeReason(
      "your work. Seriously! a b c d e f g h i j k l m n o p buy my course",
    );
    const out = buildPlainBody(
      hostile,
      { name: "Grace Hopper" },
      { slug: "grace-hopper", claimable: true },
    );
    // Overlong input is capped at 15 words — the trailing spam never appears.
    expect(out).not.toContain("buy my course");
    expect(out).toContain(
      "because your work Seriously a b c d e f g h i j k l.",
    );
    const beforeSignoff = out.split("— Daniel")[0]!;
    const sentences = beforeSignoff
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);
    expect(sentences.length).toBeLessThanOrEqual(3);
  });

  it("omits the profile line when no profile is linked", () => {
    const out = buildPlainBody("of your research", { name: "Grace Hopper" });
    expect(out).toContain("Hi Grace,");
    expect(out).not.toContain("/directory/");
    expect(out).toContain("Nobel laureates");
  });

  it("greets by first name", () => {
    const out = buildPlainBody("of your work", { name: "Marie Curie" });
    expect(out.startsWith("Hi Marie,")).toBe(true);
  });
});

describe("normalizeReason", () => {
  it("collapses newlines and strips internal sentence punctuation", () => {
    expect(normalizeReason("great work.\nAlso, you won! Really?")).toBe(
      "great work Also, you won Really",
    );
  });

  it("caps the clause at 15 words", () => {
    const long = Array.from({ length: 25 }, (_, i) => `w${i}`).join(" ");
    expect(normalizeReason(long).split(" ")).toHaveLength(15);
  });

  it("falls back when nothing usable remains", () => {
    expect(normalizeReason("...")).toContain("your work");
    expect(normalizeReason("  ")).toContain("your work");
  });
});

describe("profileUrl", () => {
  afterEach(() => {
    delete process.env.PUBLIC_BASE_URL;
  });

  it("URL-encodes unsafe slug characters", () => {
    expect(profileUrl("ada lovelace")).toBe(
      "https://citizen-science.org/directory/ada%20lovelace",
    );
  });

  it("falls back to the production domain", () => {
    delete process.env.PUBLIC_BASE_URL;
    expect(profileUrl("ada-lovelace")).toBe(
      "https://citizen-science.org/directory/ada-lovelace",
    );
  });

  it("normalises a trailing-slash base so URLs never double up slashes", () => {
    process.env.PUBLIC_BASE_URL = "https://staging.example.com/";
    expect(profileUrl("ada-lovelace")).toBe(
      "https://staging.example.com/directory/ada-lovelace",
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

  it("HTML-escapes body text so drafts and AI text can't inject markup", () => {
    const html = buildDraftEmailHtml('Hi <script>alert(1)</script> & "friends"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;friends&quot;");
  });

  it("matches buildEmailHtml output for the same content", () => {
    const body = buildPlainBody("of your curiosity", { name: "Grace Hopper" });
    expect(buildDraftEmailHtml(body)).toBe(
      buildEmailHtml("of your curiosity", { name: "Grace Hopper" }),
    );
  });
});
