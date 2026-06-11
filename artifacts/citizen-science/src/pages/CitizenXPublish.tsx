import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, Trash2, GripVertical, FlaskConical } from "lucide-react";
import {
  usePublishCitizenxExperiment,
  useListMyCitizenxExperiments,
  getListMyCitizenxExperimentsQueryKey,
  getListCitizenxExperimentsQueryKey,
} from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { CATEGORY_OPTIONS, categoryName } from "@/lib/citizenx";

interface StepDraft {
  title: string;
  body: string;
}

export function CitizenXPublish() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: mine } = useListMyCitizenxExperiments();
  const publish = usePublishCitizenxExperiment();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorTagline, setAuthorTagline] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([{ title: "", body: "" }]);

  useEffect(() => {
    if (user?.name && !authorName) setAuthorName(user.name);
  }, [user, authorName]);

  const reset = () => {
    setTitle("");
    setSummary("");
    setDescription("");
    setCoverImageUrl("");
    setCategorySlug("");
    setAuthorTagline("");
    setSteps([{ title: "", body: "" }]);
  };

  const updateStep = (i: number, patch: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };
  const addStep = () => setSteps((prev) => [...prev, { title: "", body: "" }]);
  const removeStep = (i: number) =>
    setSteps((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSteps = steps
      .map((s) => ({ title: s.title.trim(), body: s.body.trim() }))
      .filter((s) => s.title && s.body);
    if (cleanSteps.length === 0) {
      toast({
        title: "Add at least one step",
        description: "Each step needs a title and body.",
        variant: "destructive",
      });
      return;
    }
    publish.mutate(
      {
        data: {
          title,
          summary,
          description,
          coverImageUrl: coverImageUrl.trim() || null,
          categorySlug,
          steps: cleanSteps,
          authorName: authorName.trim() || "Anonymous",
          authorTagline: authorTagline.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Experiment published", description: "Your work is now live in the gallery." });
          reset();
          queryClient.invalidateQueries({ queryKey: getListMyCitizenxExperimentsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListCitizenxExperimentsQueryKey() });
        },
        onError: () => {
          toast({
            title: "Couldn't publish",
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
            <BookOpen className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
            Publish an experiment
          </h1>
          <p className="mt-3 text-[#64748B]">
            Author a shareable, step-by-step experiment under your own name. Once
            published it appears in the public gallery for anyone to replicate.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Form */}
          <form onSubmit={submit} className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">The experiment</h2>
              <div className="mt-5 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Measuring pH with red cabbage" required minLength={2} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="summary">Summary</Label>
                  <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="One sentence for the gallery card (min 10 characters)" required minLength={10} maxLength={280} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categorySlug} onValueChange={setCategorySlug} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Choose a field" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cover">Cover image URL <span className="text-[#94A3B8]">(optional)</span></Label>
                    <Input id="cover" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://…" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Overview</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this experiment, what question does it answer, what will people learn? (min 20 characters)" rows={5} required minLength={20} />
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Steps</h2>
                <Button type="button" variant="outline" size="sm" onClick={addStep}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add step
                </Button>
              </div>
              <div className="mt-5 space-y-4">
                {steps.map((step, i) => (
                  <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-[#CBD5E1]" />
                      <span className="text-xs font-semibold text-[#64748B]">Step {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        disabled={steps.length === 1}
                        className="ml-auto inline-flex items-center text-[#94A3B8] transition-colors hover:text-red-500 disabled:opacity-40"
                        aria-label={`Remove step ${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      <Input value={step.title} onChange={(e) => updateStep(i, { title: e.target.value })} placeholder="Step title" />
                      <Textarea value={step.body} onChange={(e) => updateStep(i, { body: e.target.value })} placeholder="What to do in this step" rows={3} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Author branding */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Author</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="authorName">Display name</Label>
                  <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="How you'll be credited" required minLength={1} maxLength={120} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="authorTagline">Tagline <span className="text-[#94A3B8]">(optional)</span></Label>
                  <Input id="authorTagline" value={authorTagline} onChange={(e) => setAuthorTagline(e.target.value)} placeholder="e.g. Backyard chemist, Lagos" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={publish.isPending} className="w-full" size="lg">
              {publish.isPending ? "Publishing…" : "Publish experiment"}
            </Button>
          </form>

          {/* My published */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">My published experiments</h2>
            <div className="mt-4 space-y-3">
              {(mine ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
                  You haven't published any experiments yet.
                </div>
              ) : (
                (mine ?? []).map((exp) => (
                  <Link key={exp.id} href={`/citizenx/experiments/${exp.slug}`}>
                    <div className="group flex gap-3 rounded-2xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-blue-300">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-50 text-[#2563EB]">
                        {exp.coverImageUrl ? (
                          <img src={exp.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <FlaskConical className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{exp.title}</h3>
                        <p className="mt-0.5 text-xs text-[#94A3B8]">{categoryName(exp.categorySlug)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
