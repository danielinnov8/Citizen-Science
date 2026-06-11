import { useMemo, useState } from "react";
import { Inbox as InboxIcon, Mail, MailOpen, Loader2, Send } from "lucide-react";
import {
  useListMessages,
  useMarkMessageRead,
  useSendMessage,
  getListMessagesQueryKey,
  type Message,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function senderLabel(m: Message): string {
  return (m.senderName && m.senderName.trim()) || m.senderEmail;
}

function senderInitials(m: Message): string {
  const source = senderLabel(m);
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function timeAgo(iso: Date | string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Inbox() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const messagesQuery = useListMessages({
    query: { queryKey: getListMessagesQueryKey() },
  });
  const markReadMutation = useMarkMessageRead();
  const sendMessageMutation = useSendMessage();

  const [openId, setOpenId] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const messages = useMemo(
    () => messagesQuery.data?.messages ?? [],
    [messagesQuery.data],
  );
  const unreadCount = messagesQuery.data?.unreadCount ?? 0;
  const openMessage = messages.find((m) => m.id === openId) ?? null;

  const handleOpen = async (m: Message) => {
    setOpenId(m.id);
    if (!m.read) {
      try {
        await markReadMutation.mutateAsync({ id: m.id });
        await queryClient.invalidateQueries({
          queryKey: getListMessagesQueryKey(),
        });
      } catch {
        /* non-fatal — the message still opens */
      }
    }
  };

  const startReply = (m: Message) => {
    setReplyTo(m);
    setReplySubject(m.subject ? `Re: ${m.subject}` : "");
    setReplyBody("");
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTo || !replyBody.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({
        data: {
          recipientId: replyTo.senderId,
          subject: replySubject.trim() || undefined,
          body: replyBody.trim(),
        },
      });
      setReplyTo(null);
      setReplyBody("");
      setReplySubject("");
      toast({ title: "Reply sent", description: "They'll see it in their inbox." });
    } catch {
      toast({
        title: "Could not send reply",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif tracking-tight mb-2">Inbox</h1>
          <p className="text-[#64748B]">
            Private messages from other members.
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-600 px-2.5 text-sm font-bold text-white">
            {unreadCount}
          </span>
        )}
      </div>

      {messagesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : messagesQuery.isError ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="p-8 text-center text-[#64748B]">
            Couldn&apos;t load your messages. Please refresh and try again.
          </CardContent>
        </Card>
      ) : messages.length === 0 ? (
        <Card className="border-[#E2E8F0]">
          <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <InboxIcon className="h-6 w-6" />
            </div>
            <p className="text-lg font-medium text-[#0F172A]">No messages yet</p>
            <p className="max-w-sm text-sm text-[#64748B]">
              When another member sends you a message, it&apos;ll show up here.
              You can message verified members from their directory profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {messages.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleOpen(m)}
              className={cnRow(m.read)}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  m.read
                    ? "bg-[#F1F5F9] text-[#64748B]"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {senderInitials(m)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  {!m.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  )}
                  <span
                    className={`truncate text-sm ${
                      m.read
                        ? "font-medium text-[#334155]"
                        : "font-semibold text-[#0F172A]"
                    }`}
                  >
                    {senderLabel(m)}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-[#94A3B8]">
                    {timeAgo(m.createdAt)}
                  </span>
                </span>
                {m.subject && (
                  <span className="mt-0.5 block truncate text-sm font-medium text-[#0F172A]">
                    {m.subject}
                  </span>
                )}
                <span className="mt-0.5 block truncate text-sm text-[#64748B]">
                  {m.body}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Read view */}
      <Dialog
        open={!!openMessage}
        onOpenChange={(o) => {
          if (!o) setOpenId(null);
        }}
      >
        <DialogContent>
          {openMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MailOpen className="h-5 w-5 text-[#2563EB]" />
                  {openMessage.subject || "Message"}
                </DialogTitle>
                <DialogDescription>
                  From {senderLabel(openMessage)} ·{" "}
                  {new Date(openMessage.createdAt).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <div className="whitespace-pre-wrap py-4 text-sm leading-relaxed text-[#334155]">
                {openMessage.body}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenId(null)}
                >
                  Close
                </Button>
                <Button
                  variant="ink"
                  onClick={() => {
                    const m = openMessage;
                    setOpenId(null);
                    startReply(m);
                  }}
                >
                  <Send className="h-4 w-4" />
                  Reply
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply compose */}
      <Dialog
        open={!!replyTo}
        onOpenChange={(o) => {
          if (!o) setReplyTo(null);
        }}
      >
        <DialogContent>
          {replyTo && (
            <form onSubmit={submitReply}>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#2563EB]" />
                  Reply to {senderLabel(replyTo)}
                </DialogTitle>
                <DialogDescription>
                  Your reply goes straight to their inbox.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="reply-subject">Subject (optional)</Label>
                  <Input
                    id="reply-subject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reply-body">Message</Label>
                  <Textarea
                    id="reply-body"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Write your reply…"
                    rows={5}
                    maxLength={5000}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="ink"
                  disabled={sendMessageMutation.isPending || !replyBody.trim()}
                >
                  {sendMessageMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Send reply
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cnRow(read: boolean): string {
  return [
    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
    read
      ? "border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]"
      : "border-blue-100 bg-blue-50/40 hover:bg-blue-50",
  ].join(" ");
}
