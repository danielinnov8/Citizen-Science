---
name: D-ID live talking avatar
description: How the live "Talk to {figure}" WebRTC talking-head feature is wired, and the non-obvious D-ID/voice gotchas.
---

# Live talking-avatar (D-ID) integration

The "Talk to {figure}" feature animates a still portrait into a real-time WebRTC
talking head that converses in-character. Pipeline: Gemini persona brain →
D-ID streaming WebRTC video lip-syncs the reply, voice synthesized server-side
over the live stream. Voice engine is per-persona: built-in Microsoft, OR a
voice cloned inside D-ID (ElevenLabs engine) once on a PAID plan (see below).

## Provider-agnostic by design
- Engine selection goes through a registry (D-ID available; Simli/HeyGen are
  `coming_soon` placeholders that throw `AvatarProviderUnavailableError`). Add a
  new engine by implementing the `AvatarProvider` interface — routes never change.

## Own-keys pattern (NOT Replit connectors)
- Uses the figure's OWN `D_ID_API_KEY` env secret, same reason as GEMINI/YOUTUBE:
  the Replit AI proxy isn't reachable on Cloud Run.
- Only `D_ID_API_KEY` is required for D-ID to be "configured" — D-ID drives the
  video AND synthesizes the voice. The cloned voice is also a D-ID-managed voice
  (cloned inside D-ID, billed on the same key), so still no second secret/account.

## CRITICAL: streaming speak only accepts `script.type:"text"` (no audio_url)
- The live STREAMING speak `POST /talks/streams/{id}` validates `script.type` ∈
  `['text']` ONLY. It returns 400 ValidationError on `type:"audio"` (`audio_url`).
  So you CANNOT lip-sync a pre-synthesized audio file over the live stream.
- `audio_url` (`script.type:"audio"`) is supported ONLY by the NON-streaming
  `POST /talks` render endpoint — a *different* API that produces a finished mp4
  `result_url`. Do not conflate the two: an audio_url test that "worked" was on
  `/talks`, not on `/talks/streams/{id}`. (This trap cost a full iteration.)

## Cloned voice over the live stream — works on a PAID plan (NOT free)
- The voice engine is chosen per-persona via `script.provider.type`:
  `"microsoft"` (built-in Azure voice) or `"elevenlabs"` (a voice cloned INSIDE
  D-ID, which runs on the ElevenLabs engine). `speak()` sends
  `provider:{ type: opts.voiceProvider ?? "microsoft", voice_id }` — default stays
  microsoft so personas without a `voiceProvider` are unchanged.
- **Plan gate is the whole story**: on the FREE plan
  `script.provider={type:"elevenlabs"}` → 500 on `/talks` ("RangeError: Invalid
  status code: undefined" — D-ID's handler crashing on a paywall, not a real bug).
  After upgrading to **deid-pro** and cloning the voice in D-ID, the SAME request
  returns 201 and renders `status:"done"` with a `result_url`. So a 500 on an
  elevenlabs provider almost always means "not on a paid plan / no clone", not bad
  request shape. Don't burn iterations debugging the payload — check the plan.
- Einstein's persona now uses `voiceId:"cDzX7JzYZfIiv9TXt4iW"` (the in-D-ID clone
  named "alberto") with `voiceProvider:"elevenlabs"`. A D-ID clone id looks like a
  raw ElevenLabs voice id (20-char), NOT a `vcl_...` id.

## Listing voices: use `/tts/voices`, NOT `/voices`
- `GET https://api.d-id.com/tts/voices` (auth `Basic <D_ID_API_KEY>`) returns the
  account's TTS voices INCLUDING clones — that's how the clone's id was found.
- `GET /voices` and `/clips/voices` are behind a DIFFERENT (AWS API Gateway) auth:
  raw key → 403 "Invalid key=value pair…"; base64'd key → 403 demanding SigV4
  `Credential/Signature/SignedHeaders`. Don't fight it; `/tts/voices` is the list
  endpoint that works with the normal Basic key. (`/credits`, `/talks`,
  `/talks/streams` also take the normal Basic key fine.)

## D-ID streaming API gotchas (verified against docs.d-id.com)
- Auth header is `Authorization: Basic <D_ID_API_KEY>` — the key is used
  *directly* as the Basic credential (it already encodes email:key). Do NOT
  base64 it again.
- Flow: `POST /talks/streams {source_url, stream_warmup}` → returns
  `{id, session_id, offer, ice_servers}`; browser answers → `POST .../sdp
  {answer, session_id}`; trickle ICE → `POST .../ice {candidate, sdpMid,
  sdpMLineIndex, session_id}`; speak → `POST /talks/streams/{id} {script,
  config:{stitch:true}, session_id}`; end → `DELETE /talks/streams/{id}
  {session_id}`.

## Cost control / session model
- Paid per-minute APIs, so every session is hard-capped server-side
  (`SESSION_MAX_MS`, currently 3 min) in an in-memory Map keyed by our own
  session id. The browser never sees the provider's stream/session ids.
- Expired or abandoned sessions are reaped opportunistically and the upstream
  stream is torn down (DELETE) so billing stops.

## Auth & routing
- Capability endpoint `GET /api/avatar/figures/:slug` is PUBLIC (no secrets) so a
  public profile page can decide whether to render the button.
