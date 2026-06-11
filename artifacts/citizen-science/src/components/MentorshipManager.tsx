import * as React from "react";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Loader2,
  Users,
  Check,
  X,
} from "lucide-react";
import {
  useGetMyMentorWorkspace,
  getGetMyMentorWorkspaceQueryKey,
  useUpdateMyMentorProfile,
  useCreateMyCourse,
  useUpdateMyCourse,
  useDeleteMyCourse,
  useDraftMyCourse,
  ApiError,
  type MentorCourse,
  type CourseInput,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const MIN_COURSE_CREDITS = 5;

function ProfileEditor({
  headline,
  bio,
  expertise,
}: {
  headline: string;
  bio: string;
  expertise: string[];
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = React.useState({
    headline,
    bio,
    expertise: expertise.join(", "),
  });

  React.useEffect(() => {
    setForm({ headline, bio, expertise: expertise.join(", ") });
  }, [headline, bio, expertise]);

  const update = useUpdateMyMentorProfile();

  const handleSave = () => {
    update.mutate(
      {
        data: {
          headline: form.headline.trim(),
          bio: form.bio.trim(),
          expertise: form.expertise
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetMyMentorWorkspaceQueryKey(),
          });
          toast({ title: "Profile saved" });
        },
        onError: (err) => {
          toast({
            title: "Couldn't save profile",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mentor-headline">Headline</Label>
        <Input
          id="mentor-headline"
          placeholder="e.g. Marine biologist & open-science advocate"
          maxLength={200}
          value={form.headline}
          onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mentor-bio">Bio</Label>
        <Textarea
          id="mentor-bio"
          rows={4}
          placeholder="Tell mentees about your background and how you can help."
          maxLength={4000}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mentor-expertise">Expertise (comma-separated)</Label>
        <Input
          id="mentor-expertise"
          placeholder="Genomics, Field ecology, Data analysis"
          value={form.expertise}
          onChange={(e) => setForm((f) => ({ ...f, expertise: e.target.value }))}
        />
      </div>
      <Button onClick={handleSave} disabled={update.isPending}>
        {update.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          "Save profile"
        )}
      </Button>
    </div>
  );
}

const EMPTY_COURSE: CourseInput = {
  title: "",
  description: "",
  outcomes: [],
  creditPrice: MIN_COURSE_CREDITS,
  minCredits: MIN_COURSE_CREDITS,
  published: false,
};

function CourseDialog({
  open,
  onOpenChange,
  existing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing: MentorCourse | null;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = React.useState<CourseInput>(EMPTY_COURSE);
  const [brief, setBrief] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description,
        outcomes: existing.outcomes,
        creditPrice: existing.creditPrice,
        minCredits: existing.minCredits,
        published: existing.published,
      });
    } else {
      setForm(EMPTY_COURSE);
    }
    setBrief("");
  }, [open, existing]);

  const create = useCreateMyCourse();
  const update = useUpdateMyCourse();
  const draft = useDraftMyCourse();
  const saving = create.isPending || update.isPending;

  const handleDraft = () => {
    if (!brief.trim()) return;
    draft.mutate(
      { data: { brief: brief.trim() } },
      {
        onSuccess: (result) => {
          setForm((f) => ({
            ...f,
            title: result.title,
            description: result.description,
            outcomes: result.outcomes,
          }));
          toast({ title: "Draft ready", description: "Review and tweak before saving." });
        },
        onError: (err) => {
          const unavailable = err instanceof ApiError && err.status === 503;
          toast({
            title: unavailable ? "AI drafting unavailable" : "Couldn't draft course",
            description: unavailable
              ? "The AI drafter isn't configured. Fill in the details manually."
              : err instanceof Error
                ? err.message
                : "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleSave = () => {
    const payload: CourseInput = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      outcomes: form.outcomes.map((o) => o.trim()).filter(Boolean),
      creditPrice: Math.max(0, Math.round(form.creditPrice)),
      minCredits: Math.max(0, Math.round(form.minCredits)),
    };

    const onDone = () => {
      void queryClient.invalidateQueries({ queryKey: getGetMyMentorWorkspaceQueryKey() });
      toast({ title: existing ? "Course updated" : "Course created" });
      onOpenChange(false);
    };
    const onError = (err: unknown) => {
      toast({
        title: "Couldn't save course",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    };

    if (existing) {
      update.mutate({ courseId: existing.id, data: payload }, { onSuccess: onDone, onError });
    } else {
      create.mutate({ data: payload }, { onSuccess: onDone, onError });
    }
  };

  const outcomesText = form.outcomes.join("\n");
  const titleInvalid = form.title.trim().length === 0;
  const minBelowFloor = form.minCredits < MIN_COURSE_CREDITS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit course" : "New course"}</DialogTitle>
          <DialogDescription>
            Describe what mentees will learn. Use AI to draft a starting point, then
            refine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50/50 p-3">
            <Label htmlFor="course-brief" className="mb-1.5 flex items-center gap-1.5 text-blue-700">
              <Sparkles className="h-4 w-4" /> Draft with AI
            </Label>
            <div className="flex gap-2">
              <Input
                id="course-brief"
                placeholder="e.g. A 4-week intro to backyard astronomy"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleDraft}
                disabled={draft.isPending || !brief.trim()}
              >
                {draft.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Draft"
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-title">Title</Label>
            <Input
              id="course-title"
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-desc">Description</Label>
            <Textarea
              id="course-desc"
              rows={3}
              maxLength={4000}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-outcomes">Learning outcomes (one per line)</Label>
            <Textarea
              id="course-outcomes"
              rows={4}
              value={outcomesText}
              onChange={(e) =>
                setForm((f) => ({ ...f, outcomes: e.target.value.split("\n") }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course-price">Suggested price (credits)</Label>
              <Input
                id="course-price"
                type="number"
                min={0}
                value={form.creditPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, creditPrice: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-min">Minimum (credits)</Label>
              <Input
                id="course-min"
                type="number"
                min={MIN_COURSE_CREDITS}
                value={form.minCredits}
                onChange={(e) =>
                  setForm((f) => ({ ...f, minCredits: Number(e.target.value) || 0 }))
                }
              />
              {minBelowFloor && (
                <p className="text-xs font-medium text-red-600">
                  Minimum is {MIN_COURSE_CREDITS} credits.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3">
            <div>
              <div className="text-sm font-medium">Published</div>
              <div className="text-xs text-[#64748B]">Visible to members on your profile.</div>
            </div>
            <Switch
              checked={form.published}
              onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || titleInvalid || minBelowFloor}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
              </>
            ) : existing ? (
              "Save changes"
            ) : (
              "Create course"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CourseRow({ course, onEdit }: { course: MentorCourse; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const del = useDeleteMyCourse();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleDelete = () => {
    del.mutate(
      { courseId: course.id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetMyMentorWorkspaceQueryKey(),
          });
          toast({ title: "Course deleted" });
          setConfirmOpen(false);
        },
        onError: (err) => {
          toast({
            title: "Couldn't delete course",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-[#0F172A]">{course.title}</span>
          {course.published ? (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              <Check className="h-3 w-3" /> Published
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              <X className="h-3 w-3" /> Draft
            </span>
          )}
        </div>
        <div className="text-xs text-[#64748B]">
          {course.creditPrice} credits · min {course.minCredits} ·{" "}
          {course.enrollmentCount} enrolled
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete course?</DialogTitle>
            <DialogDescription>
              "{course.title}" will be permanently removed. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={del.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
              {del.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function MentorshipManager() {
  const { data, isLoading, isError } = useGetMyMentorWorkspace({
    query: { queryKey: getGetMyMentorWorkspaceQueryKey() },
  });
  const [courseDialogOpen, setCourseDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MentorCourse | null>(null);

  const openNew = () => {
    setEditing(null);
    setCourseDialogOpen(true);
  };
  const openEdit = (course: MentorCourse) => {
    setEditing(course);
    setCourseDialogOpen(true);
  };

  return (
    <Card className="mb-8 border-[#E2E8F0] shadow-sm">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Mentor workspace</h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-[#64748B]">
            Couldn't load your mentor workspace. Please refresh.
          </p>
        ) : (
          <>
            <ProfileEditor
              headline={data.headline}
              bio={data.bio}
              expertise={data.expertise}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium text-[#0F172A]">Courses</h4>
                <Button size="sm" onClick={openNew}>
                  <Plus className="mr-1.5 h-4 w-4" /> New course
                </Button>
              </div>
              {data.courses.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] px-4">
                  {data.courses.map((course) => (
                    <CourseRow key={course.id} course={course} onEdit={() => openEdit(course)} />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-sm text-[#64748B]">
                  No courses yet. Create your first course to start mentoring.
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#64748B]" />
                <h4 className="font-medium text-[#0F172A]">
                  Mentees{" "}
                  <span className="font-normal text-[#64748B]">({data.mentees.length})</span>
                </h4>
              </div>
              {data.mentees.length > 0 ? (
                <div className="divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0] px-4">
                  {data.mentees.map((m) => (
                    <div key={m.enrollmentId} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[#0F172A]">
                          {m.menteeName || "Member"}
                        </div>
                        <div className="truncate text-xs text-[#64748B]">{m.courseTitle}</div>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-green-700">
                        +{m.creditsPaid} credits
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-[#E2E8F0] p-4 text-sm text-[#64748B]">
                  No mentees yet. Publish a course so members can enroll.
                </p>
              )}
            </div>
          </>
        )}
      </CardContent>

      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        existing={editing}
      />
    </Card>
  );
}
