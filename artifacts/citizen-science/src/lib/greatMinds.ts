// Hand-authored, database-independent story content for the "great minds of
// the past" — the deceased historical figures featured in the directory
// (the Great Minds and Pioneers sets in `inventors.ts`). This module powers the
// cinematic story layout on `/directory/:slug` and is intentionally decoupled
// from the `featured_profiles` database so a profile reads beautifully even
// before the directory DB is provisioned/seeded. Where a DB row exists, the
// profile page merges in its related categories, sources, and patents.

import einsteinPhoto from "@assets/albert-einstein.jpg";

export interface StoryTimelineEntry {
  year: string;
  title: string;
  detail: string;
}

export interface StoryContribution {
  title: string;
  detail: string;
}

// Per-person visual theme tied to the figure's field. `motif` selects a
// field-themed background pattern rendered behind the hero; the colors drive
// hero gradients, section accents, and quote styling so every page feels unique
// while sharing one premium template.
export type StoryMotif =
  | "relativity"
  | "radioactivity"
  | "electricity"
  | "evolution"
  | "gravity"
  | "astronomy"
  | "computing"
  | "code";

export interface StoryTheme {
  accent: string; // primary accent (hex)
  accentSoft: string; // very light tint for section backgrounds (hex)
  accentDeep: string; // darker shade for gradients (hex)
  heroFrom: string; // hero gradient start (hex)
  heroTo: string; // hero gradient end (hex)
  motif: StoryMotif;
  // Optional special hero treatment. "chalkboard" renders a dark slate
  // chalkboard with the figure's famous equations sketched in chalk instead of
  // the default colored mesh-gradient hero.
  heroVariant?: "chalkboard" | "radium" | "electric" | "naturalist" | "markets";
}

export interface GreatMindStory {
  slug: string;
  name: string;
  field: string;
  // Hero pill label. Defaults to "Great Minds of the Past" in the component;
  // contemporary/living figures built from the DB get "Modern Visionaries".
  eyebrow?: string;
  era: string; // descriptive era, e.g. "Modern Physics"
  lifespan: string; // e.g. "1879 – 1955"
  birthplace: string;
  tagline: string; // one-line hero subtitle
  imageUrl: string;
  theme: StoryTheme;
  biography: string[]; // long-form narrative paragraphs
  timeline: StoryTimelineEntry[];
  contributions: StoryContribution[];
  quotes: string[];
  legacy: string[]; // why-it-matters passage
  didYouKnow: string[];
  // Fallbacks used only when no DB row is available to enrich the page.
  relatedCategorySlugs: string[];
  sources: { title: string; url: string }[];
}

