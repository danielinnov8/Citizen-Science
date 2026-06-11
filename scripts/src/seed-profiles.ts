/**
 * Seed for the Citizen Science "Scientists & Inventors" directory.
 *
 * For each curated person it uses the grounded Gemini research helper
 * (Google Search) to fetch a short bio, field, era, key contributions, notable
 * quotes, and relevant Citizen Science category slugs — capturing the web
 * source citations from grounding — then pulls a portrait from Wikipedia and
 * upserts the record into the `featured_profiles` table (keyed by slug).
 *
 * Task #18 expanded this into a living-focused dataset of ~300 people across
 * three groups — ~100 living scientists, ~100 living inventors, and ~100 living
 * thought leaders / science communicators — plus the original Task #14 list
 * (kept for backward-compat, tagged with an inferred group). The `group`
 * dimension lets the directory filter scientist vs. inventor vs. thought-leader.
 *
 * The run is idempotent and RESUMABLE: by default it skips people that already
 * exist (by slug), so a partial run interrupted by API rate limits can simply
 * be re-run to continue. The Gemini free tier caps grounded requests heavily
 * (~per-minute and per-day), so seeding all ~300 takes multiple passes / a paid
 * key — pacing and 429 back-off are built in.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed-profiles               # seed everyone (resumable)
 *   pnpm --filter @workspace/scripts run seed-profiles -- 10         # first 10 only
 *   GROUP=thought_leader pnpm --filter @workspace/scripts run seed-profiles   # one group only
 *   FORCE=1 pnpm --filter @workspace/scripts run seed-profiles       # re-research existing
 *   PACE_MS=2000 pnpm --filter @workspace/scripts run seed-profiles  # faster pacing (paid key)
 */
import { sql } from "drizzle-orm";
import {
  db,
  pool,
  featuredProfilesTable,
  type ProfileSource,
  type ProfilePatent,
  type ProfileGroup,
} from "@workspace/db";
import { researchWithSearch } from "@workspace/integrations-gemini-ai-server";

// Allowed Citizen Science category slugs (mirrors the frontend categories lib).
const CATEGORY_SLUGS = [
  "biology",
  "plant-science",
  "environmental-science",
  "water-quality",
  "chemistry",
  "physics",
  "human-health",
  "microbiology",
  "food-science",
  "agriculture",
  "neuroscience",
  "climate-science",
  "astronomy",
  "materials-science",
] as const;

interface Person {
  name: string;
  group: ProfileGroup;
}

