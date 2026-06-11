import { useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ExternalLink,
  KeyRound,
  Unlock,
  Sparkles,
  Bot,
  Search,
  PlayCircle,
  Film,
  Mic,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";

type CurrentApi = {
  name: string;
  icon: LucideIcon;
  use: string;
  docs: string;
};

const CURRENT_APIS: CurrentApi[] = [
  {
    name: "Google Gemini API",
    icon: Bot,
    use: "Powers the AI science copilot and the structured field-notes analyzer.",
    docs: "https://ai.google.dev/gemini-api/docs",
  },
  {
    name: "Google Search grounding",
    icon: Search,
    use: "Grounds copilot answers in live web results and returns citation sources.",
    docs: "https://ai.google.dev/gemini-api/docs/grounding",
  },
  {
    name: "YouTube Data API v3",
    icon: PlayCircle,
    use: "Finds verified educational videos from a curated, trusted-channel allowlist.",
    docs: "https://developers.google.com/youtube/v3",
  },
  {
    name: "D-ID",
    icon: Film,
    use: "Renders the live talking-avatar video stream for “Talk to a great mind.”",
    docs: "https://docs.d-id.com/",
  },
  {
    name: "ElevenLabs",
    icon: Mic,
    use: "Synthesizes the avatar’s realistic spoken voice for lip-synced replies.",
    docs: "https://elevenlabs.io/docs",
  },
  {
    name: "Google OAuth 2.0",
    icon: ShieldCheck,
    use: "Handles “Continue with Google” sign-in and account linking by email.",
    docs: "https://developers.google.com/identity/protocols/oauth2",
  },
];

type FlagshipApi = {
  name: string;
  provides: string;
  toolIdea: string;
  docs: string;
  keyRequired: boolean;
};

const FLAGSHIP_APIS: FlagshipApi[] = [
  {
    name: "Nobel Prize API",
    provides:
      "Structured data on every Nobel Prize, laureate, category, and motivation since 1901.",
    toolIdea:
      "A “Laureates” explorer that connects prize-winning discoveries to the science categories and great minds already in the app.",
    docs: "https://www.nobelprize.org/about/developer-zone-2/",
    keyRequired: false,
  },
  {
    name: "NASA APIs",
    provides:
      "Astronomy Picture of the Day, Mars rover photos, near-earth objects, and EPIC Earth imagery.",
    toolIdea:
      "A daily space discovery feed and an asteroid-tracking experiment that pulls real NASA data into the astronomy category.",
    docs: "https://api.nasa.gov/",
    keyRequired: true,
  },
];

type Recommendation = {
  name: string;
  provides: string;
  whyItFits: string;
  toolIdea: string;
  docs: string;
  keyRequired: boolean;
};

const RECOMMENDATIONS: Recommendation[] = [
  {
    name: "arXiv API",
    provides: "Open-access research preprints across physics, math, CS, and biology.",
    whyItFits: "Brings the actual frontier of research into a learning product.",
    toolIdea: "A “latest discoveries” feed per science category.",
    docs: "https://info.arxiv.org/help/api/index.html",
    keyRequired: false,
  },
  {
    name: "OpenAlex API",
    provides: "An open scholarly graph of papers, authors, institutions, and citations.",
    whyItFits: "Connects historical figures to their measurable real-world impact.",
    toolIdea: "Link each great mind in the directory to their real publications and citation impact.",
    docs: "https://docs.openalex.org/",
    keyRequired: false,
  },
  {
    name: "PubMed / NCBI E-utilities",
    provides: "The world’s largest index of biomedical and life-sciences literature.",
    whyItFits: "Gives the copilot authoritative grounding for medicine and biology.",
    toolIdea: "A medicine & biology research explorer for the copilot.",
    docs: "https://www.ncbi.nlm.nih.gov/books/NBK25501/",
    keyRequired: false,
  },
  {
    name: "GBIF API",
    provides: "Hundreds of millions of global biodiversity occurrence records.",
    whyItFits: "Turns nature field notes into real, mappable science data.",
    toolIdea: "Map species observations near a user’s field notes.",
    docs: "https://techdocs.gbif.org/en/openapi/",
    keyRequired: false,
  },
  {
    name: "iNaturalist API",
    provides: "Citizen-science species observations and community identifications.",
    whyItFits: "A direct domain fit — this is citizen science in action.",
    toolIdea: "Import and verify species sightings logged in field notes.",
    docs: "https://api.inaturalist.org/v1/docs/",
    keyRequired: false,
  },
  {
    name: "USGS Earthquake API",
    provides: "Real-time global seismic events as GeoJSON feeds.",
    whyItFits: "Makes geology tangible with live, current planetary data.",
    toolIdea: "A live earthquake map and hands-on geology experiments.",
    docs: "https://earthquake.usgs.gov/fdsnws/event/1/",
    keyRequired: false,
  },
  {
    name: "Open-Meteo API",
    provides: "Free global weather and climate data — no API key required.",
    whyItFits: "Adds real environmental context to observations effortlessly.",
    toolIdea: "Auto-attach weather context to field notes and power climate experiments.",
    docs: "https://open-meteo.com/en/docs",
    keyRequired: false,
  },
  {
    name: "PubChem (PUG REST) API",
    provides: "Chemistry data on elements, compounds, structures, and properties.",
    whyItFits: "Unlocks an entire chemistry category with authoritative data.",
    toolIdea: "An interactive periodic table and molecule explorer.",
    docs: "https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest",
    keyRequired: false,
  },
  {
    name: "Wikidata / Wikipedia REST API",
    provides: "Structured world knowledge, sourced facts, and portraits.",
    whyItFits: "Enriches figure profiles and topic pages with cited facts.",
    toolIdea: "Enrich figure profiles and topic pages with sourced facts.",
    docs: "https://www.mediawiki.org/wiki/API:REST_API",
    keyRequired: false,
  },
  {
    name: "CrossRef API",
    provides: "DOI metadata and citation graphs for scholarly works.",
    whyItFits: "Lets the copilot produce trustworthy, linkable references.",
    toolIdea: "Citation lookup and reference cards inside the copilot.",
    docs: "https://api.crossref.org/swagger-ui/index.html",
    keyRequired: false,
  },
];

type HonorableMention = {
  name: string;
  blurb: string;
  docs: string;
};

const HONORABLE_MENTIONS: HonorableMention[] = [
  {
    name: "Open Notify (ISS)",
    blurb: "Live position of the International Space Station.",
    docs: "http://open-notify.org/Open-Notify-API/",
  },
  {
    name: "Our World in Data",
    blurb: "Global statistics on health, climate, and society.",
    docs: "https://docs.owid.io/projects/etl/api/",
  },
  {
    name: "CORE API",
    blurb: "Full-text open-access research papers worldwide.",
    docs: "https://core.ac.uk/services/api",
  },
];

function KeyBadge({ keyRequired }: { keyRequired: boolean }) {
  return keyRequired ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
      <KeyRound className="h-3 w-3" />
      API key
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
      <Unlock className="h-3 w-3" />
      No key
    </span>
  );
}

function DocsLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
    >
      Documentation
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export default function ApiDirectory() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] text-[#0F172A]">
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center">
            <Logo variant="full" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F172A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="border-b border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-24">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-600">
              Data foundation
            </p>
            <h1 className="mb-5 font-serif text-4xl leading-[1.05] tracking-tight lg:text-6xl">
              The APIs behind <span className="italic text-blue-600">Citizen Science</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#64748B]">
              A look at the external APIs powering the platform today — and an opinionated roadmap
              of the open science and data APIs we’d integrate next, each paired with a concrete
              tool we could build around it.
            </p>
          </div>
        </section>

        {/* POWERING THE PLATFORM TODAY */}
        <section className="container mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="mb-10">
            <h2 className="mb-2 text-2xl font-semibold tracking-tight lg:text-3xl">
              Powering the platform today
            </h2>
            <p className="max-w-2xl text-[#64748B]">
              The live integrations the product already relies on to deliver its AI, media, and
              identity features.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CURRENT_APIS.map((api) => {
              const Icon = api.icon;
              return (
                <div
                  key={api.name}
                  className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-base font-semibold">{api.name}</h3>
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-[#64748B]">{api.use}</p>
                  <DocsLink href={api.docs} />
                </div>
              );
            })}
          </div>
        </section>

        {/* SCIENCE DATA WE BUILD TOOLS AROUND */}
        <section className="border-y border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="mb-10">
              <h2 className="mb-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                Science data we build tools around
              </h2>
              <p className="max-w-2xl text-[#64748B]">
                Two flagship open data APIs that map directly onto what the platform teaches.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {FLAGSHIP_APIS.map((api) => (
                <div
                  key={api.name}
                  className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-7"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl tracking-tight">{api.name}</h3>
                    <KeyBadge keyRequired={api.keyRequired} />
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-[#64748B]">{api.provides}</p>
                  <div className="mb-5 rounded-xl border border-[#E2E8F0] bg-white p-4">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600">
                      <Wrench className="h-3.5 w-3.5" />
                      Tool we could build
                    </p>
                    <p className="text-sm leading-relaxed text-[#0F172A]">{api.toolIdea}</p>
                  </div>
                  <div className="mt-auto">
                    <DocsLink href={api.docs} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RECOMMENDED NEXT */}
        <section className="container mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="mb-10">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-violet-600">
              <Sparkles className="h-4 w-4" />
              Roadmap
            </p>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight lg:text-3xl">
              Recommended next: 10 APIs to strengthen the product
            </h2>
            <p className="max-w-2xl text-[#64748B]">
              Real, free or freemium, citizen-science-aligned APIs — each with what it provides,
              why it fits us, and a concrete tool we could build.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {RECOMMENDATIONS.map((api, i) => (
              <div
                key={api.name}
                className="flex flex-col rounded-2xl border border-[#E2E8F0] bg-white p-6"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-semibold text-blue-600">
                      {i + 1}
                    </span>
                    <h3 className="text-base font-semibold leading-tight">{api.name}</h3>
                  </div>
                  <KeyBadge keyRequired={api.keyRequired} />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-[#64748B]">{api.provides}</p>
                <p className="mb-4 text-sm leading-relaxed text-[#0F172A]">
                  <span className="font-medium">Why it fits: </span>
                  {api.whyItFits}
                </p>
                <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-600">
                    <Wrench className="h-3.5 w-3.5" />
                    Tool to build
                  </p>
                  <p className="text-sm leading-relaxed text-[#0F172A]">{api.toolIdea}</p>
                </div>
                <div className="mt-auto">
                  <DocsLink href={api.docs} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* HONORABLE MENTIONS */}
        <section className="border-t border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 py-16 lg:px-8 lg:py-20">
            <div className="mb-8">
              <h2 className="mb-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                Honorable mentions
              </h2>
              <p className="max-w-2xl text-[#64748B]">
                A few extra fun options worth keeping on the radar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {HONORABLE_MENTIONS.map((m) => (
                <a
                  key={m.name}
                  href={m.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 transition-shadow hover:shadow-md"
                >
                  <h3 className="mb-1 flex items-center justify-between gap-2 text-base font-semibold">
                    {m.name}
                    <ExternalLink className="h-3.5 w-3.5 text-[#94A3B8] transition-colors group-hover:text-blue-600" />
                  </h3>
                  <p className="text-sm leading-relaxed text-[#64748B]">{m.blurb}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0F172A] py-12 text-[#64748B]">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row lg:px-8">
          <Logo variant="full" theme="dark" />
          <div className="flex gap-6 text-sm">
            <Link href="/architecture" className="transition-colors hover:text-white">
              Architecture
            </Link>
            <Link href="/brand" className="transition-colors hover:text-white">
              Brand
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
          <div className="text-sm">&copy; {new Date().getFullYear()} Citizen Science.</div>
        </div>
      </footer>
    </div>
  );
}
