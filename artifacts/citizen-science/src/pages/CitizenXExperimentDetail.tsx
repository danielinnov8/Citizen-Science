import { Link, useParams } from "wouter";
import { ArrowLeft, Share2, FlaskConical, User } from "lucide-react";
import { useGetCitizenxExperiment } from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { categoryName } from "@/lib/citizenx";

export function CitizenXExperimentDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const { toast } = useToast();
  const { data: exp, isLoading, isError } = useGetCitizenxExperiment(slug);

  const share = async () => {
    const url = window.location.href;
    const title = exp?.title ?? "CitizenX experiment";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: "Share it anywhere." });
    } catch {
      toast({ title: "Couldn't copy link", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CitizenXNav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/citizenx/experiments" className="inline-flex items-center text-sm font-medium text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to gallery
        </Link>

        {isLoading && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-[#E2E8F0]" />
            <div className="aspect-[16/9] rounded-2xl bg-[#E2E8F0]" />
            <div className="h-4 w-full rounded bg-[#E2E8F0]" />
          </div>
        )}

        {isError && (
          <div className="mt-12 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
            <p className="font-medium text-[#0F172A]">Experiment not found</p>
            <p className="mt-1 text-sm text-[#64748B]">This experiment may have been removed or the link is incorrect.</p>
            <Link href="/citizenx/experiments" className="mt-5 inline-flex font-semibold text-[#2563EB]">Browse the gallery</Link>
          </div>
        )}

        {exp && (
          <article className="mt-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C3AED]">
              {categoryName(exp.categorySlug)}
            </span>
            <div className="mt-2 flex items-start justify-between gap-4">
              <h1 className="font-serif text-3xl font-normal leading-tight text-[#0F172A] sm:text-4xl">{exp.title}</h1>
              <Button variant="outline" size="sm" onClick={share} className="mt-1 shrink-0">
                <Share2 className="mr-1.5 h-4 w-4" /> Share
              </Button>
            </div>
            <p className="mt-4 text-lg text-[#475569]">{exp.summary}</p>

            {/* Author */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0F172A]">{exp.authorName}</p>
                {exp.authorTagline && <p className="text-xs text-[#64748B]">{exp.authorTagline}</p>}
              </div>
            </div>

            {/* Cover */}
            <div className="mt-6 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100">
              {exp.coverImageUrl ? (
                <img src={exp.coverImageUrl} alt={exp.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FlaskConical className="h-12 w-12 text-blue-400/60" />
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Overview</h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[#334155]">{exp.description}</p>
            </div>

            {/* Steps */}
            {exp.steps.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Steps</h2>
                <ol className="mt-4 space-y-4">
                  {exp.steps.map((step, i) => (
                    <li key={i} className="flex gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#2563EB]">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-[#0F172A]">{step.title}</h3>
                        <p className="mt-1.5 whitespace-pre-wrap leading-relaxed text-[#475569]">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 rounded-2xl bg-[#0B1120] p-8 text-center text-white">
              <h2 className="font-serif text-2xl font-normal">Have an experiment of your own?</h2>
              <p className="mt-2 text-white/70">Publish it and inspire the next discovery.</p>
              <Link href="/citizenx/publish">
                <span className="btn-metal-blue mt-5 inline-flex items-center rounded-full px-7 py-3 text-sm font-medium">
                  Publish an experiment
                </span>
              </Link>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
