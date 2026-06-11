import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, MapPin, Compass } from "lucide-react";
import {
  useApplyCitizenxChapter,
  useListMyCitizenxChapters,
  getListMyCitizenxChaptersQueryKey,
} from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatShortDate } from "@/lib/citizenx";

export function CitizenXOrganize() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: mine } = useListMyCitizenxChapters();
  const apply = useApplyCitizenxChapter();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [focus, setFocus] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setLocation("");
    setFocus("");
    setDescription("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    apply.mutate(
      { data: { name, location, focus, description } },
      {
        onSuccess: () => {
          toast({
            title: "Application submitted",
            description: "Your chapter is pending review. We'll be in touch soon.",
          });
          reset();
          queryClient.invalidateQueries({ queryKey: getListMyCitizenxChaptersQueryKey() });
        },
        onError: () => {
          toast({
            title: "Couldn't submit",
            description: "Please check your details and try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CitizenXNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
            <Compass className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
            Apply to organize a chapter
          </h1>
          <p className="mt-3 text-[#64748B]">
            Bring CitizenX to your city or campus. Tell us about the community you
            want to build — applications are reviewed and you'll see the status
            below.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <form onSubmit={submit} className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">Chapter name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CitizenX Austin"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, region or campus"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="focus">Research focus</Label>
                <Input
                  id="focus"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. Urban water quality, citizen astronomy"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Why this chapter?</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your community, who you want to reach, and the discoveries you hope to make together. (min 20 characters)"
                  rows={6}
                  required
                  minLength={20}
                />
              </div>
              <Button type="submit" disabled={apply.isPending} className="w-full">
                {apply.isPending ? "Submitting…" : "Submit application"}
              </Button>
            </div>
          </form>

          {/* My applications */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">
              My applications
            </h2>
            <div className="mt-4 space-y-3">
              {(mine ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
                  You haven't applied to organize a chapter yet.
                </div>
              ) : (
                (mine ?? []).map((ch) => (
                  <div key={ch.id} className="rounded-2xl border border-[#E2E8F0] bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[#0F172A]">{ch.name}</h3>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]">
                          <MapPin className="h-3 w-3" /> {ch.location}
                        </p>
                      </div>
                      <StatusBadge status={ch.status} />
                    </div>
                    <p className="mt-3 text-sm text-[#64748B]">{ch.focus}</p>
                    <p className="mt-3 text-[11px] text-[#94A3B8]">
                      Applied {formatShortDate(ch.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "active" }) {
  if (status === "active") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
        <CheckCircle2 className="h-3 w-3" /> Active
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
      <Clock className="h-3 w-3" /> Pending review
    </span>
  );
}
