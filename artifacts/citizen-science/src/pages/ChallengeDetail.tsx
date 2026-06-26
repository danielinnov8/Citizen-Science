import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ExternalLink,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  useGetChallenge,
  useJoinChallenge,
  useListChallengeSolutions,
  useCreateChallengeSolution,
  useVoteSolution,
  getListChallengeSolutionsQueryKey,
  getGetChallengeQueryKey,
} from "@workspace/api-client-react";
import type { ChallengeSolutionView } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { simulatedSolutionVotes, displaySolutionScore } from "@/lib/challengeSim";
import { NobelBadge } from "@/components/NobelBadge";

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  climate:      { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200", accent: "#10B981" },
  energy:       { bg: "bg-yellow-50",   text: "text-yellow-700",   border: "border-yellow-200",  accent: "#F59E0B" },
  health:       { bg: "bg-rose-50",     text: "text-rose-700",     border: "border-rose-200",    accent: "#F43F5E" },
  food:         { bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200",  accent: "#F97316" },
  water:        { bg: "bg-sky-50",      text: "text-sky-700",      border: "border-sky-200",     accent: "#0EA5E9" },
  education:    { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200",  accent: "#7C3AED" },
  "AI safety":  { bg: "bg-purple-50",   text: "text-purple-700",   border: "border-purple-200",  accent: "#9333EA" },
  biodiversity: { bg: "bg-green-50",    text: "text-green-700",    border: "border-green-200",   accent: "#16A34A" },
  "mental health": { bg: "bg-pink-50",  text: "text-pink-700",     border: "border-pink-200",    accent: "#EC4899" },
  inequality:   { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",   accent: "#D97706" },
  peace:        { bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200",    accent: "#2563EB" },
};

const URGENCY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "Critical Urgency",  color: "text-red-700",    bg: "bg-red-50 border-red-200" },
  high:     { label: "High Urgency",      color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  medium:   { label: "Medium Urgency",    color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
};

function domainStyle(domain: string) {
  return DOMAIN_COLORS[domain] ?? { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", accent: "#64748B" };
}

function formatRelativeDate(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// ─── Vote widget ─────────────────────────────────────────────────────────────

interface VoteWidgetProps {
  solution: ChallengeSolutionView;
  slug: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

function VoteWidget({ solution, slug, isAuthenticated, onLoginRequired }: VoteWidgetProps) {
  const queryClient = useQueryClient();

  const voteMutation = useVoteSolution({
    mutation: {
      onMutate: async ({ data }) => {
        const queryKey = getListChallengeSolutionsQueryKey(slug);
        await queryClient.cancelQueries({ queryKey });
        const previous = queryClient.getQueryData<ChallengeSolutionView[]>(queryKey);

        queryClient.setQueryData<ChallengeSolutionView[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((s) => {
            if (s.id !== solution.id) return s;
            const prevDir = s.userVote ?? 0;
            const newDir = data.direction === prevDir ? 0 : data.direction;
            return {
              ...s,
              voteScore: s.voteScore + (newDir - prevDir),
              userVote: newDir === 0 ? null : newDir,
            };
          });
        });

        return { previous };
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(getListChallengeSolutionsQueryKey(slug), context.previous);
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: getListChallengeSolutionsQueryKey(slug) });
      },
    },
  });

  function handleVote(direction: 1 | -1) {
    if (!isAuthenticated) {
      onLoginRequired();
      return;
    }
    voteMutation.mutate({ slug, solutionId: solution.id, data: { direction } });
  }

  const score = solution.voteScore + simulatedSolutionVotes(solution.id);
  const userVote = solution.userVote;
  const pending = voteMutation.isPending;

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => handleVote(1)}
        disabled={pending}
        title={isAuthenticated ? "Upvote" : "Sign in to vote"}
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-md border transition-all",
          userVote === 1
            ? "border-emerald-400 bg-emerald-50 text-emerald-600"
            : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-emerald-300 hover:text-emerald-500",
          pending && "opacity-60 cursor-wait",
        )}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "min-w-[28px] text-center text-sm font-semibold tabular-nums",
          score > 0 ? "text-emerald-600" : score < 0 ? "text-red-500" : "text-[#94A3B8]",
        )}
      >
        {score > 0 ? `+${score}` : score}
      </span>
      <button
        type="button"
        onClick={() => handleVote(-1)}
        disabled={pending}
        title={isAuthenticated ? "Downvote" : "Sign in to vote"}
        className={cn(
          "flex items-center justify-center h-7 w-7 rounded-md border transition-all",
          userVote === -1
            ? "border-red-400 bg-red-50 text-red-500"
            : "border-[#E2E8F0] bg-white text-[#94A3B8] hover:border-red-300 hover:text-red-400",
          pending && "opacity-60 cursor-wait",
        )}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Solution card ─────────────────────────────────────────────────────────────

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function AuthorAvatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-8 w-8 shrink-0 rounded-full object-cover border border-[#E2E8F0]"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[11px] font-semibold text-[#4F46E5] border border-[#E2E8F0]">
      {authorInitials(name)}
    </span>
  );
}

