import { randomUUID } from "node:crypto";
import { logger } from "../logger";
import {
  sendToSelectedProspects,
  type SelectedSendDeps,
  type SelectedSendResult,
} from "./scheduler";

export interface SelectedSendJob {
  id: string;
  status: "running" | "done";
  total: number;
  sent: number;
  failed: number;
  results: SelectedSendResult[];
}

// In-memory registry. Jobs are an admin convenience; the authoritative state
// is always the prospects table (pending vs contacted), so a restart mid-job
// never duplicates or loses sends — re-running skips already-contacted rows.
const jobs = new Map<string, SelectedSendJob>();
const JOB_TTL_MS = 60 * 60 * 1000;

type Processor = (
  ids: string[],
  deps?: Partial<SelectedSendDeps>,
) => Promise<{ sent: number; failed: number; results: SelectedSendResult[] }>;

/**
 * Starts a batch "generate & send" as a background job and returns it
 * immediately — the HTTP request never waits on provider latency, and the UI
 * polls getSelectedSendJob for live per-prospect progress (fed by onItem).
 */
export function startSelectedSendJob(
  ids: string[],
  processor: Processor = sendToSelectedProspects,
): SelectedSendJob {
  const job: SelectedSendJob = {
    id: randomUUID(),
    status: "running",
    total: ids.length,
    sent: 0,
    failed: 0,
    results: [],
  };
  jobs.set(job.id, job);

  void (async () => {
    try {
      await processor(ids, {
        onItem: (item) => {
          job.results.push(item);
          if (item.ok) job.sent++;
          else job.failed++;
        },
      });
    } catch (err) {
      // The processor isolates per-item failures, so reaching here means
      // something systemic (e.g. settings load) failed — mark what we know.
      logger.error({ err, jobId: job.id }, "outreach: selected-send job crashed");
      job.failed = job.total - job.sent;
    } finally {
      job.status = "done";
      setTimeout(() => jobs.delete(job.id), JOB_TTL_MS).unref();
    }
  })();

  return job;
}

export function getSelectedSendJob(id: string): SelectedSendJob | undefined {
  return jobs.get(id);
}
