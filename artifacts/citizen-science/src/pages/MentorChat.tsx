import { useEffect, useRef, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Lock,
  GraduationCap,
  Users,
  Info,
} from "lucide-react";
import {
  useGetLegendWaitlist,
  getGetLegendWaitlistQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { CreditMeter, useCreditBalance } from "@/components/CreditMeter";
import { LIVING_MIND_STORIES } from "@/lib/livingMinds";
import {
  MessageContent,
  SourceList,
  VideoCard,
  streamChatRequest,
  type ChatMessage,
} from "@/components/chat";

function storageKey(slug: string) {
  return `cs.mentorConversation.${slug}`;
}

function newId() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadConversation(slug: string): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    );
  } catch {
    return [];
  }
}

function saveConversation(slug: string, messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

export function MentorChat() {
  const { slug = "" } = useParams();
  const figure = LIVING_MIND_STORIES[slug];
  const [, navigate] = useLocation();

  if (!figure) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="mb-2 text-xl font-semibold text-[#0F172A]">Mentor not found</h1>
        <p className="mb-6 max-w-md text-sm text-[#64748B]">
          We couldn't find a living legend at this address. Browse the mentor program to
          find a guide.
        </p>
        <Button variant="ink" onClick={() => navigate("/mentors")}>
          <GraduationCap className="h-4 w-4" />
          Explore mentors
        </Button>
      </div>
    );
  }

  return <MentorChatInner key={slug} slug={slug} figure={figure} />;
}

