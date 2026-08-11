import React, { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * YouTube channel banner mockup for Citizen Science.
 *
 * NOTE: the artwork is mirrored in the web app at
 * artifacts/citizen-science/src/components/ChannelBanner.tsx (shown on /brand).
 * Keep both in sync when changing the design.
 *
 * Artboard is the YouTube-recommended 2560×1440. All critical content lives
 * inside the 1546×423 center "safe area" so the banner reads correctly on TV,
 * desktop, tablet, and mobile crops. Background artwork bleeds to the edges.
 */

const W = 2560;
const H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;

const BLUE = "#2563EB";
const INK = "#0F172A";
const NIGHT = "#0B1120";
const GREEN = "#16A34A";
const VIOLET = "#7C3AED";
const GOLD = "#D4AF37";

const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";

// Atom mark paths from the web app's brand module (artifacts/citizen-science/src/lib/brand.ts).
const ATOM_PATHS = {
  ring1:
    "M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z",
  ring2:
    "M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z",
};

function AtomMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: "linear-gradient(135deg, #60A5FA 0%, #2563EB 50%, #1E3A8A 100%)",
        boxShadow:
          "inset 0 1px 1px rgba(255,255,255,0.45), inset 0 -2px 3px rgba(0,0,0,0.25), 0 8px 24px rgba(37,99,235,0.45)",
        outline: `2px solid ${GOLD}`,
        outlineOffset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(to top, transparent, rgba(255,255,255,0) 40%, rgba(255,255,255,0.3))",
        }}
      />
      <svg
        viewBox="0 0 24 24"
        width={size * 0.62}
        height={size * 0.62}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: "relative" }}
      >
        <path d={ATOM_PATHS.ring1} />
        <path d={ATOM_PATHS.ring2} />
        <circle cx="12" cy="12" r="1.6" fill="#FFFFFF" stroke="none" />
      </svg>
    </div>
  );
}

/** Decorative orbit system that bleeds past the artboard edges. */
function OrbitField() {
  return (
    <svg
      aria-hidden
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="glowBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.55" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowViolet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.45" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </radialGradient>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Ambient glows */}
      <ellipse cx={430} cy={240} rx={760} ry={620} fill="url(#glowBlue)" />
      <ellipse cx={2260} cy={420} rx={720} ry={580} fill="url(#glowViolet)" />
      <ellipse cx={1240} cy={1470} rx={880} ry={560} fill="url(#glowGreen)" />

      {/* Grid texture */}
      <rect width={W} height={H} fill="url(#grid)" />

      {/* Large orbit system, bottom-left — bleeds off the canvas */}
      <g transform={`translate(150 1330)`} stroke="#FFFFFF" fill="none">
        <circle r={240} strokeOpacity="0.14" strokeWidth="2" />
        <circle r={420} strokeOpacity="0.1" strokeWidth="2" />
        <circle r={620} strokeOpacity="0.07" strokeWidth="2" />
        <ellipse rx={700} ry={240} strokeOpacity="0.16" strokeWidth="2" transform="rotate(-18)" />
        <ellipse rx={700} ry={240} strokeOpacity="0.12" strokeWidth="2" transform="rotate(24)" />
        {/* electrons */}
        <g transform="rotate(-18)">
          <circle cx={700} cy={0} r={10} fill={BLUE} stroke="none" />
        </g>
        <g transform="rotate(24)">
          <circle cx={-700} cy={0} r={8} fill={VIOLET} stroke="none" />
        </g>
        <circle cx={0} cy={-420} r={7} fill={GREEN} stroke="none" />
      </g>

      {/* Companion orbit system, top-right */}
      <g transform={`translate(2450 -60)`} stroke="#FFFFFF" fill="none">
        <circle r={200} strokeOpacity="0.14" strokeWidth="2" />
        <circle r={380} strokeOpacity="0.1" strokeWidth="2" />
        <circle r={580} strokeOpacity="0.07" strokeWidth="2" />
        <ellipse rx={640} ry={210} strokeOpacity="0.15" strokeWidth="2" transform="rotate(14)" />
        <ellipse rx={640} ry={210} strokeOpacity="0.1" strokeWidth="2" transform="rotate(-30)" />
        <g transform="rotate(14)">
          <circle cx={-640} cy={0} r={9} fill={VIOLET} stroke="none" />
        </g>
        <g transform="rotate(-30)">
          <circle cx={640} cy={0} r={7} fill={GREEN} stroke="none" />
        </g>
      </g>

      {/* Scattered star field */}
      {[
        [320, 560, 3], [520, 980, 2.5], [760, 180, 3], [980, 1140, 2.5],
        [1560, 120, 3], [1760, 1290, 2.5], [1980, 900, 3], [2160, 1180, 2.5],
        [2360, 760, 3], [1180, 60, 2.5], [140, 1160, 3], [2070, 240, 2.5],
      ].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity={0.35} />
      ))}
    </svg>
  );
}

