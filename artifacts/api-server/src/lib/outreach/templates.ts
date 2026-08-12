import { and, eq } from "drizzle-orm";
import { db, outreachTemplatesTable } from "@workspace/db";

// The legacy marketing-style subjects these templates shipped with. Used to
// upgrade untouched rows in place — a row still carrying its exact legacy
// default was never customised by an admin, so it's safe to modernise.
const LEGACY_DEFAULT_SUBJECTS: Record<string, string> = {
  researcher: "Advancing science with {{name}}",
  scientist: "Your science, amplified — {{name}}",
  investor: "Science at scale — opportunity for {{name}}",
  user: "Discover science with us, {{name}}",
};

// Institutional subject per the email design brief: personal, understated,
// name-personalised. The body is fixed copy (see personalise.ts); templates
// now contribute the subject line only.
const INSTITUTIONAL_SUBJECT = "Invitation to Citizen Science — {{name}}";

const DEFAULT_TEMPLATES = [
  {
    type: "researcher" as const,
    subjectTemplate: INSTITUTIONAL_SUBJECT,
    bodyTemplate: `{{opening}}

At Citizen Science, we're building the world's first distributed research network — connecting academics like you with thousands of citizen scientists who are eager to contribute to real projects.

We'd love to discuss how we can help amplify your research reach and connect you with motivated volunteers.

Would you be open to a brief call this week?

Warm regards,
The Citizen Science Team`,
  },
  {
    type: "scientist" as const,
    subjectTemplate: INSTITUTIONAL_SUBJECT,
    bodyTemplate: `{{opening}}

Citizen Science is a platform that bridges professional scientists with curious minds around the globe. We help scientists like you publish experiments, gather real-world data, and engage a community passionate about discovery.

If you'd like to see how others are using our platform, I'd be happy to walk you through it.

Best,
The Citizen Science Team`,
  },
  {
    type: "investor" as const,
    subjectTemplate: INSTITUTIONAL_SUBJECT,
    bodyTemplate: `{{opening}}

Citizen Science is pioneering a new model for distributed scientific research and education. We're combining AI-powered tools with a growing community of scientists and learners to democratise access to science.

We're currently speaking with investors who share our vision. I'd love to share our current traction and roadmap.

Would a short call work for you?

Best,
The Citizen Science Team`,
  },
  {
    type: "user" as const,
    subjectTemplate: INSTITUTIONAL_SUBJECT,
    bodyTemplate: `{{opening}}

At Citizen Science, we make it easy to learn, contribute to real research, and connect with scientists and curious minds from around the world — all in one place.

Whether you're a lifelong learner, a science enthusiast, or just getting started, there's a place for you here.

Come explore what we're building — it's free to get started.

The Citizen Science Team`,
  },
] as const;

/**
 * Idempotently seeds the default outreach templates for every prospect type.
 * Safe to call on every batch run — the conflict target on `type` ensures
 * existing rows are never overwritten. Additionally upgrades the SUBJECT of
 * rows still carrying their exact legacy marketing default (i.e. never
 * customised by an admin) to the institutional subject; custom edits are
 * sacred and never touched.
 */
export async function ensureDefaultTemplates(): Promise<void> {
  for (const tmpl of DEFAULT_TEMPLATES) {
    await db
      .insert(outreachTemplatesTable)
      .values({
        type: tmpl.type,
        subjectTemplate: tmpl.subjectTemplate,
        bodyTemplate: tmpl.bodyTemplate,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    const legacy = LEGACY_DEFAULT_SUBJECTS[tmpl.type];
    if (legacy) {
      await db
        .update(outreachTemplatesTable)
        .set({ subjectTemplate: tmpl.subjectTemplate, updatedAt: new Date() })
        .where(
          and(
            eq(outreachTemplatesTable.type, tmpl.type),
            eq(outreachTemplatesTable.subjectTemplate, legacy),
          ),
        );
    }
  }
}
