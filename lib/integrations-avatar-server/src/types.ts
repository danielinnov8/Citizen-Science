// Provider-agnostic types for live talking-avatar engines. The first concrete
// implementation is D-ID (WebRTC streaming talking head from a single still
// portrait, with a built-in/native TTS voice). The abstraction is deliberately
// shaped so Simli/HeyGen can be added later without touching the API routes.

export type AvatarProviderId = "d-id" | "simli" | "heygen";

// "available" — fully implemented and usable when its keys are configured.
// "coming_soon" — selectable in the UI but not implemented yet; operations
// throw AvatarProviderUnavailableError so callers can degrade gracefully.
export type AvatarProviderStatus = "available" | "coming_soon";

export interface AvatarProviderInfo {
  id: AvatarProviderId;
  label: string;
  status: AvatarProviderStatus;
  // Whether the credentials this provider needs are present in the environment.
  // (Always false for coming_soon providers.)
  configured: boolean;
}

// A WebRTC ICE server entry as returned by the provider, forwarded verbatim to
// the browser's RTCPeerConnection configuration.
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// An SDP description ({ type: "offer" | "answer", sdp }). Kept loose so it maps
// cleanly onto the browser's RTCSessionDescriptionInit on the client side.
export interface SdpDescription {
  type: string;
  sdp: string;
}

export interface IceCandidatePayload {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}

export interface CreateStreamOptions {
  // Public URL of the still portrait the avatar is animated from.
  sourceUrl: string;
  signal?: AbortSignal;
}

export interface CreateStreamResult {
  // Opaque provider identifiers the orchestration layer stores server-side and
  // never exposes to the browser (the browser only ever sees our own session
  // id). Subsequent signaling/speak/close calls echo these back to the provider.
  providerStreamId: string;
  providerSessionId: string;
  // The SDP offer the browser must answer, plus ICE servers for the peer
  // connection.
  offer: SdpDescription;
  iceServers: IceServer[];
}

// D-ID's TTS provider engine for a given voice. Built-in voices use "microsoft";
// a voice cloned inside D-ID (a paid feature) runs on the ElevenLabs engine and
// uses "elevenlabs". Other engines exist but are not used here.
export type VoiceProvider = "microsoft" | "elevenlabs" | "amazon" | "afflorithmics";

export interface SpeakOptions {
  providerStreamId: string;
  providerSessionId: string;
  // The text the avatar should speak. D-ID synthesizes it server-side over the
  // live stream using the given voice.
  text: string;
  // The voice id used to speak. With voiceProvider "microsoft" this is a native
  // Azure voice id (e.g. "en-US-GuyNeural"); with "elevenlabs" it's a D-ID voice
  // clone id (e.g. "cDzX7JzYZfIiv9TXt4iW"). The live streaming endpoint only
  // accepts `script.type: "text"` with a provider voice — it cannot lip-sync to a
  // pre-made audio file.
  voiceId: string;
  // Which TTS engine the voiceId belongs to. Defaults to "microsoft" when unset.
  // Custom cloned voices require a paid D-ID plan and use "elevenlabs".
  voiceProvider?: VoiceProvider;
  signal?: AbortSignal;
}

export interface SignalingContext {
  providerStreamId: string;
  providerSessionId: string;
  signal?: AbortSignal;
}

// The contract every avatar engine implements. Lifecycle: createStream →
// (browser answers) submitSdpAnswer + submitIceCandidate(s) → speak(...) per
// turn → closeStream.
export interface AvatarProvider {
  readonly id: AvatarProviderId;
  readonly label: string;
  readonly status: AvatarProviderStatus;

  // Whether this provider's required credentials are present. coming_soon
  // providers always return false.
  isConfigured(): boolean;

  createStream(opts: CreateStreamOptions): Promise<CreateStreamResult>;
  submitSdpAnswer(ctx: SignalingContext, answer: SdpDescription): Promise<void>;
  submitIceCandidate(
    ctx: SignalingContext,
    candidate: IceCandidatePayload,
  ): Promise<void>;
  speak(opts: SpeakOptions): Promise<void>;
  closeStream(ctx: SignalingContext): Promise<void>;
}

// Thrown when an operation is attempted on a provider that is not available
// (e.g. a coming_soon engine) or whose credentials are missing. Routes map this
// to a friendly client message rather than a 500.
export class AvatarProviderUnavailableError extends Error {
  readonly providerId: AvatarProviderId;
  constructor(providerId: AvatarProviderId, message: string) {
    super(message);
    this.name = "AvatarProviderUnavailableError";
    this.providerId = providerId;
  }
}
