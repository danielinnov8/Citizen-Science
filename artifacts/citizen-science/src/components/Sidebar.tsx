import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Compass,
  Beaker,
  BookA,
  TrendingUp,
  User,
  Users,
  GraduationCap,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowRight,
  FlaskConical,
  NotebookPen,
  Shield,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { EXPERIMENTS } from "@/lib/experiments";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BadgeTile } from "@/components/Logo";
import { CreditMeter } from "@/components/CreditMeter";

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  public: boolean;
}

/**
 * SidebarBadge — the shared glossy badge (same treatment + size as the logo
 * mark) used for every sidebar icon button. Centralizing it here means any
 * future sidebar button automatically matches the logo with no extra styling.
 * It lives inside a `group` link/button, so it lifts slightly on hover.
 */
function SidebarBadge({ icon: Icon }: { icon: typeof LayoutDashboard }) {
  return (
    <BadgeTile className="shrink-0 transition-transform duration-150 group-hover:scale-105">
      <Icon className="relative h-4 w-4" />
    </BadgeTile>
  );
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", public: false },
    ],
  },
  {
    label: "Explore",
    items: [
      { icon: Compass, label: "Categories", href: "/categories", public: false },
      { icon: Beaker, label: "Experiments", href: "/experiments", public: false },
      { icon: Users, label: "Directory", href: "/directory", public: true },
      { icon: GraduationCap, label: "Mentors", href: "/mentors", public: true },
    ],
  },
  {
    label: "Community",
    items: [
      { icon: Globe2, label: "CitizenX", href: "/citizenx", public: true },
    ],
  },
  {
    label: "Workspace",
    items: [
      { icon: BookA, label: "Notebook", href: "/notebook", public: false },
      { icon: TrendingUp, label: "Progress", href: "/progress", public: false },
    ],
  },
];

function experimentProgress(
  experimentId: string,
  completedSteps: { experimentId: string; stepIndex: number }[],
): number {
  const exp = EXPERIMENTS.find((e) => e.id === experimentId);
  if (!exp || exp.steps.length === 0) return 0;
  const done = completedSteps.filter((s) => s.experimentId === experimentId).length;
  return Math.min(100, Math.round((done / exp.steps.length) * 100));
}

