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

// Curated showcase for the homepage Community section. The first row of four are
// the "Moonshot Mates" — the co-hosts of the Moonshots with Peter Diamandis
// podcast — followed by Manu Rehani and three widely recognized scientists. Each
// `slug` maps to an in-app directory profile (`/directory/:slug`) seeded by
// `@workspace/scripts run seed-homepage-inventors`; `href` is kept as the
// canonical external source for that profile.
export const INVENTORS: Inventor[] = [
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
];
