import manuPhoto from "@assets/image_1780677287488.jpeg";
import diamandisPhoto from "@assets/65ee191f9cc09e354404b538_Peter_Diamandis_1780697654112.webp";
import salimPhoto from "@assets/image_1780697674289.png";
import blundinPhoto from "@assets/moonshot-dave-blundin.webp";
import wissnerGrossPhoto from "@assets/moonshot-alexander-wissner-gross.png";

export interface Inventor {
  name: string;
  slug: string;
  field: string;
  blurb: string;
  imageUrl: string;
  href: string;
}

// The homepage Community section is shown as two curated rows. Each `slug` maps
// to an in-app directory profile (`/directory/:slug`) seeded by
// `@workspace/scripts run seed-homepage-inventors`; `href` is the canonical
// external source for that profile.

// Row 1 — "Great Minds of the Past": the giants of historical science.
export const GREAT_MINDS: Inventor[] = [
  {
    name: "Albert Einstein",
    slug: "albert-einstein",
    field: "Theoretical Physics",
    blurb:
      "Developed the theory of relativity and reshaped our understanding of space, time, and energy — a defining mind of modern science.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/28/Albert_Einstein_Head_cleaned.jpg",
    href: "https://en.wikipedia.org/wiki/Albert_Einstein",
  },
  {
    name: "Marie Curie",
    slug: "marie-curie",
    field: "Radioactivity",
    blurb:
      "Pioneer of radioactivity and the first person to win Nobel Prizes in two sciences — Physics and Chemistry.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_c._1920s.jpg",
    href: "https://en.wikipedia.org/wiki/Marie_Curie",
  },
  {
    name: "Nikola Tesla",
    slug: "nikola-tesla",
    field: "Electrical Engineering",
    blurb:
      "Visionary inventor whose work on alternating current, induction motors, and wireless power shaped the modern electrified world.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
    href: "https://en.wikipedia.org/wiki/Nikola_Tesla",
  },
  {
    name: "Charles Darwin",
    slug: "charles-darwin",
    field: "Evolutionary Biology",
    blurb:
      "Naturalist whose theory of evolution by natural selection became the unifying foundation of the modern life sciences.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Charles_Darwin_seated_crop.jpg",
    href: "https://en.wikipedia.org/wiki/Charles_Darwin",
  },
];

// Row 2 — "Modern Visionaries": the four "Moonshot Mates" (co-hosts of the
// Moonshots with Peter Diamandis podcast), followed by Manu Rehani, Neil
// deGrasse Tyson, and two contemporary Nobel-laureate scientists.
export const MODERN_MINDS: Inventor[] = [
  {
    name: "Peter Diamandis",
    slug: "peter-diamandis",
    field: "Exponential Innovation",
    blurb:
      "Founder of the XPRIZE Foundation and Singularity University, championing incentivized competition to solve humanity's grand challenges.",
    imageUrl: diamandisPhoto,
    href: "https://www.diamandis.com",
  },
  {
    name: "Salim Ismail",
    slug: "salim-ismail",
    field: "Exponential Organizations",
    blurb:
      "Founding executive director of Singularity University and author of \"Exponential Organizations,\" mapping how technology reshapes institutions.",
    imageUrl: salimPhoto,
    href: "https://openexo.com/community/salimismail",
  },
  {
    name: "Dave Blundin",
    slug: "dave-blundin",
    field: "AI & Venture",
    blurb:
      "MIT-trained AI pioneer and founder of Link Ventures who built large-scale neural networks decades before the modern AI boom.",
    imageUrl: blundinPhoto,
    href: "https://www.linkventures.com/team/dave-blundin",
  },
  {
    name: "Alexander Wissner-Gross",
    slug: "alexander-wissner-gross",
    field: "AI & Complex Systems",
    blurb:
      "Computer scientist and inventor known for the theory of causal entropic forces, linking intelligence to the drive to keep future options open.",
    imageUrl: wissnerGrossPhoto,
    href: "https://www.alexwg.org",
  },
  {
    name: "Manu Rehani",
    slug: "manu-rehani",
    field: "Behavioral Intelligence & Systems",
    blurb:
      "Austin-based inventor, engineer, and advisor with twelve patents across cloud storage, language models, autonomous systems, and wearable intelligence.",
    imageUrl: manuPhoto,
    href: "https://rehani.co",
  },
  {
    name: "Neil deGrasse Tyson",
    slug: "neil-degrasse-tyson",
    field: "Astrophysics",
    blurb:
      "Astrophysicist, director of the Hayden Planetarium, and one of the world's most influential communicators of science to the public.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Neil_DeGrasse_Tyson_%282023%29.jpg",
    href: "https://en.wikipedia.org/wiki/Neil_deGrasse_Tyson",
  },
  {
    name: "Jennifer Doudna",
    slug: "jennifer-doudna",
    field: "Genome Editing",
    blurb:
      "Biochemist and Nobel laureate who co-invented CRISPR-Cas9 gene editing, opening a new era of precision biology and medicine.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Jennifer_Doudna_by_Christopher_Michel_in_2023_01.jpg",
    href: "https://en.wikipedia.org/wiki/Jennifer_Doudna",
  },
  {
    name: "Demis Hassabis",
    slug: "demis-hassabis",
    field: "Artificial Intelligence",
    blurb:
      "Co-founder of DeepMind and Nobel laureate whose AlphaFold cracked protein structure prediction, transforming the future of science.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Demis_Hassabis%2C_2024_Nobel_Prize_Laureate_in_Chemistry_7_%28cropped%29.jpg",
    href: "https://en.wikipedia.org/wiki/Demis_Hassabis",
  },
];

