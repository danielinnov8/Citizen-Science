import { afterEach, describe, expect, it } from "vitest";
import {
  buildDraftEmailHtml,
  buildEmailHtml,
  buildMissionBlock,
  buildPlainBody,
  buildProfilePostscript,
  profileUrl,
} from "./personalise";

describe("buildMissionBlock", () => {
  it("mentions the Gemini XPRIZE submission, the category, and the free honorary membership invite", () => {
    const block = buildMissionBlock();
    expect(block).toContain("submission to the Build with Gemini XPRIZE");
    expect(block).toContain("XPRIZE × Google");
    expect(block).toContain("Education & Human Potential");
    expect(block).toContain("honorary member");
    expect(block).toContain("completely free");
    expect(block).toContain("permanent badge");
    expect(block).toContain("honorary roll");
    expect(block).toContain("boosted monthly credit allowance");
    expect(block).toContain("Just reply");
    // Two paragraphs: submission context, then the invitation.
    expect(block.split("\n\n")).toHaveLength(2);
    // Must not claim an active competition entry beyond "submission".
    expect(block).not.toContain("competing in");
  });
});

describe("buildPlainBody", () => {
  it("merges {{name}} and {{opening}}, then appends the mission block", () => {
    const out = buildPlainBody(
      "Hi Ada, your work on computing inspires us.",
      "{{opening}}\n\n{{name}}, we'd love to have you.\n\n— Daniel",
      { name: "Ada Lovelace" },
    );
    expect(out).toBe(
      "Hi Ada, your work on computing inspires us.\n\nAda Lovelace, we'd love to have you.\n\n— Daniel\n\n" +
        buildMissionBlock(),
    );
  });

  it("orders sections: template body, mission block, then the profile P.S.", () => {
    const profile = { slug: "ada-lovelace", claimable: true };
    const out = buildPlainBody(
      "Opening.",
      "Body.\n\n— Daniel",
      { name: "Ada Lovelace" },
      profile,
    );
    expect(out).toBe(
      "Body.\n\n— Daniel\n\n" +
        buildMissionBlock() +
        "\n\n" +
        buildProfilePostscript("Ada Lovelace", profile),
    );
    expect(out).toContain("/directory/ada-lovelace");
    expect(out).toContain('click "Claim this profile"');
  });

  it("omits the profile P.S. (but keeps the mission block) without a linked profile", () => {
    const out = buildPlainBody("Opening.", "Body.", { name: "Grace Hopper" });
    expect(out).toBe("Body.\n\n" + buildMissionBlock());
    expect(out).not.toContain("P.S.");
  });

  it("normalises trailing newlines in editable templates to one blank line", () => {
    const out = buildPlainBody(
      "Opening.",
      "Body.\n\n— Daniel\n\n\n",
      { name: "Grace Hopper" },
      { slug: "grace-hopper", claimable: true },
    );
    // Exactly one blank line between each section, nothing trailing.
    expect(out).not.toMatch(/\n{3,}/);
    expect(out.endsWith("\n")).toBe(false);
    expect(out).toBe(
      "Body.\n\n— Daniel\n\n" +
        buildMissionBlock() +
        "\n\n" +
        buildProfilePostscript("Grace Hopper", {
          slug: "grace-hopper",
          claimable: true,
        }),
    );
  });
});

describe("buildProfilePostscript", () => {
  it("describes the page and how to claim it for living figures", () => {
    const ps = buildProfilePostscript("Ada Lovelace", {
      slug: "ada-lovelace",
      claimable: true,
    });
    expect(ps).toContain("/directory/ada-lovelace");
    expect(ps).toContain("key achievements");
    expect(ps).toContain("interactive experiments");
    expect(ps).toContain('click "Claim this profile"');
    expect(ps).toContain("Verified badge");
  });

  it("omits claim instructions for historical (non-claimable) figures", () => {
    const ps = buildProfilePostscript("Alan Turing", {
      slug: "alan-turing",
      claimable: false,
    });
    expect(ps).toContain("/directory/alan-turing");
    expect(ps).not.toContain("Claim this profile");
    expect(ps).toContain("reply to this email");
  });

  it("returns empty string without a slug", () => {
    expect(buildProfilePostscript("No One", null)).toBe("");
    expect(
      buildProfilePostscript("No One", { slug: "", claimable: true }),
    ).toBe("");
  });
});

describe("profileUrl", () => {
  afterEach(() => {
    delete process.env.PUBLIC_BASE_URL;
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

  it("matches buildEmailHtml output for the same merged content", () => {
    const template = "{{opening}}\n\nBody for {{name}}.";
    const merged = buildPlainBody("Opening here.", template, { name: "Grace" });
    expect(buildDraftEmailHtml(merged)).toBe(
      buildEmailHtml("Opening here.", template, { name: "Grace" }),
    );
  });
});
