// Custom "Follow in Their Footsteps" experiments for Nobel laureates.
//
// The Nobel import (Task #101) gives every laureate a structured prize record:
// the category (Physics, Chemistry, Medicine, Literature, Peace, Economics) and
// a `motivation` sentence describing *exactly* what they were honoured for
// (e.g. "for their discovery of the bacterium Helicobacter pylori..."). Rather
// than show the generic, placeholder category experiments, this module turns
// that real award context into a handful of safe, genuinely hands-on activities
// tailored to the laureate's discipline and discovery.
//
// It is fully deterministic (no AI / network) so it covers all ~1,000 imported
// laureates instantly and degrades gracefully: a laureate whose discovery
// matches no specific keyword still gets sensible discipline defaults, and a
// profile with no prizes gets nothing.

import { type Difficulty } from "./categories";
import type { ProfileNobelPrize } from "@workspace/api-client-react";

export interface NobelFootstep {
  id: string;
  title: string;
  /** One line tying the activity to the laureate's field/discovery. */
  hook: string;
  difficulty: Difficulty;
  estimatedTime: string;
  materials: string[];
  steps: string[];
}

// Nobel category short codes used by the import (mirrors ProfileNobelPrize.categoryCode).
type CategoryCode = "phy" | "che" | "med" | "eco" | "lit" | "pea";

interface FootstepTemplate {
  id: string;
  /** Which Nobel categories this activity fits. */
  categories: CategoryCode[];
  /** Motivation keywords that make this a strong, specific match (lowercase). */
  keywords: string[];
  title: string;
  /** Built per-laureate so the card reads as written for them. */
  hook: (name: string) => string;
  difficulty: Difficulty;
  estimatedTime: string;
  materials: string[];
  steps: string[];
}

