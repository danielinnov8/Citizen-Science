import { lt } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db, oauthStatesTable, type OauthState } from "@workspace/db";

// How long a started OAuth handshake stays valid before the user must restart.
const OAUTH_STATE_TTL_MS = 1000 * 60 * 10; // 10 minutes

/**
 * Persist an in-flight OAuth handshake. Returns nothing — the `state` value is
 * the caller's lookup key (and is what Google echoes back to the callback).
 */
export async function createOauthState(params: {
  state: string;
  verifier: string;
  nonceHash: string;
  redirectUri: string;
}): Promise<void> {
  await db.insert(oauthStatesTable).values({
    state: params.state,
    verifier: params.verifier,
    nonceHash: params.nonceHash,
    redirectUri: params.redirectUri,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  });
}

/**
 * Atomically look up and DELETE a handshake by its state value (single use).
 * Returns null when the state is unknown, already consumed, or expired. Also
 * opportunistically reaps other expired rows so the table stays small without a
 * separate cron.
 */
export async function consumeOauthState(
  state: string,
): Promise<{ verifier: string; redirectUri: string; nonceHash: string } | null> {
  if (!state) return null;

  const [row]: OauthState[] = await db
    .delete(oauthStatesTable)
    .where(eq(oauthStatesTable.state, state))
    .returning();

  // Best-effort cleanup of stale rows; never blocks or fails the request.
  void db
    .delete(oauthStatesTable)
    .where(lt(oauthStatesTable.expiresAt, new Date()))
    .catch(() => undefined);

  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) return null;
  return {
    verifier: row.verifier,
    redirectUri: row.redirectUri,
    nonceHash: row.nonceHash,
  };
}
