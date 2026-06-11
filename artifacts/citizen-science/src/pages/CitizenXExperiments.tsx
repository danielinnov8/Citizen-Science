import { useState } from "react";
import { Link } from "wouter";
import { FlaskConical, Search } from "lucide-react";
import { useListCitizenxExperiments } from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { Input } from "@/components/ui/input";
import { CATEGORY_OPTIONS, categoryName } from "@/lib/citizenx";
import { cn } from "@/lib/utils";

export function CitizenXExperiments() {
  const { data: experiments, isLoading } = useListCitizenxExperiments();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("all");

  const all = experiments ?? [];
  const filtered = all.filter((exp) => {
    const matchesCat = active === "all" || exp.categorySlug === active;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      exp.title.toLowerCase().includes(q) ||
      exp.summary.toLowerCase().includes(q) ||
      exp.authorName.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const usedCategories = CATEGORY_OPTIONS.filter((c) =>
    all.some((e) => e.categorySlug === c.slug),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CitizenXNav />

      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
            Community gallery
          </p>
          <h1 className="mt-3 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
            Experiments by the people
          </h1>
          <p className="mt-3 max-w-2xl text-[#64748B]">
            Real, replicable experiments authored and shared by CitizenX members.
            Browse, learn, and build on each other's work.
          </p>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search experiments or authors…"
                className="pl-9"
              />
            </div>
          </div>

          {usedCategories.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <FilterChip label="All" active={active === "all"} onClick={() => setActive("all")} />
              {usedCategories.map((c) => (
                <FilterChip key={c.slug} label={c.name} active={active === c.slug} onClick={() => setActive(c.slug)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                <div className="aspect-[16/9] bg-[#E2E8F0]" />
                <div className="space-y-2 p-5">
                  <div className="h-3 w-1/4 rounded bg-[#E2E8F0]" />
                  <div className="h-4 w-3/4 rounded bg-[#E2E8F0]" />
                  <div className="h-3 w-full rounded bg-[#E2E8F0]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-16 text-center">
            <FlaskConical className="mx-auto h-10 w-10 text-[#94A3B8]" />
            <p className="mt-4 font-medium text-[#0F172A]">
              {all.length === 0 ? "No experiments yet" : "No matches"}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">
              {all.length === 0
                ? "Be the first to publish your work with the network."
                : "Try a different search or category."}
            </p>
            {all.length === 0 && (
              <Link href="/citizenx/publish">
                <span className="mt-5 inline-flex items-center rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  Publish an experiment
                </span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exp) => (
              <Link key={exp.id} href={`/citizenx/experiments/${exp.slug}`}>
                <article className="group h-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-100 to-violet-100">
                    {exp.coverImageUrl ? (
                      <img src={exp.coverImageUrl} alt={exp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FlaskConical className="h-10 w-10 text-blue-400/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7C3AED]">
                      {categoryName(exp.categorySlug)}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{exp.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-[#64748B]">{exp.summary}</p>
                    <p className="mt-3 text-xs text-[#94A3B8]">by {exp.authorName}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[#2563EB] bg-[#2563EB] text-white"
          : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]",
      )}
    >
      {label}
    </button>
  );
}
