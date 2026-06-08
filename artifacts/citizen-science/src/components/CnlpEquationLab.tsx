import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Scissors,
  BookOpen,
  Radar,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Manu Rehani's cNLP — "Relative Measure of Meaning" (RMM) — broken down into a
// guided, interactive walkthrough. The five conceptual stages mirror the cNLP
// explainer: tokens → PMM → proximity (PF) → adjust PMMs → RMM. A live "meaning
// lab" then lets the learner watch the same word resolve to different meanings
// depending on its neighbors, followed by a short quiz.
// ---------------------------------------------------------------------------

const ACCENT = "#7C3AED"; // violet
const ACCENT_DEEP = "#5B21B6";

interface Stage {
  n: number;
  key: string;
  title: string;
  term: string;
  icon: typeof Scissors;
  blurb: string;
  detail: string;
}

const STAGES: Stage[] = [
  {
    n: 1,
    key: "tokens",
    title: "Break content into tokens",
    term: "Tokens",
    icon: Scissors,
    blurb: "Split the writing into smaller pieces.",
    detail:
      "A piece of content — a paragraph, a page, a sentence — is divided into smaller parts called tokens. A token can be a sound, a symbol, a letter, a whole word, or even an entire sentence. Everything that follows is built on these pieces.",
  },
  {
    n: 2,
    key: "pmm",
    title: "Measure each token's meaning",
    term: "PMM",
    icon: BookOpen,
    blurb: "Give every token its baseline meaning.",
    detail:
      "For each token the computer estimates its generally accepted significance — for a word, its dictionary meaning plus a cloud of synonyms. This baseline value is the Probable Measure of Meaning (PMM). On its own, an ambiguous word like “bank” carries more than one possible PMM.",
  },
  {
    n: 3,
    key: "pf",
    title: "Calculate proximity for neighbors",
    term: "PF",
    icon: Radar,
    blurb: "Find the target's neighbors and how often they appear.",
    detail:
      "Pick one token (the target). The computer looks at the tokens around it — the words just before and after — and asks who the neighbors are and how frequently they show up nearby in this context. That frequency is each neighbor's Probability Function (PF).",
  },
  {
    n: 4,
    key: "adjust",
    title: "Adjust PMMs by proximity",
    term: "Adjusted PMM",
    icon: SlidersHorizontal,
    blurb: "Weight each neighbor's meaning by how close it is.",
    detail:
      "Each neighbor's PMM is scaled by its PF. A neighbor that shows up often and close to the target pulls harder on the meaning; a distant or rare one barely matters. The result is a set of proximity-weighted contributions.",
  },
  {
    n: 5,
    key: "rmm",
    title: "Build the Relative Measure of Meaning",
    term: "RMM",
    icon: Sparkles,
    blurb: "Blend everything into context-aware meaning.",
    detail:
      "Finally the target's own PMM is combined with the adjusted PMMs of its neighbors to produce the Relative Measure of Meaning (RMM) — how the token means in the context of the whole content, not in isolation.",
  },
];

interface Neighbor {
  token: string;
  pmm: number; // baseline meaning on the Nature(−1) ↔ Finance(+1) axis
  pf: number; // proximity weight (0–1)
}

interface Example {
  key: string;
  label: string;
  sentence: string[];
  target: string;
  basePmm: number;
  neighbors: Neighbor[];
}

// A classic word-sense example: the token "bank" resolves differently depending
// on its neighbors. Meaning is modelled on a single axis from Nature (−1, a
// river's edge) to Finance (+1, a money bank); the target's own PMM is 0
// (perfectly ambiguous) so the neighbors do all the disambiguating.
const EXAMPLES: Example[] = [
  {
    key: "river",
    label: "“I relaxed on the river bank at sunset.”",
    sentence: ["I", "relaxed", "on", "the", "river", "bank", "at", "sunset"],
    target: "bank",
    basePmm: 0,
    neighbors: [
      { token: "river", pmm: -0.9, pf: 0.6 },
      { token: "sunset", pmm: -0.4, pf: 0.25 },
      { token: "relaxed", pmm: -0.2, pf: 0.15 },
    ],
  },
  {
    key: "finance",
    label: "“I deposited my paycheck at the bank downtown.”",
    sentence: [
      "I",
      "deposited",
      "my",
      "paycheck",
      "at",
      "the",
      "bank",
      "downtown",
    ],
    target: "bank",
    basePmm: 0,
    neighbors: [
      { token: "deposited", pmm: 0.85, pf: 0.5 },
      { token: "paycheck", pmm: 0.9, pf: 0.3 },
      { token: "downtown", pmm: 0.3, pf: 0.2 },
    ],
  },
];