// ~100 living scientists (researchers across the sciences).
const LIVING_SCIENTISTS: string[] = [
  "Jennifer Doudna",
  "Emmanuelle Charpentier",
  "Frances Arnold",
  "Carolyn Bertozzi",
  "Katalin Karikó",
  "Drew Weissman",
  "Svante Pääbo",
  "Roger Penrose",
  "Kip Thorne",
  "Rainer Weiss",
  "Barry Barish",
  "Andrea Ghez",
  "Reinhard Genzel",
  "Donna Strickland",
  "Gérard Mourou",
  "Arthur Ashkin",
  "M. Stanley Whittingham",
  "Akira Yoshino",
  "James P. Allison",
  "Tasuku Honjo",
  "Gregg Semenza",
  "William Kaelin",
  "Peter Ratcliffe",
  "Michael Houghton",
  "Charles M. Rice",
  "Harvey Alter",
  "David Julius",
  "Ardem Patapoutian",
  "Morten Meldal",
  "Benjamin List",
  "David MacMillan",
  "Klaus Hasselmann",
  "Giorgio Parisi",
  "Alain Aspect",
  "John Clauser",
  "Anton Zeilinger",
  "Pierre Agostini",
  "Ferenc Krausz",
  "Anne L'Huillier",
  "Moungi Bawendi",
  "Louis Brus",
  "Aleksey Yekimov",
  "Edward Witten",
  "Juan Maldacena",
  "Lisa Randall",
  "Brian Greene",
  "Sean Carroll",
  "Lene Hau",
  "Shinya Yamanaka",
  "Robert Langer",
  "George Church",
  "Eric Lander",
  "Feng Zhang",
  "Carl June",
  "Geoffrey Hinton",
  "Yoshua Bengio",
  "Yann LeCun",
  "Fei-Fei Li",
  "Stuart Russell",
  "Judea Pearl",
  "Demis Hassabis",
  "John Jumper",
  "Cumrun Vafa",
  "Frank Wilczek",
  "Steven Chu",
  "William Phillips",
  "David Wineland",
  "Serge Haroche",
  "Saul Perlmutter",
  "Brian Schmidt",
  "Adam Riess",
  "John Mather",
  "George Smoot",
  "Michel Mayor",
  "Didier Queloz",
  "James Peebles",
  "Takaaki Kajita",
  "Arthur McDonald",
  "Shuji Nakamura",
  "Hiroshi Amano",
  "Elizabeth Blackburn",
  "Carol Greider",
  "Jack Szostak",
  "Craig Venter",
  "Eric Topol",
  "Sarah Gilbert",
  "Uğur Şahin",
  "Özlem Türeci",
  "Mary-Claire King",
  "Beth Shapiro",
  "Sara Seager",
  "Avi Loeb",
  "Carolyn Porco",
  "Neil Shubin",
  "Veerabhadran Ramanathan",
  "Gabriela González",
  "Michael Levin",
  "Jill Tarter",
  "Karl Deisseroth",
  "Pardis Sabeti",
  // ---- Second cohort (Task: add 100 more living scientists) ----
  // Physics
  "Sheldon Glashow",
  "Gerard 't Hooft",
  "David Gross",
  "Klaus von Klitzing",
  "Robert Laughlin",
  "Wolfgang Ketterle",
  "Eric Cornell",
  "Carl Wieman",
  "Theodor Hänsch",
  "Makoto Kobayashi",
  "Juan Ignacio Cirac",
  "Peter Zoller",
  "Sau Lan Wu",
  "Fabiola Gianotti",
  "Nima Arkani-Hamed",
  "Subir Sachdev",
  "Philip Kim",
  "Pablo Jarillo-Herrero",
  "Michael Berry",
  "Helen Quinn",
  // Chemistry
  "Richard Schrock",
  "K. Barry Sharpless",
  "Ada Yonath",
  "Venkatraman Ramakrishnan",
  "Roger Kornberg",
  "Michael Levitt",
  "Arieh Warshel",
  "Robert Lefkowitz",
  "Brian Kobilka",
  "Jean-Pierre Sauvage",
  "Ben Feringa",
  "George Whitesides",
  "Omar Yaghi",
  "Daniel Nocera",
  "Chi-Huey Wong",
  // Biology, genetics & cell biology
  "Robert Horvitz",
  "Andrew Fire",
  "Craig Mello",
  "Victor Ambros",
  "Gary Ruvkun",
  "Paul Nurse",
  "Tim Hunt",
  "Randy Schekman",
  "James Rothman",
  "Thomas Südhof",
  "Aaron Ciechanover",
  "Avram Hershko",
  "Roderick MacKinnon",
  "Peter Agre",
  "Phillip Sharp",
  "Richard Roberts",
  "Harold Varmus",
  "Robert Weinberg",
  "Bert Vogelstein",
  "Elaine Fuchs",
  "Rudolf Jaenisch",
  "Titia de Lange",
  "Stephen Elledge",
  "Tony Hunter",
  "Huda Zoghbi",
  "Magdalena Zernicka-Goetz",
  // Microbiology & immunology
  "Bruce Beutler",
  "Jules Hoffmann",
  "Shimon Sakaguchi",
  "Bonnie Bassler",
  "Jeffrey Gordon",
  "Rob Knight",
  // Neuroscience
  "Edvard Moser",
  "May-Britt Moser",
  "John O'Keefe",
  "Cornelia Bargmann",
  "Stanislas Dehaene",
  "Doris Tsao",
  // Climate & Earth science
  "James Hansen",
  "Michael Mann",
  "Gavin Schmidt",
  "Susan Solomon",
  "Richard Alley",
  "Eric Rignot",
  "Jane Lubchenco",
  "Inez Fung",
  // Astronomy & cosmology
  "Margaret Geller",
  "Wendy Freedman",
  "Sandra Faber",
  "Rashid Sunyaev",
  "Robert Kirshner",
  "Natalie Batalha",
  "David Charbonneau",
  "Victoria Kaspi",
  "Heino Falcke",
  "Katie Bouman",
  // Mathematics & computer science
  "Terence Tao",
  "Andrew Wiles",
  "Manjul Bhargava",
  "Peter Scholze",
  "Karen Uhlenbeck",
  "Ingrid Daubechies",
  "Avi Wigderson",
  "Barbara Liskov",
  "Donald Knuth",
];

