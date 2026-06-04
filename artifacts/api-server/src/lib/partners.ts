// Curated registry of real-world partner products & services the science
// copilot can recommend. Each partner carries an (optional) referral link so
// recommendations can earn affiliate revenue.
//
// ── HOW TO ADD A REFERRAL CODE (single-line edit) ───────────────────────────
// Affiliate programs hand you a full tracking URL (e.g.
// https://refer.23andme.com/s/yourcode). Paste that whole link into the
// partner's `referralUrl` field below. While `referralUrl` is "" the card links
// to the plain `baseUrl` and nothing breaks — slot the code in later.
//
// NOTE: Some of these services also exist in labs.ts (DNA/testing labs). Those
// keep their referral links in labs.ts to avoid duplicate cards; this registry
// is for the remaining products & services (telescopes, kits, courses, etc.).

export interface Partner {
  slug: string;
  name: string;
  summary: string;
  /** Canonical homepage, used when no referral link is set yet. */
  baseUrl: string;
  /**
   * Full referral/affiliate URL. Leave "" until you have one — `partnerUrl`
   * then falls back to `baseUrl`. This is the single line you edit per partner.
   */
  referralUrl: string;
  /** Module slugs this partner is relevant to (for the copilot's context). */
  modules: string[];
}

export const PARTNERS: Partner[] = [
  {
    slug: "celestron",
    name: "Celestron",
    summary: "Telescopes, binoculars, and microscopes for backyard astronomy and observation.",
    baseUrl: "https://www.celestron.com",
    referralUrl: "",
    modules: ["astronomy", "physics"],
  },
  {
    slug: "ambient-weather",
    name: "Ambient Weather",
    summary: "Home weather stations and sensors for logging temperature, humidity, and rainfall.",
    baseUrl: "https://ambientweather.com",
    referralUrl: "",
    modules: ["climate-science", "environmental-science"],
  },
  {
    slug: "mel-science",
    name: "MEL Science",
    summary: "Subscription chemistry, physics, and STEM kits with guided home experiments.",
    baseUrl: "https://melscience.com",
    referralUrl: "",
    modules: ["chemistry", "physics"],
  },
  {
    slug: "kiwico",
    name: "KiwiCo",
    summary: "Hands-on science and engineering project crates for kids and curious beginners.",
    baseUrl: "https://www.kiwico.com",
    referralUrl: "",
    modules: ["physics", "chemistry", "biology"],
  },
  {
    slug: "brilliant",
    name: "Brilliant",
    summary: "Interactive courses in math, science, and computer science with bite-size lessons.",
    baseUrl: "https://brilliant.org",
    referralUrl: "",
    modules: ["physics", "materials-science", "neuroscience"],
  },
  {
    slug: "curiositystream",
    name: "CuriosityStream",
    summary: "Streaming library of science, nature, and technology documentaries.",
    baseUrl: "https://curiositystream.com",
    referralUrl: "",
    modules: ["astronomy", "biology", "climate-science"],
  },
  {
    slug: "coursera",
    name: "Coursera",
    summary: "University and industry science courses, specializations, and certificates online.",
    baseUrl: "https://www.coursera.org",
    referralUrl: "",
    modules: ["biology", "chemistry", "physics", "neuroscience", "environmental-science"],
  },
  {
    slug: "amscope",
    name: "AmScope",
    summary: "Affordable compound and stereo microscopes plus slides for home microbiology.",
    baseUrl: "https://amscope.com",
    referralUrl: "",
    modules: ["microbiology", "biology", "materials-science"],
  },
  {
    slug: "home-science-tools",
    name: "Home Science Tools",
    summary: "Lab glassware, chemicals, and supplies for at-home science experiments.",
    baseUrl: "https://www.homesciencetools.com",
    referralUrl: "",
    modules: ["chemistry", "biology", "physics"],
  },
  {
    slug: "aerogarden",
    name: "AeroGarden",
    summary: "Indoor hydroponic gardens for growing and studying plants without soil.",
    baseUrl: "https://www.aerogarden.com",
    referralUrl: "",
    modules: ["plant-science", "agriculture"],
  },
  {
    slug: "oura-ring",
    name: "Oura Ring",
    summary: "Wearable ring that tracks sleep, heart rate, temperature, and recovery.",
    baseUrl: "https://ouraring.com",
    referralUrl: "",
    modules: ["human-health", "neuroscience"],
  },
  {
    slug: "whoop",
    name: "WHOOP",
    summary: "Wearable strap for continuous heart rate, strain, sleep, and recovery tracking.",
    baseUrl: "https://www.whoop.com",
    referralUrl: "",
    modules: ["human-health"],
  },
  {
    slug: "lumosity",
    name: "Lumosity",
    summary: "Brain-training games and cognitive exercises for attention, memory, and speed.",
    baseUrl: "https://www.lumosity.com",
    referralUrl: "",
    modules: ["neuroscience"],
  },
  {
    slug: "bootstrap-farmer",
    name: "Bootstrap Farmer",
    summary: "Durable seed trays, grow supplies, and gear for soil and crop experiments.",
    baseUrl: "https://www.bootstrapfarmer.com",
    referralUrl: "",
    modules: ["agriculture", "plant-science"],
  },
  {
    slug: "great-courses",
    name: "The Great Courses (Wondrium)",
    summary: "In-depth video lecture series on science topics taught by university professors.",
    baseUrl: "https://www.thegreatcourses.com",
    referralUrl: "",
    modules: ["astronomy", "biology", "physics", "chemistry"],
  },
  {
    slug: "lifestraw",
    name: "LifeStraw",
    summary: "Personal and home water filters useful for water-quality demonstrations.",
    baseUrl: "https://www.lifestraw.com",
    referralUrl: "",
    modules: ["water-quality", "environmental-science"],
  },
  {
    slug: "skillshare",
    name: "Skillshare",
    summary: "Online classes including science illustration, data, and nature topics.",
    baseUrl: "https://www.skillshare.com",
    referralUrl: "",
    modules: ["biology", "environmental-science"],
  },
];

/**
 * Resolve a partner's outbound link: the referral URL when one has been set,
 * otherwise the plain homepage. Empty referral slots degrade gracefully.
 */
export function partnerUrl(partner: Partner): string {
  return partner.referralUrl.trim() || partner.baseUrl;
}
