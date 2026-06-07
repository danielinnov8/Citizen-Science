import { type AvatarProvider, type AvatarProviderId, type AvatarProviderInfo } from "./types";
import { DidAvatarProvider } from "./did";
import { ComingSoonAvatarProvider } from "./comingSoon";

// The ordered list of avatar engines. D-ID is the one working engine; Simli and
// HeyGen are placeholders so the UI can offer them as "coming soon" without any
// broken paths. Add a new concrete provider here to make it selectable.
const PROVIDERS: AvatarProvider[] = [
  new DidAvatarProvider(),
  new ComingSoonAvatarProvider("simli", "Simli"),
  new ComingSoonAvatarProvider("heygen", "HeyGen"),
];

const PROVIDERS_BY_ID = new Map<AvatarProviderId, AvatarProvider>(
  PROVIDERS.map((p) => [p.id, p]),
);

// The default engine used when a client doesn't specify one.
export const DEFAULT_AVATAR_PROVIDER_ID: AvatarProviderId = "d-id";

export function getAvatarProvider(
  id: AvatarProviderId,
): AvatarProvider | undefined {
  return PROVIDERS_BY_ID.get(id);
}

// Compact, credential-free description of every provider for the client UI:
// which engines exist, their status, and whether they're configured.
export function listAvatarProviders(): AvatarProviderInfo[] {
  return PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    status: p.status,
    configured: p.isConfigured(),
  }));
}

// Whether at least one fully-available provider has its credentials configured,
// i.e. whether the live-avatar feature can actually run right now.
export function isAnyAvatarProviderReady(): boolean {
  return PROVIDERS.some((p) => p.status === "available" && p.isConfigured());
}