// Row 3 — "Pioneers of Discovery": foundational inventors and researchers
// whose breakthroughs opened entire fields of science.
export const PIONEERS: Inventor[] = [
  {
    name: "Isaac Newton",
    slug: "isaac-newton",
    field: "Physics & Mathematics",
    blurb:
      "Formulated the laws of motion and universal gravitation and co-invented calculus — the framework on which classical physics is built.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg",
    href: "https://en.wikipedia.org/wiki/Isaac_Newton",
  },
  {
    name: "Galileo Galilei",
    slug: "galileo-galilei",
    field: "Astronomy & Physics",
    blurb:
      "The \"father of observational astronomy,\" he turned the telescope to the heavens and championed evidence-based science.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Galileo.arp.300pix.jpg",
    href: "https://en.wikipedia.org/wiki/Galileo_Galilei",
  },
  {
    name: "Ada Lovelace",
    slug: "ada-lovelace",
    field: "Computing",
    blurb:
      "Wrote the first algorithm intended for a machine, envisioning computers as tools for far more than calculation — the first programmer.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png",
    href: "https://en.wikipedia.org/wiki/Ada_Lovelace",
  },
  {
    name: "Alan Turing",
    slug: "alan-turing",
    field: "Computer Science",
    blurb:
      "Founder of theoretical computer science and AI, he formalized computation and helped crack the Enigma code in World War II.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/Alan_turing_header.jpg",
    href: "https://en.wikipedia.org/wiki/Alan_Turing",
  },
];

// Row 4 — "Researchers Shaping Tomorrow": living scientists whose work is
// actively defining the frontier across biology, medicine, the web, and AI.
export const FRONTIER_MINDS: Inventor[] = [
  {
    name: "Jane Goodall",
    slug: "jane-goodall",
    field: "Primatology & Conservation",
    blurb:
      "Redefined our understanding of chimpanzees and the human-animal boundary, becoming a global voice for conservation and the natural world.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Deputy_Secretary_Higginbottom_Poses_for_a_Photo_With_Dr._Jane_Goodall_and_the_State_Department%27s_Global_Health_Diplomacy_Director_Jordan_in_Washington_%2822365513310%29_%282%29_%28cropped_2%29.jpg",
    href: "https://en.wikipedia.org/wiki/Jane_Goodall",
  },
  {
    name: "Katalin Karikó",
    slug: "katalin-kariko",
    field: "mRNA Biochemistry",
    blurb:
      "Nobel laureate whose pioneering mRNA research made modern mRNA vaccines possible, transforming medicine and pandemic response.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/27/Katalin_Karik%C3%B3_by_Michel_2024_02.jpg",
    href: "https://en.wikipedia.org/wiki/Katalin_Karik%C3%B3",
  },
  {
    name: "Tim Berners-Lee",
    slug: "tim-berners-lee",
    field: "Computer Science",
    blurb:
      "Invented the World Wide Web and gave it to the world for free, building the open infrastructure that connects humanity today.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Tim_Berners-Lee_at_the_2025_Web_Summit_%28Cropped%29.jpg",
    href: "https://en.wikipedia.org/wiki/Tim_Berners-Lee",
  },
  {
    name: "Fei-Fei Li",
    slug: "fei-fei-li",
    field: "Artificial Intelligence",
    blurb:
      "Creator of ImageNet, which catalyzed the deep-learning revolution, and a leading advocate for human-centered, responsible AI.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c7/Fei-Fei_Li_at_AI_for_Good_2017.jpg",
    href: "https://en.wikipedia.org/wiki/Fei-Fei_Li",
  },
];

// Combined list kept for any consumer that wants the full set.
export const INVENTORS: Inventor[] = [
  ...GREAT_MINDS,
  ...MODERN_MINDS,
  ...PIONEERS,
  ...FRONTIER_MINDS,
];
