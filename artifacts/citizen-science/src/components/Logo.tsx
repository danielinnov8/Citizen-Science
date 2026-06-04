import * as React from "react";
import { cn } from "@/lib/utils";
import { ATOM_PATHS, type LogoTheme, type LogoVariant } from "@/lib/brand";

function AtomGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={ATOM_PATHS.ring1} />
      <path d={ATOM_PATHS.ring2} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm",
        className,
      )}
    >
      <AtomGlyph className="h-[62%] w-[62%]" />
    </span>
  );
}

type LogoProps = {
  variant?: LogoVariant;
  theme?: LogoTheme;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

export function Logo({
  variant = "full",
  theme = "light",
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  const textColor = theme === "dark" ? "text-white" : "text-[#0F172A]";

  if (variant === "icon") {
    return <LogoIcon className={cn("h-8 w-8", iconClassName, className)} />;
  }

  if (variant === "wordmark") {
    return (
      <span
        className={cn("font-semibold text-lg tracking-tight", textColor, textClassName, className)}
      >
        Citizen Science
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon className={cn("h-8 w-8", iconClassName)} />
      <span className={cn("font-semibold text-lg tracking-tight", textColor, textClassName)}>
        Citizen Science
      </span>
    </span>
  );
}
