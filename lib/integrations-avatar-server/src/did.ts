import {
  type AvatarProvider,
  type AvatarProviderId,
  type CreateStreamOptions,
  type CreateStreamResult,
  type IceCandidatePayload,
  type SdpDescription,
  type SignalingContext,
  type SpeakOptions,
  AvatarProviderUnavailableError,
} from "./types";

const D_ID_BASE_URL = "https://api.d-id.com";

// D-ID API keys are used directly as HTTP Basic credentials:
// `Authorization: Basic <D_ID_API_KEY>` (the key already encodes email:key).
function authHeader(): string {
  const key = process.env.D_ID_API_KEY;
  if (!key) {
    throw new AvatarProviderUnavailableError(
      "d-id",
      "D_ID_API_KEY is not set. Add it in the Secrets tab to enable the live avatar.",
    );
  }
  return `Basic ${key}`;
}

async function didFetch(
  path: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
  method: "POST" | "DELETE" = "POST",
): Promise<unknown> {
  const res = await fetch(`${D_ID_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `D-ID request failed (${res.status} ${res.statusText})${
        detail ? `: ${detail.slice(0, 500)}` : ""
      }`,
    );
  }

  // DELETE and some POSTs may return an empty body.
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

interface DidCreateResponse {
  id?: string;
  session_id?: string;
  offer?: SdpDescription;
  ice_servers?: { urls: string | string[]; username?: string; credential?: string }[];
}

// D-ID streaming talking-head provider. Animates a single still portrait over
// WebRTC and speaks lines using D-ID's built-in (Microsoft/Azure) TTS voice.
// Uses the figure's own D_ID_API_KEY so it works on Cloud Run.
export class DidAvatarProvider implements AvatarProvider {
  readonly id: AvatarProviderId = "d-id";
  readonly label = "D-ID";
  readonly status = "available" as const;

  isConfigured(): boolean {
    // D-ID drives the WebRTC stream AND synthesizes the voice (built-in native
    // TTS), so a single D_ID_API_KEY is all that's required.
    return !!process.env.D_ID_API_KEY;
  }

  async createStream(opts: CreateStreamOptions): Promise<CreateStreamResult> {
    const data = (await didFetch(
      "/talks/streams",
      { source_url: opts.sourceUrl, stream_warmup: true },
      opts.signal,
    )) as DidCreateResponse;

    if (!data.id || !data.session_id || !data.offer) {
      throw new Error("D-ID did not return a valid stream session.");
    }

    return {
      providerStreamId: data.id,
      providerSessionId: data.session_id,
      offer: data.offer,
      iceServers: data.ice_servers ?? [],
    };
  }

  async submitSdpAnswer(
    ctx: SignalingContext,
    answer: SdpDescription,
  ): Promise<void> {
    await didFetch(
      `/talks/streams/${ctx.providerStreamId}/sdp`,
      { answer, session_id: ctx.providerSessionId },
      ctx.signal,
    );
  }

  async submitIceCandidate(
    ctx: SignalingContext,
    candidate: IceCandidatePayload,
  ): Promise<void> {
    await didFetch(
      `/talks/streams/${ctx.providerStreamId}/ice`,
      {
        candidate: candidate.candidate,
        sdpMid: candidate.sdpMid,
        sdpMLineIndex: candidate.sdpMLineIndex,
        session_id: ctx.providerSessionId,
      },
      ctx.signal,
    );
  }

  async speak(opts: SpeakOptions): Promise<void> {
    // The live STREAMING speak endpoint only accepts `script.type: "text"` with
    // a TTS provider — it rejects `type: "audio"` (a pre-made audio_url is only
    // supported by the non-streaming /talks render API). The voice engine is
    // chosen per-persona: "microsoft" for a built-in Azure voice, or "elevenlabs"
    // for a voice cloned inside D-ID (a paid-plan feature). Defaults to microsoft.
    await didFetch(
      `/talks/streams/${opts.providerStreamId}`,
      {
        script: {
          type: "text",
          input: opts.text,
          provider: {
            type: opts.voiceProvider ?? "microsoft",
            voice_id: opts.voiceId,
          },
        },
        config: { stitch: true },
        session_id: opts.providerSessionId,
      },
      opts.signal,
    );
  }

  async closeStream(ctx: SignalingContext): Promise<void> {
    await didFetch(
      `/talks/streams/${ctx.providerStreamId}`,
      { session_id: ctx.providerSessionId },
      ctx.signal,
      "DELETE",
    );
  }
}