export const GREAT_MIND_STORIES: Record<string, GreatMindStory> = {
  "albert-einstein": {
    slug: "albert-einstein",
    name: "Albert Einstein",
    field: "Theoretical Physics",
    era: "Modern Physics",
    lifespan: "1879 – 1955",
    birthplace: "Ulm, Germany",
    tagline:
      "The patent clerk who rewrote space, time, and gravity — and taught the universe to bend.",
    imageUrl: einsteinPhoto,
    theme: {
      accent: "#2563EB",
      accentSoft: "#EFF4FF",
      accentDeep: "#1E3A8A",
      heroFrom: "#0B1220",
      heroTo: "#172554",
      motif: "relativity",
      heroVariant: "chalkboard",
    },
    biography: [
      "Albert Einstein was not a prodigy in the way legend insists. He was a curious, stubborn child who questioned everything and disliked rote schooling — a boy mesmerized when his father showed him a pocket compass, convinced that something invisible was steering the needle. That sense of a hidden order beneath ordinary things never left him.",
      "Unable to find an academic post after graduating, he took a job as a clerk in the Swiss patent office in Bern. It was there, evaluating other people's inventions by day, that he did the most consequential thinking of the twentieth century. In a single miraculous year — 1905 — he published papers that explained the photoelectric effect, proved the reality of atoms, and introduced special relativity, dissolving the old certainties of absolute space and time.",
      "A decade later he completed his masterpiece: general relativity, a theory that recast gravity not as a force but as the curvature of spacetime itself. When astronomers confirmed in 1919 that starlight bent around the Sun exactly as he predicted, Einstein became, overnight, the most famous scientist alive — a symbol of human imagination reaching past the visible world.",
    ],
    timeline: [
      {
        year: "1879",
        title: "Born in Ulm",
        detail: "Born into a secular Jewish family in the Kingdom of Württemberg.",
      },
      {
        year: "1905",
        title: "The Miracle Year",
        detail:
          "Publishes four landmark papers, including special relativity and E = mc².",
      },
      {
        year: "1915",
        title: "General Relativity",
        detail: "Completes his geometric theory of gravity as curved spacetime.",
      },
      {
        year: "1919",
        title: "Eclipse Confirmation",
        detail: "Eddington's expedition measures starlight bending around the Sun.",
      },
      {
        year: "1921",
        title: "Nobel Prize",
        detail:
          "Awarded the Nobel Prize in Physics for the photoelectric effect.",
      },
      {
        year: "1933",
        title: "Exile to America",
        detail: "Flees Nazi Germany and settles at Princeton, never to return.",
      },
      {
        year: "1955",
        title: "Death in Princeton",
        detail: "Dies still searching for a unified theory of all forces.",
      },
    ],
    contributions: [
      {
        title: "Special Relativity",
        detail:
          "Showed that space and time are relative to the observer and that the speed of light is the universe's constant — the foundation of E = mc².",
      },
      {
        title: "General Relativity",
        detail:
          "Reimagined gravity as the warping of spacetime by mass and energy, predicting black holes, gravitational lensing, and the expansion of the universe.",
      },
      {
        title: "The Photoelectric Effect",
        detail:
          "Demonstrated that light behaves as discrete quanta, helping found quantum theory — the work that won his Nobel Prize.",
      },
      {
        title: "Brownian Motion",
        detail:
          "Provided the decisive evidence that atoms and molecules are real, ending centuries of debate.",
      },
    ],
    quotes: [
      "Imagination is more important than knowledge.",
      "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
      "A person who never made a mistake never tried anything new.",
    ],
    legacy: [
      "Einstein's equations still describe the cosmos at its largest scales. Every GPS satellite corrects for relativity to keep your location accurate; gravitational waves detected a century after he predicted them now let us hear colliding black holes.",
      "But his deepest legacy may be cultural: he made the abstract feel heroic. He proved that a single mind, armed with curiosity and a thought experiment, could overturn what humanity believed about reality — and he insisted, to the end, that science carried a moral responsibility to the world it transformed.",
    ],
    didYouKnow: [
      "He reportedly failed no math classes — that famous myth is false; he had mastered calculus by age 15.",
      "He was offered the presidency of Israel in 1952 and politely declined.",
      "His brain was removed and studied after his death, against his wishes.",
    ],
    relatedCategorySlugs: ["physics", "astronomy"],
    sources: [
      {
        title: "Albert Einstein — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Albert_Einstein",
      },
      {
        title: "The Nobel Prize in Physics 1921",
        url: "https://www.nobelprize.org/prizes/physics/1921/einstein/biographical/",
      },
    ],
  },

  "marie-curie": {
    slug: "marie-curie",
    name: "Marie Curie",
    field: "Radioactivity",
    era: "The Atomic Dawn",
    lifespan: "1867 – 1934",
    birthplace: "Warsaw, Poland",
    tagline:
      "She gave radioactivity its name — and paid for the discovery with her life.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Marie_Curie_c._1920s.jpg",
    theme: {
      accent: "#16A34A",
      accentSoft: "#ECFDF3",
      accentDeep: "#166534",
      heroFrom: "#0A1410",
      heroTo: "#0C2A1B",
      motif: "radioactivity",
      heroVariant: "radium",
    },
    biography: [
      "Born Maria Skłodowska in a Warsaw under Russian occupation, she came of age forbidden — as a woman and a Pole — from the higher education she craved. She studied in secret at a clandestine \"Flying University,\" worked as a governess to fund her sister's medical studies, and only at last reached Paris and the Sorbonne, where she often studied through the night in a freezing attic, sometimes fainting from hunger.",
      "In a leaky shed of a laboratory she and her husband Pierre processed tons of pitchblende by hand, stirring vats of boiling ore in search of a new element whose glow she found beautiful. They isolated two: polonium, named for her captive homeland, and radium. She coined the word \"radioactivity\" for the strange energy pouring from the atom.",
      "She became the first woman to win a Nobel Prize, then the first person — of any gender — to win a second, in a different science. During the First World War she equipped mobile X-ray units and drove them to the front herself, helping treat over a million wounded soldiers. The radiation she handled so intimately, never suspecting its danger, ultimately killed her.",
    ],
    timeline: [
      {
        year: "1867",
        title: "Born in Warsaw",
        detail: "Born Maria Skłodowska under Russian rule, the youngest of five.",
      },
      {
        year: "1891",
        title: "Sorbonne in Paris",
        detail: "Leaves Poland to study physics and mathematics in France.",
      },
      {
        year: "1898",
        title: "Polonium & Radium",
        detail: "With Pierre Curie, discovers two new radioactive elements.",
      },
      {
        year: "1903",
        title: "First Nobel Prize",
        detail: "Shares the Nobel Prize in Physics — the first woman to win one.",
      },
      {
        year: "1911",
        title: "Second Nobel Prize",
        detail: "Wins the Nobel Prize in Chemistry, now in two sciences.",
      },
      {
        year: "1914",
        title: "Radiology at War",
        detail: "Builds mobile X-ray units to treat wounded WWI soldiers.",
      },
      {
        year: "1934",
        title: "Death from Radiation",
        detail: "Dies of aplastic anaemia caused by years of radiation exposure.",
      },
    ],
    contributions: [
      {
        title: "Theory of Radioactivity",
        detail:
          "Named and explained radioactivity as a property of atoms themselves, overturning the idea of the atom as indivisible and unchanging.",
      },
      {
        title: "Discovery of Polonium & Radium",
        detail:
          "Isolated two new elements through punishing manual chemistry, opening the field of nuclear science.",
      },
      {
        title: "Medical Radiology",
        detail:
          "Pioneered the use of radiation in medicine and built the mobile X-ray units that saved countless lives in WWI.",
      },
      {
        title: "Opening Science to Women",
        detail:
          "As the first female Nobel laureate and first female Sorbonne professor, she remade who could belong in science.",
      },
    ],
    quotes: [
      "Nothing in life is to be feared, it is only to be understood.",
      "Be less curious about people and more curious about ideas.",
      "I was taught that the way of progress was neither swift nor easy.",
    ],
    legacy: [
      "Radium therapy became an early weapon against cancer; the radiology she championed is now woven into everyday medicine. Her notebooks remain so radioactive that they are stored in lead-lined boxes and can only be handled in protective gear.",
      "Curie proved, in the face of relentless prejudice, that brilliance has no gender and no border. The research institutes she founded in Paris and Warsaw still bear her name and still fight cancer — and her daughter Irène went on to win a Nobel Prize of her own.",
    ],
    didYouKnow: [
      "She is the only person to win Nobel Prizes in two different sciences.",
      "Her original notebooks are still radioactive and stored in lead boxes.",
      "The element curium and the unit of radioactivity, the curie, are named for her.",
    ],
    relatedCategorySlugs: ["chemistry", "physics", "human-health"],
    sources: [
      {
        title: "Marie Curie — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Marie_Curie",
      },
      {
        title: "Marie Curie — The Nobel Prize",
        url: "https://www.nobelprize.org/prizes/physics/1903/marie-curie/biographical/",
      },
    ],
  },

  "nikola-tesla": {
    slug: "nikola-tesla",
    name: "Nikola Tesla",
    field: "Electrical Engineering",
    era: "The Electrical Age",
    lifespan: "1856 – 1943",
    birthplace: "Smiljan, Austrian Empire",
    tagline:
      "He dreamed in lightning — and wired the modern world with alternating current.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/79/Tesla_circa_1890.jpeg",
    theme: {
      accent: "#7C3AED",
      accentSoft: "#F4EFFF",
      accentDeep: "#5B21B6",
      heroFrom: "#0B0716",
      heroTo: "#241046",
      motif: "electricity",
      heroVariant: "electric",
    },
    biography: [
      "Nikola Tesla was born during a midnight thunderstorm in a Croatian village, a coincidence his family treated as an omen. He grew up with a photographic memory and a mind that could build and test entire machines in his imagination, running them for weeks before ever touching metal. He claimed the design for the alternating-current motor came to him whole, in a vision, while reciting poetry at sunset.",
      "He arrived in New York in 1884 with a few cents and a letter of introduction, and briefly worked for Thomas Edison before the two clashed bitterly. Their rivalry became the \"War of the Currents\" — Edison's direct current against Tesla's alternating current. Tesla's system, backed by George Westinghouse, won: AC could be transmitted efficiently over long distances, and it electrified the world.",
      "A showman as much as an inventor, Tesla staged spectacles of crackling artificial lightning and wireless lamps that lit in his bare hands. He dreamed of transmitting power through the air to the entire planet, free for all. But he was a poor businessman, and his grandest projects collapsed for lack of funding. He died alone in a New York hotel room, owing money, his notebooks full of visions a century ahead of their time.",
    ],
    timeline: [
      {
        year: "1856",
        title: "Born in Smiljan",
        detail: "Born during a thunderstorm in present-day Croatia.",
      },
      {
        year: "1884",
        title: "Arrival in America",
        detail: "Emigrates to New York and briefly works for Thomas Edison.",
      },
      {
        year: "1888",
        title: "The AC Motor",
        detail: "Patents the induction motor and polyphase AC system.",
      },
      {
        year: "1893",
        title: "World's Fair",
        detail: "AC lights the Chicago World's Fair, dazzling millions.",
      },
      {
        year: "1895",
        title: "Niagara Falls",
        detail: "His system harnesses Niagara Falls to generate hydroelectric power.",
      },
      {
        year: "1901",
        title: "Wardenclyffe Tower",
        detail: "Begins his doomed dream of wireless global power transmission.",
      },
      {
        year: "1943",
        title: "Death in New York",
        detail: "Dies penniless and alone in the Hotel New Yorker.",
      },
    ],
    contributions: [
      {
        title: "Alternating Current",
        detail:
          "Developed the polyphase AC system that made long-distance power transmission practical — the backbone of every modern electrical grid.",
      },
      {
        title: "The Induction Motor",
        detail:
          "Invented the brushless AC motor that still drives countless machines, from factory equipment to household appliances.",
      },
      {
        title: "The Tesla Coil",
        detail:
          "Created the resonant transformer that produced spectacular high-voltage discharges and advanced the study of wireless energy.",
      },
      {
        title: "Wireless & Radio",
        detail:
          "Pioneered wireless transmission and remote control, anticipating radio and laying groundwork later recognized by the courts.",
      },
    ],
    quotes: [
      "The present is theirs; the future, for which I really worked, is mine.",
      "If you want to find the secrets of the universe, think in terms of energy, frequency and vibration.",
      "I do not think there is any thrill that can go through the human heart like that felt by the inventor.",
    ],
    legacy: [
      "Every time you plug something in, you use Tesla's alternating current. His induction motor hums inside electric cars and industrial machines worldwide; the SI unit of magnetic flux density — the tesla — carries his name.",
      "Long dismissed as an eccentric, he has been rediscovered as a prophet of wireless power, renewable energy, and the electrified future. He reminds us that the visionary and the impractical often wear the same face — and that the world frequently arrives, decades late, at ideas a single mind glimpsed first.",
    ],
    didYouKnow: [
      "He could memorize entire books and visualize working machines in his head.",
      "He spoke eight languages and had an intense fear of pearls and germs.",
      "The Supreme Court credited him over Marconi for key radio patents — after his death.",
    ],
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      {
        title: "Nikola Tesla — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Nikola_Tesla",
      },
      {
        title: "Tesla — PBS American Experience",
        url: "https://www.pbs.org/tesla/",
      },
    ],
  },

  "charles-darwin": {
    slug: "charles-darwin",
    name: "Charles Darwin",
    field: "Evolutionary Biology",
    era: "The Age of Discovery",
    lifespan: "1809 – 1882",
    birthplace: "Shrewsbury, England",
    tagline:
      "A five-year voyage and twenty years of doubt gave life on Earth a single family tree.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Charles_Darwin_seated_crop.jpg",
    theme: {
      accent: "#0D9488",
      accentSoft: "#ECFDFA",
      accentDeep: "#115E59",
      heroFrom: "#08140F",
      heroTo: "#0B2A28",
      motif: "evolution",
      heroVariant: "naturalist",
    },
    biography: [
      "As a young man Charles Darwin disappointed his physician father by abandoning medicine — he could not bear the sight of surgery — and drifting through his studies. What saved him was an unteachable passion: collecting beetles, observing animals, walking the countryside with a naturalist's eye. On the strength of that enthusiasm he was offered an unpaid berth aboard HMS Beagle.",
      "The five-year voyage transformed him. In South America he found seashell fossils high in the Andes; on the Galápagos Islands he noticed that finches and tortoises differed subtly from island to island, as if shaped by their separate homes. The pattern haunted him. Slowly, cautiously, he assembled an explanation: species are not fixed but descend with modification from common ancestors, sculpted over vast time by natural selection.",
      "He understood how explosive the idea was, and he sat on it for twenty years, gathering evidence and dreading the storm. Only when the young naturalist Alfred Russel Wallace independently arrived at the same theory did Darwin finally publish On the Origin of Species in 1859. It sold out in a day and changed biology forever.",
    ],
    timeline: [
      {
        year: "1809",
        title: "Born in Shrewsbury",
        detail: "Born into a wealthy, freethinking English family.",
      },
      {
        year: "1831",
        title: "Voyage of the Beagle",
        detail: "Sets sail as naturalist on a five-year survey expedition.",
      },
      {
        year: "1835",
        title: "The Galápagos",
        detail: "Observes island-by-island variation in finches and tortoises.",
      },
      {
        year: "1838",
        title: "Natural Selection",
        detail: "Conceives the mechanism after reading Malthus on population.",
      },
      {
        year: "1859",
        title: "On the Origin of Species",
        detail: "Publishes his theory; the first printing sells out immediately.",
      },
      {
        year: "1871",
        title: "The Descent of Man",
        detail: "Extends evolution to human origins, igniting fresh debate.",
      },
      {
        year: "1882",
        title: "Buried at Westminster",
        detail: "Honoured with a state funeral and burial near Isaac Newton.",
      },
    ],
    contributions: [
      {
        title: "Natural Selection",
        detail:
          "Identified the mechanism by which heritable variations that aid survival become more common over generations — the engine of evolution.",
      },
      {
        title: "Common Descent",
        detail:
          "Showed that all living things share ancestry, uniting the diversity of life into a single branching tree.",
      },
      {
        title: "The Origin of Species",
        detail:
          "Wrote the book that founded modern evolutionary biology and reframed humanity's place in nature.",
      },
      {
        title: "Decades of Evidence",
        detail:
          "Backed his theory with meticulous studies of barnacles, orchids, earthworms, and domestic breeding.",
      },
    ],
    quotes: [
      "It is not the strongest of the species that survives, but the most adaptable to change.",
      "A man who dares to waste one hour of time has not discovered the value of life.",
      "In the long history of humankind those who learned to collaborate most effectively have prevailed.",
    ],
    legacy: [
      "Evolution by natural selection is the organizing principle of all biology — from medicine and agriculture to ecology and genetics. Nothing in the living world makes full sense without it.",
      "Darwin taught humanity to see itself as part of nature rather than apart from it: one branch on a four-billion-year-old tree of life. His patient, evidence-first method remains a model of how careful observation can overturn the deepest assumptions.",
    ],
    didYouKnow: [
      "He delayed publishing his theory for roughly two decades, fearing the backlash.",
      "He wrote a famous list of the pros and cons of marriage before proposing to his cousin Emma.",
      "His last book was a bestselling study of earthworms.",
    ],
    relatedCategorySlugs: ["biology", "environmental-science", "agriculture"],
    sources: [
      {
        title: "Charles Darwin — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Charles_Darwin",
      },
      {
        title: "Darwin Correspondence Project",
        url: "https://www.darwinproject.ac.uk/",
      },
    ],
  },

  "isaac-newton": {
    slug: "isaac-newton",
    name: "Isaac Newton",
    field: "Physics & Mathematics",
    era: "The Scientific Revolution",
    lifespan: "1643 – 1727",
    birthplace: "Woolsthorpe, England",
    tagline:
      "In two plague years a lonely young man invented calculus and weighed the heavens.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg",
    theme: {
      accent: "#D97706",
      accentSoft: "#FEF6E7",
      accentDeep: "#92400E",
      heroFrom: "#140D04",
      heroTo: "#2E1C06",
      motif: "gravity",
    },
    biography: [
      "Isaac Newton was born prematurely on Christmas Day, so small, his mother said, that he could have fit into a quart mug. His father had died months earlier; his mother remarried and left him in the care of his grandparents, and the abandoned, solitary boy grew into a secretive, fiercely independent man who trusted few people for the rest of his life.",
      "When plague closed Cambridge in 1665, Newton retreated to the family farm — and in roughly two years of isolation produced an outpouring of genius rarely matched in history. He invented calculus, unraveled the nature of light and color with a prism, and began to suspect that the same force pulling an apple to the ground held the Moon in its orbit. He later called these his \"years of wonder.\"",
      "Decades later, prodded by Edmond Halley, he gathered his ideas into the Principia Mathematica, stating three laws of motion and the law of universal gravitation. With a few equations he showed that the heavens and the Earth obey the same rules. He spent his final years as master of the Royal Mint and president of the Royal Society — and, privately, devoted as much effort to alchemy and theology as to physics.",
    ],
    timeline: [
      {
        year: "1643",
        title: "Born in Woolsthorpe",
        detail: "Born prematurely on Christmas Day, a fatherless and frail child.",
      },
      {
        year: "1665",
        title: "The Years of Wonder",
        detail: "Plague drives him home, where he invents calculus and optics.",
      },
      {
        year: "1668",
        title: "Reflecting Telescope",
        detail: "Builds the first practical reflecting telescope.",
      },
      {
        year: "1687",
        title: "The Principia",
        detail: "Publishes his laws of motion and universal gravitation.",
      },
      {
        year: "1696",
        title: "Master of the Mint",
        detail: "Reforms England's currency and pursues counterfeiters.",
      },
      {
        year: "1705",
        title: "Knighted",
        detail: "Becomes the first scientist knighted by an English monarch.",
      },
      {
        year: "1727",
        title: "Buried at Westminster",
        detail: "Laid to rest in Westminster Abbey with national honours.",
      },
    ],
    contributions: [
      {
        title: "Laws of Motion",
        detail:
          "Stated the three laws that govern how objects move and respond to forces — the foundation of classical mechanics.",
      },
      {
        title: "Universal Gravitation",
        detail:
          "Showed that a single force explains both a falling apple and the orbits of the planets, unifying earth and sky.",
      },
      {
        title: "Calculus",
        detail:
          "Co-invented the mathematics of change, the indispensable language of physics, engineering, and economics.",
      },
      {
        title: "Optics & Light",
        detail:
          "Proved white light is a mixture of colors and built the first reflecting telescope.",
      },
    ],
    quotes: [
      "If I have seen further it is by standing on the shoulders of giants.",
      "I can calculate the motion of heavenly bodies, but not the madness of people.",
      "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.",
    ],
    legacy: [
      "For more than two centuries Newton's mechanics were physics itself, accurate enough to send spacecraft to the planets and still taught in every classroom today. He turned the universe into something predictable — a clockwork that could be written in equations.",
      "Even Einstein, who superseded him, regarded Newton with awe. The SI unit of force bears his name, and the very idea that nature follows discoverable mathematical laws — the premise of all modern science — is, in large part, his inheritance.",
    ],
    didYouKnow: [
      "He wrote more about alchemy and theology than about physics.",
      "As Master of the Mint he personally pursued and prosecuted counterfeiters.",
      "He served as a Member of Parliament but is said to have spoken only once — to ask that a window be closed.",
    ],
    relatedCategorySlugs: ["physics", "astronomy", "materials-science"],
    sources: [
      {
        title: "Isaac Newton — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Isaac_Newton",
      },
      {
        title: "Newton's Principia — Royal Society",
        url: "https://royalsociety.org/",
      },
    ],
  },

  "galileo-galilei": {
    slug: "galileo-galilei",
    name: "Galileo Galilei",
    field: "Astronomy & Physics",
    era: "The Scientific Revolution",
    lifespan: "1564 – 1642",
    birthplace: "Pisa, Italy",
    tagline:
      "He pointed a homemade telescope at the sky — and was tried for what he saw.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cc/Galileo.arp.300pix.jpg",
    theme: {
      accent: "#CA8A04",
      accentSoft: "#FEFAEB",
      accentDeep: "#854D0E",
      heroFrom: "#0E0B04",
      heroTo: "#2A2008",
      motif: "astronomy",
    },
    biography: [
      "Galileo trained first in medicine, but mathematics seduced him, and he became a professor with a gift for turning abstract questions into experiments anyone could repeat. Legend says he dropped weights from the Leaning Tower of Pisa to show that they fall at the same rate; whether or not he did, he insisted on testing nature directly rather than trusting ancient authority — a radical idea in his age.",
      "In 1609, hearing of a Dutch spyglass, he built a far better telescope of his own and turned it upward. What he saw shattered the heavens of the philosophers: mountains and craters on a supposedly perfect Moon, four moons circling Jupiter, the phases of Venus, and countless stars invisible to the naked eye. Here was direct evidence that the Earth was not the unmoving center of all things.",
      "His outspoken defense of the Copernican, Sun-centered universe brought him before the Roman Inquisition. Forced to recant under threat, he spent his last years under house arrest, going blind. Yet even then he completed his greatest scientific work, on motion and falling bodies — quietly laying the foundations that Newton would build upon.",
    ],
    timeline: [
      {
        year: "1564",
        title: "Born in Pisa",
        detail: "Born the same year as Shakespeare, to a musician father.",
      },
      {
        year: "1589",
        title: "Studies of Motion",
        detail: "Investigates falling bodies, challenging Aristotle.",
      },
      {
        year: "1609",
        title: "The Telescope",
        detail: "Builds an improved telescope and turns it to the night sky.",
      },
      {
        year: "1610",
        title: "Starry Messenger",
        detail: "Publishes his discoveries of Jupiter's moons and lunar craters.",
      },
      {
        year: "1632",
        title: "The Dialogue",
        detail: "Defends the Sun-centered universe, provoking the Church.",
      },
      {
        year: "1633",
        title: "Trial & House Arrest",
        detail: "Tried by the Inquisition and forced to recant; confined for life.",
      },
      {
        year: "1638",
        title: "Two New Sciences",
        detail: "Publishes his foundational work on motion while under arrest.",
      },
    ],
    contributions: [
      {
        title: "The Telescope & Astronomy",
        detail:
          "Discovered Jupiter's moons, lunar craters, and the phases of Venus — direct evidence for a Sun-centered solar system.",
      },
      {
        title: "The Science of Motion",
        detail:
          "Showed that objects fall at the same rate regardless of mass and described uniform acceleration, paving the way for Newton.",
      },
      {
        title: "The Experimental Method",
        detail:
          "Insisted that nature be questioned through measurement and experiment, founding the modern scientific method.",
      },
      {
        title: "Mathematics as Nature's Language",
        detail:
          "Argued that the universe is \"written in the language of mathematics,\" reshaping how science describes reality.",
      },
    ],
    quotes: [
      "And yet it moves.",
      "The Sun, with all those planets revolving around it, can still ripen a bunch of grapes as if it had nothing else in the universe to do.",
      "Measure what is measurable, and make measurable what is not so.",
    ],
    legacy: [
      "Galileo is often called the father of observational astronomy, modern physics, and the scientific method all at once. The probe that orbited Jupiter for years bore his name, studying the very moons he first glimpsed through hand-ground glass.",
      "His trial became the defining parable of science versus dogma — a reminder of the cost of speaking inconvenient truths. In 1992 the Catholic Church formally acknowledged that he had been right all along, more than three centuries too late.",
    ],
    didYouKnow: [
      "He named Jupiter's four largest moons the \"Medicean stars\" to flatter his patrons.",
      "The Church only formally admitted he was right in 1992.",
      "He spent his final years blind, dictating his work to his students.",
    ],
    relatedCategorySlugs: ["astronomy", "physics"],
    sources: [
      {
        title: "Galileo Galilei — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Galileo_Galilei",
      },
      {
        title: "Galileo — Stanford Encyclopedia of Philosophy",
        url: "https://plato.stanford.edu/entries/galileo/",
      },
    ],
  },

  "ada-lovelace": {
    slug: "ada-lovelace",
    name: "Ada Lovelace",
    field: "Computing",
    era: "The Dawn of Computing",
    lifespan: "1815 – 1852",
    birthplace: "London, England",
    tagline:
      "A century before the computer existed, she saw what it could become.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png",
    theme: {
      accent: "#DB2777",
      accentSoft: "#FDF2F8",
      accentDeep: "#9D174D",
      heroFrom: "#140710",
      heroTo: "#2E0B22",
      motif: "code",
    },
    biography: [
      "Augusta Ada Byron was the only legitimate child of the poet Lord Byron, who left when she was an infant. Fearing the boy would inherit her father's wild romanticism, her mother had Ada rigorously schooled in mathematics and logic — an unusual education for a girl in the 1820s. The result was a mind that fused poetry and rigor; Ada called her own approach \"poetical science.\"",
      "At seventeen she met Charles Babbage, who was designing a vast mechanical calculator he called the Analytical Engine. Most of his contemporaries saw only a glorified adding machine. Ada saw something more. Asked to translate an article about the Engine, she appended her own notes — and those notes ran to three times the length of the original.",
      "Within them she wrote what is widely regarded as the first computer program: a step-by-step method for the Engine to compute Bernoulli numbers. More remarkably, she grasped that such a machine could manipulate not just numbers but any symbols — that it might one day compose music or create art. No one else, including Babbage, saw that far. The machine was never built in her lifetime, and she died of cancer at just thirty-six.",
    ],
    timeline: [
      {
        year: "1815",
        title: "Born in London",
        detail: "Born the only legitimate child of the poet Lord Byron.",
      },
      {
        year: "1833",
        title: "Meets Babbage",
        detail: "Encounters Charles Babbage and his Difference Engine.",
      },
      {
        year: "1840",
        title: "The Analytical Engine",
        detail: "Studies Babbage's design for a general-purpose computer.",
      },
      {
        year: "1843",
        title: "The First Program",
        detail: "Publishes her Notes, including an algorithm for the Engine.",
      },
      {
        year: "1843",
        title: "The Visionary Note",
        detail: "Foresees machines that could compose music and manipulate symbols.",
      },
      {
        year: "1852",
        title: "Early Death",
        detail: "Dies of cancer at the age of thirty-six.",
      },
    ],
    contributions: [
      {
        title: "The First Algorithm",
        detail:
          "Wrote a method for Babbage's Analytical Engine to compute Bernoulli numbers — regarded as the first published computer program.",
      },
      {
        title: "The Idea of General Computing",
        detail:
          "Realized a computing machine could manipulate any symbols — not just numbers — anticipating software a century early.",
      },
      {
        title: "Poetical Science",
        detail:
          "Bridged imagination and mathematics, insisting creativity and logic belonged together in science.",
      },
      {
        title: "A Vision of the Future",
        detail:
          "Foresaw machines that might one day compose music and create art, a prophecy of the digital age.",
      },
    ],
    quotes: [
      "The Analytical Engine weaves algebraic patterns, just as the Jacquard loom weaves flowers and leaves.",
      "Imagination is the discovering faculty, pre-eminently. It is that which penetrates into the unseen worlds around us.",
      "That brain of mine is something more than merely mortal, as time will show.",
    ],
    legacy: [
      "Ada Lovelace is celebrated as the first computer programmer, and the programming language Ada — used in aviation and spaceflight — is named in her honour. The second Tuesday of every October, Ada Lovelace Day, celebrates women in science and technology worldwide.",
      "Her deepest contribution was conceptual: she understood, before any machine could prove her right, that computers would be engines of creativity as much as calculation. Every app, song, and image generated by software today is a fulfillment of the future she alone imagined.",
    ],
    didYouKnow: [
      "She described herself as an \"Analyst (& Metaphysician).\"",
      "Ada Lovelace Day, each October, celebrates women in STEM.",
      "The U.S. Department of Defense named a programming language \"Ada\" after her.",
    ],
    relatedCategorySlugs: ["physics", "materials-science"],
    sources: [
      {
        title: "Ada Lovelace — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Ada_Lovelace",
      },
      {
        title: "Ada Lovelace — Computer History Museum",
        url: "https://computerhistory.org/",
      },
    ],
  },

  "alan-turing": {
    slug: "alan-turing",
    name: "Alan Turing",
    field: "Computer Science",
    era: "The Birth of the Computer",
    lifespan: "1912 – 1954",
    birthplace: "London, England",
    tagline:
      "He imagined the universal machine, broke the unbreakable code, and asked if machines could think.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ce/Alan_turing_header.jpg",
    theme: {
      accent: "#0EA5E9",
      accentSoft: "#ECFAFF",
      accentDeep: "#075985",
      heroFrom: "#04101A",
      heroTo: "#072B40",
      motif: "computing",
    },
    biography: [
      "Alan Turing was a shy, brilliant boy who preferred problems to people and once cycled forty miles to his first day of boarding school through a national strike. At Cambridge he confronted one of the deepest questions in mathematics — whether every problem could be solved by a definite procedure — and to answer it he imagined a strikingly simple abstract device: a machine reading and writing symbols on an endless tape.",
      "That \"Turing machine\" was a thought experiment, but it defined, once and for all, what it means to compute. It is the theoretical blueprint of every computer that has ever been built. He had invented computer science before computers existed.",
      "When war came, Turing led the team at Bletchley Park that cracked the German Enigma cipher, designing electromechanical machines that turned the tide of the Battle of the Atlantic and, by many estimates, shortened the war by years and saved millions of lives. After the war he designed early stored-program computers and posed the question that still haunts the field — can machines think? — proposing the test that bears his name. In 1952 he was prosecuted for being gay, stripped of his security clearance, and subjected to chemical treatment; two years later he was dead at forty-one.",
    ],
    timeline: [
      {
        year: "1912",
        title: "Born in London",
        detail: "Born to a colonial civil-service family, a solitary, gifted child.",
      },
      {
        year: "1936",
        title: "The Turing Machine",
        detail: "Defines computation with his universal abstract machine.",
      },
      {
        year: "1939",
        title: "Bletchley Park",
        detail: "Joins Britain's secret codebreaking effort against the Nazis.",
      },
      {
        year: "1941",
        title: "Cracking Enigma",
        detail: "His Bombe machines decrypt German naval communications.",
      },
      {
        year: "1950",
        title: "The Turing Test",
        detail: "Asks \"Can machines think?\" and proposes a test for intelligence.",
      },
      {
        year: "1952",
        title: "Prosecution",
        detail: "Convicted for homosexuality and stripped of his clearance.",
      },
      {
        year: "1954",
        title: "Death",
        detail: "Dies at forty-one; pardoned by royal decree in 2013.",
      },
    ],
    contributions: [
      {
        title: "The Turing Machine",
        detail:
          "Defined the mathematical foundation of computation and proved what can and cannot be computed — the bedrock of computer science.",
      },
      {
        title: "Breaking Enigma",
        detail:
          "Led the codebreaking that decrypted German messages in WWII, helping the Allies win and saving countless lives.",
      },
      {
        title: "Artificial Intelligence",
        detail:
          "Posed the question of machine intelligence and devised the Turing Test, founding the field of AI.",
      },
      {
        title: "The Stored-Program Computer",
        detail:
          "Designed pioneering early computers and helped turn his abstract machine into working hardware.",
      },
    ],
    quotes: [
      "Sometimes it is the people no one imagines anything of who do the things that no one can imagine.",
      "We can only see a short distance ahead, but we can see plenty there that needs to be done.",
      "A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.",
    ],
    legacy: [
      "Every smartphone, laptop, and server is, at its core, a realization of the universal machine Turing imagined in 1936. The Turing Award — computing's highest honour — and the Turing Test remain central to the field he created.",
      "His story is also one of injustice: a man who helped save the world, destroyed by the prejudices of the society he protected. In 2013 he received a posthumous royal pardon, and his face now appears on the Bank of England's £50 note — a belated reckoning with a debt the world can never fully repay.",
    ],
    didYouKnow: [
      "He was a world-class long-distance runner who nearly qualified for the Olympics.",
      "His wartime work was kept secret for decades, so he died largely unrecognized.",
      "He appears on the Bank of England's £50 note, issued in 2021.",
    ],
    relatedCategorySlugs: ["physics", "neuroscience"],
    sources: [
      {
        title: "Alan Turing — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Alan_Turing",
      },
      {
        title: "Alan Turing — The Turing Archive",
        url: "https://www.turing.org.uk/",
      },
    ],
  },
};

