import * as React from "react";
import { Link } from "wouter";
import { Zap } from "lucide-react";
import { useGetCreditBalance, getGetCreditBalanceQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  guest: "Guest",
  free: "Free",
  researcher: "Researcher",
  pioneer: "Pioneer",
};

function formatCredits(n: number): string {
  return Math.max(0, Math.round(n)).toLocaleString("en-US");
}

function formatRenewal(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * useCreditBalance — shared access to the live credit balance. Polls quietly so
 * the meter reflects spend after each AI action without a manual refresh, and
 * exposes `refetch` so callers (e.g. the copilot) can refresh immediately after
 * a request completes.
 */
export function useCreditBalance() {
  return useGetCreditBalance({
    query: {
      queryKey: getGetCreditBalanceQueryKey(),
      staleTime: 15_000,
      refetchOnWindowFocus: true,
    },
  });
}

/**
 * CreditMeter — compact balance pill with a usage bar. Used in the copilot
 * header and the sidebar. Renders a plan label, remaining/total credits, and a
 * progress bar that turns amber/red as the balance runs low. Links to /pricing
 * so users can top up or upgrade.
 */
export function CreditMeter({
  variant = "full",
  className,
}: {
  variant?: "full" | "compact";
  className?: string;
}) {
  const { data, isLoading, isError } = useCreditBalance();

  if (isLoading || isError || !data) {
    // Stay quiet until we have real numbers — no skeleton flashing.
    return null;
  }

  const planLabel = PLAN_LABELS[data.plan] ?? "Free";
  const total = data.monthlyGrant + data.topupBalance;
  const remaining = data.totalRemaining;
  const used = Math.max(0, total - remaining);
  const usedPct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const low = remaining <= total * 0.1;
  const empty = remaining <= 0;

  const barColor = empty
    ? "bg-red-500"
    : low
      ? "bg-amber-500"
      : "bg-gradient-to-r from-blue-500 to-violet-500";

  if (variant === "compact") {
    return (
      <Link
        href="/pricing"
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-medium text-[#475569] transition-colors hover:border-blue-300 hover:bg-blue-50/40",
          className,
        )}
        data-testid="credit-meter-compact"
      >
        <Zap className={cn("h-3.5 w-3.5", empty ? "text-red-500" : low ? "text-amber-500" : "text-blue-600")} />
        <span className="tabular-nums text-[#0F172A]">{formatCredits(remaining)}</span>
        <span className="text-[#94A3B8]">credits</span>
      </Link>
    );
  }

  return (
    <Link
      href="/pricing"
      className={cn(
        "group block rounded-xl border border-[#E2E8F0] bg-white p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40",
        className,
      )}
      data-testid="credit-meter"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          <Zap className="h-3.5 w-3.5 text-blue-600" />
          {planLabel} credits
        </span>
        <span className="text-[11px] font-semibold text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
          {data.isGuest ? "Sign up" : "Upgrade"}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-lg font-bold leading-none text-[#0F172A] tabular-nums">
          {formatCredits(remaining)}
        </span>
        <span className="text-[11px] text-[#94A3B8] tabular-nums">/ {formatCredits(total)}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${usedPct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        {formatRenewal(data.renewalDate) ? (
          <p className="text-[10px] text-[#94A3B8]">Renews {formatRenewal(data.renewalDate)}</p>
        ) : (
          <span />
        )}
        {data.topupBalance > 0 && (
          <p className="text-[10px] text-[#94A3B8]">
            +{formatCredits(data.topupBalance)} top-up
          </p>
        )}
      </div>
    </Link>
  );
}
