import { useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Megaphone, ArrowRight } from "lucide-react";
import {
  useCreateCitizenxEvent,
  useListMyCitizenxEvents,
  useListCitizenxEvents,
  getListMyCitizenxEventsQueryKey,
  getListCitizenxEventsQueryKey,
} from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatEventDate } from "@/lib/citizenx";

export function CitizenXHost() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: mine } = useListMyCitizenxEvents();
  const { data: allEvents } = useListCitizenxEvents();
  const create = useCreateCitizenxEvent();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setTitle("");
    setLocation("");
    setStartsAt("");
    setDescription("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        data: {
          title,
          location,
          startsAt: new Date(startsAt).toISOString(),
          description,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Event published", description: "Your event is now live on CitizenX." });
          reset();
          queryClient.invalidateQueries({ queryKey: getListMyCitizenxEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListCitizenxEventsQueryKey() });
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

  const upcoming = (allEvents ?? []).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CitizenXNav />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
            <Megaphone className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
            Host a discovery event
          </h1>
          <p className="mt-3 text-[#64748B]">
            Convene curious people around an experiment, a field study, or a talk.
            Your event goes live immediately on the public CitizenX calendar.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <form onSubmit={submit} className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Event title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backyard Biodiversity Count" required minLength={2} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue or 'Online'" required minLength={2} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startsAt">Date & time</Label>
                  <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Details</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will happen, who it's for, what to bring. (min 20 characters)" rows={6} required minLength={20} />
              </div>
              <Button type="submit" disabled={create.isPending} className="w-full">
                {create.isPending ? "Publishing…" : "Publish event"}
              </Button>
            </div>
          </form>

          {/* My events */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">My events</h2>
            <div className="mt-4 space-y-3">
              {(mine ?? []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
                  You haven't hosted any events yet.
                </div>
              ) : (
                (mine ?? []).map((ev) => (
                  <Link key={ev.id} href={`/citizenx/events/${ev.slug}`}>
                    <div className="group rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-blue-300">
                      <h3 className="font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{ev.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#64748B]">
                        <Calendar className="h-3 w-3" /> {formatEventDate(ev.startsAt)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#64748B]">
                        <MapPin className="h-3 w-3" /> {ev.location}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Public upcoming events */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-2xl font-normal text-[#0F172A] sm:text-3xl">
              Upcoming across CitizenX
            </h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
              No upcoming events yet. Host the first one above.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((ev) => (
                <Link key={ev.id} href={`/citizenx/events/${ev.slug}`}>
                  <article className="group flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                      {formatEventDate(ev.startsAt)}
                    </p>
                    <h3 className="mt-2 font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{ev.title}</h3>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-[#64748B]">{ev.description}</p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-[#94A3B8]">
                      <MapPin className="h-3 w-3" /> {ev.location}
                      <span className="ml-auto inline-flex items-center font-semibold text-[#2563EB]">
                        Details <ArrowRight className="ml-1 h-3 w-3" />
                      </span>
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
