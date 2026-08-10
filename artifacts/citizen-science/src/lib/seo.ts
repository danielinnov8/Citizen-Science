import { useEffect } from "react";
import { useLocation } from "wouter";

const BASE_TITLE = "Humanity's Research Network — Citizen Science";
const BASE_DESC =
  "Learn from the greatest minds in history, run real experiments, get answers from an AI science copilot, and find a mentor.";
const SUFFIX = "Citizen Science";

/**
 * SPA-friendly meta updates. The static <head> in index.html covers crawlers
 * that don't execute JS (og:, twitter:, canonical); this keeps document.title
 * and the meta description accurate per route for JS-executing crawlers
 * (Googlebot) and for users' tabs / share sheets.
 */
const ORIGIN = "https://citizen-science.org";

export function setPageMeta(
  title: string,
  description: string = BASE_DESC,
  canonicalPath?: string,
) {
  document.title = title;
  const el = document.querySelector('meta[name="description"]');
  if (el) el.setAttribute("content", description.slice(0, 300));
  // Per-route canonical + og:url: without these every SPA URL would carry the
  // root canonical from index.html, marking directory pages as duplicates of
  // the home page.
  if (canonicalPath !== undefined) {
    const url = `${ORIGIN}${canonicalPath === "/" ? "/" : canonicalPath}`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", url);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", url);
  }
}

// First match wins. Detail pages (directory/category/experiment) get a generic
// default here and set a precise title once their data loads (e.g. the figure
// name in ProfileDetail).
const ROUTES: Array<[RegExp, string, string?]> = [
  [/^\/$/, BASE_TITLE, BASE_DESC],
  [/^\/directory\//, `Profile — ${SUFFIX}`],
  [
    /^\/directory$/,
    `Directory of Great Minds — ${SUFFIX}`,
    "Explore scientists, inventors, and modern visionaries — from Einstein and Curie to today's living legends.",
  ],
  [
    /^\/challenges/,
    `Challenges — ${SUFFIX}`,
    "Open science challenges: pick a real problem, submit your solution, and climb the leaderboard.",
  ],
  [/^\/categories$/, `Research Categories — ${SUFFIX}`],
  [/^\/category\//, `Research Category — ${SUFFIX}`],
  [/^\/experiments/, `Experiments — ${SUFFIX}`],
  [
    /^\/mentors$/,
    `Mentors — ${SUFFIX}`,
    "Learn from living scientists, founders, and inventors through AI-guided mentorship.",
  ],
  [/^\/pricing$/, `Pricing — ${SUFFIX}`],
  [/^\/monetize$/, `Monetize Your Expertise — ${SUFFIX}`],
  [/^\/citizenx/, `CitizenX — ${SUFFIX}`],
  [/^\/brand$/, `Brand — ${SUFFIX}`],
  [/^\/apis?$/, `API Directory — ${SUFFIX}`],
  [/^\/mcp$/i, `MCP — ${SUFFIX}`],
  [/^\/privacy$/, `Privacy Policy — ${SUFFIX}`],
  [/^\/terms$/, `Terms of Service — ${SUFFIX}`],
  [/^\/login$/, `Sign In — ${SUFFIX}`],
];

export function RouteSeo() {
  // wouter's useLocation is already scoped to the configured router base —
  // match it directly (stripping again could mangle real routes).
  const [location] = useLocation();
  useEffect(() => {
    const path = location || "/";
    for (const [re, title, desc] of ROUTES) {
      if (re.test(path)) {
        setPageMeta(title, desc, path);
        return;
      }
    }
    setPageMeta(BASE_TITLE, BASE_DESC, path);
  }, [location]);
  return null;
}