// ~100 living inventors, engineers, and technology creators.
const LIVING_INVENTORS: string[] = [
  "Elon Musk",
  "Jeff Bezos",
  "Steve Wozniak",
  "Vint Cerf",
  "Robert Kahn",
  "Sergey Brin",
  "Larry Page",
  "Jensen Huang",
  "Lisa Su",
  "Marc Andreessen",
  "Jack Dorsey",
  "Jan Koum",
  "Brian Acton",
  "Palmer Luckey",
  "Dean Kamen",
  "Nathan Myhrvold",
  "Federico Faggin",
  "Bjarne Stroustrup",
  "James Gosling",
  "Guido van Rossum",
  "Linus Torvalds",
  "Brendan Eich",
  "Vitalik Buterin",
  "John Carmack",
  "Shigeru Miyamoto",
  "Robin Li",
  "Ma Huateng",
  "Jack Ma",
  "Lei Jun",
  "Morris Chang",
  "Whitfield Diffie",
  "Martin Hellman",
  "Ralph Merkle",
  "Ron Rivest",
  "Adi Shamir",
  "Leonard Adleman",
  "Radia Perlman",
  "Shafi Goldwasser",
  "Silvio Micali",
  "Robert Metcalfe",
  "Andy Bechtolsheim",
  "Anders Hejlsberg",
  "Yukihiro Matsumoto",
  "Rasmus Lerdorf",
  "Irwin Jacobs",
  "Andrew Viterbi",
  "Carver Mead",
  "Tony Fadell",
  "Jony Ive",
  "Steve Chen",
  "Chad Hurley",
  "Jawed Karim",
  "Drew Houston",
  "Patrick Collison",
  "John Collison",
  "Evan Spiegel",
  "Kevin Systrom",
  "Brian Chesky",
  "Andy Rubin",
  "Chuck Hull",
  "Scott Crump",
  "Hod Lipson",
  "Adrian Bowyer",
  "Joseph DeSimone",
  "Marc Raibert",
  "Rodney Brooks",
  "Cynthia Breazeal",
  "Colin Angle",
  "Helen Greiner",
  "Lonnie Johnson",
  "James Dyson",
  "Saul Griffith",
  "Hugh Herr",
  "Pranav Mistry",
  "Yoky Matsuoka",
  "Angela Belcher",
  "Zhenan Bao",
  "John Rogers",
  "Chad Mirkin",
  "Naomi Halas",
  "Paula Hammond",
  "Ashok Gadgil",
  "John O'Sullivan",
  "Sumio Iijima",
  "Andre Geim",
  "Konstantin Novoselov",
  "Stuart Parkin",
  "Eli Harari",
  "Sanjay Mehrotra",
  "Fujio Masuoka",
  "Sebastian Thrun",
  "Chris Urmson",
  "Raffaello D'Andrea",
  "Vijay Kumar",
  "Daniela Rus",
  "Henrik Fisker",
  "JB Straubel",
  "Franz von Holzhausen",
  "Mary Lou Jepsen",
];