export function getGreatMindStory(
  slug: string | undefined,
): GreatMindStory | undefined {
  if (!slug) return undefined;
  return GREAT_MIND_STORIES[slug];
}

// ---------------------------------------------------------------------------
// Scalable story content (Task #44)
//
// The hand-authored `GREAT_MIND_STORIES` above is the premium, decoupled tier.
// To extend the cinematic layout to the rest of the historical directory
// without hand-writing every page, two helpers below turn a database
// `FeaturedProfile` row into the same `GreatMindStory` shape:
//
//   • `deriveStoryTheme(field)` gives every figure a sensible per-field default
//     visual theme (palette + motif) so a page looks intentional even when no
//     bespoke theme was authored.
//   • `buildStoryFromProfile(profile)` assembles a full `GreatMindStory` from a
//     DB row, falling back gracefully on whatever rich story fields have been
//     populated (biography, timeline, legacy, did-you-know, …). It returns
//     `null` when the row has no long-form biography yet, so lightly-seeded /
//     living profiles keep the standard layout.
// ---------------------------------------------------------------------------

interface DisciplineTheme extends StoryTheme {
  // Lowercase substrings that route a `field` to this theme. Checked in order,
  // most specific first, so e.g. "astrophysics" matches astronomy before
  // physics.
  match: string[];
}

