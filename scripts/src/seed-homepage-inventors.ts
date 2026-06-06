/**
 * Seed the people featured in the Citizen Science homepage Community section
 * into the `featured_profiles` table so their homepage cards can link to real
 * in-app directory profiles (`/directory/:slug`) instead of external links.
 *
 * The homepage shows four rows: "Great Minds of the Past" (Einstein, Curie,
 * Tesla, Darwin), "Modern Visionaries" (eight widely-recognized living
 * visionaries: Elon Musk, Jeff Bezos, Carolyn Bertozzi, Jensen Huang, Demis
 * Hassabis, Jennifer Doudna, Geoffrey Hinton, Sara Seager), "Pioneers of
 * Discovery" (Newton, Galileo, Ada Lovelace, Alan Turing), and "Researchers
 * Shaping Tomorrow" (Jane Goodall, Katalin Karikó, Tim Berners-Lee, Fei-Fei Li).
 * `manu-rehani` and `carolyn-bertozzi` are intentionally NOT seeded here; they
 * are seeded with richer content by `seed-profiles.ts`, and re-upserting them
 * here would overwrite that.
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
    slug: "elon-musk",
    name: "Elon Musk",
    group: "inventor",
    field: "Space & Sustainable Energy",
    era: "b. 1971",
    summary:
      "Elon Musk is an entrepreneur and engineer who founded SpaceX and leads Tesla, two companies pushing the frontiers of spaceflight and sustainable energy. SpaceX pioneered reusable orbital rockets and dramatically lowered the cost of reaching space, while Tesla helped move electric vehicles and energy storage into the mainstream.",
    contributions: [
      "Founded SpaceX, which developed the first reusable orbital-class rockets",
      "Leads Tesla, accelerating the global transition to electric vehicles and battery storage",
      "Built Starlink, a low-Earth-orbit satellite constellation delivering broadband worldwide",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg/500px-Elon_Musk_-_54820081119_%28cropped%29.jpg",
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      { title: "SpaceX", url: "https://www.spacex.com" },
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Elon_Musk" },
    ],
  },
  {
    slug: "jeff-bezos",
    name: "Jeff Bezos",
    group: "inventor",
    field: "Commerce & Spaceflight",
    era: "b. 1964",
    summary:
      "Jeff Bezos founded Amazon, transforming it from an online bookstore into one of the world's largest technology and commerce companies and pioneering large-scale cloud computing through Amazon Web Services. In 2000 he founded the aerospace company Blue Origin to lower the cost of access to space.",
    contributions: [
      "Founded Amazon, reinventing global e-commerce and logistics at planetary scale",
      "Launched Amazon Web Services, which created the modern cloud-computing industry",
      "Founded Blue Origin to develop reusable rockets and expand human access to space",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg/500px-260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg",
    relatedCategorySlugs: ["physics", "astronomy"],
    sources: [
      { title: "Blue Origin", url: "https://www.blueorigin.com" },
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Jeff_Bezos" },
    ],
  },
  {
    slug: "jensen-huang",
    name: "Jensen Huang",
    group: "inventor",
    field: "Accelerated Computing",
    era: "b. 1963",
    summary:
      "Jensen Huang co-founded NVIDIA in 1993 and has led it ever since as CEO. Under his direction NVIDIA invented the graphics processing unit (GPU) and later pioneered accelerated and parallel computing, which became the foundational hardware of the modern artificial-intelligence era.",
    contributions: [
      "Co-founded NVIDIA and led the invention of the modern GPU",
      "Drove the creation of CUDA, opening GPUs to general-purpose scientific and AI computing",
      "Positioned NVIDIA as the core hardware engine behind the deep-learning revolution",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/500px-Jen-Hsun_Huang_2025.jpg",
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      { title: "NVIDIA", url: "https://www.nvidia.com" },
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Jensen_Huang" },
    ],
  },
  {
    slug: "geoffrey-hinton",
    name: "Geoffrey Hinton",
    group: "scientist",
    field: "Deep Learning",
    era: "b. 1947",
    summary:
      "Geoffrey Hinton is a cognitive psychologist and computer scientist often called the \"Godfather of AI.\" His decades of work on artificial neural networks — including backpropagation and deep learning — laid the foundations of modern artificial intelligence, earning him the 2024 Nobel Prize in Physics.",
    contributions: [
      "Pioneered the backpropagation algorithm for training deep neural networks",
      "Co-authored breakthrough work on deep networks that ignited the modern AI boom",
      "Received the 2018 Turing Award and the 2024 Nobel Prize in Physics",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Geoffrey_Hinton_in_2026.jpg/500px-Geoffrey_Hinton_in_2026.jpg",
    relatedCategorySlugs: ["neuroscience", "physics"],
    sources: [
      {
        title: "Nobel Prize",
        url: "https://www.nobelprize.org/prizes/physics/2024/hinton/facts/",
      },
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Geoffrey_Hinton" },
    ],
  },
  {
    slug: "sara-seager",
    name: "Sara Seager",
    group: "scientist",
    field: "Exoplanets & Astrobiology",
    era: "b. 1971",
    summary:
      "Sara Seager is an astrophysicist and planetary scientist at MIT and a leading figure in the search for planets beyond our solar system. Her theoretical work on exoplanet atmospheres and biosignature gases helped define how scientists detect and characterize distant worlds.",
    contributions: [
      "Developed foundational theory for analyzing exoplanet atmospheres and biosignatures",
      "Pioneered methods to characterize the composition of planets orbiting distant stars",
      "Named a MacArthur Fellow for advancing the search for life beyond Earth",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sara_Seager_CHF-Cain-Conference-May-2016-059.jpg/500px-Sara_Seager_CHF-Cain-Conference-May-2016-059.jpg",
    relatedCategorySlugs: ["astronomy", "physics"],
    sources: [
      { title: "saraseager.com", url: "https://www.saraseager.com" },
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Sara_Seager" },
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
  {
    slug: "isaac-newton",
    name: "Isaac Newton",
    group: "scientist",
    field: "Physics & Mathematics",
    era: "1643–1727",
    summary:
      "Sir Isaac Newton was an English mathematician and physicist whose laws of motion and universal gravitation unified the heavens and the Earth under a single set of principles. His work defined classical mechanics for centuries.",
    contributions: [
      "Formulated the three laws of motion and the law of universal gravitation",
      "Co-invented calculus, independently of Leibniz",
      "Authored \"Philosophiæ Naturalis Principia Mathematica,\" a foundation of modern physics",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg",
    relatedCategorySlugs: ["physics"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Isaac_Newton" },
    ],
  },
  {
    slug: "galileo-galilei",
    name: "Galileo Galilei",
    group: "scientist",
    field: "Astronomy & Physics",
    era: "1564–1642",
    summary:
      "Galileo Galilei was an Italian astronomer and physicist often called the \"father of observational astronomy.\" His telescopic discoveries and insistence on evidence helped launch the scientific revolution.",
    contributions: [
      "Improved the telescope and discovered Jupiter's four largest moons",
      "Provided key observational support for the heliocentric model",
      "Pioneered the experimental, evidence-based method of modern science",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Galileo.arp.300pix.jpg",
    relatedCategorySlugs: ["astronomy", "physics"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Galileo_Galilei",
      },
    ],
  },
  {
    slug: "ada-lovelace",
    name: "Ada Lovelace",
    group: "scientist",
    field: "Computing",
    era: "1815–1852",
    summary:
      "Ada Lovelace was an English mathematician who worked with Charles Babbage on his proposed Analytical Engine. She is regarded as the first computer programmer for recognizing that such a machine could go beyond pure calculation.",
    contributions: [
      "Wrote the first published algorithm intended for a machine",
      "Foresaw that computers could manipulate symbols, not just numbers",
      "Bridged mathematics and imagination, laying conceptual groundwork for computer science",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png",
    relatedCategorySlugs: [],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Ada_Lovelace" },
    ],
  },
  {
    slug: "alan-turing",
    name: "Alan Turing",
    group: "scientist",
    field: "Computer Science",
    era: "1912–1954",
    summary:
      "Alan Turing was a British mathematician and logician widely considered the father of theoretical computer science and artificial intelligence. His wartime codebreaking at Bletchley Park helped turn the tide of World War II.",
    contributions: [
      "Formalized computation with the concept of the Turing machine",
      "Proposed the Turing test as a benchmark for machine intelligence",
      "Led codebreaking efforts that cracked the German Enigma cipher",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/Alan_turing_header.jpg",
    relatedCategorySlugs: [],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Alan_Turing" },
    ],
  },
  {
    slug: "jane-goodall",
    name: "Jane Goodall",
    group: "scientist",
    field: "Primatology & Conservation",
    era: "1934–2025",
    summary:
      "Dame Jane Goodall was a British primatologist whose decades of study of wild chimpanzees transformed our understanding of animal behavior and the human-animal boundary. She became one of the world's most influential conservationists.",
    contributions: [
      "Discovered that chimpanzees make and use tools, redefining \"man the toolmaker\"",
      "Conducted the longest-running field study of wild chimpanzees, at Gombe",
      "Founded the Jane Goodall Institute and the Roots & Shoots youth program",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Deputy_Secretary_Higginbottom_Poses_for_a_Photo_With_Dr._Jane_Goodall_and_the_State_Department%27s_Global_Health_Diplomacy_Director_Jordan_in_Washington_%2822365513310%29_%282%29_%28cropped_2%29.jpg",
    relatedCategorySlugs: ["biology"],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Jane_Goodall" },
    ],
  },
  {
    slug: "katalin-kariko",
    name: "Katalin Karikó",
    group: "scientist",
    field: "mRNA Biochemistry",
    era: "b. 1955",
    summary:
      "Dr. Katalin Karikó is a Hungarian-American biochemist whose decades of perseverance on messenger RNA made modern mRNA vaccines possible. She shared the 2023 Nobel Prize in Physiology or Medicine for this work.",
    contributions: [
      "Pioneered nucleoside modifications that made mRNA safe and effective as a therapeutic",
      "Enabled the mRNA COVID-19 vaccines developed during the pandemic",
      "Awarded the 2023 Nobel Prize in Physiology or Medicine",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/27/Katalin_Karik%C3%B3_by_Michel_2024_02.jpg",
    relatedCategorySlugs: ["human-health", "biology"],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Katalin_Karik%C3%B3",
      },
    ],
  },
  {
    slug: "tim-berners-lee",
    name: "Tim Berners-Lee",
    group: "inventor",
    field: "Computer Science",
    era: "b. 1955",
    summary:
      "Sir Tim Berners-Lee is a British computer scientist who invented the World Wide Web in 1989. He created the first web browser and server and chose to make the underlying technology free and open to all.",
    contributions: [
      "Invented the World Wide Web, including HTTP, HTML, and the URL",
      "Built the first web browser and web server",
      "Founded the World Wide Web Consortium (W3C) to keep the web open",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Tim_Berners-Lee_at_the_2025_Web_Summit_%28Cropped%29.jpg",
    relatedCategorySlugs: [],
    sources: [
      {
        title: "Wikipedia",
        url: "https://en.wikipedia.org/wiki/Tim_Berners-Lee",
      },
    ],
  },
  {
    slug: "fei-fei-li",
    name: "Fei-Fei Li",
    group: "scientist",
    field: "Artificial Intelligence",
    era: "b. 1976",
    summary:
      "Dr. Fei-Fei Li is a computer scientist and a leading figure in artificial intelligence. Her creation of ImageNet helped ignite the deep-learning revolution, and she is a prominent advocate for human-centered, ethical AI.",
    contributions: [
      "Created ImageNet, the dataset that catalyzed modern deep learning",
      "Co-directs the Stanford Institute for Human-Centered AI (HAI)",
      "Champions diversity and ethics in AI through AI4ALL and policy work",
    ],
    quotes: [],
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c7/Fei-Fei_Li_at_AI_for_Good_2017.jpg",
    relatedCategorySlugs: [],
    sources: [
      { title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Fei-Fei_Li" },
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
