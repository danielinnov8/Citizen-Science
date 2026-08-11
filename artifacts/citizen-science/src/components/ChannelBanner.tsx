import React from "react";
import { ATOM_PATHS } from "@/lib/brand";

/**
 * YouTube channel banner artwork for Citizen Science.
 *
 * Kept in sync with the mockup sandbox version
 * (artifacts/mockup-sandbox/src/components/mockups/citizen-science/YouTubeBanner.tsx).
 * Artboard is the YouTube-recommended 2560×1440; all critical content lives
 * inside the 1546×423 center safe area so the banner reads correctly on every
 * device crop.
 */

export const BANNER_W = 2560;
export const BANNER_H = 1440;
const SAFE_W = 1546;
const SAFE_H = 423;

const BLUE = "#2563EB";
const NIGHT = "#0B1120";
const GREEN = "#16A34A";
const VIOLET = "#7C3AED";
const GOLD = "#D4AF37";

const SERIF = "'Instrument Serif', Georgia, serif";
const SANS = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";

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
      width={BANNER_W}
      height={BANNER_H}
      viewBox={`0 0 ${BANNER_W} ${BANNER_H}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <radialGradient id="cs-banner-glowBlue" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.55" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-banner-glowViolet" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={VIOLET} stopOpacity="0.45" />
          <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-banner-glowGreen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.35" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </radialGradient>
        <pattern id="cs-banner-grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M80 0H0V80" fill="none" stroke="#FFFFFF" strokeOpacity="0.06" strokeWidth="1" />
        </pattern>
      </defs>

      {/* Ambient glows */}
      <ellipse cx={430} cy={240} rx={760} ry={620} fill="url(#cs-banner-glowBlue)" />
      <ellipse cx={2260} cy={420} rx={720} ry={580} fill="url(#cs-banner-glowViolet)" />
      <ellipse cx={1240} cy={1470} rx={880} ry={560} fill="url(#cs-banner-glowGreen)" />

      {/* Grid texture */}
      <rect width={BANNER_W} height={BANNER_H} fill="url(#cs-banner-grid)" />

      {/* Large orbit system, bottom-left — bleeds off the canvas */}
      <g transform={`translate(150 1330)`} stroke="#FFFFFF" fill="none">
        <circle r={240} strokeOpacity="0.14" strokeWidth="2" />
        <circle r={420} strokeOpacity="0.1" strokeWidth="2" />
        <circle r={620} strokeOpacity="0.07" strokeWidth="2" />
        <ellipse rx={700} ry={240} strokeOpacity="0.16" strokeWidth="2" transform="rotate(-18)" />
        <ellipse rx={700} ry={240} strokeOpacity="0.12" strokeWidth="2" transform="rotate(24)" />
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

/** The full 2560×1440 banner artwork at natural size. Scale externally to fit. */
export function ChannelBannerArtwork() {
  return (
    <div
      style={{
        position: "relative",
        width: BANNER_W,
        height: BANNER_H,
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
    </div>
  );
}

export default ChannelBannerArtwork;
