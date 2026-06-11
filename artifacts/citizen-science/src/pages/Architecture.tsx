import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  type Node,
  type Edge,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Users,
  MonitorSmartphone,
  Server,
  Database,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Bot,
  PlayCircle,
  Video,
  Film,
  Mic,
  CreditCard,
  RefreshCw,
  GitBranch,
  Boxes,
  Rocket,
  Code2,
  ArrowLeft,
  X,
  type LucideIcon,
} from "lucide-react";

type Accent = "blue" | "violet" | "green" | "amber" | "rose" | "slate";

const ACCENTS: Record<Accent, { c: string; soft: string }> = {
  blue: { c: "#2563EB", soft: "rgba(37,99,235,0.10)" },
  violet: { c: "#7C3AED", soft: "rgba(124,58,237,0.10)" },
  green: { c: "#16A34A", soft: "rgba(22,163,74,0.10)" },
  amber: { c: "#D97706", soft: "rgba(217,119,6,0.10)" },
  rose: { c: "#E11D48", soft: "rgba(225,29,72,0.10)" },
  slate: { c: "#475569", soft: "rgba(71,85,105,0.10)" },
};

const LEGEND: { accent: Accent; label: string }[] = [
  { accent: "blue", label: "Our app & API" },
  { accent: "violet", label: "AI services" },
  { accent: "amber", label: "Identity" },
  { accent: "green", label: "Data & deploy" },
  { accent: "rose", label: "Media" },
  { accent: "slate", label: "People & infra" },
];

type FlowData = {
  title: string;
  subtitle?: string;
  tag?: string;
  accent: Accent;
  icon: LucideIcon;
  details: string;
  dimmed?: boolean;
  selected?: boolean;
};

type AppNode = Node<FlowData, "flow">;

