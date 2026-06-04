export interface Lab {
  slug: string;
  name: string;
  summary: string;
  url: string;
  tier: "$" | "$$" | "$$$";
  modules: string[];
  /**
   * Full referral/affiliate URL for this lab. Leave unset (or "") until you
   * have one — `labUrl()` then falls back to the plain `url`. To start earning,
   * paste the whole referral link here in a single-line edit, e.g.
   * referralUrl: "https://refer.23andme.com/s/yourcode".
   */
  referralUrl?: string;
}

/**
 * Resolve a lab's outbound link: the referral URL when one has been set,
 * otherwise the plain homepage. Empty referral slots degrade gracefully.
 */
export function labUrl(lab: Lab): string {
  return lab.referralUrl?.trim() || lab.url;
}

export const LABS: Lab[] = [
  {
    slug: "nebula-genomics",
    name: "Nebula Genomics",
    summary: "Whole genome sequencing (30x) with raw data access for personal research.",
    url: "https://nebula.org",
    tier: "$$$",
    modules: ["biology", "human-health"],
  },
  {
    slug: "dante-labs",
    name: "Dante Labs",
    summary: "Whole genome sequencing kits shipped to your door, raw FASTQ/BAM included.",
    url: "https://www.dantelabs.com",
    tier: "$$$",
    modules: ["biology", "human-health"],
  },
  {
    slug: "23andme",
    name: "23andMe",
    summary: "DNA testing for ancestry and a curated set of trait and health reports.",
    url: "https://www.23andme.com",
    tier: "$$",
    modules: ["biology", "human-health"],
    // Referral link — paste the full URL here (single-line edit) to start earning.
    referralUrl: "https://refer.23andme.com/s/danielinnov8",
  },
  {
    slug: "ancestrydna",
    name: "AncestryDNA",
    summary: "Autosomal DNA test focused on ancestry, ethnicity, and family-tree matches.",
    url: "https://www.ancestry.com/dna/",
    tier: "$$",
    modules: ["biology", "human-health"],
  },
  {
    slug: "embark-dog-dna",
    name: "Embark Dog DNA",
    summary: "Cheek-swab dog DNA test for breed, ancestry, and 250+ health conditions.",
    url: "https://embarkvet.com",
    tier: "$$",
    modules: ["biology"],
  },
  {
    slug: "wisdom-panel",
    name: "Wisdom Panel",
    summary: "Dog (and cat) DNA test for breed identification, traits, and health markers.",
    url: "https://www.wisdompanel.com",
    tier: "$$",
    modules: ["biology"],
  },
  {
    slug: "basepaws-cat-dna",
    name: "Basepaws Cat DNA",
    summary: "At-home cat DNA test covering breed groups, traits, and health screening.",
    url: "https://basepaws.com",
    tier: "$$",
    modules: ["biology"],
  },
  {
    slug: "viome",
    name: "Viome",
    summary: "Gut microbiome and cellular health testing from a stool sample.",
    url: "https://www.viome.com",
    tier: "$$",
    modules: ["microbiology", "human-health", "food-science"],
  },
  {
    slug: "thorne-gut-health",
    name: "Thorne Gut Health Test",
    summary: "At-home gut microbiome panel with personalized recommendations.",
    url: "https://www.thorne.com/products/dp/gut-health-test",
    tier: "$$",
    modules: ["microbiology", "human-health"],
  },
  {
    slug: "everlywell",
    name: "Everlywell",
    summary: "At-home test kits for food sensitivity, hormones, vitamins, and more.",
    url: "https://www.everlywell.com",
    tier: "$$",
    modules: ["human-health", "food-science"],
  },
  {
    slug: "mosaic-diagnostics",
    name: "Mosaic Diagnostics",
    summary: "Organic acids and metabolic panels (formerly Great Plains Laboratory).",
    url: "https://mosaicdx.com",
    tier: "$$$",
    modules: ["human-health", "chemistry"],
  },
  {
    slug: "tap-score",
    name: "Tap Score (SimpleLab)",
    summary: "Certified-lab drinking water analysis for metals, minerals, and contaminants.",
    url: "https://mytapscore.com",
    tier: "$$",
    modules: ["water-quality", "environmental-science", "chemistry"],
  },
  {
    slug: "idexx-water",
    name: "IDEXX Water Testing",
    summary: "Lab-grade microbial water testing (Colilert, Quanti-Tray) used by utilities.",
    url: "https://www.idexx.com/en/water/",
    tier: "$$",
    modules: ["water-quality", "microbiology"],
  },
  {
    slug: "soil-savvy",
    name: "Soil Savvy",
    summary: "Mail-in home soil test kit reporting NPK and 11 other nutrients.",
    url: "https://mysoilsavvy.com",
    tier: "$",
    modules: ["agriculture", "plant-science"],
  },
  {
    slug: "ward-laboratories",
    name: "Ward Laboratories",
    summary: "Agricultural soil, plant tissue, and feed analysis trusted by farmers.",
    url: "https://www.wardlab.com",
    tier: "$$",
    modules: ["agriculture", "plant-science", "environmental-science"],
  },
  {
    slug: "university-extension",
    name: "University Cooperative Extension",
    summary: "Low-cost soil, water, and plant testing through your state's land-grant university.",
    url: "https://www.nifa.usda.gov/about-nifa/how-we-work/extension/cooperative-extension-system",
    tier: "$",
    modules: ["agriculture", "plant-science", "environmental-science", "water-quality"],
  },
  {
    slug: "purpleair",
    name: "PurpleAir",
    summary: "Real-time outdoor and indoor air-quality monitoring with a global sensor map.",
    url: "https://www2.purpleair.com",
    tier: "$$",
    modules: ["climate-science", "environmental-science"],
  },
  {
    slug: "globe-at-night",
    name: "Globe at Night",
    summary: "Citizen-science program for measuring and submitting night-sky brightness.",
    url: "https://globeatnight.org",
    tier: "$",
    modules: ["astronomy", "environmental-science"],
  },
];
