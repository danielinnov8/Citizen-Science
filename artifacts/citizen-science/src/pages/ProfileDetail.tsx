import { Link, useParams } from "wouter";
import {
  ChevronRight,
  ArrowLeft,
  Quote,
  ExternalLink,
  Lightbulb,
  Compass,
  Beaker,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useGetFeaturedProfile } from "@workspace/api-client-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";
import { EXPERIMENTS } from "@/lib/experiments";

const GROUP_LABELS: Record<string, string> = {
  scientist: "Scientist",
  inventor: "Inventor",
  thought_leader: "Thought Leader",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProfileDetail() {
  const { slug } = useParams();
  const { data: profile, isLoading, isError, error } = useGetFeaturedProfile(
    slug ?? "",
  );

  const notFound =
    isError &&
    (error as { status?: number } | undefined)?.status === 404;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <Skeleton className="h-5 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="aspect-[4/5] rounded-3xl" />
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || (!isLoading && !profile && !isError)) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-2xl border border-[#E2E8F0]">
          <AlertCircle className="h-8 w-8 text-[#CBD5E1] mb-3" />
          <h3 className="font-semibold text-[#0F172A]">Profile not found</h3>
          <p className="text-sm text-[#64748B] mt-1 mb-6">
            We couldn&apos;t find anyone at this address.
          </p>
          <Link href="/directory">
            <Button variant="ink">Back to directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-2xl border border-[#E2E8F0]">
          <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
          <h3 className="font-semibold text-[#0F172A]">
            Couldn&apos;t load this profile
          </h3>
          <p className="text-sm text-[#64748B] mt-1 mb-6">
            Please try refreshing the page.
          </p>
          <Link href="/directory">
            <Button variant="outline">Back to directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedCategories = profile.relatedCategorySlugs
    .map((s) => CATEGORIES.find((c) => c.slug === s))
    .filter((c): c is (typeof CATEGORIES)[number] => Boolean(c));

  const relatedExperiments = EXPERIMENTS.filter((e) =>
    profile.relatedCategorySlugs.includes(e.categoryId),
  ).slice(0, 4);

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm font-medium text-[#64748B] mb-8">
        <Link href="/directory" className="hover:text-[#0F172A]">
          Directory
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-[#0F172A]">{profile.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Portrait + meta */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden sticky top-20">
            <div className="aspect-[4/5] bg-[#F1F5F9] overflow-hidden">
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt={profile.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Avatar className="h-28 w-28">
                    <AvatarFallback className="text-4xl font-serif bg-blue-50 text-blue-700">
                      {initials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-[#94A3B8] mb-1">
                Group
              </div>
              <div className="text-[#0F172A] font-medium mb-4">
                {GROUP_LABELS[profile.group] ?? profile.field}
              </div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#94A3B8] mb-1">
                Field
              </div>
              <div className="text-[#2563EB] font-semibold mb-4">
                {profile.field}
              </div>
              <div className="text-xs font-bold uppercase tracking-wide text-[#94A3B8] mb-1">
                Era
              </div>
              <div className="text-[#0F172A] font-medium">{profile.era}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-serif tracking-tight mb-4">
              {profile.name}
            </h1>
            <p className="text-lg text-[#475569] leading-relaxed">
              {profile.summary}
            </p>
          </div>

          {/* Contributions */}
          {profile.contributions.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <Lightbulb className="h-5 w-5 text-[#16A34A]" />
                Key Contributions
              </h2>
              <ul className="space-y-3">
                {profile.contributions.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4"
                  >
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-green-50 text-green-700 text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-[#334155] leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Quotes */}
          {profile.quotes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <Quote className="h-5 w-5 text-[#7C3AED]" />
                In Their Words
              </h2>
              <div className="space-y-4">
                {profile.quotes.map((q, i) => (
                  <blockquote
                    key={i}
                    className="border-l-4 border-[#7C3AED]/40 bg-violet-50/40 rounded-r-xl p-5 text-lg font-serif italic text-[#0F172A]"
                  >
                    &ldquo;{q}&rdquo;
                  </blockquote>
                ))}
              </div>
            </section>
          )}

          {/* Patents */}
          {profile.patents.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <FileText className="h-5 w-5 text-[#2563EB]" />
                Patents
              </h2>
              <ul className="space-y-3">
                {profile.patents.map((p, i) => (
                  <li key={i}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-blue-300 transition-colors"
                    >
                      <FileText className="h-5 w-5 flex-shrink-0 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors mt-0.5" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                          {p.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#64748B]">
                          <span className="font-mono font-medium text-[#475569]">
                            {p.number}
                          </span>
                          {p.year && (
                            <>
                              <span className="text-[#CBD5E1]">·</span>
                              <span>{p.year}</span>
                            </>
                          )}
                          <span className="text-[#CBD5E1]">·</span>
                          <span className="inline-flex items-center gap-1 text-[#2563EB]">
                            {hostname(p.url)}
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related categories */}
          {relatedCategories.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <Compass className="h-5 w-5 text-[#2563EB]" />
                Explore Related Fields
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/category/${c.slug}`}
                    className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] hover:border-blue-300 hover:text-blue-700 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                  >
                    {c.name}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Related experiments */}
          {relatedExperiments.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight mb-4">
                <Beaker className="h-5 w-5 text-[#16A34A]" />
                Try a Related Experiment
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {relatedExperiments.map((e) => (
                  <Link
                    key={e.id}
                    href={`/experiments/${e.id}`}
                    className="group bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="font-semibold text-[#0F172A] group-hover:text-blue-700 transition-colors">
                      {e.title}
                    </div>
                    <div className="text-xs text-[#64748B] mt-1">
                      {e.difficulty} · {e.estimatedTime}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          {profile.sources.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8] mb-3">
                Sources
              </h2>
              <ol className="space-y-2">
                {profile.sources.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-[#94A3B8]">{i + 1}.</span>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2563EB] hover:underline break-all"
                    >
                      {s.title || hostname(s.url)}
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div>
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#0F172A]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
