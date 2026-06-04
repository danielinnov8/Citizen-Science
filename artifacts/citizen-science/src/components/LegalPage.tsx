import React, { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

type LegalSection = {
  heading: string;
  body: React.ReactNode;
};

type LegalPageProps = {
  title: string;
  lastUpdated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
};

export function LegalPage({ title, lastUpdated, intro, sections }: LegalPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
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
        <article className="container mx-auto max-w-3xl px-4 lg:px-8 py-16 lg:py-24">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-600 mb-3">Legal</p>
          <h1 className="text-4xl lg:text-5xl font-serif tracking-tight leading-[1.1] mb-4">{title}</h1>
          <p className="text-sm text-[#64748B] mb-10">Last updated {lastUpdated}</p>

          <div className="text-[#334155] leading-relaxed text-[15px] lg:text-base mb-12">{intro}</div>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <section key={i}>
                <h2 className="text-xl lg:text-2xl font-semibold tracking-tight mb-3">{section.heading}</h2>
                <div className="text-[#334155] leading-relaxed text-[15px] lg:text-base space-y-4">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 border-t border-[#E2E8F0] pt-8 flex flex-col sm:flex-row gap-4 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Terms of Service
            </Link>
          </div>
        </article>
      </main>

      <footer className="bg-[#0F172A] text-[#64748B] py-12">
        <div className="container mx-auto max-w-7xl px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo variant="full" theme="dark" />
          <div className="flex gap-6 text-sm">
            <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            <Link href="/brand" className="hover:text-white transition-colors">Brand</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="text-sm text-right">
            &copy; {new Date().getFullYear()} Citizen Science.
            <span className="block md:inline md:ml-2">
              Built by{" "}
              <a
                href="https://ideafactory.agency/danielinnovate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-[#D4AF37] transition-colors"
              >
                Daniel Innov8
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
