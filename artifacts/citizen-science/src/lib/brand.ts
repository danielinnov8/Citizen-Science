export type LogoVariant = "full" | "icon" | "wordmark";
export type LogoTheme = "light" | "dark";

export type BrandColor = {
  name: string;
  hex: string;
  usage: string;
};

export type BrandFont = {
  role: string;
  family: string;
  cssVar: string;
  usage: string;
  weights: string;
};

const BLUE = "#2563EB";
const INK = "#0F172A";
const WHITE = "#FFFFFF";

export const BRAND_COLORS: BrandColor[] = [
  { name: "Canvas", hex: "#F8FAFC", usage: "Page & app background" },
  { name: "Ink", hex: "#0F172A", usage: "Primary text & dark surfaces" },
  { name: "Science Blue", hex: "#2563EB", usage: "Primary brand & actions" },
  { name: "Growth Green", hex: "#16A34A", usage: "Success & life sciences" },
  { name: "Discovery Violet", hex: "#7C3AED", usage: "Accents & chemistry" },
  { name: "Slate", hex: "#64748B", usage: "Muted & secondary text" },
  { name: "Border", hex: "#E2E8F0", usage: "Borders & dividers" },
];

export const BRAND_FONTS: BrandFont[] = [
  {
    role: "Headlines",
    family: "Instrument Serif",
    cssVar: "--app-font-serif",
    usage: "Hero headlines and large display moments. Use sparingly for impact.",
    weights: "Regular · Italic",
  },
  {
    role: "Body & UI",
    family: "Inter",
    cssVar: "--app-font-sans",
    usage: "Everything else — body copy, labels, buttons, and the wordmark.",
    weights: "Regular 400 · Medium 500 · Semibold 600 · Bold 700",
  },
];

export const ATOM_PATHS = {
  ring1:
    "M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z",
  ring2:
    "M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z",
};

const ATOM_VIEW = 24;
const FONT_STACK = "Inter, -apple-system, 'Segoe UI', Roboto, sans-serif";

function iconMarkSvg(size: number): string {
  const rx = +(size * 0.22).toFixed(2);
  const inner = size * 0.5;
  const pad = +((size - inner) / 2).toFixed(2);
  const scale = +(inner / ATOM_VIEW).toFixed(4);
  return `<rect width="${size}" height="${size}" rx="${rx}" fill="${BLUE}"/>
  <g transform="translate(${pad} ${pad}) scale(${scale})" fill="none" stroke="${WHITE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${ATOM_PATHS.ring1}"/>
    <path d="${ATOM_PATHS.ring2}"/>
    <circle cx="12" cy="12" r="1.6" fill="${WHITE}" stroke="none"/>
  </g>`;
}

export function buildLogoSvg(variant: LogoVariant, theme: LogoTheme): string {
  const textColor = theme === "dark" ? WHITE : INK;
  const fontAttrs = `font-family="${FONT_STACK}" font-weight="600"`;

  if (variant === "icon") {
    const size = 128;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Citizen Science icon">
  ${iconMarkSvg(size)}
</svg>`;
  }

  if (variant === "wordmark") {
    const w = 380;
    const h = 72;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Citizen Science wordmark">
  <text x="0" y="${h / 2}" dominant-baseline="central" ${fontAttrs} font-size="40" letter-spacing="-1" fill="${textColor}">Citizen Science</text>
</svg>`;
  }

  const h = 72;
  const iconSize = 56;
  const iconY = +((h - iconSize) / 2).toFixed(2);
  const textX = iconSize + 18;
  const w = 430;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Citizen Science logo">
  <g transform="translate(0 ${iconY})">
    ${iconMarkSvg(iconSize)}
  </g>
  <text x="${textX}" y="${h / 2}" dominant-baseline="central" ${fontAttrs} font-size="36" letter-spacing="-0.8" fill="${textColor}">Citizen Science</text>
</svg>`;
}

async function ensureInterLoaded(): Promise<void> {
  try {
    if (typeof document !== "undefined" && document.fonts && document.fonts.load) {
      await Promise.all([document.fonts.load("600 40px Inter"), document.fonts.load("600 36px Inter")]);
      await document.fonts.ready;
    }
  } catch {
    // Fall back to whatever the browser has available.
  }
}

function drawIconToCtx(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const rx = size * 0.22;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, rx);
  ctx.fillStyle = BLUE;
  ctx.fill();

  const inner = size * 0.5;
  const pad = (size - inner) / 2;
  const s = inner / ATOM_VIEW;
  ctx.save();
  ctx.translate(x + pad, y + pad);
  ctx.scale(s, s);
  ctx.strokeStyle = WHITE;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(ATOM_PATHS.ring1));
  ctx.stroke(new Path2D(ATOM_PATHS.ring2));
  ctx.fillStyle = WHITE;
  const dot = new Path2D();
  dot.arc(12, 12, 1.6, 0, Math.PI * 2);
  ctx.fill(dot);
  ctx.restore();
}

export async function buildLogoPng(variant: LogoVariant, theme: LogoTheme, scale = 4): Promise<Blob> {
  await ensureInterLoaded();

  let w: number;
  let h: number;
  if (variant === "icon") {
    w = 128;
    h = 128;
  } else if (variant === "wordmark") {
    w = 380;
    h = 72;
  } else {
    w = 430;
    h = 72;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.scale(scale, scale);

  const textColor = theme === "dark" ? WHITE : INK;

  if (variant === "icon") {
    drawIconToCtx(ctx, 0, 0, 128);
  } else if (variant === "wordmark") {
    ctx.fillStyle = textColor;
    ctx.font = `600 40px ${FONT_STACK}`;
    ctx.textBaseline = "middle";
    ctx.fillText("Citizen Science", 0, h / 2 + 1);
  } else {
    const iconSize = 56;
    drawIconToCtx(ctx, 0, (h - iconSize) / 2, iconSize);
    ctx.fillStyle = textColor;
    ctx.font = `600 36px ${FONT_STACK}`;
    ctx.textBaseline = "middle";
    ctx.fillText("Citizen Science", iconSize + 18, h / 2 + 1);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Failed to render PNG"))), "image/png");
  });
}

export function logoFileName(variant: LogoVariant, theme: LogoTheme, ext: "svg" | "png"): string {
  const v = variant === "full" ? "lockup" : variant;
  if (variant === "icon") return `citizen-science-icon.${ext}`;
  return `citizen-science-${v}-${theme}.${ext}`;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadLogoSvg(variant: LogoVariant, theme: LogoTheme): void {
  const svg = buildLogoSvg(variant, theme);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, logoFileName(variant, theme, "svg"));
}

export async function downloadLogoPng(variant: LogoVariant, theme: LogoTheme): Promise<void> {
  const blob = await buildLogoPng(variant, theme);
  triggerDownload(blob, logoFileName(variant, theme, "png"));
}

export function downloadPalette(): void {
  const data = {
    name: "Citizen Science",
    description: "Brand color palette",
    updated: new Date().toISOString().slice(0, 10),
    colors: BRAND_COLORS.map(({ name, hex, usage }) => ({ name, hex, usage })),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, "citizen-science-palette.json");
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
