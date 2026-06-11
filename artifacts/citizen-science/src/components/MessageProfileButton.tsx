import { useState } from "react";
import { useLocation } from "wouter";
import { MessageSquare, Loader2 } from "lucide-react";
import { useSendMessage } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
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

/**
 * MessageProfileButton — a compact "Message" affordance for living directory
 * members. Shown on every living member's card regardless of whether they have
 * claimed their profile yet: the sender writes their message now, and the
 * backend either delivers it immediately (profile already claimed) or HOLDS it
 * and delivers it the moment that member claims their profile.
 *
 * It is self-contained (owns its dialog + send mutation) so it can drop into a
 * card footer. Because directory cards are wrapped in a `<Link>`, the trigger
 * stops click propagation so opening the dialog never navigates to the profile.
 */
export function MessageProfileButton({
  slug,
  profileName,
}: {
  slug: string;
  profileName: string;
}) {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const sendMessageMutation = useSendMessage();

  const openDialog = (e: React.MouseEvent) => {
    // The card is a Link — don't let the click bubble up and navigate away.
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const submitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    try {
      const result = await sendMessageMutation.mutateAsync({
        data: {
          profileSlug: slug,
          subject: subject.trim() || undefined,
          body: body.trim(),
        },
      });
      setOpen(false);
      setSubject("");
      setBody("");
      toast(
        result?.held
          ? {
              title: "Message saved",
              description: `We'll deliver it to ${profileName} as soon as they claim their profile.`,
            }
          : {
              title: "Message sent",
              description: "They'll see it in their inbox.",
            },
      );
    } catch {
      toast({
        title: "Could not send message",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={openDialog}
      >
        <MessageSquare className="h-4 w-4" />
        Message
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <form onSubmit={submitMessage}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#2563EB]" />
                Message {profileName}
              </DialogTitle>
              <DialogDescription>
                Your message goes to their private inbox. If they haven&apos;t
                joined yet, we&apos;ll hold it and deliver it once they claim
                their profile.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message-subject">Subject (optional)</Label>
                <Input
                  id="message-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-body">Message</Label>
                <Textarea
                  id="message-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message…"
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="ink"
                disabled={sendMessageMutation.isPending || !body.trim()}
              >
                {sendMessageMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Send message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