interface SolutionCardProps {
  solution: ChallengeSolutionView;
  slug: string;
  isAuthenticated: boolean;
  onLoginRequired: () => void;
}

function SolutionCard({ solution, slug, isAuthenticated, onLoginRequired }: SolutionCardProps) {
  const [approachOpen, setApproachOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AuthorAvatar name={solution.authorName} imageUrl={solution.authorImageUrl} />
          <div className="min-w-0 flex flex-col">
            {solution.authorSlug ? (
              <Link
                href={`/directory/${solution.authorSlug}`}
                className="text-sm font-semibold text-[#0F172A] hover:text-blue-700 transition-colors truncate"
              >
                {solution.authorName}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-[#0F172A] truncate">
                {solution.authorName}
              </span>
            )}
            <NobelBadge prizes={solution.authorNobelPrizes} variant="chip" className="-mt-1" />
          </div>
        </div>
        <VoteWidget
          solution={solution}
          slug={slug}
          isAuthenticated={isAuthenticated}
          onLoginRequired={onLoginRequired}
        />
      </div>

      <Link
        href={`/challenges/${slug}/solutions/${solution.id}`}
        className="block font-semibold text-[#0F172A] text-base leading-snug hover:text-blue-700 transition-colors mb-2"
      >
        {solution.title}
      </Link>

      <p className="text-sm text-[#64748B] mb-3 leading-relaxed">
        {solution.description}
      </p>

      <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] mb-3 overflow-hidden">
        <button
          type="button"
          onClick={() => setApproachOpen((v) => !v)}
          aria-expanded={approachOpen}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-[#F1F5F9] transition-colors"
        >
          <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">
            Approach
          </span>
          {approachOpen ? (
            <ChevronUp className="h-4 w-4 text-[#94A3B8] shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#94A3B8] shrink-0" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {approachOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-sm text-[#475569] leading-relaxed px-3 pb-3">
                {solution.approach}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <span>{formatRelativeDate(solution.createdAt)}</span>
        {solution.link && (
          <a
            href={solution.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            Learn more <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function ChallengeDetail() {
  const [, params] = useRoute("/challenges/:slug");
  const slug = params?.slug ?? "";
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formApproach, setFormApproach] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formError, setFormError] = useState("");

  const {
    data: challenge,
    isLoading,
    isError,
  } = useGetChallenge(slug, {
    query: { queryKey: getGetChallengeQueryKey(slug), staleTime: 1000 * 60, refetchOnWindowFocus: false },
  });

  const { data: solutions = [], isLoading: solutionsLoading } = useListChallengeSolutions(slug, {
    query: { queryKey: getListChallengeSolutionsQueryKey(slug), staleTime: 1000 * 30 },
  });

  // Rank solutions by their displayed (simulated + real) upvote score.
  const rankedSolutions = [...solutions].sort(
    (a, b) => displaySolutionScore(b) - displaySolutionScore(a),
  );

  const joinMutation = useJoinChallenge({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getGetChallengeQueryKey(slug) });
      },
    },
  });

  const solutionMutation = useCreateChallengeSolution({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListChallengeSolutionsQueryKey(slug),
        });
        setShowForm(false);
        setFormTitle("");
        setFormDesc("");
        setFormApproach("");
        setFormLink("");
        setFormError("");
      },
      onError: () => {
        setFormError("Failed to submit. Please try again.");
      },
    },
  });

  function handleJoin() {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    joinMutation.mutate({ slug });
  }

  function handleSubmitSolution(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!formTitle.trim() || !formDesc.trim() || !formApproach.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    solutionMutation.mutate({
      slug,
      data: {
        title: formTitle.trim(),
        description: formDesc.trim(),
        approach: formApproach.trim(),
        link: formLink.trim() || undefined,
      },
    });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] animate-pulse">
        <div className="h-64 bg-[#E2E8F0]" />
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
          <div className="h-8 w-64 rounded-lg bg-[#E2E8F0]" />
          <div className="h-4 w-full rounded bg-[#E2E8F0]" />
          <div className="h-4 w-3/4 rounded bg-[#E2E8F0]" />
        </div>
      </div>
    );
  }

  if (isError || !challenge) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-[#94A3B8] mb-4" />
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Challenge not found</h2>
          <Link href="/challenges" className="text-blue-600 text-sm hover:underline">
            ← Back to all challenges
          </Link>
        </div>
      </div>
    );
  }

  const ds = domainStyle(challenge.domain);
  const urgency = URGENCY_CONFIG[challenge.urgency] ?? { label: challenge.urgency, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[#0F172A] text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(ellipse 70% 50% at 0% 50%, ${ds.accent}55 0%, transparent 60%)`,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-14">
          <Link
            href="/challenges"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            All Challenges
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                ds.bg, ds.text,
              )}
            >
              <Zap className="h-3 w-3" />
              {challenge.domain}
            </span>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                urgency.bg, urgency.color,
              )}
            >
              {urgency.label}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 max-w-3xl">
            {challenge.title}
          </h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            {challenge.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleJoin}
              disabled={joinMutation.isPending}
              className={cn(
                "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all",
                challenge.isJoined
                  ? "bg-white/10 border border-white/30 text-white hover:bg-white/20"
                  : "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-900/30",
                joinMutation.isPending && "opacity-70 cursor-wait",
              )}
            >
              {joinMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : challenge.isJoined ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              {challenge.isJoined ? "Joined" : "Join this challenge"}
            </button>
            <span className="flex items-center gap-1.5 text-white/60 text-sm">
              <Users className="h-4 w-4" />
              {challenge.memberCount.toLocaleString()}{" "}
              {challenge.memberCount === 1 ? "member" : "members"} working on this
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        {/* ── Why it matters ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold text-[#0F172A] mb-4">Why It Matters</h2>
          <div className={cn("rounded-xl border p-6", ds.border, ds.bg)}>
            <p className={cn("leading-relaxed text-base", ds.text)}>
              {challenge.whyItMatters}
            </p>
          </div>
        </motion.section>

        {/* ── Teams working on it ── */}
        {challenge.teams.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-[#0F172A] mb-4">
              Who's Working on It
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenge.teams.map((team) => (
                <a
                  key={team.name}
                  href={team.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-[#0F172A] text-sm group-hover:text-blue-700 transition-colors leading-snug">
                      {team.name}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-[#94A3B8] group-hover:text-blue-500 transition-colors mt-0.5" />
                  </div>
                  <p className="text-[13px] text-[#64748B] leading-relaxed">
                    {team.description}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Community Solutions ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#0F172A]">
              Solutions from the Community
              {solutions.length > 0 && (
                <span className="ml-2 text-base font-normal text-[#94A3B8]">
                  ({solutions.length})
                </span>
              )}
            </h2>
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setShowForm((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80"
              >
                {showForm ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {showForm ? "Hide form" : "Submit approach"}
              </button>
            )}
          </div>

          {/* Submit form */}
          <AnimatePresence>
            {showForm && isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={handleSubmitSolution}
                  className="mb-6 rounded-xl border border-blue-200 bg-blue-50/60 p-6 space-y-4"
                >
                  <h3 className="font-semibold text-[#0F172A]">Submit Your Approach</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">
                      Solution title <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="A brief, descriptive title"
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      maxLength={160}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="What is your proposed solution?"
                      rows={3}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">
                      Your approach <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formApproach}
                      onChange={(e) => setFormApproach(e.target.value)}
                      placeholder="Explain the methodology, technology, or strategy you would use"
                      rows={3}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
                      maxLength={2000}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">
                      Link to more info (optional)
                    </label>
                    <input
                      value={formLink}
                      onChange={(e) => setFormLink(e.target.value)}
                      placeholder="https://…"
                      type="url"
                      className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      maxLength={500}
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-red-600">{formError}</p>
                  )}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={solutionMutation.isPending}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 transition-colors"
                    >
                      {solutionMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Submit
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Auth CTA for guests */}
          {!isAuthenticated && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center justify-between gap-4">
              <p className="text-sm text-blue-800">
                Sign in to submit your own solution proposal.
              </p>
              <Link
                href="/login"
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}

          {/* Solutions feed */}
          {solutionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-[#E2E8F0] animate-pulse" />
              ))}
            </div>
          ) : solutions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">No solutions yet.</p>
              <p className="text-xs text-[#CBD5E1]">Be the first to submit an approach!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rankedSolutions.map((solution) => (
                <SolutionCard
                  key={solution.id}
                  solution={solution}
                  slug={slug}
                  isAuthenticated={isAuthenticated}
                  onLoginRequired={() => navigate("/login")}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
