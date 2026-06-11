import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Program", href: "/citizenx" },
  { label: "Organize", href: "/citizenx/organize" },
  { label: "Host", href: "/citizenx/host" },
  { label: "Publish", href: "/citizenx/publish" },
  { label: "Gallery", href: "/citizenx/experiments" },
];

export function CitizenXNav() {
  const [location] = useLocation();
  return (
    <div className="sticky top-14 z-30 border-b border-[#E2E8F0] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 sm:px-6">
        {TABS.map((tab) => {
          const active =
            tab.href === "/citizenx"
              ? location === "/citizenx"
              : location.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-[#2563EB]"
                  : "text-[#64748B] hover:text-[#0F172A]",
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#2563EB]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