function BannerArtwork({ showGuides }: { showGuides: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        background: NIGHT,
        overflow: "hidden",
        fontFamily: SANS,
        flexShrink: 0,
      }}
    >
      <OrbitField />

      {/* Vignette to keep edges deep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 30%, ${NIGHT} 88%)`,
          pointerEvents: "none",
        }}
      />

      {/* Safe-area content lockup */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: SAFE_W,
          height: SAFE_H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <AtomMark size={64} />
          <span
            style={{
              color: "#FFFFFF",
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 42,
              letterSpacing: "-0.02em",
            }}
          >
            Citizen Science
          </span>
        </div>

        <div
          style={{
            marginTop: 30,
            color: "#FFFFFF",
            fontFamily: SERIF,
            fontSize: 104,
            lineHeight: 1.02,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          Humanity's <span style={{ fontStyle: "italic", color: "#60A5FA" }}>Discovery</span> Network
        </div>

        <div
          style={{
            marginTop: 26,
            color: "rgba(255,255,255,0.62)",
            fontFamily: SANS,
            fontSize: 27,
            fontWeight: 400,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            gap: 18,
            whiteSpace: "nowrap",
          }}
        >
          <span>Learn from the greatest minds in history</span>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.3)" }} />
          <span>Run real experiments</span>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.3)" }} />
          <span>AI science copilot</span>
        </div>
      </div>

      {/* Safe-area overlay guides (design-time only, excluded from export) */}
      {showGuides && (
        <div data-export-exclude style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {/* Dim everything outside the safe area */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: SAFE_W,
              height: SAFE_H,
              boxShadow: `0 0 0 9999px rgba(11,17,32,0.45)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: SAFE_W,
              height: SAFE_H,
              border: "3px dashed #22D3EE",
              boxSizing: "border-box",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -34,
                left: 0,
                color: "#22D3EE",
                fontFamily: SANS,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Safe area · 1546 × 423 — visible on all devices
            </span>
            <span
              style={{
                position: "absolute",
                bottom: -34,
                right: 0,
                color: "rgba(34,211,238,0.7)",
                fontFamily: SANS,
                fontSize: 20,
              }}
            >
              Full canvas 2560 × 1440
            </span>
          </div>
          {/* Center crosshair */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 1,
              background: "rgba(34,211,238,0.25)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background: "rgba(34,211,238,0.25)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function YouTubeBanner() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [showGuides, setShowGuides] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fit the 2560×1440 artboard to the available stage width.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const pad = 64;
      const availW = Math.max(320, el.clientWidth - pad);
      const availH = Math.max(240, window.innerHeight - 260);
      setScale(Math.min(availW / W, availH / H, 1));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleDownload = useCallback(async () => {
    const node = artboardRef.current;
    if (!node || exporting) return;
    setExporting(true);
    setError(null);
    try {
      // Ensure webfonts are loaded before rasterizing.
      await Promise.all([
        document.fonts.load(`400 104px 'Instrument Serif'`),
        document.fonts.load(`italic 400 104px 'Instrument Serif'`),
        document.fonts.load(`600 42px Inter`),
        document.fonts.load(`400 27px Inter`),
      ]);
      await document.fonts.ready;

      // Export a clean copy without the guides overlay.
      const dataUrl = await toPng(node, {
        canvasWidth: W,
        canvasHeight: H,
        pixelRatio: 1,
        filter: (el) => !(el instanceof HTMLElement && el.dataset.exportExclude !== undefined),
        style: { transform: "none", transformOrigin: "top left" },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "citizen-science-youtube-banner-2560x1440.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  }, [exporting]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white font-sans">
      {/* Page chrome */}
      <div className="border-b border-white/10 bg-[#0B1120]/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">YouTube Channel Banner</h1>
            <p className="text-sm text-white/50">
              2560 × 1440 channel art · content locked to the 1546 × 423 safe area
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGuides((v) => !v)}
              className={cn(
                "gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                showGuides && "border-cyan-400/60 text-cyan-300",
              )}
              data-testid="toggle-guides"
            >
              <Scan className="h-4 w-4" />
              {showGuides ? "Hide safe area" : "Show safe area"}
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={exporting}
              className="gap-2 bg-blue-600 text-white hover:bg-blue-500"
              data-testid="download-png"
            >
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? "Rendering…" : "Download PNG (2560 × 1440)"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            Export failed: {error}
          </p>
        </div>
      )}

      {/* Scaled stage */}
      <div ref={stageRef} className="mx-auto max-w-full px-8 py-8">
        <div
          style={{
            width: W * scale,
            height: H * scale,
            margin: "0 auto",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: W,
              height: H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <div ref={artboardRef}>
              <BannerArtwork showGuides={showGuides} />
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-white/45">
          Shown at {(scale * 100).toFixed(0)}% scale. YouTube crops channel art by device — TVs show the
          full 2560 × 1440, while desktop, tablet, and mobile crop toward the center. Everything inside the
          dashed safe area stays visible everywhere. The PNG export is exactly 2560 × 1440 with guides
          removed, ready to upload in YouTube Studio.
        </p>
      </div>
    </div>
  );
}

export default YouTubeBanner;
