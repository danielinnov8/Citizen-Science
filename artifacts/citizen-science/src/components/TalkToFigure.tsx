import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Send, Loader2, PhoneOff, Radio, Volume2 } from "lucide-react";
import type { AvatarProviderInfo } from "@/lib/talkable";

// ---------------------------------------------------------------------------
// Types matching the avatar API responses
// ---------------------------------------------------------------------------

interface SdpDescription {
  type: string;
  sdp: string;
}
interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}
interface StartSessionResponse {
  sessionId: string;
  providerId: string;
  offer: SdpDescription;
  iceServers: IceServer[];
  maxDurationMs: number;
  expiresAt: number;
}

type ConnState = "idle" | "connecting" | "live" | "ended" | "error";

// Speak/playback rate for the live <video>. D-ID streams audio at real-time, so
// 1 is natural speed; 0.8 plays the avatar back 20% slower for a calmer, more
// deliberate Einstein. (preservesPitch defaults to true, so the pitch stays
// natural — it does not deepen the voice.)
const PLAYBACK_RATE = 0.8;

// Speech detection (so the portrait shows while Albert listens). D-ID streams a
// blank idle frame while NOT speaking and does not mute the track, so we key off
// the live audio level instead. RMS above SPEAK_RMS = speaking; we keep the video
// on for HANGOVER_MS after the last voiced frame so it doesn't flicker between
// words (and to cover the tail when playbackRate < 1 lags behind the raw stream).
const SPEAK_RMS = 0.02;
const HANGOVER_MS = 1200;

// How long after Albert stops speaking to keep ignoring microphone input. The
// speech recognizer hears Albert's own voice from the speakers and may still be
// finalizing the tail of it just after he goes quiet; dropping that window
// prevents him from transcribing himself and answering his own words.
const ECHO_GUARD_MS = 1500;

// Fallback echo guard used only when the RMS analyser is unavailable (no
// WebAudio / no audio track) and so can't tell us when Albert is speaking. We
// estimate his speech duration from the reply length at ~10 chars/sec (TTS at
// PLAYBACK_RATE 0.8) and suppress the mic for that window plus the base guard.
const SPEAK_CHARS_PER_SEC = 10;

