import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import * as THREE from "three";
import earthColorUrl from "@assets/textures/earth_color.jpg";
import earthSpecularUrl from "@assets/textures/earth_specular.jpg";

/* ------------------------------------------------------------------ */
/* Data: a spread of real cities + a network of connections between    */
/* them. Coordinates are [latitude, longitude] in degrees.             */
/* ------------------------------------------------------------------ */

interface City {
  name: string;
  lat: number;
  lng: number;
}

const CITIES: City[] = [
  { name: "San Francisco", lat: 37.77, lng: -122.42 }, // 0
  { name: "New York", lat: 40.71, lng: -74.0 }, // 1
  { name: "London", lat: 51.51, lng: -0.13 }, // 2
  { name: "Lagos", lat: 6.52, lng: 3.38 }, // 3
  { name: "Nairobi", lat: -1.29, lng: 36.82 }, // 4
  { name: "Cairo", lat: 30.04, lng: 31.24 }, // 5
  { name: "Mumbai", lat: 19.08, lng: 72.88 }, // 6
  { name: "Singapore", lat: 1.35, lng: 103.82 }, // 7
  { name: "Tokyo", lat: 35.68, lng: 139.69 }, // 8
  { name: "Sydney", lat: -33.87, lng: 151.21 }, // 9
  { name: "São Paulo", lat: -23.55, lng: -46.63 }, // 10
  { name: "Mexico City", lat: 19.43, lng: -99.13 }, // 11
  { name: "Berlin", lat: 52.52, lng: 13.4 }, // 12
  { name: "Moscow", lat: 55.75, lng: 37.62 }, // 13
  { name: "Toronto", lat: 43.65, lng: -79.38 }, // 14
  { name: "Cape Town", lat: -33.92, lng: 18.42 }, // 15
  { name: "Beijing", lat: 39.9, lng: 116.4 }, // 16
  { name: "Dubai", lat: 25.2, lng: 55.27 }, // 17
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 12],
  [12, 13],
  [13, 16],
  [16, 8],
  [8, 7],
  [7, 6],
  [6, 17],
  [17, 5],
  [5, 2],
  [2, 3],
  [3, 4],
  [4, 15],
  [15, 9],
  [9, 8],
  [1, 14],
  [14, 0],
  [0, 11],
  [11, 10],
  [10, 15],
  [1, 10],
  [2, 5],
  [6, 7],
  [13, 6],
  [16, 7],
  [0, 8],
  [12, 5],
];

const R = 1.5; // globe radius
const ARC_SEG = 72;

/* ------------------------------------------------------------------ */
/* Math helpers                                                        */
/* ------------------------------------------------------------------ */

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

// Spherical linear interpolation between two unit vectors.
function slerpUnit(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a.clone();
  const sin = Math.sin(omega);
  return a
    .clone()
    .multiplyScalar(Math.sin((1 - t) * omega) / sin)
    .add(b.clone().multiplyScalar(Math.sin(t * omega) / sin));
}

/* ------------------------------------------------------------------ */
/* Scene construction                                                  */
/* ------------------------------------------------------------------ */

interface ArcInfo {
  line: THREE.Line;
  count: number;
  phase: number;
  dur: number;
  points: THREE.Vector3[];
  pulse: THREE.Mesh;
}

interface BuiltScene {
  group: THREE.Group;
  arcs: ArcInfo[];
  nodes: THREE.Mesh[];
}

function buildGrid(): THREE.Group {
  const grid = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color("#7eb0ff"),
    transparent: true,
    opacity: 0.1,
  });

  // Meridians (lines of constant longitude).
  for (let lng = -180; lng < 180; lng += 30) {
    const pts: THREE.Vector3[] = [];
    for (let lat = -90; lat <= 90; lat += 4) {
      pts.push(latLngToVec3(lat, lng, R));
    }
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }

  // Parallels (lines of constant latitude).
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: THREE.Vector3[] = [];
    for (let lng = -180; lng <= 180; lng += 4) {
      pts.push(latLngToVec3(lat, lng, R));
    }
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  return grid;
}

