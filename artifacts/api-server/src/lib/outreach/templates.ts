import { db, outreachTemplatesTable } from "@workspace/db";

const DEFAULT_TEMPLATES = [
  {
    type: "researcher" as const,
    subjectTemplate: "Advancing science with {{name}}",
    bodyTemplate: `{{opening}}

At Citizen Science, we're building the world's first distributed research network — connecting academics like you with thousands of citizen scientists who are eager to contribute to real projects.

We'd love to discuss how we can help amplify your research reach and connect you with motivated volunteers.

Would you be open to a brief call this week?

Warm regards,
The Citizen Science Team`,
  },
  {
    type: "scientist" as const,
    subjectTemplate: "Your science, amplified — {{name}}",
    bodyTemplate: `{{opening}}

Citizen Science is a platform that bridges professional scientists with curious minds around the globe. We help scientists like you publish experiments, gather real-world data, and engage a community passionate about discovery.

If you'd like to see how others are using our platform, I'd be happy to walk you through it.

Best,
The Citizen Science Team`,
  },
  {
    type: "investor" as const,
    subjectTemplate: "Science at scale — opportunity for {{name}}",
    bodyTemplate: `{{opening}}

Citizen Science is pioneering a new model for distributed scientific research and education. We're combining AI-powered tools with a growing community of scientists and learners to democratise access to science.

We're currently speaking with investors who share our vision. I'd love to share our current traction and roadmap.

Would a short call work for you?

Best,
The Citizen Science Team`,
  },
  {
    type: "user" as const,
    subjectTemplate: "Discover science with us, {{name}}",
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
 * existing custom edits are never overwritten.
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
  }
}
