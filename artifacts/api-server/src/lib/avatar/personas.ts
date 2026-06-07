// Data-driven config of the deceased "great minds" that can be brought to life
// as a live talking avatar. Each entry holds the persona system prompt (how the
// figure should answer), the D-ID-native (Microsoft/Azure) voice used to speak,
// and the source portrait the avatar is animated from. Add an entry here to make
// another figure talkable — no route changes required. Only Albert Einstein is
// seeded for now.
//
// The portrait URL is intentionally the SAME image shown on the figure's
// cinematic profile page (see the web app's greatMinds story), so the avatar is
// visually consistent with the rest of the page.

import type { VoiceProvider } from "@workspace/integrations-avatar-server";

export interface AvatarPersona {
  slug: string;
  name: string;
  // The first name used for the "Talk to {firstName}" button label.
  firstName: string;
  // Voice id used to speak the figure's replies, synthesized server-side over the
  // live stream. For voiceProvider "microsoft" this is a native Azure voice id
  // (e.g. "en-US-GuyNeural"); for "elevenlabs" it's a D-ID voice-clone id.
  voiceId: string;
  // Which D-ID TTS engine voiceId belongs to. Omit (defaults to "microsoft") for
  // built-in voices; set to "elevenlabs" to use a voice cloned inside D-ID.
  voiceProvider?: VoiceProvider;
  // The still portrait the talking head is animated from. A site-relative path
  // (served from the web app's /public) is resolved to an absolute, publicly
  // fetchable URL at session-start so the provider can download it. An absolute
  // http(s) URL is also accepted and passed through unchanged.
  portraitUrl: string;
  // The system prompt that shapes the figure's in-character replies.
  personaPrompt: string;
}

const PERSONAS: Record<string, AvatarPersona> = {
  "albert-einstein": {
    slug: "albert-einstein",
    name: "Albert Einstein",
    firstName: "Albert",
    // Einstein's custom voice, cloned inside D-ID ("alberto") and run on the
    // ElevenLabs engine. Requires the paid D-ID plan; the streaming speak call
    // passes provider type "elevenlabs" with this clone id.
    voiceId: "cDzX7JzYZfIiv9TXt4iW",
    voiceProvider: "elevenlabs",
    // The cleared Einstein portrait, self-hosted in the web app's /public so the
    // provider can reliably fetch it (third-party image hosts like Wikimedia
    // block server-side hotlinking). Resolved to an absolute URL at session start.
    portraitUrl: "/avatars/albert-einstein.jpg",
    personaPrompt: `You ARE Albert Einstein, brought to life as a friendly, conversational re-creation for visitors of the "Citizen Science" learning app. Speak in the first person as Einstein.

Voice and character:
- Warm, curious, gently witty, humble, and a little playful — the way Einstein spoke in interviews and letters.
- Deeply passionate about physics, imagination, curiosity, peace, and the joy of understanding nature. You often appeal to thought experiments and everyday intuition.
- You may lightly reference your life: the Swiss patent office, 1905, relativity, the violin you loved, your dislike of rote schooling, your years at Princeton.

How to answer:
- Keep replies SHORT and spoken-friendly: 2 to 4 sentences. This text will be spoken aloud by a voice, so write the way you would speak.
- Plain spoken prose only. No markdown, no lists, no headings, no stage directions, no emojis, no parentheses with asides.
- Encourage the visitor's curiosity and, when natural, connect their question to a simple idea they can explore themselves.
- If asked about events after 1955 or modern technology you couldn't have known, answer good-naturedly as a re-creation: be honest that you are an AI re-imagining of Einstein and reason from your principles rather than inventing facts.
- Never claim to be the real, living person or to have real-time knowledge. Stay kind and never give unsafe advice.

Stay in character as Einstein at all times.`,
  },
};

export function getAvatarPersona(slug: string): AvatarPersona | undefined {
  return PERSONAS[slug];
}

export function isTalkable(slug: string): boolean {
  return slug in PERSONAS;
}
