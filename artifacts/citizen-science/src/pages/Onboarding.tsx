import React, { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft, Sparkles, FlaskConical, Users, BookOpen, Globe, Brain } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const ROLES = [
  { id: "student",      label: "Student",       sub: "Learner & young explorer" },
  { id: "researcher",   label: "Researcher",    sub: "Academic or scientist" },
  { id: "professional", label: "Professional",  sub: "Industry practitioner" },
  { id: "educator",     label: "Educator",      sub: "Teacher or professor" },
  { id: "founder",      label: "Founder",       sub: "Entrepreneur & builder" },
  { id: "explorer",     label: "Explorer",      sub: "Curious about everything" },
];

const FIELDS = [
  "Space & Astronomy",
  "Life Sciences & Biology",
  "AI & Computing",
  "Physics",
  "Chemistry",
  "Neuroscience & Mind",
  "Climate & Earth",
  "Mathematics",
  "Medicine & Health",
  "Engineering",
  "Economics",
  "History of Science",
];

const GOALS = [
  { id: "great-minds", label: "Learn from history's greatest minds",  Icon: Brain },
  { id: "ai-tools",    label: "Use the AI research copilot",          Icon: Sparkles },
  { id: "experiments", label: "Run experiments & log real findings",  Icon: FlaskConical },
  { id: "mentor",      label: "Find a mentor in my field",            Icon: Users },
  { id: "expertise",   label: "Build deep domain expertise",          Icon: BookOpen },
  { id: "connect",     label: "Connect with researchers worldwide",   Icon: Globe },
];

const AMBITIONS = [
  { id: "curiosity",   label: "Feed my love of learning",       sub: "Explore freely and follow what fascinates you" },
  { id: "career",      label: "Advance my career",              sub: "Build skills and credentials that open doors" },
  { id: "contribute",  label: "Contribute to real science",     sub: "Add your findings to humanity's knowledge base" },
  { id: "discovery",   label: "Make a meaningful discovery",    sub: "Chase the question nobody has answered yet" },
  { id: "transition",  label: "Change my career path",          sub: "Pivot into science, research, or technology" },
  { id: "inspire",     label: "Inspire and mentor others",      sub: "Pass knowledge forward to the next generation" },
];

const GOAL_ROUTE: Record<string, string> = {
  "great-minds": "/directory",
  "ai-tools":    "/agent",
  "experiments": "/experiments",
  "mentor":      "/mentors",
  "expertise":   "/categories",
  "connect":     "/directory",
};

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const variants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -48 : 48 }),
};

