/**
 * Seed the people featured in the Citizen Science homepage Community section
 * into the `featured_profiles` table so their homepage cards can link to real
 * in-app directory profiles (`/directory/:slug`) instead of external links.
 *
 * The homepage shows two rows: "Great Minds of the Past" (Einstein, Curie,
 * Tesla, Darwin) and "Modern Visionaries" (the "Moonshot Mates" co-hosts of the
 * Moonshots with Peter Diamandis podcast, plus Manu Rehani, Neil deGrasse Tyson,
 * Jennifer Doudna, and Demis Hassabis).
 * `manu-rehani` is intentionally NOT seeded here; he is seeded with richer
 * content (patents, etc.) by `seed-profiles.ts`, and re-upserting him here would
 * overwrite that.
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
    slug: "peter-diamandis",
    name: "Peter Diamandis",
    group: "thought_leader",
    field: "Exponential Innovation",
    era: "b. 1961",
    summary:
      "Dr. Peter Diamandis is an entrepreneur and futurist who founded the XPRIZE Foundation, which uses large incentive prizes to drive breakthroughs in space, health, and the environment. He also co-founded Singularity University to educate leaders on exponential technologies.",
    contributions: [
      "Founded the XPRIZE Foundation, pioneering incentivized competition for grand challenges",
      "Co-founded Singularity University and Human Longevity, Inc.",
      "Author of \"Abundance\" and \"Bold,\" charting how technology can solve humanity's biggest problems",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/64/Peter-Diamandis-Headshot.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      { title: "diamandis.com", url: "https://www.diamandis.com" },
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Peter_Diamandis",
      },
    ],
  },
  {
    slug: "salim-ismail",
    name: "Salim Ismail",
    group: "thought_leader",
    field: "Exponential Organizations",
    era: "b. 1965",
    summary:
      "Salim Ismail is a technology strategist, speaker, and serial entrepreneur. As founding executive director of Singularity University and author of \"Exponential Organizations,\" he studies how organizations can scale rapidly by leveraging accelerating technologies.",
    contributions: [
      "Founding executive director of Singularity University",
      "Lead author of \"Exponential Organizations,\" a framework for technology-driven scaling",
      "Founder of OpenExO, a global transformation platform",
    ],
    quotes: [],
    imageUrl:
      "https://www.shrm.org/content/dam/en/shrm/topics-tools/content-journeys/aihi/salim-ismail.png",
    relatedCategorySlugs: [],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Salim_Ismail",
      },
      { title: "OpenExO", url: "https://openexo.com/community/salimismail" },
    ],
  },
  {
    slug: "dave-blundin",
    name: "Dave Blundin",
    group: "thought_leader",
    field: "AI & Venture",
    era: "Contemporary",
    summary:
      "Dave Blundin is an AI entrepreneur and investor who founded Link Ventures. Trained in MIT's AI Lab, he programmed some of the largest-scale neural networks of his era and has spent three decades building at the intersection of artificial intelligence and entrepreneurship.",
    contributions: [
      "Founder and managing partner of Link Ventures",
      "Pioneered early large-scale neural networks and neural network quantization",
      "Co-host of the Moonshots with Peter Diamandis podcast",
    ],
    quotes: [],
    imageUrl:
      "https://www.vestigoventures.com/wp-content/uploads/2024/05/Headshot_Color_DaveBlundin.webp",
    relatedCategorySlugs: [],
    sources: [
      {
        title: "Link Ventures",
        url: "https://www.linkventures.com/team/dave-blundin",
      },
    ],
  },
  {
    slug: "alexander-wissner-gross",
    name: "Alexander Wissner-Gross",
    group: "scientist",
    field: "AI & Complex Systems",
    era: "b. 1981",
    summary:
      "Dr. Alexander Wissner-Gross is a computer scientist, inventor, and investor. He is best known for proposing the theory of causal entropic forces, which frames intelligent behavior as a drive to maximize future freedom of action.",
    contributions: [
      "Proposed the theory of causal entropic forces linking intelligence to future option-keeping",
      "Holds multiple patents and has published across physics, AI, and complex systems",
      "Co-host of the Moonshots with Peter Diamandis podcast",
    ],
    quotes: [],
    imageUrl: "https://www.alexwg.org/images/AWG-Headshot_2024-03-18B.png",
    relatedCategorySlugs: ["physics"],
    sources: [{ title: "alexwg.org", url: "https://www.alexwg.org" }],
  },
  {
    slug: "neil-degrasse-tyson",
    name: "Neil deGrasse Tyson",
    group: "scientist",
    field: "Astrophysics",
    era: "b. 1958",
    summary:
      "Neil deGrasse Tyson is an American astrophysicist and one of the world's most prominent science communicators. As director of the Hayden Planetarium and host of Cosmos and StarTalk, he has brought astronomy and the wonder of the universe to millions.",
    contributions: [
      "Director of the Hayden Planetarium at the American Museum of Natural History",
      "Host of Cosmos: A Spacetime Odyssey and the StarTalk podcast",
      "Best-selling author popularizing astrophysics for the public",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Neil_DeGrasse_Tyson_%282023%29.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Neil_deGrasse_Tyson",
      },
    ],
  },
  {
    slug: "albert-einstein",
    name: "Albert Einstein",
    group: "scientist",
    field: "Theoretical Physics",
    era: "1879–1955",
    summary:
      "Albert Einstein was a German-born theoretical physicist whose theory of relativity transformed our understanding of space, time, gravity, and energy. His work laid much of the foundation of modern physics and made him a global symbol of scientific genius.",
    contributions: [
      "Developed the special and general theories of relativity",
      "Explained the photoelectric effect, foundational to quantum theory (1921 Nobel Prize in Physics)",
      "Derived the mass–energy equivalence, E = mc²",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/28/Albert_Einstein_Head_cleaned.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Albert_Einstein",
      },
    ],
  },
  {
    slug: "marie-curie",
    name: "Marie Curie",
    group: "scientist",
    field: "Radioactivity",
    era: "1867–1934",
    summary:
      "Marie Curie was a Polish-French physicist and chemist who pioneered research on radioactivity — a term she coined. She was the first woman to win a Nobel Prize and the first person to win Nobel Prizes in two different sciences.",
    contributions: [
      "Pioneered the theory of radioactivity and discovered the elements polonium and radium",
      "First person to win Nobel Prizes in two sciences — Physics (1903) and Chemistry (1911)",
      "Developed mobile radiography units to treat wounded soldiers in World War I",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_c._1920s.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Marie_Curie" },
    ],
  },
  {
    slug: "nikola-tesla",
    name: "Nikola Tesla",
    group: "inventor",
    field: "Electrical Engineering",
    era: "1856–1943",
    summary:
      "Nikola Tesla was a Serbian-American inventor and electrical engineer whose work on alternating-current (AC) power systems became the backbone of the modern electrical grid. His prolific imagination spanned wireless power, radio, and rotating magnetic fields.",
    contributions: [
      "Designed the modern alternating-current (AC) electricity supply system",
      "Invented the induction motor and the Tesla coil",
      "Pioneered early work in wireless transmission of energy and radio",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
    relatedCategorySlugs: ["physics"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Nikola_Tesla" },
    ],
  },
  {
    slug: "charles-darwin",
    name: "Charles Darwin",
    group: "scientist",
    field: "Evolutionary Biology",
    era: "1809–1882",
    summary:
      "Charles Darwin was an English naturalist whose theory of evolution by natural selection became the unifying foundation of the biological sciences. His observations aboard HMS Beagle reshaped how humanity understands life on Earth.",
    contributions: [
      "Formulated the theory of evolution by natural selection",
      "Authored \"On the Origin of Species,\" one of the most influential works in science",
      "Established common descent as a unifying principle of the life sciences",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Charles_Darwin_seated_crop.jpg",
    relatedCategorySlugs: ["biology"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Charles_Darwin" },
    ],
  },
  {
    slug: "jennifer-doudna",
    name: "Jennifer Doudna",
    group: "scientist",
    field: "Genome Editing",
    era: "b. 1964",
    summary:
      "Dr. Jennifer Doudna is an American biochemist who co-invented CRISPR-Cas9, a precise and accessible method of editing DNA. Her work has transformed genetics, medicine, and agriculture and earned her the 2020 Nobel Prize in Chemistry.",
    contributions: [
      "Co-invented CRISPR-Cas9 genome editing (2020 Nobel Prize in Chemistry)",
      "Founded the Innovative Genomics Institute to apply gene editing for public good",
      "Advanced understanding of RNA structure and function",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Jennifer_Doudna_by_Christopher_Michel_in_2023_01.jpg",
    relatedCategorySlugs: ["biology"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Jennifer_Doudna",
      },
    ],
  },
  {
    slug: "demis-hassabis",
    name: "Demis Hassabis",
    group: "scientist",
    field: "Artificial Intelligence",
    era: "b. 1976",
    summary:
      "Sir Demis Hassabis is a British AI researcher and co-founder of DeepMind. Under his leadership, DeepMind built AlphaFold, which solved the decades-old problem of predicting protein structures — earning him the 2024 Nobel Prize in Chemistry.",
    contributions: [
      "Co-founded DeepMind, a world-leading artificial intelligence lab",
      "Led development of AlphaFold, predicting the 3D structure of nearly all known proteins",
      "Awarded the 2024 Nobel Prize in Chemistry for computational protein design",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Demis_Hassabis%2C_2024_Nobel_Prize_Laureate_in_Chemistry_7_%28cropped%29.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Demis_Hassabis",
      },
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
