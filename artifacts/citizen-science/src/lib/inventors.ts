import manuPhoto from "@assets/image_1780677287488.jpeg";
import salimPhoto from "@assets/moonshot-salim-ismail.png";
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
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/64/Peter-Diamandis-Headshot.jpg",
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

// Combined list kept for any consumer that wants the full set.
export const INVENTORS: Inventor[] = [...GREAT_MINDS, ...MODERN_MINDS];
