import { Link, useParams } from "wouter";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { useGetCitizenxEvent } from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import { formatEventDate } from "@/lib/citizenx";

export function CitizenXEventDetail() {
  const params = useParams();
  const slug = params.slug ?? "";
  const { data: event, isLoading, isError } = useGetCitizenxEvent(slug);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <CitizenXNav />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/citizenx/host" className="inline-flex items-center text-sm font-medium text-[#64748B] hover:text-[#0F172A]">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to events
        </Link>

        {isLoading && (
          <div className="mt-8 animate-pulse space-y-4">
            <div className="h-8 w-2/3 rounded bg-[#E2E8F0]" />
            <div className="h-4 w-1/3 rounded bg-[#E2E8F0]" />
            <div className="h-40 rounded bg-[#E2E8F0]" />
          </div>
        )}

        {isError && (
          <div className="mt-12 rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
            <p className="font-medium text-[#0F172A]">Event not found</p>
            <p className="mt-1 text-sm text-[#64748B]">This event may have been removed or the link is incorrect.</p>
            <Link href="/citizenx/host" className="mt-5 inline-flex font-semibold text-[#2563EB]">Browse events</Link>
          </div>
        )}

        {event && (
          <article className="mt-8 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 px-8 py-10 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                CitizenX event
              </p>
              <h1 className="mt-3 font-serif text-3xl font-normal leading-tight sm:text-4xl">{event.title}</h1>
            </div>
            <div className="grid gap-4 border-b border-[#E2E8F0] bg-[#F8FAFC] px-8 py-5 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 shrink-0 text-[#2563EB]" />
                <span className="text-[#0F172A]">{formatEventDate(event.startsAt)}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-[#2563EB]" />
                <span className="text-[#0F172A]">{event.location}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <User className="h-4 w-4 shrink-0 text-[#2563EB]" />
                <span className="text-[#0F172A]">Hosted by {event.organizerName}</span>
              </div>
            </div>
            <div className="px-8 py-8">
              <p className="whitespace-pre-wrap leading-relaxed text-[#334155]">{event.description}</p>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