/** Strip the light HTML (e.g. `<i>` around species names) the Nobel API ships. */
export function stripMotivationHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const TEMPLATES: FootstepTemplate[] = [
  // ---- Physics ----------------------------------------------------------
  {
    id: "phy-optics",
    categories: ["phy"],
    keywords: [
      "light",
      "optic",
      "photo",
      "laser",
      "spectr",
      "refract",
      "lens",
      "electromagnet",
      "infrared",
      "ultraviolet",
      "x-ray",
      "wave",
    ],
    title: "Bend Light Through Water",
    hook: (n) => `The physics ${n} is celebrated for begins with how light itself behaves.`,
    difficulty: "Beginner",
    estimatedTime: "20 min",
    materials: [
      "A clear glass of water",
      "A pencil or straw",
      "A flashlight or laser pointer",
      "A sheet of white paper",
    ],
    steps: [
      "Stand a pencil in the glass of water and look from the side — notice how it appears to break at the surface. That bending is refraction.",
      "Shine the flashlight through the glass onto the paper and watch the beam bend as it enters and leaves the water.",
      "Tilt the glass at different angles and record which angle bends the beam most.",
      "Explain what you see: light slows down in water, and changing speed changes its direction.",
    ],
  },
  {
    id: "phy-em",
    categories: ["phy"],
    keywords: [
      "magnet",
      "electr",
      "semiconductor",
      "transistor",
      "conduct",
      "superconduct",
      "current",
      "charge",
      "electron",
    ],
    title: "Build a Simple Electromagnet",
    hook: (n) =>
      `Electricity and magnetism — the forces at the heart of ${n}'s field — made tangible.`,
    difficulty: "Beginner",
    estimatedTime: "30 min",
    materials: [
      "An iron nail",
      "About 1 m of insulated copper wire",
      "A 1.5V AA battery",
      "Steel paperclips",
      "Tape",
    ],
    steps: [
      "Wrap the copper wire tightly around the nail 30–50 times, leaving two free ends.",
      "Strip a little insulation off each end and tape them to the battery terminals.",
      "Bring the nail near the paperclips and count how many it picks up.",
      "Add more coils, test again, and record how coil count changes the magnetic strength.",
      "Disconnect the battery and watch the magnetism vanish — the field exists only while current flows.",
    ],
  },
  {
    id: "phy-radioactive",
    categories: ["phy"],
    keywords: [
      "radioactiv",
      "radium",
      "isotope",
      "nucle",
      "atom",
      "decay",
      "particle",
      "neutr",
      "quantum",
      "cosmic",
      "fission",
      "fusion",
    ],
    title: "Model Radioactive Half-Life",
    hook: (n) => `Model the atomic decay that defines the physics ${n} is remembered for.`,
    difficulty: "Intermediate",
    estimatedTime: "25 min",
    materials: [
      "100 coins (or a bag of dried beans)",
      "A large tray or box",
      "Paper and pencil",
      "Graph paper or a spreadsheet",
    ],
    steps: [
      "Spread all 100 coins heads-up — these are your undecayed 'atoms'.",
      "Toss them all, remove every coin that lands tails ('decayed'), and count what remains.",
      "Repeat the toss with only the survivors, logging the count after each round.",
      "Continue until none remain.",
      "Plot survivors versus round — you'll see the exponential half-life curve that governs real radioactive decay.",
    ],
  },
  {
    id: "phy-astro",
    categories: ["phy"],
    keywords: [
      "star",
      "galax",
      "cosmic",
      "universe",
      "gravitational",
      "neutron",
      "black hole",
      "planet",
      "cosmolog",
      "expansion",
      "microwave background",
    ],
    title: "Model the Expanding Universe",
    hook: (n) => `Reach for the same cosmos ${n} helped explain.`,
    difficulty: "Beginner",
    estimatedTime: "15 min",
    materials: ["A balloon", "A marker", "A flexible measuring tape or string"],
    steps: [
      "Partially inflate the balloon and draw 6–8 dots on it to represent galaxies.",
      "Measure the distance between several pairs of dots and record them.",
      "Inflate the balloon further and measure the same pairs again.",
      "Notice that every dot moves away from every other — and the farthest ones separate fastest, exactly like Hubble's expanding universe.",
    ],
  },
  {
    id: "phy-pendulum",
    categories: ["phy"],
    keywords: [],
    title: "Investigate a Pendulum's Rhythm",
    hook: (n) => `Measure motion with the same precision ${n}'s physics demanded.`,
    difficulty: "Beginner",
    estimatedTime: "20 min",
    materials: [
      "A length of string",
      "A small weight (a nut, washer, or sinker)",
      "A stopwatch (your phone)",
      "A ruler",
      "Tape",
    ],
    steps: [
      "Tie the weight to the string and tape the other end to a table edge so it swings freely.",
      "Pull it back a small angle, time 10 full swings, and divide by 10 for the period.",
      "Shorten the string and repeat, recording period versus length.",
      "Try a heavier weight at the same length and confirm the period barely changes.",
      "Plot length versus period to uncover the law that pendulums obey.",
    ],
  },
  {
    id: "phy-sound",
    categories: ["phy"],
    keywords: [],
    title: "Make Sound Visible",
    hook: (n) => `Make the invisible waves of ${n}'s physics visible.`,
    difficulty: "Beginner",
    estimatedTime: "15 min",
    materials: [
      "A metal bowl or a speaker",
      "Plastic wrap",
      "A rubber band",
      "A few grains of rice or sugar",
    ],
    steps: [
      "Stretch plastic wrap tightly over the bowl and secure it with the rubber band.",
      "Sprinkle a few grains of rice on the surface.",
      "Play loud music nearby or sing close to it.",
      "Watch the grains jump — you're seeing the pressure waves that carry all sound.",
      "Test different pitches and volumes and note how the pattern changes.",
    ],
  },

  // ---- Chemistry --------------------------------------------------------
  {
    id: "che-crystal",
    categories: ["che"],
    keywords: [
      "crystal",
      "structure",
      "molecul",
      "x-ray",
      "protein",
      "lattice",
      "mineral",
      "diffraction",
    ],
    title: "Grow Your Own Crystals",
    hook: (n) =>
      `See the orderly molecular structures chemists like ${n} spent careers decoding.`,
    difficulty: "Beginner",
    estimatedTime: "3–5 days",
    materials: [
      "Table salt or sugar",
      "A clear jar",
      "Hot water",
      "A string and a pencil",
      "A spoon",
    ],
    steps: [
      "Stir salt (or sugar) into hot water until no more dissolves — a saturated solution.",
      "Tie the string to a pencil and rest it across the jar so the string hangs in the liquid.",
      "Place the jar somewhere still and undisturbed.",
      "Check daily as crystals build on the string over several days.",
      "Examine the repeating geometric shapes — the same orderly structure crystallographers decode.",
    ],
  },
  {
    id: "che-reaction",
    categories: ["che"],
    keywords: [
      "reaction",
      "synthesis",
      "cataly",
      "bond",
      "oxid",
      "combust",
      "polymer",
    ],
    title: "Kitchen Acid–Base Reactions",
    hook: (n) => `Witness chemical reactions transform matter, the craft ${n} was honoured for.`,
    difficulty: "Beginner",
    estimatedTime: "15 min",
    materials: [
      "Baking soda",
      "Vinegar",
      "Lemon juice",
      "A few clear cups",
      "A balloon (optional)",
    ],
    steps: [
      "Put a spoon of baking soda in a cup and add vinegar — observe the fizzing carbon-dioxide reaction.",
      "Stretch a balloon over a bottle of baking soda, add vinegar, and watch it inflate from the gas produced.",
      "Compare vinegar versus lemon juice to see which reacts more vigorously.",
      "Record the bubbles and any temperature change for each pairing.",
    ],
  },
  {
    id: "che-indicator",
    categories: ["che"],
    keywords: ["acid", "base", "ph", "indicator", "alkal"],
    title: "Make a Color-Changing pH Indicator",
    hook: (n) => `Reveal hidden acids and bases, a chemist's everyday tool in ${n}'s world.`,
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    materials: [
      "Red cabbage",
      "Hot water",
      "A strainer",
      "Clear cups",
      "Household liquids: vinegar, baking-soda water, soap, lemon juice",
    ],
    steps: [
      "Chop red cabbage, steep it in hot water for 10 minutes, then strain to get a purple liquid.",
      "Pour the indicator into several cups.",
      "Add a different household liquid to each cup.",
      "Watch acids turn it pink/red and bases turn it green/blue.",
      "Rank your liquids from most acidic to most basic by colour.",
    ],
  },
  {
    id: "che-electro",
    categories: ["che"],
    keywords: ["electrochem", "battery", "ion", "electrolys", "redox", "electrode"],
    title: "Build a Lemon Battery",
    hook: (n) => `Turn chemistry into electricity, bridging the fields ${n} explored.`,
    difficulty: "Intermediate",
    estimatedTime: "25 min",
    materials: [
      "2–4 lemons",
      "Copper coins or wire",
      "Galvanized (zinc) nails",
      "Alligator-clip wires",
      "A small LED or a multimeter",
    ],
    steps: [
      "Insert a copper piece and a zinc nail into each lemon, not touching.",
      "Connect lemons in series: copper of one to zinc of the next with clip wires.",
      "Attach the free ends to an LED or multimeter.",
      "Measure the voltage and watch the LED glow — chemical energy becoming electrical energy.",
      "Add more lemons and record how the voltage rises.",
    ],
  },
  {
    id: "che-climate",
    categories: ["che"],
    keywords: ["ozone", "atmospher", "carbon", "greenhouse", "climate", "pollut"],
    title: "Model the Greenhouse Effect",
    hook: (n) => `Explore the atmospheric chemistry connected to ${n}'s work.`,
    difficulty: "Beginner",
    estimatedTime: "30 min",
    materials: [
      "Two identical jars",
      "Two thermometers",
      "Plastic wrap",
      "A sunny window or a lamp",
    ],
    steps: [
      "Place a thermometer in each jar and record the starting temperature.",
      "Seal one jar with plastic wrap (its 'atmosphere'); leave the other open.",
      "Put both in direct sun or under a lamp for 20 minutes.",
      "Record the temperature in each every few minutes.",
      "Compare — the sealed jar warms faster, showing how trapped gases heat a planet.",
    ],
  },

  // ---- Physiology or Medicine ------------------------------------------
  {
    id: "med-micro",
    categories: ["med"],
    keywords: [
      "bacteri",
      "virus",
      "microb",
      "infect",
      "pylori",
      "antibio",
      "immun",
      "vaccine",
      "pathogen",
      "disease",
      "fungus",
      "parasite",
    ],
    title: "Map the Microbes Around You",
    hook: (n) => `Hunt for the unseen microbes central to the medicine ${n} advanced.`,
    difficulty: "Beginner",
    estimatedTime: "3–5 days",
    materials: [
      "Unflavored gelatin (or store-bought agar plates)",
      "A few clean jars with lids",
      "Cotton swabs",
      "Tape and a marker",
    ],
    steps: [
      "If using gelatin, dissolve it with a little sugar or bouillon, pour into jars, and let it set as a growth surface.",
      "Swab different surfaces — a doorknob, your phone, unwashed versus washed hands.",
      "Wipe each swab gently across its own dish, then seal and label it.",
      "Keep the dishes warm and undisturbed for a few days.",
      "Compare how many colonies grow from each source — never open the sealed dishes — and conclude which surfaces carry the most microbes.",
    ],
  },
  {
    id: "med-dna",
    categories: ["med"],
    keywords: [
      "dna",
      "gene",
      "genome",
      "chromosome",
      "rna",
      "hered",
      "mutation",
      "genetic",
    ],
    title: "Extract DNA from a Strawberry",
    hook: (n) => `Hold the molecule of heredity behind ${n}'s field in your hands.`,
    difficulty: "Beginner",
    estimatedTime: "20 min",
    materials: [
      "A ripe strawberry",
      "A zip bag",
      "Dish soap",
      "Salt",
      "Cold rubbing alcohol",
      "A clear cup and a coffee filter",
    ],
    steps: [
      "Put the strawberry in the bag and mash it thoroughly.",
      "Mix a little dish soap and a pinch of salt into half a cup of water, add it to the bag, and mash gently.",
      "Filter the mixture through a coffee filter into a clear cup.",
      "Slowly pour cold alcohol down the side so it floats on top.",
      "Watch white, stringy DNA appear at the boundary — lift it out with a toothpick.",
    ],
  },
  {
    id: "med-blood",
    categories: ["med"],
    keywords: [
      "blood",
      "circul",
      "heart",
      "vascular",
      "anaemia",
      "anemia",
      "haemoglobin",
      "hemoglobin",
      "plasma",
    ],
    title: "Model Blood Typing",
    hook: (n) => `Model the biology of blood that medicine like ${n}'s depends on.`,
    difficulty: "Intermediate",
    estimatedTime: "25 min",
    materials: [
      "Four cups of differently coloured water (standing in for types A, B, AB, O)",
      "Droppers",
      "A marker and labels",
      "A worksheet",
    ],
    steps: [
      "Label four cups A, B, AB, and O and give each a distinct colour.",
      "Invent a simple rule for which combinations 'clump' (react) when mixed.",
      "Mix samples pair by pair and record which combinations react.",
      "Build a compatibility chart for safe transfusions.",
      "Explain why O is the universal donor and AB the universal recipient.",
    ],
  },
  {
    id: "med-neuro",
    categories: ["med"],
    keywords: [
      "brain",
      "neuro",
      "nerve",
      "neuron",
      "sensory",
      "vision",
      "cortex",
      "signal",
      "reflex",
    ],
    title: "Test Your Reaction Time",
    hook: (n) =>
      `Probe how nerves carry signals, the living machinery ${n} helped illuminate.`,
    difficulty: "Beginner",
    estimatedTime: "15 min",
    materials: ["A 30 cm ruler", "A partner", "Paper to record results"],
    steps: [
      "Have your partner hold the ruler vertically with the zero end at your open fingers.",
      "Without warning, they drop it and you catch it as fast as you can.",
      "Record how far it fell before you caught it — less distance means a faster reaction.",
      "Repeat 10 times and average your score.",
      "Test how distraction, fatigue, or your other hand changes the result.",
    ],
  },
  {
    id: "med-nutrition",
    categories: ["med"],
    keywords: [
      "vitamin",
      "nutri",
      "metabol",
      "hormone",
      "insulin",
      "enzyme",
      "digest",
    ],
    title: "Test Foods for Vitamin C",
    hook: (n) => `Measure the chemistry of nutrition tied to ${n}'s medical work.`,
    difficulty: "Intermediate",
    estimatedTime: "30 min",
    materials: [
      "Tincture of iodine",
      "Cornstarch",
      "Water",
      "Droppers",
      "Clear cups",
      "Juices to test (orange, lemon, apple)",
    ],
    steps: [
      "Make an indicator by mixing a little cornstarch in water and adding iodine until it turns blue-black.",
      "Add a measured amount of each juice drop by drop into a cup of indicator.",
      "Count how many drops it takes to clear the blue colour — vitamin C neutralises the iodine.",
      "Fewer drops means more vitamin C.",
      "Rank your juices by vitamin C content.",
    ],
  },

  // ---- Economic Sciences -----------------------------------------------
  {
    id: "eco-behavior",
    categories: ["eco"],
    keywords: [
      "decision",
      "behavior",
      "behaviour",
      "game",
      "choice",
      "auction",
      "psycholog",
      "incentive",
      "bias",
      "trust",
    ],
    title: "Run a Behavioral Economics Game",
    hook: (n) => `Test how real people make choices, the question ${n} was honoured for.`,
    difficulty: "Beginner",
    estimatedTime: "30 min",
    materials: [
      "A few willing participants",
      "Small tokens or candies as 'money'",
      "A notebook",
    ],
    steps: [
      "Play the 'ultimatum game': one person proposes how to split 10 tokens; the other accepts (both keep the split) or rejects (both get nothing).",
      "Run it with several pairs and record every offer and decision.",
      "Note how often unfair offers get rejected even though rejecting costs the rejecter.",
      "Discuss why fairness, not just self-interest, drives real economic choices.",
    ],
  },
  {
    id: "eco-data",
    categories: ["eco"],
    keywords: [],
    title: "Track and Model a Real Dataset",
    hook: (n) => `Model real-world data the way ${n}'s economics demands.`,
    difficulty: "Intermediate",
    estimatedTime: "1 week",
    materials: [
      "A notebook or spreadsheet",
      "Something to measure daily (prices, spending, weather, steps)",
    ],
    steps: [
      "Choose one quantity to record at the same time every day for a week.",
      "Log each value carefully and consistently.",
      "At week's end, chart the data and calculate the average and range.",
      "Look for trends or cycles and predict next week's value.",
      "Compare your prediction to reality — the heart of economic forecasting.",
    ],
  },
  {
    id: "eco-supply",
    categories: ["eco"],
    keywords: [],
    title: "Discover Supply and Demand",
    hook: (n) => `Watch markets find their prices, the forces ${n} studied.`,
    difficulty: "Beginner",
    estimatedTime: "30 min",
    materials: ["Items to 'sell' (cards or snacks)", "Play money", "A small group"],
    steps: [
      "Give sellers identical items and buyers a fixed budget.",
      "Run rounds where sellers post prices and buyers choose what to buy.",
      "Reduce the supply of items in later rounds and watch prices.",
      "Record price versus quantity each round and plot the curve.",
      "See how scarcity pushes prices up — the supply-and-demand law.",
    ],
  },

  // ---- Literature -------------------------------------------------------
  {
    id: "lit-craft",
    categories: ["lit"],
    keywords: [],
    title: "Study the Laureate's Craft",
    hook: (n) => `Read closely to learn the craft that earned ${n} the Nobel Prize.`,
    difficulty: "Beginner",
    estimatedTime: "45 min",
    materials: [
      "A short work or excerpt by the laureate (a library or public-domain source)",
      "A notebook",
    ],
    steps: [
      "Read a short passage slowly, twice.",
      "Mark the sentences that move you and note exactly what technique creates the effect — imagery, rhythm, dialogue.",
      "Summarise the central theme in one sentence.",
      "Write a paragraph imitating their style on a subject of your own.",
    ],
  },
  {
    id: "lit-theme",
    categories: ["lit"],
    keywords: [],
    title: "Map the Themes",
    hook: (n) => `Trace the themes that run through ${n}'s celebrated work.`,
    difficulty: "Intermediate",
    estimatedTime: "40 min",
    materials: ["A work by the laureate", "Paper or sticky notes"],
    steps: [
      "As you read, jot each recurring idea (love, power, exile, memory) on a separate note.",
      "Group the notes into a few core themes.",
      "Find one quotation that best captures each theme.",
      "Draw connections between the themes to reveal the work's larger argument.",
    ],
  },
  {
    id: "lit-write",
    categories: ["lit"],
    keywords: [],
    title: "Write in Their Tradition",
    hook: (n) => `Write in the tradition ${n} mastered.`,
    difficulty: "Beginner",
    estimatedTime: "30 min",
    materials: ["Pen and paper or a document", "A timer"],
    steps: [
      "Pick a form the laureate is known for (poem, short story, essay).",
      "Choose a small, concrete subject from your own life.",
      "Write for 20 uninterrupted minutes in that form.",
      "Revise once for a single quality the laureate excels at — voice, brevity, or imagery.",
    ],
  },

  // ---- Peace ------------------------------------------------------------
  {
    id: "pea-document",
    categories: ["pea"],
    keywords: [],
    title: "Document a Local Issue",
    hook: (n) => `Begin the kind of grounded, fair witness that defined ${n}'s work.`,
    difficulty: "Beginner",
    estimatedTime: "1 week",
    materials: ["A notebook or phone", "A camera (optional)"],
    steps: [
      "Choose one issue in your community you care about (litter, safety, access).",
      "Spend a week observing and recording what you see, with dates and details.",
      "Interview two or three people affected by it.",
      "Write a short, fair report describing the problem and one concrete improvement.",
    ],
  },
  {
    id: "pea-dialogue",
    categories: ["pea"],
    keywords: [],
    title: "Host a Dialogue Across Difference",
    hook: (n) => `Practice the peacemaking ${n} is honoured for.`,
    difficulty: "Intermediate",
    estimatedTime: "1–2 hours",
    materials: [
      "A small group with differing views",
      "A quiet space",
      "Ground rules written down",
    ],
    steps: [
      "Invite a few people who disagree on a topic to a respectful conversation.",
      "Set ground rules: listen fully, no interrupting, assume good faith.",
      "Ask each person to explain not just their view but why it matters to them.",
      "Close by naming one thing everyone agreed on — the first step of peacemaking.",
    ],
  },
  {
    id: "pea-map",
    categories: ["pea"],
    keywords: [],
    title: "Map Your Community's Needs",
    hook: (n) => `Survey your community's needs, the first step in work like ${n}'s.`,
    difficulty: "Beginner",
    estimatedTime: "3 days",
    materials: ["A map of your area (printed or digital)", "A notebook"],
    steps: [
      "Walk or research your neighbourhood and mark where key needs are met or unmet — food, healthcare, green space.",
      "Talk to a few residents about what's missing.",
      "Identify the single greatest gap.",
      "Propose one realistic action a group could take to address it.",
    ],
  },
];