// ~100 living thought leaders / science communicators / public intellectuals.
const LIVING_THOUGHT_LEADERS: string[] = [
  "Neil deGrasse Tyson",
  "Bill Nye",
  "Brian Cox",
  "Richard Dawkins",
  "Steven Pinker",
  "David Attenborough",
  "Carlo Rovelli",
  "Sabine Hossenfelder",
  "Hannah Fry",
  "Adam Rutherford",
  "Alice Roberts",
  "Jim Al-Khalili",
  "Marcus du Sautoy",
  "Steven Strogatz",
  "Ed Yong",
  "Mary Roach",
  "Carl Zimmer",
  "Siddhartha Mukherjee",
  "Atul Gawande",
  "Sanjay Gupta",
  "Robert Sapolsky",
  "Andrew Huberman",
  "Dan Ariely",
  "Sam Harris",
  "Yuval Noah Harari",
  "Max Tegmark",
  "Nick Bostrom",
  "Ray Kurzweil",
  "Emily Calandrelli",
  "Dianna Cowern",
  "Derek Muller",
  "Hank Green",
  "Michael Stevens",
  "Destin Sandlin",
  "Mark Rober",
  "Philipp Dettmer",
  "Henry Reich",
  "Grant Sanderson",
  "Cleo Abram",
  "Simone Giertz",
  "Toby Hendy",
  "Kate Biberdorf",
  "Joe Hanson",
  "Anton Petrov",
  "Fraser Cain",
  "Phil Plait",
  "Katie Mack",
  "Chanda Prescod-Weinstein",
  "Janna Levin",
  "Priyamvada Natarajan",
  "Jo Dunkley",
  "Maggie Aderin-Pocock",
  "Chris Hadfield",
  "Scott Kelly",
  "Mae Jemison",
  "Kathryn Sullivan",
  "Peggy Whitson",
  "Tim Peake",
  "Samantha Cristoforetti",
  "Bill McKibben",
  "Katharine Hayhoe",
  "Greta Thunberg",
  "Vandana Shiva",
  "Paul Stamets",
  "Merlin Sheldrake",
  "Suzanne Simard",
  "Robin Wall Kimmerer",
  "Hope Jahren",
  "Temple Grandin",
  "Carl Safina",
  "Sylvia Earle",
  "Enric Sala",
  "Robert Ballard",
  "Bjørn Lomborg",
  "Vaclav Smil",
  "Steven Johnson",
  "Walter Isaacson",
  "Lawrence Krauss",
  "Leonard Susskind",
  "Stephon Alexander",
  "Brian Keating",
  "Don Lincoln",
  "Matt O'Dowd",
  "Paul Davies",
  "Martin Rees",
  "Marcus Chown",
  "Angela Saini",
  "Ainissa Ramirez",
  "Raychelle Burks",
  "Samuel Ramsey",
  "Diana Trujillo",
  "Swati Mohan",
  "Michio Kaku",
  "Adam Savage",
  "Jamie Hyneman",
  "Richard Wiseman",
  "Michael Shermer",
  "Bill Bryson",
  "David Eagleman",
  "V.S. Ramachandran",
];

// Original Task #14 list (mostly historical) — kept for backward-compat so a
// re-run upserts those rows with a sensible group rather than leaving them out.
const LEGACY_PEOPLE: string[] = [
  "Albert Einstein",
  "Isaac Newton",
  "Marie Curie",
  "Charles Darwin",
  "Galileo Galilei",
  "Nikola Tesla",
  "Thomas Edison",
  "Louis Pasteur",
  "Michael Faraday",
  "Niels Bohr",
  "Max Planck",
  "Erwin Schrödinger",
  "Werner Heisenberg",
  "Richard Feynman",
  "Stephen Hawking",
  "Carl Sagan",
  "Edwin Hubble",
  "Johannes Kepler",
  "Nicolaus Copernicus",
  "Tycho Brahe",
  "Caroline Herschel",
  "Annie Jump Cannon",
  "Henrietta Swan Leavitt",
  "Cecilia Payne-Gaposchkin",
  "Subrahmanyan Chandrasekhar",
  "Vera Rubin",
  "Jocelyn Bell Burnell",
  "Katherine Johnson",
  "Dmitri Mendeleev",
  "Antoine Lavoisier",
  "Robert Boyle",
  "John Dalton",
  "Linus Pauling",
  "Rosalind Franklin",
  "Dorothy Hodgkin",
  "Fritz Haber",
  "Glenn Seaborg",
  "Ahmed Zewail",
  "Gregor Mendel",
  "James Watson",
  "Francis Crick",
  "Barbara McClintock",
  "Lynn Margulis",
  "Rachel Carson",
  "Jane Goodall",
  "E. O. Wilson",
  "Alexander von Humboldt",
  "Carl Linnaeus",
  "Alfred Russel Wallace",
  "Antonie van Leeuwenhoek",
  "Robert Koch",
  "Alexander Fleming",
  "Jonas Salk",
  "Edward Jenner",
  "Florence Nightingale",
  "Elizabeth Blackwell",
  "Virginia Apgar",
  "Gertrude Elion",
  "Frances Kelsey",
  "Tu Youyou",
  "Santiago Ramón y Cajal",
  "Rita Levi-Montalcini",
  "Camillo Golgi",
  "Eric Kandel",
  "Ivan Pavlov",
  "Norman Borlaug",
  "George Washington Carver",
  "Wangari Maathai",
  "Luther Burbank",
  "Justus von Liebig",
  "Svante Arrhenius",
  "Charles David Keeling",
  "James Lovelock",
  "Syukuro Manabe",
  "Joanne Simpson",
  "Alfred Wegener",
  "Inge Lehmann",
  "Marie Tharp",
  "Ada Lovelace",
  "Alan Turing",
  "Charles Babbage",
  "Grace Hopper",
  "John von Neumann",
  "Claude Shannon",
  "Tim Berners-Lee",
  "Hedy Lamarr",
  "Guglielmo Marconi",
  "Alexander Graham Bell",
  "Samuel Morse",
  "James Clerk Maxwell",
  "Heinrich Hertz",
  "Lord Kelvin",
  "Wilhelm Röntgen",
  "Ernest Rutherford",
  "Enrico Fermi",
  "Lise Meitner",
  "Chien-Shiung Wu",
  "Emmy Noether",
  "Katsuko Saruhashi",
  "Mario Molina",
  "Stephanie Kwolek",
  "Percy Lavon Julian",
  "Charles Goodyear",
  "Willis Carrier",
  "Garrett Morgan",
  "Granville Woods",
  "Leonardo da Vinci",
  "Peter Diamandis",
  "Salim Ismail",
  "Dave Blundin",
  "Alexander Wissner-Gross",
];

