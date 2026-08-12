import { describe, expect, it } from "vitest";
import { getSelectedSendJob, startSelectedSendJob } from "./sendJobs";

async function waitForDone(id: string) {
  for (let i = 0; i < 200; i++) {
    const job = getSelectedSendJob(id);
    if (job?.status === "done") return job;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error("job never finished");
}

describe("selected send jobs", () => {
  it("runs the processor in the background with live per-item progress", async () => {
    const job = startSelectedSendJob(["a", "b"], async (_ids, deps) => {
      deps?.onItem?.({ id: "a", name: "A", ok: true });
      deps?.onItem?.({ id: "b", name: "B", ok: false, error: "boom" });
      return { sent: 1, failed: 1, results: [] };
    });
    expect(job.status).toBe("running");
    expect(job.total).toBe(2);

    const done = await waitForDone(job.id);
    expect(done.status).toBe("done");
    expect(done.sent).toBe(1);
    expect(done.failed).toBe(1);
    expect(done.results).toHaveLength(2);
  });

  it("marks the job done (with failures) even if the processor crashes", async () => {
    const job = startSelectedSendJob(["a"], async () => {
      throw new Error("settings exploded");
    });
    const done = await waitForDone(job.id);
    expect(done.status).toBe("done");
    expect(done.failed).toBe(1);
  });

  it("returns undefined for unknown job ids", () => {
    expect(getSelectedSendJob("no-such-job")).toBeUndefined();
  });
});