/**
 * Build up to `limit` custom footstep experiments for a Nobel laureate from
 * their prize record. Activities whose keywords match the prize motivation are
 * preferred; discipline defaults fill any remaining slots. Returns [] when the
 * profile has no prizes (or no recognised category), so callers can fall back
 * to the generic category experiments.
 */
export function buildNobelFootsteps(
  name: string,
  prizes: ProfileNobelPrize[] | undefined | null,
  limit = 3,
): NobelFootstep[] {
  if (!prizes || prizes.length === 0) return [];

  const codes = new Set(
    prizes
      .map((p) => (p.categoryCode || "").toLowerCase())
      .filter(Boolean) as CategoryCode[],
  );
  if (codes.size === 0) return [];

  const motivation = prizes
    .map((p) => stripMotivationHtml(p.motivation || ""))
    .join(" ")
    .toLowerCase();

  const scored = TEMPLATES.filter((t) =>
    t.categories.some((c) => codes.has(c)),
  ).map((t) => ({
    template: t,
    score: t.keywords.filter((k) => motivation.includes(k)).length,
  }));

  // Keyword matches first; ties keep declared order (defaults come last).
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ template }) => ({
    id: template.id,
    title: template.title,
    hook: template.hook(name),
    difficulty: template.difficulty,
    estimatedTime: template.estimatedTime,
    materials: template.materials,
    steps: template.steps,
  }));
}
