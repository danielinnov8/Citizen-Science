import {
  type AvatarProvider,
  type AvatarProviderId,
  type CreateStreamResult,
  AvatarProviderUnavailableError,
} from "./types";

// A placeholder provider for engines that are selectable in the UI but not yet
// implemented (Simli, HeyGen). It reports status "coming_soon" and throws a
// friendly AvatarProviderUnavailableError on any real operation, so the API
// routes can surface a clear "not available yet" message instead of a 500. When
// one of these is implemented, replace it with a concrete AvatarProvider.
export class ComingSoonAvatarProvider implements AvatarProvider {
  readonly id: AvatarProviderId;
  readonly label: string;
  readonly status = "coming_soon" as const;

  constructor(id: AvatarProviderId, label: string) {
    this.id = id;
    this.label = label;
  }

  isConfigured(): boolean {
    return false;
  }

  private unavailable(): never {
    throw new AvatarProviderUnavailableError(
      this.id,
      `${this.label} is coming soon and isn't available yet. Please use D-ID.`,
    );
  }

  createStream(): Promise<CreateStreamResult> {
    return this.unavailable();
  }
  submitSdpAnswer(): Promise<void> {
    return this.unavailable();
  }
  submitIceCandidate(): Promise<void> {
    return this.unavailable();
  }
  speak(): Promise<void> {
    return this.unavailable();
  }
  closeStream(): Promise<void> {
    return this.unavailable();
  }
}