// Group inference for the legacy list (defaults to scientist).
const LEGACY_INVENTORS = new Set<string>([
  "Thomas Edison",
  "Nikola Tesla",
  "Alexander Graham Bell",
  "Samuel Morse",
  "Guglielmo Marconi",
  "Charles Goodyear",
  "Willis Carrier",
  "Garrett Morgan",
  "Granville Woods",
  "Charles Babbage",
  "Stephanie Kwolek",
  "Hedy Lamarr",
  "Tim Berners-Lee",
  "Leonardo da Vinci",
]);
const LEGACY_THOUGHT_LEADERS = new Set<string>([
  "Carl Sagan",
  "Peter Diamandis",
  "Salim Ismail",
  "Dave Blundin",
  "Alexander Wissner-Gross",
]);

function legacyGroup(name: string): ProfileGroup {
  if (LEGACY_THOUGHT_LEADERS.has(name)) return "thought_leader";
  if (LEGACY_INVENTORS.has(name)) return "inventor";
  return "scientist";
}

function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Build the combined, de-duplicated (by slug) people list. Living groups come
// first so a quota-limited partial run seeds the Task #18 focus first.
function buildPeople(): Person[] {
  const combined: Person[] = [
    ...LIVING_SCIENTISTS.map((name) => ({ name, group: "scientist" as const })),
    ...LIVING_INVENTORS.map((name) => ({ name, group: "inventor" as const })),
    ...LIVING_THOUGHT_LEADERS.map((name) => ({
      name,
      group: "thought_leader" as const,
    })),
    ...LEGACY_PEOPLE.map((name) => ({ name, group: legacyGroup(name) })),
  ];
  const seen = new Set<string>();
  const people: Person[] = [];
  for (const p of combined) {
    const slug = slugify(p.name);
    if (seen.has(slug)) continue;
    seen.add(slug);
    people.push(p);
  }
  return people;
}

// Curated profiles whose source of truth is a single authoritative page rather
// than broad web search. These are seeded directly (no Gemini research) so the
// record matches the person's own site exactly. Still upserted on slug, so the
// run stays idempotent.
interface CuratedProfile {
  slug: string;
  name: string;
  group: ProfileGroup;
  field: string;
  era: string;
  summary: string;
  contributions: string[];
  quotes: string[];
  imageUrl: string | null;
  relatedCategorySlugs: (typeof CATEGORY_SLUGS)[number][];
  sources: ProfileSource[];
  patents?: ProfilePatent[];
}

