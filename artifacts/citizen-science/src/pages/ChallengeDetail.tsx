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
} from "lucide-react";
import {
  useGetChallenge,
  useJoinChallenge,
  useListChallengeSolutions,
  useCreateChallengeSolution,
  getListChallengeSolutionsQueryKey,
  getGetChallengeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
              {solutions.map((solution) => (
                <div
                  key={solution.id}
                  className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h4 className="font-semibold text-[#0F172A] text-base">
                      {solution.title}
                    </h4>
                    <span className="shrink-0 text-[11px] text-[#94A3B8]">
                      {formatRelativeDate(solution.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] mb-3 leading-relaxed">
                    {solution.description}
                  </p>
                  <div className="rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 mb-3">
                    <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-1">
                      Approach
                    </p>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {solution.approach}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                    <span>by {solution.userName}</span>
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
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