function buildScene(): BuiltScene {
  const group = new THREE.Group();

  // Photorealistic Earth: equirectangular color map + specular map so the
  // oceans catch light and the continents read clearly. Shaded via the lights
  // added in the scene component.
  const loader = new THREE.TextureLoader();
  const colorMap = loader.load(earthColorUrl);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 8;
  const specularMap = loader.load(earthSpecularUrl);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(R * 0.99, 96, 96),
    new THREE.MeshPhongMaterial({
      map: colorMap,
      specularMap,
      specular: new THREE.Color("#2b3a55"),
      shininess: 18,
      emissive: new THREE.Color("#0a1830"),
      emissiveIntensity: 0.35,
    }),
  );
  group.add(earth);

  // Soft atmosphere halo (slightly larger, back-side rendered).
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(R * 1.08, 64, 64),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#3b82f6"),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    }),
  );
  group.add(halo);

  group.add(buildGrid());

  // City nodes.
  const nodes: THREE.Mesh[] = [];
  const nodeGeo = new THREE.SphereGeometry(0.016, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#7dd3fc"),
  });
  const ringGeo = new THREE.RingGeometry(0.03, 0.045, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#38bdf8"),
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  for (const c of CITIES) {
    const p = latLngToVec3(c.lat, c.lng, R * 1.005);
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(p);
    group.add(node);
    nodes.push(node);

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(p);
    ring.lookAt(0, 0, 0);
    group.add(ring);
  }

  // Connection arcs (great-circle curves bowing above the surface).
  const arcs: ArcInfo[] = [];
  const colA = new THREE.Color("#38bdf8"); // cyan-blue
  const colB = new THREE.Color("#a855f7"); // violet
  const pulseGeo = new THREE.SphereGeometry(0.022, 10, 10);

  EDGES.forEach(([i, j], idx) => {
    const a = latLngToVec3(CITIES[i].lat, CITIES[i].lng, R).normalize();
    const b = latLngToVec3(CITIES[j].lat, CITIES[j].lng, R).normalize();

    const positions = new Float32Array((ARC_SEG + 1) * 3);
    const colors = new Float32Array((ARC_SEG + 1) * 3);
    const points: THREE.Vector3[] = [];
    const tmp = new THREE.Color();

    for (let s = 0; s <= ARC_SEG; s++) {
      const t = s / ARC_SEG;
      const dir = slerpUnit(a, b, t);
      const alt = 1 + 0.32 * Math.sin(Math.PI * t);
      const v = dir.multiplyScalar(R * alt);
      positions[s * 3] = v.x;
      positions[s * 3 + 1] = v.y;
      positions[s * 3 + 2] = v.z;
      tmp.copy(colA).lerp(colB, t);
      colors[s * 3] = tmp.r;
      colors[s * 3 + 1] = tmp.g;
      colors[s * 3 + 2] = tmp.b;
      points.push(v);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setDrawRange(0, 0);

    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      }),
    );
    group.add(line);

    const pulse = new THREE.Mesh(
      pulseGeo,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#e0f2fe"),
        transparent: true,
        opacity: 0,
      }),
    );
    pulse.position.copy(points[0]);
    group.add(pulse);

    arcs.push({
      line,
      count: ARC_SEG + 1,
      phase: (idx / EDGES.length) * 0.55,
      dur: 0.4,
      points,
      pulse,
    });
  });

  return { group, arcs, nodes };
}

/* ------------------------------------------------------------------ */
/* R3F scene component                                                 */
/* ------------------------------------------------------------------ */

