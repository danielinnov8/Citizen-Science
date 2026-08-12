import * as React from "react";
import {
  Shield,
  Users as UsersIcon,
  DollarSign,
  Activity,
  Boxes,
  Server,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  BadgeCheck,
  Mail,
  Plus,
  Trash2,
  Pencil,
  Send,
  Upload,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ListPlus,
  Globe,
  Eye,
  Loader2,
  Link2,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useGetAdminOverview,
  getGetAdminOverviewQueryKey,
  useListAdminUsers,
  getListAdminUsersQueryKey,
  useGetAdminRevenue,
  getGetAdminRevenueQueryKey,
  useGetAdminUsage,
  getGetAdminUsageQueryKey,
  useGetAdminContent,
  getGetAdminContentQueryKey,
  useGetAdminSystem,
  getGetAdminSystemQueryKey,
  useUpdateUserPlan,
  useGrantUserCredits,
  useListAdminClaims,
  getListAdminClaimsQueryKey,
  useApproveClaim,
  useDenyClaim,
  useSetUserMentor,
  useListOutreachProspects,
  getListOutreachProspectsQueryKey,
  useCreateOutreachProspect,
  useBulkImportOutreachProspects,
  useUpdateOutreachProspect,
  useDeleteOutreachProspect,
  useListOutreachTemplates,
  getListOutreachTemplatesQueryKey,
  useUpdateOutreachTemplate,
  useListOutreachSends,
  getListOutreachSendsQueryKey,
  useTriggerOutreachBatch,
  useGetOutreachSettings,
  getGetOutreachSettingsQueryKey,
  useUpdateOutreachSettings,
  useQueueDirectoryProspects,
  useResearchProspectContacts,
  useGetOutreachProspect,
  getGetOutreachProspectQueryKey,
  usePreviewOutreachProspectEmail,
  useApproveOutreachProspect,
  useSendOutreachProspect,
  type AdminUser,
  type AdminClaim,
  type OutreachProspect,
  type OutreachProspectDetail,
  type OutreachTemplate,
  type ListOutreachProspectsParams,
  type ListOutreachSendsParams,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const CHART_COLORS = ["#2563EB", "#16A34A", "#7C3AED", "#F59E0B", "#EF4444"];
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  researcher: "Researcher",
  pioneer: "Pioneer",
};

function fmt(n: number | undefined | null): string {
  return Math.round(n ?? 0).toLocaleString("en-US");
}

function fmtUsd(n: number | undefined | null): string {
  return (n ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function shortDay(d: string): string {
  // "YYYY-MM-DD" -> "M/D"; "YYYY-MM" -> "Mon"
  const parts = d.split("-");
  if (parts.length === 3) return `${Number(parts[1])}/${Number(parts[2])}`;
  if (parts.length === 2) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  return d;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            {label}
          </p>
          <Icon className="h-4 w-4 text-[#94A3B8]" />
        </div>
        <p className="mt-2 text-2xl font-bold text-[#0F172A] tabular-nums">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-[#64748B]">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-xl" />
      ))}
    </div>
  );
}

/* ---------------------------------- Overview --------------------------------- */