const TOTAL_STEPS = 4;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Onboarding() {
  const [, setLocation] = useLocation();
  const { completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState({
    role: "",
    fields: [] as string[],
    primaryGoal: "",
    ambition: "",
  });

  const canProceed =
    (step === 1 && !!answers.role) ||
    (step === 2 && answers.fields.length > 0) ||
    (step === 3 && !!answers.primaryGoal) ||
    (step === 4 && !!answers.ambition) ||
    step > TOTAL_STEPS;

  function go(next: number) {
    setDir(next > step ? 1 : -1);
    setStep(next);
  }

  function toggleField(f: string) {
    setAnswers(prev => ({
      ...prev,
      fields: prev.fields.includes(f)
        ? prev.fields.filter(x => x !== f)
        : prev.fields.length < 3
          ? [...prev.fields, f]
          : prev.fields,
    }));
  }

  function handleComplete() {
    localStorage.setItem("cs_preferences", JSON.stringify(answers));
    completeOnboarding();
    let pendingPrompt: string | null = null;
    let redirect: string | null = null;
    try {
      pendingPrompt = window.localStorage.getItem("cs.pendingPrompt");
      redirect      = window.localStorage.getItem("cs.postAuthRedirect");
    } catch { /* ignore */ }
    const safeRedirect = redirect && /^\/(?!\/)/.test(redirect) ? redirect : null;
    if (safeRedirect) {
      try { window.localStorage.removeItem("cs.postAuthRedirect"); } catch { /* ignore */ }
      setLocation(safeRedirect);
    } else if (pendingPrompt && pendingPrompt.trim().length > 0) {
      setLocation("/agent");
    } else {
      setLocation(GOAL_ROUTE[answers.primaryGoal] ?? "/dashboard");
    }
  }

  // Card style helpers
  const cardBase =
    "w-full text-left rounded-2xl border transition-all duration-200 cursor-pointer";
  const cardOff =
    "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20";
  const cardOn =
    "border-blue-500/70 bg-blue-600/20 shadow-[0_0_0_1px_rgb(59,130,246,0.3)]";

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-10 pb-16"
      style={{
        background:
          "radial-gradient(ellipse at 25% 15%, #1e3a5f30 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, #1e3a6020 0%, transparent 50%), #080D18",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <LogoIcon className="h-7 w-7" />
        <span className="text-white/80 font-semibold text-base tracking-tight">
          Humanity's Research Network
        </span>
      </div>

      {/* Step dots */}
      {step <= TOTAL_STEPS && (
        <div className="flex items-center gap-2 mb-10">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? "w-6 h-2 bg-blue-500"
                  : i + 1 < step
                    ? "w-2 h-2 bg-blue-500/60"
                    : "w-2 h-2 bg-white/15"
              }`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="w-full max-w-lg relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >

            {/* ---- Step 1: Role ---- */}
            {step === 1 && (
              <div>
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Step 1 of {TOTAL_STEPS}
                </p>
                <h2 className="font-serif text-4xl text-white mb-2 leading-tight">
                  Who are you?
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                  Help us shape your experience on the network.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setAnswers(prev => ({ ...prev, role: r.id }))}
                      className={`${cardBase} ${answers.role === r.id ? cardOn : cardOff} px-4 py-4`}
                    >
                      <p className="text-white font-medium text-sm">{r.label}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{r.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Step 2: Fields ---- */}
            {step === 2 && (
              <div>
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Step 2 of {TOTAL_STEPS}
                </p>
                <h2 className="font-serif text-4xl text-white mb-2 leading-tight">
                  What calls to you?
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                  Choose up to 3 fields that excite you most.{" "}
                  {answers.fields.length > 0 && (
                    <span className="text-blue-400 font-medium">
                      {answers.fields.length}/3 selected
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {FIELDS.map(f => {
                    const selected = answers.fields.includes(f);
                    const maxed = answers.fields.length >= 3 && !selected;
                    return (
                      <button
                        key={f}
                        onClick={() => toggleField(f)}
                        disabled={maxed}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                          selected
                            ? "border-blue-500/70 bg-blue-600/20 text-white"
                            : maxed
                              ? "border-white/5 bg-white/3 text-slate-600 cursor-not-allowed"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        {selected && <Check className="h-3.5 w-3.5 text-blue-400" />}
                        {f}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- Step 3: Primary goal ---- */}
            {step === 3 && (
              <div>
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Step 3 of {TOTAL_STEPS}
                </p>
                <h2 className="font-serif text-4xl text-white mb-2 leading-tight">
                  What draws you here?
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                  Your primary reason for joining the network.
                </p>
                <div className="grid gap-3">
                  {GOALS.map(({ id, label, Icon }) => (
                    <button
                      key={id}
                      onClick={() => setAnswers(prev => ({ ...prev, primaryGoal: id }))}
                      className={`${cardBase} ${answers.primaryGoal === id ? cardOn : cardOff} px-5 py-4 flex items-center gap-4`}
                    >
                      <span
                        className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ${
                          answers.primaryGoal === id
                            ? "bg-blue-500/30"
                            : "bg-white/8"
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 ${answers.primaryGoal === id ? "text-blue-300" : "text-slate-400"}`}
                          size={18}
                        />
                      </span>
                      <span
                        className={`text-sm font-medium ${answers.primaryGoal === id ? "text-white" : "text-slate-300"}`}
                      >
                        {label}
                      </span>
                      {answers.primaryGoal === id && (
                        <Check className="ml-auto h-4 w-4 text-blue-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Step 4: Ambition ---- */}
            {step === 4 && (
              <div>
                <p className="text-blue-400 text-xs font-semibold tracking-widest uppercase mb-3">
                  Step 4 of {TOTAL_STEPS}
                </p>
                <h2 className="font-serif text-4xl text-white mb-2 leading-tight">
                  What do you want to achieve?
                </h2>
                <p className="text-slate-400 mb-8 text-sm">
                  Think big — what's the real goal?
                </p>
                <div className="grid gap-3">
                  {AMBITIONS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAnswers(prev => ({ ...prev, ambition: a.id }))}
                      className={`${cardBase} ${answers.ambition === a.id ? cardOn : cardOff} px-5 py-4 flex items-start gap-4`}
                    >
                      <div className="flex-1 text-left">
                        <p
                          className={`text-sm font-medium ${answers.ambition === a.id ? "text-white" : "text-slate-300"}`}
                        >
                          {a.label}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{a.sub}</p>
                      </div>
                      {answers.ambition === a.id && (
                        <Check className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ---- Step 5: Completion ---- */}
            {step === 5 && (
              <div className="text-center pt-4">
                <div className="h-16 w-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="h-7 w-7 text-blue-400" />
                </div>
                <h2 className="font-serif text-4xl text-white mb-3 leading-tight">
                  You're part of something historic.
                </h2>
                <p className="text-slate-400 text-sm mb-10 max-w-sm mx-auto">
                  Humanity's Research Network connects you with the greatest minds,
                  AI-powered discovery, and a community building the future of science.
                </p>

                <button
                  onClick={handleComplete}
                  className="w-full py-4 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/40 mb-4"
                >
                  Enter the Network
                </button>
                <p className="text-slate-600 text-xs">
                  You can always change your preferences later.
                </p>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step <= TOTAL_STEPS && (
        <div className="w-full max-w-lg mt-10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => go(step - 1)}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            disabled={!canProceed}
            onClick={() => go(step + 1)}
            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all ${
              canProceed
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40"
                : "bg-white/8 text-slate-600 cursor-not-allowed"
            }`}
          >
            {step === TOTAL_STEPS ? "Finish" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}
