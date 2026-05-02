import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Atom, Beaker, Leaf, Droplet, FlaskConical, HeartPulse, Microscope, UtensilsCrossed, Sprout, Brain, CloudSun, Telescope, Layers, Globe2, ArrowRight, Check, Sparkles, Activity, BookOpen, PenTool, BookMarked, Save, Wand2, CornerDownLeft, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/categories";

type DashboardSlide = {
  slug: string;
  category: string;
  topic: string;
  percent: number;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  chartLabel: string;
  chartPath: string;
  chartPoints: { cx: number; cy: number }[];
  accent: string;
  ring: string;
  ringText: string;
  chips: { label: string; bg: string; text: string }[];
};

const DASHBOARD_SLIDES: DashboardSlide[] = [
  {
    slug: "plant-science",
    category: "Plant Science",
    topic: "Continue learning",
    percent: 62,
    metric1: { label: "Days Active", value: "14" },
    metric2: { label: "Observations", value: "8" },
    chartLabel: "Growth Curve (cm)",
    chartPath: "M0,50 Q40,45 80,30 T160,10 T200,5",
    chartPoints: [{ cx: 80, cy: 30 }, { cx: 160, cy: 10 }],
    accent: "#2563EB",
    ring: "border-blue-100 border-t-blue-600",
    ringText: "text-blue-700",
    chips: [
      { label: "Light", bg: "bg-green-50", text: "text-green-700" },
      { label: "Water", bg: "bg-blue-50", text: "text-blue-700" },
    ],
  },
  {
    slug: "water-quality",
    category: "Water Quality",
    topic: "Field study",
    percent: 38,
    metric1: { label: "Samples", value: "11" },
    metric2: { label: "Avg pH", value: "7.2" },
    chartLabel: "pH over 7 days",
    chartPath: "M0,40 L33,32 L66,38 L100,28 L133,34 L166,22 L200,26",
    chartPoints: [{ cx: 100, cy: 28 }, { cx: 166, cy: 22 }],
    accent: "#0EA5E9",
    ring: "border-sky-100 border-t-sky-600",
    ringText: "text-sky-700",
    chips: [
      { label: "pH", bg: "bg-sky-50", text: "text-sky-700" },
      { label: "Turbidity", bg: "bg-blue-50", text: "text-blue-700" },
    ],
  },
  {
    slug: "physics",
    category: "Physics",
    topic: "Lab simulation",
    percent: 74,
    metric1: { label: "Trials", value: "22" },
    metric2: { label: "Avg v (m/s)", value: "4.6" },
    chartLabel: "Velocity vs Time",
    chartPath: "M0,55 Q50,48 100,32 T200,5",
    chartPoints: [{ cx: 100, cy: 32 }, { cx: 170, cy: 12 }],
    accent: "#2563EB",
    ring: "border-blue-100 border-t-blue-600",
    ringText: "text-blue-700",
    chips: [
      { label: "Mass", bg: "bg-blue-50", text: "text-blue-700" },
      { label: "Force", bg: "bg-indigo-50", text: "text-indigo-700" },
    ],
  },
  {
    slug: "chemistry",
    category: "Chemistry",
    topic: "Continue learning",
    percent: 45,
    metric1: { label: "Reactions", value: "9" },
    metric2: { label: "Tests Run", value: "17" },
    chartLabel: "Acidity Trend",
    chartPath: "M0,30 Q30,15 60,28 T120,32 T200,18",
    chartPoints: [{ cx: 60, cy: 28 }, { cx: 140, cy: 26 }],
    accent: "#7C3AED",
    ring: "border-violet-100 border-t-violet-600",
    ringText: "text-violet-700",
    chips: [
      { label: "Acid", bg: "bg-violet-50", text: "text-violet-700" },
      { label: "Base", bg: "bg-purple-50", text: "text-purple-700" },
    ],
  },
  {
    slug: "human-health",
    category: "Human Health",
    topic: "Wellness study",
    percent: 81,
    metric1: { label: "Sleep avg", value: "7.4h" },
    metric2: { label: "Resting HR", value: "62" },
    chartLabel: "Sleep quality (7d)",
    chartPath: "M0,30 L33,22 L66,28 L100,15 L133,20 L166,12 L200,18",
    chartPoints: [{ cx: 100, cy: 15 }, { cx: 166, cy: 12 }],
    accent: "#E11D48",
    ring: "border-rose-100 border-t-rose-600",
    ringText: "text-rose-700",
    chips: [
      { label: "Sleep", bg: "bg-rose-50", text: "text-rose-700" },
      { label: "HRV", bg: "bg-pink-50", text: "text-pink-700" },
    ],
  },
  {
    slug: "microbiology",
    category: "Microbiology",
    topic: "Active culture",
    percent: 53,
    metric1: { label: "Cultures", value: "4" },
    metric2: { label: "Doubling t", value: "28m" },
    chartLabel: "Population growth",
    chartPath: "M0,55 Q60,52 110,40 T180,8 L200,4",
    chartPoints: [{ cx: 110, cy: 40 }, { cx: 180, cy: 8 }],
    accent: "#7C3AED",
    ring: "border-violet-100 border-t-violet-600",
    ringText: "text-violet-700",
    chips: [
      { label: "Yeast", bg: "bg-violet-50", text: "text-violet-700" },
      { label: "37°C", bg: "bg-amber-50", text: "text-amber-700" },
    ],
  },
  {
    slug: "neuroscience",
    category: "Neuroscience",
    topic: "Cognitive test",
    percent: 67,
    metric1: { label: "Trials", value: "30" },
    metric2: { label: "Avg ms", value: "284" },
    chartLabel: "Reaction time (ms)",
    chartPath: "M0,18 L33,28 L66,22 L100,32 L133,26 L166,38 L200,30",
    chartPoints: [{ cx: 100, cy: 32 }, { cx: 166, cy: 38 }],
    accent: "#C026D3",
    ring: "border-fuchsia-100 border-t-fuchsia-600",
    ringText: "text-fuchsia-700",
    chips: [
      { label: "Focus", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
      { label: "Attention", bg: "bg-pink-50", text: "text-pink-700" },
    ],
  },
  {
    slug: "climate-science",
    category: "Climate Science",
    topic: "Daily log",
    percent: 29,
    metric1: { label: "Days logged", value: "21" },
    metric2: { label: "Avg °C", value: "18.4" },
    chartLabel: "Temperature trend",
    chartPath: "M0,42 L33,38 L66,30 L100,34 L133,22 L166,18 L200,12",
    chartPoints: [{ cx: 100, cy: 34 }, { cx: 166, cy: 18 }],
    accent: "#0284C7",
    ring: "border-sky-100 border-t-sky-600",
    ringText: "text-sky-700",
    chips: [
      { label: "Temp", bg: "bg-sky-50", text: "text-sky-700" },
      { label: "Humidity", bg: "bg-blue-50", text: "text-blue-700" },
    ],
  },
  {
    slug: "astronomy",
    category: "Astronomy",
    topic: "Sky journal",
    percent: 41,
    metric1: { label: "Sessions", value: "6" },
    metric2: { label: "Objects", value: "23" },
    chartLabel: "Visibility (lux)",
    chartPath: "M0,50 Q40,30 80,38 T160,15 T200,22",
    chartPoints: [{ cx: 80, cy: 38 }, { cx: 160, cy: 15 }],
    accent: "#4F46E5",
    ring: "border-indigo-100 border-t-indigo-600",
    ringText: "text-indigo-700",
    chips: [
      { label: "Moon phase", bg: "bg-indigo-50", text: "text-indigo-700" },
      { label: "Clear sky", bg: "bg-blue-50", text: "text-blue-700" },
    ],
  },
  {
    slug: "agriculture",
    category: "Agriculture",
    topic: "Soil tracker",
    percent: 58,
    metric1: { label: "Plots", value: "3" },
    metric2: { label: "NPK score", value: "82" },
    chartLabel: "Nutrient density",
    chartPath: "M0,40 Q40,38 80,30 T160,18 T200,12",
    chartPoints: [{ cx: 80, cy: 30 }, { cx: 160, cy: 18 }],
    accent: "#D97706",
    ring: "border-amber-100 border-t-amber-600",
    ringText: "text-amber-700",
    chips: [
      { label: "Nitrogen", bg: "bg-amber-50", text: "text-amber-700" },
      { label: "pH 6.4", bg: "bg-green-50", text: "text-green-700" },
    ],
  },
  {
    slug: "food-science",
    category: "Food Science",
    topic: "Fermentation",
    percent: 36,
    metric1: { label: "Batches", value: "5" },
    metric2: { label: "Avg pH", value: "3.6" },
    chartLabel: "Fermentation pH",
    chartPath: "M0,15 Q40,22 80,28 T160,42 T200,48",
    chartPoints: [{ cx: 80, cy: 28 }, { cx: 160, cy: 42 }],
    accent: "#EA580C",
    ring: "border-orange-100 border-t-orange-600",
    ringText: "text-orange-700",
    chips: [
      { label: "Sourdough", bg: "bg-orange-50", text: "text-orange-700" },
      { label: "Day 3", bg: "bg-amber-50", text: "text-amber-700" },
    ],
  },
  {
    slug: "environmental-science",
    category: "Environmental Science",
    topic: "Habitat survey",
    percent: 49,
    metric1: { label: "Species", value: "27" },
    metric2: { label: "Sites", value: "4" },
    chartLabel: "Biodiversity index",
    chartPath: "M0,42 Q40,30 80,32 T160,18 T200,14",
    chartPoints: [{ cx: 80, cy: 32 }, { cx: 160, cy: 18 }],
    accent: "#059669",
    ring: "border-emerald-100 border-t-emerald-600",
    ringText: "text-emerald-700",
    chips: [
      { label: "Forest", bg: "bg-emerald-50", text: "text-emerald-700" },
      { label: "Insects", bg: "bg-lime-50", text: "text-lime-700" },
    ],
  },
  {
    slug: "biology",
    category: "Biology",
    topic: "Cell observation",
    percent: 23,
    metric1: { label: "Slides", value: "7" },
    metric2: { label: "Notes", value: "12" },
    chartLabel: "Mitosis rate",
    chartPath: "M0,40 Q40,35 80,28 T160,22 T200,16",
    chartPoints: [{ cx: 80, cy: 28 }, { cx: 160, cy: 22 }],
    accent: "#16A34A",
    ring: "border-green-100 border-t-green-600",
    ringText: "text-green-700",
    chips: [
      { label: "Stained", bg: "bg-green-50", text: "text-green-700" },
      { label: "400x", bg: "bg-emerald-50", text: "text-emerald-700" },
    ],
  },
  {
    slug: "materials-science",
    category: "Materials Science",
    topic: "Stress test",
    percent: 70,
    metric1: { label: "Specimens", value: "9" },
    metric2: { label: "Max load", value: "48N" },
    chartLabel: "Strain curve",
    chartPath: "M0,55 Q60,42 110,28 T180,8 L200,5",
    chartPoints: [{ cx: 110, cy: 28 }, { cx: 180, cy: 8 }],
    accent: "#475569",
    ring: "border-slate-200 border-t-slate-700",
    ringText: "text-slate-700",
    chips: [
      { label: "Polymer", bg: "bg-slate-100", text: "text-slate-700" },
      { label: "Tensile", bg: "bg-zinc-100", text: "text-zinc-700" },
    ],
  },
];

type PromptGroup = {
  segment: string;
  accentBg: string;
  accentText: string;
  prompts: string[];
};

const PROMPT_GROUPS: PromptGroup[] = [
  {
    segment: "Life & Genomics",
    accentBg: "bg-green-50 hover:bg-green-100 border-green-100",
    accentText: "text-green-800",
    prompts: [
      "I want to sequence my genome at home",
      "Identify mushrooms growing in my backyard",
      "Track butterfly populations in my garden",
      "Grow yogurt cultures and compare strains",
    ],
  },
  {
    segment: "Plants & Agriculture",
    accentBg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-100",
    accentText: "text-emerald-800",
    prompts: [
      "Find the best soil for my tomatoes",
      "Compare lettuce growth under LED vs sunlight",
      "Test which fertilizer my basil prefers",
      "Measure how shade affects strawberry yield",
    ],
  },
  {
    segment: "Chemistry & Materials",
    accentBg: "bg-violet-50 hover:bg-violet-100 border-violet-100",
    accentText: "text-violet-800",
    prompts: [
      "Make a pH indicator from red cabbage",
      "Test the acidity of my tap water",
      "Build homemade litmus paper",
      "Compare strength of glues and tapes",
    ],
  },
  {
    segment: "Physics & Earth",
    accentBg: "bg-blue-50 hover:bg-blue-100 border-blue-100",
    accentText: "text-blue-800",
    prompts: [
      "Measure the speed of sound in my kitchen",
      "Build a pendulum and calculate gravity",
      "Test which paper airplane flies farthest",
      "Estimate the height of a building with shadows",
    ],
  },
  {
    segment: "Health & Behavior",
    accentBg: "bg-rose-50 hover:bg-rose-100 border-rose-100",
    accentText: "text-rose-800",
    prompts: [
      "Correlate my sleep with caffeine intake",
      "Measure my reaction time over a week",
      "Track how walking affects my heart rate",
      "Test how music tempo changes my focus",
    ],
  },
  {
    segment: "Climate & Sky",
    accentBg: "bg-sky-50 hover:bg-sky-100 border-sky-100",
    accentText: "text-sky-800",
    prompts: [
      "Monitor air quality in my neighborhood",
      "Track local rainfall over a season",
      "Estimate my household carbon footprint",
      "Photograph the phases of the moon",
    ],
  },
];

const ALL_PROMPTS: string[] = PROMPT_GROUPS.flatMap(g => g.prompts);

function AskAgent() {
  const [, navigate] = useLocation();
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);

  useEffect(() => {
    if (focused || value.length > 0) return;
    const id = window.setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % ALL_PROMPTS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [focused, value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = value.trim() || ALL_PROMPTS[placeholderIndex];
    try {
      window.localStorage.setItem("cs.pendingPrompt", prompt);
    } catch {
      // ignore storage failures
    }
    navigate("/login");
  };

  const handleChip = (prompt: string) => {
    setValue(prompt);
  };

  const currentPlaceholder = ALL_PROMPTS[placeholderIndex];

  return (
    <section className="relative w-full border-y border-[#E2E8F0] bg-gradient-to-b from-white via-[#FAFBFF] to-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200/60 to-transparent" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-br from-blue-200/30 via-violet-200/20 to-emerald-200/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative container mx-auto max-w-5xl px-4 lg:px-8 py-20 lg:py-24">
        <div className="text-center mb-10">
          <Badge variant="outline" className="rounded-full bg-white text-[#0F172A] border-[#E2E8F0] mb-5 px-3 py-1 text-xs font-medium shadow-sm">
            <Wand2 className="h-3 w-3 mr-1.5 inline text-violet-600" />
            Science copilot — preview
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-serif tracking-tight text-[#0F172A] leading-[1.1] mb-4">
            What do you want to <span className="italic text-blue-600">explore</span> today?
          </h2>
          <p className="text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Tell us a question, a hunch, or a wild curiosity. We'll turn it into a guided experiment with steps, tools, and a notebook ready to go.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`relative flex items-center gap-3 rounded-2xl border bg-white pl-5 pr-2 py-2 shadow-lg transition-all ${
              focused ? "border-blue-300 shadow-blue-500/10 ring-4 ring-blue-100/60" : "border-[#E2E8F0] shadow-blue-900/5"
            }`}
          >
            <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
            <div className="relative flex-1 h-14">
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                aria-label="What do you want to explore today?"
                className="absolute inset-0 w-full bg-transparent outline-none text-base lg:text-lg text-[#0F172A] placeholder:text-transparent font-medium"
                data-testid="agent-prompt-input"
              />
              {value.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center text-base lg:text-lg text-[#94A3B8] font-medium">
                  <span className="mr-1.5 hidden sm:inline">Try:</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentPlaceholder}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="truncate"
                    >
                      {currentPlaceholder}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="group flex items-center gap-2 rounded-xl bg-[#0F172A] hover:bg-blue-700 text-white px-5 h-12 text-sm font-medium transition-colors"
              data-testid="agent-prompt-submit"
            >
              <span className="hidden sm:inline">Plan my experiment</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
            <CornerDownLeft className="h-3 w-3" />
            <span>Press enter to begin — we'll save your prompt and pick up after you sign in.</span>
          </div>
        </form>

        <div className="mt-8">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setExamplesOpen(o => !o)}
              aria-expanded={examplesOpen}
              aria-controls="agent-prompt-examples"
              className="group inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] shadow-sm hover:bg-[#F8FAFC] transition-colors"
              data-testid="agent-examples-toggle"
            >
              <span>{examplesOpen ? "Hide examples" : "Browse examples by topic"}</span>
              <ChevronDown
                className={`h-4 w-4 text-[#64748B] transition-transform duration-300 ${examplesOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {examplesOpen && (
              <motion.div
                key="examples"
                id="agent-prompt-examples"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-6 space-y-3">
                  {PROMPT_GROUPS.map(group => (
                    <div key={group.segment} className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-[#64748B] sm:w-44 shrink-0">
                        {group.segment}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.prompts.map(prompt => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => handleChip(prompt)}
                            className={`text-sm font-medium rounded-full border px-3.5 py-1.5 transition-colors ${group.accentBg} ${group.accentText}`}
                            data-testid={`agent-prompt-chip`}
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RotatingDashboardCard() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % DASHBOARD_SLIDES.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [paused]);

  const slide = DASHBOARD_SLIDES[index];

  return (
    <div
      className="relative mx-auto w-full max-w-[540px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="rotating-dashboard-card"
    >
      <div className="relative rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl shadow-blue-900/5 overflow-hidden">
        <div className="h-10 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
        </div>
        <div className="p-6 bg-[#FAFAF9] min-h-[388px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-sm">{slide.topic}</h3>
                  <p className="text-xs text-[#64748B]">{slide.category}</p>
                </div>
                <div className={`h-10 w-10 rounded-full border-4 ${slide.ring} flex items-center justify-center text-xs font-bold ${slide.ringText}`}>
                  {slide.percent}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                  <div className="text-xs text-[#64748B] mb-1">{slide.metric1.label}</div>
                  <div className="text-xl font-bold">{slide.metric1.value}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
                  <div className="text-xs text-[#64748B] mb-1">{slide.metric2.label}</div>
                  <div className="text-xl font-bold">{slide.metric2.value}</div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-6 overflow-hidden">
                <div className="flex items-baseline justify-between px-4 pt-3 pb-1">
                  <div className="text-xs font-semibold tracking-tight">{slide.chartLabel}</div>
                  <div className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Last 7 days</div>
                </div>
                <svg
                  viewBox="0 0 200 80"
                  preserveAspectRatio="none"
                  className="block w-full h-24"
                >
                  <defs>
                    <linearGradient id={`area-${slide.slug}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={slide.accent} stopOpacity="0.32" />
                      <stop offset="60%" stopColor={slide.accent} stopOpacity="0.08" />
                      <stop offset="100%" stopColor={slide.accent} stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id={`line-${slide.slug}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={slide.accent} stopOpacity="0.7" />
                      <stop offset="100%" stopColor={slide.accent} stopOpacity="1" />
                    </linearGradient>
                  </defs>

                  {[20, 40, 60].map(y => (
                    <line
                      key={y}
                      x1="0"
                      x2="200"
                      y1={y}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  <path
                    d={`${slide.chartPath} L200,80 L0,80 Z`}
                    fill={`url(#area-${slide.slug})`}
                    stroke="none"
                  />

                  <motion.path
                    key={`line-${slide.slug}`}
                    d={slide.chartPath}
                    fill="none"
                    stroke={`url(#line-${slide.slug})`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />

                  {slide.chartPoints.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.cx} cy={p.cy} r="6" fill={slide.accent} fillOpacity="0.18" />
                      <circle cx={p.cx} cy={p.cy} r="3" fill="white" stroke={slide.accent} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex gap-2">
                {slide.chips.map((chip, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className={`${chip.bg} ${chip.text} hover:${chip.bg}`}
                  >
                    {chip.label}
                  </Badge>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="border-t border-[#E2E8F0] bg-white/60 px-6 py-3 flex items-center justify-center gap-1.5">
          {DASHBOARD_SLIDES.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.category}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#0F172A]" : "w-1.5 bg-[#CBD5E1] hover:bg-[#94A3B8]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const TOOLS = [
  { icon: Sprout, name: "Plant Growth Planner", desc: "Simulate and track plant development.", slug: "plant-science" },
  { icon: Droplet, name: "Water Quality Tracker", desc: "Log pH and clarity measurements.", slug: "water-quality" },
  { icon: FlaskConical, name: "pH Experiment Planner", desc: "Structure your acidity tests.", slug: "chemistry" },
  { icon: HeartPulse, name: "Sleep & Wellness Logger", desc: "Correlate habits with rest.", slug: "human-health" },
  { icon: Leaf, name: "Soil Health Calculator", desc: "Estimate nutrient density.", slug: "agriculture" },
  { icon: Microscope, name: "Microbial Growth Simulator", desc: "Model population expansion.", slug: "microbiology" },
  { icon: Brain, name: "Reaction Time Tester", desc: "Measure cognitive reflexes.", slug: "neuroscience" },
  { icon: Globe2, name: "Carbon Footprint Estimator", desc: "Calculate daily emissions.", slug: "environmental-science" },
  { icon: CloudSun, name: "Sky Observation Journal", desc: "Record meteorological data.", slug: "climate-science" },
  { icon: PenTool, name: "DIY Lab Notebook", desc: "Free-form experiment logging.", slug: "biology" },
];

export function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Atom className="h-5 w-5" />
            </div>
            <span>Citizen Science</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
            <Link href="/categories" className="transition-colors hover:text-[#0F172A]">Categories</Link>
            <a href="#tools" className="transition-colors hover:text-[#0F172A]">Tools</a>
            <a href="#safety" className="transition-colors hover:text-[#0F172A]">Safety</a>
            <Link href="/login" className="transition-colors hover:text-[#0F172A]">Sign in</Link>
          </nav>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors">
            Start Exploring
          </Link>
        </div>
      </header>

      <main>
        {/* AGENT / ASK SECTION */}
        <AskAgent />

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none blur-[100px]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply animate-pulse" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply animate-pulse delay-1000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply animate-pulse delay-700" />
          </div>

          <div className="container mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <Badge variant="outline" className="rounded-full bg-blue-50/50 text-blue-700 border-blue-200 mb-6 px-3 py-1 text-xs font-medium">
                  <Sparkles className="h-3 w-3 mr-1 inline" /> Premium Science Learning Platform
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-serif tracking-tight text-[#0F172A] leading-[1.1] mb-6">
                  Run Your Own Experiments. <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 font-sans font-bold tracking-tight">
                    Learn Science by Doing.
                  </span>
                </h1>
                <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
                  Citizen Science helps curious people explore biology, ecology, health, chemistry, physics, agriculture, environmental science, and more through guided tutorials, interactive simulations, and personal experiment tracking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/login">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full text-base h-12 px-8">
                      Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/categories">
                    <Button size="lg" variant="outline" className="w-full rounded-full text-base h-12 px-8 border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#0F172A]">
                      Explore Categories
                    </Button>
                  </Link>
                </div>
              </div>

              {/* DASHBOARD MOCKUP */}
              <RotatingDashboardCard />
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-24 bg-white border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-12">Science Shouldn't Stay Locked in Labs.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {[
                { title: "Passive Education", desc: "Reading about science isn't the same as doing it." },
                { title: "Inaccessible Tools", desc: "Real labs are expensive and hard to access." },
                { title: "Fragmented Data", desc: "Notes scattered across paper and digital apps." },
                { title: "Hard to Structure", desc: "Beginners struggle to plan safe, valid experiments." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 font-bold">
                    0{i + 1}
                  </div>
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION / WORKFLOW */}
        <section className="py-32 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">A Guided Science Lab for Everyone.</h2>
              <p className="text-[#64748B]">Follow a proven scientific method designed for home exploration.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { icon: BookOpen, label: "Learn concept" },
                { icon: Activity, label: "Run simulation" },
                { icon: PenTool, label: "Plan experiment" },
                { icon: BookMarked, label: "Track observations" },
                { icon: Save, label: "Save results" },
                { icon: Layers, label: "Build portfolio" }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center p-6 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-blue-600 mb-4 z-10">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-medium">{step.label}</div>
                  {i < 5 && <div className="hidden lg:block absolute top-14 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-200 to-transparent" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section className="py-32 bg-white">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Explore Fields of Science</h2>
                <p className="text-[#64748B]">Choose a discipline to start your journey.</p>
              </div>
              <Link href="/categories">
                <Button variant="ghost" className="hidden sm:flex text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View all fields <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {CATEGORIES.slice(0, 8).map((cat, i) => (
                <Link key={i} href={`/category/${cat.slug}`}>
                  <Card className="border-[#E2E8F0] shadow-none hover:shadow-md transition-shadow group cursor-pointer h-full">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Beaker className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider
                          ${cat.difficulty === 'Beginner' ? 'text-green-600 bg-green-50 border-green-200' : ''}
                          ${cat.difficulty === 'Intermediate' ? 'text-amber-600 bg-amber-50 border-amber-200' : ''}
                          ${cat.difficulty === 'Advanced' ? 'text-purple-600 bg-purple-50 border-purple-200' : ''}
                        `}>
                          {cat.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{cat.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-2">{cat.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4 pt-0">
                      <div className="text-xs font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-32 bg-[#F8FAFC] border-y border-[#E2E8F0]">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-16 text-center">How It Works</h2>
            <div className="space-y-12">
              {[
                { num: "01", title: "Choose a field", desc: "Select from dozens of scientific disciplines, from botany to physics. We provide the foundational knowledge." },
                { num: "02", title: "Learn the basics", desc: "Read guided tutorials that explain core concepts, terminology, and standard measurement techniques." },
                { num: "03", title: "Use a simulator", desc: "Test hypotheses virtually before trying them in the real world. Adjust variables and see instant results." },
                { num: "04", title: "Track your results", desc: "Set up a physical experiment and use your digital notebook to log daily observations, photos, and data points." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-6 sm:gap-12 items-start">
                  <div className="text-5xl font-serif text-blue-200">{step.num}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-[#64748B] leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED TOOLS */}
        <section id="tools" className="py-32 bg-white">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Interactive Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {TOOLS.map((tool, i) => (
                <Link key={i} href={`/category/${tool.slug}`}>
                  <div className="p-5 rounded-xl border border-[#E2E8F0] hover:border-blue-200 hover:bg-blue-50/50 transition-colors group cursor-pointer h-full flex flex-col">
                    <tool.icon className="h-6 w-6 text-[#64748B] group-hover:text-blue-600 mb-4" />
                    <h4 className="font-medium text-sm mb-2 leading-tight">{tool.name}</h4>
                    <p className="text-xs text-[#64748B] line-clamp-2 mb-4 flex-1">{tool.desc}</p>
                    <div className="text-xs font-semibold text-blue-600 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Open tool <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section id="safety" className="py-24 bg-[#F8FAFC]">
          <div className="container mx-auto max-w-4xl px-4 lg:px-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 lg:p-12 text-center shadow-sm">
              <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-serif mb-4 text-amber-900">Safety First</h3>
              <p className="text-amber-800 leading-relaxed max-w-2xl mx-auto">
                Citizen Science is designed for education, simulation, observation, and safe at-home experimentation. We do not encourage hazardous, medical, biological, or chemical procedures without proper training, supervision, and safety standards.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 bg-white text-center">
          <div className="container mx-auto max-w-3xl px-4 lg:px-8">
            <h2 className="text-4xl lg:text-5xl font-serif mb-6 tracking-tight">Start Building Your Personal Science Lab.</h2>
            <p className="text-[#64748B] text-lg mb-10">Join thousands of curious minds exploring the world around them.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 h-12">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-12 border-[#E2E8F0]">
                  Explore Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F172A] text-[#64748B] py-12">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Atom className="h-5 w-5" />
            <span>Citizen Science</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <a href="#tools" className="hover:text-white transition-colors">Tools</a>
            <a href="#safety" className="hover:text-white transition-colors">Safety</a>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science.
          </div>
        </div>
      </footer>
    </div>
  );
}