// Ordered most-specific-first. The final entry is the catch-all default.
const DISCIPLINE_THEMES: DisciplineTheme[] = [
  {
    match: ["astro", "cosmo", "cosmol", "space", "planet", "stellar", "galax"],
    accent: "#CA8A04",
    accentSoft: "#FEFAEB",
    accentDeep: "#854D0E",
    heroFrom: "#0E0B04",
    heroTo: "#2A2008",
    motif: "astronomy",
  },
  {
    match: ["math", "logic", "geometr", "number", "statis"],
    accent: "#DB2777",
    accentSoft: "#FDF2F8",
    accentDeep: "#9D174D",
    heroFrom: "#140710",
    heroTo: "#2E0B22",
    motif: "code",
  },
  {
    match: [
      "comput",
      "software",
      "algorithm",
      "informat",
      "artificial intelligence",
      "data",
      "program",
      "cyber",
    ],
    accent: "#0EA5E9",
    accentSoft: "#ECFAFF",
    accentDeep: "#075985",
    heroFrom: "#04101A",
    heroTo: "#072B40",
    motif: "computing",
  },
  {
    match: ["electr", "engineer", "invent", "mechanic", "telegraph", "radio"],
    accent: "#7C3AED",
    accentSoft: "#F4EFFF",
    accentDeep: "#5B21B6",
    heroFrom: "#0B0716",
    heroTo: "#241046",
    motif: "electricity",
  },
  {
    match: ["chem", "element", "material", "metallurg"],
    accent: "#16A34A",
    accentSoft: "#ECFDF3",
    accentDeep: "#166534",
    heroFrom: "#0A1410",
    heroTo: "#0C2A1B",
    motif: "radioactivity",
  },
  {
    match: [
      "medic",
      "health",
      "physiolog",
      "immun",
      "neuro",
      "surge",
      "anatom",
      "patholog",
      "nurs",
      "epidem",
    ],
    accent: "#E11D48",
    accentSoft: "#FFF1F3",
    accentDeep: "#9F1239",
    heroFrom: "#160709",
    heroTo: "#2E0B12",
    motif: "evolution",
  },
  {
    match: [
      "biolog",
      "evolution",
      "natural",
      "zoolog",
      "botan",
      "genet",
      "ecolog",
      "microbiol",
      "naturalist",
      "life scien",
    ],
    accent: "#0D9488",
    accentSoft: "#ECFDFA",
    accentDeep: "#115E59",
    heroFrom: "#08140F",
    heroTo: "#0B2A28",
    motif: "evolution",
  },
  {
    match: [
      "climate",
      "earth",
      "geo",
      "environ",
      "ocean",
      "atmosp",
      "meteor",
      "seismo",
    ],
    accent: "#0891B2",
    accentSoft: "#ECFEFF",
    accentDeep: "#155E75",
    heroFrom: "#04141A",
    heroTo: "#07303B",
    motif: "gravity",
  },
  // Default: physics / everything else.
  {
    match: [],
    accent: "#2563EB",
    accentSoft: "#EFF4FF",
    accentDeep: "#1E3A8A",
    heroFrom: "#0B1220",
    heroTo: "#172554",
    motif: "relativity",
  },
];

