---
name: Mentor chat persona source
description: /mentor/:slug chat resolves personas ONLY from LIVING_MIND_STORIES; preferDbStory keeps the persona without the cinematic directory page
---

The mentor chat page (`MentorChat.tsx`) looks up its figure persona exclusively via `LIVING_MIND_STORIES[slug]` in the frontend — not from the DB or the API. Removing a figure's `livingMinds.ts` entry therefore breaks `/mentor/:slug` with "Mentor not found", even when the server-side waitlist gate (`isKnownLivingLegend || isLivingProfile`) still passes.

**Why:** A figure's directory page and their mentor persona are coupled through the same map. A user asked to revert a figure's directory page to the DB-built cover, and deleting the story entry silently killed the mentor chat.

**How to apply:** To give a figure the DB-built cover but keep mentorship working, keep the `livingMinds.ts` entry and set `preferDbStory: true` on it — `ProfileDetail` then falls through to `buildStoryFromProfile` while `MentorChat` still resolves the persona. Never delete an entry for a figure whose mentor feature should keep working.