// Real, verified patents keyed by profile slug. Every entry was confirmed
// against its public record (Google Patents / Justia inventor pages) so the
// directory never displays a fabricated patent. `url` links to the
// authoritative source. Only profiles whose patents are verifiable appear
// here; profiles absent from this map render no Patents section.
const PATENTS_BY_SLUG: Record<string, ProfilePatent[]> = {
  "manu-rehani": [
    {
      title: "Storage system for pervasive and mobile content",
      number: "US 9,787,454",
      year: "2017",
      url: "https://patents.google.com/patent/US9787454",
    },
    {
      title: "Real-time autonomous organization",
      number: "US 9,667,513",
      year: "2017",
      url: "https://patents.google.com/patent/US9667513",
    },
    {
      title: "Methods and systems for measuring semantics in communications",
      number: "US 9,269,353",
      year: "2016",
      url: "https://patents.google.com/patent/US9269353",
    },
    {
      title: "Format for displaying text analytics results",
      number: "US 9,020,807",
      year: "2015",
      url: "https://patents.google.com/patent/US9020807",
    },
    {
      title: "Taxonomy and application of language analysis and processing",
      number: "US 8,996,359",
      year: "2015",
      url: "https://patents.google.com/patent/US8996359",
    },
    {
      title: "Enactive perception device",
      number: "US 8,952,796",
      year: "2015",
      url: "https://patents.google.com/patent/US8952796",
    },
    {
      title:
        "Methods and systems for identifying, quantifying, analyzing, and optimizing the level of engagement of components within a defined ecosystem or context",
      number: "US 8,577,718",
      year: "2013",
      url: "https://patents.google.com/patent/US8577718",
    },
  ],
  "hedy-lamarr": [
    {
      title: "Secret Communication System (frequency hopping)",
      number: "US 2,292,387",
      year: "1942",
      url: "https://patents.google.com/patent/US2292387A",
    },
  ],
  "james-dyson": [
    {
      title: "Vacuum cleaning appliance (Dual Cyclone)",
      number: "US 4,593,429",
      year: "1986",
      url: "https://patents.google.com/patent/US4593429",
    },
  ],
  "lonnie-johnson": [
    {
      title: "Double tank pinch trigger pump water gun (Super Soaker)",
      number: "US 5,150,819",
      year: "1992",
      url: "https://patents.google.com/patent/US5150819",
    },
  ],
  "dean-kamen": [
    {
      title: "Riderless stabilization of a balancing transporter (Segway)",
      number: "US 6,779,621",
      year: "2004",
      url: "https://patents.google.com/patent/US6779621",
    },
  ],
  "federico-faggin": [
    {
      title: "Object position detector with edge motion feature (touchpad)",
      number: "US 5,543,590",
      year: "1996",
      url: "https://patents.google.com/patent/US5543590",
    },
    {
      title: "Finger/stylus touch pad",
      number: "US 8,089,470",
      year: "2012",
      url: "https://patents.google.com/patent/US8089470",
    },
  ],
  "radia-perlman": [
    {
      title:
        "Reliable broadcast of information in a wide area network (Spanning Tree Protocol)",
      number: "US 5,086,428",
      year: "1992",
      url: "https://patents.google.com/patent/US5086428",
    },
    {
      title:
        "Method and apparatus for preventing spanning tree loops during traffic overload conditions",
      number: "US 7,339,900",
      year: "2008",
      url: "https://patents.google.com/patent/US7339900B2",
    },
  ],
  "manu-prakash": [
    {
      title: "Foldscope — ultra-low-cost folding microscope",
      number: "US 9,696,535",
      year: "2017",
      url: "https://patents.google.com/patent/US9696535B2",
    },
    {
      title: "Paperfuge — paper-based centrifugation platform",
      number: "US 11,331,665",
      year: "2022",
      url: "https://patents.google.com/patent/US11331665B2",
    },
  ],
};

const CURATED_PROFILES: CuratedProfile[] = [
  {
    slug: "manu-rehani",
    name: "Manu Rehani",
    group: "inventor",
    field: "Behavioral Intelligence & Dual-Use Technology",
    era: "Contemporary",
    summary:
      "Manu Rehani is an Austin, Texas–based inventor, engineer, and advisor working at the intersection of behavioral intelligence, artificial intelligence, and dual-use technology. He describes his work as building behavioral intelligence for the AI-native renaissance, spanning cloud infrastructure, autonomous systems, and wearable technology. With two company exits and twelve patents to his name, he builds and advises across cognitive modeling and design for relevance fit.",
    contributions: [
      "Holds twelve patents spanning cloud storage, large language models, autonomous systems, and wearable intelligence.",
      "Achieved two startup exits in behavioral intelligence and dual-use technology.",
      "Works as an inventor, engineer, and advisor at the intersection of behavioral intelligence, AI, and dual-use technology.",
      "Develops cognitive modeling and 'design for relevance fit' approaches for AI-native systems.",
    ],
    quotes: ["Behavioral intelligence for the AI-native renaissance."],
    imageUrl: "https://www.rehani.co/optimized/manu-portrait-1600.jpg",
    relatedCategorySlugs: ["neuroscience", "materials-science"],
    sources: [
      { title: "rehani.co", url: "https://rehani.co" },
      {
        title: "Manu Rehani — Behavioral Intelligence",
        url: "https://rehani.co/behavioral-intelligence",
      },
    ],
  },
];

