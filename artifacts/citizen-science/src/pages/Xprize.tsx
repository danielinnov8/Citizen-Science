import * as React from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  CircleDashed,
  AlertTriangle,
  MinusCircle,
  Clock,
  ExternalLink,
  Film,
  ArrowLeft,
} from "lucide-react";
import {
  COMPETITION,
  KEY_DATES,
  EVALUATION_CRITERIA,
  RIGHTS,
  REQUIREMENT_GROUPS,
  computeReadiness,
  daysUntil,
  type ReqStatus,
} from "@/lib/xprize";

const STATUS_META: Record<
  ReqStatus,
  { label: string; dot: string; text: string; chip: string; Icon: typeof CheckCircle2 }
> = {
  met: {
    label: "Ready",
    dot: "bg-[#16A34A]",
    text: "text-[#16A34A]",
    chip: "bg-green-50 text-[#15803D] border-green-200",
    Icon: CheckCircle2,
  },
  partial: {
    label: "Verify",
    dot: "bg-amber-500",
    text: "text-amber-600",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    Icon: Clock,
  },
  todo: {
    label: "To do",
    dot: "bg-[#94A3B8]",
    text: "text-[#64748B]",
    chip: "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]",
    Icon: CircleDashed,
  },
  atrisk: {
    label: "At risk",
    dot: "bg-red-500",
    text: "text-red-600",
    chip: "bg-red-50 text-red-700 border-red-200",
    Icon: AlertTriangle,
  },
  na: {
    label: "Later",
    dot: "bg-[#CBD5E1]",
    text: "text-[#94A3B8]",
    chip: "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]",
    Icon: MinusCircle,
  },
};

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const stroke = score >= 75 ? "#16A34A" : score >= 40 ? "#D97706" : "#2563EB";
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums text-[#0F172A]">{score}%</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Ready
        </span>
      </div>
    </div>
  );
}

export function Xprize() {
  const summary = React.useMemo(() => computeReadiness(), []);
  const deadlineDays = daysUntil(KEY_DATES[0].iso);

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-[#0F172A] font-sans">
      <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8 lg:py-14">
        {/* Dev banner */}
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <span className="font-medium">
            Internal dev dashboard · not part of the public site
          </span>
          <Link href="/" className="inline-flex items-center gap-1 font-semibold hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to app
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
          <Film className="h-4 w-4" />
          {COMPETITION.name}
        </div>
        <h1 className="mt-2 font-serif text-4xl tracking-tight lg:text-5xl">
          Submission readiness
        </h1>
        <p className="mt-3 max-w-2xl text-[#64748B]">
          {COMPETITION.tagline}. {COMPETITION.organizers}. Prize pool {COMPETITION.prizePool} —
          grand prize {COMPETITION.grandPrize}.
        </p>
        <a
          href={COMPETITION.rulesUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline"
        >
          Official rules <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {/* Score + summary */}
        <div className="mt-8 grid gap-5 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:grid-cols-[auto_1fr] sm:items-center">
          <ScoreRing score={summary.score} />
          <div>
            <div className="grid grid-cols-3 gap-3">
              <SummaryStat label="Ready" value={summary.met} className="text-[#16A34A]" />
              <SummaryStat label="Verify" value={summary.partial} className="text-amber-600" />
              <SummaryStat label="Open" value={summary.open} className="text-[#0F172A]" />
            </div>
            <p className="mt-4 text-sm text-[#64748B]">
              {summary.met + summary.partial}/{summary.total} scored requirements addressed. The
              biggest gaps are registration and producing the actual submission package (export,
              treatment, cover sheet). Acknowledgements and "later" steps aren't scored.
            </p>
          </div>
        </div>

        {/* Key dates */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {KEY_DATES.map((d, i) => {
            const days = daysUntil(d.iso);
            return (
              <div
                key={d.iso}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {d.label}
                  </span>
                  {i === 0 && days > 0 && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {days}d left
                    </span>
                  )}
                </div>
                <p className="mt-1 text-lg font-bold text-[#0F172A]">
                  {new Date(`${d.iso}T00:00:00`).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-1 text-xs leading-snug text-[#64748B]">{d.note}</p>
              </div>
            );
          })}
        </div>

        {deadlineDays > 0 && (
          <p className="mt-3 text-sm text-[#64748B]">
            <Clock className="mr-1 inline h-4 w-4 -translate-y-0.5 text-amber-600" />
            <span className="font-semibold text-[#0F172A]">{deadlineDays} days</span> until the
            submission deadline.
          </p>
        )}

        {/* Requirement groups */}
        <div className="mt-10 space-y-8">
          {REQUIREMENT_GROUPS.map((group) => (
            <section key={group.id}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
                {group.label}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
                {group.items.map((item, idx) => {
                  const meta = STATUS_META[item.status];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={item.id}
                      className={
                        "flex gap-4 p-4 lg:p-5" +
                        (idx > 0 ? " border-t border-[#F1F5F9]" : "")
                      }
                    >
                      <Icon className={"mt-0.5 h-5 w-5 shrink-0 " + meta.text} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-[#0F172A]">{item.title}</h3>
                          <span
                            className={
                              "rounded-full border px-2 py-0.5 text-[11px] font-semibold " +
                              meta.chip
                            }
                          >
                            {meta.label}
                          </span>
                          {!item.counts && (
                            <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#94A3B8]">
                              not scored
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#475569]">{item.rule}</p>
                        <p className="mt-1.5 text-sm text-[#64748B]">
                          <span className="font-semibold text-[#0F172A]">Us: </span>
                          {item.note}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Evaluation criteria */}
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
            How judges score (informational)
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {EVALUATION_CRITERIA.map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm"
              >
                <h3 className="font-semibold text-[#0F172A]">{c.title}</h3>
                <p className="mt-1 text-sm text-[#64748B]">{c.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#94A3B8]">
            YouTube engagement (views, likes, comments, shares) is also factored in, but audience
            size won't give a significant advantage.
          </p>
        </section>

        {/* Rights */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-green-200 bg-green-50/40 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#15803D]">
              What you keep
            </h2>
            <ul className="mt-3 space-y-2">
              {RIGHTS.keep.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-[#334155]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
              What you grant
            </h2>
            <ul className="mt-3 space-y-2">
              {RIGHTS.grant.map((r) => (
                <li key={r} className="flex gap-2 text-sm text-[#334155]">
                  <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <p className="mt-10 text-xs text-[#94A3B8]">
          Statuses are a best-effort assessment of this project against the official rules and are
          editable in <code className="rounded bg-[#F1F5F9] px-1">src/lib/xprize.ts</code>. Always
          confirm against the{" "}
          <a href={COMPETITION.rulesUrl} target="_blank" rel="noreferrer" className="underline">
            current official rules
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
      <p className={"text-2xl font-bold tabular-nums " + (className ?? "")}>{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">{label}</p>
    </div>
  );
}

export default Xprize;
