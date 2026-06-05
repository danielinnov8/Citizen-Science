/**
 * Seed the eight inventors featured in the Citizen Science homepage Community
 * section into the `featured_profiles` table so their homepage cards can link to
 * real in-app directory profiles (`/directory/:slug`) instead of external links.
 *
 * Unlike `seed-profiles.ts`, this seed uses hand-authored, fact-checked content
 * (no Gemini grounded research) so it is fully deterministic and not subject to
 * the Gemini free-tier daily quota. It is idempotent: upserts keyed by slug.
 *
 * Keep slugs in sync with `artifacts/citizen-science/src/lib/inventors.ts`.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-homepage-inventors
 */
import {
  db,
  pool,
  featuredProfilesTable,
  type InsertFeaturedProfile,
} from "@workspace/db";

const INVENTORS: InsertFeaturedProfile[] = [
  {
    slug: "manu-rehani",
    name: "Manu Rehani",
    group: "inventor",
    field: "Behavioral Intelligence & Systems",
    era: "21st century",
    summary:
      "Manu Rehani is an Austin-based inventor, engineer, and advisor whose work spans cloud storage, large language models, autonomous systems, and wearable intelligence. He holds twelve patents and advises teams building at the frontier of applied AI and human-centered systems.",
    contributions: [
      "Holds twelve patents across cloud storage, language models, autonomous systems, and wearable intelligence",
      "Advises teams building applied AI and human-centered systems",
      "Work bridges behavioral intelligence and real-world engineering",
    ],
    quotes: [],
    imageUrl: null,
    relatedCategorySlugs: ["neuroscience"],
    sources: [{ title: "rehani.co", url: "https://rehani.co" }],
  },
  {
    slug: "manu-prakash",
    name: "Manu Prakash",
    group: "inventor",
    field: "Frugal Science",
    era: "21st century",
    summary:
      "Manu Prakash is a Stanford bioengineer and pioneer of \"frugal science\" — building powerful scientific tools that cost almost nothing so that anyone, anywhere, can do real research. His inventions put laboratory-grade capability into the hands of communities worldwide.",
    contributions: [
      "Invented the Foldscope, a durable paper microscope that costs about $1",
      "Created the Paperfuge, a hand-powered centrifuge inspired by a child's whirligig",
      "Champion of the \"frugal science\" movement for ultra-low-cost research tools",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f1/Manu_Prakash_at_TED.jpg",
    relatedCategorySlugs: ["microbiology", "biology"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Manu_Prakash" },
    ],
  },
  {
    slug: "james-dyson",
    name: "James Dyson",
    group: "inventor",
    field: "Industrial Design",
    era: "b. 1947",
    summary:
      "Sir James Dyson is a British inventor and industrial designer best known for reinventing everyday machines. After building thousands of prototypes, he perfected the bagless cyclonic vacuum cleaner and went on to rethink fans, hand dryers, and lighting.",
    contributions: [
      "Invented the first bagless cyclonic vacuum cleaner after 5,127 prototypes",
      "Developed bladeless Air Multiplier fans and the Airblade hand dryer",
      "Founded the James Dyson Foundation to support young engineers",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/67/Sir_James_Dyson_CBE_FREng_FRS.jpg",
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/James_Dyson" },
    ],
  },
  {
    slug: "lonnie-johnson",
    name: "Lonnie Johnson",
    group: "inventor",
    field: "Aerospace Engineering",
    era: "b. 1949",
    summary:
      "Lonnie Johnson is an American aerospace and mechanical engineer who worked on NASA missions including Galileo and Cassini. He is widely known for inventing the Super Soaker water gun and now develops advanced energy and battery technologies.",
    contributions: [
      "Invented the Super Soaker, one of the best-selling toys of all time",
      "Worked as an engineer on NASA's Galileo and Cassini missions",
      "Develops next-generation energy conversion and battery systems",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/Lonnie_Johnson%2C_Office_of_Naval_Research_%28crop%29.jpg",
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Lonnie_Johnson_(inventor)",
      },
    ],
  },
  {
    slug: "radia-perlman",
    name: "Radia Perlman",
    group: "inventor",
    field: "Network Engineering",
    era: "b. 1951",
    summary:
      "Radia Perlman is an American computer scientist often called the \"Mother of the Internet.\" Her invention of the Spanning Tree Protocol made it possible to build large, reliable networks, shaping the foundations of how modern data networks operate.",
    contributions: [
      "Invented the Spanning Tree Protocol (STP) underpinning modern Ethernet networks",
      "Made major contributions to network routing and security",
      "Author of influential textbooks on network protocols",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Radia_Perlman_2009.jpg",
    relatedCategorySlugs: [],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Radia_Perlman",
      },
    ],
  },
  {
    slug: "dean-kamen",
    name: "Dean Kamen",
    group: "inventor",
    field: "Biomedical Engineering",
    era: "b. 1951",
    summary:
      "Dean Kamen is an American inventor and entrepreneur with hundreds of patents. He created early wearable medical devices and the Segway personal transporter, and founded FIRST to inspire young people in science and engineering.",
    contributions: [
      "Invented the first wearable insulin pump and a portable dialysis machine",
      "Created the Segway personal transporter and the iBot stair-climbing wheelchair",
      "Founded FIRST (For Inspiration and Recognition of Science and Technology)",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Dean_Kamen_at_MAGNET_in_Cleveland_-_2025_%28cropped%29.jpg",
    relatedCategorySlugs: ["human-health"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Dean_Kamen" },
    ],
  },
  {
    slug: "federico-faggin",
    name: "Federico Faggin",
    group: "inventor",
    field: "Microelectronics",
    era: "b. 1941",
    summary:
      "Federico Faggin is an Italian-American physicist and engineer who led the design of the Intel 4004, the world's first commercial microprocessor. He pioneered the silicon-gate technology that made modern chips possible and later co-founded companies advancing microprocessor and touch technology.",
    contributions: [
      "Led the design of the Intel 4004, the first commercial microprocessor",
      "Developed silicon-gate MOS technology, foundational to modern chips",
      "Co-founded Zilog and created the Z80 microprocessor",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Federico_Faggin_%28cropped%29.jpg",
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Federico_Faggin",
      },
    ],
  },
  {
    slug: "hedy-lamarr",
    name: "Hedy Lamarr",
    group: "inventor",
    field: "Communications",
    era: "1914–2000",
    summary:
      "Hedy Lamarr was an Austrian-American actress and inventor. During World War II she co-invented a frequency-hopping spread-spectrum system to prevent the jamming of radio-guided torpedoes — a concept that became foundational to modern Wi-Fi, GPS, and Bluetooth.",
    contributions: [
      "Co-invented a frequency-hopping spread-spectrum communication system",
      "Her patent laid the groundwork for Wi-Fi, GPS, and Bluetooth",
      "Posthumously inducted into the National Inventors Hall of Fame",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/83/Hedy_Lamarr_Publicity_Photo_for_The_Heavenly_Body_1944.jpg",
    relatedCategorySlugs: [],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Hedy_Lamarr" },
    ],
  },
];

async function main(): Promise<void> {
  console.log(`Seeding ${INVENTORS.length} homepage inventors...`);
  for (const inv of INVENTORS) {
    await db
      .insert(featuredProfilesTable)
      .values(inv)
      .onConflictDoUpdate({
        target: featuredProfilesTable.slug,
        set: {
          name: inv.name,
          group: inv.group,
          field: inv.field,
          era: inv.era,
          summary: inv.summary,
          contributions: inv.contributions,
          quotes: inv.quotes,
          imageUrl: inv.imageUrl,
          relatedCategorySlugs: inv.relatedCategorySlugs,
          sources: inv.sources,
          updatedAt: new Date(),
        },
      });
    console.log(`  ok: ${inv.name} (${inv.slug})`);
  }
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
