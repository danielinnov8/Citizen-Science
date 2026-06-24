import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  User,
  Calendar,
  Lightbulb,
  Target,
  BookOpen,
} from "lucide-react";
import {
  useGetChallengeSolution,
  useVoteSolution,
  getGetChallengeSolutionQueryKey,
} from "@workspace/api-client-react";
import type { ChallengeSolutionDetail as ChallengeSolutionDetailResponse } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string; accent: string; dark: string }> = {
  climate:         { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200", accent: "#10B981", dark: "#065F46" },
  energy:          { bg: "bg-yellow-50",   text: "text-yellow-700",   border: "border-yellow-200",  accent: "#F59E0B", dark: "#78350F" },
  health:          { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-200",    accent: "#F43F5E", dark: "#881337" },
  food:            { bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200",  accent: "#F97316", dark: "#7C2D12" },
  water:           { bg: "bg-sky-50",      text: "text-sky-700",      border: "border-sky-200",     accent: "#0EA5E9", dark: "#0C4A6E" },
  education:       { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200",  accent: "#7C3AED", dark: "#4C1D95" },
  "AI safety":     { bg: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200",  accent: "#9333EA", dark: "#581C87" },
  biodiversity:    { bg: "bg-green-50",    text: "text-green-700",    border: "border-green-200",   accent: "#16A34A", dark: "#14532D" },
  "mental health": { bg: "bg-pink-50",     text: "text-pink-700",     border: "border-pink-200",    accent: "#EC4899", dark: "#831843" },
  inequality:      { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",   accent: "#D97706", dark: "#78350F" },
  peace:           { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",    accent: "#2563EB", dark: "#1E3A8A" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical",  color: "text-red-300",    bg: "bg-red-950/40 border-red-800" },
  high:     { label: "High",      color: "text-orange-300", bg: "bg-orange-950/40 border-orange-800" },
  medium:   { label: "Medium",    color: "text-yellow-300", bg: "bg-yellow-950/40 border-yellow-800" },
};

function domainStyle(domain: string) {
  return DOMAIN_COLORS[domain] ?? { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", accent: "#64748B", dark: "#1E293B" };
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Inline vote widget (larger, page-level) ──────────────────────────────────

interface PageVoteWidgetProps {
  solution: ChallengeSolutionDetailResponse;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

function PageVoteWidget({ solution, isAuthenticated, onLoginRequired }: PageVoteWidgetProps) {
  const queryClient = useQueryClient();
  const voteMutation = useVoteSolution();

  function handleVote(direction: 1 | -1) {
    if (!isAuthenticated) { onLoginRequired(); return; }
    const newDir = solution.userVote === direction ? 0 : direction;
    voteMutation.mutate(
      { slug: solution.challengeSlug, solutionId: solution.id, data: { direction: newDir as 0 | 1 | -1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetChallengeSolutionQueryKey(solution.challengeSlug, solution.id),
          });
        },
      },
    );
  }

  const pending = voteMutation.isPending;

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={pending}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all",
          solution.userVote === 1
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-emerald-300 hover:text-emerald-500",
          pending && "opacity-60 cursor-wait",
        )}
        title="Upvote"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
      <span
        className={cn(
          "text-lg font-bold tabular-nums",
          solution.voteScore > 0
            ? "text-emerald-600"
            : solution.voteScore < 0
            ? "text-red-500"
            : "text-[#94A3B8]",
        )}
      >
        {solution.voteScore}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={pending}
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all",
          solution.userVote === -1
            ? "border-red-500 bg-red-50 text-red-600"
            : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-red-300 hover:text-red-400",
          pending && "opacity-60 cursor-wait",
        )}
        title="Downvote"
      >
        <ArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function ChallengeSolutionDetail() {
  const [, params] = useRoute("/challenges/:slug/solutions/:solutionId");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const slug = params?.slug ?? "";
  const solutionId = params?.solutionId ?? "";

  const { data: solution, isLoading, isError } = useGetChallengeSolution(slug, solutionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="h-72 bg-[#0F172A] animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-[#E2E8F0] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !solution) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-semibold text-[#0F172A]">Solution not found</p>
          <Link href={`/challenges/${slug}`} className="text-blue-600 hover:underline text-sm">
            ← Back to challenge
          </Link>
        </div>
      </div>
    );
  }

  const ds = domainStyle(solution.challengeDomain);
  const urgency = URGENCY_CONFIG[solution.challengeUrgency] ?? {
    label: solution.challengeUrgency,
    color: "text-slate-300",
    bg: "bg-slate-900/40 border-slate-700",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Dark hero: problem statement ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #0F172A 0%, ${ds.dark ?? "#1E293B"} 100%)` }}
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-16">
          {/* Breadcrumb */}
          <Link
            href={`/challenges/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to challenge
          </Link>

          {/* Domain + urgency pills */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className={cn("text-xs font-semibold px-3 py-1 rounded-full border", ds.bg, ds.text, ds.border)}>
              {solution.challengeDomain}
            </span>
            <span className={cn("text-xs font-medium px-3 py-1 rounded-full border", urgency.bg, urgency.color)}>
              {urgency.label} urgency
            </span>
          </div>

          {/* Challenge title — the "problem" */}
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            The Challenge
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5 max-w-3xl">
            {solution.challengeTitle}
          </h1>

          {/* Challenge summary */}
          <p className="text-slate-300 text-lg leading-relaxed max-w-3xl mb-6">
            {solution.challengeSummary}
          </p>

          {/* Why it matters */}
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
              Why it matters
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              {solution.challengeWhyItMatters}
            </p>
          </div>
        </div>
      </div>

      {/* ── Solution content ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Left sidebar: metadata + vote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-1 space-y-4"
          >
            {/* Vote card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-4">
                Community vote
              </p>
              <PageVoteWidget
                solution={solution}
                isAuthenticated={isAuthenticated}
                onLoginRequired={() => navigate("/login")}
              />
              {!isAuthenticated && (
                <p className="mt-3 text-xs text-[#94A3B8]">
                  <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>{" "}
                  to vote
                </p>
              )}
            </div>

            {/* Author card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
                Proposed by
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  {solution.authorSlug ? (
                    <Link
                      href={`/directory/${solution.authorSlug}`}
                      className="font-semibold text-[#0F172A] hover:text-blue-700 transition-colors"
                    >
                      {solution.authorName}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#0F172A]">{solution.authorName}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(solution.createdAt)}</span>
              </div>
            </div>

            {/* External link card */}
            {solution.link && (
              <a
                href={solution.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 shadow-sm hover:bg-blue-100 transition-colors group"
              >
                <ExternalLink className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-blue-700 group-hover:underline line-clamp-2">
                  Learn more
                </span>
              </a>
            )}

            {/* Back to all solutions */}
            <Link
              href={`/challenges/${slug}`}
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-blue-700 transition-colors px-1"
            >
              <ChevronLeft className="h-4 w-4" />
              All solutions
            </Link>
          </motion.div>

          {/* Right: solution content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Solution title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
                  The Proposed Solution
                </p>
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] leading-snug mb-4">
                {solution.title}
              </h2>
              <p className="text-[#475569] leading-relaxed text-base">
                {solution.description}
              </p>
            </motion.div>

            {/* Approach */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]">
                  The Approach
                </p>
              </div>
              <p className="text-[#475569] leading-relaxed text-base whitespace-pre-line">
                {solution.approach}
              </p>
            </motion.div>

            {/* Explore the challenge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              <Link
                href={`/challenges/${slug}`}
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-6 shadow-sm transition-colors group",
                  ds.bg, ds.border,
                )}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={cn("h-5 w-5 shrink-0", ds.text)} />
                  <div>
                    <p className={cn("text-xs font-semibold uppercase tracking-wide mb-0.5", ds.text)}>
                      Explore the challenge
                    </p>
                    <p className="text-sm font-medium text-[#0F172A] group-hover:text-blue-700 transition-colors">
                      {solution.challengeTitle}
                    </p>
                  </div>
                </div>
                <ChevronLeft className={cn("h-4 w-4 rotate-180 shrink-0", ds.text)} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
