import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Globe2,
  Users,
  Calendar,
  FlaskConical,
  MapPin,
  Sparkles,
  Compass,
  Megaphone,
  BookOpen,
} from "lucide-react";
import {
  useListCitizenxExperiments,
  useListCitizenxEvents,
  useListCitizenxChapters,
} from "@workspace/api-client-react";
import { CitizenXNav } from "@/components/citizenx/CitizenXNav";
import {
  CITIZENX_MTP,
  CITIZENX_TAGLINE,
  CITIZENX_PILLARS,
  categoryName,
  formatEventDate,
} from "@/lib/citizenx";

const PILLAR_ICONS = {
  organize: Compass,
  host: Megaphone,
  publish: BookOpen,
} as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const HOW_IT_WORKS = [
  {
    icon: Compass,
    title: "Join the movement",
    body: "Anyone can take part — no degree, no lab, no gatekeepers. Curiosity is the only requirement.",
  },
  {
    icon: Users,
    title: "Gather your community",
    body: "Start a local chapter or join one. Discovery accelerates when curious people work together.",
  },
  {
    icon: FlaskConical,
    title: "Do real science",
    body: "Host events, run experiments, and publish your findings for the world to build on.",
  },
];

export function CitizenX() {
  const { data: experiments } = useListCitizenxExperiments();
  const { data: events } = useListCitizenxEvents();
  const { data: chapters } = useListCitizenxChapters();

  const featuredExperiments = (experiments ?? []).slice(0, 6);
  const upcomingEvents = (events ?? []).slice(0, 4);
  const activeChapters = (chapters ?? []).slice(0, 6);

  return (
    <div className="min-h-screen">
      <CitizenXNav />

      {/* Hero — led by the MTP */}
      <section className="relative overflow-hidden bg-[#0B1120] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/70"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            CitizenX — The Discovery Movement
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto mt-8 max-w-4xl font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-6xl"
          >
            {CITIZENX_MTP}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-white/70"
          >
            {CITIZENX_TAGLINE}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <Link href="/citizenx/organize">
              <span className="btn-metal-blue inline-flex items-center rounded-full px-7 py-3 text-sm font-medium">
                Start a chapter <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
            <Link href="/citizenx/experiments">
              <span className="inline-flex items-center rounded-full border border-white/20 px-7 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10">
                Explore experiments
              </span>
            </Link>
          </motion.div>

          {/* Live counts */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { icon: Globe2, value: chapters?.length ?? 0, label: "Chapters" },
              { icon: Calendar, value: events?.length ?? 0, label: "Upcoming events" },
              { icon: FlaskConical, value: experiments?.length ?? 0, label: "Experiments" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-5 w-5 text-blue-300" />
                <p className="mt-2 text-3xl font-bold tabular-nums">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
              How it works
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
              Discovery belongs to everyone
            </h2>
            <p className="mt-4 text-[#64748B]">
              CitizenX is a self-organizing network. There is no application to be
              "good enough" — only an invitation to begin.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">
              Three ways to lead
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
              Organize. Host. Publish.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {CITIZENX_PILLARS.map((pillar, i) => {
              const Icon = PILLAR_ICONS[pillar.key];
              return (
                <Reveal key={pillar.key} delay={i * 0.08}>
                  <div className="flex h-full flex-col rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      {pillar.tagline}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[#0F172A]">{pillar.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#64748B]">
                      {pillar.description}
                    </p>
                    <Link href={pillar.href}>
                      <span className="mt-5 inline-flex items-center text-sm font-semibold text-[#2563EB] transition-colors hover:text-blue-700">
                        {pillar.cta} <ArrowRight className="ml-1.5 h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured experiments */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
                From the community
              </p>
              <h2 className="mt-3 font-serif text-3xl font-normal text-[#0F172A] sm:text-4xl">
                Featured experiments
              </h2>
            </div>
            <Link href="/citizenx/experiments" className="hidden shrink-0 items-center text-sm font-semibold text-[#2563EB] hover:text-blue-700 sm:inline-flex">
              View gallery <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Reveal>

          {featuredExperiments.length === 0 ? (
            <Reveal className="mt-10 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center">
              <FlaskConical className="mx-auto h-8 w-8 text-[#94A3B8]" />
              <p className="mt-4 font-medium text-[#0F172A]">No experiments published yet</p>
              <p className="mt-1 text-sm text-[#64748B]">Be the first to share your work with the network.</p>
              <Link href="/citizenx/publish">
                <span className="mt-5 inline-flex items-center rounded-full bg-[#2563EB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  Publish an experiment
                </span>
              </Link>
            </Reveal>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredExperiments.map((exp, i) => (
                <Reveal key={exp.id} delay={i * 0.05}>
                  <Link href={`/citizenx/experiments/${exp.slug}`}>
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
                        <h3 className="mt-1.5 line-clamp-2 font-semibold text-[#0F172A] group-hover:text-[#2563EB]">
                          {exp.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-[#64748B]">{exp.summary}</p>
                        <p className="mt-3 text-xs text-[#94A3B8]">by {exp.authorName}</p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events + chapters */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
          {/* Upcoming events */}
          <Reveal>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl font-normal text-[#0F172A] sm:text-3xl">
                Upcoming events
              </h2>
              <Link href="/citizenx/host" className="inline-flex shrink-0 items-center text-sm font-semibold text-[#2563EB] hover:text-blue-700">
                Host one <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
                  No upcoming events yet. <Link href="/citizenx/host" className="font-semibold text-[#2563EB]">Be the first to host.</Link>
                </div>
              ) : (
                upcomingEvents.map((ev) => (
                  <Link key={ev.id} href={`/citizenx/events/${ev.slug}`}>
                    <div className="group flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4 transition-colors hover:border-blue-300">
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-[#0F172A] group-hover:text-[#2563EB]">{ev.title}</h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#64748B]">
                          <span>{formatEventDate(ev.startsAt)}</span>
                          <span className="text-[#CBD5E1]">·</span>
                          <MapPin className="h-3 w-3" /> <span className="truncate">{ev.location}</span>
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Reveal>

          {/* Active chapters */}
          <Reveal delay={0.1}>
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-2xl font-normal text-[#0F172A] sm:text-3xl">
                Active chapters
              </h2>
              <Link href="/citizenx/organize" className="inline-flex shrink-0 items-center text-sm font-semibold text-[#2563EB] hover:text-blue-700">
                Start one <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
            <div className="mt-6 space-y-3">
              {activeChapters.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
                  No active chapters yet. <Link href="/citizenx/organize" className="font-semibold text-[#2563EB]">Apply to organize the first.</Link>
                </div>
              ) : (
                activeChapters.map((ch) => (
                  <div key={ch.id} className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#16A34A]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-[#0F172A]">{ch.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#64748B]">
                        <MapPin className="h-3 w-3" /> <span className="truncate">{ch.location}</span>
                        <span className="text-[#CBD5E1]">·</span>
                        <span className="truncate">{ch.focus}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-[#0B1120] text-white">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl font-normal leading-tight sm:text-4xl">
              The next great discovery won't come from a single lab.
            </h2>
            <p className="mt-5 text-lg text-white/70">
              It will come from all of us. Join CitizenX and help democratize discovery.
            </p>
            <Link href="/citizenx/organize">
              <span className="btn-metal-blue mt-8 inline-flex items-center rounded-full px-8 py-3 text-sm font-medium">
                Get involved <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