// Pick a sensible default visual theme for a figure based on their field. This
// makes every generated/DB-backed story page look deliberate without anyone
// hand-tuning a palette per person.
export function deriveStoryTheme(field: string): StoryTheme {
  const f = field.toLowerCase();
  const preset =
    DISCIPLINE_THEMES.find(
      (t) => t.match.length > 0 && t.match.some((m) => f.includes(m)),
    ) ?? DISCIPLINE_THEMES[DISCIPLINE_THEMES.length - 1];
  // Strip the `match` helper field off before returning a clean StoryTheme.
  const { match: _match, ...theme } = preset;
  return theme;
}

// Bespoke hero treatments for specific living figures whose page deserves a
// hand-tuned cinematic banner beyond the field-derived default.
const BESPOKE_HERO_BY_SLUG: Record<string, StoryTheme["heroVariant"]> = {
  "manu-rehani": "markets",
};

const STORY_MOTIFS: readonly StoryMotif[] = [
  "relativity",
  "radioactivity",
  "electricity",
  "evolution",
  "gravity",
  "astronomy",
  "computing",
  "code",
];

function coerceMotif(motif: string | undefined, fallback: StoryMotif): StoryMotif {
  return STORY_MOTIFS.includes(motif as StoryMotif)
    ? (motif as StoryMotif)
    : fallback;
}

// The subset of a `FeaturedProfile` (from the generated API client) that the
// builder reads. Declared structurally so this module stays decoupled from the
// generated types and is trivially unit-testable.
export interface ProfileStorySource {
  slug: string;
  name: string;
  field: string;
  era: string;
  summary: string;
  imageUrl?: string | null;
  contributions: string[];
  quotes: string[];
  relatedCategorySlugs: string[];
  sources: { title: string; url: string }[];
  tagline?: string | null;
  lifespan?: string | null;
  birthplace?: string | null;
  biography?: string[];
  timeline?: StoryTimelineEntry[];
  storyContributions?: StoryContribution[];
  legacy?: string[];
  didYouKnow?: string[];
  storyTheme?: {
    accent: string;
    accentSoft: string;
    accentDeep: string;
    heroFrom: string;
    heroTo: string;
    motif: string;
    heroVariant?: string;
  } | null;
}

// Split the flat one-paragraph `summary` into a couple of biography paragraphs
// as a last-resort fallback when no authored `biography` exists. Keeps prose
// reading naturally rather than dumping one long block.
function summaryToBiography(summary: string): string[] {
  const trimmed = summary.trim();
  if (!trimmed) return [];
  const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!sentences || sentences.length < 4) return [trimmed];
  const mid = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, mid).join("").trim(),
    sentences.slice(mid).join("").trim(),
  ].filter(Boolean);
}

// A DB profile row describes a living/contemporary figure (not a historical
// "great mind of the past") when its era reads as present-tense or when its
// lifespan lacks a closed "YYYY – YYYY" range (historical figures always carry
// a death year; the living do not). Used to pick the hero pill label.
function isContemporaryProfile(
  era: string,
  lifespan: string | null | undefined,
): boolean {
  if (/\b(contemporary|present|living|today|current|21st)\b/i.test(era)) {
    return true;
  }
  if (lifespan && !/\d{4}\s*[–-]\s*\d{4}/.test(lifespan)) return true;
  return false;
}