interface Transcript {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface TalkToFigureProps {
  slug: string;
  name: string;
  firstName: string;
  portraitUrl: string;
  accent: string;
  providers: AvatarProviderInfo[];
  onClose: () => void;
}

// Minimal Web Speech API typings (not in the DOM lib) for optional voice input.
interface SpeechResultLike extends ArrayLike<{ transcript: string }> {
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function newId(): string {
  return Math.random().toString(36).slice(2);
}

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TalkToFigure({
  slug,
  name,
  firstName,
  portraitUrl,
  accent,
  providers,
  onClose,
}: TalkToFigureProps) {
  const [providerId, setProviderId] = useState<string>(
    providers.find((p) => p.status === "available" && p.configured)?.id ?? "d-id",
  );
  const [conn, setConn] = useState<ConnState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  // True when the browser blocked autoplay WITH sound, so we fell back to a
  // muted (but animating) stream and need a tap to turn the voice on.
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  // True once the live video element is actually rendering frames. The portrait
  // image stays visible underneath until then (and again after the stream ends),
  // so the figure's face is always on screen — never a blank stage.
  const [videoActive, setVideoActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const expiresAtRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const endedRef = useRef(false);
  // The user's INTENT to keep the mic listening. Speech recognition stops itself
  // after a silence, so we auto-restart while this is true — the mic stays on
  // across turns until the user explicitly toggles it off.
  const listeningRef = useRef(false);

  // WebAudio analyser that taps the live audio track to detect when Albert is
  // actually speaking (so the still portrait can show while he listens). The
  // rAF id drives the level-polling loop; both are torn down with the session.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speakRafRef = useRef<number | null>(null);

  // Half-duplex echo guard. `avatarSpeakingRef` is true while Albert is talking;
  // `recognitionMuteUntilRef` extends a short cooldown after he stops. While
  // either is active, microphone transcripts are dropped so his own voice from
  // the speakers is never fed back as a user turn.
  const avatarSpeakingRef = useRef(false);
  const recognitionMuteUntilRef = useRef(0);
  // True while the RMS analyser loop is running and is the source of truth for
  // "Albert is speaking". When false we fall back to a reply-length estimate.
  const analyserActiveRef = useRef(false);

  const speechSupported = !!getSpeechRecognition();

  // -------------------------------------------------------------------------
  // Teardown
  // -------------------------------------------------------------------------
  const endSession = useCallback(
    (finalState: ConnState = "ended") => {
      if (endedRef.current) return;
      endedRef.current = true;

      listeningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;

      // Reset the half-duplex echo guard so stale state can't leak across a
      // reconnect (e.g. a new session reusing the component instance).
      avatarSpeakingRef.current = false;
      recognitionMuteUntilRef.current = 0;
      analyserActiveRef.current = false;

      // Stop the speech-detection analyser loop and release its audio context.
      if (speakRafRef.current != null) {
        cancelAnimationFrame(speakRafRef.current);
        speakRafRef.current = null;
      }
      const audioCtx = audioCtxRef.current;
      audioCtxRef.current = null;
      if (audioCtx) {
        try {
          void audioCtx.close();
        } catch {
          /* ignore */
        }
      }

      // Release the microphone we held open for the duration of the session.
      const mic = micStreamRef.current;
      micStreamRef.current = null;
      if (mic) {
        try {
          mic.getTracks().forEach((t) => t.stop());
        } catch {
          /* ignore */
        }
      }

      const pc = pcRef.current;
      pcRef.current = null;
      if (pc) {
        try {
          pc.getReceivers().forEach((r) => r.track?.stop());
          pc.close();
        } catch {
          /* ignore */
        }
      }

      const sid = sessionIdRef.current;
      sessionIdRef.current = null;
      if (sid) {
        // Best-effort upstream teardown so we stop paying for the stream.
        void fetch(`/api/avatar/sessions/${sid}`, {
          method: "DELETE",
          keepalive: true,
        }).catch(() => undefined);
      }

      setConn(finalState);
      setListening(false);
      setVideoActive(false);
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Start a live session: create the upstream stream + negotiate WebRTC.
  // -------------------------------------------------------------------------
  const start = useCallback(async () => {
    setError(null);
    setConn("connecting");
    setStatusMessage(`Waking ${firstName}…`);
    setAudioBlocked(false);
    setVideoActive(false);
    endedRef.current = false;
    avatarSpeakingRef.current = false;
    recognitionMuteUntilRef.current = 0;
    analyserActiveRef.current = false;

    // Ask for the microphone up front (while we still have the click's user
    // gesture) so push-to-talk is ready immediately. Denial is non-fatal — the
    // visitor can still type. Keep the stream open for the whole session (the
    // mic stays on, as requested) and release it on teardown in endSession.
    try {
      const mic = await navigator.mediaDevices?.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (mic) micStreamRef.current = mic;
      setMicDenied(false);
    } catch {
      setMicDenied(true);
    }

    try {
      const res = await fetch(`/api/avatar/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, providerId }),
      });

      if (res.status === 401) {
        throw new Error("Please sign in to start a live conversation.");
      }
      if (!res.ok) {
        let msg = `Couldn't start the conversation (${res.status}).`;
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) msg = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as StartSessionResponse;
      sessionIdRef.current = data.sessionId;
      expiresAtRef.current = data.expiresAt;
      setRemainingMs(data.maxDurationMs);

      const pc = new RTCPeerConnection({ iceServers: data.iceServers });
      pcRef.current = pc;

      pc.ontrack = (ev) => {
        const stream = ev.streams[0];
        const el = videoRef.current;
        if (!el || !stream) return;
        el.srcObject = stream;
        // Pin playback rate. D-ID's WebRTC audio is Opus@48kHz; left unpinned the
        // element can drift above 1 and sound sped-up / chipmunk (a known D-ID
        // gotcha). We pin it below real-time (0.8) so Albert speaks 20% slower
        // while keeping audio/video in sync.
        el.playbackRate = PLAYBACK_RATE;
        el.defaultPlaybackRate = PLAYBACK_RATE;
        // Reveal the live talking video ONLY while Albert is actually speaking;
        // the still portrait shows the rest of the time. D-ID streams a blank
        // idle frame (without muting the track) while idle, so the track's mute
        // state is useless here — instead tap the live audio with a WebAudio
        // analyser and key the overlay off the speech level. The analyser is a
        // tap only (never connected to destination), so the element's own audio
        // playback is unaffected.
        setVideoActive(false);
        try {
          const Ctor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (Ctor && stream.getAudioTracks().length > 0) {
            const audioCtx = new Ctor();
            audioCtxRef.current = audioCtx;
            void audioCtx.resume().catch(() => undefined);
            const sourceNode = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            sourceNode.connect(analyser);
            const buf = new Uint8Array(analyser.frequencyBinCount);
            let lastVoiceAt = 0;
            let shown = false;
            const tick = () => {
              if (endedRef.current) return;
              analyser.getByteTimeDomainData(buf);
              let sum = 0;
              for (let i = 0; i < buf.length; i++) {
                const v = (buf[i] - 128) / 128;
                sum += v * v;
              }
              const rms = Math.sqrt(sum / buf.length);
              const now = performance.now();
              if (rms > SPEAK_RMS) lastVoiceAt = now;
              const speaking = now - lastVoiceAt < HANGOVER_MS;
              // Drive the half-duplex echo guard: suppress the mic while Albert
              // speaks and for ECHO_GUARD_MS after, so his own voice can't be
              // transcribed and sent back to him.
              avatarSpeakingRef.current = speaking;
              if (speaking) {
                recognitionMuteUntilRef.current = now + ECHO_GUARD_MS;
              }
              if (speaking !== shown) {
                shown = speaking;
                setVideoActive(speaking);
              }
              speakRafRef.current = requestAnimationFrame(tick);
            };
            analyserActiveRef.current = true;
            speakRafRef.current = requestAnimationFrame(tick);
          } else {
            // No WebAudio / no audio track — fall back to always showing video.
            setVideoActive(true);
          }
        } catch {
          // WebAudio unavailable — fall back to always showing the live video.
          setVideoActive(true);
        }
        // Try to play WITH sound first. If the browser blocks autoplay-with-audio
        // (common when the gesture has expired by the time the track arrives),
        // fall back to a muted play so the avatar still animates, and surface a
        // one-tap "enable sound" control.
        el.muted = false;
        el.play()
          .then(() => setAudioBlocked(false))
          .catch(() => {
            el.muted = true;
            void el.play().catch(() => undefined);
            setAudioBlocked(true);
          });
      };

      pc.onicecandidate = (ev) => {
        const sid = sessionIdRef.current;
        if (!sid) return;
        // The end-of-gathering null candidate is intentionally skipped.
        if (!ev.candidate) return;
        void fetch(`/api/avatar/sessions/${sid}/ice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidate: ev.candidate.candidate,
            sdpMid: ev.candidate.sdpMid,
            sdpMLineIndex: ev.candidate.sdpMLineIndex,
          }),
        }).catch(() => undefined);
      };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        if (st === "connected") {
          setConn("live");
          setStatusMessage("");
        } else if (st === "failed" || st === "disconnected" || st === "closed") {
          if (!endedRef.current && st === "failed") {
            setError("The connection dropped. Please try again.");
            endSession("error");
          }
        }
      };

      await pc.setRemoteDescription(data.offer as RTCSessionDescriptionInit);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const sdpRes = await fetch(`/api/avatar/sessions/${data.sessionId}/sdp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: { type: answer.type, sdp: answer.sdp } }),
      });
      if (!sdpRes.ok) {
        throw new Error("Failed to establish the live connection.");
      }
      setStatusMessage(`Connecting to ${firstName}…`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      endSession("error");
    }
  }, [slug, providerId, firstName, endSession]);

  // -------------------------------------------------------------------------
  // Send a message → figure thinks (Gemini) → avatar speaks it.
  // -------------------------------------------------------------------------
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      const sid = sessionIdRef.current;
      if (!trimmed || !sid || thinking) return;

      // Sending is a fresh user gesture — use it to unmute the live video so
      // Albert's reply is audible. Autoplay WITH sound is blocked when the track
      // first arrives at connect, so the element starts muted; this turns it on.
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.playbackRate = PLAYBACK_RATE;
        if (videoEl.muted) {
          videoEl.muted = false;
          videoEl.play().then(() => setAudioBlocked(false)).catch(() => undefined);
        }
      }
      // The speech-detection analyser context can start suspended until a user
      // gesture; sending is a fresh gesture, so resume it now.
      void audioCtxRef.current?.resume().catch(() => undefined);

      setInput("");
      setThinking(true);
      setError(null);
      setTranscript((prev) => [...prev, { id: newId(), role: "user", text: trimmed }]);

      try {
        const res = await fetch(`/api/avatar/sessions/${sid}/say`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });

        if (res.status === 410) {
          setError("This conversation has ended.");
          endSession("ended");
          return;
        }
        if (!res.ok) {
          let msg = "Couldn't get a reply. Please try again.";
          try {
            const data = (await res.json()) as { error?: string };
            if (data.error) msg = data.error;
          } catch {
            /* ignore */
          }
          throw new Error(msg);
        }

        const data = (await res.json()) as { reply: string; expiresAt?: number };
        if (data.expiresAt) expiresAtRef.current = data.expiresAt;
        setTranscript((prev) => [
          ...prev,
          { id: newId(), role: "assistant", text: data.reply },
        ]);
        // Fallback echo guard: when the RMS analyser isn't running to detect when
        // Albert is speaking, estimate his speech duration from the reply length
        // and suppress the mic for that window so it can't transcribe his voice
        // and feed it back as a user turn.
        if (!analyserActiveRef.current && data.reply) {
          const speakMs = (data.reply.length / SPEAK_CHARS_PER_SEC) * 1000;
          recognitionMuteUntilRef.current =
            performance.now() + ECHO_GUARD_MS + speakMs;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setThinking(false);
      }
    },
    [thinking, endSession],
  );