export function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(() => storage.getSidebarCollapsed());

  // Individual profile pages (`/directory/:slug`) are immersive, full-width
  // story pages — collapse the sidebar on arrival to let the hero breathe, and
  // restore the user's saved preference once they navigate elsewhere.
  const isProfilePage = /^\/directory\/[^/]+$/.test(location);
  React.useEffect(() => {
    setCollapsed(isProfilePage ? true : storage.getSidebarCollapsed());
  }, [isProfilePage]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      storage.setSidebarCollapsed(next);
      return next;
    });
  };

  // Live stats + "continue learning" derived from the user's activity. Recompute
  // on every navigation so the sidebar reflects newly started experiments and
  // logged observations as the user moves around the app.
  const { startedCount, observationsCount, resume } = React.useMemo(() => {
    if (!isAuthenticated) {
      return { startedCount: 0, observationsCount: 0, resume: null as null | {
        id: string;
        title: string;
        progress: number;
      } };
    }
    const started = storage.getStartedExperiments();
    const completedSteps = storage.getCompletedSteps();
    const notebooks = storage.getNotebookEntries();

    // Most recently started experiment that isn't fully complete yet.
    const sorted = [...started].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    let resumeCard: { id: string; title: string; progress: number } | null = null;
    let activeCount = 0;
    for (const s of sorted) {
      const exp = EXPERIMENTS.find((e) => e.id === s.id);
      if (!exp) continue;
      const progress = experimentProgress(s.id, completedSteps);
      if (progress >= 100) continue;
      activeCount += 1;
      if (!resumeCard) {
        resumeCard = { id: s.id, title: exp.title, progress };
      }
    }

    return {
      startedCount: activeCount,
      observationsCount: notebooks.length,
      resume: resumeCard,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, location]);

  const isActive = (href: string) =>
    location === href || (location.startsWith(href) && href !== "/");

  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href);
    const link = (
      <Link
        href={item.href}
        className={cn(
          "group flex items-center gap-3 rounded-lg py-1.5 px-1 text-sm font-medium transition-colors",
          collapsed && "justify-center",
          active
            ? "bg-blue-50 text-blue-700"
            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
        )}
      >
        <SidebarBadge icon={item.icon} />
        {!collapsed && item.label}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return <React.Fragment key={item.href}>{link}</React.Fragment>;
  };

  // Superadmins get an extra admin section, surfaced only to allowlisted
  // accounts (the route itself is also guarded server-side and in AdminRoute).
  const groups: NavGroup[] = user?.isSuperAdmin
    ? [
        ...NAV_GROUPS,
        {
          label: "Admin",
          items: [
            { icon: Shield, label: "Admin", href: "/admin", public: false },
          ],
        },
      ]
    : NAV_GROUPS;

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: isAuthenticated ? group.items : group.items.filter((i) => i.public),
    }))
    .filter((group) => group.items.length > 0);

  const copilotActive = isActive("/agent");

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-[#E2E8F0] bg-white h-[calc(100vh-3.5rem)] sticky top-14 transition-[width] duration-200",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Science Copilot — the primary entry point into the AI feature. */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/agent"
                  className={cn(
                    "group flex items-center justify-center rounded-lg py-1.5 px-1 transition-colors",
                    copilotActive ? "bg-blue-50" : "hover:bg-[#F1F5F9]",
                  )}
                >
                  <SidebarBadge icon={Sparkles} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Science Copilot</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/agent"
              className={cn(
                "group flex items-center gap-3 rounded-lg py-1.5 px-1 transition-colors",
                copilotActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
              )}
            >
              <SidebarBadge icon={Sparkles} />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold leading-tight text-[#0F172A]">
                  Science Copilot
                </span>
                <span className="block text-[11px] text-[#94A3B8] leading-tight">Ask anything</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* Continue learning — direct link back into an in-progress experiment. */}
          {!collapsed && isAuthenticated && resume && (
            <Link
              href={`/experiments/${resume.id}`}
              className="block rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
            >
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Continue
                </span>
              </div>
              <p className="text-sm font-medium text-[#0F172A] leading-snug line-clamp-2">
                {resume.title}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                    style={{ width: `${resume.progress}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] tabular-nums">
                  {resume.progress}%
                </span>
              </div>
            </Link>
          )}

          {/* Grouped navigation */}
          <nav className="space-y-5">
            {visibleGroups.map((group, gi) => (
              <div key={group.label ?? `group-${gi}`} className="space-y-1">
                {!collapsed && group.label && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    {group.label}
                  </p>
                )}
                {group.items.map(renderNavLink)}
              </div>
            ))}
          </nav>

          {/* Credit balance — live AI usage meter, links to plans for top-up/upgrade. */}
          {!collapsed && <CreditMeter className="mt-1" />}

          {/* Live activity stats — interconnects the sidebar with the user's
              experiments and notebook so progress is always visible. */}
          {!collapsed && isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/experiments"
                className="rounded-lg border border-[#E2E8F0] bg-white p-2.5 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                  <Beaker className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Active</span>
                </div>
                <p className="mt-1 text-lg font-bold leading-none text-[#0F172A] tabular-nums">
                  {startedCount}
                </p>
              </Link>
              <Link
                href="/notebook"
                className="rounded-lg border border-[#E2E8F0] bg-white p-2.5 transition-colors hover:border-blue-300 hover:bg-blue-50/40"
              >
                <div className="flex items-center gap-1.5 text-[#94A3B8]">
                  <NotebookPen className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Logs</span>
                </div>
                <p className="mt-1 text-lg font-bold leading-none text-[#0F172A] tabular-nums">
                  {observationsCount}
                </p>
              </Link>
            </div>
          )}
        </div>

        {/* Footer: user card (when authed) + collapse toggle */}
        <div className="border-t border-[#E2E8F0] p-3 space-y-1">
          {isAuthenticated && user && (
            <>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/profile"
                      className="flex h-9 w-9 mx-auto items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 transition-transform hover:scale-105"
                    >
                      {user.initials || "U"}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{user.name}</TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F1F5F9]",
                    isActive("/profile") && "bg-blue-50",
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {user.initials || "U"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[#0F172A]">
                      {user.name}
                    </span>
                    <span className="block truncate text-[11px] text-[#94A3B8]">{user.email}</span>
                  </span>
                  <User className="h-4 w-4 shrink-0 text-[#94A3B8]" />
                </Link>
              )}
            </>
          )}

          {!isAuthenticated && (
            <>{renderNavLink({ icon: User, label: "Profile", href: "/profile", public: true })}</>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#64748B] transition-colors hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                  collapsed && "justify-center",
                )}
              >
                {collapsed ? (
                  <PanelLeftOpen className="h-4 w-4 shrink-0" />
                ) : (
                  <PanelLeftClose className="h-4 w-4 shrink-0" />
                )}
                {!collapsed && "Collapse"}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Expand sidebar</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
