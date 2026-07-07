import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Check, RefreshCw, Send, Sparkles } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { streamChatRequest } from "@/components/chat/streamChat";
import {
  completeOnboarding as completeOnboardingRequest,
  useGetFeaturedProfile,
  getGetFeaturedProfileQueryKey,
  type CompleteOnboardingInput,
} from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Story-driven onboarding (Task #160). A full-screen cinematic interview: an
// AI guide asks one question per scene, streamed live; quick-reply chips let
// members tap an answer or type freely. Answers persist server-side. When the
// guide is unreachable, a static question path (the old wizard's questions,
// restyled as story beats) takes over so onboarding never blocks.
// ---------------------------------------------------------------------------

const GOAL_ROUTE: Record<string, string> = {
  "great-minds": "/directory",
  "ai-tools": "/agent",
  experiments: "/experiments",
  mentor: "/mentors",
  expertise: "/categories",
  connect: "/directory",
  "share-knowledge": "/mentors",
};

// --- Static fallback path (no AI required) ---------------------------------

interface FallbackQuestion {
  key: "role" | "interest" | "primaryGoal" | "ambition";
  eyebrow: string;
  title: string;
  sub: string;
  options: { id: string; label: string }[];
}

const FALLBACK_QUESTIONS: FallbackQuestion[] = [
  {
    key: "role",
    eyebrow: "Your story",
    title: "Every discovery begins with a person. Who are you?",
    sub: "There is no wrong door into science.",
    options: [
      { id: "student", label: "A student" },
      { id: "researcher", label: "A researcher" },
      { id: "professional", label: "A professional" },
      { id: "educator", label: "An educator" },
      { id: "founder", label: "A founder" },
      { id: "explorer", label: "A curious explorer" },
    ],
  },
  {
    key: "interest",
    eyebrow: "Your fascination",
    title: "Which corner of the universe pulls at you most?",
    sub: "Pick the one you can't stop thinking about.",
    options: [
      { id: "Space & Astronomy", label: "Space & astronomy" },
      { id: "Life Sciences & Biology", label: "Life & biology" },
      { id: "AI & Computing", label: "AI & computing" },
      { id: "Physics", label: "Physics" },
      { id: "Neuroscience & Mind", label: "The mind" },
      { id: "Climate & Earth", label: "Climate & Earth" },
      { id: "Medicine & Health", label: "Medicine & health" },
      { id: "Chemistry", label: "Chemistry" },
    ],
  },
  {
    key: "primaryGoal",
    eyebrow: "Your compass",
    title: "What did you come here to find?",
    sub: "We'll open that door first.",
    options: [
      { id: "great-minds", label: "The great minds of science" },
      { id: "ai-tools", label: "An AI research copilot" },
      { id: "experiments", label: "Real experiments to run" },
      { id: "mentor", label: "A mentor in my field" },
      { id: "expertise", label: "Deep domain knowledge" },
      { id: "connect", label: "A community of researchers" },
    ],
  },
  {
    key: "ambition",
    eyebrow: "Your horizon",
    title: "And if it all works — what happens?",
    sub: "Think big. That's what this place is for.",
    options: [
      { id: "curiosity", label: "I feed a lifelong curiosity" },
      { id: "career", label: "I advance my career" },
      { id: "contribute", label: "I contribute to real science" },
      { id: "discovery", label: "I make a discovery" },
      { id: "transition", label: "I change my path" },
      { id: "inspire", label: "I inspire the next generation" },
    ],
  },
];

// --- Guide-text marker parsing ----------------------------------------------

interface ParsedGuideText {
  display: string;
  chips: string[];
  complete: boolean;
}

// Strip the hidden [[chips:...]] / [[complete]] markers from the streamed
// guide text. A trailing partial marker (split across SSE chunks) is held
// back so it never flashes on screen.
function parseGuideText(raw: string): ParsedGuideText {
  const complete = raw.includes("[[complete]]");
  let chips: string[] = [];
  const chipMatch = raw.match(/\[\[chips:([^\]]*)\]\]/);
  if (chipMatch) {
    chips = chipMatch[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
  }
  let display = raw
    .replace(/\[\[chips:[^\]]*\]\]/g, "")
    .replace(/\[\[complete\]\]/g, "");
  const partial = display.lastIndexOf("[[");
  if (partial !== -1 && display.indexOf("]]", partial) === -1) {
    display = display.slice(0, partial);
  }
  return { display: display.trim(), chips, complete };
}

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const INTERVIEW_QUESTIONS = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Mode = "intro" | "ai" | "fallback" | "closing";

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, completeOnboarding } = useAuth();

  // Claimant entry: a living innovator who just claimed their profile carries
  // the slug in via localStorage (set by ProfileOwnership).
  const [claimSlug] = useState<string | null>(() => {
    try {
      const v = window.localStorage.getItem("cs.onboardingClaimSlug");
      return v && /^[a-z0-9-]{1,120}$/.test(v) ? v : null;
    } catch {
      return null;
    }
  });

  const { data: claimProfile } = useGetFeaturedProfile(claimSlug ?? "", {
    query: {
      queryKey: getGetFeaturedProfileQueryKey(claimSlug ?? ""),
      enabled: !!claimSlug,
      staleTime: 60_000,
    },
  });

  const [mode, setMode] = useState<Mode>("intro");

  // --- AI interview state ---
  const [turns, setTurns] = useState<Turn[]>([]);
  const [guideRaw, setGuideRaw] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamFailed, setStreamFailed] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const failedAttemptsRef = useRef(0);

  // --- fallback state ---
  const [fbStep, setFbStep] = useState(0);
  const [fbAnswers, setFbAnswers] = useState<Record<string, string>>({});

  // --- completion ---
  const [saving, setSaving] = useState(false);

  const guide = useMemo(() => parseGuideText(guideRaw), [guideRaw]);
  // Safety net: the server forces the closing beat after the 4th answer, but
  // even if the [[complete]] marker never arrives, the interview still ends.
  const interviewDone =
    (guide.complete || answerCount >= INTERVIEW_QUESTIONS) && !isStreaming;

  useEffect(() => () => abortRef.current?.abort(), []);

  // Ask the guide for its next turn given the conversation so far.
  async function requestGuideTurn(history: Turn[]) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setGuideRaw("");
    setIsStreaming(true);
    setStreamFailed(false);

    const outcome = await streamChatRequest(
      "/api/onboarding/interview",
      {
        messages: history,
        ...(claimSlug ? { profileSlug: claimSlug } : {}),
      },
      controller.signal,
      {
        onContent: (accumulated) => setGuideRaw(accumulated),
        onSources: () => {},
        onVideo: () => {},
      },
    );

    setIsStreaming(false);
    if (outcome.kind === "aborted") return;
    if (outcome.kind === "ok") {
      failedAttemptsRef.current = 0;
      setTurns([...history, { role: "assistant", content: outcome.accumulated }]);
      return;
    }
    if (outcome.kind === "stream-error" && outcome.accumulated) {
      failedAttemptsRef.current = 0;
      setTurns([...history, { role: "assistant", content: outcome.accumulated }]);
      return;
    }
    // empty / network-error / rate / limit / stream-error with no text: the
    // static question path takes over so onboarding never blocks. Opening
    // beat → fall back immediately; mid-interview → allow one retry (for
    // transient blips), then fall back automatically.
    failedAttemptsRef.current += 1;
    if (history.length === 0 || failedAttemptsRef.current > 1) {
      setStreamFailed(false);
      setMode("fallback");
    } else {
      setStreamFailed(true);
    }
  }

  function beginStory() {
    setMode("ai");
    void requestGuideTurn([]);
  }

  function submitAnswer(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    const history: Turn[] = [...turns, { role: "user", content: trimmed }];
    setTurns(history);
    setAnswerCount((c) => c + 1);
    setInput("");
    void requestGuideTurn(history);
  }

  function retryTurn() {
    // Re-request with the same history (last entry is the member's answer).
    void requestGuideTurn(turns);
  }

  function buildTranscript(): string {
    return turns
      .map((t) =>
        t.role === "assistant"
          ? `guide: ${parseGuideText(t.content).display}`
          : `member: ${t.content}`,
      )
      .join("\n")
      .slice(0, 11000);
  }

  // Persist to the server, mark onboarded, and route onward.
  async function finish(source: "agentic" | "fallback") {
    if (saving) return;
    setSaving(true);

    const payload: CompleteOnboardingInput =
      source === "agentic"
        ? {
            source,
            path: claimSlug ? "claimant" : "member",
            ...(claimSlug ? { profileSlug: claimSlug } : {}),
            transcript: buildTranscript(),
          }
        : {
            source,
            path: claimSlug ? "claimant" : "member",
            ...(claimSlug ? { profileSlug: claimSlug } : {}),
            ...(fbAnswers.role ? { role: fbAnswers.role } : {}),
            ...(fbAnswers.interest ? { interests: [fbAnswers.interest] } : {}),
            ...(fbAnswers.primaryGoal
              ? { primaryGoal: fbAnswers.primaryGoal }
              : {}),
            ...(fbAnswers.ambition ? { ambition: fbAnswers.ambition } : {}),
            // Preserve any partial AI conversation that happened before the
            // guide failed and the static path took over.
            ...(turns.length > 0 ? { transcript: buildTranscript() } : {}),
          };

    let goal: string | null = fbAnswers.primaryGoal ?? null;
    try {
      const state = await completeOnboardingRequest(payload);
      goal = state.record?.primaryGoal ?? goal;
    } catch {
      // Saving must never trap the member in onboarding — the local flag
      // keeps the gate open and the legacy backfill retries next session.
    }

    completeOnboarding();

    let pendingPrompt: string | null = null;
    let redirect: string | null = null;
    try {
      window.localStorage.removeItem("cs.onboardingClaimSlug");
      pendingPrompt = window.localStorage.getItem("cs.pendingPrompt");
      redirect = window.localStorage.getItem("cs.postAuthRedirect");
    } catch {
      /* ignore */
    }
    const safeRedirect = redirect && /^\/(?!\/)/.test(redirect) ? redirect : null;
    if (safeRedirect) {
      try {
        window.localStorage.removeItem("cs.postAuthRedirect");
      } catch {
        /* ignore */
      }
      setLocation(safeRedirect);
    } else if (pendingPrompt && pendingPrompt.trim().length > 0) {
      setLocation("/agent");
    } else {
      setLocation((goal && GOAL_ROUTE[goal]) ?? "/dashboard");
    }
  }

  // --- shared styling ---
  const chipClass =
    "px-4 py-2.5 rounded-full text-sm font-medium border border-white/12 bg-white/5 text-slate-200 hover:bg-blue-600/25 hover:border-blue-500/60 hover:text-white transition-all duration-200";

  const fbQuestion = FALLBACK_QUESTIONS[fbStep];
  const fbDone = fbStep >= FALLBACK_QUESTIONS.length;

  const claimName = claimProfile?.name ?? null;
  const firstName = (user?.name ?? "").split(/\s+/)[0] || null;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-8 pb-12"
      style={{
        background:
          "radial-gradient(ellipse at 25% 15%, #1e3a5f30 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, #1e3a6020 0%, transparent 50%), #080D18",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <LogoIcon className="h-7 w-7" />
        <span className="text-white/80 font-semibold text-base tracking-tight">
          Humanity's Research Network
        </span>
      </div>

      {/* Progress dots (interview + fallback) */}
      {(mode === "ai" || mode === "fallback") && (
        <div className="flex items-center gap-2 mb-8" aria-hidden>
          {Array.from(
            { length: mode === "ai" ? INTERVIEW_QUESTIONS : FALLBACK_QUESTIONS.length },
            (_, i) => {
              const current =
                mode === "ai"
                  ? Math.min(answerCount, INTERVIEW_QUESTIONS)
                  : fbStep;
              return (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-blue-500"
                      : i < current
                        ? "w-2 h-2 bg-blue-500/60"
                        : "w-2 h-2 bg-white/15"
                  }`}
                />
              );
            },
          )}
        </div>
      )}

      <div className="w-full max-w-xl flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ---- Intro scene ---- */}
          {mode === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-blue-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6"
              >
                {claimName ? "A door opens" : "Your story begins"}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="font-serif text-4xl sm:text-5xl text-white leading-tight mb-5"
              >
                {claimName
                  ? `Welcome, ${claimName}.`
                  : firstName
                    ? `Welcome, ${firstName}.`
                    : "Every discovery starts with a story."}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-slate-400 text-base leading-relaxed max-w-md mx-auto mb-10"
              >
                {claimName
                  ? "The network has been waiting for you. Before you step in, your guide would like a few words — so this place can be shaped around your work."
                  : "Before you enter the network, your guide would like to ask a few questions. Answer in your own words — there are no wrong answers, only your story."}
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.5 }}
                onClick={beginStory}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40"
              >
                Begin
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* ---- AI interview scene ---- */}
          {mode === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              <div className="min-h-[180px]">
                <p className="text-blue-400 text-xs font-semibold tracking-[0.25em] uppercase mb-5">
                  Your guide
                </p>
                <p
                  aria-live="polite"
                  className="font-serif text-2xl sm:text-[1.75rem] text-white leading-snug whitespace-pre-line"
                >
                  {guide.display}
                  {isStreaming && (
                    <span className="inline-block w-2 h-6 ml-1 align-middle bg-blue-400/80 animate-pulse rounded-sm" />
                  )}
                </p>
                {!guide.display && isStreaming && (
                  <p className="text-slate-500 text-sm mt-2">
                    The guide is gathering their thoughts…
                  </p>
                )}
              </div>

              {streamFailed && (
                <div className="mt-6">
                  <p className="text-slate-400 text-sm mb-3">
                    The guide lost its voice for a moment.
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      onClick={retryTurn}
                      className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try again
                    </button>
                    <button
                      onClick={() => {
                        setStreamFailed(false);
                        setMode("fallback");
                      }}
                      className="text-slate-400 hover:text-slate-200 text-sm font-medium underline underline-offset-4 decoration-slate-600"
                    >
                      Answer a few quick questions instead
                    </button>
                  </div>
                </div>
              )}

              {/* Closing beat: interview complete */}
              {interviewDone && !streamFailed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mt-10"
                >
                  <button
                    onClick={() => void finish("agentic")}
                    disabled={saving}
                    className="w-full py-4 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40 disabled:opacity-60 inline-flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      "Preparing your journey…"
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Enter the Network
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Answer area */}
              {!interviewDone && !streamFailed && !isStreaming && guide.display && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8"
                >
                  {guide.chips.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mb-5">
                      {guide.chips.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => submitAnswer(chip)}
                          className={chipClass}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitAnswer(input);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        guide.chips.length > 0
                          ? "…or answer in your own words"
                          : "Answer in your own words"
                      }
                      maxLength={1000}
                      className="flex-1 bg-white/5 border border-white/12 rounded-full px-5 py-3.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Send answer"
                      className="h-11 w-11 flex-shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/8 disabled:text-slate-600 text-white flex items-center justify-center transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ---- Static fallback scene ---- */}
          {mode === "fallback" && !fbDone && (
            <motion.div
              key={`fb-${fbStep}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-blue-400 text-xs font-semibold tracking-[0.25em] uppercase mb-5">
                {fbQuestion.eyebrow}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight mb-2">
                {fbQuestion.title}
              </h2>
              <p className="text-slate-400 text-sm mb-8">{fbQuestion.sub}</p>
              <div className="flex flex-wrap gap-2.5">
                {fbQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setFbAnswers((prev) => ({
                        ...prev,
                        [fbQuestion.key]: opt.id,
                      }));
                      setFbStep((s) => s + 1);
                    }}
                    className={chipClass}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---- Fallback closing scene ---- */}
          {mode === "fallback" && fbDone && (
            <motion.div
              key="fb-done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center"
            >
              <div className="h-16 w-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-6">
                <Check className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="font-serif text-4xl text-white mb-3 leading-tight">
                Your journey is ready.
              </h2>
              <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto">
                Humanity's Research Network connects you with the greatest
                minds, AI-powered discovery, and a community building the
                future of science.
              </p>
              <button
                onClick={() => void finish("fallback")}
                disabled={saving}
                className="w-full py-4 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40 disabled:opacity-60"
              >
                {saving ? "Preparing your journey…" : "Enter the Network"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip affordance — onboarding must never feel like a cage. */}
      {mode !== "intro" && (
        <button
          onClick={() => void finish(mode === "fallback" ? "fallback" : "agentic")}
          disabled={saving}
          className="mt-8 text-slate-600 hover:text-slate-400 text-xs transition-colors"
        >
          Skip for now
        </button>
      )}
    </div>
  );
}