// Build a cinematic `GreatMindStory` from a database profile row. Returns null
// when the row has no rich story content yet (no biography and no summary), so
// the caller can fall back to the standard profile layout. Every rich section
// degrades independently: a row with only a biography still renders a clean,
// intentional page.
export function buildStoryFromProfile(
  profile: ProfileStorySource,
): GreatMindStory | null {
  const biography =
    profile.biography && profile.biography.length > 0
      ? profile.biography
      : summaryToBiography(profile.summary);

  // No long-form content at all → not a story page.
  if (biography.length === 0) return null;

  const theme: StoryTheme = profile.storyTheme
    ? {
        accent: profile.storyTheme.accent,
        accentSoft: profile.storyTheme.accentSoft,
        accentDeep: profile.storyTheme.accentDeep,
        heroFrom: profile.storyTheme.heroFrom,
        heroTo: profile.storyTheme.heroTo,
        motif: coerceMotif(profile.storyTheme.motif, "relativity"),
      }
    : deriveStoryTheme(profile.field);

  // Bespoke per-figure hero treatment overrides the field-derived default.
  const bespokeHero = BESPOKE_HERO_BY_SLUG[profile.slug];
  if (bespokeHero) theme.heroVariant = bespokeHero;

  const contributions: StoryContribution[] =
    profile.storyContributions && profile.storyContributions.length > 0
      ? profile.storyContributions
      : profile.contributions.map((detail) => ({ title: "", detail }));

  return {
    slug: profile.slug,
    name: profile.name,
    field: profile.field,
    eyebrow: isContemporaryProfile(profile.era, profile.lifespan)
      ? "Modern Visionaries"
      : "Great Minds of the Past",
    era: profile.era,
    lifespan: profile.lifespan ?? "",
    birthplace: profile.birthplace ?? "",
    tagline: profile.tagline ?? "",
    imageUrl: profile.imageUrl ?? "",
    theme,
    biography,
    timeline: profile.timeline ?? [],
    contributions,
    quotes: profile.quotes,
    legacy: profile.legacy ?? [],
    didYouKnow: profile.didYouKnow ?? [],
    relatedCategorySlugs: profile.relatedCategorySlugs,
    sources: profile.sources,
  };
}

// ---------------------------------------------------------------------------
// Curated historical batch (Task #44)
//
// A second tier of real, accurate historical figures authored with the lighter
// per-field default theme (`deriveStoryTheme`) rather than a bespoke palette.
// This demonstrates how new figures scale onto the cinematic layout with a
// fraction of the effort of the premium top-8 — and gives the directory real
// content beyond the original eight even before the DB is provisioned. Each
// entry omits `theme`; it is filled in from the figure's field on registration.
// ---------------------------------------------------------------------------

type CuratedStory = Omit<GreatMindStory, "theme">;

