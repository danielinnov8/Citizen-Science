import { describe, expect, it } from "vitest";
import type { OutreachProspect } from "@workspace/db";
import {
  sendToSelectedProspects,
  type SelectedSendDeps,
} from "./scheduler";

const prospect = (
  id: string,
  over: Record<string, unknown> = {},
): OutreachProspect =>
  ({
    id,
    name: `Prospect ${id}`,
    type: "researcher",
    status: "pending",
    reviewState: "needs_review",
    email: `${id}@example.com`,
    contactInfo: null,
    notes: null,
    profileId: null,
    source: "manual",
    researchedAt: null,
    draftSubject: null,
    draftBody: null,
    lastContactedAt: null,
    createdAt: new Date("2026-08-12T00:00:00Z"),
    updatedAt: new Date("2026-08-12T00:00:00Z"),
    ...over,
  }) as unknown as OutreachProspect;

const makeDeps = (over: Partial<SelectedSendDeps> = {}): SelectedSendDeps => ({
  getSettings: async () => ({
    fromEmail: "daniel@citizen-science.org",
    fromName: "Daniel",
  }),
  prepareDefaults: async () => {},
  loadProspect: async (id) => prospect(id),
  approveProspect: async () => ({ email: "committed@example.com" }),
  ensureDraft: async () => ({}),
  send: async () => {},
  draftDeadlineMs: 50,
  interSendDelayMs: 0,
  ...over,
});

describe("sendToSelectedProspects", () => {
  it("approves (selection = approval) and sends to the committed email", async () => {
    const approvals: string[] = [];
    const sentTo: string[] = [];
    const deps = makeDeps({
      approveProspect: async (id) => {
        approvals.push(id);
        return { email: `${id}@committed.example.com` };
      },
      send: async (p) => {
        sentTo.push(p.email ?? "");
      },
    });
    const r = await sendToSelectedProspects(["a", "b"], deps);
    expect(r).toMatchObject({ sent: 2, failed: 0 });
    expect(sentTo).toEqual([
      "a@committed.example.com",
      "b@committed.example.com",
    ]);
    expect(approvals).toEqual(["a", "b"]);
  });

  it("deduplicates ids", async () => {
    const r = await sendToSelectedProspects(["a", "a", "b"], makeDeps());
    expect(r.results).toHaveLength(2);
  });

  it("continues the batch when one item fails and reports per-item reasons", async () => {
    const deps = makeDeps({
      send: async (p) => {
        if (p.id === "b") throw new Error("Resend exploded");
      },
    });
    const r = await sendToSelectedProspects(["a", "b", "c"], deps);
    expect(r.sent).toBe(2);
    expect(r.failed).toBe(1);
    expect(r.results.find((x) => x.id === "b")).toMatchObject({
      ok: false,
      error: "Resend exploded",
    });
    expect(r.results.find((x) => x.id === "c")).toMatchObject({ ok: true });
  });

  it("a hung draft warm-up is bounded by the deadline and never blocks sends", async () => {
    const sent: string[] = [];
    const deps = makeDeps({
      ensureDraft: () => new Promise(() => {}), // never settles
      send: async (p) => {
        sent.push(p.id);
      },
    });
    const started = Date.now();
    const r = await sendToSelectedProspects(["a", "b"], deps);
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(r.sent).toBe(2);
    expect(sent).toEqual(["a", "b"]);
  });

  it("skips non-pending prospects without approving", async () => {
    let approveCalls = 0;
    const deps = makeDeps({
      loadProspect: async (id) => prospect(id, { status: "contacted" }),
      approveProspect: async () => {
        approveCalls++;
        return { email: "x@example.com" };
      },
    });
    const r = await sendToSelectedProspects(["a"], deps);
    expect(r.failed).toBe(1);
    expect(r.results[0]?.error).toContain("contacted");
    expect(approveCalls).toBe(0);
  });

  it("skips prospects with no email", async () => {
    const deps = makeDeps({
      loadProspect: async (id) =>
        prospect(id, { email: null, contactInfo: null }),
    });
    const r = await sendToSelectedProspects(["a"], deps);
    expect(r.results[0]?.error).toContain("No email");
  });

  it("sends to the email committed by the approval, not the earlier read", async () => {
    const sentTo: string[] = [];
    const deps = makeDeps({
      loadProspect: async (id) => prospect(id, { email: "stale@example.com" }),
      approveProspect: async () => ({ email: "admin-edited@example.com" }),
      send: async (p) => {
        sentTo.push(p.email ?? "");
      },
    });
    const r = await sendToSelectedProspects(["a"], deps);
    expect(r.sent).toBe(1);
    expect(sentTo).toEqual(["admin-edited@example.com"]);
  });

  it("reports a lost approval race instead of overwriting edits", async () => {
    const deps = makeDeps({ approveProspect: async () => null });
    const r = await sendToSelectedProspects(["a"], deps);
    expect(r.sent).toBe(0);
    expect(r.results[0]?.ok).toBe(false);
    expect(r.results[0]?.error).toContain("No longer sendable");
  });

  it("reports missing prospects", async () => {
    const deps = makeDeps({ loadProspect: async () => undefined });
    const r = await sendToSelectedProspects(["ghost"], deps);
    expect(r.results[0]).toMatchObject({
      ok: false,
      error: "Prospect not found.",
    });
  });
});
