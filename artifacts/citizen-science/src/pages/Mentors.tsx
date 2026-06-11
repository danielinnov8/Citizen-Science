import { Link } from "wouter";
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react";
import {
  useListMentors,
  getListMentorsQueryKey,
  type MentorSummary,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LIVING_MIND_STORIES, type LivingMindStory } from "@/lib/livingMinds";

function initialsFor(name: string | null): string {
  const source = (name && name.trim()) || "Mentor";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const LIVING_MENTORS: LivingMindStory[] = Object.values(LIVING_MIND_STORIES).sort(
  (a, b) => a.name.localeCompare(b.name),
);

function LivingMentorCard({ mentor }: { mentor: LivingMindStory }) {
  return (
    <Link href={`/directory/${mentor.slug}`}>
      <Card className="group h-full cursor-pointer border-[#E2E8F0] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-[#E2E8F0]">
              <AvatarImage src={mentor.imageUrl} alt={mentor.name} />
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {initialsFor(mentor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-[#0F172A]">
                {mentor.name}
              </h3>
              <p className="truncate text-xs text-[#64748B]">{mentor.field}</p>
            </div>
          </div>

          <p className="mb-4 line-clamp-3 text-sm text-[#475569]">{mentor.tagline}</p>

          {mentor.contributions.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {mentor.contributions.slice(0, 3).map((c) => (
                <span
                  key={c.title}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                >
                  {c.title}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600">
            View profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MentorCard({ mentor }: { mentor: MentorSummary }) {
  return (
    <Link href={`/mentors/${mentor.userId}`}>
      <Card className="group h-full cursor-pointer border-[#E2E8F0] shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
        <CardContent className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-center gap-4">
            <Avatar className="h-14 w-14 border border-[#E2E8F0]">
              {mentor.image && <AvatarImage src={mentor.image} alt={mentor.name ?? "Mentor"} />}
              <AvatarFallback className="bg-blue-600 text-white font-bold">
                {initialsFor(mentor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-[#0F172A]">
                {mentor.name || "Mentor"}
              </h3>
              <p className="flex items-center gap-1 text-xs text-[#64748B]">
                <BookOpen className="h-3.5 w-3.5" />
                {mentor.courseCount} course{mentor.courseCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {mentor.headline && (
            <p className="mb-4 line-clamp-2 text-sm text-[#475569]">{mentor.headline}</p>
          )}

          {mentor.expertise.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center gap-1 text-sm font-medium text-blue-600">
            View profile
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function Mentors() {
  const { data, isLoading } = useListMentors({
    query: { queryKey: getListMentorsQueryKey(), staleTime: 30_000 },
  });

  const communityMentors = data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl animate-in fade-in p-6 duration-500 lg:p-10">
      <div className="mb-10">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="mb-2 font-serif text-3xl tracking-tight">Mentors</h1>
        <p className="text-[#64748B]">
          Learn directly from the great minds shaping science today, and from
          experienced researchers in our community. Explore a mentor's story or
          enroll in a course using your credits.
        </p>
      </div>

      <section className="mb-12">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">
            Living legends mentor program
          </h2>
          <p className="text-sm text-[#64748B]">
            The pioneers from our directory who are shaping the future right now.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LIVING_MENTORS.map((m) => (
            <LivingMentorCard key={m.slug} mentor={m} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#0F172A]">Community mentors</h2>
          <p className="text-sm text-[#64748B]">
            Researchers and educators offering hands-on mentoring courses.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-xl" />
            ))}
          </div>
        ) : communityMentors.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communityMentors.map((m) => (
              <MentorCard key={m.userId} mentor={m} />
            ))}
          </div>
        ) : (
          <Card className="border-[#E2E8F0]">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">No community mentors yet</h2>
              <p className="max-w-md text-sm text-[#64748B]">
                Community mentors will appear here once they set up their profiles.
                Check back soon.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