  // Turn the voice on after an autoplay-with-sound block (a fresh user gesture).
  const enableSound = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.play()
      .then(() => setAudioBlocked(false))
      .catch(() => undefined);
  }, []);

  // -------------------------------------------------------------------------
  // Optional push-to-talk via the Web Speech API.
  // -------------------------------------------------------------------------
  const toggleListening = useCallback(() => {
    if (listeningRef.current) {
      // User turned the mic off — stop for good (do not auto-restart).
      listeningRef.current = false;
      setListening(false);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    // Keep listening continuously across turns — the mic does NOT mute itself
    // after each phrase; it stays on until the user explicitly turns it off.
    rec.continuous = true;
    rec.onresult = (e) => {
      // Half-duplex guard. Drop anything the recognizer heard if the user has
      // turned the mic off, or while Albert is speaking / within the cooldown
      // after — otherwise his own voice from the speakers gets transcribed and
      // sent back, and he talks to himself.
      if (
        !listeningRef.current ||
        avatarSpeakingRef.current ||
        performance.now() < recognitionMuteUntilRef.current
      ) {
        return;
      }
      // With continuous mode, results accumulate; send each finalized phrase.
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r?.isFinal) {
          const said = r[0]?.transcript?.trim() ?? "";
          if (said) void send(said);
        }
      }
    };
    rec.onend = () => {
      // Browsers end recognition after a silence even in continuous mode.
      // Auto-restart while the user still wants the mic on.
      if (listeningRef.current && !endedRef.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through to off */
        }
      }
      setListening(false);
      recognitionRef.current = null;
    };
    rec.onerror = () => {
      // "no-speech"/"aborted" are common and transient; let onend decide whether
      // to restart so a brief silence doesn't turn the mic off.
    };
    recognitionRef.current = rec;
    listeningRef.current = true;
    setListening(true);
    try {
      rec.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
    }
  }, [send]);

  // Countdown timer; auto-ends at the cap.
  useEffect(() => {
    if (conn !== "live" && conn !== "connecting") return;
    const tick = () => {
      const exp = expiresAtRef.current;
      if (exp == null) return;
      const left = exp - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        setStatusMessage("Time's up — this conversation has ended.");
        endSession("ended");
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [conn, endSession]);

  // Tear down on unmount.
  useEffect(() => {
    return () => endSession("ended");
  }, [endSession]);

  const activeProvider = providers.find((p) => p.id === providerId);
  const canSend = conn === "live" && !thinking;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        style={{ background: "rgba(2,6,23,0.82)", backdropFilter: "blur(8px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#0B1120] text-white shadow-2xl"
          style={{ border: `1px solid ${accent}55` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-2.5 w-2.5 rounded-full"
                style={{
                  background: conn === "live" ? "#22c55e" : accent,
                  boxShadow: conn === "live" ? "0 0 12px #22c55e" : "none",
                }}
              />
              <div>
                <div className="text-sm font-semibold leading-tight">
                  Live with {name}
                </div>
                <div className="text-xs text-white/55 leading-tight">
                  {conn === "live"
                    ? "Connected"
                    : conn === "connecting"
                      ? "Connecting…"
                      : conn === "ended"
                        ? "Conversation ended"
                        : "Ready"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {remainingMs != null && (conn === "live" || conn === "connecting") && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono tabular-nums">
                  {formatTime(remainingMs)}
                </span>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.1fr_0.9fr]">
            {/* Video / portrait stage */}
            <div className="relative aspect-[4/5] max-h-[58vh] bg-black md:aspect-auto md:max-h-none md:min-h-[78vh]">
              <img
                src={portraitUrl}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <video
                ref={videoRef}
                playsInline
                autoPlay
                onLoadedMetadata={(e) => {
                  // Re-assert the 10%-slower playback once metadata loads.
                  e.currentTarget.playbackRate = PLAYBACK_RATE;
                }}
                onEmptied={() => setVideoActive(false)}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity: conn === "live" && videoActive ? 1 : 0,
                  transition: "opacity 0.5s",
                }}
              />

              {(conn === "idle" || conn === "connecting" || conn === "error") && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/45 p-6 text-center">
                  {conn === "connecting" && (
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: accent }} />
                  )}
                  {conn === "idle" && (
                    <button
                      onClick={start}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
                      style={{ background: accent }}
                    >
                      <Radio className="h-4 w-4" />
                      Start talking with {firstName}
                    </button>
                  )}
                  {statusMessage && (
                    <p className="max-w-xs text-sm text-white/80">{statusMessage}</p>
                  )}
                  {error && (
                    <p className="max-w-xs text-sm text-red-300">{error}</p>
                  )}
                  {conn === "error" && (
                    <button
                      onClick={start}
                      className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25"
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {conn === "live" && (
                <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  {thinking ? `${firstName} is thinking…` : `${firstName} is listening`}
                </div>
              )}

              {conn === "live" && audioBlocked && (
                <button
                  onClick={enableSound}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg transition-colors hover:bg-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  Tap to enable sound
                </button>
              )}
            </div>

            {/* Conversation panel */}
            <div className="flex min-h-0 max-h-[60vh] flex-col md:max-h-none">
              {/* Provider dropdown */}
              <div className="border-b border-white/10 px-4 py-3">
                <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/45">
                  Avatar engine
                </label>
                <select
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  disabled={conn === "live" || conn === "connecting"}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none disabled:opacity-50"
                >
                  {providers.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.status !== "available" || !p.configured}
                      className="bg-[#0B1120]"
                    >
                      {p.label}
                      {p.status === "coming_soon"
                        ? " — coming soon"
                        : !p.configured
                          ? " — not configured"
                          : ""}
                    </option>
                  ))}
                </select>
                {activeProvider && activeProvider.status !== "available" && (
                  <p className="mt-1.5 text-xs text-amber-300/80">
                    {activeProvider.label} isn't available yet — using D-ID.
                  </p>
                )}
              </div>

              {/* Transcript */}
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {transcript.length === 0 && (
                  <p className="mt-6 text-center text-sm text-white/45">
                    {conn === "live"
                      ? `Say hello to ${firstName}, or ask about relativity, curiosity, or science.`
                      : `Start the conversation to talk with ${firstName} face to face.`}
                  </p>
                )}
                {transcript.map((t) => (
                  <div
                    key={t.id}
                    className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        t.role === "user"
                          ? "bg-white/15 text-white"
                          : "bg-white/5 text-white/90"
                      }`}
                      style={
                        t.role === "assistant"
                          ? { borderLeft: `2px solid ${accent}` }
                          : undefined
                      }
                    >
                      {t.text}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-white/5 px-3.5 py-2 text-sm text-white/60">
                      <Loader2 className="inline h-3.5 w-3.5 animate-spin" /> thinking…
                    </div>
                  </div>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-white/10 px-4 py-3">
                {error && conn !== "error" && (
                  <p className="mb-2 text-xs text-red-300">{error}</p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                  className="flex items-center gap-2"
                >
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={!canSend}
                      className={`rounded-full p-2.5 transition-colors disabled:opacity-40 ${
                        listening ? "bg-red-500/80 text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                      aria-label={listening ? "Stop listening" : "Speak"}
                    >
                      {listening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={!canSend}
                    placeholder={
                      conn === "live"
                        ? `Ask ${firstName} something…`
                        : "Start the conversation first"
                    }
                    className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-white/30 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!canSend || !input.trim()}
                    className="rounded-full p-2.5 text-white transition-transform hover:scale-105 disabled:opacity-40"
                    style={{ background: accent }}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                {micDenied && (conn === "live" || conn === "connecting") && (
                  <p className="mt-2 text-xs text-amber-300/80">
                    Microphone access is blocked — you can still type. Enable the mic
                    in your browser's site settings to talk out loud.
                  </p>
                )}
                {(conn === "live" || conn === "connecting") && (
                  <button
                    onClick={() => endSession("ended")}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-red-300"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                    End conversation
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
