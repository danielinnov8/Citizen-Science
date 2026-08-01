// Hand-authored, database-independent story content for the *living* scientists
// and inventors featured in the directory — the Modern Visionaries and Frontier
// Minds in `inventors.ts`. This module mirrors the pattern of `greatMinds.ts`
// but is tuned for present-tense storytelling: what each figure is building now,
// their ongoing impact, and recent milestones — with no lifespan end date. It
// powers the cinematic living-profile layout on `/directory/:slug` and is
// intentionally decoupled from the `featured_profiles` database so a profile
// reads beautifully even before the directory DB is provisioned/seeded. Where a
// DB row exists, the profile page merges in its related categories, sources, and
// patents.

import type { StoryTimelineEntry, StoryContribution } from "@/lib/greatMinds";
import starmanRoadster from "@assets/starman-tesla-roadster.jpg";
import diamandisPhoto from "@assets/65ee191f9cc09e354404b538_Peter_Diamandis_1780697654112.webp";
import salimPhoto from "@assets/image_1780697674289.png";
import blundinPhoto from "@assets/moonshot-dave-blundin.webp";
import wissnerGrossPhoto from "@assets/Alex_W_G_1780704314284.png";
import diamandisCover from "@assets/generated_images/cover-peter-diamandis.png";
import salimCover from "@assets/generated_images/cover-salim-ismail.png";
import blundinCover from "@assets/generated_images/cover-dave-blundin.png";
import wissnerGrossCover from "@assets/generated_images/cover-alexander-wissner-gross.png";
import levyPhoto from "@assets/matthew-chase-levy.jpg";
import amjadPhoto from "@assets/amjad-masad.jpg";
import lauraPhoto from "@assets/laura-burkemper.jpg";

// Field-themed background patterns suited to modern science & technology. Each
// motif is rendered faintly behind the hero so every living profile feels
// distinct while sharing one premium template.
export type LivingMotif =
  | "space"
  | "neural"
  | "genome"
  | "web"
  | "chip"
  | "exoplanet"
  | "nature"
  | "molecule";

export interface LivingTheme {
  accent: string; // primary accent (hex)
  accentSoft: string; // very light tint for section backgrounds (hex)
  accentDeep: string; // darker shade for gradients (hex)
  heroFrom: string; // hero gradient start (hex)
  heroTo: string; // hero gradient end (hex)
  motif: LivingMotif;
  heroImage?: string; // optional photographic hero backdrop (overrides motif)
}

export interface LivingMindStory {
  slug: string;
  name: string;
  field: string;
  era: string; // present-tense descriptor, e.g. "Working Today"
  born: string; // birth year + place, e.g. "Born 1971 · Pretoria, South Africa"
  base: string; // where they are based now, e.g. "Austin, Texas"
  tagline: string; // one-line hero subtitle
  imageUrl: string;
  theme: LivingTheme;
  biography: string[]; // long-form, present-tense narrative paragraphs
  buildingNow: StoryContribution[]; // current work — "what they're building now"
  timeline: StoryTimelineEntry[]; // the journey so far
  contributions: StoryContribution[]; // breakthroughs & contributions
  quotes: string[];
  impact: string[]; // why it matters now (the living analogue of "legacy")
  didYouKnow: string[];
  // Fallbacks used only when no DB row is available to enrich the page.
  relatedCategorySlugs: string[];
  sources: { title: string; url: string }[];
}

