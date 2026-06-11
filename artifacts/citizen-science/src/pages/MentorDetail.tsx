import * as React from "react";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, BookOpen, Check, GraduationCap, Loader2, Sparkles } from "lucide-react";
import {
  useGetMentor,
  getGetMentorQueryKey,
  useEnrollInCourse,
  getGetMyEnrollmentsQueryKey,
  getGetCreditBalanceQueryKey,
  ApiError,
  type MentorCourse,
  type OutOfCreditsError,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function initialsFor(name: string | null): string {
  const source = (name && name.trim()) || "Mentor";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function EnrollDialog({
  course,
  mentorName,
  open,
  onOpenChange,
}: {
  course: MentorCourse;
  mentorName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [credits, setCredits] = React.useState<number>(course.minCredits);
  const [outOfCredits, setOutOfCredits] = React.useState<OutOfCreditsError | null>(null);

  React.useEffect(() => {
    if (open) {
      setCredits(course.minCredits);
      setOutOfCredits(null);
    }
  }, [open, course.minCredits]);

  const enroll = useEnrollInCourse();

  const belowMin = credits < course.minCredits;

  const handleEnroll = () => {
    setOutOfCredits(null);
    enroll.mutate(
      { courseId: course.id, data: { credits } },
      {
        onSuccess: (result) => {
          void queryClient.invalidateQueries({ queryKey: getGetMyEnrollmentsQueryKey() });
          void queryClient.invalidateQueries({ queryKey: getGetCreditBalanceQueryKey() });
          toast({
            title: "Enrolled!",
            description: `You paid ${result.creditsPaid} credits. ${result.totalRemaining} credits remaining.`,
          });
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 402 && err.data) {
            setOutOfCredits(err.data as OutOfCreditsError);
            return;
          }
          if (err instanceof ApiError && err.status === 409) {
            toast({
              title: "Already enrolled",
              description: "You're already enrolled in this course.",
            });
            onOpenChange(false);
            return;
          }
          toast({
            title: "Couldn't enroll",
            description:
              err instanceof Error ? err.message : "Something went wrong. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in {course.title}</DialogTitle>
          <DialogDescription>
            Pay what you want to learn from {mentorName || "this mentor"} — at least{" "}
            {course.minCredits} credits. Your credits go directly to the mentor.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="enroll-credits">Credits to pay</Label>
            <Input
              id="enroll-credits"
              type="number"
              min={course.minCredits}
              value={credits}
              onChange={(e) => setCredits(Math.max(0, Math.round(Number(e.target.value) || 0)))}
            />
            <p className="text-xs text-[#64748B]">
              Minimum {course.minCredits} credits. Suggested: {course.creditPrice} credits.
            </p>
            {belowMin && (
              <p className="text-xs font-medium text-red-600">
                Must be at least {course.minCredits} credits.
              </p>
            )}
          </div>

          {outOfCredits && (
            <Alert variant="destructive">
              <AlertDescription className="flex flex-col gap-2">
                <span>{outOfCredits.error || "You don't have enough credits."}</span>
                {outOfCredits.upgradeHref && (
                  <Button asChild size="sm" variant="outline" className="w-fit">
                    <Link href={outOfCredits.upgradeHref}>
                      {outOfCredits.isGuest ? "Sign in" : "Get more credits"}
                    </Link>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={enroll.isPending}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={enroll.isPending || belowMin}>
            {enroll.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling…
              </>
            ) : (
              <>Pay {credits} credits</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseCard({
  course,
  mentorName,
  isOwnProfile,
}: {
  course: MentorCourse;
  mentorName: string | null;
  isOwnProfile: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [enrollOpen, setEnrollOpen] = React.useState(false);

  return (
    <Card className="border-[#E2E8F0] shadow-sm">
      <CardContent className="p-6">
        <h3 className="mb-1.5 text-lg font-semibold text-[#0F172A]">{course.title}</h3>
        <p className="mb-4 text-sm text-[#475569]">{course.description}</p>

        {course.outcomes.length > 0 && (
          <ul className="mb-5 space-y-1.5">
            {course.outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#334155]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4">
          <div className="text-sm">
            <span className="font-semibold text-[#0F172A]">{course.creditPrice} credits</span>
            <span className="text-[#64748B]"> · min {course.minCredits}</span>
          </div>
          {isOwnProfile ? (
            <span className="text-xs text-[#64748B]">Your course</span>
          ) : isAuthenticated ? (
            <Button size="sm" onClick={() => setEnrollOpen(true)}>
              Enroll
            </Button>
          ) : (
            <Button size="sm" onClick={() => setLocation("/login")}>
              Sign in to enroll
            </Button>
          )}
        </div>
      </CardContent>

      {!isOwnProfile && isAuthenticated && (
        <EnrollDialog
          course={course}
          mentorName={mentorName}
          open={enrollOpen}
          onOpenChange={setEnrollOpen}
        />
      )}
    </Card>
  );
}

export function MentorDetail() {
  const params = useParams();
  const id = params.id ?? "";
  const { user } = useAuth();

  const { data: mentor, isLoading, isError } = useGetMentor(id, {
    query: { queryKey: getGetMentorQueryKey(id), enabled: !!id },
  });

  const isOwnProfile = !!user && user.id === id;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl animate-in fade-in p-6 duration-500 lg:p-10">
        <Skeleton className="mb-6 h-8 w-32" />
        <Skeleton className="mb-4 h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !mentor) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-10">
        <Button asChild variant="ghost" className="mb-6 -ml-2">
          <Link href="/mentors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to mentors
          </Link>
        </Button>
        <Card className="border-[#E2E8F0]">
          <CardContent className="flex flex-col items-center p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Mentor not found</h2>
            <p className="max-w-md text-sm text-[#64748B]">
              This mentor doesn't exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const publishedCourses = mentor.courses;

  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in p-6 duration-500 lg:p-10">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/mentors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to mentors
        </Link>
      </Button>

      <Card className="mb-8 border-[#E2E8F0] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 border border-[#E2E8F0]">
              {mentor.image && <AvatarImage src={mentor.image} alt={mentor.name ?? "Mentor"} />}
              <AvatarFallback className="bg-blue-600 text-xl font-bold text-white">
                {initialsFor(mentor.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl tracking-tight">{mentor.name || "Mentor"}</h1>
              {mentor.headline && (
                <p className="mt-1 text-[#475569]">{mentor.headline}</p>
              )}
              {mentor.expertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {mentor.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {mentor.bio && (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[#334155]">
              {mentor.bio}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold">
          Courses{" "}
          <span className="font-normal text-[#64748B]">({publishedCourses.length})</span>
        </h2>
      </div>

      {publishedCourses.length > 0 ? (
        <div className="space-y-5">
          {publishedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              mentorName={mentor.name}
              isOwnProfile={isOwnProfile}
            />
          ))}
        </div>
      ) : (
        <Card className="border-[#E2E8F0]">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Sparkles className="mb-3 h-6 w-6 text-slate-400" />
            <p className="text-sm text-[#64748B]">
              This mentor hasn't published any courses yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