- The feature is UNGATED (open to guests) — `requireAuth` was removed from the
  avatar router. Ownership of an active session is enforced by possession of the
  unguessable random session id (a capability token), not by user identity, so
  `AvatarSession.userId` is nullable and the per-session ownership checks were
  dropped. Cost is bounded by the per-IP rate limit on `/sessions` + the hard
  per-session duration cap. Frontend just opens the modal (no `/login` bounce).

## Portrait must be self-hosted (D-ID can't hotlink Wikimedia)
- D-ID downloads `source_url` SERVER-SIDE and Wikimedia (and similar) block
  data-center fetchers → `400 BadRequestError "cannot download image"` even when
  the same URL returns 200 from curl here. Fix: host the portrait in the web
  app's `public/` (`/avatars/<slug>.jpg`) and store a SITE-RELATIVE path in the
  persona; `toAbsoluteUrl()` in avatar.ts joins it onto the public origin
  (`PUBLIC_BASE_URL` or `https://<REPLIT_DOMAINS[0]>`) at session start. Works in
  dev (proxy → web app serves /public) and prod (single-origin Cloud Run serves
  the built SPA's public/). Keep portraits small (~720px / <200KB) for D-ID.

## Client WebRTC playback gotchas (the "no voice / avatar frozen" class)
- The D-ID media arrives as ONE stream with both video+audio. A `<video autoPlay>`
  with sound is blocked by browser autoplay policy if the user gesture has expired
  by the time `ontrack` fires (it fires after SDP/ICE round-trips). A blocked
  `play()` freezes the WHOLE element — so the avatar looks dead AND there's no
  voice, even though the server `/say` returned 200. Fix: in `ontrack` try
  `el.muted=false; play()`; on reject, `el.muted=true; play()` (so it still
  ANIMATES) and show a one-tap "enable sound" button that unmutes on a fresh
  gesture. Do NOT diagnose this as a D-ID/voice bug — check `/say` returned 200.
- Request mic permission up front inside the start() click gesture via
  `getUserMedia({audio:true})`. KEEP the stream open for the whole session (store
  in a `micStreamRef`) so the mic indicator stays on, and stop the tracks only in
  `endSession` teardown — the user explicitly wanted the mic to stay on after
  granting. (Do NOT stop the tracks right after the prompt.)
- **Reliable audio without an extra tap**: the warmup track arrives at connect
  (gesture expired) so the element ends up muted. Rather than relying only on the
  "enable sound" button, ALSO unmute the `<video>` inside `send()` — sending a
  message (form submit / voice result) is a fresh user gesture, so setting
  `el.muted=false; el.play()` there makes Albert's very next reply audible. Keep
  the button as a fallback for the voice-only path.
- **Continuous mic across turns**: the user disliked the mic stopping after each
  phrase. Use Web Speech `recognition.continuous=true` AND track desired state in
  a `listeningRef`; in `onend` (browsers still stop after a silence) auto-restart
  `rec.start()` while `listeningRef.current && !endedRef.current`. Toggling off or
  `endSession` sets `listeningRef=false` so it stops for good. In continuous mode
  results accumulate — iterate from `e.resultIndex` and send only `isFinal` ones.
- **Keep the portrait on screen**: the still portrait `<img>` is a persistent base
  layer (always opacity 1); the live `<video>` overlay only fades in while the
  avatar is actually speaking and fades back out otherwise, so the face is never a
  blank/white stage during connect, idle, or after the stream ends.
- **Detect "speaking" from the AUDIO LEVEL, not the track mute state or `onPlaying`**:
  D-ID does NOT mute the video track while idle — it continuously streams a blank
  "idle" frame (renders as a white "loading circle"), so `videoTrack.onmute/onunmute`
  never fires and `videoActive` stays true, covering the portrait the whole time
  (two failed attempts: `onPlaying` and track-mute). The reliable signal is the
  live audio: in `ontrack`, build a WebAudio `AnalyserNode` from
  `audioCtx.createMediaStreamSource(stream)` (a TAP — do NOT connect to destination,
  or you double/route the element's audio), poll RMS via rAF, and set
  `videoActive = (now - lastVoiceAt < HANGOVER_MS)` with `SPEAK_RMS≈0.02`,
  `HANGOVER≈1200ms`. Init `videoActive=false`. The ctx can start suspended, so
  `resume()` it in `ontrack` AND in `send()` (a fresh gesture). Tear down (cancel
  rAF + `audioCtx.close()`) in `endSession`. Fallback to `videoActive=true` if
  WebAudio/audio track is missing.
- **Speak rate**: slow/normal speed is controlled purely client-side via the
  `<video>` `playbackRate` (set in `ontrack`, `onLoadedMetadata`, and `send()`).
  0.8 = 20% slower; `preservesPitch` defaults true so it doesn't deepen the voice.
  Don't let it drift ABOVE 1 (chipmunk). There is no need to change TTS server-side.
  Caveat: `playbackRate<1` makes the element lag the raw stream, so the RMS detector
  (which taps the raw stream in real time) goes silent before the slowed tail finishes
  — the `HANGOVER_MS` is sized generously to mask this on short replies.
