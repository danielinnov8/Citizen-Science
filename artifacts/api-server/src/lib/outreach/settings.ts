import { db, outreachSettingsTable } from "@workspace/db";

// Default settings used when the DB row doesn't exist yet. The from-address must
// live on the verified Resend domain (citizen-science.org) or sends are rejected.
// daniel@ is the founder's real Google Workspace mailbox, so prospect replies
// reach a human and unsubscribe mailtos land somewhere watched.
const DEFAULT_SEND_HOUR = 9;
const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_FROM_EMAIL = "daniel@citizen-science.org";
// Institutional sender identity per the email design brief: the founder's name,
// never a team/marketing alias.
const DEFAULT_FROM_NAME = "Daniel Innovaté | Citizen Science";

export interface OutreachSettings {
  sendHour: number;
  batchSize: number;
  fromEmail: string;
  fromName: string;
}

/**
 * Resolve the effective outreach settings (DB row or defaults). Shared by the
 * scheduler, the admin "send now" route, and the draft generator (which signs
 * the email with the sender's address) — one source of truth.
 */
export async function getOutreachSettings(): Promise<OutreachSettings> {
  try {
    const [row] = await db.select().from(outreachSettingsTable).limit(1);
    return {
      sendHour: row?.sendHour ?? DEFAULT_SEND_HOUR,
      batchSize: row?.batchSize ?? DEFAULT_BATCH_SIZE,
      fromEmail: row?.fromEmail ?? DEFAULT_FROM_EMAIL,
      fromName: row?.fromName ?? DEFAULT_FROM_NAME,
    };
  } catch {
    return {
      sendHour: DEFAULT_SEND_HOUR,
      batchSize: DEFAULT_BATCH_SIZE,
      fromEmail: DEFAULT_FROM_EMAIL,
      fromName: DEFAULT_FROM_NAME,
    };
  }
}
