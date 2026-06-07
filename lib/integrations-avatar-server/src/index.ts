export {
  getAvatarProvider,
  listAvatarProviders,
  isAnyAvatarProviderReady,
  DEFAULT_AVATAR_PROVIDER_ID,
} from "./registry";
export { DidAvatarProvider } from "./did";
export { ComingSoonAvatarProvider } from "./comingSoon";
export {
  AvatarProviderUnavailableError,
  type AvatarProvider,
  type AvatarProviderId,
  type AvatarProviderInfo,
  type AvatarProviderStatus,
  type CreateStreamOptions,
  type CreateStreamResult,
  type IceServer,
  type IceCandidatePayload,
  type SdpDescription,
  type SignalingContext,
  type SpeakOptions,
  type VoiceProvider,
} from "./types";