async function seedCurated(profile: CuratedProfile): Promise<string> {
  const patents = profile.patents ?? PATENTS_BY_SLUG[profile.slug] ?? [];
  await db
    .insert(featuredProfilesTable)
    .values({ ...profile, patents })
    .onConflictDoUpdate({
      target: featuredProfilesTable.slug,
      set: {
        name: profile.name,
        group: profile.group,
        field: profile.field,
        era: profile.era,
        summary: profile.summary,
        contributions: profile.contributions,
        quotes: profile.quotes,
        imageUrl: profile.imageUrl,
        relatedCategorySlugs: profile.relatedCategorySlugs,
        sources: profile.sources,
        patents,
        updatedAt: new Date(),
      },
    });
  return `ok [curated/${profile.group}]: ${profile.name}`;
}

interface ResearchedProfile {
  field: string;
  era: string;
  summary: string;
  contributions: string[];
  quotes: string[];
  relatedCategorySlugs: string[];
}

function asStringArray(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, max);
}

// Pull a JSON object out of a possibly fenced / prose-wrapped model reply.
function parseJsonObject(text: string): Record<string, unknown> | null {
  let candidate = text.trim();
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    return null;
  }
}

const GROUP_DESC: Record<ProfileGroup, string> = {
  scientist: "living scientist (an active or recent researcher in a scientific discipline)",
  inventor: "living inventor, engineer, or technology creator",
  thought_leader:
    "living science communicator, public intellectual, or well-known thought leader in the scientific space",
};

const RESEARCH_PROMPT = (name: string, group: ProfileGroup) =>
  `Research the ${GROUP_DESC[group]} "${name}" using up-to-date, factual web sources. This person is living — do NOT include a death year.

Respond with ONLY a single JSON object (no markdown, no prose) with exactly these keys:
{
  "field": "primary field of work, e.g. Physics, Genetics, Robotics, Science Communication",
  "era": "the period they have been active, e.g. \\"21st century\\", \\"since the 1990s\\", or \\"b. 1964\\" — no death year",
  "summary": "2-4 sentence plain-text biography of who they are and why they matter",
  "contributions": ["3-6 short strings, each one key discovery, invention, or contribution"],
  "quotes": ["0-3 short, accurately attributed direct quotes; empty array if none are well-documented"],
  "relatedCategorySlugs": ["1-3 slugs picked ONLY from this list that best match their work"]
}

Allowed relatedCategorySlugs values: ${CATEGORY_SLUGS.join(", ")}.

Only state facts you can support from the sources. Do not invent quotes.`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The Gemini free tier allows ~5 requests/min. On a 429 the API tells us how
// long to wait via retryDelay; honour it (with a sane floor/ceiling) and retry.
async function researchWithRetry(
  name: string,
  group: ProfileGroup,
  maxRetries = 2,
): Promise<{ text: string; sources: ProfileSource[] }> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await researchWithSearch(RESEARCH_PROMPT(name, group), {
        maxOutputTokens: 2048,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const is429 =
        message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
      const isTransient =
        message.includes("503") ||
        message.includes("UNAVAILABLE") ||
        message.includes("500") ||
        message.includes("overloaded");
      if ((!is429 && !isTransient) || attempt >= maxRetries) throw err;
      const match = message.match(/"retryDelay":\s*"(\d+)s"/);
      const fallback = is429 ? 20 : 8;
      const waitMs = Math.min(
        30_000,
        Math.max(
          isTransient && !is429 ? 8_000 : 12_000,
          (match ? Number(match[1]) : fallback) * 1000 + 1000,
        ),
      );
      console.log(
        `  retrying ${name} (${is429 ? "429" : "transient"}); waiting ${Math.round(waitMs / 1000)}s...`,
      );
      await sleep(waitMs);
    }
  }
}

async function research(
  name: string,
  group: ProfileGroup,
): Promise<{
  profile: ResearchedProfile;
  sources: ProfileSource[];
} | null> {
  const { text, sources } = await researchWithRetry(name, group);
  const parsed = parseJsonObject(text);
  if (!parsed) return null;

  const summary =
    typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const field = typeof parsed.field === "string" ? parsed.field.trim() : "";
  const era = typeof parsed.era === "string" ? parsed.era.trim() : "";
  if (!summary || !field || !era) return null;

  const related = asStringArray(parsed.relatedCategorySlugs, 3).filter(
    (s): s is (typeof CATEGORY_SLUGS)[number] =>
      (CATEGORY_SLUGS as readonly string[]).includes(s),
  );

  return {
    profile: {
      field,
      era,
      summary,
      contributions: asStringArray(parsed.contributions, 6),
      quotes: asStringArray(parsed.quotes, 3),
      relatedCategorySlugs: related,
    },
    sources: sources.slice(0, 8),
  };
}