interface QuizItem {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

const QUIZ: QuizItem[] = [
  {
    q: "What is a “token” in cNLP?",
    options: [
      "The final meaning score for a sentence",
      "A smaller part of content — a letter, word, or sentence",
      "A neighboring word's proximity weight",
      "A synonym in the dictionary",
    ],
    answer: 1,
    explain:
      "Content is split into tokens: sounds, symbols, letters, words, even whole sentences.",
  },
  {
    q: "What does a Probable Measure of Meaning (PMM) capture?",
    options: [
      "How close two tokens are",
      "The emotion of the writer",
      "The generally accepted / dictionary meaning of a token",
      "The number of tokens in the text",
    ],
    answer: 2,
    explain:
      "PMM is a token's baseline accepted meaning — for a word, its dictionary sense plus a cloud of synonyms.",
  },
  {
    q: "The Probability Function (PF) of a neighbor measures…",
    options: [
      "Its dictionary meaning",
      "Its emotional charge",
      "Its length in characters",
      "How frequently it appears as a neighbor of the target here",
    ],
    answer: 3,
    explain:
      "PF is about proximity — who the target's neighbors are and how often they show up nearby.",
  },
  {
    q: "How is the RMM different from a plain PMM?",
    options: [
      "It ignores context entirely",
      "It adjusts the target's meaning using neighbors' proximity-weighted PMMs",
      "It is only the dictionary meaning",
      "It is always zero",
    ],
    answer: 1,
    explain:
      "RMM blends the target's own PMM with its neighbors' PMMs weighted by proximity (PF) — meaning in context.",
  },
];

function fmt(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

export function CnlpEquationLab() {
  const [openStage, setOpenStage] = useState<number>(1);
  const [exampleKey, setExampleKey] = useState<string>("river");
  const [revealMath, setRevealMath] = useState(false);

  const example = EXAMPLES.find((e) => e.key === exampleKey) ?? EXAMPLES[0];

  const contributions = example.neighbors.map((nb) => ({
    ...nb,
    contribution: nb.pf * nb.pmm,
  }));
  const rmm =
    example.basePmm + contributions.reduce((s, c) => s + c.contribution, 0);
  const needlePct = ((rmm + 1) / 2) * 100;
  const verdict =
    rmm > 0.15
      ? { label: "Financial sense", tone: "#16A34A" }
      : rmm < -0.15
        ? { label: "Nature sense", tone: "#2563EB" }
        : { label: "Still ambiguous", tone: "#64748B" };

  // Quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = useMemo(
    () =>
      QUIZ.reduce((s, item, i) => (answers[i] === item.answer ? s + 1 : s), 0),
    [answers],
  );
  const allAnswered = Object.keys(answers).length === QUIZ.length;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium text-[#64748B] mb-8 flex-wrap gap-y-1">
        <Link href="/experiments" className="hover:text-[#0F172A]">
          Experiments
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/directory/manu-rehani" className="hover:text-[#0F172A]">
          Manu Rehani
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-[#0F172A]">The cNLP Equation</span>
      </div>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 lg:p-10 mb-8 text-white"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_DEEP}, ${ACCENT})`,
        }}
      >
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-5"
          style={{ background: "rgba(255,255,255,0.16)" }}
        >
          <Brain className="h-3.5 w-3.5" />
          Follow in Manu Rehani's footsteps
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl tracking-tight leading-tight">
          Decode Meaning: The cNLP Equation
        </h1>
        <p className="mt-4 max-w-2xl text-white/85 leading-relaxed">
          How do computers determine the story <em>between</em> the words? Manu
          Rehani's contextual NLP reconstructs a word's meaning from the company
          it keeps. Build his{" "}
          <strong>Relative Measure of Meaning</strong> one stage at a time.
        </p>

        {/* The equation */}
        <div className="mt-7 rounded-2xl bg-black/25 px-5 py-4 backdrop-blur-sm">
          <div className="text-[11px] uppercase tracking-widest text-white/60 mb-2">
            The equation you'll build
          </div>
          <div className="font-mono text-sm sm:text-base leading-relaxed">
            <span style={{ color: "#FDE68A" }}>RMM</span>(target) ={" "}
            <span style={{ color: "#A7F3D0" }}>PMM</span>(target) +{" "}
            <span className="text-white/70">Σ</span>
            <sub className="text-white/60">neighbors</sub>{" "}
            <span style={{ color: "#93C5FD" }}>PF</span>(n) ×{" "}
            <span style={{ color: "#A7F3D0" }}>PMM</span>(n)
          </div>
        </div>
      </div>

      {/* Stage walkthrough */}
      <h2 className="text-2xl font-serif tracking-tight mb-2">
        Five stages, one meaning
      </h2>
      <p className="text-[#64748B] mb-6">
        Tap each stage to expand it. Together they turn raw text into
        context-aware meaning.
      </p>

      <div className="space-y-3 mb-12">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const open = openStage === stage.n;
          return (
            <div
              key={stage.key}
              className="rounded-2xl border bg-white overflow-hidden transition-colors"
              style={{ borderColor: open ? `${ACCENT}55` : "#E2E8F0" }}
            >
              <button
                onClick={() => setOpenStage(open ? -1 : stage.n)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-bold"
                  style={{
                    background: open ? ACCENT : `${ACCENT}14`,
                    color: open ? "#fff" : ACCENT_DEEP,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Stage {stage.n}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: `${ACCENT}14`, color: ACCENT_DEEP }}
                    >
                      {stage.term}
                    </span>
                  </div>
                  <div className="font-semibold text-[#0F172A] truncate">
                    {stage.title}
                  </div>
                  {!open && (
                    <div className="text-sm text-[#64748B] truncate">
                      {stage.blurb}
                    </div>
                  )}
                </div>
                <ChevronRight
                  className="h-5 w-5 flex-shrink-0 text-[#94A3B8] transition-transform"
                  style={{ transform: open ? "rotate(90deg)" : "none" }}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <p className="px-5 pb-5 pl-[4.75rem] text-[#475569] leading-relaxed">
                      {stage.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Interactive meaning lab */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8 mb-12">
        <div className="flex items-center gap-2 mb-1">
          <Radar className="h-5 w-5" style={{ color: ACCENT }} />
          <h2 className="text-2xl font-serif tracking-tight">
            The meaning lab
          </h2>
        </div>
        <p className="text-[#64748B] mb-6">
          The word <span className="font-semibold">“bank”</span> has the same
          dictionary entry in both sentences — but its neighbors decide what it
          actually means. Switch contexts and watch the RMM move.
        </p>

        {/* Context toggle */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.key}
              onClick={() => {
                setExampleKey(ex.key);
                setRevealMath(false);
              }}
              className="flex-1 rounded-xl border px-4 py-3 text-left text-sm transition-colors"
              style={{
                borderColor: exampleKey === ex.key ? ACCENT : "#E2E8F0",
                background: exampleKey === ex.key ? `${ACCENT}0d` : "#fff",
                color: exampleKey === ex.key ? ACCENT_DEEP : "#475569",
                fontWeight: exampleKey === ex.key ? 600 : 400,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {/* Tokenized sentence */}
        <div className="flex flex-wrap gap-2 mb-6">
          {example.sentence.map((tok, i) => {
            const isTarget = tok === example.target;
            const nb = example.neighbors.find((n) => n.token === tok);
            return (
              <span
                key={`${tok}-${i}`}
                className="rounded-lg px-2.5 py-1.5 text-sm font-medium"
                style={
                  isTarget
                    ? { background: ACCENT, color: "#fff" }
                    : nb
                      ? { background: `${ACCENT}1a`, color: ACCENT_DEEP }
                      : { background: "#F1F5F9", color: "#64748B" }
                }
              >
                {tok}
              </span>
            );
          })}
        </div>

        {/* Neighbor contribution table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F8FAFC] text-left text-[#64748B]">
                <th className="px-4 py-2 font-semibold">Neighbor</th>
                <th className="px-4 py-2 font-semibold">PMM</th>
                <th className="px-4 py-2 font-semibold">PF</th>
                <th className="px-4 py-2 font-semibold">PF × PMM</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#E2E8F0]">
                <td className="px-4 py-2 font-medium text-[#0F172A]">
                  bank{" "}
                  <span className="text-xs text-[#94A3B8]">(target PMM)</span>
                </td>
                <td className="px-4 py-2 font-mono">{fmt(example.basePmm)}</td>
                <td className="px-4 py-2 text-[#94A3B8]">—</td>
                <td className="px-4 py-2 font-mono">{fmt(example.basePmm)}</td>
              </tr>
              {contributions.map((c) => (
                <tr key={c.token} className="border-t border-[#E2E8F0]">
                  <td className="px-4 py-2 font-medium text-[#0F172A]">
                    {c.token}
                  </td>
                  <td className="px-4 py-2 font-mono">{fmt(c.pmm)}</td>
                  <td className="px-4 py-2 font-mono">{c.pf.toFixed(2)}</td>
                  <td
                    className="px-4 py-2 font-mono font-semibold"
                    style={{ color: c.contribution >= 0 ? "#16A34A" : "#2563EB" }}
                  >
                    {fmt(c.contribution)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RMM meter */}
        <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#0F172A]">
              Relative Measure of Meaning
            </span>
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ background: `${verdict.tone}1a`, color: verdict.tone }}
            >
              {verdict.label} · RMM {fmt(rmm)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-gradient-to-r from-[#2563EB] via-[#CBD5E1] to-[#16A34A]">
            <motion.div
              className="absolute top-1/2 h-6 w-6 -translate-y-1/2 -translate-x-1/2 rounded-full border-4 border-white shadow-md"
              style={{ background: verdict.tone }}
              animate={{ left: `${needlePct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs font-medium text-[#94A3B8]">
            <span>Nature · river's edge</span>
            <span>Finance · money</span>
          </div>

          <button
            onClick={() => setRevealMath((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: ACCENT_DEEP }}
          >
            {revealMath ? "Hide" : "Show"} the math
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <AnimatePresence initial={false}>
            {revealMath && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-xl bg-white border border-[#E2E8F0] p-4 font-mono text-xs sm:text-sm leading-relaxed text-[#334155]">
                  RMM = {fmt(example.basePmm)}
                  {contributions.map((c) => (
                    <span key={c.token}>
                      {" "}
                      {c.contribution >= 0 ? "+" : "−"} ({c.pf.toFixed(2)} ×{" "}
                      {fmt(c.pmm)})
                    </span>
                  ))}{" "}
                  = <span className="font-bold">{fmt(rmm)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quiz */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 lg:p-8">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="h-5 w-5" style={{ color: ACCENT }} />
          <h2 className="text-2xl font-serif tracking-tight">
            Check your understanding
          </h2>
        </div>
        <p className="text-[#64748B] mb-6">
          Four quick questions on the cNLP pipeline you just built.
        </p>

        <div className="space-y-6">
          {QUIZ.map((item, qi) => {
            const chosen = answers[qi];
            return (
              <div key={qi}>
                <div className="font-semibold text-[#0F172A] mb-3">
                  {qi + 1}. {item.q}
                </div>
                <div className="grid gap-2">
                  {item.options.map((opt, oi) => {
                    const isChosen = chosen === oi;
                    const isCorrect = oi === item.answer;
                    let style: React.CSSProperties = {
                      borderColor: "#E2E8F0",
                    };
                    if (submitted) {
                      if (isCorrect)
                        style = {
                          borderColor: "#16A34A",
                          background: "#16A34A0d",
                        };
                      else if (isChosen)
                        style = {
                          borderColor: "#DC2626",
                          background: "#DC26260d",
                        };
                    } else if (isChosen) {
                      style = { borderColor: ACCENT, background: `${ACCENT}0d` };
                    }
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [qi]: oi }))
                        }
                        className="flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default"
                        style={style}
                      >
                        <span className="flex-1 text-[#334155]">{opt}</span>
                        {submitted && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                        {submitted && isChosen && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <p className="mt-2 text-sm text-[#64748B]">
                    {item.explain}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-4">
          {!submitted ? (
            <Button
              disabled={!allAnswered}
              onClick={() => setSubmitted(true)}
              style={{ background: ACCENT }}
            >
              Check answers
            </Button>
          ) : (
            <>
              <div
                className="rounded-xl px-4 py-2 text-sm font-bold"
                style={{ background: `${ACCENT}14`, color: ACCENT_DEEP }}
              >
                You scored {score} / {QUIZ.length}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Try again
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Footer link */}
      <div className="mt-10 text-center">
        <Link
          href="/directory/manu-rehani"
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: ACCENT_DEEP }}
        >
          Back to Manu Rehani's story
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
