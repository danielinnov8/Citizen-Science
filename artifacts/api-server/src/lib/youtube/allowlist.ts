// Trusted-channel allowlist for embeddable copilot videos.
//
// A video is only ever shown to the user if it comes from one of these
// channels AND passes a strict relevance check. Filtering is done by real
// YouTube channel IDs (the stable `UC...` identifiers), not by name, so it is
// exact and cannot be spoofed by a channel renaming itself.
//
// This is a curated starter set of reputable, widely-trusted science and
// education channels. It is intentionally code-owned (no admin UI).

export interface TrustedChannel {
  id: string;
  name: string;
}

export const TRUSTED_CHANNELS: TrustedChannel[] = [
  { id: "UCLA_DiR1FfKNvjuUpBHmylQ", name: "NASA" },
  { id: "UCHnyfMqiRRG1u-2MsSQLbXA", name: "Veritasium" },
  { id: "UCsXVk37bltHxD1rDPwtNM8Q", name: "Kurzgesagt – In a Nutshell" },
  { id: "UCZYTClx2T1of7BRZ86-8fow", name: "SciShow" },
  { id: "UC4a-Gbdw7vOaccHmFo40b9g", name: "Khan Academy" },
  { id: "UCEBb1b_L6zDS3xTUrIALZOw", name: "MIT OpenCourseWare" },
  { id: "UCsooa4yRKGN_zEE8iknghZA", name: "TED-Ed" },
  { id: "UCpVm7bg6pXKo1Pr6k5kxG9A", name: "National Geographic" },
  { id: "UC6nSFpj9HTCZ5t-N3Rm3-HA", name: "Vsauce" },
  { id: "UCUHW94eEFW7hkUMVaZz4eDg", name: "minutephysics" },
  { id: "UCYO_jab_esuFRV4b17AJtAw", name: "3Blue1Brown" },
  { id: "UCoxcjq-8xIDTYp3uz647V5A", name: "Numberphile" },
  { id: "UCtESv1e7ntJaLJYKIO1FoYw", name: "Periodic Videos" },
  { id: "UCFhXFikryT4aFcLkLw2LBLA", name: "NileRed" },
  { id: "UCEIwxahdLz7bap-VDs9h35A", name: "Steve Mould" },
  { id: "UCYeF244yNGuFefuFKqxIQXw", name: "The Royal Institution" },
  { id: "UC7_gcs09iThXybpVgjHZ_7g", name: "PBS Space Time" },
  { id: "UC6107grRI4m0o2-emgoDnAA", name: "SmarterEveryDay" },
];

const ALLOWED_IDS = new Set(TRUSTED_CHANNELS.map((c) => c.id));

export function isTrustedChannel(channelId: string | undefined | null): boolean {
  return !!channelId && ALLOWED_IDS.has(channelId);
}
