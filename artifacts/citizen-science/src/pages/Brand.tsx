import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Copy, Check, FileImage, FileCode, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ChannelBannerArtwork, BANNER_W, BANNER_H } from "@/components/ChannelBanner";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  BRAND_COLORS,
  BRAND_FONTS,
  copyText,
  downloadLogoPng,
  downloadLogoSvg,
  downloadPalette,
  type LogoTheme,
  type LogoVariant,
} from "@/lib/brand";

const LOGO_VARIANTS: { variant: LogoVariant; name: string; description: string }[] = [
  {
    variant: "full",
    name: "Full lockup",
    description: "Icon plus wordmark. The default mark — use it almost everywhere.",
  },
  {
    variant: "icon",
    name: "Icon only",
    description: "The atom mark on its own. Use for favicons, avatars, and tight spaces.",
  },
  {
    variant: "wordmark",
    name: "Wordmark only",
    description: "The name set in Inter Semibold. Use when the icon already appears nearby.",
  },
];

function LogoCard({ variant, theme }: { variant: LogoVariant; theme: LogoTheme }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const handlePng = async () => {
    setBusy(true);
    try {
      await downloadLogoPng(variant, theme);
    } catch {
      toast({ title: "Couldn't generate PNG", description: "Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div
        className={cn(
          "flex min-h-[150px] flex-1 items-center justify-center p-8",
          theme === "dark" ? "bg-[#0F172A]" : "bg-[#F8FAFC]",
        )}
      >
        {variant === "full" && <Logo variant="full" theme={theme} className="scale-110" />}
        {variant === "wordmark" && <Logo variant="wordmark" theme={theme} className="text-2xl" />}
        {variant === "icon" && <Logo variant="icon" theme={theme} iconClassName="h-16 w-16" />}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3">
        <span className="text-xs font-medium uppercase tracking-wide text-[#64748B]">
          {theme === "dark" ? "On dark" : "On light"}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-[#E2E8F0] text-xs"
            onClick={() => downloadLogoSvg(variant, theme)}
            data-testid={`download-svg-${variant}-${theme}`}
          >
            <FileCode className="h-3.5 w-3.5" />
            SVG
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-[#E2E8F0] text-xs"
            onClick={handlePng}
            disabled={busy}
            data-testid={`download-png-${variant}-${theme}`}
          >
            <FileImage className="h-3.5 w-3.5" />
            PNG
          </Button>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(hex);
    if (ok) {
      setCopied(true);
      toast({ title: `Copied ${hex}`, description: `${name} hex copied to clipboard.` });
      window.setTimeout(() => setCopied(false), 1500);
    } else {
      toast({ title: "Couldn't copy", description: "Copy the hex manually instead." });
    }
  };

  const isLight = ["#F8FAFC", "#E2E8F0"].includes(hex.toUpperCase());

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white text-left transition-shadow hover:shadow-md"
      data-testid={`color-swatch-${hex.replace("#", "")}`}
    >
      <div
        className="relative flex h-24 items-end justify-end p-3"
        style={{ backgroundColor: hex }}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100",
            isLight ? "bg-[#0F172A]/5 text-[#0F172A]" : "bg-white/15 text-white",
          )}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </span>
      </div>
      <div className="border-t border-[#E2E8F0] px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#0F172A]">{name}</span>
          <span className="font-mono text-xs uppercase text-[#64748B]">{hex}</span>
        </div>
        <p className="mt-1 text-xs text-[#64748B]">{usage}</p>
      </div>
    </button>
  );
}

function ChannelArtCard() {
  const { toast } = useToast();
  const frameRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const [busy, setBusy] = useState(false);

  // Fit the 2560×1440 artboard to the card width.
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(el.clientWidth / BANNER_W, 1));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleDownload = useCallback(async () => {
    const node = artboardRef.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      // Ensure webfonts are loaded before rasterizing.
      await Promise.all([
        document.fonts.load(`400 104px 'Instrument Serif'`),
        document.fonts.load(`italic 400 104px 'Instrument Serif'`),
        document.fonts.load(`600 42px Inter`),
        document.fonts.load(`400 27px Inter`),
      ]);
      await document.fonts.ready;

      const dataUrl = await toPng(node, {
        canvasWidth: BANNER_W,
        canvasHeight: BANNER_H,
        pixelRatio: 1,
        style: { transform: "none", transformOrigin: "top left" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "citizen-science-youtube-banner-2560x1440.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast({ title: "Couldn't generate PNG", description: "Please try again." });
    } finally {
      setBusy(false);
    }
  }, [busy, toast]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
      <div ref={frameRef} className="w-full bg-[#0B1120]">
        <div style={{ width: "100%", height: BANNER_H * scale, overflow: "hidden" }}>
          <div
            style={{
              width: BANNER_W,
              height: BANNER_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div ref={artboardRef}>
              <ChannelBannerArtwork />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#E2E8F0] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-sm font-semibold text-[#0F172A]">YouTube channel banner</span>
          <p className="text-xs text-[#64748B]">
            2560 × 1440 — critical content sits in the center safe area, so it stays visible on
            every device crop. Upload as-is in YouTube Studio.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 shrink-0 gap-1.5 border-[#E2E8F0] text-xs"
          onClick={handleDownload}
          disabled={busy}
          data-testid="download-youtube-banner"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileImage className="h-3.5 w-3.5" />}
          {busy ? "Rendering…" : "PNG · 2560 × 1440"}
        </Button>
      </div>
    </div>
  );
}

export default function Brand() {
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
        {/* HERO */}
        <section className="border-b border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-24">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600 mb-3">Brand</p>
            <h1 className="text-4xl lg:text-6xl font-serif tracking-tight leading-[1.05] mb-5">
              Citizen Science <span className="italic text-blue-600">brand guidelines</span>
            </h1>
            <p className="max-w-2xl text-lg text-[#64748B] leading-relaxed">
              One source of truth for our identity — the logo in every version, our color
              palette, and the type that carries our voice. Download what you need and keep the
              brand consistent everywhere it appears.
            </p>
          </div>
        </section>

        {/* LOGOS */}
        <section className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">Logo</h2>
            <p className="text-[#64748B] max-w-2xl">
              The atom mark and the "Citizen Science" wordmark. Keep clear space around the
              logo, never recolor it, and choose the light or dark treatment that fits the
              background.
            </p>
          </div>

          <div className="space-y-12">
            {LOGO_VARIANTS.map(({ variant, name, description }) => (
              <div key={variant}>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-sm text-[#64748B]">{description}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <LogoCard variant={variant} theme="light" />
                  <LogoCard variant={variant} theme="dark" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHANNEL ART */}
        <section className="border-t border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
            <div className="mb-10">
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">Channel art</h2>
              <p className="text-[#64748B] max-w-2xl">
                Ready-made artwork for our channels, exported at full resolution with the
                brand's night-sky orbit motif.
              </p>
            </div>
            <ChannelArtCard />
          </div>
        </section>

        {/* COLORS */}
        <section className="border-y border-[#E2E8F0] bg-white">
          <div className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">Colors</h2>
                <p className="text-[#64748B] max-w-2xl">
                  Science Blue leads, balanced by a calm canvas and ink. Click any swatch to copy
                  its hex.
                </p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-[#E2E8F0] shrink-0"
                onClick={downloadPalette}
                data-testid="download-palette"
              >
                <Download className="h-4 w-4" />
                Download palette
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {BRAND_COLORS.map((color) => (
                <ColorSwatch key={color.hex} {...color} />
              ))}
            </div>
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section className="container mx-auto max-w-5xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="mb-10">
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-2">Typography</h2>
            <p className="text-[#64748B] max-w-2xl">
              An editorial serif for headline moments, paired with a clean sans for everything
              else. Both load from Google Fonts.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Instrument Serif */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Headlines
                </span>
                <span className="text-xs text-[#64748B]">{BRAND_FONTS[0].weights}</span>
              </div>
              <p className="font-serif text-6xl leading-none mb-4">Aa</p>
              <p className="font-serif text-3xl tracking-tight leading-tight mb-2">
                {BRAND_FONTS[0].family}
              </p>
              <p className="font-serif text-xl italic text-[#64748B] mb-6">
                Curiosity, measured.
              </p>
              <p className="text-sm text-[#64748B] leading-relaxed">{BRAND_FONTS[0].usage}</p>
            </div>

            {/* Inter */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium uppercase tracking-wide text-blue-600">
                  Body &amp; UI
                </span>
                <span className="text-xs text-[#64748B]">{BRAND_FONTS[1].weights}</span>
              </div>
              <p className="font-sans text-6xl font-semibold leading-none mb-4 tracking-tight">Aa</p>
              <p className="font-sans text-3xl font-semibold tracking-tight leading-tight mb-2">
                {BRAND_FONTS[1].family}
              </p>
              <div className="mb-6 space-y-1">
                <p className="font-sans text-base font-normal">Regular — the quick brown fox.</p>
                <p className="font-sans text-base font-medium">Medium — the quick brown fox.</p>
                <p className="font-sans text-base font-semibold">Semibold — the quick brown fox.</p>
              </div>
              <p className="text-sm text-[#64748B] leading-relaxed">{BRAND_FONTS[1].usage}</p>
            </div>
          </div>
        </section>
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
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Citizen Science.
          </div>
        </div>
      </footer>
    </div>
  );
}
