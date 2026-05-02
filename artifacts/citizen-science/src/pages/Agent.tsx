import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Wand2, RotateCcw, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "cs.agentConversation";
const MODULE_TOKEN = /\[\[module:([a-z0-9-]+)\]\]/g;

const SUGGESTIONS = [
  "Help me design a sourdough fermentation tracker",
  "I want to test how light affects plant growth",
  "What can I learn about my reaction time?",
  "How do I measure water quality at home?",
];

function newId() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadConversation(): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

function saveConversation(messages: ChatMessage[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* ignore */
  }
}

function ModuleCard({ slug }: { slug: string }) {
  const category = CATEGORIES.find(c => c.slug === slug);
  if (!category) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded-md bg-slate-100 text-slate-700 text-sm">
        {slug}
      </span>
    );
  }

  return (
    <Link
      href={`/category/${category.slug}`}
      className="not-prose inline-flex items-stretch my-1.5 mr-1.5 group rounded-xl border border-[#E2E8F0] bg-white hover:border-blue-300 hover:shadow-md transition-all overflow-hidden align-middle"
    >
      <span className="flex items-center justify-center w-1.5 bg-gradient-to-b from-blue-500 to-violet-500" />
      <span className="flex items-center gap-2 px-3 py-2">
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">Module</span>
          <span className="text-sm font-semibold text-[#0F172A]">{category.name}</span>
        </span>
        <ChevronRight className="h-4 w-4 text-[#94A3B8] group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
      </span>
    </Link>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = useMemo(() => {
    const out: Array<{ type: "text"; value: string } | { type: "module"; slug: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(MODULE_TOKEN.source, "g");
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        out.push({ type: "text", value: content.slice(lastIndex, match.index) });
      }
      out.push({ type: "module", slug: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      out.push({ type: "text", value: content.slice(lastIndex) });
    }
    return out;
  }, [content]);

  return (
    <div className="text-[15px] leading-relaxed text-[#0F172A] whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (part.type === "module") {
          return <ModuleCard key={i} slug={part.slug} />;
        }
        return <span key={i}>{part.value}</span>;
      })}
    </div>
  );
}

export function Agent() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadConversation());
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bootstrappedRef = useRef(false);

  // Persist conversation
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  // Bootstrap from pending prompt (only once)
  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    let pending: string | null = null;
    try {
      pending = window.localStorage.getItem("cs.pendingPrompt");
      if (pending) window.localStorage.removeItem("cs.pendingPrompt");
    } catch {
      /* ignore */
    }

    if (pending && pending.trim().length > 0) {
      void sendUserMessage(pending.trim(), messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function sendUserMessage(text: string, history: ChatMessage[]) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    const userMsg: ChatMessage = { id: newId(), role: "user", content: trimmed };
    const assistantMsg: ChatMessage = { id: newId(), role: "assistant", content: "" };
    const next = [...history, userMsg, assistantMsg];
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cs-auth": "1" },
        body: JSON.stringify({
          messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let streamError: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const dataLine = block.split("\n").find(l => l.startsWith("data:"));
          if (!dataLine) continue;
          try {
            const payload = JSON.parse(dataLine.slice(5).trim()) as {
              content?: string;
              done?: boolean;
              error?: string;
            };
            if (payload.error) {
              streamError = payload.error;
            }
            if (payload.content) {
              accumulated += payload.content;
              setMessages(prev =>
                prev.map(m => (m.id === assistantMsg.id ? { ...m, content: accumulated } : m)),
              );
            }
            if (payload.done) {
              break;
            }
          } catch {
            /* skip malformed */
          }
        }
      }

      if (streamError) {
        setError(streamError);
        if (!accumulated) {
          setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
        }
      } else if (!accumulated) {
        setMessages(prev => prev.filter(m => m.id !== assistantMsg.id));
        setError("The science copilot didn't return a reply. Please try again.");
      }
    } catch (err) {
      const aborted = (err as Error).name === "AbortError";
      if (!aborted) {
        setError("Couldn't reach the science copilot. Check your connection and try again.");
        setMessages(prev =>
          prev.filter(m => !(m.id === assistantMsg.id && m.content.length === 0)),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
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
      window.localStorage.removeItem(STORAGE_KEY);
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

  return (
    <div className="flex flex-col h-[calc(100dvh-65px)] bg-[#F8FAFC]">
      <header className="flex items-center justify-between px-6 lg:px-10 py-4 border-b border-[#E2E8F0] bg-white/70 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-sm">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-base font-semibold tracking-tight text-[#0F172A]">Science copilot</h1>
            <p className="text-xs text-[#64748B]">
              Plan an experiment, then we'll point you to the right module.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#E2E8F0] text-[#475569] gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New chat
          </Button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-3xl px-4 lg:px-8 py-8">
          {isEmpty && !isStreaming && (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-[#E2E8F0] mb-5">
                <Sparkles className="h-5 w-5 text-violet-600" />
              </div>
              <h2 className="text-2xl font-serif tracking-tight text-[#0F172A] mb-2">
                What's your hypothesis?
              </h2>
              <p className="text-sm text-[#64748B] max-w-md mx-auto mb-8">
                Describe a question, observation, or experiment you'd like to run. I'll help you scope it
                and pick the right module.
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-left text-sm rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 hover:border-blue-300 hover:bg-blue-50/40 transition-colors text-[#334155]"
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
                  <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-[#0F172A] text-white px-4 py-2.5 shadow-sm">
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 border border-[#E2E8F0] flex items-center justify-center mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {m.content.length === 0 && isStreaming ? (
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8] animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8] animate-pulse [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8] animate-pulse [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <MessageContent content={m.content} />
                    )}
                  </div>
                </div>
              ),
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#E2E8F0] bg-white px-4 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100/60 transition-all">
            <Sparkles className="h-4 w-4 text-violet-500 mb-2.5 flex-shrink-0" />
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isEmpty
                  ? "Tell me a question, hunch, or wild curiosity…"
                  : "Reply to the science copilot…"
              }
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent outline-none text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] py-2 max-h-40 disabled:opacity-60"
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
              disabled={!input.trim() || isStreaming}
              className="bg-[#0F172A] hover:bg-[#1E293B] text-white h-9 px-3.5 mb-0.5 flex-shrink-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-2 text-center font-mono">
            ↵ enter to send · ⇧↵ for newline · responses may include module recommendations
          </p>
        </form>
      </div>
    </div>
  );
}
