import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BadgeCheck, ShieldCheck, Pencil, Clock, X } from "lucide-react";
import {
  useGetMyProfileClaim,
  useClaimProfile,
  useUpdateMyProfile,
  useGetLegendWaitlist,
  getGetMyProfileClaimQueryKey,
  getGetFeaturedProfileQueryKey,
  getGetLegendWaitlistQueryKey,
  type FeaturedProfile,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
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
import { isClaimableProfile } from "@/lib/profileClaim";

// Layout-agnostic ownership affordance (Task #92). Rendered as a fixed panel so
// it works across all four ProfileDetail layouts (hand-authored / DB-built
// cinematic stories + the standard layout). Shows: a "Claim this profile" CTA
// for the living innovator, a pending-review state, and — for the approved
// owner — a "Verified" badge plus an editor. Non-owner visitors on a verified
// profile see a subtle "Verified" badge.

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProfileOwnership({ profile }: { profile: FeaturedProfile }) {
  const { slug } = profile;
  const { isAuthenticated, isLoading: authLoading, hasCompletedOnboarding } =
    useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const claimable = isClaimableProfile(profile.era, profile.lifespan);

  // Only ask the server about the caller's claim when they're signed in and the
  // profile is at all claimable (the endpoint is auth-gated).
  const { data: claimStatus, isLoading: claimLoading } = useGetMyProfileClaim(
    slug,
    {
      query: {
        queryKey: getGetMyProfileClaimQueryKey(slug),
        enabled: isAuthenticated && claimable,
      },
    },
  );

  const claimMutation = useClaimProfile();
  const updateMutation = useUpdateMyProfile();

  // Mentee demand for this living legend (public). Surfaced to the verified
  // owner as social proof of people waiting to learn from them.
  const { data: waitlist } = useGetLegendWaitlist(slug, {
    query: {
      queryKey: getGetLegendWaitlistQueryKey(slug),
      enabled: claimable,
      staleTime: 60_000,
    },
  });
  const menteeCount = waitlist?.count ?? 0;

  const [editorOpen, setEditorOpen] = useState(false);

  const isOwner = claimStatus?.isOwner ?? false;
  const myClaim = claimStatus?.claim ?? null;

  const refetchClaim = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetMyProfileClaimQueryKey(slug),
    });
  };
  const refetchProfile = () => {
    void queryClient.invalidateQueries({
      queryKey: getGetFeaturedProfileQueryKey(slug),
    });
  };

  // One-time "welcome back" after a login-to-claim round trip: the visitor
  // clicked "Log in to claim" anonymously, signed in, and was routed back
  // here. Point them at the CTA so the flow feels continuous.
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    try {
      const returnTo = window.localStorage.getItem("cs.claimReturnTo");
      if (returnTo !== slug) return;
      window.localStorage.removeItem("cs.claimReturnTo");
      toast({
        title: "Welcome back!",
        description:
          "You're signed in — click “Claim this profile” to submit your claim for review.",
      });
    } catch {
      /* ignore */
    }
  }, [authLoading, isAuthenticated, slug]);

  const submitClaim = () => {
    if (!isAuthenticated) {
      // Carry claim intent through auth: every login path (existing account,
      // new signup, Google OAuth) funnels through Login's routeAfterAuth,
      // which follows cs.postAuthRedirect back to this profile — where this
      // card then shows the "Claim this profile" CTA. cs.claimReturnTo drives
      // a one-time welcome hint on arrival.
      try {
        window.localStorage.setItem(
          "cs.postAuthRedirect",
          `/directory/${slug}`,
        );
        window.localStorage.setItem("cs.claimReturnTo", slug);
      } catch {
        /* ignore */
      }
      navigate("/login");
      return;
    }
    claimMutation.mutate(
      { slug },
      {
        onSuccess: () => {
          refetchClaim();
          // A signed-in-but-not-onboarded innovator flows straight into the
          // story-driven onboarding with their claim as context, and returns
          // here afterwards (same localStorage-flag pattern as post-auth
          // routing).
          if (!hasCompletedOnboarding) {
            try {
              window.localStorage.setItem("cs.onboardingClaimSlug", slug);
              window.localStorage.setItem(
                "cs.postAuthRedirect",
                `/directory/${slug}`,
              );
            } catch {
              /* ignore */
            }
            navigate("/onboarding");
            return;
          }
          toast({
            title: "Claim submitted",
            description:
              "Thanks — an administrator will review your request and verify ownership.",
          });
        },
        onError: (err) => {
          toast({
            title: "Couldn't submit claim",
            description:
              (err as Error)?.message ?? "Please try again in a moment.",
            variant: "destructive",
          });
        },
      },
    );
  };

  // Decide what (if anything) to render. Non-claimable historical figures with
  // no owner show nothing.
  const verified = profile.verified;
  if (!claimable && !verified) return null;

  // ---- Owner: verified badge + edit ----
  if (isOwner) {
    return (
      <>
        <OwnershipPanel
          tone="owner"
          icon={<BadgeCheck className="h-4 w-4 flex-shrink-0" />}
          title="Verified — this is your profile"
          subtitle={
            menteeCount > 0
              ? `${menteeCount} aspiring mentee${menteeCount === 1 ? "" : "s"} waiting to learn from you.`
              : undefined
          }
          action={
            <Button
              variant="ink"
              size="sm"
              className="w-full"
              onClick={() => setEditorOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit my profile
            </Button>
          }
        />
        <ProfileEditor
          profile={profile}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          submitting={updateMutation.isPending}
          onSubmit={(input) => {
            updateMutation.mutate(
              { slug, data: input },
              {
                onSuccess: () => {
                  refetchProfile();
                  setEditorOpen(false);
                  toast({
                    title: "Profile updated",
                    description: "Your changes are now live.",
                  });
                },
                onError: (err) => {
                  toast({
                    title: "Couldn't save changes",
                    description:
                      (err as Error)?.message ?? "Please try again.",
                    variant: "destructive",
                  });
                },
              },
            );
          }}
        />
      </>
    );
  }

  // ---- Verified by someone else: subtle badge for visitors ----
  if (verified) {
    return (
      <OwnershipPanel
        tone="verified"
        icon={<BadgeCheck className="h-4 w-4 flex-shrink-0" />}
        title="Verified profile"
        subtitle="Maintained by its owner."
      />
    );
  }

  // From here the profile is claimable and unverified.

  // Avoid flashing the claim CTA while we resolve auth / the claim status.
  if (authLoading || (isAuthenticated && claimLoading)) return null;

  // ---- Pending review ----
  if (myClaim && myClaim.status === "pending") {
    return (
      <OwnershipPanel
        tone="pending"
        icon={<Clock className="h-4 w-4 flex-shrink-0" />}
        title="Claim pending review"
        subtitle="An administrator will verify your ownership shortly."
      />
    );
  }

  // ---- Claim CTA (guest or signed-in, no/denied claim) ----
  const denied = myClaim?.status === "denied";
  return (
    <OwnershipPanel
      tone="claim"
      icon={<ShieldCheck className="h-4 w-4 flex-shrink-0" />}
      title={denied ? "Claim was declined" : `Is this you, ${profile.name}?`}
      subtitle={
        denied
          ? "You can submit a new claim if this was a mistake."
          : "Claim this profile to verify it and keep it accurate."
      }
      action={
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={submitClaim}
          disabled={claimMutation.isPending}
        >
          <ShieldCheck className="h-4 w-4" />
          {isAuthenticated ? "Claim this profile" : "Log in to claim"}
        </Button>
      }
    />
  );
}