function FlowNode({ data }: NodeProps<AppNode>) {
  const a = ACCENTS[data.accent];
  const Icon = data.icon;
  const selected = data.selected;
  return (
    <div
      className="rounded-xl border bg-card transition-opacity"
      style={{
        width: 252,
        borderColor: selected ? a.c : undefined,
        boxShadow: selected
          ? `0 0 0 2px ${a.c}, 0 8px 24px -12px rgba(15,23,42,0.35)`
          : "0 1px 2px rgba(15,23,42,0.06), 0 8px 18px -14px rgba(15,23,42,0.25)",
        opacity: data.dimmed ? 0.25 : 1,
      }}
    >
      <Handle id="l" type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle id="t" type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle id="r" type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle id="b" type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <div className="flex items-start gap-3 p-3">
        <div
          className="flex shrink-0 items-center justify-center rounded-lg"
          style={{ width: 38, height: 38, background: a.soft, color: a.c }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{data.title}</div>
          {data.subtitle && (
            <div className="mt-0.5 text-xs leading-snug text-muted-foreground">{data.subtitle}</div>
          )}
        </div>
      </div>
      {data.tag && (
        <div className="px-3 pb-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: a.c }}
          >
            {data.tag}
          </span>
        </div>
      )}
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

function n(
  id: string,
  x: number,
  y: number,
  data: Omit<FlowData, "dimmed">,
): AppNode {
  return { id, type: "flow", position: { x, y }, data };
}

type EdgeDef = {
  id: string;
  source: string;
  sh: string;
  target: string;
  th: string;
  label?: string;
  primary?: boolean;
  dashed?: boolean;
};

function e(
  id: string,
  source: string,
  sh: string,
  target: string,
  th: string,
  label?: string,
  opts: { primary?: boolean; dashed?: boolean } = {},
): EdgeDef {
  return { id, source, sh, target, th, label, ...opts };
}

/* ---------------- Runtime scene ---------------- */

const RUNTIME_NODES: AppNode[] = [
  n("user", 20, 360, {
    title: "Citizen Scientist",
    subtitle: "Browser · guest or signed-in",
    tag: "People",
    accent: "slate",
    icon: Users,
    details:
      "Anyone on the web visits citizen-science.org. Most of the app is open to guests; signing in unlocks the notebook, progress and higher usage limits.",
  }),
  n("spa", 320, 340, {
    title: "Web App (SPA)",
    subtitle: "React · Vite · Tailwind v4 · wouter",
    tag: "Frontend",
    accent: "blue",
    icon: MonitorSmartphone,
    details:
      "The single-page app. It talks to the backend through auto-generated React Query hooks + Zod schemas (built from the OpenAPI spec), and sends the cs_session cookie same-origin on every request.",
  }),
  n("api", 640, 340, {
    title: "API Server",
    subtitle: "Express 5 · cookie sessions · requireAuth",
    tag: "Backend",
    accent: "blue",
    icon: Server,
    details:
      "Express 5 server running inside the Cloud Run container. It serves the SPA's static files AND every /api route from the same origin, so SameSite=Lax session cookies just work.",
  }),
  n("migrate", 640, 560, {
    title: "Migrate-on-boot",
    subtitle: "Drizzle migrations at startup",
    tag: "Schema",
    accent: "green",
    icon: RefreshCw,
    details:
      "When the server boots it applies versioned Drizzle migrations to the database before serving DB-backed routes — so each deploy auto-updates the schema. The advisory lock is best-effort so Neon's pooled endpoint can't block it.",
  }),
  n("r_auth", 950, 70, {
    title: "Auth & OAuth",
    subtitle: "/api/auth · register · login · Google",
    tag: "Route group",
    accent: "amber",
    icon: KeyRound,
    details:
      "Email+password (scrypt-hashed) and Google OAuth. The OAuth handshake (PKCE verifier + state) is stored server-side with a signed nonce cookie binding the callback for CSRF safety. It creates or links a user by email, then sets the cs_session cookie. requireAuth middleware gates the protected routes.",
  }),
  n("r_agent", 950, 270, {
    title: "Science Copilot",
    subtitle: "/api/agent/chat (SSE) · field notes",
    tag: "Route group",
    accent: "blue",
    icon: Sparkles,
    details:
      "Streams Gemini answers over Server-Sent Events with Google Search grounding (citations), an optional verified-video card, and a structured field-notes analyzer. Token usage is metered into credits.",
  }),
  n("r_avatar", 950, 470, {
    title: "Talking Avatar",
    subtitle: "/api/avatar/* · streaming WebRTC",
    tag: "Route group",
    accent: "violet",
    icon: Video,
    details:
      'The "Talk to {figure}" feature. Orchestrates a D-ID streaming avatar, a Gemini persona brain and an ElevenLabs voice over WebRTC. Open to guests, protected by an unguessable session id, rate-limited and duration-capped.',
  }),
  n("r_billing", 950, 670, {
    title: "Credits & Billing",
    subtitle: "/api/billing/credits · metering",
    tag: "Route group",
    accent: "blue",
    icon: CreditCard,
    details:
      "Credit-based metering for every AI feature. Resolves a user-or-guest subject, tracks a monthly grant + top-ups, and returns a 402 with an upgrade link when exhausted.",
  }),
  n("oauth", 1310, 40, {
    title: "Google OAuth",
    subtitle: "Sign in with Google",
    tag: "Identity",
    accent: "amber",
    icon: ShieldCheck,
    details:
      "Google's OAuth 2.0 endpoints. Uses the project's own GOOGLE_CLIENT_ID/SECRET; the redirect URI is derived from the live domain. Returns the user's verified email so we can create or link an account.",
  }),
  n("gemini", 1310, 190, {
    title: "Google Gemini",
    subtitle: "gemini-2.5-flash",
    tag: "AI",
    accent: "violet",
    icon: Bot,
    details:
      "The reasoning engine behind chat, field-notes analysis, web-search grounding, video relevance scoring and the avatar persona brain. Called with the project's own GEMINI_API_KEY (the Replit AI proxy isn't reachable from Cloud Run).",
  }),
  n("youtube", 1310, 330, {
    title: "YouTube Data API",
    subtitle: "Trusted-channel video search",
    tag: "Media",
    accent: "rose",
    icon: PlayCircle,
    details:
      "Searches a curated allow-list of trusted science channels (NASA, Veritasium, Kurzgesagt, MIT, TED-Ed…). Gemini then scores results and at most one high-confidence video is embedded in the reply.",
  }),
  n("did", 1310, 470, {
    title: "D-ID",
    subtitle: "Streaming talking-head avatar",
    tag: "Media",
    accent: "rose",
    icon: Film,
    details:
      "Renders the live talking-head video stream of a historical figure over WebRTC from a self-hosted portrait image.",
  }),
  n("eleven", 1310, 600, {
    title: "ElevenLabs",
    subtitle: "Realistic voice synthesis",
    tag: "Media",
    accent: "rose",
    icon: Mic,
    details:
      "Generates the avatar's spoken voice (e.g. a cloned 'albert' voice for Einstein) that D-ID lip-syncs to the video.",
  }),
  n("db", 1310, 740, {
    title: "PostgreSQL",
    subtitle: "Neon (prod) · Helium (dev) · Drizzle ORM",
    tag: "Data",
    accent: "green",
    icon: Database,
    details:
      "The system of record: users, sessions, oauth_states, credit_accounts, copilot_usage and featured_profiles. Production runs on Neon; development uses Replit's built-in Postgres. Accessed through Drizzle ORM.",
  }),
];

const RUNTIME_EDGES: EdgeDef[] = [
  e("u-spa", "user", "r", "spa", "l", "HTTPS", { primary: true }),
  e("spa-api", "spa", "r", "api", "l", "/api · cookie", { primary: true }),
  e("api-auth", "api", "r", "r_auth", "l"),
  e("api-agent", "api", "r", "r_agent", "l", undefined, { primary: true }),
  e("api-avatar", "api", "r", "r_avatar", "l"),
  e("api-billing", "api", "r", "r_billing", "l"),
  e("api-migrate", "api", "b", "migrate", "t", "on boot", { dashed: true }),
  e("auth-oauth", "r_auth", "r", "oauth", "l", "OAuth 2.0 + PKCE"),
  e("auth-db", "r_auth", "r", "db", "l", "users · sessions"),
  e("agent-gemini", "r_agent", "r", "gemini", "l", "generate · grounding", { primary: true }),
  e("agent-youtube", "r_agent", "r", "youtube", "l", "trusted videos"),
  e("agent-db", "r_agent", "r", "db", "l", "credits · usage"),
  e("avatar-did", "r_avatar", "r", "did", "l", "WebRTC"),
  e("avatar-eleven", "r_avatar", "r", "eleven", "l", "voice"),
  e("avatar-gemini", "r_avatar", "r", "gemini", "l", "persona"),
  e("avatar-db", "r_avatar", "r", "db", "l", "sessions"),
  e("billing-db", "r_billing", "r", "db", "l", "credit_accounts"),
  e("migrate-db", "migrate", "r", "db", "l", "migrations", { dashed: true }),
];

/* ---------------- Deployment scene ---------------- */

const DEPLOY_NODES: AppNode[] = [
  n("dev", 40, 240, {
    title: "Local / Replit Dev",
    subtitle: "Edit · preview · push",
    tag: "Develop",
    accent: "slate",
    icon: Code2,
    details:
      "Day-to-day development happens here against the dev database. When a change is ready, the code is committed and synced to GitHub.",
  }),
  n("github", 360, 240, {
    title: "GitHub Repository",
    subtitle: "Source of truth",
    tag: "Source",
    accent: "slate",
    icon: GitBranch,
    details:
      "The repo is connected to Google Cloud Run. A push / sync to the tracked branch is what kicks off a new production build — no manual deploy step.",
  }),
  n("build", 700, 240, {
    title: "Cloud Run Build",
    subtitle: "Dockerfile · pnpm deploy · esbuild",
    tag: "Build",
    accent: "blue",
    icon: Boxes,
    details:
      "The root Dockerfile builds a single container: it bundles the API with esbuild, builds the SPA, and uses pnpm deploy --prod to ship only what production needs. attached_assets must be copied in or @assets imports fail at build time.",
  }),
  n("live", 1040, 240, {
    title: "Live Revision",
    subtitle: "Cloud Run · citizen-science.org",
    tag: "Runtime",
    accent: "green",
    icon: Rocket,
    details:
      "Cloud Run rolls out the new container revision and shifts traffic to it. One origin serves both the SPA and /api, served over HTTPS on the custom domain.",
  }),
  n("env", 1040, 40, {
    title: "Runtime Config",
    subtitle: "Env vars & secrets",
    tag: "Config",
    accent: "amber",
    icon: KeyRound,
    details:
      "Injected by Cloud Run at runtime: DATABASE_URL (Neon), GEMINI_API_KEY, D_ID_API_KEY, SESSION_SECRET, Google OAuth credentials and more. This is the only place the production Neon URL lives.",
  }),
  n("dmigrate", 1040, 460, {
    title: "Migrate-on-boot",
    subtitle: "Runs on every fresh boot",
    tag: "Schema",
    accent: "green",
    icon: RefreshCw,
    details:
      "The new revision applies any pending Drizzle migrations to Neon before serving DB routes. This is why a deploy is needed to heal the schema — the environment can't write to the prod DB directly.",
  }),
  n("ddb", 1360, 460, {
    title: "Neon PostgreSQL",
    subtitle: "Production database",
    tag: "Data",
    accent: "green",
    icon: Database,
    details:
      "The production database, kept in sync automatically by the migrations that run on each boot of a new revision.",
  }),
];

const DEPLOY_EDGES: EdgeDef[] = [
  e("dev-gh", "dev", "r", "github", "l", "git push / sync", { primary: true }),
  e("gh-build", "github", "r", "build", "l", "triggers Cloud Run", { primary: true }),
  e("build-live", "build", "r", "live", "l", "deploy", { primary: true }),
  e("env-live", "env", "b", "live", "t", "env + secrets", { dashed: true }),
  e("live-migrate", "live", "b", "dmigrate", "t", "on boot", { dashed: true }),
  e("migrate-ddb", "dmigrate", "r", "ddb", "l", "migrations", { dashed: true }),
];

type SceneKey = "runtime" | "deploy";

const SCENES: Record<SceneKey, { nodes: AppNode[]; edges: EdgeDef[] }> = {
  runtime: { nodes: RUNTIME_NODES, edges: RUNTIME_EDGES },
  deploy: { nodes: DEPLOY_NODES, edges: DEPLOY_EDGES },
};

function buildEdges(defs: EdgeDef[], selected: string | null): Edge[] {
  return defs.map((ed) => {
    const connected = !!selected && (ed.source === selected || ed.target === selected);
    const dim = !!selected && !connected;
    const color = connected ? "#0F172A" : ed.primary ? "#2563EB" : "#94A3B8";
    return {
      id: ed.id,
      source: ed.source,
      sourceHandle: ed.sh,
      target: ed.target,
      targetHandle: ed.th,
      label: ed.label,
      type: "smoothstep",
      animated: connected || !!ed.primary,
      style: {
        stroke: color,
        strokeWidth: connected ? 2.5 : 1.5,
        opacity: dim ? 0.12 : 1,
        strokeDasharray: ed.dashed ? "6 5" : undefined,
      },
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color },
      labelStyle: { fill: "#475569", fontSize: 11, fontWeight: 600, opacity: dim ? 0.12 : 1 },
      labelBgStyle: { fill: "#ffffff", opacity: dim ? 0.12 : 0.96 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 6,
    };
  });
}

export function Architecture() {
  const [scene, setScene] = useState<SceneKey>("runtime");
  const [selected, setSelected] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(SCENES.runtime.nodes);
  const rfRef = useRef<ReactFlowInstance<AppNode, Edge> | null>(null);

  useEffect(() => {
    setNodes(SCENES[scene].nodes);
    setSelected(null);
    const id = requestAnimationFrame(() => {
      rfRef.current?.fitView({ padding: 0.18, duration: 400 });
    });
    return () => cancelAnimationFrame(id);
  }, [scene, setNodes]);

  const connectedIds = useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected]);
    for (const ed of SCENES[scene].edges) {
      if (ed.source === selected) set.add(ed.target);
      if (ed.target === selected) set.add(ed.source);
    }
    return set;
  }, [selected, scene]);

  const renderedNodes = useMemo<AppNode[]>(() => {
    if (!connectedIds || !selected) return nodes;
    return nodes.map((nd) => ({
      ...nd,
      data: { ...nd.data, dimmed: !connectedIds.has(nd.id), selected: nd.id === selected },
    }));
  }, [nodes, connectedIds, selected]);

  const edges = useMemo(() => buildEdges(SCENES[scene].edges, selected), [scene, selected]);

  const selectedNode = selected
    ? SCENES[scene].nodes.find((nd) => nd.id === selected) ?? null
    : null;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="z-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-b bg-card/80 px-4 py-3 backdrop-blur md:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
        <div className="hidden h-5 w-px bg-border sm:block" />
        <div className="mr-auto">
          <h1 className="text-base font-semibold leading-tight text-foreground md:text-lg">
            System Architecture
          </h1>
          <p className="text-xs text-muted-foreground">
            How Citizen Science fits together — drag, zoom, and click any node.
          </p>
        </div>
        <div className="flex rounded-lg border bg-background p-0.5">
          {(
            [
              { key: "runtime", label: "Runtime" },
              { key: "deploy", label: "Deployment" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setScene(opt.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                scene === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={renderedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          onInit={(inst) => {
            rfRef.current = inst;
          }}
          onNodeClick={(_, node) => setSelected(node.id)}
          onPaneClick={() => setSelected(null)}
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.25}
          maxZoom={1.75}
          proOptions={{ hideAttribution: true }}
          nodesConnectable={false}
          nodesDraggable
          elementsSelectable
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="#CBD5E1" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            nodeStrokeWidth={2}
            nodeColor={(nd) => ACCENTS[(nd.data as FlowData).accent].c}
            maskColor="rgba(15,23,42,0.06)"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border bg-card/90 px-3 py-2 shadow-sm backdrop-blur">
          {LEGEND.map((l) => (
            <div key={l.accent} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: ACCENTS[l.accent].c }}
              />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedNode ? (
          <div className="absolute right-4 top-4 w-[300px] max-w-[calc(100vw-2rem)] rounded-xl border bg-card p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div
                className="flex shrink-0 items-center justify-center rounded-lg"
                style={{
                  width: 40,
                  height: 40,
                  background: ACCENTS[selectedNode.data.accent].soft,
                  color: ACCENTS[selectedNode.data.accent].c,
                }}
              >
                <selectedNode.data.icon size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-foreground">{selectedNode.data.title}</h2>
                {selectedNode.data.subtitle && (
                  <p className="text-xs text-muted-foreground">{selectedNode.data.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {selectedNode.data.details}
            </p>
          </div>
        ) : (
          <div className="pointer-events-none absolute right-4 top-4 rounded-xl border bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            Click any node to see what it does.
          </div>
        )}
      </div>
    </div>
  );
}

export default Architecture;
