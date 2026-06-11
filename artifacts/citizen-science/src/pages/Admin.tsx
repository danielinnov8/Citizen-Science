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
  type AdminUser,
  type AdminClaim,
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
          Revenue is <strong>projected</strong> from plan tiers — there is no live
          payment processor connected yet, so these are modeled figures, not
          collected revenue. Founding Member sales are not tracked in the database.
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

/* ----------------------------------- Page ------------------------------------ */

const TABS = [
  { value: "overview", label: "Overview", icon: Shield },
  { value: "users", label: "Users", icon: UsersIcon },
  { value: "claims", label: "Claims", icon: BadgeCheck },
  { value: "revenue", label: "Revenue", icon: DollarSign },
  { value: "usage", label: "Usage", icon: Activity },
  { value: "content", label: "Content", icon: Boxes },
  { value: "system", label: "System", icon: Server },
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
      </Tabs>
    </div>
  );
}