// Fetch a portrait image URL from Wikipedia's REST summary endpoint.
async function fetchPortrait(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        name,
      )}`,
      {
        headers: {
          "User-Agent":
            "CitizenScienceSeed/1.0 (educational directory seeding)",
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      originalimage?: { source?: string };
      thumbnail?: { source?: string };
      type?: string;
    };
    if (data.type === "disambiguation") return null;
    return data.originalimage?.source ?? data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

async function seedOne(person: Person, force: boolean): Promise<string> {
  const { name, group } = person;
  const slug = slugify(name);

  if (!force) {
    const [existing] = await db
      .select({ id: featuredProfilesTable.id })
      .from(featuredProfilesTable)
      .where(sql`${featuredProfilesTable.slug} = ${slug}`);
    if (existing) return `skip (exists): ${name}`;
  }

  const researched = await research(name, group);
  if (!researched) return `FAIL (no usable research): ${name}`;

  const imageUrl = await fetchPortrait(name);

  const values = {
    slug,
    name,
    group,
    field: researched.profile.field,
    era: researched.profile.era,
    summary: researched.profile.summary,
    contributions: researched.profile.contributions,
    quotes: researched.profile.quotes,
    imageUrl,
    relatedCategorySlugs: researched.profile.relatedCategorySlugs,
    sources: researched.sources,
    patents: PATENTS_BY_SLUG[slug] ?? [],
  };

  await db
    .insert(featuredProfilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: featuredProfilesTable.slug,
      set: {
        name: values.name,
        group: values.group,
        field: values.field,
        era: values.era,
        summary: values.summary,
        contributions: values.contributions,
        quotes: values.quotes,
        imageUrl: values.imageUrl,
        relatedCategorySlugs: values.relatedCategorySlugs,
        sources: values.sources,
        patents: values.patents,
        updatedAt: new Date(),
      },
    });

  return `ok [${group}]${imageUrl ? "" : " (no portrait)"}: ${name}`;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  const limit = arg ? Number.parseInt(arg, 10) : NaN;
  const force = process.env.FORCE === "1";

  const groupFilter = process.env.GROUP as ProfileGroup | undefined;
  let people = buildPeople();
  if (groupFilter) {
    people = people.filter((p) => p.group === groupFilter);
  }
  if (Number.isFinite(limit)) {
    people = people.slice(0, limit);
  }

  console.log(
    `Seeding ${people.length} profiles${groupFilter ? ` (group=${groupFilter})` : ""} (serial pacing${force ? ", force" : ""})...`,
  );

  // The free tier allows ~5 requests/min, so pace research calls ~12s apart to
  // mostly avoid 429s (researchWithRetry backs off when we still hit one).
  // On a paid key the per-minute limit is far higher, so PACE_MS can be lowered
  // via env (e.g. PACE_MS=2000) to finish the full list in fewer passes.
  const PACE_MS = Number.isFinite(Number(process.env.PACE_MS))
    ? Number(process.env.PACE_MS)
    : 12_500;

  // Seed curated profiles first (no API calls). Respect the GROUP filter if set.
  const curated = groupFilter
    ? CURATED_PROFILES.filter((p) => p.group === groupFilter)
    : CURATED_PROFILES;
  for (const profile of curated) {
    try {
      console.log(await seedCurated(profile));
    } catch (err) {
      console.error(
        `ERROR (curated): ${profile.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  let done = 0;
  for (const person of people) {
    let madeApiCall = true;
    try {
      const result = await seedOne(person, force);
      madeApiCall = !result.startsWith("skip");
      done += 1;
      console.log(`[${done}/${people.length}] ${result}`);
    } catch (err) {
      done += 1;
      console.error(
        `[${done}/${people.length}] ERROR: ${person.name}:`,
        err instanceof Error ? err.message : err,
      );
    }
    if (madeApiCall && done < people.length) await sleep(PACE_MS);
  }

  console.log("Done.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
