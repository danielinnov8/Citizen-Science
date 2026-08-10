// Generates public/sitemap.xml from the static public routes, the category
// list, and every directory figure (featured-profiles.json is the seed source
// of truth for directory slugs). Runs automatically before `vite build`
// (prebuild hook) so the sitemap never goes stale.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://citizen-science.org";
const today = new Date().toISOString().slice(0, 10);

// Static public routes: [path, changefreq, priority]
const STATIC_ROUTES = [
  ["/", "weekly", "1.0"],
  ["/directory", "daily", "0.9"],
  ["/challenges", "weekly", "0.8"],
  ["/categories", "monthly", "0.7"],
  ["/experiments", "weekly", "0.7"],
  ["/mentors", "weekly", "0.7"],
  ["/pricing", "monthly", "0.6"],
  ["/monetize", "monthly", "0.6"],
  ["/citizenx", "monthly", "0.5"],
  ["/brand", "monthly", "0.3"],
  ["/privacy", "yearly", "0.2"],
  ["/terms", "yearly", "0.2"],
];

// Category slugs live in the frontend categories lib (plain `slug: "..."`).
const categoriesSrc = readFileSync(join(root, "src/lib/categories.ts"), "utf8");
const categorySlugs = [...categoriesSrc.matchAll(/slug: "([a-z0-9-]+)"/g)].map(
  (m) => m[1],
);

// Directory figures — one URL per seeded profile. Slugs must be URL-safe
// path segments; skip (loudly) anything that isn't rather than emitting
// invalid XML or a broken URL.
const profiles = JSON.parse(
  readFileSync(
    join(root, "../api-server/src/data/featured-profiles.json"),
    "utf8",
  ),
).filter((p) => {
  const ok = /^[a-z0-9-]+$/.test(p.slug);
  if (!ok) console.warn(`sitemap: skipping non-URL-safe slug "${p.slug}"`);
  return ok;
});

const urls = [
  ...STATIC_ROUTES.map(
    ([path, changefreq, priority]) =>
      `  <url><loc>${ORIGIN}${path}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
  ),
  ...categorySlugs.map(
    (slug) =>
      `  <url><loc>${ORIGIN}/category/${slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`,
  ),
  ...profiles.map(
    (p) =>
      `  <url><loc>${ORIGIN}/directory/${p.slug}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

writeFileSync(join(root, "public/sitemap.xml"), xml);
console.log(
  `sitemap.xml: ${STATIC_ROUTES.length} static + ${categorySlugs.length} categories + ${profiles.length} directory figures = ${urls.length} URLs`,
);
