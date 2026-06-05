---
name: R3F / WebGL on Replit preview
description: How react-three-fiber behaves in the Replit dev preview and how to keep WebGL scenes from crashing the page.
---

# react-three-fiber / WebGL in the Replit environment

- **R3F `<Canvas>` throws synchronously when WebGL context creation fails.** An
  uncaught throw white-screens the whole page (and trips the runtime-error
  modal in dev). Always wrap a `<Canvas>` in a React error boundary that renders
  a non-WebGL fallback.
  **Why:** robustness for real users whose browser/GPU blocks WebGL, not just
  the preview.
  **How to apply:** a tiny class boundary (`getDerivedStateFromError → fallback`)
  around the Canvas; give the fallback the same section chrome so the layout
  doesn't jump.

- **The headless screenshot/preview browser usually cannot create a WebGL
  context.** Logs show `Error creating WebGL context` or `THREE.WebGLRenderer:
  Context Lost`. The latter is benign (context initialized then torn down during
  HMR/screenshots).
  **Why it matters:** the `screenshot` tool can't visually verify a WebGL scene —
  it will capture the fallback or a blank/lost-context canvas, not the real 3D.
  Don't treat a missing globe in a screenshot as a bug. Verify via typecheck +
  logic review + the error boundary instead, and trust that real browsers render.

- **Passing a Framer Motion `MotionValue` into the R3F tree:** compute
  `useScroll(...)` outside `<Canvas>` and pass `scrollYProgress` as a prop into a
  component rendered inside it. Read it in `useFrame` via a ref updated through
  `progress.on("change", ...)` — do NOT subscribe in a way that triggers React
  re-renders per scroll tick.
  **Why:** context providers above `<Canvas>` are not shared into R3F's separate
  reconciler, and per-frame re-renders kill performance.

- **Manual Three objects mounted via `<primitive>` must be disposed yourself** on
  unmount (traverse, dispose geometries + materials) — R3F only auto-disposes
  objects it created declaratively.