function OverviewTab() {
  const { data, isLoading } = useGetAdminOverview({
    query: { queryKey: getGetAdminOverviewQueryKey(), staleTime: 30_000 },
  });

  if (isLoading || !data) return <LoadingGrid />;

  const planData = data.planDistribution.map((p) => ({
    name: PLAN_LABELS[p.plan] ?? p.plan,
    value: p.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={fmt(data.totalUsers)}
          sub={`${fmt(data.guestSubjects)} guest sessions`}
        />
        <StatCard
          icon={TrendingUp}
          label="New Today"
          value={fmt(data.newToday)}
          sub={`${fmt(data.new7d)} this week`}
        />
        <StatCard
          icon={TrendingUp}
          label="New (30d)"
          value={fmt(data.new30d)}
        />
        <StatCard
          icon={Activity}
          label="Credits Used (mo)"
          value={fmt(data.creditsConsumedThisMonth)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Signups" description="New registrations, last 30 days">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.signupTrend}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                dataKey="date"
                tickFormatter={shortDay}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                interval={4}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <RTooltip labelFormatter={shortDay} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                fill="url(#sg)"
                name="Signups"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Distribution" description="Accounts by tier">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={planData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(e) => `${e.name}: ${e.value}`}
              >
                {planData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <RTooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Copilot Activity" description="AI requests, last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.copilotTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              interval={4}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <RTooltip labelFormatter={shortDay} />
            <Bar dataKey="value" fill="#7C3AED" name="Requests" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ----------------------------------- Users ----------------------------------- */

function ManageUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [plan, setPlan] = React.useState<string>("free");
  const [credits, setCredits] = React.useState<string>("");

  const updatePlan = useUpdateUserPlan();
  const grantCredits = useGrantUserCredits();
  const setMentor = useSetUserMentor();
  const [isMentor, setIsMentor] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      setPlan(user.plan);
      setCredits("");
      setIsMentor(user.isMentor);
    }
  }, [user]);

  if (!user) return null;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });

  const savePlan = async () => {
    try {
      await updatePlan.mutateAsync({
        id: user.id,
        data: { plan: plan as "free" | "researcher" | "pioneer" },
      });
      await invalidate();
      toast({ title: "Plan updated", description: `${user.email} → ${PLAN_LABELS[plan] ?? plan}` });
    } catch {
      toast({ title: "Could not update plan", variant: "destructive" });
    }
  };

  const toggleMentor = async (next: boolean) => {
    setIsMentor(next);
    try {
      await setMentor.mutateAsync({ id: user.id, data: { isMentor: next } });
      await invalidate();
      toast({
        title: next ? "Mentor enabled" : "Mentor disabled",
        description: `${user.email} is ${next ? "now" : "no longer"} a mentor`,
      });
    } catch {
      setIsMentor(!next);
      toast({ title: "Could not update mentor status", variant: "destructive" });
    }
  };

  const giveCredits = async () => {
    const amount = parseInt(credits, 10);
    if (!Number.isFinite(amount) || amount < 1) {
      toast({ title: "Enter a positive credit amount", variant: "destructive" });
      return;
    }
    try {
      await grantCredits.mutateAsync({ id: user.id, data: { credits: amount } });
      await invalidate();
      toast({ title: "Credits granted", description: `+${fmt(amount)} to ${user.email}` });
      setCredits("");
    } catch {
      toast({ title: "Could not grant credits", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage {user.name || user.email}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A]">Plan</label>
            <div className="flex gap-2">
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="pioneer">Pioneer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={savePlan}
                disabled={updatePlan.isPending || plan === user.plan}
              >
                Save
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-[#0F172A]">Mentor</label>
              <p className="text-xs text-[#64748B]">
                Allow this user to offer mentoring courses.
              </p>
            </div>
            <Switch
              checked={isMentor}
              onCheckedChange={toggleMentor}
              disabled={setMentor.isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F172A]">
              Grant top-up credits
            </label>
            <p className="text-xs text-[#64748B]">
              Current top-up balance: {fmt(user.topupBalance)}
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                placeholder="e.g. 500"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={giveCredits}
                disabled={grantCredits.isPending}
              >
                Grant
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersTab() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;
  const [selected, setSelected] = React.useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const params = { search: search || undefined, page, pageSize };
  const { data, isLoading } = useListAdminUsers(params, {
    query: { queryKey: getListAdminUsersQueryKey(params), staleTime: 15_000 },
  });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const openManage = (u: AdminUser) => {
    setSelected(u);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <Input
            placeholder="Search by email or name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Signup</TableHead>
                <TableHead className="text-right">Used (mo)</TableHead>
                <TableHead className="text-right">Top-up</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#94A3B8]">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : data && data.users.length > 0 ? (
                data.users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-[#0F172A]">{u.name || "—"}</div>
                      <div className="text-xs text-[#94A3B8]">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.plan === "free" ? "secondary" : "default"}
                        className="capitalize"
                      >
                        {PLAN_LABELS[u.plan] ?? u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-sm text-[#64748B]">
                      {u.signupMethod}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(u.creditsUsedThisMonth)}
                      <span className="text-[#94A3B8]">/{fmt(u.monthlyGrant)}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {fmt(u.topupBalance)}
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => openManage(u)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#94A3B8]">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>
            {fmt(data.total)} user{data.total === 1 ? "" : "s"} · page {page} of{" "}
            {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ManageUserDialog user={selected} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}

/* ---------------------------------- Revenue ---------------------------------- */

function RevenueTab() {
  const { data, isLoading } = useGetAdminRevenue({
    query: { queryKey: getGetAdminRevenueQueryKey(), staleTime: 30_000 },
  });

  if (isLoading || !data) return <LoadingGrid />;

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 text-sm text-amber-800">
          Stripe checkout is live and plan tiers reflect <strong>real paying
          members</strong>. Founding Member figures are <strong>real one-time
          purchases</strong> counted from Stripe. Projected MRR, however, is an{" "}
          <strong>estimate</strong> (paid plans × list price) — not
          Stripe&apos;s actual collected subscription revenue, so it excludes
          proration, discounts, tax, and refunds.
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Projected MRR" value={fmtUsd(data.projectedMrr)} />
        <StatCard
          icon={UsersIcon}
          label="Paid Users"
          value={fmt(data.paidUsers)}
          sub={`${fmt(data.freeUsers)} free`}
        />
        <StatCard
          icon={TrendingUp}
          label="Conversion"
          value={`${(data.conversionRate * 100).toFixed(1)}%`}
        />
        <StatCard
          icon={CreditCard}
          label="Credit Value (mo)"
          value={fmtUsd(data.creditValueUsd)}
          sub={`${fmt(data.creditsConsumedThisMonth)} credits used`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue by Plan" description="Projected monthly revenue per tier">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.planRevenue.map((p) => ({
                name: PLAN_LABELS[p.plan] ?? p.plan,
                revenue: p.monthlyRevenue,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} />
              <RTooltip formatter={(v: number) => fmtUsd(v)} />
              <Bar dataKey="revenue" fill="#16A34A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Breakdown</CardTitle>
            <CardDescription>Users and revenue by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">MRR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.planRevenue.map((p) => (
                  <TableRow key={p.plan}>
                    <TableCell className="capitalize">{PLAN_LABELS[p.plan] ?? p.plan}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmt(p.count)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtUsd(p.unitPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {fmtUsd(p.monthlyRevenue)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-semibold">Founding Members</TableCell>
                  <TableCell colSpan={3} className="text-right tabular-nums">
                    {fmt(data.foundingMembers)} members · {fmtUsd(data.foundingRevenue)} lifetime
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Outstanding top-ups</TableCell>
                  <TableCell colSpan={3} className="text-right tabular-nums">
                    {fmt(data.outstandingTopupCredits)} credits
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ----------------------------------- Usage ----------------------------------- */

function UsageTab() {
  const { data, isLoading } = useGetAdminUsage({
    query: { queryKey: getGetAdminUsageQueryKey(), staleTime: 30_000 },
  });

  if (isLoading || !data) return <LoadingGrid />;

  const splitData = data.copilotUsersDaily.map((d, i) => ({
    date: d.date,
    Users: d.value,
    Guests: data.copilotGuestsDaily[i]?.value ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Activity}
          label="Credits Used (mo)"
          value={fmt(data.creditsConsumedThisMonth)}
        />
        <StatCard
          icon={Server}
          label="Live Avatar Sessions"
          value={fmt(data.liveAvatarSessions)}
          sub="In-memory, current process"
        />
        <StatCard
          icon={TrendingUp}
          label="Copilot (30d)"
          value={fmt(data.copilotDaily.reduce((s, d) => s + d.value, 0))}
        />
      </div>

      <ChartCard title="Copilot: Users vs Guests" description="Daily requests, last 30 days">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={splitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              interval={4}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <RTooltip labelFormatter={shortDay} />
            <Area
              type="monotone"
              dataKey="Users"
              stackId="1"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="Guests"
              stackId="1"
              stroke="#7C3AED"
              fill="#7C3AED"
              fillOpacity={0.4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Copilot by Month" description="Total requests per month">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.copilotMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDay}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <RTooltip labelFormatter={shortDay} />
            <Bar dataKey="value" fill="#16A34A" name="Requests" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ---------------------------------- Content ---------------------------------- */

function ContentTab() {
  const { data, isLoading } = useGetAdminContent({
    query: { queryKey: getGetAdminContentQueryKey(), staleTime: 60_000 },
  });

  if (isLoading || !data) return <LoadingGrid />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Categories" value={fmt(data.categories)} />
        <StatCard icon={UsersIcon} label="Profiles" value={fmt(data.profilesTotal)} />
        <StatCard icon={Boxes} label="Partners" value={fmt(data.partners)} />
        <StatCard icon={Boxes} label="Interactive Labs" value={fmt(data.labs)} />
      </div>

      <ChartCard title="Featured Profiles by Group" description="Directory composition">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.profilesByGroup.map((g) => ({ name: g.group, count: g.count }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94A3B8" }} className="capitalize" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <RTooltip />
            <Bar dataKey="count" fill="#2563EB" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

/* ---------------------------------- System ----------------------------------- */

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function SystemTab() {
  const { data, isLoading } = useGetAdminSystem({
    query: { queryKey: getGetAdminSystemQueryKey(), staleTime: 30_000 },
  });

  if (isLoading || !data) return <LoadingGrid />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Server}
          label="API Status"
          value={data.apiHealthy ? "Healthy" : "Down"}
        />
        <StatCard
          icon={Activity}
          label="Uptime"
          value={formatUptime(data.uptimeSeconds)}
        />
        <StatCard
          icon={Server}
          label="Live Avatar Sessions"
          value={fmt(data.liveAvatarSessions)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features & Integrations</CardTitle>
          <CardDescription>
            Configuration status of each integration (secret values are never shown)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-[#E2E8F0]">
            {data.features.map((f) => (
              <div key={f.key} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-[#0F172A]">{f.label}</p>
                  {f.detail && <p className="text-xs text-[#94A3B8]">{f.detail}</p>}
                </div>
                {f.configured ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#94A3B8]">
                    <XCircle className="h-4 w-4" />
                    Not set
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------------------------------- Claims ---------------------------------- */

const CLAIM_FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "all", label: "All" },
] as const;

function ClaimStatusBadge({ status }: { status: AdminClaim["status"] }) {
  if (status === "approved")
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Approved
      </Badge>
    );
  if (status === "denied")
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Denied</Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
      Pending
    </Badge>
  );
}

function ClaimsTab() {
  const [filter, setFilter] =
    React.useState<(typeof CLAIM_FILTERS)[number]["value"]>("pending");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = filter === "all" ? {} : { status: filter };
  const { data, isLoading } = useListAdminClaims(params, {
    query: { queryKey: getListAdminClaimsQueryKey(params), staleTime: 15_000 },
  });

  const approve = useApproveClaim();
  const deny = useDenyClaim();

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["/api/admin/claims"] });
  };

  const onApprove = (claim: AdminClaim) => {
    approve.mutate(
      { id: claim.id },
      {
        onSuccess: () => {
          refetch();
          toast({
            title: "Claim approved",
            description: `${claim.profileName} is now owned by ${claim.claimantEmail}.`,
          });
        },
        onError: (err) =>
          toast({
            title: "Couldn't approve claim",
            description: (err as Error)?.message ?? "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const onDeny = (claim: AdminClaim) => {
    deny.mutate(
      { id: claim.id },
      {
        onSuccess: () => {
          refetch();
          toast({ title: "Claim denied" });
        },
        onError: (err) =>
          toast({
            title: "Couldn't deny claim",
            description: (err as Error)?.message ?? "Please try again.",
            variant: "destructive",
          }),
      },
    );
  };

  const claims = data?.claims ?? [];
  const pending = approve.isPending || deny.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {CLAIM_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "secondary" : "ghost"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Claimant</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-[#94A3B8]"
                  >
                    No claims to show.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <a
                        href={`/directory/${claim.profileSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#0F172A] hover:text-blue-700"
                      >
                        {claim.profileName}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#0F172A]">
                        {claim.claimantName ?? "—"}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {claim.claimantEmail}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <ClaimStatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {claim.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={pending}
                            onClick={() => onApprove(claim)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => onDeny(claim)}
                          >
                            <XCircle className="h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">
                          {claim.reviewedAt
                            ? `Reviewed ${new Date(
                                claim.reviewedAt,
                              ).toLocaleDateString()}`
                            : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------- Outreach --------------------------------- */

const PROSPECT_TYPE_LABELS: Record<string, string> = {
  researcher: "Researcher",
  scientist: "Scientist",
  investor: "Investor",
  user: "User",
};

const PROSPECT_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-blue-50", text: "text-blue-700", label: "Pending" },
  contacted: { bg: "bg-amber-50", text: "text-amber-700", label: "Contacted" },
  replied: { bg: "bg-green-50", text: "text-green-700", label: "Replied" },
  unsubscribed: { bg: "bg-slate-100", text: "text-slate-500", label: "Unsub'd" },
};

const SEND_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "bg-blue-50", text: "text-blue-700", label: "Pending" },
  delivered: { bg: "bg-green-50", text: "text-green-700", label: "Delivered" },
  bounced: { bg: "bg-red-50", text: "text-red-700", label: "Bounced" },
  complained: { bg: "bg-orange-50", text: "text-orange-700", label: "Spam" },
};

const REVIEW_STATE_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  needs_review: { bg: "bg-amber-50", text: "text-amber-700", label: "Needs review" },
  approved: { bg: "bg-green-50", text: "text-green-700", label: "Approved" },
};

function ProspectTypeBadge({ type }: { type: string }) {
  return (
    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
      {PROSPECT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function StatusBadge({
  status,
  map,
}: {
  status: string;
  map: Record<string, { bg: string; text: string; label: string }>;
}) {
  const s = map[status] ?? { bg: "bg-slate-100", text: "text-slate-500", label: status };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

// ---------- Add/Edit Prospect Dialog ----------

function ProspectDialog({
  open,
  onOpenChange,
  editing,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: OutreachProspect | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const create = useCreateOutreachProspect();
  const update = useUpdateOutreachProspect();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [type, setType] = React.useState<string>("user");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setName(editing?.name ?? "");
      setEmail(editing?.email ?? "");
      setType(editing?.type ?? "user");
      setNotes(editing?.notes ?? "");
    }
  }, [open, editing]);

  const isPending = create.isPending || update.isPending;

  const save = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await update.mutateAsync({
          id: editing.id,
          data: { name: name.trim(), email: email.trim(), type: type as "researcher" | "scientist" | "investor" | "user", notes: notes.trim() },
        });
        toast({ title: "Prospect updated" });
      } else {
        await create.mutateAsync({
          data: { name: name.trim(), email: email.trim(), type: type as "researcher" | "scientist" | "investor" | "user", notes: notes.trim() },
        });
        toast({ title: "Prospect added" });
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast({
        title: editing ? "Couldn't update prospect" : "Couldn't add prospect",
        description: (err as Error)?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Prospect" : "Add Prospect"}</DialogTitle>
          <DialogDescription>
            {editing ? "Update this prospect's details." : "Add a new prospect to the outreach list."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="researcher">Researcher</SelectItem>
                <SelectItem value="scientist">Scientist</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="user">General User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes <span className="text-[#94A3B8]">(optional)</span></label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Context for personalisation…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : editing ? "Save changes" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Bulk Import Dialog ----------

function BulkImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const bulkImport = useBulkImportOutreachProspects();
  const [csv, setCsv] = React.useState("");
  const [result, setResult] = React.useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const handleImport = async () => {
    if (!csv.trim()) return;
    try {
      const r = await bulkImport.mutateAsync({ data: { csv } });
      setResult(r);
      toast({ title: `Imported ${r.imported} prospects`, description: r.skipped > 0 ? `${r.skipped} skipped` : undefined });
      onSuccess();
    } catch (err) {
      toast({ title: "Import failed", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setCsv(""); setResult(null); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import Prospects</DialogTitle>
          <DialogDescription>
            Paste CSV rows — one per line. Header row is optional.
            Format: <code className="text-xs bg-slate-100 px-1 rounded">name,email,type,notes</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <textarea
            className="h-40 w-full rounded-md border border-[#E2E8F0] bg-white p-3 text-sm font-mono text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder={`name,email,type,notes\nJane Smith,jane@example.com,researcher,Studies climate\nBob Jones,bob@lab.edu,scientist,`}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          {result && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              ✓ Imported {result.imported} · Skipped {result.skipped}
              {result.errors.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs text-red-600">
                  {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleImport} disabled={bulkImport.isPending || !csv.trim()}>
            <Upload className="h-4 w-4" />
            {bulkImport.isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Prospect Review Modal ----------

function ProspectReviewModal({
  prospectId,
  open,
  onOpenChange,
  onChanged,
  resendMissing,
}: {
  prospectId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
  resendMissing: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetOutreachProspect(prospectId ?? "", {
    query: {
      queryKey: getGetOutreachProspectQueryKey(prospectId ?? ""),
      enabled: open && !!prospectId,
      staleTime: 0,
    },
  });

  const update = useUpdateOutreachProspect();
  const approve = useApproveOutreachProspect();
  const send = useSendOutreachProspect();
  const preview = usePreviewOutreachProspectEmail();

  // Editable form state, hydrated from the fetched detail.
  const [sendEmail, setSendEmail] = React.useState("");
  const [type, setType] = React.useState<string>("user");
  const [status, setStatus] = React.useState<string>("pending");
  const [notes, setNotes] = React.useState("");
  const [ciEmail, setCiEmail] = React.useState("");
  const [ciWebsite, setCiWebsite] = React.useState("");
  const [ciContactPage, setCiContactPage] = React.useState("");
  const [ciSocials, setCiSocials] = React.useState("");
  const [ciNotes, setCiNotes] = React.useState("");
  // Editable final copy. When both are non-empty and saved, sends use this
  // draft verbatim instead of regenerating from the template.
  const [draftSubject, setDraftSubject] = React.useState("");
  const [draftBody, setDraftBody] = React.useState("");
  const [emailEditorOpen, setEmailEditorOpen] = React.useState(false);

  // Hydrate the form ONCE per prospect per dialog open — not on every `data`
  // change. The detail query has staleTime: 0, so invalidations/refetches (e.g.
  // after Save) swap in a fresh data object mid-edit; re-hydrating then would
  // silently wipe in-progress typing.
  const hydratedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      hydratedFor.current = null;
      return;
    }
    if (data && hydratedFor.current !== data.id) {
      hydratedFor.current = data.id;
      setSendEmail(data.email ?? "");
      setType(data.type);
      setStatus(data.status);
      setNotes(data.notes ?? "");
      setCiEmail(data.contactInfo.email ?? "");
      setCiWebsite(data.contactInfo.website ?? "");
      setCiContactPage(data.contactInfo.contactPage ?? "");
      setCiSocials((data.contactInfo.socials ?? []).join("\n"));
      setCiNotes(data.contactInfo.notes ?? "");
      setDraftSubject(data.draftSubject ?? "");
      setDraftBody(data.draftBody ?? "");
    }
  }, [open, data]);

  const buildContactInfo = () => ({
    email: ciEmail.trim() || null,
    website: ciWebsite.trim() || null,
    contactPage: ciContactPage.trim() || null,
    socials: ciSocials
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    notes: ciNotes.trim() || null,
  });

  const afterMutation = () => {
    onChanged();
    if (prospectId)
      void queryClient.invalidateQueries({
        queryKey: getGetOutreachProspectQueryKey(prospectId),
      });
  };

  const saveInfo = async () => {
    if (!prospectId) return;
    try {
      await update.mutateAsync({
        id: prospectId,
        data: {
          email: sendEmail.trim() || null,
          type: type as "researcher" | "scientist" | "investor" | "user",
          status: status as "pending" | "contacted" | "replied" | "unsubscribed",
          notes: notes.trim(),
          contactInfo: buildContactInfo(),
          draftSubject: draftSubject.trim() || null,
          draftBody: draftBody.trim() || null,
        },
      });
      toast({ title: "Saved" });
      afterMutation();
    } catch (err) {
      toast({ title: "Couldn't save", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  const approveAndQueue = async () => {
    if (!prospectId) return;
    const email = sendEmail.trim() || ciEmail.trim();
    if (!email) {
      toast({ title: "Add a contact email first", variant: "destructive" });
      return;
    }
    try {
      // Persist edits first so notes/contactInfo/type aren't lost on approve.
      await update.mutateAsync({
        id: prospectId,
        data: {
          type: type as "researcher" | "scientist" | "investor" | "user",
          notes: notes.trim(),
          contactInfo: buildContactInfo(),
          draftSubject: draftSubject.trim() || null,
          draftBody: draftBody.trim() || null,
        },
      });
      await approve.mutateAsync({ id: prospectId, data: { email } });
      toast({ title: "Approved & queued", description: email });
      afterMutation();
    } catch (err) {
      toast({ title: "Couldn't approve", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  const sendNow = async () => {
    if (!prospectId) return;
    try {
      await send.mutateAsync({ id: prospectId });
      toast({ title: "Email sent" });
      afterMutation();
      onOpenChange(false);
    } catch (err) {
      toast({ title: "Couldn't send", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  const runPreview = async () => {
    if (!prospectId) return;
    try {
      const r = await preview.mutateAsync({ id: prospectId });
      setDraftSubject(r.subject);
      setDraftBody(r.body);
    } catch (err) {
      toast({ title: "Couldn't render preview", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  // Persist just the email copy (used by the pop-out editor modal). Empty
  // fields clear the draft server-side, restoring auto-generation.
  const saveDraft = async () => {
    if (!prospectId) return;
    try {
      await update.mutateAsync({
        id: prospectId,
        data: {
          draftSubject: draftSubject.trim() || null,
          draftBody: draftBody.trim() || null,
        },
      });
      toast({ title: "Draft saved", description: "This exact copy will be sent." });
      afterMutation();
      setEmailEditorOpen(false);
    } catch (err) {
      toast({ title: "Couldn't save draft", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  const profile = data?.profile ?? null;
  const isApproved = data?.reviewState === "approved";
  const busy = update.isPending || approve.isPending || send.isPending;

  return (
    <>
    <Dialog
      open={open}
      onOpenChange={(v) => {
        // Closing the parent also closes the email editor so it can't linger
        // as a stale floating modal over the prospect list.
        if (!v) setEmailEditorOpen(false);
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {data?.name ?? "Prospect"}
            {data && <StatusBadge status={data.reviewState} map={REVIEW_STATE_COLORS} />}
          </DialogTitle>
          <DialogDescription>
            {data?.source === "directory"
              ? "Directory figure queued for outreach. Review the researched contact details, then approve to queue for sending."
              : "Review and edit this prospect's outreach details."}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="flex items-center justify-center py-12 text-sm text-[#94A3B8]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-[200px_1fr]">
            {/* Profile column */}
            <div className="space-y-3">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={data.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#CBD5E1]">
                    <UsersIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              {profile?.field && (
                <div className="text-sm">
                  <div className="font-medium text-[#0F172A]">{profile.field}</div>
                  {profile.era && <div className="text-xs text-[#94A3B8]">{profile.era}</div>}
                </div>
              )}
              {data.profileSlug && (
                <a
                  href={`/directory/${data.profileSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                >
                  View directory profile <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {profile?.summary && (
                <p className="text-xs leading-relaxed text-[#64748B]">{profile.summary}</p>
              )}
            </div>

            {/* Editable column */}
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Send-to email</label>
                  <Input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    placeholder="confirmed@email.com"
                  />
                  <p className="text-[11px] text-[#94A3B8]">The address the scheduler will use.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="researcher">Researcher</SelectItem>
                      <SelectItem value="scientist">Scientist</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="user">General User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border border-[#E2E8F0] bg-slate-50/60 p-3 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Researched contact info
                  {data.researchedAt && (
                    <span className="ml-auto font-normal normal-case text-[#94A3B8]">
                      {new Date(data.researchedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#64748B]">Public email</label>
                    <Input value={ciEmail} onChange={(e) => setCiEmail(e.target.value)} placeholder="—" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#64748B]">Website</label>
                    <Input value={ciWebsite} onChange={(e) => setCiWebsite(e.target.value)} placeholder="—" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#64748B]">Contact page</label>
                  <Input value={ciContactPage} onChange={(e) => setCiContactPage(e.target.value)} placeholder="—" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#64748B]">Socials (one per line)</label>
                  <textarea
                    className="h-16 w-full rounded-md border border-[#E2E8F0] bg-white p-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    value={ciSocials}
                    onChange={(e) => setCiSocials(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#64748B]">Research notes</label>
                  <Input value={ciNotes} onChange={(e) => setCiNotes(e.target.value)} placeholder="—" />
                </div>
                {ciEmail.trim() && !sendEmail.trim() && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSendEmail(ciEmail.trim())}
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Use as send-to email
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Personalisation notes</label>
                <textarea
                  className="h-16 w-full rounded-md border border-[#E2E8F0] bg-white p-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Context the AI uses to personalise the email…"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3">
                <div>
                  <div className="text-sm font-medium text-[#0F172A]">Email copy</div>
                  <div className="text-xs text-[#64748B]">
                    {data?.draftSubject && data?.draftBody
                      ? "Saved draft — will be sent exactly as written"
                      : "Auto-generated at send time"}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setEmailEditorOpen(true)}
                  disabled={!data}
                >
                  <Eye className="h-4 w-4" />
                  Preview & edit
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-wrap gap-2 sm:justify-end">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={saveInfo} disabled={busy}>
              Save
            </Button>
            <Button onClick={approveAndQueue} disabled={busy}>
              <CheckCircle2 className="h-4 w-4" />
              {isApproved ? "Update & re-queue" : "Approve & queue"}
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={sendNow}
              disabled={busy || !isApproved || !data?.email || resendMissing}
              title={
                resendMissing
                  ? "RESEND_API_KEY not configured"
                  : !isApproved
                    ? "Approve the prospect first"
                    : !data?.email
                      ? "No confirmed email"
                      : undefined
              }
            >
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send now
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Pop-out email editor: the exact copy that will be sent. Centered,
        focused modal so reviewing/editing isn't cramped inside the detail
        dialog. */}
    <Dialog open={emailEditorOpen} onOpenChange={setEmailEditorOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email to {data?.name ?? "prospect"}</DialogTitle>
          <DialogDescription>
            This is the exact copy that lands in their inbox. Generate a draft
            with AI, edit it freely, then save.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-xs text-[#64748B]">
            To: {sendEmail.trim() || data?.email || data?.contactInfo.email || "—"}
          </div>
          <input
            className="h-9 w-full rounded-md border border-[#E2E8F0] bg-white px-2 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={draftSubject}
            onChange={(e) => setDraftSubject(e.target.value)}
            placeholder="Subject line"
          />
          <textarea
            className="h-72 w-full rounded-md border border-[#E2E8F0] bg-white p-3 text-sm leading-relaxed text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder="Email body — plain text, blank lines separate paragraphs"
          />
          <p className="text-xs text-[#64748B]">
            Saved drafts are sent verbatim. Clear both fields and save to go
            back to auto-generation.
          </p>
        </div>
        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={runPreview}
            disabled={!data || preview.isPending}
          >
            {preview.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {draftSubject || draftBody ? "Regenerate with AI" : "Generate with AI"}
          </Button>
          <Button onClick={saveDraft} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

// ---------- Prospects sub-tab ----------

function ProspectsPanel({ resendMissing }: { resendMissing: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<OutreachProspect | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [reviewId, setReviewId] = React.useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = React.useState(false);

  const deleteProspect = useDeleteOutreachProspect();
  const queueDirectory = useQueueDirectoryProspects();
  const researchContacts = useResearchProspectContacts();

  const params: ListOutreachProspectsParams = {
    search: search || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    pageSize,
  };

  const { data, isLoading } = useListOutreachProspects(params, {
    query: { queryKey: getListOutreachProspectsQueryKey(params), staleTime: 10_000 },
  });

  const refetch = () => void queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/prospects"] });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const onDelete = async (p: OutreachProspect) => {
    if (!confirm(`Delete ${p.email ?? p.name}?`)) return;
    try {
      await deleteProspect.mutateAsync({ id: p.id });
      toast({ title: "Prospect deleted" });
      refetch();
    } catch {
      toast({ title: "Couldn't delete prospect", variant: "destructive" });
    }
  };

  const openReview = (p: OutreachProspect) => {
    setReviewId(p.id);
    setReviewOpen(true);
  };

  const onQueueDirectory = async () => {
    try {
      const r = await queueDirectory.mutateAsync();
      toast({
        title: `Queued ${r.queued} living figure${r.queued === 1 ? "" : "s"}`,
        description: `${r.livingCount} living of ${r.totalProfiles} profiles · ${r.skipped} already queued`,
      });
      refetch();
    } catch (err) {
      toast({ title: "Couldn't queue directory", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  const onResearch = async () => {
    try {
      const r = await researchContacts.mutateAsync({ data: { limit: 5 } });
      toast({
        title: `Researched ${r.researched} · ${r.withEmail} with email`,
        description:
          r.remaining > 0
            ? `${r.remaining} still to research — run again to continue${r.failed ? ` · ${r.failed} failed` : ""}`
            : `All directory prospects researched${r.failed ? ` · ${r.failed} failed` : ""}`,
      });
      refetch();
    } catch (err) {
      toast({ title: "Couldn't research contacts", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {resendMissing && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>RESEND_API_KEY not configured.</strong> Emails won't send until you add it as a Replit secret.
            Set <code className="rounded bg-amber-100 px-1 text-xs">RESEND_API_KEY</code> in your Replit secrets panel.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(searchInput.trim()); }}
          className="flex gap-2 flex-1"
        >
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search name or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="researcher">Researcher</SelectItem>
            <SelectItem value="scientist">Scientist</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onQueueDirectory} disabled={queueDirectory.isPending}>
          {queueDirectory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListPlus className="h-4 w-4" />}
          Queue directory
        </Button>
        <Button variant="secondary" onClick={onResearch} disabled={researchContacts.isPending}>
          {researchContacts.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          Research contacts
        </Button>
        <Button variant="secondary" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
        <Button variant="secondary" onClick={() => setBulkOpen(true)}>
          <Upload className="h-4 w-4" />
          Import CSV
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last contacted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-[#94A3B8]">Loading…</TableCell>
                </TableRow>
              ) : !data?.prospects.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-[#94A3B8]">
                    No prospects yet. Queue the directory, add one, or import a CSV file.
                  </TableCell>
                </TableRow>
              ) : (
                data.prospects.map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => openReview(p)}
                  >
                    <TableCell>
                      <div className="font-medium text-[#0F172A]">{p.name}</div>
                      {p.email ? (
                        <div className="text-xs text-[#94A3B8]">{p.email}</div>
                      ) : p.contactInfo.email ? (
                        <div className="flex items-center gap-1 text-xs text-violet-600">
                          <Sparkles className="h-3 w-3 shrink-0" />
                          <span className="truncate">{p.contactInfo.email}</span>
                          <span className="text-[#94A3B8]">(suggested)</span>
                        </div>
                      ) : p.contactInfo.website || p.contactInfo.contactPage ? (
                        <div className="flex items-center gap-1 text-xs text-[#64748B]">
                          <Globe className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            {(() => {
                              try {
                                return new URL(
                                  (p.contactInfo.website ?? p.contactInfo.contactPage)!,
                                ).hostname.replace(/^www\./, "");
                              } catch {
                                return "website found";
                              }
                            })()}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs text-[#94A3B8]">
                          {p.researchedAt ? "no public email found" : "not researched yet"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell><ProspectTypeBadge type={p.type} /></TableCell>
                    <TableCell>
                      <span className="text-xs text-[#64748B]">
                        {p.source === "directory" ? "Directory" : "Manual"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.reviewState} map={REVIEW_STATE_COLORS} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} map={PROSPECT_STATUS_COLORS} />
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {p.lastContactedAt
                        ? new Date(p.lastContactedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openReview(p)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => onDelete(p)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>{fmt(data.total)} prospect{data.total === 1 ? "" : "s"} · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ProspectDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} onSuccess={refetch} />
      <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} onSuccess={refetch} />
      <ProspectReviewModal
        prospectId={reviewId}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onChanged={refetch}
        resendMissing={resendMissing}
      />
    </div>
  );
}

// ---------- Templates sub-tab ----------

function TemplatesPanel() {
  const { data, isLoading } = useListOutreachTemplates({ query: { queryKey: getListOutreachTemplatesQueryKey(), staleTime: 30_000 } });
  const updateTemplate = useUpdateOutreachTemplate();
  const { toast } = useToast();

  const [drafts, setDrafts] = React.useState<Record<string, { subject: string; body: string }>>({});
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data) {
      const init: Record<string, { subject: string; body: string }> = {};
      for (const t of data) {
        init[t.id] = { subject: t.subjectTemplate, body: t.bodyTemplate };
      }
      setDrafts(init);
    }
  }, [data]);

  const save = async (template: OutreachTemplate) => {
    const draft = drafts[template.id];
    if (!draft) return;
    setSaving(template.id);
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        data: { subjectTemplate: draft.subject, bodyTemplate: draft.body },
      });
      toast({ title: "Template saved" });
    } catch {
      toast({ title: "Couldn't save template", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) return <div className="py-8 text-center text-sm text-[#94A3B8]">Loading templates…</div>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#64748B]">
        One template per audience type. Variables:{" "}
        {["{{name}}", "{{opening}}"].map((v) => (
          <code key={v} className="mx-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-700">{v}</code>
        ))}{" "}
        — <code className="rounded bg-blue-50 px-1.5 py-0.5 text-xs font-mono text-blue-700">{"{{opening}}"}</code> is the AI-drafted personalised paragraph.
      </p>

      {(data ?? []).map((template) => {
        const draft = drafts[template.id];
        const changed =
          draft &&
          (draft.subject !== template.subjectTemplate || draft.body !== template.bodyTemplate);

        return (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ProspectTypeBadge type={template.type} />
                {PROSPECT_TYPE_LABELS[template.type] ?? template.type} template
              </CardTitle>
              <CardDescription>
                Last edited {new Date(template.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Subject template</label>
                <Input
                  value={draft?.subject ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [template.id]: { ...prev[template.id]!, subject: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Body template</label>
                <textarea
                  className="h-52 w-full rounded-md border border-[#E2E8F0] p-3 text-sm text-[#0F172A] font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={draft?.body ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [template.id]: { ...prev[template.id]!, body: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => save(template)}
                  disabled={!changed || saving === template.id}
                >
                  {saving === template.id ? "Saving…" : "Save template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ---------- Settings sub-tab ----------

function SettingsPanel() {
  const { data, isLoading } = useGetOutreachSettings({ query: { queryKey: getGetOutreachSettingsQueryKey(), staleTime: 30_000 } });
  const updateSettings = useUpdateOutreachSettings();
  const { toast } = useToast();

  const [sendHour, setSendHour] = React.useState<string>("9");
  const [batchSize, setBatchSize] = React.useState<string>("20");
  const [fromEmail, setFromEmail] = React.useState("");
  const [fromName, setFromName] = React.useState("");

  React.useEffect(() => {
    if (data) {
      setSendHour(String(data.sendHour));
      setBatchSize(String(data.batchSize));
      setFromEmail(data.fromEmail);
      setFromName(data.fromName);
    }
  }, [data]);

  const save = async () => {
    const hour = parseInt(sendHour, 10);
    const batch = parseInt(batchSize, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      toast({ title: "Send hour must be 0–23", variant: "destructive" });
      return;
    }
    if (isNaN(batch) || batch < 1 || batch > 500) {
      toast({ title: "Batch size must be 1–500", variant: "destructive" });
      return;
    }
    try {
      await updateSettings.mutateAsync({
        data: { sendHour: hour, batchSize: batch, fromEmail: fromEmail.trim(), fromName: fromName.trim() },
      });
      toast({ title: "Settings saved" });
    } catch {
      toast({ title: "Couldn't save settings", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="py-8 text-center text-sm text-[#94A3B8]">Loading settings…</div>;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Scheduler settings</CardTitle>
        <CardDescription>
          Configure the daily send schedule and sender identity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Send hour (UTC, 0–23)</label>
            <Input
              type="number"
              min={0}
              max={23}
              value={sendHour}
              onChange={(e) => setSendHour(e.target.value)}
            />
            <p className="text-xs text-[#94A3B8]">Hour at which the daily batch fires</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Batch size</label>
            <Input
              type="number"
              min={1}
              max={500}
              value={batchSize}
              onChange={(e) => setBatchSize(e.target.value)}
            />
            <p className="text-xs text-[#94A3B8]">Prospects contacted per daily run</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">From name</label>
          <Input value={fromName} onChange={(e) => setFromName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">From email</label>
          <Input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
          <p className="text-xs text-[#94A3B8]">Must be a verified sender address in your Resend account</p>
        </div>

        <div className="flex justify-end">
          <Button onClick={save} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- History sub-tab ----------

function HistoryPanel({ resendMissing }: { resendMissing: boolean }) {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const pageSize = 25;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const triggerBatch = useTriggerOutreachBatch();

  const params: ListOutreachSendsParams = {
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    pageSize,
  };

  const { data, isLoading } = useListOutreachSends(params, {
    query: { queryKey: getListOutreachSendsQueryKey(params), staleTime: 15_000 },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  const onSendNow = async () => {
    try {
      const result = await triggerBatch.mutateAsync(undefined as void);
      toast({ title: `Batch sent`, description: `${result.sent} sent, ${result.errors} errors` });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/sends"] });
      void queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/prospects"] });
    } catch (err) {
      toast({ title: "Send failed", description: (err as Error)?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {resendMissing && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>RESEND_API_KEY not configured.</strong> Add it as a Replit secret to enable sending.
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
            <SelectItem value="complained">Complained</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex gap-2">
          <Button
            variant="secondary"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["/api/admin/outreach/sends"] })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={onSendNow}
            disabled={resendMissing || triggerBatch.isPending}
          >
            <Send className="h-4 w-4" />
            {triggerBatch.isPending ? "Sending…" : "Send next batch"}
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-[#94A3B8]">Loading…</TableCell>
                </TableRow>
              ) : !data?.sends.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-[#94A3B8]">
                    No emails sent yet. Add prospects and click "Send next batch".
                  </TableCell>
                </TableRow>
              ) : (
                data.sends.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium text-[#0F172A]">{s.prospectName}</div>
                      <div className="text-xs text-[#94A3B8]">{s.prospectEmail}</div>
                    </TableCell>
                    <TableCell><ProspectTypeBadge type={s.prospectType} /></TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{s.subject}</TableCell>
                    <TableCell>
                      <StatusBadge status={s.status} map={SEND_STATUS_COLORS} />
                    </TableCell>
                    <TableCell className="text-sm text-[#64748B]">
                      {new Date(s.sentAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {data && data.total > 0 && (
        <div className="flex items-center justify-between text-sm text-[#64748B]">
          <span>{fmt(data.total)} send{data.total === 1 ? "" : "s"} · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Outreach Tab ----------

const OUTREACH_SUBTABS = [
  { value: "prospects", label: "Prospects" },
  { value: "templates", label: "Templates" },
  { value: "settings", label: "Settings" },
  { value: "history", label: "History" },
] as const;

function OutreachTab() {
  const { data: systemData } = useGetAdminSystem({
    query: { queryKey: getGetAdminSystemQueryKey(), staleTime: 60_000 },
  });
  const [subTab, setSubTab] =
    React.useState<(typeof OUTREACH_SUBTABS)[number]["value"]>("prospects");

  const resendMissing =
    systemData !== undefined &&
    !systemData.features.some((f) => f.key === "resend" && f.configured);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 text-white">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-[#0F172A]">Outreach Campaigns</h2>
          <p className="text-xs text-[#64748B]">AI-personalised email outreach via Resend</p>
        </div>
      </div>

      <div className="flex gap-1 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1">
        {OUTREACH_SUBTABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setSubTab(t.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              subTab === t.value
                ? "bg-white shadow-sm text-[#0F172A]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "prospects" && <ProspectsPanel resendMissing={resendMissing} />}
      {subTab === "templates" && <TemplatesPanel />}
      {subTab === "settings" && <SettingsPanel />}
      {subTab === "history" && <HistoryPanel resendMissing={resendMissing} />}
    </div>
  );
}

/* ----------------------------------- Page ------------------------------------ */

const TABS = [
  { value: "overview", label: "Overview", icon: Shield },
  { value: "users", label: "Users", icon: UsersIcon },
  { value: "claims", label: "Claims", icon: BadgeCheck },
  { value: "revenue", label: "Revenue", icon: DollarSign },
  { value: "usage", label: "Usage", icon: Activity },
  { value: "content", label: "Content", icon: Boxes },
  { value: "system", label: "System", icon: Server },
  { value: "outreach", label: "Outreach", icon: Mail },
];

export function Admin() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Admin Portal</h1>
          <p className="text-sm text-[#64748B]">
            Platform operations, users, revenue & system health
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="gap-1.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>
        <TabsContent value="claims">
          <ClaimsTab />
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>
        <TabsContent value="usage">
          <UsageTab />
        </TabsContent>
        <TabsContent value="content">
          <ContentTab />
        </TabsContent>
        <TabsContent value="system">
          <SystemTab />
        </TabsContent>
        <TabsContent value="outreach">
          <OutreachTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