const CURATED_HISTORICAL: CuratedStory[] = [
  {
    slug: "stephen-hawking",
    name: "Stephen Hawking",
    field: "Cosmology",
    era: "Modern Cosmology",
    lifespan: "1942 – 2018",
    birthplace: "Oxford, England",
    tagline:
      "Confined to a wheelchair, he roamed the universe — and made black holes give up their secrets.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/Stephen_Hawking.StarChild.jpg",
    biography: [
      "Stephen Hawking was an ordinary, somewhat lazy Oxford student until, at twenty-one, he was diagnosed with motor neurone disease and given just a few years to live. The prognosis was wrong by half a century — and in defiance of a body that slowly failed him, he built one of the most luminous scientific minds of the age.",
      "Working at Cambridge, Hawking fused Einstein's relativity with quantum mechanics to study the universe's most extreme objects. His great surprise was that black holes are not perfectly black at all: they slowly radiate energy and can, over unimaginable spans of time, evaporate entirely — a result now known as Hawking radiation.",
      "Communicating through a single cheek muscle and a computerised voice, he became the most recognisable scientist on Earth. His book A Brief History of Time sold over ten million copies, carrying the deepest questions of cosmology to readers who had never opened a physics text.",
    ],
    timeline: [
      {
        year: "1942",
        title: "Born in Oxford",
        detail: "Born exactly three centuries after the death of Galileo.",
      },
      {
        year: "1963",
        title: "Diagnosis",
        detail: "Diagnosed with motor neurone disease (ALS) at age 21.",
      },
      {
        year: "1974",
        title: "Hawking Radiation",
        detail: "Shows black holes emit radiation and can evaporate.",
      },
      {
        year: "1988",
        title: "A Brief History of Time",
        detail: "Publishes the best-seller that made cosmology popular.",
      },
      {
        year: "2018",
        title: "Death",
        detail: "Dies at 76; his ashes are interred near Newton and Darwin.",
      },
    ],
    contributions: [
      {
        title: "Hawking Radiation",
        detail:
          "Predicted that black holes emit thermal radiation, linking gravity, quantum theory, and thermodynamics.",
      },
      {
        title: "Singularity Theorems",
        detail:
          "With Roger Penrose, proved that the universe began from a singularity under general relativity.",
      },
      {
        title: "Public Understanding of Science",
        detail:
          "Brought cosmology to a global audience through best-selling books and lectures.",
      },
    ],
    quotes: [
      "Intelligence is the ability to adapt to change.",
      "We are just an advanced breed of monkeys on a minor planet of a very average star. But we can understand the Universe. That makes us something very special.",
      "Look up at the stars and not down at your feet.",
    ],
    legacy: [
      "Hawking showed that the deepest laws of physics meet at the edge of a black hole, and that a human mind — whatever its physical limits — can reach the beginning of time itself.",
    ],
    didYouKnow: [
      "He was born 300 years to the day after Galileo died.",
      "He experienced weightlessness on a zero-gravity flight in 2007.",
      "He appeared as himself on The Simpsons, Star Trek, and The Big Bang Theory.",
    ],
    relatedCategorySlugs: ["physics", "astronomy"],
    sources: [
      {
        title: "Stephen Hawking — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Stephen_Hawking",
      },
    ],
  },
  {
    slug: "richard-feynman",
    name: "Richard Feynman",
    field: "Theoretical Physics",
    era: "Quantum Electrodynamics",
    lifespan: "1918 – 1988",
    birthplace: "New York City, USA",
    tagline:
      "The safe-cracking, bongo-playing physicist who insisted that the joy of finding things out is its own reward.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/4/42/Richard_Feynman_Nobel.jpg",
    biography: [
      "Richard Feynman grew up in Queens, taught by a father who turned every walk into a lesson about how the world really works rather than what things are called. That habit — distrusting labels, insisting on understanding — defined his entire career.",
      "As a young man he worked on the Manhattan Project, then helped build the modern theory of how light and matter interact. His diagrammatic method for tracking particle interactions, now called Feynman diagrams, became the everyday language of particle physics and won him a share of the 1965 Nobel Prize.",
      "He was equally famous as a teacher and showman: a relentless explainer who could make the hardest ideas feel obvious, and who, live on television, dropped an O-ring into ice water to reveal why the Challenger shuttle had been destroyed.",
    ],
    timeline: [
      {
        year: "1918",
        title: "Born in New York",
        detail: "Raised in Far Rockaway, Queens.",
      },
      {
        year: "1942",
        title: "Manhattan Project",
        detail: "Joins the wartime effort to build the atomic bomb at Los Alamos.",
      },
      {
        year: "1948",
        title: "Feynman Diagrams",
        detail: "Introduces his visual calculus for particle interactions.",
      },
      {
        year: "1965",
        title: "Nobel Prize",
        detail: "Shares the Nobel Prize in Physics for quantum electrodynamics.",
      },
      {
        year: "1986",
        title: "Challenger Inquiry",
        detail: "Demonstrates the O-ring failure with a glass of ice water.",
      },
    ],
    contributions: [
      {
        title: "Quantum Electrodynamics",
        detail:
          "Co-created the most precise theory in physics, describing how light and matter interact.",
      },
      {
        title: "Feynman Diagrams",
        detail:
          "Invented the pictorial bookkeeping that physicists still use to compute particle interactions.",
      },
      {
        title: "The Feynman Lectures",
        detail:
          "Authored a legendary physics course that remains a model of clear scientific teaching.",
      },
    ],
    quotes: [
      "I would rather have questions that can't be answered than answers that can't be questioned.",
      "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
      "I think I can safely say that nobody understands quantum mechanics.",
    ],
    legacy: [
      "Feynman taught generations of scientists that real understanding is hands-on, sceptical, and joyful — that you do not truly know something until you can rebuild it yourself.",
    ],
    didYouKnow: [
      "He taught himself to pick locks and cracked safes containing atomic secrets at Los Alamos.",
      "He played the bongo drums and once performed in a ballet.",
      "His memoir 'Surely You're Joking, Mr. Feynman!' became a surprise best-seller.",
    ],
    relatedCategorySlugs: ["physics"],
    sources: [
      {
        title: "Richard Feynman — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Richard_Feynman",
      },
    ],
  },
  {
    slug: "michael-faraday",
    name: "Michael Faraday",
    field: "Electromagnetism",
    era: "Victorian Science",
    lifespan: "1791 – 1867",
    birthplace: "Newington Butts, England",
    tagline:
      "A bookbinder's apprentice with almost no schooling who discovered how to turn magnetism into electricity.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7e/Michael_Faraday_sitting_crop.jpg",
    biography: [
      "Michael Faraday was born into poverty and apprenticed to a bookbinder, where he educated himself by reading the very volumes he was sewing together. A ticket to a lecture by the chemist Humphry Davy changed his life; he took meticulous notes, bound them into a book, and sent them to Davy, who hired him as an assistant.",
      "Lacking any training in mathematics, Faraday thought in pictures — imagining invisible 'lines of force' threading through space. With this physical intuition he discovered electromagnetic induction, the principle that a changing magnetic field produces an electric current, the basis of every generator and transformer on Earth.",
      "He was also a gifted public communicator, founding the Royal Institution's Christmas Lectures for young people, a tradition that continues to this day.",
    ],
    timeline: [
      {
        year: "1791",
        title: "Born near London",
        detail: "Born into a poor family; largely self-educated.",
      },
      {
        year: "1813",
        title: "Assistant to Davy",
        detail: "Hired at the Royal Institution after sending Davy his lecture notes.",
      },
      {
        year: "1821",
        title: "Electric Motor",
        detail: "Builds the first device to turn electrical energy into motion.",
      },
      {
        year: "1831",
        title: "Induction",
        detail: "Discovers electromagnetic induction, the heart of the generator.",
      },
      {
        year: "1845",
        title: "Faraday Effect",
        detail: "Shows that magnetism affects light, linking the two phenomena.",
      },
    ],
    contributions: [
      {
        title: "Electromagnetic Induction",
        detail:
          "Discovered that a changing magnetic field induces a current — the principle behind every generator.",
      },
      {
        title: "The Field Concept",
        detail:
          "Introduced 'lines of force', the idea of fields that Maxwell later made mathematical.",
      },
      {
        title: "Electrochemistry",
        detail:
          "Formulated the laws of electrolysis and coined terms like electrode, anode, and ion.",
      },
    ],
    quotes: [
      "Nothing is too wonderful to be true, if it be consistent with the laws of nature.",
      "But still try, for who knows what is possible.",
    ],
    legacy: [
      "Faraday's experiments gave the world the generator, the motor, and the transformer — the machinery of the electric age — and his idea of the field reshaped how physicists picture reality itself.",
    ],
    didYouKnow: [
      "He had almost no formal education and never learned advanced mathematics.",
      "He founded the Royal Institution Christmas Lectures, still running today.",
      "He declined a knighthood and twice refused to become president of the Royal Society.",
    ],
    relatedCategorySlugs: ["physics", "chemistry"],
    sources: [
      {
        title: "Michael Faraday — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Michael_Faraday",
      },
    ],
  },
  {
    slug: "louis-pasteur",
    name: "Louis Pasteur",
    field: "Microbiology",
    era: "19th-Century Medicine",
    lifespan: "1822 – 1895",
    birthplace: "Dole, France",
    tagline:
      "He proved that invisible germs cause disease — and built the vaccines to fight them.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/a6/Louis_Pasteur%2C_foto_av_Paul_Nadar%2C_Crisco_edit.jpg",
    biography: [
      "Louis Pasteur trained as a chemist, but his curiosity led him to one of the great questions of the age: where do the microbes that spoil food and cause disease actually come from? Through painstaking experiments he demolished the old belief in 'spontaneous generation', showing that microorganisms come only from other microorganisms.",
      "This insight became the germ theory of disease — the foundation of modern medicine. Pasteur showed that gentle heating could kill harmful microbes in milk and wine, a process still called pasteurisation, and that weakened germs could be used to train the body's defences.",
      "His vaccines for anthrax and, most dramatically, rabies — first used to save a boy bitten by a rabid dog — turned the germ theory into a tool that has saved countless lives.",
    ],
    timeline: [
      {
        year: "1822",
        title: "Born in Dole",
        detail: "Son of a tanner in eastern France.",
      },
      {
        year: "1862",
        title: "Pasteurisation",
        detail: "Develops gentle heating to kill spoilage microbes.",
      },
      {
        year: "1864",
        title: "Germ Theory",
        detail: "Disproves spontaneous generation with his swan-neck flasks.",
      },
      {
        year: "1881",
        title: "Anthrax Vaccine",
        detail: "Publicly demonstrates a vaccine that protects livestock.",
      },
      {
        year: "1885",
        title: "Rabies Vaccine",
        detail: "Saves nine-year-old Joseph Meister from rabies.",
      },
    ],
    contributions: [
      {
        title: "Germ Theory of Disease",
        detail:
          "Established that microorganisms cause infection, transforming medicine and hygiene.",
      },
      {
        title: "Vaccination",
        detail:
          "Created vaccines for anthrax and rabies using weakened forms of the pathogen.",
      },
      {
        title: "Pasteurisation",
        detail:
          "Devised the heat treatment that makes milk and other foods safe to drink.",
      },
    ],
    quotes: [
      "In the fields of observation chance favours only the prepared mind.",
      "Science knows no country, because knowledge belongs to humanity, and is the torch which illuminates the world.",
    ],
    legacy: [
      "Pasteur's germ theory underpins sterile surgery, food safety, and every vaccine that followed — arguably saving more lives than any other single idea in the history of medicine.",
    ],
    didYouKnow: [
      "The institute he founded in Paris remains a world centre for infectious-disease research.",
      "Joseph Meister, the first rabies patient he saved, later worked as a guard at the Pasteur Institute.",
      "He suffered a stroke at 46 yet did much of his most famous work afterward.",
    ],
    relatedCategorySlugs: ["microbiology", "human-health"],
    sources: [
      {
        title: "Louis Pasteur — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Louis_Pasteur",
      },
    ],
  },
  {
    slug: "linus-pauling",
    name: "Linus Pauling",
    field: "Chemistry",
    era: "20th-Century Science",
    lifespan: "1901 – 1994",
    birthplace: "Portland, Oregon, USA",
    tagline:
      "The only person to win two unshared Nobel Prizes — one for the chemical bond, one for peace.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Linus_Pauling_in_the_1940s.jpg",
    biography: [
      "Linus Pauling applied the new physics of quantum mechanics to chemistry and, in doing so, explained why atoms join together at all. His work on the nature of the chemical bond gave chemists a deep, predictive understanding of molecular structure and earned him the 1954 Nobel Prize in Chemistry.",
      "He went on to pioneer molecular biology, identifying sickle-cell anaemia as the first 'molecular disease' caused by a single faulty protein. His insights into protein structure helped set the stage for the discovery of the DNA double helix.",
      "Alarmed by the dangers of nuclear weapons testing, Pauling became a tireless campaigner against the bomb. His petition signed by thousands of scientists helped bring about the 1963 Partial Test Ban Treaty, for which he received the Nobel Peace Prize.",
    ],
    timeline: [
      {
        year: "1901",
        title: "Born in Portland",
        detail: "Grew up in Oregon and studied chemical engineering.",
      },
      {
        year: "1931",
        title: "The Chemical Bond",
        detail: "Publishes foundational papers on the nature of bonding.",
      },
      {
        year: "1949",
        title: "Molecular Disease",
        detail: "Shows sickle-cell anaemia is caused by an abnormal protein.",
      },
      {
        year: "1954",
        title: "Nobel in Chemistry",
        detail: "Honoured for his work on chemical bonds and molecular structure.",
      },
      {
        year: "1962",
        title: "Nobel Peace Prize",
        detail: "Recognised for his campaign against nuclear weapons testing.",
      },
    ],
    contributions: [
      {
        title: "The Chemical Bond",
        detail:
          "Used quantum mechanics to explain how and why atoms bond, founding modern structural chemistry.",
      },
      {
        title: "Molecular Medicine",
        detail:
          "Identified the molecular cause of sickle-cell anaemia, launching the field of molecular disease.",
      },
      {
        title: "Science for Peace",
        detail:
          "Led the scientists' movement against atmospheric nuclear testing.",
      },
    ],
    quotes: [
      "The best way to have a good idea is to have a lot of ideas.",
      "Satisfaction of one's curiosity is one of the greatest sources of happiness in life.",
    ],
    legacy: [
      "Pauling bridged physics, chemistry, biology, and medicine, and proved that a scientist's responsibility does not end at the laboratory door — that knowledge carries a duty to the world.",
    ],
    didYouKnow: [
      "He is the only person to win two unshared Nobel Prizes.",
      "His structural ideas influenced the race to discover the DNA double helix.",
      "He became a famous, and controversial, advocate for high-dose vitamin C.",
    ],
    relatedCategorySlugs: ["chemistry", "human-health"],
    sources: [
      {
        title: "Linus Pauling — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Linus_Pauling",
      },
    ],
  },
  {
    slug: "niels-bohr",
    name: "Niels Bohr",
    field: "Quantum Physics",
    era: "Atomic Age",
    lifespan: "1885 – 1962",
    birthplace: "Copenhagen, Denmark",
    tagline:
      "He gave the atom its structure and taught physics to live with paradox.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6d/Niels_Bohr.jpg",
    biography: [
      "Niels Bohr transformed our picture of the atom in 1913 by proposing that electrons orbit the nucleus only in fixed energy levels, jumping between them in discrete quantum leaps. The model explained the spectral lines of hydrogen and made quantum ideas central to physics.",
      "From his institute in Copenhagen — soon the world's gathering place for young physicists — Bohr developed the philosophical heart of quantum theory: the principle of complementarity, the idea that things like light can be both wave and particle, and that which face shows depends on how you look.",
      "During the Second World War he fled Nazi-occupied Denmark, contributed to Allied atomic research, and afterwards campaigned passionately for the open, peaceful international control of nuclear energy.",
    ],
    timeline: [
      {
        year: "1885",
        title: "Born in Copenhagen",
        detail: "Son of a physiology professor.",
      },
      {
        year: "1913",
        title: "The Bohr Model",
        detail: "Proposes quantised electron orbits, explaining atomic spectra.",
      },
      {
        year: "1922",
        title: "Nobel Prize",
        detail: "Awarded the Nobel Prize in Physics for atomic structure.",
      },
      {
        year: "1927",
        title: "Complementarity",
        detail: "Introduces his interpretation of quantum mechanics.",
      },
      {
        year: "1943",
        title: "Escape from Denmark",
        detail: "Flees the Nazis and joins Allied atomic research.",
      },
    ],
    contributions: [
      {
        title: "The Bohr Model of the Atom",
        detail:
          "Introduced quantised electron orbits, explaining why atoms emit specific colours of light.",
      },
      {
        title: "Complementarity",
        detail:
          "Framed the wave–particle duality at the core of quantum interpretation.",
      },
      {
        title: "Copenhagen Institute",
        detail:
          "Built the institute that mentored a generation of quantum physicists.",
      },
    ],
    quotes: [
      "Anyone who is not shocked by quantum theory has not understood it.",
      "An expert is a person who has made all the mistakes which can be made in a very narrow field.",
    ],
    legacy: [
      "Bohr's atom and his philosophy of complementarity shaped the whole of twentieth-century physics, and his Copenhagen institute remains a symbol of science as an open, international community.",
    ],
    didYouKnow: [
      "Element 107, bohrium, is named in his honour.",
      "He was an avid footballer; his brother Harald played for Denmark's Olympic team.",
      "He famously debated the meaning of quantum theory with Albert Einstein for decades.",
    ],
    relatedCategorySlugs: ["physics", "chemistry"],
    sources: [
      {
        title: "Niels Bohr — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Niels_Bohr",
      },
    ],
  },
  {
    slug: "grace-hopper",
    name: "Grace Hopper",
    field: "Computer Science",
    era: "Dawn of Computing",
    lifespan: "1906 – 1992",
    birthplace: "New York City, USA",
    tagline:
      "The admiral who taught computers to understand human words — and made programming for everyone.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Commodore_Grace_M._Hopper%2C_USN_%28covered%29_head_and_shoulders_crop.jpg",
    biography: [
      "Grace Hopper was a mathematics professor who joined the U.S. Navy during the Second World War and was assigned to one of the first computers, the room-sized Harvard Mark I. She became one of the very first programmers, writing the painstaking machine instructions that early computers demanded.",
      "Convinced that computing should not be reserved for specialists, Hopper invented the compiler — a program that translates human-readable instructions into machine code. The idea was radical: many insisted computers could only ever crunch numbers. Her work led directly to COBOL, a business language that ran much of the world's commerce for decades.",
      "She remained in the Navy into her eighties, retiring as a rear admiral, and spent her later years as a beloved teacher handing out 'nanoseconds' — lengths of wire — to make the speed of computing tangible.",
    ],
    timeline: [
      {
        year: "1906",
        title: "Born in New York",
        detail: "Showed an early love of taking machines apart.",
      },
      {
        year: "1944",
        title: "Harvard Mark I",
        detail: "Programs one of the first large-scale computers for the Navy.",
      },
      {
        year: "1952",
        title: "The Compiler",
        detail: "Builds the first compiler, automating the writing of code.",
      },
      {
        year: "1959",
        title: "COBOL",
        detail: "Her work underpins the business programming language COBOL.",
      },
      {
        year: "1986",
        title: "Retires as Admiral",
        detail: "Leaves the Navy as one of its oldest serving officers.",
      },
    ],
    contributions: [
      {
        title: "The First Compiler",
        detail:
          "Created the program that translates human-readable code into machine instructions.",
      },
      {
        title: "COBOL",
        detail:
          "Drove the development of an English-like language that powered global business computing.",
      },
      {
        title: "Computing for Everyone",
        detail:
          "Championed the idea that programming should be accessible far beyond mathematicians.",
      },
    ],
    quotes: [
      "The most dangerous phrase in the language is, 'We've always done it this way.'",
      "A ship in port is safe, but that is not what ships are built for.",
    ],
    legacy: [
      "Hopper's compiler is the reason we write software in something close to human language. Nearly every program ever written rests on the idea she fought to prove possible.",
    ],
    didYouKnow: [
      "She popularised the term 'debugging' after a moth was found in a computer relay.",
      "A U.S. Navy destroyer, the USS Hopper, is named after her.",
      "She received the Presidential Medal of Freedom in 2016.",
    ],
    relatedCategorySlugs: [],
    sources: [
      {
        title: "Grace Hopper — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Grace_Hopper",
      },
    ],
  },
  {
    slug: "rosalind-franklin",
    name: "Rosalind Franklin",
    field: "Molecular Biology",
    era: "Birth of Genetics",
    lifespan: "1920 – 1958",
    birthplace: "London, England",
    tagline:
      "Her X-ray photograph revealed the shape of life itself — the double helix of DNA.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fd/Rosalind_Franklin_%28retouched%29.jpg",
    biography: [
      "Rosalind Franklin was a master of X-ray crystallography, the art of firing X-rays through a substance and reading the structure of its molecules from the pattern they scatter. At King's College London she turned this technique on DNA with extraordinary skill.",
      "Her famous 'Photograph 51' captured the unmistakable cross-shaped signature of a helix, along with measurements that pinned down its dimensions. This image and her data were crucial to James Watson and Francis Crick's 1953 model of the double helix — though her contribution was, for decades, badly under-acknowledged.",
      "She moved on to study the structure of viruses, producing pioneering work on the tobacco mosaic and polio viruses, before her death from cancer at just thirty-seven.",
    ],
    timeline: [
      {
        year: "1920",
        title: "Born in London",
        detail: "Decided on a scientific career as a teenager.",
      },
      {
        year: "1951",
        title: "King's College",
        detail: "Begins her X-ray studies of DNA fibres.",
      },
      {
        year: "1952",
        title: "Photograph 51",
        detail: "Captures the X-ray image revealing DNA's helical structure.",
      },
      {
        year: "1953",
        title: "The Double Helix",
        detail: "Her data underpins the Watson–Crick model of DNA.",
      },
      {
        year: "1958",
        title: "Death",
        detail: "Dies of ovarian cancer at 37, her role long under-recognised.",
      },
    ],
    contributions: [
      {
        title: "Photograph 51",
        detail:
          "Produced the X-ray image that provided direct evidence for DNA's double-helix structure.",
      },
      {
        title: "DNA Geometry",
        detail:
          "Measured the key dimensions of the DNA molecule with exacting precision.",
      },
      {
        title: "Virus Structure",
        detail:
          "Carried out foundational X-ray studies of the tobacco mosaic and polio viruses.",
      },
    ],
    quotes: [
      "Science and everyday life cannot and should not be separated.",
      "In my view, all that is necessary for faith is the belief that by doing our best we shall succeed in our aims.",
    ],
    legacy: [
      "Franklin's data sits at the heart of the most important biological discovery of the century, and her story has become a touchstone for recognising the overlooked contributions of women in science.",
    ],
    didYouKnow: [
      "Her crucial 'Photograph 51' was shown to Watson without her knowledge.",
      "She later did pioneering structural work on viruses.",
      "Several institutions, including a Mars rover and a university, are named in her honour.",
    ],
    relatedCategorySlugs: ["biology", "chemistry", "microbiology"],
    sources: [
      {
        title: "Rosalind Franklin — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Rosalind_Franklin",
      },
    ],
  },
];

// Register the curated batch, applying a per-field default theme to each. Done
// at module load so `getGreatMindStory` serves them identically to the premium
// top-8. (Authored entries above always win on slug collision.)
for (const entry of CURATED_HISTORICAL) {
  if (!GREAT_MIND_STORIES[entry.slug]) {
    GREAT_MIND_STORIES[entry.slug] = {
      ...entry,
      theme: deriveStoryTheme(entry.field),
    };
  }
}
