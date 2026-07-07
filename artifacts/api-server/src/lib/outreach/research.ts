import {
  isGeminiConfigured,
  researchPublicContact,
  type ContactResearchInput,
} from "@workspace/integrations-gemini-ai-server";
import type { ProspectContactInfo } from "@workspace/db";
import { logger } from "../logger";

export type { ContactResearchInput };

/**
 * Best-effort public contact research for a single living directory figure via
 * the app's built-in Gemini web search. Returns a sanitized, never-fabricated
 * contact-info object. Throws only on an actual model/transport failure so the
 * caller can leave the row unresearched and retry on a later batch; a legitimate
 * "nothing found" resolves to an empty object.
 *
 * The actual prompt + sanitizer live in `@workspace/integrations-gemini-ai-server`
 * (`researchPublicContact`) so the bulk research script and this route-facing
 * wrapper can never drift apart.
 */
export async function researchProspectContact(
  input: ContactResearchInput,
): Promise<ProspectContactInfo> {
  if (!isGeminiConfigured()) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const info: ProspectContactInfo = await researchPublicContact(input);
  logger.info(
    {
      name: input.name,
      foundEmail: !!info.email,
      foundWebsite: !!info.website,
      socials: info.socials?.length ?? 0,
    },
    "outreach: contact research complete",
  );
  return info;
}