function OwnershipPanel({
  tone,
  icon,
  title,
  subtitle,
  action,
}: {
  tone: "owner" | "verified" | "pending" | "claim";
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const toneClasses: Record<typeof tone, string> = {
    owner: "border-green-200 bg-green-50/95 text-green-800",
    verified: "border-green-200 bg-green-50/95 text-green-800",
    pending: "border-amber-200 bg-amber-50/95 text-amber-800",
    claim: "border-[#E2E8F0] bg-white/95 text-[#0F172A]",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`relative rounded-2xl border ${toneClasses[tone]} p-4 shadow-lg backdrop-blur`}
      >
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 rounded-md p-1 text-current/60 transition-colors hover:text-current"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-start gap-2 pr-5">
          {icon}
          <div className="min-w-0">
            <div className="text-sm font-semibold leading-snug">{title}</div>
            {subtitle && (
              <p className="mt-0.5 text-xs leading-relaxed opacity-80">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

function ProfileEditor({
  profile,
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: {
  profile: FeaturedProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting: boolean;
  onSubmit: (input: {
    summary: string;
    tagline: string | null;
    field: string;
    era: string;
    birthplace: string | null;
    imageUrl: string | null;
    biography: string[];
    contributions: string[];
    quotes: string[];
    storyContributions: { title: string; detail: string }[];
    timeline: { year: string; title: string; detail: string }[];
    legacy: string[];
    didYouKnow: string[];
  }) => void;
}) {
  const [summary, setSummary] = useState(profile.summary);
  const [tagline, setTagline] = useState(profile.tagline ?? "");
  const [field, setField] = useState(profile.field);
  const [era, setEra] = useState(profile.era);
  const [birthplace, setBirthplace] = useState(profile.birthplace ?? "");
  const [imageUrl, setImageUrl] = useState(profile.imageUrl ?? "");
  const [biography, setBiography] = useState(profile.biography.join("\n"));
  const [contributions, setContributions] = useState(
    profile.contributions.join("\n"),
  );
  const [quotes, setQuotes] = useState(profile.quotes.join("\n"));
  const [workRows, setWorkRows] = useState(
    (profile.storyContributions ?? []).map((c) => ({ ...c })),
  );
  const [timelineRows, setTimelineRows] = useState(
    (profile.timeline ?? []).map((t) => ({ ...t })),
  );
  const [legacy, setLegacy] = useState((profile.legacy ?? []).join("\n"));
  const [didYouKnow, setDidYouKnow] = useState(
    (profile.didYouKnow ?? []).join("\n"),
  );

  // Re-seed the form whenever the dialog re-opens or the profile changes.
  useEffect(() => {
    if (open) {
      setSummary(profile.summary);
      setTagline(profile.tagline ?? "");
      setField(profile.field);
      setEra(profile.era);
      setBirthplace(profile.birthplace ?? "");
      setImageUrl(profile.imageUrl ?? "");
      setBiography(profile.biography.join("\n"));
      setContributions(profile.contributions.join("\n"));
      setQuotes(profile.quotes.join("\n"));
      setWorkRows((profile.storyContributions ?? []).map((c) => ({ ...c })));
      setTimelineRows((profile.timeline ?? []).map((t) => ({ ...t })));
      setLegacy((profile.legacy ?? []).join("\n"));
      setDidYouKnow((profile.didYouKnow ?? []).join("\n"));
    }
  }, [open, profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      summary: summary.trim(),
      tagline: tagline.trim() || null,
      field: field.trim(),
      era: era.trim(),
      birthplace: birthplace.trim() || null,
      imageUrl: imageUrl.trim() || null,
      biography: linesToArray(biography),
      contributions: linesToArray(contributions),
      quotes: linesToArray(quotes),
      storyContributions: workRows
        .map((r) => ({ title: r.title.trim(), detail: r.detail.trim() }))
        .filter((r) => r.title || r.detail),
      timeline: timelineRows
        .map((r) => ({
          year: r.year.trim(),
          title: r.title.trim(),
          detail: r.detail.trim(),
        }))
        .filter((r) => r.year || r.title || r.detail),
      legacy: linesToArray(legacy),
      didYouKnow: linesToArray(didYouKnow),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#2563EB]" />
              Edit your profile
            </DialogTitle>
            <DialogDescription>
              Keep your directory page accurate. Changes go live immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-summary">Summary</Label>
              <Textarea
                id="edit-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tagline">Tagline</Label>
              <Input
                id="edit-tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short headline"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-field">Field</Label>
                <Input
                  id="edit-field"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-era">Era</Label>
                <Input
                  id="edit-era"
                  value={era}
                  onChange={(e) => setEra(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthplace">Birthplace</Label>
              <Input
                id="edit-birthplace"
                value={birthplace}
                onChange={(e) => setBirthplace(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Portrait image URL</Label>
              <Input
                id="edit-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Biography</Label>
              <Textarea
                id="edit-bio"
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-[#94A3B8]">One paragraph per line.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contrib">Key contributions</Label>
              <Textarea
                id="edit-contrib"
                value={contributions}
                onChange={(e) => setContributions(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-[#94A3B8]">One contribution per line.</p>
            </div>
            <div className="space-y-2">
              <Label>Your work</Label>
              <p className="text-xs text-[#94A3B8]">
                Research highlights and projects featured on your page.
              </p>
              {workRows.map((row, i) => (
                <div
                  key={i}
                  className="space-y-1.5 rounded-lg border border-[#E2E8F0] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Title — e.g. Discovery of X"
                      value={row.title}
                      onChange={(e) =>
                        setWorkRows((rows) =>
                          rows.map((r, j) =>
                            j === i ? { ...r, title: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label="Remove work"
                      onClick={() =>
                        setWorkRows((rows) => rows.filter((_, j) => j !== i))
                      }
                      className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:text-[#0F172A]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    placeholder="What it is and why it matters"
                    value={row.detail}
                    rows={2}
                    onChange={(e) =>
                      setWorkRows((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, detail: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setWorkRows((rows) => [...rows, { title: "", detail: "" }])
                }
              >
                Add work
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Career timeline</Label>
              <p className="text-xs text-[#94A3B8]">
                Milestones shown on your page — year, milestone, short note.
              </p>
              {timelineRows.map((row, i) => (
                <div
                  key={i}
                  className="space-y-1.5 rounded-lg border border-[#E2E8F0] p-2.5"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Year"
                      className="w-24 flex-shrink-0"
                      value={row.year}
                      onChange={(e) =>
                        setTimelineRows((rows) =>
                          rows.map((r, j) =>
                            j === i ? { ...r, year: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <Input
                      placeholder="Milestone"
                      value={row.title}
                      onChange={(e) =>
                        setTimelineRows((rows) =>
                          rows.map((r, j) =>
                            j === i ? { ...r, title: e.target.value } : r,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      aria-label="Remove milestone"
                      onClick={() =>
                        setTimelineRows((rows) =>
                          rows.filter((_, j) => j !== i),
                        )
                      }
                      className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:text-[#0F172A]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Textarea
                    placeholder="A short note about this milestone"
                    value={row.detail}
                    rows={2}
                    onChange={(e) =>
                      setTimelineRows((rows) =>
                        rows.map((r, j) =>
                          j === i ? { ...r, detail: e.target.value } : r,
                        ),
                      )
                    }
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setTimelineRows((rows) => [
                    ...rows,
                    { year: "", title: "", detail: "" },
                  ])
                }
              >
                Add milestone
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quotes">Quotes</Label>
              <Textarea
                id="edit-quotes"
                value={quotes}
                onChange={(e) => setQuotes(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-[#94A3B8]">One quote per line.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-legacy">Legacy</Label>
              <Textarea
                id="edit-legacy"
                value={legacy}
                onChange={(e) => setLegacy(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-[#94A3B8]">
                One line each — how you want your work to live on.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dyk">Did you know</Label>
              <Textarea
                id="edit-dyk"
                value={didYouKnow}
                onChange={(e) => setDidYouKnow(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-[#94A3B8]">One fact per line.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="ink" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
