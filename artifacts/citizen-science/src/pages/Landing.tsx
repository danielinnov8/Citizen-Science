import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Leaf, Droplet, FlaskConical, HeartPulse, Microscope, UtensilsCrossed, Sprout, Brain, CloudSun, Telescope, Layers, Globe2, ArrowRight, Check, Sparkles, Activity, BookOpen, PenTool, BookMarked, Save, Wand2, CornerDownLeft, ChevronDown, Smartphone, Users, Eye, Lightbulb, Wheat, ShieldCheck, GraduationCap, Handshake, Wrench, Building2, UserPlus, Cpu, Mail, Twitter, Linkedin, Github, Youtube, Send, MapPin, Zap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES, getCategoryIcon } from "@/lib/categories";
import { DEVICES } from "@/lib/devices";
import {
  GREAT_MINDS,
  MODERN_MINDS,
  PIONEERS,
  type Inventor,
} from "@/lib/inventors";
import { Logo, LogoIcon } from "@/components/Logo";
import { NetworkGlobe } from "@/components/NetworkGlobe";
import { PeopleNetwork } from "@/components/PeopleNetwork";
import { HeroAtom } from "@/components/HeroAtom";

type DashboardSlide = {
  slug: string;
  category: string;
  topic: string;
  percent: number;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  chartLabel: string;
  yUnit: string;
  yLabels: string[];
  xLabels: string[];
  dataPoints: number[];
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
    chartLabel: "Stem height vs day",
    yUnit: "cm",
    yLabels: ["10", "7.5", "5.0", "2.5", "0"],
    xLabels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    dataPoints: [60, 53, 43, 33, 24, 13, 5],
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
    chartLabel: "pH measurements",
    yUnit: "pH",
    yLabels: ["8.0", "7.5", "7.0", "6.5", "6.0"],
    xLabels: ["M", "T", "W", "T", "F", "S", "S"],
    dataPoints: [30, 27, 33, 21, 30, 18, 24],
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
    chartLabel: "Velocity vs time",
    yUnit: "m/s",
    yLabels: ["6", "4.5", "3", "1.5", "0"],
    xLabels: ["0", "1", "2", "3", "4", "5", "6s"],
    dataPoints: [60, 52, 41, 32, 24, 16, 8],
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
    chartLabel: "Acidity trend",
    yUnit: "pH",
    yLabels: ["7", "6", "5", "4", "3"],
    xLabels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    dataPoints: [9, 23, 33, 38, 45, 48, 51],
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
    chartLabel: "Sleep quality",
    yUnit: "hrs",
    yLabels: ["9", "8.25", "7.5", "6.75", "6"],
    xLabels: ["M", "T", "W", "T", "F", "S", "S"],
    dataPoints: [36, 50, 24, 18, 32, 14, 22],
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
    yUnit: "×10⁴ CFU",
    yLabels: ["60", "45", "30", "15", "0"],
    xLabels: ["0h", "2h", "4h", "6h", "8h", "10h", "12h"],
    dataPoints: [59, 58, 56, 52, 44, 32, 10],
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
    chartLabel: "Reaction time",
    yUnit: "ms",
    yLabels: ["320", "300", "280", "260", "240"],
    xLabels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"],
    dataPoints: [8, 19, 26, 23, 38, 30, 41],
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
    chartLabel: "Air temperature",
    yUnit: "°C",
    yLabels: ["25", "21", "17", "14", "10"],
    xLabels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    dataPoints: [52, 44, 48, 36, 28, 24, 16],
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
    chartLabel: "Sky brightness",
    yUnit: "lux",
    yLabels: ["2.0", "1.5", "1.0", "0.5", "0"],
    xLabels: ["N1", "N2", "N3", "N4", "N5", "N6", "N7"],
    dataPoints: [45, 48, 51, 42, 36, 39, 24],
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
    yUnit: "NPK",
    yLabels: ["100", "87", "75", "62", "50"],
    xLabels: ["P1", "P2", "P3", "P4", "P5", "P6", "P7"],
    dataPoints: [48, 42, 36, 32, 29, 25, 22],
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
    yUnit: "pH",
    yLabels: ["7", "6", "5", "4", "3"],
    xLabels: ["D1", "D2", "D3", "D4", "D5", "D6", "D7"],
    dataPoints: [15, 23, 35, 41, 45, 48, 51],
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
    yUnit: "H'",
    yLabels: ["3.0", "2.25", "1.5", "0.75", "0"],
    xLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
    dataPoints: [36, 30, 24, 20, 14, 10, 6],
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
    yUnit: "%",
    yLabels: ["60", "45", "30", "15", "0"],
    xLabels: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"],
    dataPoints: [40, 35, 30, 25, 20, 15, 8],
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
    chartLabel: "Strain vs load",
    yUnit: "ε×10⁻³",
    yLabels: ["50", "37", "25", "12", "0"],
    xLabels: ["10N", "20N", "30N", "35N", "40N", "45N", "48N"],
    dataPoints: [54, 46, 34, 20, 12, 6, 2],
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
    navigate("/agent");
  };

  const handleChip = (prompt: string) => {
    setValue(prompt);
  };

  const currentPlaceholder = ALL_PROMPTS[placeholderIndex];

  return (
    <section className="relative w-full overflow-x-clip border-y border-[#E2E8F0] bg-gradient-to-b from-white via-[#FAFBFF] to-white">
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
              className="btn-metal-ink group flex items-center gap-2 rounded-xl px-5 h-12 text-sm font-medium transition-colors"
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
                <div className="flex items-baseline justify-between px-4 pt-3 pb-2 border-b border-[#F1F5F9]">
                  <div className="flex items-baseline gap-2">
                    <div className="text-xs font-semibold tracking-tight text-[#0F172A]">{slide.chartLabel}</div>
                    <div className="text-[10px] font-mono text-[#94A3B8]">n=7</div>
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5">
                    {slide.yUnit}
                  </div>
                </div>

                <div className="px-3 pt-2 pb-2">
                  <div className="grid grid-cols-[28px_1fr] gap-x-1.5">
                    {/* Y-axis labels */}
                    <div className="flex flex-col justify-between text-[9px] font-mono text-[#94A3B8] text-right py-0.5 leading-none">
                      {slide.yLabels.map((label, i) => (
                        <span key={`${slide.slug}-y-${i}`}>{label}</span>
                      ))}
                    </div>

                    {/* Plot area */}
                    <div className="relative border-l border-b border-[#CBD5E1]">
                      {(() => {
                        // Build a smooth curve that flows through every data
                        // point using Catmull-Rom → cubic Bézier conversion.
                        // This avoids sharp corners between segments while
                        // still passing exactly through each measured value.
                        const pts = slide.dataPoints.map((y, i) => ({
                          x: (i / (slide.dataPoints.length - 1)) * 200,
                          y,
                        }));
                        const t = 0.5; // tension; 0.5 = standard Catmull-Rom
                        let linePath = `M${pts[0].x},${pts[0].y}`;
                        for (let i = 0; i < pts.length - 1; i++) {
                          const p0 = pts[i - 1] ?? pts[i];
                          const p1 = pts[i];
                          const p2 = pts[i + 1];
                          const p3 = pts[i + 2] ?? p2;
                          const cp1x = p1.x + ((p2.x - p0.x) / 6) * t * 2;
                          const cp1y = p1.y + ((p2.y - p0.y) / 6) * t * 2;
                          const cp2x = p2.x - ((p3.x - p1.x) / 6) * t * 2;
                          const cp2y = p2.y - ((p3.y - p1.y) / 6) * t * 2;
                          linePath += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
                        }
                        return (
                          <svg
                            viewBox="0 0 200 60"
                            preserveAspectRatio="none"
                            className="block w-full h-24"
                            aria-hidden="true"
                          >
                            <defs>
                              <linearGradient id={`area-${slide.slug}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={slide.accent} stopOpacity="0.28" />
                                <stop offset="60%" stopColor={slide.accent} stopOpacity="0.06" />
                                <stop offset="100%" stopColor={slide.accent} stopOpacity="0" />
                              </linearGradient>
                            </defs>

                            {/* Horizontal gridlines (graph paper) */}
                            {[15, 30, 45].map(y => (
                              <line
                                key={`h-${y}`}
                                x1="0"
                                x2="200"
                                y1={y}
                                y2={y}
                                stroke="#E2E8F0"
                                strokeWidth="1"
                                strokeDasharray="2 3"
                                vectorEffect="non-scaling-stroke"
                              />
                            ))}

                            {/* Vertical gridlines */}
                            {slide.dataPoints.map((_, i) => {
                              if (i === 0 || i === slide.dataPoints.length - 1) return null;
                              const x = (i / (slide.dataPoints.length - 1)) * 200;
                              return (
                                <line
                                  key={`v-${i}`}
                                  x1={x}
                                  x2={x}
                                  y1="0"
                                  y2="60"
                                  stroke="#F1F5F9"
                                  strokeWidth="1"
                                  vectorEffect="non-scaling-stroke"
                                />
                              );
                            })}

                            {/* Area fill */}
                            <path
                              d={`${linePath} L200,60 L0,60 Z`}
                              fill={`url(#area-${slide.slug})`}
                              stroke="none"
                            />

                            {/* Line — render fully drawn, fade in only */}
                            <motion.path
                              key={`line-${slide.slug}`}
                              d={linePath}
                              fill="none"
                              stroke={slide.accent}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              vectorEffect="non-scaling-stroke"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                            />
                          </svg>
                        );
                      })()}

                      {/* X-axis tick marks (HTML, perfectly aligned) */}
                      <div className="absolute left-0 right-0 top-full h-1 pointer-events-none" aria-hidden="true">
                        {slide.dataPoints.map((_, i) => {
                          const xPct = (i / (slide.dataPoints.length - 1)) * 100;
                          return (
                            <span
                              key={`tick-${slide.slug}-${i}`}
                              className="absolute top-0 w-px h-1 bg-[#94A3B8]"
                              style={{ left: `${xPct}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Data point markers as HTML overlay (immune to non-uniform SVG scaling) */}
                      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                        {slide.dataPoints.map((y, i) => {
                          const xPct = (i / (slide.dataPoints.length - 1)) * 100;
                          const yPct = (y / 60) * 100;
                          const isLast = i === slide.dataPoints.length - 1;
                          return (
                            <span
                              key={`pt-${slide.slug}-${i}`}
                              className="absolute"
                              style={{ left: `${xPct}%`, top: `${yPct}%`, transform: "translate(-50%, -50%)" }}
                            >
                              {isLast && (
                                <span
                                  className="absolute rounded-full"
                                  style={{
                                    width: 14,
                                    height: 14,
                                    backgroundColor: slide.accent,
                                    opacity: 0.18,
                                    left: "50%",
                                    top: "50%",
                                    transform: "translate(-50%, -50%)",
                                  }}
                                />
                              )}
                              <span
                                className="block rounded-full bg-white"
                                style={{
                                  width: isLast ? 8 : 6,
                                  height: isLast ? 8 : 6,
                                  border: `${isLast ? 2 : 1.5}px solid ${slide.accent}`,
                                }}
                              />
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* X-axis labels (offset to align with plot column) */}
                    <div />
                    <div className="flex justify-between text-[9px] font-mono text-[#94A3B8] mt-1 leading-none">
                      {slide.xLabels.map((label, i) => (
                        <span key={`${slide.slug}-x-${i}`}>{label}</span>
                      ))}
                    </div>
                  </div>
                </div>
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


function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Sparkle({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ filter: `drop-shadow(0 0 ${Math.max(2, size / 2.5)}px ${color})` }}
    >
      <path
        d="M12 0c.7 6.3 3 8.6 9 9-6 .4-8.3 2.7-9 9-.7-6.3-3-8.6-9-9 6-.4 8.3-2.7 9-9Z"
        fill={color}
      />
    </svg>
  );
}

type PixieParticle = {
  id: number;
  x: number;
  y: number;
  driftX: number;
  rise: number;
  size: number;
  duration: number;
  rotate: number;
  color: string;
};

const PIXIE_COLORS = ["#FDE68A", "#FCD34D", "#FBBF24", "#FFFFFF", "#BFDBFE"];

function PixieDustWord({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [particles, setParticles] = useState<PixieParticle[]>([]);
  const idRef = useRef(0);
  const wordRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef({ x: 0, y: 0 });

  const updatePos = (e: React.MouseEvent<HTMLSpanElement>) => {
    const rect = wordRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    posRef.current = { x, y };
  };

  useEffect(() => {
    if (!hovering || reduceMotion) return;
    const spawn = () => {
      const { x, y } = posRef.current;
      const batch: PixieParticle[] = Array.from({ length: 2 }).map(() => ({
        id: idRef.current++,
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        driftX: (Math.random() - 0.5) * 26,
        rise: 14 + Math.random() * 30,
        size: 4 + Math.random() * 7,
        duration: 0.6 + Math.random() * 0.6,
        rotate: (Math.random() - 0.5) * 220,
        color: PIXIE_COLORS[Math.floor(Math.random() * PIXIE_COLORS.length)],
      }));
      setParticles((prev) => [...prev, ...batch]);
    };
    spawn();
    const interval = setInterval(spawn, 70);
    return () => clearInterval(interval);
  }, [hovering, reduceMotion]);

  const removeParticle = (id: number) =>
    setParticles((prev) => prev.filter((p) => p.id !== id));

  const handleEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    updatePos(e);
    setHovering(true);
  };
  const handleLeave = () => {
    setHovering(false);
  };

  return (
    <span
      ref={wordRef}
      className="relative inline-block text-blue-200 mr-2 transition-[text-shadow] duration-300"
      style={
        hovering && !reduceMotion
          ? { textShadow: "0 0 18px rgba(253,224,71,0.35)" }
          : undefined
      }
      onMouseEnter={handleEnter}
      onMouseMove={updatePos}
      onMouseLeave={handleLeave}
    >
      {children}
      <span
        className="pointer-events-none absolute inset-0 z-10 overflow-visible"
        aria-hidden="true"
      >
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute left-0 top-0"
            initial={{ opacity: 0, scale: 0, x: p.x, y: p.y, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.95, 0.3],
              x: p.x + p.driftX,
              y: p.y - p.rise,
              rotate: p.rotate,
            }}
            transition={{ duration: p.duration, ease: "easeOut" }}
            onAnimationComplete={() => removeParticle(p.id)}
          >
            <Sparkle size={p.size} color={p.color} />
          </motion.span>
        ))}
      </span>
    </span>
  );
}

const HERO_WORDS = ["Research", "Science", "Discovery"];

function TypewriterWord({ words }: { words: string[] }) {
  const reduceMotion = useReducedMotion();
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState(words[0]);
  const [deleting, setDeleting] = useState(false);

  const [offsets, setOffsets] = useState<number[]>(() => words.map(() => 0));
  const measureRef = useRef<HTMLSpanElement>(null);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  useLayoutEffect(() => {
    const measure = () => {
      const node = measureRef.current;
      if (!node) return;
      const spans = Array.from(
        node.querySelectorAll<HTMLSpanElement>("[data-word]"),
      );
      if (spans.length !== words.length) return;
      const widths = spans.map((s) => s.getBoundingClientRect().width);
      const max = Math.max(...widths);
      setOffsets(widths.map((w) => max - w));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [words]);

  useEffect(() => {
    if (reduceMotion) return;
    const current = words[wordIndex];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      const t = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, 450);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setText((prev) =>
        deleting
          ? current.slice(0, prev.length - 1)
          : current.slice(0, prev.length + 1),
      );
    }, deleting ? 55 : 95);
    return () => clearTimeout(t);
  }, [text, deleting, wordIndex, words, reduceMotion]);

  return (
    <span className="relative inline-block whitespace-nowrap align-baseline text-blue-200 sm:mr-[0.35em]">
      <span className="invisible" aria-hidden="true">
        {longest}
      </span>
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0"
      >
        {words.map((w) => (
          <span key={w} data-word className="inline-block whitespace-nowrap">
            {w}
          </span>
        ))}
      </span>
      <span
        className="absolute left-0 top-0 whitespace-nowrap pl-[var(--cs-pad-center)] sm:pl-[var(--cs-pad-flush)]"
        style={
          {
            "--cs-pad-center": `${(offsets[reduceMotion ? 0 : wordIndex] ?? 0) / 2}px`,
            "--cs-pad-flush": `${offsets[reduceMotion ? 0 : wordIndex] ?? 0}px`,
          } as React.CSSProperties
        }
      >
        {reduceMotion ? words[0] : text}
        {!reduceMotion && (
          <motion.span
            aria-hidden="true"
            className="ml-[0.07em] inline-block h-[0.72em] w-[3px] rounded-sm bg-blue-200/90 align-[-0.08em]"
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.5, 0.5, 1],
            }}
          />
        )}
      </span>
    </span>
  );
}

const PILLARS = [
  {
    icon: Smartphone,
    title: "Every Smartphone Becomes a Research Tool",
    desc: "The sensor in your pocket can measure air, water, light, sound, and motion — turning daily life into data that matters.",
  },
  {
    icon: Building2,
    title: "Every Community Becomes a Living Laboratory",
    desc: "Neighborhoods, schools, and cities become sites of active research, mapping the world block by block.",
  },
  {
    icon: UserPlus,
    title: "Every Citizen Becomes a Contributor",
    desc: "No degree required — only curiosity. Each observation adds to a shared, global record of discovery.",
  },
];

const TOP_CHALLENGES = [
  {
    slug: "multiplanetary-life",
    title: "Make Life Multiplanetary",
    domain: "Space",
    urgency: "critical" as const,
    summary: "Establish a self-sustaining human presence beyond Earth to ensure the long-term survival of civilization.",
    icon: Rocket,
  },
  {
    slug: "clean-energy-access",
    title: "Universal Clean Energy Access",
    domain: "Energy",
    urgency: "critical" as const,
    summary: "Provide affordable, reliable, and sustainable energy to the 750 million people still without electricity.",
    icon: Zap,
  },
  {
    slug: "pandemic-preparedness",
    title: "Prevent the Next Pandemic",
    domain: "Health",
    urgency: "critical" as const,
    summary: "Build global systems to detect, contain, and neutralise novel pathogens before they become pandemics.",
    icon: HeartPulse,
  },
  {
    slug: "ocean-health",
    title: "Restore Ocean Health",
    domain: "Biodiversity",
    urgency: "high" as const,
    summary: "Reverse ocean acidification, overfishing, and plastic pollution to restore marine ecosystems by 2050.",
    icon: Leaf,
  },
  {
    slug: "food-security",
    title: "End Global Hunger",
    domain: "Food",
    urgency: "critical" as const,
    summary: "Feed a world of 10 billion people sustainably while halving food waste and ending malnutrition.",
    icon: Wheat,
  },
  {
    slug: "clean-water",
    title: "Safe Water for All",
    domain: "Water",
    urgency: "critical" as const,
    summary: "Ensure universal access to safe drinking water and sanitation, and prevent global water scarcity.",
    icon: Droplet,
  },
  {
    slug: "ai-safety",
    title: "Align AI with Human Values",
    domain: "AI Safety",
    urgency: "critical" as const,
    summary: "Ensure advanced AI systems remain safe, interpretable, and aligned with human values as they surpass human capabilities.",
    icon: Cpu,
  },
  {
    slug: "antibiotic-resistance",
    title: "Stop Antibiotic Resistance",
    domain: "Health",
    urgency: "critical" as const,
    summary: "Develop new antimicrobials and stewardship frameworks before drug-resistant infections become untreatable.",
    icon: ShieldCheck,
  },
];

const PATHWAYS = [
  {
    icon: Users,
    title: "Participate",
    desc: "Contribute observations and run experiments from wherever you are.",
  },
  {
    icon: Handshake,
    title: "Partner",
    desc: "Bring your institution, dataset, or mission into the network.",
  },
  {
    icon: GraduationCap,
    title: "Educate",
    desc: "Turn classrooms into living laboratories of real research.",
  },
  {
    icon: Wrench,
    title: "Build",
    desc: "Create tools and models on top of the world's largest discovery network.",
  },
];

const STATS = [
  { icon: Users, value: "8 Billion", label: "Potential Researchers" },
  { icon: Cpu, value: "6+ Billion", label: "Connected Devices" },
  { icon: Activity, value: "Millions", label: "Daily Observations" },
  { icon: Globe2, value: "One", label: "Shared Planet" },
];

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "52px 52px",
} as const;

function InventorCard({ inv, delay }: { inv: Inventor; delay: number }) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/directory/${inv.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F5F9]">
          <img
            src={inv.imageUrl}
            alt={inv.name}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug text-[#0F172A] transition-colors group-hover:text-blue-700">
            {inv.name}
          </h3>
          <p className="mt-1 text-sm font-medium text-[#2563EB]">{inv.field}</p>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[#64748B]">
            {inv.blurb}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mt-7">
      <p className="text-sm font-semibold text-white">Join the network</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#94A3B8]">
        Get discoveries, new tools, and ways to take part — straight to your inbox.
      </p>
      {submitted ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <Check className="h-4 w-4 shrink-0" />
          You're on the list. Welcome to the network.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSubmitted(true);
          }}
          className="mt-3 flex gap-2"
        >
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              aria-label="Email address"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-[#64748B] outline-none transition-colors focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            aria-label="Subscribe"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Subscribe</span>
          </button>
        </form>
      )}
    </div>
  );
}

export function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1120]/90 text-white backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <LogoIcon className="h-8 w-8" />
            <span>Citizen Science</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#vision" className="transition-colors hover:text-white">Vision</a>
            <a href="#discover" className="transition-colors hover:text-white">Discover</a>
            <a href="#participate" className="transition-colors hover:text-white">Participate</a>
            <a href="#impact" className="transition-colors hover:text-white">Impact</a>
            <a href="#community" className="transition-colors hover:text-white">Community</a>
            <Link href="/citizenx" className="transition-colors hover:text-white">CitizenX</Link>
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline text-sm font-medium text-white/70 transition-colors hover:text-white">
              Sign in
            </Link>
            <Link href="/login" className="btn-metal-blue inline-flex items-center rounded-full px-6 py-2 text-sm font-medium transition-colors">
              Join
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[#0B1120] text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/30 blur-[150px]" />
            <div className="absolute top-10 right-1/4 h-[520px] w-[520px] translate-x-1/2 rounded-full bg-violet-600/25 blur-[150px]" />
            <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[160px]" />
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={GRID_BG} />
          <HeroAtom />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,#0B1120_85%)]" />

          <div className="container relative z-10 mx-auto max-w-5xl px-4 pt-28 pb-32 text-center lg:px-8 lg:pt-40 lg:pb-44">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                Future Vision XPRIZE
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-8 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Humanity's<br />
                <PixieDustWord>Discovery</PixieDustWord>
                <br className="block sm:hidden" /> Network
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-8 max-w-3xl text-xl font-light leading-relaxed text-white/80 lg:max-w-none lg:whitespace-nowrap lg:text-2xl">
                What if every person on Earth could help solve humanity's greatest challenges?
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/55 lg:text-lg">
                Citizen Science is building the world's largest distributed discovery network — transforming human curiosity into collective intelligence and accelerating scientific progress at global scale.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login">
                  <Button size="lg" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
                    Join the Network <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#vision">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-full border-white/25 bg-white/5 px-8 text-base text-white hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Explore the Vision
                  </Button>
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.32}>
              <div className="mx-auto mt-16 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/55">
                <span><span className="font-semibold text-white">8B</span> potential researchers</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block" />
                <span><span className="font-semibold text-white">6B+</span> connected devices</span>
                <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block" />
                <span><span className="font-semibold text-white">1</span> shared planet</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* HUMANITY'S GREATEST CHALLENGES */}
        <section id="impact" className="border-b border-[#E2E8F0] bg-[#F8FAFC] py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Humanity's Greatest Challenges
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                  The problems that define our era.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#64748B]">
                  Each one is solvable. None can be solved alone.
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[...TOP_CHALLENGES].sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2 };
                return (order[a.urgency] ?? 9) - (order[b.urgency] ?? 9);
              }).map((ch, i) => {
                const Icon = ch.icon;
                const urgencyColor =
                  ch.urgency === "critical"
                    ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700";
                return (
                  <Reveal key={ch.slug} delay={(i % 4) * 0.06}>
                    <Link
                      href={`/challenges/${ch.slug}`}
                      className="group flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${urgencyColor}`}>
                          {ch.urgency}
                        </span>
                        <span className="text-[11px] font-medium text-[#94A3B8]">{ch.domain}</span>
                      </div>
                      <h3 className="font-semibold leading-snug text-[#0F172A]">{ch.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#64748B]">
                        {ch.summary}
                      </p>
                      <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-semibold text-blue-600 transition-all group-hover:gap-2">
                        Explore challenge <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <Reveal delay={0.2}>
              <div className="mt-12 text-center">
                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-6 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                >
                  View all 25 challenges <ArrowRight className="h-4 w-4 text-blue-600" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* VISION — THE BELIEF */}
        <section id="vision" className="bg-white py-32 lg:py-40">
          <div className="container mx-auto max-w-4xl px-4 text-center lg:px-8">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                The Core Belief
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight lg:text-5xl">
                The Greatest Untapped Resource Isn't Technology.
                <span className="mt-5 block italic text-blue-600 lg:mt-7">
                  It's People.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#475569]">
                For centuries, scientific discovery has been limited by institutional capacity. Yet billions of people observe the world every day. Citizen Science unlocks humanity itself as a research network.
              </p>
            </Reveal>
          </div>
        </section>

        {/* COMMUNITY — MINDS */}
        <section id="community" className="bg-white pb-32 lg:pb-40">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <div className="mb-12 max-w-3xl">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Community
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:whitespace-nowrap lg:text-5xl">
                  Discovery has always belonged to the curious.
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#64748B]">
                  The same curiosity that powers this network drove the world's great inventors. We're building the infrastructure so the next breakthrough can come from anyone, anywhere.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Great Minds of the Past
              </h3>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {GREAT_MINDS.map((inv, i) => (
                <InventorCard key={inv.slug} inv={inv} delay={(i % 4) * 0.06} />
              ))}
            </div>

            <Reveal>
              <h3 className="mb-6 mt-20 text-sm font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Modern Visionaries
              </h3>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {MODERN_MINDS.map((inv, i) => (
                <InventorCard key={inv.slug} inv={inv} delay={(i % 4) * 0.06} />
              ))}
            </div>

            <Reveal>
              <h3 className="mb-6 mt-20 text-sm font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                Pioneers of Discovery
              </h3>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {PIONEERS.map((inv, i) => (
                <InventorCard key={inv.slug} inv={inv} delay={(i % 4) * 0.06} />
              ))}
            </div>
          </div>
        </section>

        {/* THE FUTURE WE ARE BUILDING */}
        <section className="border-y border-[#E2E8F0] bg-[#F8FAFC] py-32 lg:py-40">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  The Future We Are Building
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                  A planet where discovery has no walls.
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="group flex h-full flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                    <div className="icon-tile-metal mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:text-white">
                      <p.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-3 text-[#64748B] leading-relaxed">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BY THE NUMBERS */}
        <section className="relative overflow-hidden bg-[#0B1120] py-28 text-white lg:py-32">
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/20 blur-[150px]" />
          </div>
          <div className="container relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <h2 className="mb-16 text-center font-serif text-3xl tracking-tight lg:text-4xl">
                By The Numbers
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {STATS.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.08}>
                  <div className="text-center">
                    <s.icon className="mx-auto mb-4 h-7 w-7 text-blue-300" />
                    <div className="font-serif text-4xl tracking-tight lg:text-5xl">{s.value}</div>
                    <div className="mt-2 text-sm text-white/55">{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* GLOBAL NETWORK — INTERACTIVE GLOBE */}
        <NetworkGlobe />

        {/* IMAGINE 2045 — CINEMATIC INTERLUDE */}
        <section className="relative overflow-hidden bg-[#0B1120] py-32 text-white lg:py-44">
          {/* Continue the globe's bottom glow downward from the exact seam so the
              two dark sections read as one continuous field instead of meeting at
              a hard line. Mirrors the gradient at the bottom of NetworkGlobe. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[linear-gradient(to_bottom,rgba(30,58,138,0.22)_0%,rgba(30,58,138,0.18)_30%,rgba(76,29,149,0.1)_60%,transparent_100%)]" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/20 blur-[160px]" />
            <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[150px]" />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              ...GRID_BG,
              maskImage: "linear-gradient(to bottom, transparent 0%, black 32%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 32%)",
            }}
          />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center lg:px-8">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Imagine the Year 2045
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[1.12] tracking-tight lg:text-6xl">
                Science happens everywhere.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70 lg:text-xl">
                Students contribute to active research. Communities monitor their own ecosystems. AI coordinates millions of observations in real time. Discovery is no longer limited by institutions — it belongs to everyone.
              </p>
            </Reveal>
          </div>
        </section>

        {/* A LIVING NETWORK OF MINDS */}
        <section className="bg-white py-32 lg:py-40">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  How The Network Grows
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                  A Living Network of Minds
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#64748B]">
                  Today's scientists, inventors, and researchers connect into one growing web of discovery — and every new participant strengthens it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <PeopleNetwork />
            </Reveal>
          </div>
        </section>

        {/* WHY THIS MATTERS */}
        <section className="bg-white py-32 lg:py-40">
          <div className="container mx-auto max-w-6xl px-4 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Why This Matters
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                  The same scale that threatens us can save us.
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <Reveal>
                <div className="flex h-full flex-col rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-8 lg:p-10">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#94A3B8]">
                    Today's Challenges
                  </span>
                  <ul className="mt-6 space-y-4">
                    {["Climate instability", "Resource scarcity", "Health threats", "Information gaps"].map((c) => (
                      <li key={c} className="flex items-center gap-3 text-lg text-[#475569]">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#CBD5E1]" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-violet-50 p-8 lg:p-10">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    Tomorrow's Opportunity
                  </span>
                  <ul className="mt-6 space-y-4">
                    {["Billions of contributors", "Real-time intelligence", "Faster discovery", "Better decisions"].map((c) => (
                      <li key={c} className="flex items-center gap-3 text-lg font-medium text-[#0F172A]">
                        <Check className="h-5 w-5 shrink-0 text-blue-600" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* DISCOVER — THE LIVE PRODUCT */}
        <section id="discover" className="bg-white">
          <AskAgent />
          <div className="container mx-auto max-w-7xl px-4 py-32 lg:px-8 lg:py-40">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <Reveal>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                    The Network Is Live
                  </span>
                  <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                    From a single question to a living notebook.
                  </h2>
                  <p className="mt-6 text-lg leading-relaxed text-[#64748B]">
                    This isn't a someday vision. Start now — ask a question and our science copilot turns it into a guided experiment with steps, simulations, and an observation log ready to go.
                  </p>
                  <ul className="mt-8 space-y-4">
                    {[
                      "Guided experiments across dozens of scientific fields",
                      "Interactive simulators to test before you build",
                      "A personal notebook that becomes part of the network",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-3 text-[#475569]">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link href="/login">
                      <Button size="lg" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
                        Start Your First Discovery <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-12 w-full rounded-full border-[#E2E8F0] px-8 text-base text-[#0F172A] hover:bg-[#F1F5F9] sm:w-auto"
                      >
                        Explore All Fields
                      </Button>
                    </Link>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <RotatingDashboardCard />
              </Reveal>
            </div>

            <Reveal>
              <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORIES.slice(0, 8).map((cat, i) => {
                  const Icon = getCategoryIcon(cat.icon);
                  return (
                    <Link key={i} href={`/category/${cat.slug}`}>
                      <Card className="group h-full cursor-pointer border-[#E2E8F0] shadow-none transition-shadow hover:shadow-md">
                        <CardHeader className="pb-4">
                          <div className="icon-tile-metal mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-lg">{cat.name}</CardTitle>
                          <CardDescription className="line-clamp-2 text-xs">
                            {cat.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CITIZENX — THE MOVEMENT */}
        <section className="relative overflow-hidden bg-[#0B1120] py-32 text-white lg:py-40">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          </div>
          <div className="container relative mx-auto max-w-5xl px-4 text-center lg:px-8">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                CitizenX — The Discovery Movement
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mx-auto mt-8 max-w-4xl font-serif text-4xl font-normal leading-[1.05] tracking-tight lg:text-6xl">
                Democratize discovery — anyone can advance human knowledge.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
                CitizenX is our member-run program layer. Organize a local chapter,
                host discovery events, and publish your own experiments for the
                world to build on.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
                {[
                  { title: "Organize", desc: "Start a local chapter." },
                  { title: "Host", desc: "Run discovery events." },
                  { title: "Publish", desc: "Share your experiments." },
                ].map((p) => (
                  <div key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
                    <h3 className="text-lg font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-white/60">{p.desc}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <Link href="/citizenx">
                <span className="btn-metal-blue mt-12 inline-flex items-center rounded-full px-8 py-3 text-sm font-medium">
                  Explore CitizenX <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* PARTICIPATE — PATHWAYS */}
        <section id="participate" className="border-y border-[#E2E8F0] bg-[#F8FAFC] py-32 lg:py-40">
          <div className="container mx-auto max-w-7xl px-4 lg:px-8">
            <Reveal>
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Join Humanity's Discovery Network
                </span>
                <h2 className="mt-6 font-serif text-4xl tracking-tight lg:text-5xl">
                  There's a way in for everyone.
                </h2>
              </div>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PATHWAYS.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.08}>
                  <Link href="/login">
                    <div className="group flex h-full flex-col rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
                      <div className="icon-tile-metal mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:text-white">
                        <p.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold">{p.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-[#64748B]">{p.desc}</p>
                      <div className="mt-6 flex items-center text-sm font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                        Get started <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING MANIFESTO */}
        <section className="relative overflow-hidden bg-[#0B1120] py-36 text-center text-white lg:py-44">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/25 blur-[160px]" />
            <div className="absolute bottom-0 right-1/3 h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[150px]" />
          </div>
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={GRID_BG} />
          <div className="container relative z-10 mx-auto max-w-4xl px-4 lg:px-8">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                The Manifesto
              </span>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[1.12] tracking-tight lg:text-6xl">
                We are building Humanity's Discovery Network.
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
                Unlocking the world's largest untapped source of discovery: people. Because humanity's greatest challenges require humanity's collective intelligence.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login">
                  <Button size="lg" className="h-12 w-full rounded-full px-8 text-base sm:w-auto">
                    Join the Network <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.24}>
              <p className="mt-10 font-serif text-lg italic text-white/60">
                Turning Human Curiosity into Collective Intelligence
              </p>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#0B1120] text-[#94A3B8]">
        <div className="container mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            {/* Brand + newsletter */}
            <div className="lg:w-[34%]">
              <Logo variant="full" theme="dark" />
              <p className="mt-5 max-w-sm text-sm leading-relaxed">
                Humanity's Discovery Network — turning everyday curiosity into
                collective intelligence. We give anyone, anywhere the tools to
                run real experiments and contribute to the frontier of science.
              </p>
              <FooterNewsletter />
              <div className="mt-7 flex items-center gap-3">
                {[
                  { Icon: Twitter, label: "Twitter / X", href: "#" },
                  { Icon: Linkedin, label: "LinkedIn", href: "#" },
                  { Icon: Github, label: "GitHub", href: "#" },
                  { Icon: Youtube, label: "YouTube", href: "#" },
                  { Icon: Mail, label: "Email us", href: "mailto:56289968+danielinnov8@users.noreply.github.com" },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#94A3B8] transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Explore</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a href="#vision" className="transition-colors hover:text-white">Our Vision</a></li>
                  <li><a href="#discover" className="transition-colors hover:text-white">Discover</a></li>
                  <li><a href="#impact" className="transition-colors hover:text-white">Challenges</a></li>
                  <li><a href="#participate" className="transition-colors hover:text-white">Participate</a></li>
                  <li><a href="#community" className="transition-colors hover:text-white">Community</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Platform</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link></li>
                  <li><Link href="/agent" className="transition-colors hover:text-white">Science Copilot</Link></li>
                  <li><Link href="/experiments" className="transition-colors hover:text-white">Experiments</Link></li>
                  <li><Link href="/notebook" className="transition-colors hover:text-white">Field Notebook</Link></li>
                  <li><Link href="/directory" className="transition-colors hover:text-white">Inventor Directory</Link></li>
                  <li><Link href="/citizenx" className="transition-colors hover:text-white">CitizenX</Link></li>
                  <li><Link href="/progress" className="transition-colors hover:text-white">Your Progress</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Areas of Science</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  {CATEGORIES.filter((c) =>
                    ["biology", "physics", "climate-science", "astronomy", "neuroscience", "chemistry"].includes(c.slug),
                  ).map((c) => (
                    <li key={c.slug}>
                      <Link href={`/category/${c.slug}`} className="transition-colors hover:text-white">{c.name}</Link>
                    </li>
                  ))}
                  <li>
                    <Link href="/categories" className="inline-flex items-center gap-1 text-blue-400 transition-colors hover:text-blue-300">
                      All areas <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">Company</h4>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link></li>
                  <li><Link href="/brand" className="transition-colors hover:text-white">Brand Guidelines</Link></li>
                  <li><Link href="/login" className="transition-colors hover:text-white">Sign In / Join</Link></li>
                  <li><a href="mailto:56289968+danielinnov8@users.noreply.github.com" className="transition-colors hover:text-white">Contact</a></li>
                  <li><Link href="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="transition-colors hover:text-white">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs md:flex-row lg:px-8">
            <p className="order-2 md:order-1">
              &copy; {new Date().getFullYear()} Citizen Science. All rights reserved.
            </p>
            <p className="order-1 flex items-center gap-1.5 md:order-2">
              <MapPin className="h-3.5 w-3.5" />
              A global research network — built for everyone.
            </p>
            <p className="order-3">
              Built by{" "}
              <a
                href="https://ideafactory.agency/danielinnovate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white transition-colors hover:text-[#D4AF37]"
              >
                Daniel Innov8
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
