// One-off bundler for scripts/research-contacts.ts. The api-server logger uses
// a pino-pretty transport that esbuild cannot bundle (esbuild-plugin-pino is
// not an option here: it adds extra inputs, which forbids `outfile`). Instead
// we stub the logger module — the script only uses it for progress lines.
// Run from artifacts/api-server: node scripts/build-research.mjs
import { build } from "esbuild";

const stubLogger = {
  name: "stub-logger",
  setup(b) {
    b.onResolve({ filter: /lib\/logger$/ }, () => ({
      path: "logger-stub",
      namespace: "stub",
    }));
    b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
      contents:
        "export const logger = new Proxy({}, { get: () => (...args) => console.log(...args) });",
      loader: "ts",
    }));
  },
};

await build({
  entryPoints: ["scripts/research-contacts.ts"],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: "/tmp/research-contacts.mjs",
  logLevel: "info",
  external: ["pg-native", "*.node"],
  plugins: [stubLogger],
  banner: {
    js: "import { createRequire as __crr } from 'node:module';\nglobalThis.require = __crr(import.meta.url);",
  },
});