function MentorChatInner({
  slug,
  figure,
}: {
  slug: string;
  figure: (typeof LIVING_MIND_STORIES)[string];
}) {
  const accent = figure.theme.accent;

  const [messages, setMessages] = useState<ChatMessage[]>(() => loadConversation(slug));
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<{ message: string; href: string } | null>(null);
  const { refetch: refetchCredits } = useCreditBalance();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { data: waitlist } = useGetLegendWaitlist(slug, {
    query: { queryKey: getGetLegendWaitlistQueryKey(slug), staleTime: 30_000 },
  });

  const suggestions = [
    `What questions drove ${figure.name}'s biggest breakthrough?`,
    `How did ${figure.name} approach failure and setbacks?`,
    `What habits or methods made ${figure.name} effective?`,
    `How can I apply ${figure.name}'s thinking to my own project?`,
  ];

  useEffect(() => {
    saveConversation(slug, messages);
  }, [slug, messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function sendUserMessage(text: string, history: ChatMessage[]) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setLimitInfo(null);
    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const assistantMsg: ChatMessage = { id: newId(), role: "assistant", content: "" };
    setMessages([...history, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const outcome = await streamChatRequest(
        `/api/mentorship/legends/${slug}/chat`,
        {
          messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })),
          // Fallback persona descriptor — the server prefers a DB row by slug and
          // only uses these when the living legend isn't seeded in the DB yet.
          figureName: figure.name,
          field: figure.field,
          era: figure.era,
          bio: figure.tagline,
        },
        controller.signal,
        {
          onContent: accumulated =>
            setMessages(prev =>
              prev.map(m => (m.id === assistantMsg.id ? { ...m, content: accumulated } : m)),
            ),
          onSources: sources =>
            setMessages(prev =>
              prev.map(m => (m.id === assistantMsg.id ? { ...m, sources } : m)),
            ),
          onVideo: video =>
            setMessages(prev =>
              prev.map(m => (m.id === assistantMsg.id ? { ...m, video } : m)),
            ),
        },
      );

      switch (outcome.kind) {
        case "limit":
          setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
          setLimitInfo({ message: outcome.message, href: outcome.href });
          break;
        case "rate":
          setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
          setError(outcome.message);
          break;
        case "stream-error":
          setError(outcome.message);
          if (!outcome.accumulated) {
            setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
          }
          break;
        case "empty":
          setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
          setError("The digital mentor didn't return a reply. Please try again.");
          break;
        case "network-error":
          setMessages(prev =>
            prev.filter(m => !(m.id === assistantMsg.id && m.content.length === 0)),
          );
          setError("Couldn't reach the digital mentor. Check your connection and try again.");
          break;
        case "aborted":
        case "ok":
          break;
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
      void refetchCredits();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    void sendUserMessage(input, messages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setInput("");
    try {
      window.localStorage.removeItem(storageKey(slug));
    } catch {
      /* ignore */
    }
    inputRef.current?.focus();
  }

  function handleSuggestion(s: string) {
    setInput(s);
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;
  const waitlistCount = waitlist?.count ?? 0;

  return (
    <div className="flex h-[calc(100dvh-65px)] flex-col bg-[#F8FAFC]">
      {/* Themed figure header */}
      <header
        className="relative overflow-hidden border-b border-[#E2E8F0]"
        style={{
          background: `linear-gradient(135deg, ${figure.theme.accentDeep} 0%, #0F172A 100%)`,
        }}
      >
        <div
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30 blur-3xl"
          style={{ background: accent }}
        />
        <div className="relative flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <img
              src={figure.imageUrl}
              alt={figure.name}
              className="h-14 w-14 flex-shrink-0 rounded-2xl border-2 object-cover"
              style={{ borderColor: `${accent}88` }}
            />
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
                  style={{ background: `${accent}33`, border: `1px solid ${accent}66` }}
                >
                  <GraduationCap className="h-3 w-3" />
                  Digital mentor
                </span>
                {waitlistCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/90">
                    <Users className="h-3 w-3" />
                    {waitlistCount} aspiring mentee{waitlistCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <h1 className="truncate font-serif text-xl tracking-tight text-white">
                Learning from {figure.name}
              </h1>
              <p className="truncate text-xs text-white/70">
                {figure.field} · {figure.era}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <CreditMeter variant="compact" className="hidden sm:inline-flex" />
            <Link
              href={`/directory/${slug}`}
              className="hidden items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/10 sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Full profile
            </Link>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-1.5 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New chat
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Third-person disclaimer */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] bg-white px-6 py-2 lg:px-10">
        <Info className="h-3.5 w-3.5 flex-shrink-0 text-[#94A3B8]" />
        <p className="text-xs text-[#64748B]">
          This is an AI guide that helps you learn from {figure.name}'s work and methods —
          it speaks <span className="font-medium text-[#475569]">about</span> {figure.name},
          not as them.
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 py-8 lg:px-8">
          {isEmpty && !isStreaming && (
            <div className="py-10 text-center">
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border"
                style={{ background: `${accent}14`, borderColor: `${accent}33` }}
              >
                <Sparkles className="h-5 w-5" style={{ color: accent }} />
              </div>
              <h2 className="mb-2 font-serif text-2xl tracking-tight text-[#0F172A]">
                What would you like to learn from {figure.name}?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-sm text-[#64748B]">
                Ask about their methods, mindset, breakthroughs, or how to apply their
                approach to your own work.
              </p>
              <div className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-left text-sm text-[#334155] transition-colors hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {messages.map(m =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#0F172A] px-4 py-2.5 text-white shadow-sm">
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border"
                    style={{ borderColor: `${accent}44` }}
                  >
                    <img src={figure.imageUrl} alt={figure.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    {m.content.length === 0 && isStreaming ? (
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#94A3B8]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#94A3B8] [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#94A3B8] [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <>
                        <MessageContent content={m.content} />
                        <VideoCard video={m.video} label={`${figure.name} · interview clip`} />
                        <SourceList sources={m.sources} />
                      </>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {limitInfo && (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-violet-50/90 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#0F172A]">Out of credits</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#475569]">{limitInfo.message}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={limitInfo.href}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E293B]"
                    >
                      {limitInfo.href === "/login" ? "Create a free account" : "See plans & upgrade"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-white px-4 py-4 lg:px-8">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/60">
            <Sparkles className="mb-2.5 h-4 w-4 flex-shrink-0" style={{ color: accent }} />
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isEmpty
                  ? `Ask anything about ${figure.name}'s work…`
                  : "Continue the conversation…"
              }
              rows={1}
              disabled={isStreaming}
              className="max-h-40 flex-1 resize-none bg-transparent py-2 text-[15px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] disabled:opacity-60"
              style={{ height: "auto" }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
              }}
            />
            <Button
              type="submit"
              size="sm"
              variant="ink"
              disabled={!input.trim() || isStreaming}
              className="mb-0.5 h-9 flex-shrink-0 px-3.5"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center font-mono text-[11px] text-[#94A3B8]">
            ↵ enter to send · ⇧↵ for newline · a guide to {figure.name}'s thinking
          </p>
        </form>
      </div>
    </div>
  );
}
