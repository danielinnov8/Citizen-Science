import { afterEach, describe, expect, it } from "vitest";
import {
  assertDraftSendable,
  buildDraftEmailHtml,
  buildEmailHtml,
  buildPlainBody,
  normalizeField,
  profileUrl,
} from "./personalise";

const SENDER = "daniel@citizen-science.org";
const KETTERLE = { slug: "wolfgang-ketterle", claimable: true };

describe("buildPlainBody", () => {
  it("reads as a personal, institutional invitation from the founder", () => {
    const out = buildPlainBody(
      "quantum many-body physics",
      { name: "Wolfgang Ketterle" },
      KETTERLE,
      SENDER,
    );
    expect(out).toContain("Hi Wolfgang,");
    expect(out).toContain("I'm Daniel, founder of Citizen Science.");
    expect(out).toContain(
      "We're building a platform that connects the world's greatest minds to solve humanity's greatest challenges.",
    );
    expect(out).toContain(
      "I'm reaching out personally because of your work in quantum many-body physics.",
    );
    expect(out).toContain(
      "We've prepared a preliminary directory page for you here:",
    );
    expect(out).toContain(
      "View your Citizen Science profile →\nhttps://citizen-science.org/directory/wolfgang-ketterle",
    );
    expect(out).toContain("claim the profile");
    expect(out).toContain(
      "It would be an honor to welcome you as an honorary member of the community.",
    );
    expect(out).toContain(
      "Best,\n\nDaniel Innovaté\nFounder, Citizen Science\ncitizen-science.org\ndaniel@citizen-science.org",
    );
  });

  it("stays within the ~120-word brief even with a max-length field phrase", () => {
    const tenWords = Array.from({ length: 10 }, (_, i) => `w${i}`).join(" ");
    const out = buildPlainBody(
      tenWords,
      { name: "Wolfgang Ketterle" },
      KETTERLE,
      SENDER,
    );
    const words = out.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThanOrEqual(125);
  });

  it("never uses marketing hype or inflated social proof", () => {
    const out = buildPlainBody(
      "your field",
      { name: "Grace Hopper" },
      { slug: "grace-hopper", claimable: true },
      SENDER,
    );
    for (const banned of [
      "thousands",
      "amplified",
      "Act now",
      "Exclusive",
      "Join thousands",
      "Revolutionizing",
    ]) {
      expect(out).not.toContain(banned);
    }
  });

  it("omits the directory block when no profile is linked", () => {
    const out = buildPlainBody(
      "compiler design",
      { name: "Grace Hopper" },
      null,
      SENDER,
    );
    expect(out).toContain("Hi Grace,");
    expect(out).not.toContain("/directory/");
    expect(out).not.toContain("claim the profile");
    expect(out).toContain("honorary member");
  });

  it("caps a hostile AI field phrase at 10 words with no sentence breaks", () => {
    const hostile = normalizeField(
      "physics. Seriously! w1 w2 w3 w4 w5 w6 w7 w8 w9 w10 w11 spam",
    );
    const out = buildPlainBody(hostile, { name: "Grace Hopper" }, null, SENDER);
    expect(out).not.toContain("spam");
    expect(out).toContain(
      "because of your work in physics Seriously w1 w2 w3 w4 w5 w6 w7 w8.",
    );
  });
});

describe("normalizeField", () => {
  it("collapses newlines and strips sentence punctuation", () => {
    expect(normalizeField("quantum optics.\nAlso, photons! Really?")).toBe(
      "quantum optics Also, photons Really",
    );
  });

  it("caps the phrase at 10 words", () => {
    const long = Array.from({ length: 18 }, (_, i) => `w${i}`).join(" ");
    expect(normalizeField(long).split(" ")).toHaveLength(10);
  });

  it("falls back when nothing usable remains", () => {
    expect(normalizeField("...")).toBe("your field");
    expect(normalizeField("  ")).toBe("your field");
  });
});

describe("assertDraftSendable", () => {
  it("refuses to send a draft stuck on the generic field fallback", () => {
    const generic = buildPlainBody("your field", { name: "Grace Hopper" }, null, SENDER);
    expect(() => assertDraftSendable({ body: generic })).toThrow(
      /no specific research field/,
    );
  });

  it("passes drafts that name a real field", () => {
    const specific = buildPlainBody("compiler design", { name: "Grace Hopper" }, null, SENDER);
    expect(() => assertDraftSendable({ body: specific })).not.toThrow();
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
  it("renders the institutional shell: wordmark, divider, muted footer with opt-out", () => {
    const html = buildDraftEmailHtml("Hi Ada,");
    expect(html).toContain("Citizen&nbsp;Science");
    expect(html).toContain("<hr");
    expect(html).toContain(
      "independent platform for discovering scientists, research, institutions, and scientific ideas",
    );
    expect(html).toContain("unsubscribe");
    // No marketing furniture.
    expect(html).not.toContain("<button");
    expect(html).not.toContain("border-radius");
  });

  it("renders the profile CTA as a descriptive anchor with a visible raw URL", () => {
    const html = buildDraftEmailHtml(
      "We've prepared a preliminary directory page for you here:\n\nView your Citizen Science profile →\nhttps://citizen-science.org/directory/ada-lovelace",
    );
    expect(html).toContain(
      '<a href="https://citizen-science.org/directory/ada-lovelace" style="color:#111827;">View your Citizen Science profile →</a>',
    );
    // The raw URL stays visible (muted) so recipients can verify the domain.
    expect(html).toContain(
      '>https://citizen-science.org/directory/ada-lovelace</a>',
    );
  });

  it("keeps the descriptive anchor when an admin splits the CTA and URL across paragraphs", () => {
    const html = buildDraftEmailHtml(
      "View your Citizen Science profile →\n\nhttps://citizen-science.org/directory/ada-lovelace",
    );
    expect(html).toContain(
      '<a href="https://citizen-science.org/directory/ada-lovelace" style="color:#111827;">View your Citizen Science profile →</a>',
    );
  });

  it("linkifies the signature domain and sender email", () => {
    const html = buildDraftEmailHtml(
      "citizen-science.org\ndaniel@citizen-science.org",
    );
    expect(html).toContain('<a href="https://citizen-science.org"');
    expect(html).toContain('<a href="mailto:daniel@citizen-science.org"');
  });

  it("HTML-escapes body text so drafts and AI text can't inject markup", () => {
    const html = buildDraftEmailHtml('Hi <script>alert(1)</script> & "friends"');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&quot;friends&quot;");
  });

  it("matches buildEmailHtml output for the same content", () => {
    const body = buildPlainBody("compiler design", { name: "Grace Hopper" }, null, SENDER);
    expect(buildDraftEmailHtml(body)).toBe(
      buildEmailHtml("compiler design", { name: "Grace Hopper" }, null, SENDER),
    );
  });
});