function GlobeScene({ progress }: { progress: MotionValue<number> }) {
  const built = useMemo(buildScene, []);
  const pRef = useRef(progress.get());

  useEffect(() => {
    pRef.current = progress.get();
    const unsub = progress.on("change", (v) => {
      pRef.current = v;
    });
    return () => unsub();
  }, [progress]);

  useEffect(() => {
    // Dispose GPU resources on unmount.
    const group = built.group;
    return () => {
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh | THREE.Line;
        const geom = (mesh as THREE.Mesh).geometry;
        if (geom) geom.dispose();
        const mat = (mesh as THREE.Mesh).material;
        const mats = Array.isArray(mat) ? mat : mat ? [mat] : [];
        for (const m of mats) {
          const phong = m as THREE.MeshPhongMaterial;
          phong.map?.dispose();
          phong.specularMap?.dispose();
          m.dispose();
        }
      });
    };
  }, [built]);

  useFrame((state: RootState, delta: number) => {
    const p = THREE.MathUtils.clamp(pRef.current, 0, 1);
    const t = state.clock.elapsedTime;

    // Auto-spin plus scroll-driven rotation and tilt.
    built.group.rotation.y = t * 0.045 + p * Math.PI * 1.9;
    built.group.rotation.x = -0.32 + Math.sin(p * Math.PI) * 0.18;

    // Gentle camera dolly so it feels like you're moving in as you scroll.
    const cam = state.camera;
    cam.position.z += (THREE.MathUtils.lerp(4.9, 3.7, p) - cam.position.z) * Math.min(1, delta * 4);
    cam.lookAt(0, 0, 0);

    // Reveal arcs progressively and run a light pulse once an arc is drawn.
    for (const arc of built.arcs) {
      const frac = THREE.MathUtils.clamp((p - arc.phase) / arc.dur, 0, 1);
      arc.line.geometry.setDrawRange(0, Math.ceil(frac * (arc.count - 1)) + 1);
      const lineMat = arc.line.material as THREE.LineBasicMaterial;
      lineMat.opacity = 0.25 + 0.65 * frac;

      const pulseMat = arc.pulse.material as THREE.MeshBasicMaterial;
      if (frac >= 1) {
        const u = (t * 0.18 + arc.phase * 3) % 1;
        const idx = Math.floor(u * (arc.points.length - 1));
        arc.pulse.position.copy(arc.points[idx]);
        pulseMat.opacity = 0.9;
      } else {
        pulseMat.opacity = 0;
      }
    }

    // Twinkle the city nodes.
    const s = 1 + Math.sin(t * 2) * 0.12;
    for (const node of built.nodes) node.scale.setScalar(s);
  });

  return (
    <>
      <ambientLight intensity={0.55} color="#9db8ff" />
      <directionalLight position={[5, 3, 5]} intensity={2.1} color="#fff6e8" />
      <directionalLight position={[-6, -2, -4]} intensity={0.35} color="#3b6fe0" />
      <primitive object={built.group} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* WebGL fallback (some browsers / headless previews lack a context)   */
/* ------------------------------------------------------------------ */

class WebGLBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function GlobeFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]">
        <div className="absolute inset-0 animate-spin rounded-full border border-blue-400/30 [animation-duration:40s]" />
        <div className="absolute inset-0 animate-spin rounded-full border border-blue-400/20 [animation-duration:55s] [transform:rotateX(70deg)]" />
        <div className="absolute inset-0 animate-spin rounded-full border border-violet-400/20 [animation-duration:48s] [transform:rotateY(70deg)]" />
        <div className="absolute inset-[28%] rounded-full bg-blue-600/10 blur-2xl" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public section component                                            */
/* ------------------------------------------------------------------ */

export function NetworkGlobe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const cap1 = useTransform(scrollYProgress, [0.04, 0.16, 0.3, 0.38], [0, 1, 1, 0]);
  const cap2 = useTransform(scrollYProgress, [0.38, 0.5, 0.62, 0.7], [0, 1, 1, 0]);
  const cap3 = useTransform(scrollYProgress, [0.7, 0.82, 0.95, 1], [0, 1, 1, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  return (
    <section ref={wrapRef} className="relative bg-[#0B1120]" style={{ height: "300vh" }}>
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        {/* Ambient glow behind the canvas */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-700/20 blur-[140px]" />
          <div className="absolute right-1/4 top-1/3 h-[360px] w-[360px] rounded-full bg-violet-600/15 blur-[150px]" />
        </div>

        {/* Heading overlay */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-300/80">
            Global Network
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-normal leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            A planet wired for discovery
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300/80 sm:text-base">
            Every city a node. Every connection a shared question. Scroll to see
            the research network come alive.
          </p>
        </div>

        {/* The globe */}
        <WebGLBoundary fallback={<GlobeFallback />}>
          <Canvas
            className="!absolute inset-0"
            camera={{ position: [0, 0, 4.9], fov: 42 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <GlobeScene progress={scrollYProgress} />
          </Canvas>
        </WebGLBoundary>

        {/* Scroll-reactive captions */}
        <div className="pointer-events-none absolute bottom-16 left-0 right-0 z-20 flex items-center justify-center px-6">
          <div className="relative h-20 w-full max-w-md text-center">
            <motion.div style={{ opacity: cap1 }} className="absolute inset-0">
              <p className="font-serif text-3xl text-white sm:text-4xl">190+ countries</p>
              <p className="mt-2 text-sm text-slate-400">connected on one grid</p>
            </motion.div>
            <motion.div style={{ opacity: cap2 }} className="absolute inset-0">
              <p className="font-serif text-3xl text-white sm:text-4xl">10,000+ communities</p>
              <p className="mt-2 text-sm text-slate-400">contributing observations</p>
            </motion.div>
            <motion.div style={{ opacity: cap3 }} className="absolute inset-0">
              <p className="font-serif text-3xl text-white sm:text-4xl">One shared dataset</p>
              <p className="mt-2 text-sm text-slate-400">built by all of humanity</p>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-slate-400"
        >
          Scroll to explore ↓
        </motion.div>
      </div>

      {/* Seamless hand-off: bleed the blue/violet of the section below up into
          the bottom of the planet so there is no hard seam between them. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[55vh] bg-[linear-gradient(to_top,#0B1120_0%,rgba(30,58,138,0.35)_28%,rgba(76,29,149,0.16)_55%,transparent_100%)]" />
    </section>
  );
}
