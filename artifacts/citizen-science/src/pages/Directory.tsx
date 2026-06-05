import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Users, AlertCircle } from "lucide-react";
import { useListFeaturedProfiles } from "@workspace/api-client-react";
import type { FeaturedProfileSummary } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

const GROUP_LABELS: Record<string, string> = {
  scientist: "Scientists",
  inventor: "Inventors",
  thought_leader: "Thought Leaders",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ProfileCard({ p }: { p: FeaturedProfileSummary }) {
  return (
    <Link
      href={`/directory/${p.slug}`}
      className="group bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:border-blue-200 hover:shadow-md transition-all flex flex-col"
    >
      <div className="aspect-[4/5] bg-[#F1F5F9] overflow-hidden relative">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-serif bg-blue-50 text-blue-700">
                {initials(p.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#0F172A] leading-snug group-hover:text-blue-700 transition-colors">
          {p.name}
        </h3>
        <p className="text-sm text-[#2563EB] font-medium mt-1">{p.field}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{p.era}</p>
      </div>
    </Link>
  );
}

export function Directory() {
  const { data, isLoading, isError } = useListFeaturedProfiles();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const [field, setField] = useState(ALL);
  const [era, setEra] = useState(ALL);

  const profiles = data ?? [];

  const groups = useMemo(
    () =>
      Array.from(new Set(profiles.map((p) => p.group))).sort(
        (a, b) =>
          (GROUP_LABELS[a] ?? a).localeCompare(GROUP_LABELS[b] ?? b),
      ),
    [profiles],
  );
  const fields = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.field))).sort(),
    [profiles],
  );
  const eras = useMemo(
    () => Array.from(new Set(profiles.map((p) => p.era))).sort(),
    [profiles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (group !== ALL && p.group !== group) return false;
      if (field !== ALL && p.field !== field) return false;
      if (era !== ALL && p.era !== era) return false;
      if (q) {
        const haystack = `${p.name} ${p.field} ${p.era}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, query, group, field, era]);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full animate-in fade-in duration-500 pb-32">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm font-medium text-[#2563EB] mb-3">
          <Users className="h-4 w-4" />
          Directory
        </div>
        <h1 className="text-4xl font-serif tracking-tight mb-3">
          Scientists &amp; Inventors
        </h1>
        <p className="text-lg text-[#64748B] max-w-2xl leading-relaxed">
          Explore the minds that shaped modern science. Search and filter by
          field or era, then dive into a profile to see their contributions,
          quotes, and the disciplines you can explore in Citizen Science.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, field, or era..."
            className="pl-9 bg-white"
          />
        </div>
        <Select value={group} onValueChange={setGroup}>
          <SelectTrigger className="bg-white md:w-48">
            <SelectValue placeholder="All groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All groups</SelectItem>
            {groups.map((g) => (
              <SelectItem key={g} value={g}>
                {GROUP_LABELS[g] ?? g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={field} onValueChange={setField}>
          <SelectTrigger className="bg-white md:w-52">
            <SelectValue placeholder="All fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All fields</SelectItem>
            {fields.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={era} onValueChange={setEra}>
          <SelectTrigger className="bg-white md:w-44">
            <SelectValue placeholder="All eras" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All eras</SelectItem>
            {eras.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* States */}
      {isError ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
          <h3 className="font-semibold text-[#0F172A]">
            Couldn&apos;t load the directory
          </h3>
          <p className="text-sm text-[#64748B] mt-1">
            Please try refreshing the page.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden"
            >
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-[#E2E8F0]">
          <Users className="h-8 w-8 text-[#CBD5E1] mb-3" />
          <h3 className="font-semibold text-[#0F172A]">No matches found</h3>
          <p className="text-sm text-[#64748B] mt-1">
            Try a different search or clear your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-[#64748B] mb-4">
            {filtered.length}{" "}
            {filtered.length === 1 ? "person" : "people"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProfileCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