// hint: Logic changed on both sides. Requires understanding intent of each change.
export const LIVING_MIND_STORIES: Record<string, LivingMindStory> = {
  "elon-musk": {
    slug: "elon-musk",
    name: "Elon Musk",
    field: "Space & Sustainable Energy",
    era: "Working Today",
    born: "Born 1971 · Pretoria, South Africa",
    base: "Austin, Texas",
    tagline:
      "Betting entire fortunes on reusable rockets and electric cars to make the future arrive faster.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Elon_Musk_-_54820081119_%28cropped%29.jpg/500px-Elon_Musk_-_54820081119_%28cropped%29.jpg",
    theme: {
      accent: "#7C3AED",
      accentSoft: "#F4EFFF",
      accentDeep: "#5B21B6",
      heroFrom: "#0B0716",
      heroTo: "#241046",
      motif: "space",
      heroImage: starmanRoadster,
    },
    biography: [
      "Elon Musk grew up a bookish, bullied child in Johannesburg who taught himself to code at ten and sold his first video game at twelve. He left South Africa as a teenager, worked his way through Canada and then Stanford, and abandoned a physics PhD after two days to ride the first internet wave — convinced that the biggest leverage on the future lay in building, not studying.",
      "After early wins with Zip2 and the company that became PayPal, he poured the proceeds into two ideas almost everyone considered reckless: a rocket company and an electric-car company. Both nearly bankrupted him in 2008. SpaceX reached orbit on its fourth and final funded attempt; Tesla survived on a last-minute round. Out of that near-death came the playbook he is still running — vertical integration, brutal iteration, and goals so large they sound absurd until they ship.",
      "Today he runs a constellation of companies aimed at what he frames as civilization-scale risks: making humanity multi-planetary, accelerating the shift off fossil fuels, and building machines that think. He remains one of the most polarizing figures in technology — equal parts engineer, showman, and provocateur — but the hardware keeps flying.",
    ],
    buildingNow: [
      {
        title: "Starship & Mars",
        detail:
          "Iterating on Starship, the fully reusable super-heavy launch vehicle SpaceX is building to carry cargo and, eventually, people to Mars at a fraction of today's cost.",
      },
      {
        title: "Starlink",
        detail:
          "Operating the largest satellite constellation ever flown, delivering broadband to remote regions and funding the road to Mars.",
      },
      {
        title: "Affordable Electric Vehicles",
        detail:
          "Pushing Tesla toward cheaper EVs, grid-scale batteries, and full self-driving — trying to make sustainable transport the default, not the premium.",
      },
      {
        title: "Humanoid Robots & AI",
        detail:
          "Developing the Optimus humanoid robot and xAI's models, betting that general-purpose automation reshapes the economy this decade.",
      },
    ],
    timeline: [
      {
        year: "1995",
        title: "Zip2",
        detail: "Drops out of Stanford to build one of the first web companies.",
      },
      {
        year: "2002",
        title: "Founds SpaceX",
        detail: "Sets out to cut the cost of spaceflight and reach Mars.",
      },
      {
        year: "2008",
        title: "Falcon 1 to Orbit",
        detail:
          "SpaceX becomes the first private company to put a liquid-fueled rocket in orbit, days before running out of cash.",
      },
      {
        year: "2012",
        title: "Dragon Docks with the ISS",
        detail:
          "The first commercial spacecraft to resupply the International Space Station.",
      },
      {
        year: "2015",
        title: "Rocket Landing",
        detail:
          "Falcon 9 lands upright for the first time, proving reusable orbital rockets.",
      },
      {
        year: "2020",
        title: "Crew Dragon",
        detail:
          "SpaceX flies NASA astronauts, restoring U.S. human spaceflight from American soil.",
      },
    ],
    contributions: [
      {
        title: "Reusable Rockets",
        detail:
          "Made orbital rocket boosters land and fly again — collapsing the cost of access to space and reshaping the entire launch industry.",
      },
      {
        title: "Mainstreaming Electric Cars",
        detail:
          "Turned the EV from a compliance curiosity into an object of desire, forcing the whole auto industry to electrify.",
      },
      {
        title: "Global Satellite Internet",
        detail:
          "Built a low-Earth-orbit constellation that delivers connectivity to places fiber will never reach.",
      },
      {
        title: "A New Pace for Hardware",
        detail:
          "Popularized fast, public, failure-tolerant iteration on real hardware — testing in the open instead of perfecting in secret.",
      },
    ],
    quotes: [
      "When something is important enough, you do it even if the odds are not in your favor.",
      "Failure is an option here. If things are not failing, you are not innovating enough.",
      "I would like to die on Mars. Just not on impact.",
    ],
    impact: [
      "Whatever one makes of him, Musk has reset expectations for what a private company can attempt. Reusable rockets, mass-market EVs, and satellite internet were all considered impractical fantasies a generation ago; today they are infrastructure.",
      "His larger wager is on tempo — that the bottleneck on the future is rarely physics and usually nerve. By shipping audacious hardware in public, he has pulled an entire generation of founders toward harder, more physical problems.",
    ],
    didYouKnow: [
      "He read the entire Encyclopædia Britannica as a child and taught himself rocket science from textbooks.",
      "SpaceX's first three launches all failed; the company had money for exactly one more attempt, which succeeded.",
      "He named Tesla's vehicle lineup so the models would spell out a word.",
    ],
    relatedCategorySlugs: ["physics", "materials-science", "astronomy"],
    sources: [
      {
        title: "Elon Musk — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Elon_Musk",
      },
      { title: "SpaceX", url: "https://www.spacex.com/" },
    ],
  },

  "jeff-bezos": {
    slug: "jeff-bezos",
    name: "Jeff Bezos",
    field: "Commerce & Spaceflight",
    era: "Working Today",
    born: "Born 1964 · Albuquerque, New Mexico",
    base: "Seattle & Miami, USA",
    tagline:
      "He reinvented how the world shops — now he wants to move heavy industry off the planet.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg/500px-260202-D-PM193-2205_SECWAR_Arsenal_of_Freedom_Tour_-_Florida_%283x4_cropped_on_Bezos_and_rotated%29.jpg",
    theme: {
      accent: "#2563EB",
      accentSoft: "#EFF4FF",
      accentDeep: "#1E3A8A",
      heroFrom: "#070C18",
      heroTo: "#0F2147",
      motif: "space",
    },
    biography: [
      "Jeff Bezos built a Montessori-kid's curiosity into one of the most consequential companies of the modern era. A standout engineer at Princeton, he was thriving in finance when he noticed the web growing at an impossible rate. In 1994 he quit, drove west, and started an online bookstore out of a garage — writing a famous memo about minimizing future regret rather than maximizing present comfort.",
      "Amazon became something far larger than a bookstore: a logistics machine, a cloud-computing utility that quietly powers much of the internet, and a relentless engine of customer obsession. Bezos's insistence on long-term thinking — 'Day 1' forever, willingness to be misunderstood for years — turned a money-losing retailer into critical global infrastructure.",
      "Having stepped back from running Amazon day to day, he now pours his attention and fortune into Blue Origin, the space company he quietly founded in 2000. His thesis is long and literal: move polluting heavy industry into space so Earth can be zoned residential, with millions of people living and working beyond the planet.",
    ],
    buildingNow: [
      {
        title: "Blue Origin & New Glenn",
        detail:
          "Building heavy-lift reusable rockets and orbital infrastructure aimed at lowering the cost of getting mass to space.",
      },
      {
        title: "Industry in Orbit",
        detail:
          "Pursuing a long-term vision of space stations and off-world manufacturing so Earth can preserve its environment.",
      },
      {
        title: "The Bezos Earth Fund",
        detail:
          "Directing billions toward climate and nature solutions through one of the largest philanthropic commitments in history.",
      },
      {
        title: "Lunar Landers",
        detail:
          "Developing the Blue Moon lander to return cargo and crew to the Moon under NASA's Artemis program.",
      },
    ],
    timeline: [
      {
        year: "1994",
        title: "Founds Amazon",
        detail: "Leaves Wall Street to sell books online from a Seattle garage.",
      },
      {
        year: "2002",
        title: "Amazon Web Services",
        detail:
          "Launches the cloud business that becomes the backbone of the internet.",
      },
      {
        year: "2000",
        title: "Founds Blue Origin",
        detail: "Quietly starts a space company with a multi-decade horizon.",
      },
      {
        year: "2013",
        title: "Buys The Washington Post",
        detail: "Acquires and revives the storied newspaper.",
      },
      {
        year: "2021",
        title: "Flies to Space",
        detail: "Rides New Shepard past the edge of space on its first crewed flight.",
      },
      {
        year: "2021",
        title: "Steps Down as CEO",
        detail:
          "Hands over Amazon to focus on Blue Origin, climate, and philanthropy.",
      },
    ],
    contributions: [
      {
        title: "Reinventing Retail",
        detail:
          "Built the customer-obsessed e-commerce model that reshaped global shopping and supply chains.",
      },
      {
        title: "Cloud Computing",
        detail:
          "Through AWS, turned computing into a utility startups and enterprises rent by the hour — fueling a generation of companies.",
      },
      {
        title: "Long-Term Capitalism",
        detail:
          "Championed multi-year, misunderstood bets over quarterly results, influencing how founders think about time.",
      },
      {
        title: "Private Spaceflight",
        detail:
          "Helped open the commercial space race with reusable suborbital and orbital vehicles.",
      },
    ],
    quotes: [
      "We are stubborn on vision. We are flexible on details.",
      "If you double the number of experiments you do per year, you're going to double your inventiveness.",
      "Your brand is what other people say about you when you're not in the room.",
    ],
    impact: [
      "Amazon changed the baseline expectations of modern life — two-day delivery, one-click ordering, and a cloud that silently runs much of the web. Few companies have touched daily routines so completely.",
      "His space work is a slower bet, measured in decades. Whether or not millions ever live in orbit, Blue Origin has helped normalize the idea that the next frontier of industry might not be on Earth at all.",
    ],
    didYouKnow: [
      "He wrote Amazon's original business plan on a cross-country road trip.",
      "Blue Origin's motto is 'Gradatim Ferociter' — step by step, ferociously.",
      "He funds a 10,000-year mechanical clock built inside a mountain to encourage long-term thinking.",
    ],
    relatedCategorySlugs: ["astronomy", "materials-science", "climate-science"],
    sources: [
      {
        title: "Jeff Bezos — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Jeff_Bezos",
      },
      { title: "Blue Origin", url: "https://www.blueorigin.com/" },
    ],
  },

  "jennifer-doudna": {
    slug: "jennifer-doudna",
    name: "Jennifer Doudna",
    field: "Genome Editing",
    era: "Working Today",
    born: "Born 1964 · Washington, D.C., USA",
    base: "Berkeley, California",
    tagline:
      "She helped turn a bacterial immune system into the most powerful tool biology has ever held.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Jennifer_Doudna_by_Christopher_Michel_in_2023_01.jpg/500px-Jennifer_Doudna_by_Christopher_Michel_in_2023_01.jpg",
    theme: {
      accent: "#16A34A",
      accentSoft: "#ECFDF3",
      accentDeep: "#166534",
      heroFrom: "#06140D",
      heroTo: "#0C2A1B",
      motif: "genome",
    },
    biography: [
      "Jennifer Doudna grew up in Hilo, Hawai'i, an outsider kid who found refuge in the natural world and in a worn copy of The Double Helix that convinced her women could do science. She trained as a biochemist studying RNA — the molecule long treated as DNA's humble messenger — and built a career deciphering the precise three-dimensional shapes that let RNA do unexpected, powerful things.",
      "That deep RNA expertise positioned her perfectly when a strange bacterial defense system called CRISPR came into focus. Working with Emmanuelle Charpentier, she showed that the system could be reprogrammed into a simple, guidable tool to cut DNA at any chosen location — a discovery so versatile it spread through the world's labs within months and won the two of them the Nobel Prize in Chemistry.",
      "Now she leads the effort to make that power both safer and fairer. From her institute in Berkeley she pushes CRISPR toward real cures while wrestling openly with the ethics it forces on humanity: who gets edited, who decides, and where the line between treating disease and redesigning ourselves should fall.",
    ],
    buildingNow: [
      {
        title: "The Innovative Genomics Institute",
        detail:
          "Leading a research hub turning CRISPR into affordable cures for genetic disease and tools for climate-resilient agriculture.",
      },
      {
        title: "Curing Genetic Disease",
        detail:
          "Driving CRISPR therapies for conditions like sickle cell disease from the lab toward patients who need them.",
      },
      {
        title: "Climate & Agriculture",
        detail:
          "Applying gene editing to crops and soil microbes to capture carbon and feed a warming world.",
      },
      {
        title: "Ethics & Access",
        detail:
          "Convening scientists and the public on the responsible, equitable use of human genome editing.",
      },
    ],
    timeline: [
      {
        year: "1989",
        title: "PhD at Harvard",
        detail: "Studies the structure and chemistry of RNA.",
      },
      {
        year: "2012",
        title: "CRISPR-Cas9",
        detail:
          "With Charpentier, shows CRISPR can be programmed to cut DNA at chosen sites.",
      },
      {
        year: "2014",
        title: "Innovative Genomics Institute",
        detail: "Co-founds a center to translate gene editing into real cures.",
      },
      {
        year: "2020",
        title: "Nobel Prize in Chemistry",
        detail:
          "Shares the prize with Emmanuelle Charpentier for developing genome editing.",
      },
      {
        year: "2023",
        title: "CRISPR Therapy Approved",
        detail:
          "The first CRISPR-based medicine reaches patients with sickle cell disease.",
      },
    ],
    contributions: [
      {
        title: "Programmable Gene Editing",
        detail:
          "Helped transform CRISPR-Cas9 into a simple, precise tool to rewrite DNA — the foundation of modern genetic engineering.",
      },
      {
        title: "RNA Structural Biology",
        detail:
          "Decades of work revealing how RNA folds and functions, the expertise that made the CRISPR breakthrough possible.",
      },
      {
        title: "Translating Science to Cures",
        detail:
          "Built institutions to carry gene editing from journal pages to clinics and farms.",
      },
      {
        title: "Public Stewardship",
        detail:
          "Pushed the scientific community toward open debate on the ethics of editing the human germline.",
      },
    ],
    quotes: [
      "The power to control our species' genetic future is awesome and terrifying. Deciding how to handle it may be the biggest challenge we have ever faced.",
      "I think it's important for scientists to communicate with the public.",
      "Nature is a marvelous inventor, and we are just learning to read its code.",
    ],
    impact: [
      "CRISPR has become the workhorse of modern biology, used in tens of thousands of labs to study genes, engineer cells, and design new medicines. The first approved CRISPR therapy already frees patients from a lifetime of pain.",
      "Doudna's deeper contribution may be how she carries that power: insisting, loudly and early, that a tool able to rewrite the code of life demands public conversation, not just scientific excitement.",
    ],
    didYouKnow: [
      "A childhood copy of 'The Double Helix' convinced her that a woman could become a scientist.",
      "CRISPR began as research into how bacteria fight off viruses.",
      "She is the first woman from her field to share a Nobel Prize with another woman.",
    ],
    relatedCategorySlugs: ["biology", "human-health", "microbiology"],
    sources: [
      {
        title: "Jennifer Doudna — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Jennifer_Doudna",
      },
      {
        title: "The Nobel Prize in Chemistry 2020",
        url: "https://www.nobelprize.org/prizes/chemistry/2020/doudna/facts/",
      },
    ],
  },

  "tim-berners-lee": {
    slug: "tim-berners-lee",
    name: "Tim Berners-Lee",
    field: "Computer Science",
    era: "Working Today",
    born: "Born 1955 · London, England",
    base: "Massachusetts, USA & London, UK",
    tagline:
      "He invented the web and gave it away for free — now he's fighting to give it back to you.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Tim_Berners-Lee_at_the_2025_Web_Summit_%28Cropped%29.jpg",
    theme: {
      accent: "#0891B2",
      accentSoft: "#ECFEFF",
      accentDeep: "#155E75",
      heroFrom: "#06141A",
      heroTo: "#0A2A38",
      motif: "web",
    },
    biography: [
      "Tim Berners-Lee was raised by two mathematicians who worked on one of the earliest commercial computers, and who taught him that machines could do anything you could describe precisely enough. He built his own computer from a soldering iron and an old television, studied physics at Oxford, and ended up a software consultant at CERN, the vast particle-physics lab where thousands of scientists struggled to share information across incompatible systems.",
      "In 1989 he wrote a modest proposal — his boss scrawled 'vague but exciting' on the cover — to link documents across the internet using hypertext. By 1991 he had built it all: the first web browser, the first server, and the three technologies that still run the web today, URLs, HTTP, and HTML. Crucially, he and CERN released it to the world royalty-free, refusing to patent or own it.",
      "That decision — to give away the most valuable invention of the information age — defines him still. Decades later, alarmed by how the open web has been captured by a handful of platforms harvesting personal data, he is working to re-decentralize it, returning control of personal information to the people who create it.",
    ],
    buildingNow: [
      {
        title: "Re-decentralizing the Web",
        detail:
          "Developing Solid, a technology that lets people store their own data in personal 'pods' and grant apps access on their terms.",
      },
      {
        title: "Data Sovereignty",
        detail:
          "Building ventures and standards so individuals — not platforms — own and control their personal information.",
      },
      {
        title: "The Web Foundation's Mission",
        detail:
          "Championing an open, safe, and universal web, and fighting to close the digital divide for the billions still offline.",
      },
      {
        title: "Standards Stewardship",
        detail:
          "Continuing to guide the open standards that keep the web interoperable and free for everyone to build on.",
      },
    ],
    timeline: [
      {
        year: "1989",
        title: "The Proposal",
        detail:
          "Writes the memo at CERN that becomes the World Wide Web — 'vague but exciting.'",
      },
      {
        year: "1991",
        title: "The Web Goes Live",
        detail:
          "Builds the first browser, server, URLs, HTTP, and HTML and puts the web online.",
      },
      {
        year: "1993",
        title: "Released Royalty-Free",
        detail: "CERN makes the web's technology free for anyone to use forever.",
      },
      {
        year: "1994",
        title: "Founds the W3C",
        detail:
          "Creates the consortium that keeps web standards open and interoperable.",
      },
      {
        year: "2016",
        title: "Turing Award",
        detail: "Receives computing's highest honor for inventing the web.",
      },
      {
        year: "2018",
        title: "Solid & Inrupt",
        detail:
          "Launches the project to give people back control of their personal data.",
      },
    ],
    contributions: [
      {
        title: "The World Wide Web",
        detail:
          "Invented the system of linked documents — URLs, HTTP, and HTML — that turned the internet into a universal information space.",
      },
      {
        title: "An Open, Free Web",
        detail:
          "Refused to patent the web, ensuring anyone could build on it without permission or payment.",
      },
      {
        title: "Web Standards",
        detail:
          "Founded the W3C to keep the web interoperable rather than splintered across competing companies.",
      },
      {
        title: "The Decentralization Movement",
        detail:
          "Now leading efforts to return ownership of personal data from platforms to individuals.",
      },
    ],
    quotes: [
      "This is for everyone.",
      "The Web does not just connect machines, it connects people.",
      "We need diversity of thought in the world to face the new challenges.",
    ],
    impact: [
      "Almost everything we now call 'online' — shopping, learning, banking, connecting — runs on the three technologies he built and gave away. Few single decisions have shaped daily human life more than his refusal to own the web.",
      "His current fight is a kind of sequel: having watched the open web concentrate into a few data-hungry platforms, he is trying to rebuild its original promise, where people, not corporations, hold the keys to their own information.",
    ],
    didYouKnow: [
      "His proposal for the web was returned with the handwritten note 'vague but exciting.'",
      "He typed the opening ceremony message 'This is for everyone' live at the 2012 London Olympics.",
      "He could have become a billionaire many times over had he patented the web.",
    ],
    relatedCategorySlugs: ["physics", "materials-science", "neuroscience"],
    sources: [
      {
        title: "Tim Berners-Lee — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Tim_Berners-Lee",
      },
      {
        title: "World Wide Web Foundation",
        url: "https://webfoundation.org/",
      },
    ],
  },

  "demis-hassabis": {
    slug: "demis-hassabis",
    name: "Demis Hassabis",
    field: "Artificial Intelligence",
    era: "Working Today",
    born: "Born 1976 · London, England",
    base: "London, UK",
    tagline:
      "A chess prodigy turned neuroscientist building AI to solve science's hardest problems.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Demis_Hassabis%2C_2024_Nobel_Prize_Laureate_in_Chemistry_7_%28cropped%29.jpg/500px-Demis_Hassabis%2C_2024_Nobel_Prize_Laureate_in_Chemistry_7_%28cropped%29.jpg",
    theme: {
      accent: "#4F46E5",
      accentSoft: "#EEF0FF",
      accentDeep: "#3730A3",
      heroFrom: "#080814",
      heroTo: "#181640",
      motif: "neural",
    },
    biography: [
      "Demis Hassabis was a chess master at thirteen and a designer of hit video games before he turned twenty. But games were never the point — they were a way to study intelligence. He stepped away from a successful career in gaming to earn a PhD in cognitive neuroscience, determined to understand how the brain imagines, remembers, and plans, and then to rebuild those abilities in machines.",
      "In 2010 he co-founded DeepMind on a radical premise: 'solve intelligence, and then use it to solve everything else.' His teams stunned the world by training programs that taught themselves to master Atari games from raw pixels and, in 2016, to beat the world's best Go player — a feat experts had predicted was decades away. Each result showed that learning systems could discover strategies no human had taught them.",
      "Then he aimed that capability at science itself. AlphaFold, his lab's system for predicting the three-dimensional shape of proteins, solved a fifty-year-old grand challenge in biology and earned him a share of the Nobel Prize in Chemistry. He now leads Google's combined AI efforts, pushing toward systems that can accelerate discovery across medicine, materials, and mathematics.",
    ],
    buildingNow: [
      {
        title: "AI for Scientific Discovery",
        detail:
          "Directing Google DeepMind to build AI that accelerates breakthroughs in biology, chemistry, materials, and mathematics.",
      },
      {
        title: "The AlphaFold Legacy",
        detail:
          "Expanding the open protein database that has given millions of researchers the shapes of nearly every known protein.",
      },
      {
        title: "Curing Disease with AI",
        detail:
          "Spinning out efforts like Isomorphic Labs to use AI to design new medicines far faster than traditional methods.",
      },
      {
        title: "The Road to AGI",
        detail:
          "Pursuing — carefully and safely — artificial general intelligence capable of reasoning across any domain.",
      },
    ],
    timeline: [
      {
        year: "1994",
        title: "Game Designer",
        detail: "Co-designs the hit simulation game Theme Park as a teenager.",
      },
      {
        year: "2009",
        title: "PhD in Neuroscience",
        detail: "Studies memory and imagination in the human brain.",
      },
      {
        year: "2010",
        title: "Founds DeepMind",
        detail: "Sets out to 'solve intelligence, then solve everything else.'",
      },
      {
        year: "2016",
        title: "AlphaGo Beats a Champion",
        detail:
          "AlphaGo defeats Go world champion Lee Sedol, a landmark for AI.",
      },
      {
        year: "2020",
        title: "AlphaFold",
        detail:
          "Solves the protein-folding problem, predicting structures with stunning accuracy.",
      },
      {
        year: "2024",
        title: "Nobel Prize in Chemistry",
        detail:
          "Shares the prize for using AI to predict protein structures.",
      },
    ],
    contributions: [
      {
        title: "AlphaFold",
        detail:
          "Cracked a 50-year grand challenge by predicting protein structures, accelerating research into disease and drug design worldwide.",
      },
      {
        title: "Deep Reinforcement Learning",
        detail:
          "Built systems that taught themselves to master games and tasks from scratch, proving machines can discover strategy.",
      },
      {
        title: "AI as a Scientific Instrument",
        detail:
          "Reframed AI not as a chatbot but as a microscope for discovery — a tool to expand the frontier of knowledge.",
      },
      {
        title: "Open Science",
        detail:
          "Released AlphaFold's predictions freely, putting near-every known protein structure into researchers' hands.",
      },
    ],
    quotes: [
      "Solve intelligence, and then use that to solve everything else.",
      "AI could be one of the most beneficial technologies humanity has ever invented.",
      "I think of AI as the ultimate tool to accelerate scientific discovery.",
    ],
    impact: [
      "AlphaFold alone reshaped biology: structures that once took a PhD student years to determine now appear in seconds, speeding research into everything from antibiotics to enzymes that eat plastic.",
      "Hassabis's larger bet is that AI's highest use is discovery — compressing decades of scientific progress into years. If he is right, the tools his labs build could become the most powerful instruments science has ever had.",
    ],
    didYouKnow: [
      "He reached chess master level at age 13, second in the world for his age.",
      "He co-designed the classic game Theme Park while still a teenager.",
      "DeepMind's AlphaFold has shared structures for over 200 million proteins.",
    ],
    relatedCategorySlugs: ["neuroscience", "biology", "physics"],
    sources: [
      {
        title: "Demis Hassabis — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Demis_Hassabis",
      },
      { title: "Google DeepMind", url: "https://deepmind.google/" },
    ],
  },

  "jensen-huang": {
    slug: "jensen-huang",
    name: "Jensen Huang",
    field: "Accelerated Computing",
    era: "Working Today",
    born: "Born 1963 · Tainan, Taiwan",
    base: "Santa Clara, California",
    tagline:
      "He spent thirty years building the chips that, almost by accident, became the engine of AI.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Jen-Hsun_Huang_2025.jpg/500px-Jen-Hsun_Huang_2025.jpg",
    theme: {
      accent: "#16A34A",
      accentSoft: "#ECFDF3",
      accentDeep: "#15803D",
      heroFrom: "#06140C",
      heroTo: "#0A2616",
      motif: "chip",
    },
    biography: [
      "Jensen Huang was sent from Taiwan to the United States as a boy and, through a mix-up, landed at a reform-school-like boarding academy in rural Kentucky, where he cleaned toilets and learned table tennis well enough to compete nationally. That early grit became a trademark. He trained as an electrical engineer, worked designing microchips, and in 1993 — on his thirtieth birthday — co-founded NVIDIA at a roadside diner.",
      "His bet was that special-purpose chips for rendering graphics would unlock entirely new kinds of computing. For years NVIDIA was known mainly to gamers, building the graphics cards that made virtual worlds look real. But Huang kept investing in a riskier idea: that those massively parallel chips could do far more than draw pixels, and he built the software platform, CUDA, to let researchers program them for anything.",
      "That patient bet detonated when deep learning arrived. It turned out that training neural networks was exactly the kind of parallel math NVIDIA's chips were built for. Almost overnight, the company became the indispensable supplier of the AI era — and one of the most valuable companies on Earth — with Huang, still in his signature black leather jacket, at its center.",
    ],
    buildingNow: [
      {
        title: "The AI Compute Platform",
        detail:
          "Building the GPUs, networking, and systems that train and run nearly every major AI model in the world.",
      },
      {
        title: "AI Factories",
        detail:
          "Reframing data centers as 'AI factories' that manufacture intelligence, and selling the full stack to power them.",
      },
      {
        title: "Robotics & Physical AI",
        detail:
          "Developing platforms to bring AI into the physical world — robots, autonomous vehicles, and digital twins of factories.",
      },
      {
        title: "AI for Science",
        detail:
          "Pushing accelerated computing into drug discovery, climate modeling, and biology to speed up research.",
      },
    ],
    timeline: [
      {
        year: "1993",
        title: "Founds NVIDIA",
        detail: "Co-founds the company at a diner on his 30th birthday.",
      },
      {
        year: "1999",
        title: "Invents the GPU",
        detail:
          "NVIDIA popularizes the graphics processing unit, transforming gaming.",
      },
      {
        year: "2006",
        title: "Launches CUDA",
        detail:
          "Opens the GPU to general-purpose computing — a bet that pays off years later.",
      },
      {
        year: "2012",
        title: "The Deep Learning Spark",
        detail:
          "AlexNet, trained on NVIDIA GPUs, ignites the modern AI revolution.",
      },
      {
        year: "2023",
        title: "The AI Boom",
        detail:
          "NVIDIA becomes the essential supplier of AI compute as demand explodes.",
      },
    ],
    contributions: [
      {
        title: "The Modern GPU",
        detail:
          "Popularized the graphics processor and then transformed it into the workhorse of parallel computing.",
      },
      {
        title: "CUDA",
        detail:
          "Built the software platform that let scientists use GPUs for anything — the foundation deep learning was built on.",
      },
      {
        title: "Powering the AI Era",
        detail:
          "Supplied the compute that trains and runs the AI models reshaping science and industry.",
      },
      {
        title: "Accelerated Computing",
        detail:
          "Championed a shift from general-purpose CPUs to specialized chips, redefining how the world computes.",
      },
    ],
    quotes: [
      "I wish upon you ample doses of pain and suffering — because that is where character and greatness come from.",
      "Don't be afraid of doing something that has never been done before.",
      "The more you buy, the more you save.",
    ],
    impact: [
      "Virtually every large AI model — the ones writing, drawing, and discovering today — is trained on hardware Huang's company makes. By betting decades early on parallel computing, he positioned NVIDIA as the picks-and-shovels supplier of the AI gold rush.",
      "His deeper legacy is conceptual: he argued for years that the future of computing was specialized and parallel, not general and serial. The entire industry has now followed him there.",
    ],
    didYouKnow: [
      "He was a nationally ranked table tennis player as a teenager.",
      "He has worn his signature black leather jacket to nearly every public appearance for years.",
      "He has signed a NVIDIA logo tattoo on his arm after the stock hit a milestone.",
    ],
    relatedCategorySlugs: ["physics", "materials-science", "neuroscience"],
    sources: [
      {
        title: "Jensen Huang — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Jensen_Huang",
      },
      { title: "NVIDIA", url: "https://www.nvidia.com/" },
    ],
  },

  "geoffrey-hinton": {
    slug: "geoffrey-hinton",
    name: "Geoffrey Hinton",
    field: "Deep Learning",
    era: "Working Today",
    born: "Born 1947 · Wimbledon, London, England",
    base: "Toronto, Canada",
    tagline:
      "He believed in neural networks for forty years, mostly alone — and then he was proven spectacularly right.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Geoffrey_Hinton_in_2026.jpg/500px-Geoffrey_Hinton_in_2026.jpg",
    theme: {
      accent: "#6366F1",
      accentSoft: "#EEF0FF",
      accentDeep: "#4338CA",
      heroFrom: "#0A0A16",
      heroTo: "#191843",
      motif: "neural",
    },
    biography: [
      "Geoffrey Hinton comes from a long line of scientists, but he spent much of his career as a heretic. While most of artificial intelligence chased hand-coded logic, he was convinced the path to machine intelligence ran through something messier and more biological: networks of simple artificial neurons that learn from examples, the way a brain does. For decades the idea was deeply unfashionable, and funding was scarce.",
      "He kept at it anyway, often working in relative obscurity in Britain and then Canada. In the 1980s he helped develop backpropagation, the learning algorithm that lets such networks improve themselves. Then he waited — for data and computing power to catch up. In 2012 his students used neural networks to shatter records in image recognition, and the field he had quietly nurtured for thirty years suddenly became the center of technology.",
      "Crowned the 'Godfather of AI' and later a Nobel laureate, Hinton has since taken a surprising turn. Alarmed by how fast the systems he pioneered are advancing, he stepped back from his industry role to speak freely about their risks — becoming one of the most credible voices warning that humanity must take the technology's dangers seriously.",
    ],
    buildingNow: [
      {
        title: "Warning About AI Risk",
        detail:
          "Speaking publicly and frankly about the existential and societal risks of advanced AI, urging caution and research into safety.",
      },
      {
        title: "Understanding Intelligence",
        detail:
          "Continuing to ask how learning really works — in brains and machines — and what current models still get wrong.",
      },
      {
        title: "Mentoring the Field",
        detail:
          "His students and academic descendants now lead AI labs across the world, extending his ideas.",
      },
      {
        title: "Shaping Policy",
        detail:
          "Advising governments and the public on how to govern a technology advancing faster than anyone expected.",
      },
    ],
    timeline: [
      {
        year: "1986",
        title: "Backpropagation",
        detail:
          "Co-authors the paper that popularizes how neural networks learn.",
      },
      {
        year: "2012",
        title: "AlexNet",
        detail:
          "His students' neural network smashes the ImageNet image-recognition benchmark.",
      },
      {
        year: "2013",
        title: "Joins Google",
        detail: "Brings his deep-learning research to industry scale.",
      },
      {
        year: "2018",
        title: "Turing Award",
        detail:
          "Shares computing's top honor for the deep-learning breakthrough.",
      },
      {
        year: "2023",
        title: "Steps Back to Warn",
        detail:
          "Leaves his role at Google to speak freely about the dangers of AI.",
      },
      {
        year: "2024",
        title: "Nobel Prize in Physics",
        detail:
          "Honored for foundational discoveries enabling machine learning with neural networks.",
      },
    ],
    contributions: [
      {
        title: "Backpropagation",
        detail:
          "Helped develop the core algorithm that lets neural networks learn from their mistakes — the engine of modern AI.",
      },
      {
        title: "Deep Learning",
        detail:
          "Kept neural networks alive through decades of skepticism, then proved they could outperform everything else.",
      },
      {
        title: "A Generation of Researchers",
        detail:
          "Trained the scientists who now lead the world's most important AI labs.",
      },
      {
        title: "A Voice for Caution",
        detail:
          "Brought rare credibility to warnings about the risks of the technology he helped create.",
      },
    ],
    quotes: [
      "It is hard to see how you can prevent the bad actors from using it for bad things.",
      "I console myself with the normal excuse: if I hadn't done it, somebody else would have.",
      "The brain has about a trillion connections — and we're starting to understand what they're for.",
    ],
    impact: [
      "Nearly every modern AI system traces its lineage to the neural-network ideas Hinton championed when almost no one else would. His persistence through decades of doubt is one of science's great long bets.",
      "His decision to step back and warn the world carries unusual weight precisely because he built the thing he is warning about — a reminder that the people closest to a technology often see its dangers most clearly.",
    ],
    didYouKnow: [
      "He turned down salary to stay in academia, fearing industry would constrain his ideas.",
      "He often works standing up because of a chronic back condition.",
      "He is descended from George Boole, whose logic underlies all digital computers.",
    ],
    relatedCategorySlugs: ["neuroscience", "physics", "human-health"],
    sources: [
      {
        title: "Geoffrey Hinton — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Geoffrey_Hinton",
      },
      {
        title: "The Nobel Prize in Physics 2024",
        url: "https://www.nobelprize.org/prizes/physics/2024/hinton/facts/",
      },
    ],
  },

  "fei-fei-li": {
    slug: "fei-fei-li",
    name: "Fei-Fei Li",
    field: "Artificial Intelligence",
    era: "Working Today",
    born: "Born 1976 · Beijing, China",
    base: "Stanford, California",
    tagline:
      "She gave machines eyes — and now insists they be built to serve human dignity.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c7/Fei-Fei_Li_at_AI_for_Good_2017.jpg",
    theme: {
      accent: "#DB2777",
      accentSoft: "#FDF2F8",
      accentDeep: "#9D174D",
      heroFrom: "#160610",
      heroTo: "#3A0A24",
      motif: "neural",
    },
    biography: [
      "Fei-Fei Li arrived in the United States from China at fifteen, speaking little English and helping run her family's dry-cleaning shop in New Jersey while excelling in school. That immigrant determination carried her to Princeton and then a physics-rooted path into the study of how brains and machines perceive the visual world.",
      "Her defining insight ran against the grain. While the AI field obsessed over better algorithms, she became convinced that intelligence needed data — vast amounts of it. She led the creation of ImageNet, a hand-labeled database of millions of images across thousands of categories, an undertaking many colleagues thought was a waste of time. The annual contest she built around it became the proving ground where deep learning exploded in 2012, launching the modern AI era.",
      "Having helped unleash the technology, she has spent the years since insisting it be steered wisely. As a professor at Stanford, co-director of its Institute for Human-Centered AI, and founder of a spatial-intelligence company, she argues relentlessly that AI must augment people rather than replace them — and that the field needs the voices of those it will affect.",
    ],
    buildingNow: [
      {
        title: "Spatial Intelligence",
        detail:
          "Building AI that understands and acts in the three-dimensional physical world, not just text and images.",
      },
      {
        title: "Human-Centered AI",
        detail:
          "Co-leading Stanford's institute dedicated to ensuring AI improves the human condition.",
      },
      {
        title: "AI in Healthcare",
        detail:
          "Developing ambient intelligence to make hospitals safer and support clinicians and the elderly.",
      },
      {
        title: "Diversifying the Field",
        detail:
          "Through AI4ALL, opening AI education to students from underrepresented backgrounds.",
      },
    ],
    timeline: [
      {
        year: "2009",
        title: "ImageNet",
        detail:
          "Leads the creation of the massive labeled image dataset that reshapes AI.",
      },
      {
        year: "2012",
        title: "The Deep Learning Moment",
        detail:
          "Her ImageNet challenge becomes the stage where deep learning breaks through.",
      },
      {
        year: "2017",
        title: "AI4ALL",
        detail:
          "Co-founds a nonprofit to bring diverse young people into AI.",
      },
      {
        year: "2019",
        title: "Stanford HAI",
        detail: "Co-founds the Institute for Human-Centered Artificial Intelligence.",
      },
      {
        year: "2024",
        title: "World Labs",
        detail:
          "Founds a company to build AI with true spatial intelligence.",
      },
    ],
    contributions: [
      {
        title: "ImageNet",
        detail:
          "Created the dataset that proved AI needs data at scale, providing the fuel for the deep-learning revolution.",
      },
      {
        title: "Computer Vision",
        detail:
          "Advanced the science of teaching machines to see and understand images.",
      },
      {
        title: "Human-Centered AI",
        detail:
          "Built an intellectual movement insisting AI be designed around human values and benefit.",
      },
      {
        title: "Widening the Door",
        detail:
          "Worked to make AI education and the field itself more diverse and representative.",
      },
    ],
    quotes: [
      "There's nothing artificial about AI. It's inspired by people, it's created by people, and most importantly it impacts people.",
      "I often tell my students not to be misled by the name 'artificial intelligence' — there is nothing artificial about it.",
      "If we want machines to think, we need to teach them to see.",
    ],
    impact: [
      "ImageNet changed the trajectory of AI by proving that scale — of data — could unlock capabilities algorithms alone could not. Almost every breakthrough since has been built on that lesson.",
      "Just as important is her insistence on the human side of the equation: that the people building AI, and the values they build in, will determine whether it dignifies or diminishes us. She has made 'human-centered' a standard the whole field now invokes.",
    ],
    didYouKnow: [
      "She ran her family's dry-cleaning business while attending high school as a new immigrant.",
      "Many colleagues doubted ImageNet was worth the enormous labeling effort it required.",
      "She has championed bringing more women and minorities into artificial intelligence.",
    ],
    relatedCategorySlugs: ["neuroscience", "human-health", "physics"],
    sources: [
      {
        title: "Fei-Fei Li — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Fei-Fei_Li",
      },
      {
        title: "Stanford Human-Centered AI",
        url: "https://hai.stanford.edu/",
      },
    ],
  },

  "katalin-kariko": {
    slug: "katalin-kariko",
    name: "Katalin Karikó",
    field: "mRNA Biochemistry",
    era: "Working Today",
    born: "Born 1955 · Szolnok, Hungary",
    base: "Pennsylvania, USA & Szeged, Hungary",
    tagline:
      "Demoted, doubted, and nearly deported from science — her stubborn idea saved millions of lives.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/27/Katalin_Karik%C3%B3_by_Michel_2024_02.jpg",
    theme: {
      accent: "#0D9488",
      accentSoft: "#ECFDFA",
      accentDeep: "#115E59",
      heroFrom: "#061411",
      heroTo: "#0A2A28",
      motif: "genome",
    },
    biography: [
      "Katalin Karikó grew up in a one-room adobe house in rural Hungary, the daughter of a butcher, with no running water and a fierce curiosity about how living things work. When her research funding dried up, she left for the United States in 1985 with her family, her savings sewn into her daughter's teddy bear, determined to pursue a single, unfashionable idea: that messenger RNA — the molecule that carries the cell's instructions — could be used as a medicine.",
      "For decades, almost no one believed her. Grant after grant was rejected. She was demoted, pushed off the tenure track, and at one point told her career was effectively over. But she kept working, often unpaid for her own line of research, convinced that if she could only stop the body from rejecting synthetic mRNA, it could be made to produce any protein doctors needed.",
      "With her collaborator Drew Weissman, she finally solved that problem in 2005, discovering a chemical tweak that let mRNA slip past the immune system's alarms. The world ignored the breakthrough for years — until a pandemic arrived. The mRNA COVID-19 vaccines, built directly on her work, reached billions of people in record time, and the science once dismissed as a dead end won her the Nobel Prize.",
    ],
    buildingNow: [
      {
        title: "mRNA Beyond Vaccines",
        detail:
          "Advancing mRNA as a platform for therapies against cancer, rare diseases, and conditions far beyond infectious disease.",
      },
      {
        title: "Mentoring & Teaching",
        detail:
          "Working with universities in the U.S. and Hungary to train the next generation of RNA scientists.",
      },
      {
        title: "Championing Persistence",
        detail:
          "Speaking worldwide about resilience, funding reform, and supporting unglamorous, long-horizon science.",
      },
      {
        title: "Expanding the Platform",
        detail:
          "Helping refine mRNA delivery and design so the technology can treat more diseases more safely.",
      },
    ],
    timeline: [
      {
        year: "1985",
        title: "Emigrates to the U.S.",
        detail:
          "Leaves Hungary for a research post, savings hidden in a teddy bear.",
      },
      {
        year: "1990s",
        title: "Years of Rejection",
        detail:
          "Repeatedly denied grants; demoted while pursuing mRNA as medicine.",
      },
      {
        year: "2005",
        title: "The Breakthrough",
        detail:
          "With Weissman, makes synthetic mRNA invisible to the immune system.",
      },
      {
        year: "2013",
        title: "Joins BioNTech",
        detail: "Becomes a senior executive to develop mRNA therapeutics.",
      },
      {
        year: "2020",
        title: "mRNA Vaccines",
        detail:
          "Her science underpins the COVID-19 vaccines given to billions.",
      },
      {
        year: "2023",
        title: "Nobel Prize",
        detail:
          "Shares the Nobel Prize in Medicine with Drew Weissman.",
      },
    ],
    contributions: [
      {
        title: "Modified mRNA",
        detail:
          "Discovered how to alter mRNA so the body accepts it — the key that made mRNA medicine possible.",
      },
      {
        title: "mRNA Vaccines",
        detail:
          "Laid the foundation for vaccines that can be designed in days and saved millions of lives in a pandemic.",
      },
      {
        title: "A New Class of Medicine",
        detail:
          "Opened the door to using the body's own machinery to make therapeutic proteins on demand.",
      },
      {
        title: "A Lesson in Persistence",
        detail:
          "Proved the value of patient, unfashionable science pursued against decades of rejection.",
      },
    ],
    quotes: [
      "I always saw the problems as something to solve, not as something to fear.",
      "When you face difficulties, you have to work harder and just continue.",
      "I was not working for prizes. I was working because I loved the science.",
    ],
    impact: [
      "The mRNA platform Karikó spent her life defending turned out to be one of the most adaptable tools in medicine — vaccines that can be reprogrammed for a new threat in days, and therapies now being aimed at cancer and rare disease.",
      "Her story has also become a parable about how science really works: that breakthroughs often come from stubborn outsiders pursuing ideas the system has written off, and that funding and patience matter as much as genius.",
    ],
    didYouKnow: [
      "She emigrated with her family's savings hidden inside her daughter's teddy bear.",
      "She was demoted and pushed off the tenure track for pursuing mRNA research.",
      "Her daughter Susan Francia is a two-time Olympic gold medalist rower.",
    ],
    relatedCategorySlugs: ["human-health", "microbiology", "biology"],
    sources: [
      {
        title: "Katalin Karikó — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Katalin_Karik%C3%B3",
      },
      {
        title: "The Nobel Prize in Medicine 2023",
        url: "https://www.nobelprize.org/prizes/medicine/2023/kariko/facts/",
      },
    ],
  },

  "carolyn-bertozzi": {
    slug: "carolyn-bertozzi",
    name: "Carolyn Bertozzi",
    field: "Chemical Biology",
    era: "Working Today",
    born: "Born 1966 · Boston, Massachusetts",
    base: "Stanford, California",
    tagline:
      "She invented a way to do chemistry inside living cells — without harming them.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Carolyn_Bertozzi_by_Christopher_Michel_in_2022_4.jpg/500px-Carolyn_Bertozzi_by_Christopher_Michel_in_2022_4.jpg",
    theme: {
      accent: "#D97706",
      accentSoft: "#FFF7ED",
      accentDeep: "#9A3412",
      heroFrom: "#160C04",
      heroTo: "#36210A",
      motif: "molecule",
    },
    biography: [
      "Carolyn Bertozzi grew up in a science-steeped Massachusetts household — her father was an MIT physicist — but her path was anything but linear. She played keyboards in a rock band (with a future member of Rage Against the Machine) before committing to chemistry, drawn to the molecules that coat the surface of every living cell: sugars, the least understood and most overlooked class of biological molecules.",
      "These sugar coatings, she realized, were everywhere and yet nearly impossible to study, because the usual tools of chemistry would destroy a living cell. So she invented a new kind of chemistry to get around the problem — reactions gentle and selective enough to run inside a living organism without interfering with its natural processes. She named the field 'bioorthogonal chemistry.'",
      "That toolkit let scientists, for the first time, tag and track molecules as they move through living systems. It has reshaped how researchers study disease, build diagnostics, and design drugs — and in 2022 earned her the Nobel Prize in Chemistry. She continues to turn fundamental discoveries about sugars into new ways to fight cancer and other diseases.",
    ],
    buildingNow: [
      {
        title: "Sugar-Targeted Cancer Therapy",
        detail:
          "Developing drugs that strip the sugar 'cloaks' tumors use to hide from the immune system.",
      },
      {
        title: "New Diagnostics",
        detail:
          "Using bioorthogonal chemistry to build tools that detect and image disease inside the body.",
      },
      {
        title: "Founding Companies",
        detail:
          "Translating discoveries into biotech startups that turn chemistry into medicine.",
      },
      {
        title: "Training Chemists",
        detail:
          "Running a leading Stanford lab that mentors the next generation of chemical biologists.",
      },
    ],
    timeline: [
      {
        year: "1993",
        title: "PhD at Berkeley",
        detail: "Earns her doctorate in chemistry.",
      },
      {
        year: "2000",
        title: "Bioorthogonal Chemistry",
        detail:
          "Develops reactions that work safely inside living cells.",
      },
      {
        year: "2010",
        title: "MacArthur 'Genius' Grant",
        detail: "Recognized for pioneering chemical biology.",
      },
      {
        year: "2015",
        title: "Joins Stanford",
        detail: "Builds a major research group at the heart of biotech.",
      },
      {
        year: "2022",
        title: "Nobel Prize in Chemistry",
        detail:
          "Shares the prize for click and bioorthogonal chemistry.",
      },
    ],
    contributions: [
      {
        title: "Bioorthogonal Chemistry",
        detail:
          "Created reactions that run inside living systems without disrupting them — a whole new way to study and treat life.",
      },
      {
        title: "Glycoscience",
        detail:
          "Brought the overlooked chemistry of cell-surface sugars to the center of biology and medicine.",
      },
      {
        title: "Cancer Immunotherapy",
        detail:
          "Pioneered drugs that target the sugar coatings tumors use to evade the immune system.",
      },
      {
        title: "Tools for Discovery",
        detail:
          "Gave researchers worldwide the ability to label and track molecules in living organisms.",
      },
    ],
    quotes: [
      "I tell my students: follow the science where it leads, even if it's into a field no one is paying attention to.",
      "Sugars are the dark matter of the biological universe.",
      "Curiosity-driven research is where the real surprises come from.",
    ],
    impact: [
      "Bioorthogonal chemistry is now a standard tool in labs around the world, used to image living processes, study disease, and build a new generation of targeted medicines.",
      "By taking sugars seriously when few others did, Bertozzi opened an entire frontier of biology — and showed how a curiosity-driven detour can become the foundation for treatments that reach real patients.",
    ],
    didYouKnow: [
      "She played keyboards in a band with a future guitarist of Rage Against the Machine.",
      "She coined the term 'bioorthogonal chemistry' for reactions that don't interfere with biology.",
      "She is one of relatively few women to win the Nobel Prize in Chemistry.",
    ],
    relatedCategorySlugs: ["chemistry", "human-health", "biology"],
    sources: [
      {
        title: "Carolyn Bertozzi — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Carolyn_Bertozzi",
      },
      {
        title: "The Nobel Prize in Chemistry 2022",
        url: "https://www.nobelprize.org/prizes/chemistry/2022/bertozzi/facts/",
      },
    ],
  },

  "sara-seager": {
    slug: "sara-seager",
    name: "Sara Seager",
    field: "Exoplanets & Astrobiology",
    era: "Working Today",
    born: "Born 1971 · Toronto, Canada",
    base: "Cambridge, Massachusetts",
    tagline:
      "She is building the tools to answer one question: are we alone?",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Sara_Seager_CHF-Cain-Conference-May-2016-059.jpg/500px-Sara_Seager_CHF-Cain-Conference-May-2016-059.jpg",
    theme: {
      accent: "#4F46E5",
      accentSoft: "#EEF0FF",
      accentDeep: "#3730A3",
      heroFrom: "#070716",
      heroTo: "#161542",
      motif: "exoplanet",
    },
    biography: [
      "Sara Seager traces her path to a childhood camping trip, when she saw a truly dark sky for the first time and was stunned by the sheer number of stars. That awe never faded. She became a theoretical astrophysicist at a moment when humanity had just begun to confirm that other stars have planets too — and she helped invent the science of figuring out what those distant worlds are actually made of.",
      "Before anyone could photograph an exoplanet, Seager worked out how to read one: by analyzing the faint fingerprint a planet's atmosphere leaves on its star's light. Her pioneering work on exoplanet atmospheres turned far-off dots into places with weather, chemistry, and — potentially — signs of life. She also developed an equation, now bearing her name, for estimating how many detectable signs of life we might find.",
      "Her work is also deeply personal. After the loss of her first husband, she wrote movingly about grief and resilience while continuing to lead missions and instruments aimed at the biggest question in science. A MacArthur 'genius' fellow and MIT professor, she is now focused on building the telescopes and techniques that could, within our lifetimes, detect a living world beyond our own.",
    ],
    buildingNow: [
      {
        title: "Searching for Biosignatures",
        detail:
          "Developing the methods to detect gases in exoplanet atmospheres that could signal the presence of life.",
      },
      {
        title: "Next-Generation Telescopes",
        detail:
          "Helping design space missions and instruments capable of directly imaging Earth-like planets.",
      },
      {
        title: "Small Satellites",
        detail:
          "Leading low-cost miniature space telescopes to scan nearby stars for promising worlds.",
      },
      {
        title: "Venus & Astrobiology",
        detail:
          "Investigating potential signs of life in unexpected places, including the clouds of Venus.",
      },
    ],
    timeline: [
      {
        year: "1999",
        title: "PhD at Harvard",
        detail: "Studies the atmospheres of planets around other stars.",
      },
      {
        year: "2000s",
        title: "Reading Alien Skies",
        detail:
          "Pioneers techniques to determine exoplanet atmospheric composition.",
      },
      {
        year: "2007",
        title: "Joins MIT",
        detail: "Becomes a professor of planetary science and physics.",
      },
      {
        year: "2013",
        title: "MacArthur Fellowship",
        detail: "Awarded a 'genius' grant for her exoplanet research.",
      },
      {
        year: "2020",
        title: "Venus Phosphine",
        detail:
          "Co-reports a possible biosignature gas in the clouds of Venus.",
      },
    ],
    contributions: [
      {
        title: "Exoplanet Atmospheres",
        detail:
          "Pioneered the science of characterizing distant planets by the light passing through their air.",
      },
      {
        title: "The Seager Equation",
        detail:
          "Formulated a way to estimate how many planets with detectable signs of life we might find.",
      },
      {
        title: "The Hunt for Life",
        detail:
          "Helped turn the search for habitable worlds from speculation into a rigorous observational science.",
      },
      {
        title: "Mission Leadership",
        detail:
          "Drives the instruments and telescopes designed to find another Earth.",
      },
    ],
    quotes: [
      "I want to find another Earth and know if there's life on it.",
      "For thousands of years, people have wondered: are we alone? We are the first generation with the tools to find out.",
      "Every star you see in the night sky almost certainly has planets.",
    ],
    impact: [
      "Seager helped create the entire field of exoplanet atmospheres — the science that will determine whether any of the thousands of known worlds beyond our solar system could host life.",
      "If a biosignature is ever found on another planet, it will almost certainly be read using methods she pioneered. Few scientists are working more directly on a discovery that would change humanity's sense of its place in the cosmos.",
    ],
    didYouKnow: [
      "A childhood glimpse of a truly dark, star-filled sky set her on her career.",
      "There is an equation named after her for estimating detectable signs of alien life.",
      "She has written candidly about grief and resilience alongside her science.",
    ],
    relatedCategorySlugs: ["astronomy", "physics", "climate-science"],
    sources: [
      {
        title: "Sara Seager — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Sara_Seager",
      },
      { title: "Sara Seager — MIT", url: "https://www.saraseager.com/" },
    ],
  },

  "neil-degrasse-tyson": {
    slug: "neil-degrasse-tyson",
    name: "Neil deGrasse Tyson",
    field: "Astrophysics",
    era: "Working Today",
    born: "Born 1958 · New York City, USA",
    base: "New York City, USA",
    tagline:
      "An astrophysicist who made the cosmos feel like everyone's backyard.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Neil_DeGrasse_Tyson_%282023%29.jpg",
    theme: {
      accent: "#7C3AED",
      accentSoft: "#F4EFFF",
      accentDeep: "#5B21B6",
      heroFrom: "#080614",
      heroTo: "#1C1442",
      motif: "exoplanet",
    },
    biography: [
      "Neil deGrasse Tyson's life changed at age nine, on a visit to the Hayden Planetarium in New York, when the dome lit up with more stars than he had ever seen from the Bronx. He was sure the city sky was a hoax until the universe revealed itself. That single moment set the course of his life: he would become an astrophysicist, and he would spend it making others feel the same wonder.",
      "Trained at Harvard and Columbia, he became a respected researcher of stellar formation and galactic structure before taking the helm of the very planetarium that had inspired him. From there he grew into the most recognizable scientist in America — a gifted explainer who could make black holes, dark matter, and the scale of the cosmos feel thrilling and accessible to people who had never opened a physics book.",
      "Through his reboot of the landmark series Cosmos, his bestselling books, his long-running podcast, and a relentless public presence, he has done as much as anyone alive to keep science in the popular conversation. He is, by trade, an astrophysicist; by calling, a translator between the universe and the rest of us.",
    ],
    buildingNow: [
      {
        title: "Communicating Science",
        detail:
          "Hosting the StarTalk podcast and series, blending astrophysics with pop culture for millions of listeners.",
      },
      {
        title: "Leading the Hayden Planetarium",
        detail:
          "Directing the New York planetarium that first inspired him, bringing the cosmos to new generations.",
      },
      {
        title: "Writing for the Public",
        detail:
          "Authoring bestselling books that make the universe understandable and exciting to general readers.",
      },
      {
        title: "Defending Reason",
        detail:
          "Advocating for science literacy, evidence, and critical thinking in public life.",
      },
    ],
    timeline: [
      {
        year: "1991",
        title: "PhD at Columbia",
        detail: "Earns his doctorate in astrophysics.",
      },
      {
        year: "1996",
        title: "Hayden Planetarium",
        detail:
          "Becomes director of the planetarium that inspired him as a child.",
      },
      {
        year: "2006",
        title: "NOVA scienceNOW",
        detail: "Hosts the popular science television series.",
      },
      {
        year: "2014",
        title: "Cosmos Reboot",
        detail:
          "Hosts 'Cosmos: A Spacetime Odyssey,' reaching a global audience.",
      },
      {
        year: "2015",
        title: "StarTalk",
        detail: "Brings his science-and-pop-culture podcast to television.",
      },
    ],
    contributions: [
      {
        title: "Science Communication",
        detail:
          "Became one of the world's most effective popularizers of astrophysics and science literacy.",
      },
      {
        title: "Cosmos",
        detail:
          "Reintroduced the wonder of the universe to a new generation through a landmark TV series.",
      },
      {
        title: "Public Engagement",
        detail:
          "Used books, podcasts, and media to keep science central to public conversation.",
      },
      {
        title: "Inspiring Curiosity",
        detail:
          "Drew countless students toward science by making the cosmos feel personal and reachable.",
      },
    ],
    quotes: [
      "The good thing about science is that it's true whether or not you believe in it.",
      "We are all connected; to each other, biologically. To the earth, chemically. To the rest of the universe, atomically.",
      "The universe is under no obligation to make sense to you.",
    ],
    impact: [
      "Tyson has reached audiences that traditional science rarely touches, turning astrophysics into prime-time entertainment without dumbing it down. For millions, he is the reason the cosmos feels close.",
      "His real contribution is cultural: a relentless, charismatic insistence that science matters, that evidence beats belief, and that wonder is available to anyone willing to look up.",
    ],
    didYouKnow: [
      "He visited the Hayden Planetarium at age 9 — and grew up to run it.",
      "He helped lead the case that reclassified Pluto, drawing both fame and hate mail.",
      "An asteroid, 13123 Tyson, is named in his honor.",
    ],
    relatedCategorySlugs: ["astronomy", "physics", "climate-science"],
    sources: [
      {
        title: "Neil deGrasse Tyson — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Neil_deGrasse_Tyson",
      },
      { title: "StarTalk", url: "https://startalkmedia.com/" },
    ],
  },

  "jane-goodall": {
    slug: "jane-goodall",
    name: "Jane Goodall",
    field: "Primatology & Conservation",
    era: "Working Today",
    born: "Born 1934 · London, England",
    base: "Bournemouth, England & worldwide",
    tagline:
      "She sat patiently in a forest until chimpanzees redrew the line between us and them.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/98/Deputy_Secretary_Higginbottom_Poses_for_a_Photo_With_Dr._Jane_Goodall_and_the_State_Department%27s_Global_Health_Diplomacy_Director_Jordan_in_Washington_%2822365513310%29_%282%29_%28cropped_2%29.jpg",
    theme: {
      accent: "#15803D",
      accentSoft: "#ECFDF3",
      accentDeep: "#14532D",
      heroFrom: "#06140B",
      heroTo: "#0A2616",
      motif: "nature",
    },
    biography: [
      "Jane Goodall fell in love with animals as a child in England, sitting for hours in a henhouse just to watch how an egg was laid, and dreaming of Africa with no money and no obvious way to get there. She saved up working as a waitress, sailed to Kenya, and impressed the famous paleontologist Louis Leakey, who chose her — untrained but patient and observant — to study wild chimpanzees in what is now Tanzania.",
      "Without a degree, she did what credentialed scientists had not: she simply watched, quietly and endlessly, until the chimpanzees of Gombe accepted her presence. She saw them use and even make tools — stripping leaves from twigs to fish for termites — a discovery that shattered the belief that toolmaking set humans apart. She gave the animals names instead of numbers and described their personalities, emotions, and bonds, changing how science sees the line between humans and other animals.",
      "Decades later she transformed from researcher into one of the world's most tireless advocates for the natural world. The institute and youth movement she founded carry her mission across the globe: protecting wildlife, restoring habitats, and convincing people — especially the young — that every individual can make a difference, and that hope is a form of action.",
    ],
    buildingNow: [
      {
        title: "The Jane Goodall Institute",
        detail:
          "Sustaining the global conservation organization she founded to protect chimpanzees and their habitats.",
      },
      {
        title: "Roots & Shoots",
        detail:
          "Powering a youth program in dozens of countries that empowers young people to act for animals, people, and the environment.",
      },
      {
        title: "A Voice for Hope",
        detail:
          "Championing optimism and action on biodiversity loss and climate change as a global ambassador.",
      },
      {
        title: "Community Conservation",
        detail:
          "Backing programs that link wildlife protection with the wellbeing and livelihoods of local communities.",
      },
    ],
    timeline: [
      {
        year: "1960",
        title: "Arrives at Gombe",
        detail:
          "Begins her landmark study of wild chimpanzees in Tanzania.",
      },
      {
        year: "1960",
        title: "Tool Use Discovered",
        detail:
          "Observes chimpanzees making and using tools, stunning science.",
      },
      {
        year: "1965",
        title: "PhD at Cambridge",
        detail:
          "Earns a doctorate without a prior undergraduate degree.",
      },
      {
        year: "1977",
        title: "Jane Goodall Institute",
        detail: "Founds her global wildlife and conservation organization.",
      },
      {
        year: "1991",
        title: "Roots & Shoots",
        detail:
          "Launches her youth-led environmental and humanitarian movement.",
      },
      {
        year: "2002",
        title: "UN Messenger of Peace",
        detail: "Named a United Nations Messenger of Peace.",
      },
    ],
    contributions: [
      {
        title: "Chimpanzee Tool Use",
        detail:
          "Discovered that chimpanzees make and use tools, dissolving a supposed boundary between humans and animals.",
      },
      {
        title: "A New Way to Study Animals",
        detail:
          "Recognized individual personalities, emotions, and relationships, reshaping the science of animal behavior.",
      },
      {
        title: "Global Conservation",
        detail:
          "Built institutions protecting wildlife and habitats and linking conservation to human communities.",
      },
      {
        title: "Empowering Youth",
        detail:
          "Created a worldwide movement inspiring young people to take action for the planet.",
      },
    ],
    quotes: [
      "What you do makes a difference, and you have to decide what kind of difference you want to make.",
      "Only if we understand can we care. Only if we care will we help. Only if we help shall they be saved.",
      "Every individual matters. Every individual has a role to play.",
    ],
    impact: [
      "Goodall's patient observations rewrote primatology and forced science — and society — to reconsider where humanity ends and the rest of the animal world begins.",
      "Her enduring movement may matter even more: a global network of conservationists and young changemakers carrying forward the conviction that individual action, multiplied, can heal the natural world.",
    ],
    didYouKnow: [
      "She began her famous study with no university degree, chosen for her patience and observation.",
      "She gave the chimpanzees names like David Greybeard instead of numbers, a then-radical choice.",
      "Her Roots & Shoots program now spans dozens of countries.",
    ],
    relatedCategorySlugs: ["biology", "environmental-science", "climate-science"],
    sources: [
      {
        title: "Jane Goodall — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Jane_Goodall",
      },
      {
        title: "the Jane Goodall Institute",
        url: "https://janegoodall.org/",
      },
    ],
  },

  "peter-diamandis": {
    slug: "peter-diamandis",
    name: "Peter Diamandis",
    field: "Exponential Innovation",
    era: "Working Today",
    born: "Born 1961 · Bronx, New York",
    base: "Santa Monica, California",
    tagline:
      "Turning humanity's grand challenges into incentive prizes — and betting that the future is better, and faster, than we think.",
    imageUrl: diamandisPhoto,
    theme: {
      accent: "#F59E0B",
      accentSoft: "#FEF3C7",
      accentDeep: "#B45309",
      heroFrom: "#0A0E1A",
      heroTo: "#1A1206",
      motif: "space",
      heroImage: diamandisCover,
    },
    biography: [
      "Peter Diamandis was a space-obsessed kid in the Bronx who never grew out of it. The son of Greek immigrants, he trained as a physician at Harvard Medical School and earned degrees in molecular genetics and aerospace engineering at MIT — but his real fixation was getting humanity off the planet. When the established space industry told him it was impossible to do cheaply, he decided to change the incentives instead of waiting for permission.",
      "In 1994 he launched the XPRIZE: a $10 million purse for the first private team to fly a reusable crewed spacecraft to the edge of space twice in two weeks. For years he had no money to back the prize. He raised it anyway, and in 2004 SpaceShipOne claimed it — proving that a small, well-aimed incentive could mobilize tens of millions of dollars of private R&D and ignite an entire commercial spaceflight industry.",
      "Since then Diamandis has turned incentive competition and 'exponential thinking' into a career, founding or co-founding a constellation of organizations across space, longevity, education, and venture capital. Through his books with Steven Kotler — Abundance, BOLD, and The Future Is Faster Than You Think — he has become one of the most relentless public optimists in technology, arguing that exponential tools now let small teams take on problems once reserved for governments.",
    ],
    buildingNow: [
      {
        title: "XPRIZE Foundation",
        detail:
          "Chairs the foundation as it runs nine-figure global competitions — from carbon removal to healthspan — that pay out only when a team actually solves the problem.",
      },
      {
        title: "Abundance360 & Singularity",
        detail:
          "Runs the Abundance360 community and helped found Singularity University to teach founders and leaders how to wield exponentially-accelerating technologies.",
      },
      {
        title: "Healthspan & Longevity",
        detail:
          "Backs longevity ventures such as Fountain Life and Human Longevity, pushing early-detection diagnostics and the goal of adding healthy decades to human life.",
      },
      {
        title: "Moonshots",
        detail:
          "Co-hosts the Moonshots podcast with investor Dave Blundin, dissecting the frontier technologies — AI, robotics, biotech — reshaping the next decade.",
      },
    ],
    timeline: [
      {
        year: "1987",
        title: "International Space University",
        detail:
          "Co-founds ISU as a graduate student, before finishing medical school, to train the people who would build the space economy.",
      },
      {
        year: "1994",
        title: "Launches the XPRIZE",
        detail:
          "Announces a $10M prize for private suborbital spaceflight — with the prize money not yet raised.",
      },
      {
        year: "2004",
        title: "Ansari XPRIZE Won",
        detail:
          "SpaceShipOne reaches space twice in two weeks, launching the commercial spaceflight era.",
      },
      {
        year: "2008",
        title: "Singularity University",
        detail:
          "Co-founds Singularity University with Ray Kurzweil to spread exponential-technology thinking.",
      },
      {
        year: "2012",
        title: "Abundance",
        detail:
          "Publishes Abundance: The Future Is Better Than You Think, his data-driven case for techno-optimism.",
      },
      {
        year: "2020",
        title: "The Future Is Faster Than You Think",
        detail:
          "Maps how converging exponential technologies will reinvent whole industries this decade.",
      },
    ],
    contributions: [
      {
        title: "The Incentive Prize, Reinvented",
        detail:
          "Revived the centuries-old prize model for the modern era, showing that a well-designed purse can unlock R&D investment many times larger than the award itself.",
      },
      {
        title: "Catalyzing Commercial Spaceflight",
        detail:
          "The Ansari XPRIZE is widely credited with helping seed the private spaceflight industry that followed.",
      },
      {
        title: "The Abundance Mindset",
        detail:
          "Popularized a rigorous, evidence-based optimism — the argument that exponential technologies are steadily raising the global standard of living.",
      },
      {
        title: "Exponential Entrepreneurship",
        detail:
          "Through Singularity University, Abundance360, and BOLD Capital, built institutions that train founders to aim at billion-person problems.",
      },
    ],
    quotes: [
      "The best way to predict the future is to create it yourself.",
      "The world's biggest problems are the world's biggest business opportunities.",
      "The day before a major breakthrough, it's still a crazy idea.",
    ],
    impact: [
      "Showed that a single, well-aimed incentive can mobilize entire industries to solve problems markets had ignored.",
      "Helped move spaceflight, longevity, and carbon removal from government-only ambitions to open competitions anyone can enter.",
      "Reframed the future for a generation of founders — from scarcity and decline to abundance built by exponential tools.",
    ],
    didYouKnow: [
      "He pitched the XPRIZE for years before he had the prize money, ultimately insuring the payout so the competition could launch.",
      "He co-founded the Zero Gravity Corporation, which flies passengers on parabolic 'weightless' flights — and once flew Stephen Hawking in zero-g.",
      "He holds both an MD from Harvard and aerospace engineering training from MIT.",
    ],
    relatedCategorySlugs: ["astronomy", "physics"],
    sources: [
      { title: "diamandis.com", url: "https://www.diamandis.com" },
      { title: "XPRIZE Foundation", url: "https://www.xprize.org" },
      {
        title: "Peter Diamandis — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Peter_Diamandis",
      },
    ],
  },

  "salim-ismail": {
    slug: "salim-ismail",
    name: "Salim Ismail",
    field: "Exponential Organizations",
    era: "Working Today",
    born: "Born 1965 · India",
    base: "OpenExO · Global",
    tagline:
      "Decoding why technology accelerates exponentially while our institutions still crawl forward in a straight line.",
    imageUrl: salimPhoto,
    theme: {
      accent: "#06B6D4",
      accentSoft: "#CFFAFE",
      accentDeep: "#0E7490",
      heroFrom: "#04161A",
      heroTo: "#02292E",
      motif: "web",
      heroImage: salimCover,
    },
    biography: [
      "Salim Ismail is a technologist and author who has spent his career studying a single uncomfortable gap: digital technologies now improve exponentially, doubling in capability again and again, while most companies and governments still plan and grow in slow, linear increments. That mismatch, he argues, is why incumbents keep getting blindsided by small teams that seemed to come from nowhere.",
      "After building and selling startups — including PubSub Concepts, an early real-time search pioneer — Ismail ran Brickhouse, Yahoo's internal incubator, where he watched how hard it is for a large organization to behave like a nimble one. He went on to become the founding executive director of Singularity University, helping shape the curriculum that introduced thousands of leaders to exponential technologies.",
      "In 2014 he distilled his thesis into the bestseller Exponential Organizations, co-authored with Michael Malone and Yuri van Geest. The book identified the shared traits of companies growing 10x faster than their peers and gave them a name: ExOs. He now leads OpenExO, a global community that helps organizations redesign themselves around a Massive Transformative Purpose and the leverage of technology, community, and data.",
    ],
    buildingNow: [
      {
        title: "OpenExO",
        detail:
          "Leads a worldwide network of coaches and transformation specialists helping companies, nonprofits, and governments restructure for exponential growth.",
      },
      {
        title: "The ExO Operating Model",
        detail:
          "Continues to refine the ExO framework — Massive Transformative Purpose plus a set of external and internal attributes that let small teams scale like giants.",
      },
      {
        title: "Teaching Exponential Leadership",
        detail:
          "Keynotes and advises leaders worldwide on how to spot exponential disruption early and adapt before it arrives.",
      },
    ],
    timeline: [
      {
        year: "2000s",
        title: "PubSub Concepts",
        detail:
          "Co-founds an early real-time search and notification company, ahead of the live web.",
      },
      {
        year: "2008",
        title: "Brickhouse at Yahoo",
        detail:
          "Runs Yahoo's internal incubator, studying why big companies struggle to innovate.",
      },
      {
        year: "2009",
        title: "Singularity University",
        detail:
          "Becomes founding executive director, shaping its exponential-technology curriculum.",
      },
      {
        year: "2014",
        title: "Exponential Organizations",
        detail:
          "Publishes the bestseller naming and decoding the 10x-growth company.",
      },
      {
        year: "2017",
        title: "Founds OpenExO",
        detail:
          "Launches a global platform to put the ExO model into practice across industries.",
      },
    ],
    contributions: [
      {
        title: "The Exponential Organization (ExO)",
        detail:
          "Defined the organizational archetype whose impact is disproportionately large relative to its size, thanks to its use of technology and community.",
      },
      {
        title: "Massive Transformative Purpose",
        detail:
          "Coined the idea that the most scalable organizations are pulled forward by a single, aspirational purpose far bigger than themselves.",
      },
      {
        title: "A Playbook for Reinvention",
        detail:
          "Turned abstract talk of 'disruption' into a concrete set of attributes leaders can audit and adopt.",
      },
    ],
    quotes: [
      "Our technologies are exponential, but our organizations are still linear.",
      "If you're not disrupting yourself, someone else is — and they'll do it faster than you expect.",
      "The biggest companies of the future will be the ones that learn to scale as fast as the technology around them.",
    ],
    impact: [
      "Gave leaders a shared language for why nimble startups so often outrun far larger, better-funded incumbents.",
      "Pushed thousands of organizations to anchor themselves to a purpose and to leverage community, algorithms, and data instead of headcount.",
      "Helped mainstream 'exponential thinking' inside boardrooms, not just Silicon Valley.",
    ],
    didYouKnow: [
      "His book Exponential Organizations argues the best companies behave less like factories and more like platforms that others build on.",
      "He helped build Singularity University's flagship programs from the very beginning.",
      "He frames an organization's purpose — its 'MTP' — as the single most important design decision a founder makes.",
    ],
    relatedCategorySlugs: ["physics", "neuroscience"],
    sources: [
      { title: "OpenExO", url: "https://openexo.com" },
      {
        title: "Salim Ismail — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Salim_Ismail",
      },
    ],
  },

  "dave-blundin": {
    slug: "dave-blundin",
    name: "Dave Blundin",
    field: "AI & Venture",
    era: "Working Today",
    born: "Born in Massachusetts",
    base: "Cambridge, Massachusetts",
    tagline:
      "An MIT engineer who trained neural networks decades before the boom — and now funds the founders building the AI era.",
    imageUrl: blundinPhoto,
    theme: {
      accent: "#22C55E",
      accentSoft: "#DCFCE7",
      accentDeep: "#15803D",
      heroFrom: "#04140A",
      heroTo: "#07210F",
      motif: "neural",
      heroImage: blundinCover,
    },
    biography: [
      "Dave Blundin is a serial entrepreneur and venture investor whose fascination with artificial intelligence began long before it was fashionable. As an electrical engineering and computer science student at MIT in the late 1980s, he worked on neural networks at a time when most of the field had written them off — building pattern-recognition systems on hardware a tiny fraction as powerful as a modern phone.",
      "That early conviction became a career-long pattern: spot a technology while it is still dismissed, then build or back the company that rides it as it goes exponential. Over three decades Blundin has founded, co-founded, and incubated dozens of data-driven companies, many of them through Cogo Labs, the Cambridge startup foundry he created to turn raw engineering talent and large datasets into businesses.",
      "Through Link Ventures, the firm he founds and leads, Blundin has become an early backer of machine-learning and data companies, often investing at the moment a market is about to inflect. More recently he has become a prominent public voice on the AI transition, co-hosting the Moonshots podcast with Peter Diamandis and arguing that the steepest part of the curve is still ahead.",
    ],
    buildingNow: [
      {
        title: "Link Ventures",
        detail:
          "Leads the venture firm as it backs early-stage AI, data, and software founders, frequently before their markets are obvious.",
      },
      {
        title: "Cogo Labs",
        detail:
          "Runs the startup foundry he built to pair young engineers with large datasets and spin out new data-driven companies.",
      },
      {
        title: "Moonshots",
        detail:
          "Co-hosts the Moonshots podcast with Peter Diamandis, breaking down how AI, robotics, and biotech are compounding into the next decade.",
      },
    ],
    timeline: [
      {
        year: "1980s",
        title: "Neural Networks at MIT",
        detail:
          "Studies EECS at MIT and works on neural networks years before the deep-learning era.",
      },
      {
        year: "1990s",
        title: "First Companies",
        detail:
          "Begins a long run of founding and operating technology startups out of the Boston/Cambridge ecosystem.",
      },
      {
        year: "2005",
        title: "Cogo Labs",
        detail:
          "Builds a startup foundry to systematically launch data-driven companies.",
      },
      {
        year: "2010s",
        title: "Link Ventures",
        detail:
          "Founds and grows a venture firm focused on data and machine-learning startups.",
      },
      {
        year: "2024",
        title: "Moonshots",
        detail:
          "Teams up with Peter Diamandis to chart the frontier of exponential technology for a public audience.",
      },
    ],
    contributions: [
      {
        title: "Early Conviction in Neural Networks",
        detail:
          "Bet on learning machines decades before the modern AI boom validated the approach.",
      },
      {
        title: "A Company-Building Engine",
        detail:
          "Through Cogo Labs, turned the act of starting data-driven companies into a repeatable, talent-plus-data process.",
      },
      {
        title: "Capital for the AI Era",
        detail:
          "As an investor, has helped fund a generation of machine-learning and data founders at the earliest, riskiest stage.",
      },
    ],
    quotes: [
      "We're at the steepest part of the curve — and most people are still extrapolating in a straight line.",
      "The biggest returns come from believing in a technology while everyone else still thinks it's a toy.",
    ],
    impact: [
      "Helped prove out neural networks and data-driven entrepreneurship long before they became the center of the technology economy.",
      "Channeled capital and engineering talent into the founders building the current wave of AI.",
      "Brought a working investor's view of the AI transition to a broad public through Moonshots.",
    ],
    didYouKnow: [
      "He was working on neural networks at MIT when the field was deeply out of fashion.",
      "His foundry model treats company creation almost like an experiment: combine talented engineers with a large dataset and iterate.",
      "He co-hosts one of the most widely followed podcasts on exponential technology.",
    ],
    relatedCategorySlugs: ["neuroscience", "physics"],
    sources: [
      { title: "Link Ventures", url: "https://www.linkventures.com" },
      {
        title: "Dave Blundin — Link Ventures",
        url: "https://www.linkventures.com/team/dave-blundin",
      },
    ],
  },

  "alexander-wissner-gross": {
    slug: "alexander-wissner-gross",
    name: "Alexander Wissner-Gross",
    field: "AI & Complex Systems",
    era: "Working Today",
    born: "Born 1981 · United States",
    base: "Cambridge, Massachusetts",
    tagline:
      "Asking whether intelligence itself is a physical force — the drive to keep as many futures open as possible.",
    imageUrl: wissnerGrossPhoto,
    theme: {
      accent: "#A855F7",
      accentSoft: "#F3E8FF",
      accentDeep: "#7C3AED",
      heroFrom: "#0E0518",
      heroTo: "#1E0A2E",
      motif: "neural",
      heroImage: wissnerGrossCover,
    },
    biography: [
      "Alexander Wissner-Gross is a scientist, inventor, and investor who works at the seam between physics and artificial intelligence. He graduated first in his class at MIT with a triple major in physics, electrical engineering, and mathematics, then earned a PhD in physics from Harvard — and has spent his career chasing a single audacious question: can intelligence be described not as a mysterious property of brains, but as a physical force with an equation behind it?",
      "In 2013 he proposed an answer. With co-author Cameron Freer, he introduced the idea of 'causal entropic forces': a mathematical principle suggesting that intelligent behavior naturally emerges when a system acts to maximize its future freedom of action — keeping as many possible futures available as it can. To demonstrate it he built Entropica, a software engine that, given only that single rule, spontaneously taught itself to balance poles, use tools, and cooperate.",
      "Alongside that theoretical work, Wissner-Gross is a prolific inventor and a researcher on the limits and trajectory of computing — from the carbon footprint of web search to the data needed to reach AI milestones and the prospects for planetary-scale intelligence. He advises and invests in AI companies, holds numerous patents, and is a frequent voice on where machine intelligence is genuinely headed.",
    ],
    buildingNow: [
      {
        title: "A Physics of Intelligence",
        detail:
          "Continues to develop and test the idea that intelligent behavior can be derived from a single thermodynamic drive to maximize future options.",
      },
      {
        title: "Frontiers of Computation",
        detail:
          "Researches the physical limits of computing and AI — the energy, data, and hardware required to reach the next milestones.",
      },
      {
        title: "Advising & Investing in AI",
        detail:
          "Backs and advises artificial-intelligence ventures, bringing a first-principles, physics-grounded lens to where the field is going.",
      },
    ],
    timeline: [
      {
        year: "2003",
        title: "Top of His Class at MIT",
        detail:
          "Graduates first in his class with a triple major in physics, EE, and mathematics.",
      },
      {
        year: "2007",
        title: "Harvard PhD in Physics",
        detail:
          "Completes doctoral research bridging physics and computation.",
      },
      {
        year: "2013",
        title: "Causal Entropic Forces",
        detail:
          "Publishes the theory in Physical Review Letters and unveils the Entropica demonstration.",
      },
      {
        year: "2013",
        title: "'A New Equation for Intelligence'",
        detail:
          "His TED talk popularizes the idea that intelligence maximizes future freedom of action.",
      },
      {
        year: "Ongoing",
        title: "Inventor & Investor",
        detail:
          "Builds a portfolio of patents and advises a range of AI and deep-tech companies.",
      },
    ],
    contributions: [
      {
        title: "Causal Entropic Forces (F = T ∇Sτ)",
        detail:
          "Formalized the proposal that a single principle — maximize future entropy, and thus future options — can give rise to intelligent-looking behavior.",
      },
      {
        title: "Entropica",
        detail:
          "Built a software engine that, from that one rule alone, learned to balance objects, use tools, and cooperate — with no task-specific programming.",
      },
      {
        title: "Mapping AI's Physical Limits",
        detail:
          "Research on the energy, data, and computation behind machine intelligence, framing AI progress as a physical, measurable trajectory.",
      },
    ],
    quotes: [
      "Intelligence is a physical process that tries to maximize future freedom of action.",
      "Perhaps intelligence isn't something we have to design — perhaps it's something that emerges when a system keeps its options open.",
    ],
    impact: [
      "Offered a strikingly simple candidate principle for intelligence, connecting thermodynamics, physics, and AI in one equation.",
      "Inspired researchers to explore 'empowerment' and option-maximizing objectives as drivers of autonomous behavior.",
      "Reframed AI progress as a physical phenomenon with measurable limits, not just a software story.",
    ],
    didYouKnow: [
      "His Entropica engine learned to balance a pole and use tools from a single rule: keep future options open.",
      "He graduated first in his class at MIT while juggling three majors at once.",
      "His causal-entropic-force equation is often written compactly as F = T ∇Sτ.",
    ],
    relatedCategorySlugs: ["physics", "neuroscience"],
    sources: [
      { title: "alexwg.org", url: "https://www.alexwg.org" },
      {
        title: "Alexander Wissner-Gross — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Alexander_Wissner-Gross",
      },
    ],
  },

  "matthew-chase-levy": {
    slug: "matthew-chase-levy",
    name: "Matthew Chase Levy",
    field: "Fusion, Lasers & AI for Science",
    era: "Working Today",
    born: "Born 1985 · Dallas, Texas",
    base: "Oakland, California",
    tagline:
      "From the physics of the world's most powerful laser to teaching machines the language of science — and now a run at rebuilding California.",
    imageUrl: levyPhoto,
    theme: {
      accent: "#EA580C",
      accentSoft: "#FFF1E7",
      accentDeep: "#9A3412",
      heroFrom: "#150A05",
      heroTo: "#3B1B0C",
      motif: "neural",
    },
    biography: [
      "Matthew Chase Levy was born in Dallas in 1985 and found his footing when his family moved to California — passing nine AP exams and taking UC Berkeley classes while still in high school. Physics became his way of asking how the universe actually works: a bachelor's degree at UCLA, then a master's and PhD in physics and astronomy from Rice University, earned with distinction.",
      "His doctoral research took him to Lawrence Livermore National Laboratory just as the National Ignition Facility — the world's most energetic laser — was coming online. As an E.O. Lawrence Fellow he worked on inertial confinement fusion and laboratory astrophysics, supervised a new nuclear-radiography capability, and supported experiments that first demonstrated magnetic self-organization in laser plasmas. His theoretical work on how intense lasers deposit energy into matter was part of the decades-long research effort at the facility that achieved fusion ignition in December 2022.",
      "In 2015 the Royal Society named him the first American physicist ever awarded a Newton International Fellowship, bringing him to Oxford as a Junior Research Fellow of Wolfson College. There his work fused physics with machine learning into what is now called 'AI for science' — a field in which he holds some of the earliest patents. He turned the idea into Noble.AI, one of the first AI-for-science companies, backed by investors from Stanford's endowment to Microsoft and Chevron. In 2023 he founded Blue Capital to aim free markets at existential threats; in 2024 Wolfson College made him its youngest Honorary Fellow in history. Today he lives in Oakland with his wife, Stanford professor Debbie Senesky — and is running for Governor of California in 2026.",
    ],
    buildingNow: [
      {
        title: "A Run for California Governor",
        detail:
          "Campaigning in the 2026 California governor's race as a political outsider, with a platform centered on affordability, education, and long-term planning.",
      },
      {
        title: "Blue Capital & AeBlue",
        detail:
          "Directing capital toward fusion, clean energy, and AI companies — betting that free markets can be pointed at existential threats.",
      },
      {
        title: "AI for Science",
        detail:
          "Advancing the field he helped found: machine-learning systems that understand physical laws, so simulations and experiments learn from each other.",
      },
      {
        title: "Science Policy & Statecraft",
        detail:
          "Bridging labs and lawmakers — from co-organizing the Stanford–SLAC Extreme Energy Workshop to serving on the Board of Trustees of The Washington Institute.",
      },
    ],
    timeline: [
      {
        year: "1985",
        title: "Born in Dallas",
        detail:
          "Raised between New Jersey and California; receives a Presidential Education Award at age ten.",
      },
      {
        year: "2008",
        title: "Lawrence Livermore",
        detail:
          "Joins the physics division as the National Ignition Facility comes online, working on fusion and laboratory astrophysics as an E.O. Lawrence Fellow.",
      },
      {
        year: "2015",
        title: "First American Newton Fellow",
        detail:
          "The Royal Society awards him the Newton International Fellowship — a first for an American physicist — and Oxford's Wolfson College elects him a Junior Research Fellow.",
      },
      {
        year: "2016",
        title: "Founds Noble.AI",
        detail:
          "Launches one of the first AI-for-science companies, later backed by Stanford's endowment, Microsoft, Chevron, Solvay, and Exxon.",
      },
      {
        year: "2021",
        title: "AI-for-Science Patents Granted",
        detail:
          "US patents for machine-learning characterization of dynamical physical systems — among the earliest patents in the AI-for-science field.",
      },
      {
        year: "2022",
        title: "Fusion Ignition",
        detail:
          "NIF achieves the first ignited, burning laboratory plasma in history — a historic milestone for the facility where his research contributed to fusion science.",
      },
      {
        year: "2024",
        title: "Youngest Honorary Fellow",
        detail:
          "Wolfson College, Oxford appoints him its youngest Honorary Fellow ever; he co-organizes the Stanford–SLAC Extreme Energy Workshop.",
      },
      {
        year: "2026",
        title: "Runs for Governor",
        detail:
          "Enters the California governor's race as a physicist-entrepreneur political outsider.",
      },
    ],
    contributions: [
      {
        title: "Laser–Plasma Energy Absorption",
        detail:
          "Theoretical work on how ultra-intense lasers deposit energy into matter — physics supporting inertial confinement fusion research at the National Ignition Facility.",
      },
      {
        title: "AI for Science",
        detail:
          "Helped pioneer the field that teaches machine learning to respect physical law, with early patents on characterizing dynamical physical systems.",
      },
      {
        title: "Noble.AI",
        detail:
          "Built one of the first AI-for-science companies, raising $35M+ and putting scientific deep learning to work in chemistry, energy, and materials R&D.",
      },
      {
        title: "Frontier Experiments",
        detail:
          "Supervised a new nuclear-radiography capability and supported the first demonstrations of magnetic self-organization in laser-driven plasmas.",
      },
    ],
    quotes: [
      "I've spent my life building solutions. Now I'm ready to build a better California.",
    ],
    impact: [
      "The 'AI for science' approach Levy patented and commercialized early is now a global research movement — machine learning that accelerates fusion, materials, and drug discovery instead of just ranking ads.",
      "His career is a live demonstration that citizen curiosity scales: from a kid taking Berkeley classes in high school, to the laser that ignited a star on Earth, to the ballot for governor of the world's fourth-largest economy.",
    ],
    didYouKnow: [
      "At age ten he received a Presidential Education Award signed by President Bill Clinton.",
      "He is the first American physicist ever awarded the Royal Society's Newton International Fellowship.",
      "In 2024 he became the youngest Honorary Fellow in the history of Wolfson College, Oxford.",
      "He is married to Stanford engineering professor Debbie Senesky, whose lab builds electronics for Venus-grade extreme environments.",
    ],
    relatedCategorySlugs: ["physics", "astronomy", "materials-science"],
    sources: [
      {
        title: "matthewchaselevy.com",
        url: "https://matthewchaselevy.com/about",
      },
      {
        title: "Global Young Academy — Matthew Chase Levy",
        url: "https://globalyoungacademy.net/matthew-c-levy/",
      },
      {
        title: "Wolfson College, Oxford",
        url: "https://www.wolfson.ox.ac.uk/person/matthew-chase-levy",
      },
      {
        title: "Justia Patents — Matthew Chase Levy",
        url: "https://patents.justia.com/inventor/matthew-chase-levy",
      },
    ],
  },

  "amjad-masad": {
    slug: "amjad-masad",
    name: "Amjad Masad",
    field: "Software & AI",
    era: "Working Today",
    born: "From Amman, Jordan",
    base: "San Francisco Bay Area, California",
    tagline:
      "Making programming something anyone can do, from any device — and teaching AI to build the software alongside you.",
    imageUrl: amjadPhoto,
    theme: {
      accent: "#F26207",
      accentSoft: "#FFF1E8",
      accentDeep: "#C2410C",
      heroFrom: "#0A0E1A",
      heroTo: "#1A0E06",
      motif: "chip",
    },
    biography: [
      "Amjad Masad grew up in Amman, Jordan, where he fell in love with programming — and with the frustration of how hard it was just to get started. Setting up a development environment on a shared or underpowered computer could take days. That friction became a lifelong question: what if anyone, anywhere, could open a browser and simply start building?",
      "After studying computer science at Princess Sumaya University for Technology, he became one of the earliest engineers at Codecademy — the interactive platform that taught millions to code — and then worked at Facebook, building tools used by millions of developers. In 2016 he left to found Replit with Haya Odeh and Faris Masad: a complete programming environment that runs entirely in the browser, with nothing to install and nothing to configure.",
      "Replit grew from a classroom tool into one of the world's largest communities of developers, used by tens of millions of people across schools, startups, and enterprises. When AI coding models matured, Masad pushed the idea further: Ghostwriter brought AI pair programming to the mainstream in 2022, and Replit Agent, launched in 2024, let anyone describe an app in plain language and watch it get built.",
    ],
    buildingNow: [
      {
        title: "Replit Agent",
        detail:
          "Leading the development of AI agents that turn natural-language descriptions into working, deployed applications — no coding experience required.",
      },
      {
        title: "The Next Billion Creators",
        detail:
          "Pursuing Replit's founding mission: making software creation as universal as writing, for people on any device and in any country.",
      },
      {
        title: "Enterprise & Education",
        detail:
          "Scaling Replit from classrooms to companies — teams prototype, collaborate, and ship internal tools directly from the browser.",
      },
      {
        title: "The Vibe Coding Movement",
        detail:
          "Championing a cultural shift in who gets to build software, as AI collapses the distance between having an idea and shipping it.",
      },
    ],
    timeline: [
      {
        year: "2011",
        title: "Codecademy",
        detail:
          "Joins Codecademy as one of its earliest engineers after studying computer science at Princess Sumaya University for Technology in Amman.",
      },
      {
        year: "2013",
        title: "Facebook Engineering",
        detail:
          "Builds JavaScript infrastructure at Facebook, working on tools used by millions of developers.",
      },
      {
        year: "2016",
        title: "Founds Replit",
        detail:
          "Launches a full programming environment in the browser with co-founders Haya Odeh and Faris Masad.",
      },
      {
        year: "2022",
        title: "Ghostwriter AI",
        detail:
          "Ships an AI pair programmer that writes and explains code — one of the first mainstream AI coding assistants.",
      },
      {
        year: "2023",
        title: "Unicorn Milestone",
        detail:
          "Replit raises $97 million at a valuation over $1 billion as its community passes tens of millions of users.",
      },
      {
        year: "2024",
        title: "Replit Agent Launches",
        detail:
          "Anyone can describe an app in plain English and watch the agent build and deploy it — a milestone in AI-assisted software creation.",
      },
      {
        year: "2025",
        title: "Agent 3 & the Mainstream",
        detail:
          "Replit's most autonomous agent yet arrives as enterprises and first-time builders alike adopt natural-language software creation.",
      },
    ],
    contributions: [
      {
        title: "Programming in the Browser",
        detail:
          "Pioneered the zero-setup, browser-native development environment — code, collaborate, and deploy from any device with nothing to install.",
      },
      {
        title: "Democratizing Software Creation",
        detail:
          "Opened programming to students, hobbyists, and founders worldwide, regardless of hardware or geography.",
      },
      {
        title: "Mainstreaming AI Pair Programming",
        detail:
          "Ghostwriter brought AI-assisted coding to millions before AI coding tools were an industry standard.",
      },
      {
        title: "Natural-Language App Building",
        detail:
          "Replit Agent turned plain-language descriptions into deployed applications, opening software creation to non-programmers.",
      },
    ],
    quotes: [
      "Our mission is to bring the next billion software creators online.",
    ],
    impact: [
      "Removed the setup barrier that kept millions of people — especially in the developing world — from ever writing their first line of code.",
      "Helped shift programming from an installed, solitary activity to a browser-native, collaborative one — the Google Docs model, for code.",
      "Through Replit Agent, changed who gets to build software at all: entrepreneurs, teachers, and scientists now ship real apps without writing code.",
    ],
    didYouKnow: [
      "The company is named after the REPL — the read-eval-print loop, the simplest interactive way to run code.",
      "His co-founders are his wife, designer Haya Odeh, and his brother, engineer Faris Masad.",
      "The founding insight came from his own childhood in Jordan, where configuring a dev environment was often harder than learning to code itself.",
      "He has spoken about AI and the future of coding at TED AI San Francisco.",
    ],
    relatedCategorySlugs: ["physics", "materials-science", "neuroscience"],
    sources: [
      { title: "Replit", url: "https://replit.com" },
      {
        title: "Amjad Masad — Wikipedia",
        url: "https://en.wikipedia.org/wiki/Amjad_Masad",
      },
      {
        title: "TED AI San Francisco — Amjad Masad",
        url: "https://tedai-sanfrancisco.ted.com/speakers/",
      },
    ],
  },

  "laura-burkemper": {
    slug: "laura-burkemper",
    name: "Laura Burkemper",
    field: "Business & Brand Strategy",
    era: "Working Today",
    born: "From St. Louis, Missouri",
    base: "St. Louis, Missouri",
    tagline:
      "Turning bold ideas into market-dominating companies — and helping founders become investable, scalable, and valuable.",
    imageUrl: lauraPhoto,
    theme: {
      accent: "#E11D48",
      accentSoft: "#FFF1F2",
      accentDeep: "#9F1239",
      heroFrom: "#0A0E1A",
      heroTo: "#1A0710",
      motif: "web",
    },
    biography: [
      "Laura Burkemper built her expertise inside three of the world's most iconic brands — Coca-Cola, McDonald's, and Express Scripts — companies that successfully made the journey from startup to grownup. Across more than three decades in strategy, brand, business development, and innovation, she saw the same pattern everywhere: the companies that win are the ones whose story, strategy, and value creation line up.",
      "Today she is the Founder and CEO of SCALEBLAZER®, a business and brand strategy firm in St. Louis that guides CEOs, entrepreneurs, corporate innovators, and celebrity brands toward becoming 'Investable, Scalable, & Valuable.' With more than 80 venture investments behind her, she brings a rare dual lens — investor and strategist — to every engagement, aligning narrative with numbers to accelerate growth and increase valuation.",
      "Her conviction that business is fundamentally human runs through everything she does. After placing in the top 10 of a global negotiations contest she entered simply to improve, she earned a Certificate in Negotiation Mastery from Harvard Business School Online in 2023 — and a week later signed on as a contributing co-author of 'Empathy and Understanding in Business' alongside renowned negotiator Chris Voss and fellow experts, arguing that trust and empathy are the foundation of lasting commercial success.",
    ],
    buildingNow: [
      {
        title: "SCALEBLAZER®",
        detail:
          "Leading her strategic growth and brand firm, guiding companies from 'startup to grownup' — positioned for investment, scale, and sale.",
      },
      {
        title: "Investable Storytelling™",
        detail:
          "Applying her signature frameworks — Investable Storytelling™, Building Brand Capital™, and Negotiating Better Outcomes™ — to align story with strategy and raise valuations.",
      },
      {
        title: "Investing & Advising",
        detail:
          "Bringing an investor's eye from 80+ venture investments to a global client portfolio of founders, innovators, and celebrity brands.",
      },
      {
        title: "Teaching & Mentorship",
        detail:
          "Serving on the UMSL Alumni Governing Board since 2015 and the Harvard Business Review Advisory Council, after a decade as a senior adjunct professor in a top-ranked MBA entrepreneurship program.",
      },
    ],
    timeline: [
      {
        year: "Early career",
        title: "Inside Iconic Brands",
        detail:
          "Builds a 30+ year career in strategy, brand, and innovation with leadership roles at Coca-Cola, McDonald's, and Express Scripts.",
      },
      {
        year: "2015",
        title: "UMSL Alumni Governing Board",
        detail:
          "Begins serving on the alumni board of the University of Missouri–St. Louis, her undergraduate alma mater, as a donor and volunteer.",
      },
      {
        year: "2022",
        title: "Top 10 Globally",
        detail:
          "Places in the top 10 of 100 contestants in a global negotiations contest she entered for fun and self-improvement.",
      },
      {
        year: "2023",
        title: "Harvard Negotiation Mastery",
        detail:
          "Earns her Certificate in Negotiation Mastery from Harvard Business School Online — and signs a book deal a week later.",
      },
      {
        year: "2023",
        title: "Co-Author with Chris Voss",
        detail:
          "Publishes 'Empathy and Understanding in Business' alongside expert negotiator Chris Voss and 28 fellow co-authors.",
      },
      {
        year: "Today",
        title: "CEO of SCALEBLAZER®",
        detail:
          "Guides a global portfolio of CEOs, entrepreneurs, and celebrity brands, with insights featured on CNBC, FOX Business, ABC, CBS, NBC, and in INC Magazine and Essence.",
      },
    ],
    contributions: [
      {
        title: "Startup to Grownup™",
        detail:
          "Her signature approach to scaling: positioning companies for investment, scale, and sale by aligning strategy, story, and value creation.",
      },
      {
        title: "Building Brand Capital™",
        detail:
          "A framework treating brand as a balance-sheet asset — one that compounds trust, pricing power, and valuation over time.",
      },
      {
        title: "Investable Storytelling™",
        detail:
          "Teaching founders to tell the story investors actually fund — narrative discipline as a growth lever, not decoration.",
      },
      {
        title: "Empathy in Negotiation",
        detail:
          "Contributing to 'Empathy and Understanding in Business' alongside Chris Voss and fellow experts, making the case that lasting deals are built on trust and mutual understanding.",
      },
    ],
    quotes: [
      "Helping companies become Investable, Scalable, & Valuable.",
    ],
    impact: [
      "Brought big-brand rigor — learned inside Coca-Cola, McDonald's, and Express Scripts — to entrepreneurs and growth-stage companies that rarely get access to it.",
      "Reframed brand and story as financial assets through frameworks like Building Brand Capital™ and Investable Storytelling™.",
      "Championed empathy as a core business skill, from the Chris Voss collaboration to a decade teaching the next generation of entrepreneurial leaders.",
    ],
    didYouKnow: [
      "She entered a global negotiations contest purely for self-improvement — and placed in the top 10 of 100 contestants.",
      "She signed on to contribute to a book alongside Chris Voss just one week after earning her Harvard negotiation certification.",
      "She holds an MBA from Saint Louis University and a business degree from the University of Missouri–St. Louis, and spent over a decade as a senior adjunct professor in a top-12-ranked MBA entrepreneurship program.",
      "She serves on the Harvard Business Review Advisory Council.",
    ],
    relatedCategorySlugs: [],
    sources: [
      { title: "SCALEBLAZER®", url: "https://www.scaleblazer.com/" },
      {
        title: "UMSL Daily — Laura Burkemper",
        url: "https://blogs.umsl.edu/news/2024/05/30/laura-burkemper/",
      },
      {
        title: "Laura Burkemper — LinkedIn",
        url: "https://linkedin.com/in/lauraburkemper",
      },
      {
        title: "Empathy and Understanding in Business",
        url: "https://www.amazon.com/Empathy-Understanding-Business-Chris-Voss/dp/B0CNF6J4G8",
      },
    ],
  },
};

export function getLivingMindStory(
  slug: string | undefined,
): LivingMindStory | undefined {
  if (!slug) return undefined;
  return LIVING_MIND_STORIES[slug];
}
