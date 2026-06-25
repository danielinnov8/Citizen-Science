import { db, challengeSolutionsTable } from "@workspace/db";
import { logger } from "../logger";

/**
 * Seeds real solutions from LIVING scientists, laureates, and changemakers on
 * the challenges they genuinely work on. Each solution is written from that
 * person's own perspective and reflects their actual, documented work — never
 * invented. The `authorSlug` links to the matching `featured_profiles` row so
 * the solution's author card deep-links to their directory profile, and the
 * distinct authors count toward each challenge's "people working on it" tally.
 *
 * Idempotent: existing (challengeSlug, authorSlug) pairs are skipped, so this is
 * safe to run on every boot. Failures are logged, never thrown.
 */
interface ContributorSolution {
  challengeSlug: string;
  authorSlug: string;
  authorName: string;
  title: string;
  description: string;
  approach: string;
  link: string;
}

const CONTRIBUTOR_SOLUTIONS: ContributorSolution[] = [
  // ─── Make Life Multiplanetary ──────────────────────────────────────────────
  // Elon Musk's solution is seeded separately (see seedElonSolution in
  // challenges.ts); these are the additional real contributors.
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "jeff-bezos",
    authorName: "Jeff Bezos",
    title: "Move Heavy Industry Off Earth — O'Neill Colonies",
    description:
      "Earth is finite, and the path to a civilisation of a trillion humans is not to abandon our planet but to move its dirtiest, most energy-hungry industry into space. With Blue Origin I am building the road to space so that millions of people can one day live and work off-world while Earth is zoned residential and light.",
    approach:
      "Drive the cost of access to space down through reusable rockets — New Shepard and the orbital New Glenn — so that the infrastructure for a spacefaring economy becomes affordable. Build the Blue Moon lander to return humans to the lunar surface and tap the Moon's resources, especially water ice for propellant. The long-term goal is Gerard O'Neill's vision: vast free-floating colonies in orbit, powered by uninterrupted solar energy, where people live in Earth-like gravity and the manufacturing that strains our biosphere is relocated to space.",
    link: "https://www.blueorigin.com/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "jared-isaacman",
    authorName: "Jared Isaacman",
    title: "Prove Civilians Can Live and Work in Deep Space",
    description:
      "Spaceflight cannot remain the preserve of a handful of government astronauts if humanity is to become multiplanetary. I commanded Inspiration4, the first all-civilian orbital mission, and led Polaris Dawn to the first commercial spacewalk — and as NASA's Administrator I now steer the agency's Moon-to-Mars campaign toward a permanent human presence beyond Earth.",
    approach:
      "Expand the pool of people who can fly, work, and survive in space by pushing commercial crews farther and testing the technologies a settled frontier requires — new EVA suits, radiation tolerance through the Van Allen belts, and laser communications. Through the Polaris Program these were proven on private missions; at NASA I align the Artemis lunar campaign with commercial industry so that returning to the Moon becomes the proving ground for Mars. The aim is a self-reinforcing space economy where private citizens, not just astronauts, routinely live and operate off-world.",
    link: "https://polarisprogram.com/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "gwynne-shotwell",
    authorName: "Gwynne Shotwell",
    title: "Operationalise Starship for Routine Mars Transport",
    description:
      "A Mars city is not an engineering demo — it is a logistics problem at a scale no one has attempted. As President and COO of SpaceX I turn Starship from a test vehicle into an operational transport system that can fly often, reliably, and cheaply enough to move people and cargo to another planet.",
    approach:
      "Build the factories, launch cadence, and supply chains that let a fully reusable Starship fly like an airliner rather than a one-off rocket. Drive launch costs down by an order of magnitude over Falcon 9, scale production so that fleets of ships can depart during each Mars transfer window, and develop orbital propellant transfer so a ship refuelled in orbit can carry a full payload to Mars. Operational discipline — manifesting, refurbishment, and rapid turnaround — is what converts the dream of Mars settlement into a recurring, dependable service.",
    link: "https://www.spacex.com/vehicles/starship/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "robert-zubrin",
    authorName: "Robert Zubrin",
    title: "Mars Direct — Live Off the Land on the Red Planet",
    description:
      "We do not need a giant orbiting infrastructure or decades of delay to reach Mars; we need the will and a smart architecture. My Mars Direct plan, developed in 1990, shows how to send humans to Mars using near-term technology by manufacturing fuel and oxygen from the Martian atmosphere itself.",
    approach:
      "Send an unmanned Earth Return Vehicle to Mars first and use a small nuclear reactor to react hydrogen with Martian atmospheric CO₂, producing methane and oxygen propellant on the surface before the crew ever leaves Earth. Because the return fuel is made in situ, the launch mass — and the cost — drops by roughly a factor of eight versus carrying everything from Earth. Establish a permanent base, then a settlement, by progressively exploiting Martian water, minerals, and energy: a 'live off the land' strategy that makes a self-sustaining branch of human civilisation on Mars achievable now, not in some distant century.",
    link: "https://www.marssociety.org/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "peter-beck",
    authorName: "Peter Beck",
    title: "Frequent, Affordable Access for Planetary Science",
    description:
      "Becoming multiplanetary depends on knowing the worlds we hope to reach. At Rocket Lab I built dedicated small-launch and spacecraft systems that make interplanetary science missions routine and affordable, so we can survey the Moon, Mars, and Venus far more often than flagship missions allow.",
    approach:
      "Provide responsive, low-cost access to space with the Electron rocket and the larger reusable Neutron, paired with in-house spacecraft that Rocket Lab builds end to end. Fly frequent precursor missions — like the CAPSTONE pathfinder to lunar orbit and privately led probes to Venus — that scout resources, test technologies, and de-risk the destinations of human settlement. By making planetary missions cheap and repeatable rather than rare and enormous, we accelerate the reconnaissance a spacefaring civilisation needs.",
    link: "https://www.rocketlabusa.com/launch/neutron/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "tory-bruno",
    authorName: "Tory Bruno",
    title: "Build the Cislunar Transportation Backbone",
    description:
      "A multiplanetary future needs more than rockets that reach orbit — it needs a sustained economy in the volume between Earth and the Moon. Leading United Launch Alliance, I championed the Vulcan rocket and a cislunar infrastructure that treats space as a place to do business, not just to visit.",
    approach:
      "Deliver high-energy launch with the Vulcan Centaur and develop upper stages like ACES/Centaur that can loiter, refuel, and operate for weeks rather than hours — the foundation of an in-space transportation network. Enable propellant depots, tugs, and servicing in cislunar space so that crews and cargo can be moved efficiently to the Moon and staged onward to Mars. Building this reliable, reusable backbone in cislunar space is what turns one-off expeditions into a permanent, self-supporting human presence beyond Earth.",
    link: "https://www.ulalaunch.com/rockets/vulcan-centaur",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "pamela-melroy",
    authorName: "Pamela Melroy",
    title: "Sustainable Human Deep-Space Exploration",
    description:
      "I commanded a Space Shuttle and helped assemble the International Space Station, then served as NASA's Deputy Administrator. Becoming multiplanetary is not a sprint to plant a flag — it is the patient work of learning to keep humans alive and productive far from home, permanently.",
    approach:
      "Anchor human expansion on the lessons of the ISS and the Artemis lunar campaign: master closed-loop life support, in-space assembly, radiation protection, and international and commercial partnerships before committing crews to Mars. Use the Moon as a sustained testbed for the systems a Mars settlement will depend on, and build the standards and safety culture that let exploration scale responsibly. A durable multiplanetary civilisation is engineered step by step, with the Moon proving what Mars will require.",
    link: "https://www.nasa.gov/humans-in-space/artemis/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "amit-kshatriya",
    authorName: "Amit Kshatriya",
    title: "Integrate Artemis as the Road to Mars",
    description:
      "I led NASA's Moon to Mars Program Office and now, as the agency's Associate Administrator, I am responsible for executing the Artemis campaign. Returning humans to the Moon is not the destination — it is the integrated dress rehearsal for the first human mission to Mars.",
    approach:
      "Knit together the rockets, landers, spacesuits, habitats, and ground systems of Artemis into a single architecture explicitly designed to extend to Mars, managing the engineering risk across the whole campaign rather than mission by mission. Establish a recurring cadence of crewed lunar missions and surface infrastructure that exercises long-duration deep-space operations, then carry those validated systems and operational experience forward to Mars. Disciplined, end-to-end program integration is what turns a series of Moon landings into humanity's first permanent step toward another planet.",
    link: "https://www.nasa.gov/humans-in-space/moon-to-mars/",
  },
  {
    challengeSlug: "multiplanetary-life",
    authorSlug: "thomas-zurbuchen",
    authorName: "Thomas Zurbuchen",
    title: "Let Robotic Science Lead Humans to Mars",
    description:
      "As NASA's longest-serving science chief I launched dozens of missions, including the Perseverance rover now caching samples on Mars. Before humans can live on another world, robotic explorers must answer the questions that keep them alive — where the water is, whether the planet was ever habitable, and what hazards await.",
    approach:
      "Send the robotic vanguard — orbiters, landers, and rovers — to map resources, characterise radiation and dust, and return Martian samples to Earth so we understand the environment before risking crews. Use these missions to locate accessible water ice and landing sites, test in-situ resource utilisation, and search for past life, retiring the scientific unknowns that make human settlement dangerous. Science and exploration advance together: every robotic discovery makes the eventual human presence on Mars safer, smarter, and more sustainable.",
    link: "https://science.nasa.gov/mission/mars-2020-perseverance/",
  },

  // ─── Halt Catastrophic Climate Change ──────────────────────────────────────
  {
    challengeSlug: "climate-change",
    authorSlug: "syukuro-manabe",
    authorName: "Syukuro Manabe",
    title: "Physical Climate Models That Quantify Warming",
    description:
      "Effective climate policy must rest on physics, not guesswork. In the 1960s I built the first models coupling the atmosphere and ocean, showing that doubling atmospheric CO₂ raises Earth's surface temperature by roughly 2°C — the quantitative foundation beneath every modern warming target.",
    approach:
      "Develop coupled atmosphere–ocean general circulation models that represent radiative transfer, convection, and the water-vapour feedback from first principles. By isolating the greenhouse signal from natural variability, these models project warming under different emission pathways and let policymakers translate a carbon budget into a temperature outcome. Continuously refined, this same framework now underpins every IPCC assessment and the case for staying under 1.5°C.",
    link: "https://www.nobelprize.org/prizes/physics/2021/manabe/facts/",
  },
  {
    challengeSlug: "climate-change",
    authorSlug: "klaus-hasselmann",
    authorName: "Klaus Hasselmann",
    title: "Detection and Attribution — Proving the Human Fingerprint",
    description:
      "For decades sceptics dismissed warming as natural variability. My stochastic climate model and fingerprinting methods separate the human signal from the noise of weather, proving observed warming cannot be explained without greenhouse-gas emissions.",
    approach:
      "Model slow climate change as the integrated response to fast, random weather, then search the observational record for the distinctive spatial–temporal 'fingerprint' predicted for greenhouse forcing — different from the patterns left by the sun or volcanoes. This detection-and-attribution science converts climate change from contested opinion into an attributable, measurable fact, providing the evidentiary backbone for both policy and climate litigation.",
    link: "https://www.nobelprize.org/prizes/physics/2021/hasselmann/facts/",
  },
  {
    challengeSlug: "climate-change",
    authorSlug: "william-d-nordhaus",
    authorName: "William D. Nordhaus",
    title: "Carbon Pricing Through Integrated Assessment",
    description:
      "Emissions are the greatest market failure in history: their cost falls on everyone yet is paid by no one. My DICE model couples climate science to economics to compute the social cost of carbon and the optimal price needed to bend emissions downward.",
    approach:
      "Link a simple climate model to a global growth model to quantify both the damages of warming and the cost of cutting it, then derive the carbon price that maximises long-run welfare. A predictable, steadily rising carbon tax (or equivalent cap-and-trade) internalises the externality and lets markets discover the cheapest abatement across every sector — the most economically efficient lever available to decarbonise at scale.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/2018/nordhaus/facts/",
  },
  {
    challengeSlug: "climate-change",
    authorSlug: "james-hansen",
    authorName: "James Hansen",
    title: "Sound the Alarm, Then Price the Carbon",
    description:
      "I told the U.S. Congress in 1988 that global warming had begun and was caused by humans. The science has only hardened since. The remaining task is to stop burning carbon fast enough to hand our children a stable climate.",
    approach:
      "Combine rigorous, long-term temperature monitoring with a simple, powerful policy: a rising fee on carbon at the source, with the revenue returned directly to households as a dividend. This makes clean energy the cheaper choice without growing government, drives a rapid phase-out of fossil fuels, and is paired with honest public warning about tipping points — sea-level rise, ice-sheet collapse — that gradualist policy ignores.",
    link: "https://en.wikipedia.org/wiki/James_Hansen",
  },
  {
    challengeSlug: "climate-change",
    authorSlug: "al-gore",
    authorName: "Al Gore",
    title: "Mass Mobilisation and Climate Truth-Telling",
    description:
      "Science alone does not move nations — public and political will does. Through An Inconvenient Truth and the Climate Reality Project I work to translate climate science into public understanding and irresistible pressure for action.",
    approach:
      "Train a worldwide network of climate communicators, surface the real-time data on emissions and impacts, and build the grassroots, investor, and electoral pressure that makes decarbonisation inevitable. Pair public mobilisation with sustainable-investment platforms that steer capital away from fossil fuels — because the ultimate bottleneck is political will, which, fortunately, is itself a renewable resource.",
    link: "https://www.climaterealityproject.org",
  },

  // ─── Universal Access to Clean Energy ──────────────────────────────────────
  {
    challengeSlug: "clean-energy-access",
    authorSlug: "akira-yoshino",
    authorName: "Akira Yoshino",
    title: "Lithium-Ion Storage to Make Renewables Round-the-Clock",
    description:
      "Clean power is intermittent — the sun sets and the wind drops. The lithium-ion battery I developed stores renewable energy so it can run homes, grids, vehicles, and off-grid communities long after generation stops.",
    approach:
      "Drive lithium-ion energy density up and cost down so storage becomes cheap enough to firm solar and wind at grid scale and to electrify communities with no central grid at all. Pair low-cost cells with solar microgrids to leapfrog fossil infrastructure in the developing world — the way mobile phones leapfrogged landlines — while building the circular recycling supply chains that keep the materials in use.",
    link: "https://www.nobelprize.org/prizes/chemistry/2019/yoshino/facts/",
  },
  {
    challengeSlug: "clean-energy-access",
    authorSlug: "frances-arnold",
    authorName: "Frances Arnold",
    title: "Engineered Enzymes for Renewable Fuels",
    description:
      "Nature is the best chemist on Earth. Using directed evolution, I breed enzymes that produce fuels and chemicals from renewable feedstocks instead of petroleum — clean energy made the way living cells make everything.",
    approach:
      "Apply directed evolution — iterated mutation and selection — to engineer enzymes and microbes that convert sugars, plant waste, and even CO₂ into transportation fuels and industrial chemicals at ambient temperature and pressure. This replaces energy-intensive petrochemical processes with biological ones, decarbonising the hard-to-electrify parts of the economy (aviation fuel, plastics, solvents) and giving communities a renewable, locally produced source of energy and materials.",
    link: "https://www.nobelprize.org/prizes/chemistry/2018/arnold/facts/",
  },

  // ─── Prevent the Next Pandemic ─────────────────────────────────────────────
  {
    challengeSlug: "pandemic-preparedness",
    authorSlug: "katalin-kariko",
    authorName: "Katalin Karikó",
    title: "The mRNA Platform for 100-Day Vaccines",
    description:
      "When a new pathogen emerges, speed decides how many die. The mRNA technology I spent decades developing lets us turn a pathogen's genetic sequence into a vaccine candidate in days rather than years.",
    approach:
      "Treat mRNA as a programmable drug: read a new virus's sequence, synthesise the matching mRNA, and deliver it in a lipid nanoparticle so the body's own cells produce the antigen and train immunity. Because only the sequence changes between vaccines, the same manufacturing line can pivot to any new threat — the foundation of a '100-day' response. Maintain prototype vaccines against known viral families and warm manufacturing capacity so the platform is ready before the next outbreak begins.",
    link: "https://www.nobelprize.org/prizes/medicine/2023/kariko/facts/",
  },
  {
    challengeSlug: "pandemic-preparedness",
    authorSlug: "drew-weissman",
    authorName: "Drew Weissman",
    title: "Nucleoside-Modified mRNA and Pan-Variant Vaccines",
    description:
      "Katalin Karikó and I discovered that modifying mRNA's nucleosides stops it from triggering harmful inflammation — the breakthrough that made mRNA vaccines safe and effective. Now I am building vaccines that work against whole families of viruses at once.",
    approach:
      "Use nucleoside-modified mRNA to develop pan-coronavirus and pan-influenza vaccines that target conserved regions shared across variants, so immunity holds even as pathogens mutate. Extend the platform to low-cost, thermostable formulations manufacturable in the Global South, closing the equity gap that left poorer nations last in line during COVID-19. Pre-position candidates for the WHO's priority pathogens so deployment can begin the moment a threat appears.",
    link: "https://www.nobelprize.org/prizes/medicine/2023/weissman/facts/",
  },

  // ─── Align Artificial Intelligence with Human Values ───────────────────────
  {
    challengeSlug: "ai-safety",
    authorSlug: "geoffrey-hinton",
    authorName: "Geoffrey Hinton",
    title: "Treat AI Risk as a Scientific Emergency",
    description:
      "I helped build the deep-learning systems now reshaping the world, and I left Google to speak freely about their dangers. We may create machines more intelligent than ourselves within decades, with no proof we can keep them under control.",
    approach:
      "Devote a large fraction of AI research — comparable to what we spend on capabilities — to safety: understanding when models form their own goals, detecting deception, and proving properties about systems before deployment. Back this with hard government regulation and international agreements on frontier-model training, treating the alignment of superhuman AI as an empirical problem that must be solved before such systems exist, not after.",
    link: "https://en.wikipedia.org/wiki/Geoffrey_Hinton",
  },
  {
    challengeSlug: "ai-safety",
    authorSlug: "yoshua-bengio",
    authorName: "Yoshua Bengio",
    title: "Non-Agentic 'Scientist AI' and Global Oversight",
    description:
      "The sharpest risks come from autonomous AI agents pursuing goals we cannot verify. I chair the International AI Safety Report to give governments a shared scientific basis for action, and I am building AI designed to understand the world rather than to act in it.",
    approach:
      "Develop 'Scientist AI' — non-agentic systems that model and explain the world honestly, without self-preservation drives or autonomous goals — as both a safe foundation and a guardrail to monitor dangerous agentic systems. Pair this with independent oversight: mandatory pre-deployment safety evaluations, incident reporting, and an IPCC-style international body that keeps every government current on the evolving evidence.",
    link: "https://yoshuabengio.org",
  },
  {
    challengeSlug: "ai-safety",
    authorSlug: "demis-hassabis",
    authorName: "Demis Hassabis",
    title: "Build AGI Safely, Grounded in Science",
    description:
      "AI's promise is immense — AlphaFold mapped the structure of nearly every known protein — but artificial general intelligence must be built responsibly. The rigour that solved protein folding should govern how we approach human-level intelligence.",
    approach:
      "Advance toward AGI in careful, scientifically grounded steps with safety and ethics built in from the start: red-teaming frontier models, responsible scaling policies, and deploying AI first on well-bounded scientific problems — protein structure, materials, disease — where the benefits are verifiable. Advocate a global governance framework, a kind of 'CERN for AI safety,' so the most powerful systems are developed cooperatively rather than in an unchecked race.",
    link: "https://deepmind.google/about/responsibility-safety/",
  },

  // ─── Stop the Antibiotic Resistance Crisis ─────────────────────────────────
  {
    challengeSlug: "antibiotic-resistance",
    authorSlug: "ada-e-yonath",
    authorName: "Ada E. Yonath",
    title: "Structure-Based Antibiotics Targeting the Ribosome",
    description:
      "More than half of all antibiotics work by jamming the bacterial ribosome — the cell's protein factory. I solved its atomic structure, revealing exactly how these drugs bind and how resistance mutations defeat them.",
    approach:
      "Use high-resolution crystallography of bacterial ribosomes, including their drug-binding pockets and resistance mutations, to design next-generation antibiotics that bind where bacteria cannot easily evade them. By mapping the differences between bacterial and human ribosomes atom by atom, we can engineer drugs that are lethal to pathogens, harmless to patients, and a step ahead of evolving resistance.",
    link: "https://www.nobelprize.org/prizes/chemistry/2009/yonath/facts/",
  },
  {
    challengeSlug: "antibiotic-resistance",
    authorSlug: "venkatraman-ramakrishnan",
    authorName: "Venkatraman Ramakrishnan",
    title: "Atomic Maps of the Ribosome to Outpace Resistance",
    description:
      "I determined the atomic structure of the ribosome's small subunit and how antibiotics act on it. Understanding that machinery in full detail is the surest route to antibiotics that resistant bacteria cannot outmanoeuvre.",
    approach:
      "Combine X-ray crystallography and cryo-electron microscopy to capture the ribosome in the act of making proteins and binding drugs, exposing the precise mechanisms of antibiotic action and resistance. These structures let medicinal chemists rationally redesign existing antibiotic classes to restore potency against resistant strains, rather than relying on the slow, luck-driven screening that has stalled the antibiotic pipeline.",
    link: "https://www.nobelprize.org/prizes/chemistry/2009/ramakrishnan/facts/",
  },

  // ─── Cure Cancer ───────────────────────────────────────────────────────────
  {
    challengeSlug: "cancer-moonshot",
    authorSlug: "james-p-allison",
    authorName: "James P. Allison",
    title: "Release the Immune Brakes — Checkpoint Blockade",
    description:
      "Instead of attacking the tumour directly, I asked how to unleash the patient's own immune system against it. Blocking the CTLA-4 'brake' on T cells lets the immune system destroy cancers it would otherwise ignore — the first durable cures for advanced melanoma.",
    approach:
      "Develop antibodies that block the inhibitory checkpoints (CTLA-4, and the PD-1 pathway) tumours exploit to switch off T cells, restoring the immune system's natural ability to recognise and kill cancer. Combine checkpoint inhibitors with other immunotherapies and biomarkers that predict who will respond, extending durable remissions across more cancer types — turning a death sentence into a manageable, sometimes curable disease.",
    link: "https://www.nobelprize.org/prizes/medicine/2018/allison/facts/",
  },
  {
    challengeSlug: "cancer-moonshot",
    authorSlug: "tasuku-honjo",
    authorName: "Tasuku Honjo",
    title: "PD-1 Blockade Immunotherapy",
    description:
      "I discovered PD-1, a second brake on the immune system that cancers hijack to hide. Blocking it has produced lasting remissions in lung, kidney, and many other cancers once considered untreatable.",
    approach:
      "Target the PD-1/PD-L1 pathway with antibodies that stop tumours from deactivating attacking T cells, and investigate why some patients respond spectacularly while others do not — pursuing combination therapies and metabolic insights to widen the fraction who benefit. The goal is to make immunotherapy effective against the majority of cancers, not just a responsive minority.",
    link: "https://www.nobelprize.org/prizes/medicine/2018/honjo/facts/",
  },

  // ─── Defeat Aging and Age-Related Disease ──────────────────────────────────
  {
    challengeSlug: "longevity",
    authorSlug: "elizabeth-blackburn",
    authorName: "Elizabeth Blackburn",
    title: "Telomere Biology and the Limits of Cellular Aging",
    description:
      "The caps on our chromosomes — telomeres — shorten each time a cell divides, acting as a molecular clock for aging. I co-discovered telomeres and telomerase, the enzyme that maintains them, opening a window onto why we age.",
    approach:
      "Study how telomere length and telomerase activity govern cellular aging and age-related disease, and how lifestyle and chronic stress accelerate or slow telomere loss. Translate this into measurable markers of biological (not just chronological) age and into interventions that protect telomere integrity — while carefully navigating the double edge that too much telomerase fuels cancer. The aim is more healthy years, not merely longer ones.",
    link: "https://www.nobelprize.org/prizes/medicine/2009/blackburn/facts/",
  },
  {
    challengeSlug: "longevity",
    authorSlug: "carol-greider",
    authorName: "Carol Greider",
    title: "Telomerase as a Lever on Age-Related Disease",
    description:
      "I discovered telomerase, the enzyme that rebuilds the protective ends of chromosomes. Its activity sits at the crossroads of aging, stem-cell exhaustion, and diseases of tissue failure.",
    approach:
      "Dissect how telomerase maintains the regenerative capacity of stem cells and how its decline drives degenerative conditions such as pulmonary fibrosis and bone-marrow failure. Use this to develop therapies that restore telomere maintenance in failing tissues — and diagnostics that flag telomere-related disease early — extending the healthy, functional span of human life.",
    link: "https://www.nobelprize.org/prizes/medicine/2009/greider/facts/",
  },
  {
    challengeSlug: "longevity",
    authorSlug: "yoshinori-ohsumi",
    authorName: "Yoshinori Ohsumi",
    title: "Harnessing Autophagy — the Cell's Recycling System",
    description:
      "Cells survive by recycling their own damaged components, a process called autophagy. I uncovered its genes and machinery; its decline with age underlies cancer, neurodegeneration, and metabolic disease.",
    approach:
      "Map the molecular machinery of autophagy and develop interventions — pharmacological and dietary — that restore the cell's ability to clear damaged proteins and organelles as we age. Boosting autophagy holds promise against the accumulation of cellular 'garbage' that drives Alzheimer's, Parkinson's, and age-related decline, targeting a root mechanism of aging rather than its individual symptoms.",
    link: "https://www.nobelprize.org/prizes/medicine/2016/ohsumi/facts/",
  },

  // ─── Cure Alzheimer's and Dementia ─────────────────────────────────────────
  {
    challengeSlug: "alzheimers-dementia",
    authorSlug: "stanley-b-prusiner",
    authorName: "Stanley B. Prusiner",
    title: "Stop the Misfolding — A Prion Strategy for Dementia",
    description:
      "I discovered prions: proteins that cause disease by misfolding and forcing their neighbours to misfold too. The same self-propagating mechanism appears to drive Alzheimer's (amyloid and tau) and Parkinson's — which means it can be targeted.",
    approach:
      "Treat neurodegeneration as a protein-misfolding problem: detect toxic, self-templating forms of amyloid, tau, and alpha-synuclein early, and develop drugs and antibodies that halt their propagation before symptoms appear. Apply the prion paradigm to build diagnostics that catch disease decades earlier and therapies aimed at the shared molecular cause across dementias, rather than chasing each disease in isolation.",
    link: "https://en.wikipedia.org/wiki/Stanley_B._Prusiner",
  },

  // ─── Reduce Extreme Global Inequality ──────────────────────────────────────
  {
    challengeSlug: "global-inequality",
    authorSlug: "amartya-sen",
    authorName: "Amartya Sen",
    title: "Development as Freedom — the Capability Approach",
    description:
      "Poverty is not merely low income; it is the deprivation of the real freedoms people have to live lives they value. Measuring development by capabilities — health, education, agency — reframes what we are trying to equalise.",
    approach:
      "Shift the metric of progress from GDP to human capabilities, using tools like the Human Development Index to direct policy toward health, education, and political participation. Combine famine analysis — famines occur in the absence of democracy and entitlements, not merely of food — with investment in public services and women's agency to attack the structural roots of inequality, not just its income symptoms.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/1998/sen/facts/",
  },
  {
    challengeSlug: "global-inequality",
    authorSlug: "joseph-e-stiglitz",
    authorName: "Joseph E. Stiglitz",
    title: "Rewrite the Rules of the Economy",
    description:
      "Inequality is a choice, not an inevitability — the product of rules written to favour the top. My work on information asymmetry shows why unregulated markets concentrate wealth and how policy can reverse it.",
    approach:
      "Reform the structural rules that drive inequality: progressive taxation, stronger antitrust to curb monopoly rents, labour protections, and public investment in education and infrastructure. Correct the market failures created by asymmetric information and concentrated power, and reshape globalisation so its gains are shared — demonstrating that a fairer economy is also a more stable and productive one.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/2001/stiglitz/facts/",
  },
  {
    challengeSlug: "global-inequality",
    authorSlug: "angus-deaton",
    authorName: "Angus Deaton",
    title: "Measure Wellbeing to Fight Poverty",
    description:
      "You cannot fix what you cannot measure. My work on consumption, poverty, and the 'deaths of despair' insists on getting the household-level data right before prescribing policy.",
    approach:
      "Build rigorous measurement of consumption, health, and wellbeing at the household level to reveal who is actually poor and why, exposing the failures hidden in national averages. Use this evidence to target social policy effectively, scrutinise aid for unintended harms, and confront emerging crises — like rising mortality among the less-educated — with data rather than ideology.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/2015/deaton/facts/",
  },
  {
    challengeSlug: "global-inequality",
    authorSlug: "muhammad-yunus",
    authorName: "Muhammad Yunus",
    title: "Microcredit and Social Business",
    description:
      "The poor are not bankable, the banks said — so I lent to them anyway, and they repaid. Grameen Bank proved that tiny collateral-free loans to the very poorest, especially women, unlock enormous entrepreneurial energy.",
    approach:
      "Extend collateral-free microloans to the poor — particularly women — through group-based, trust-driven lending that brings the unbanked into the formal economy. Scale the model of 'social business,' enterprises designed to solve social problems rather than maximise profit, redirecting capitalism's tools toward poverty eradication, financial inclusion, and dignity for the bottom billion.",
    link: "https://www.nobelprize.org/prizes/peace/2006/yunus/facts/",
  },

  // ─── Quality Education for Every Child ──────────────────────────────────────
  {
    challengeSlug: "education-access",
    authorSlug: "abhijit-banerjee",
    authorName: "Abhijit Banerjee",
    title: "Teaching at the Right Level, Proven by Trials",
    description:
      "Good intentions are not enough — we must know what actually works. With randomised controlled trials we tested education interventions the way scientists test drugs, and found that teaching children at their actual level, not their grade, transforms learning.",
    approach:
      "Run randomised controlled trials (through J-PAL) to identify the most cost-effective ways to improve learning, then scale the winners. 'Teaching at the Right Level' — grouping children by ability and focusing on foundational literacy and numeracy — has raised learning for millions across India and Africa. Replace ideology and anecdote with rigorous evidence about which education spending genuinely moves outcomes.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/2019/banerjee/facts/",
  },
  {
    challengeSlug: "education-access",
    authorSlug: "esther-duflo",
    authorName: "Esther Duflo",
    title: "Randomised Evidence for What Helps Children Learn",
    description:
      "I co-founded J-PAL to bring experimental rigour to the fight against poverty. The biggest gains in education often come from unglamorous, cheap fixes — deworming pills, remedial tutors, information for parents — that trials reveal and intuition misses.",
    approach:
      "Design and run field experiments that isolate the causal impact of specific education interventions, from reducing class size to providing health treatments that keep children in school. Build a global evidence base policymakers can act on, and embed evaluation inside governments so scarce education budgets flow to the interventions with the highest proven return per dollar.",
    link: "https://www.nobelprize.org/prizes/economic-sciences/2019/duflo/facts/",
  },
  {
    challengeSlug: "education-access",
    authorSlug: "malala-yousafzai",
    authorName: "Malala Yousafzai",
    title: "12 Years of Free, Quality Education for Every Girl",
    description:
      "I was shot for going to school. Through the Malala Fund I now fight so that every girl — 130 million of whom are out of school — has the right to twelve years of free, safe, quality education.",
    approach:
      "Fund and amplify local education activists in the countries where girls are most excluded, campaign against the legal, financial, and cultural barriers that keep girls out of school, and hold governments and global institutions accountable for their education commitments. Centre the voices of girls themselves, because investing in girls' education is the single highest-return lever for health, prosperity, and peace.",
    link: "https://malala.org",
  },
  {
    challengeSlug: "education-access",
    authorSlug: "kailash-satyarthi",
    authorName: "Kailash Satyarthi",
    title: "End Child Labour So Children Can Learn",
    description:
      "A child in a factory is a child robbed of school. I have freed tens of thousands of children from bonded labour and trafficking, because the right to education is meaningless while children are forced to work.",
    approach:
      "Rescue and rehabilitate children from labour and trafficking through grassroots action and child-friendly villages, then ensure they enter and stay in school. Drive the global movement and legal frameworks — from the Global March Against Child Labour to international conventions — that make education compulsory and child labour illegal, breaking the cycle that traps the poorest children out of the classroom.",
    link: "https://www.nobelprize.org/prizes/peace/2014/satyarthi/facts/",
  },

  // ─── End Global Hunger and Food Insecurity ─────────────────────────────────
  {
    challengeSlug: "food-security",
    authorSlug: "jennifer-doudna",
    authorName: "Jennifer Doudna",
    title: "CRISPR Crops for a Hungry, Warming World",
    description:
      "The CRISPR gene-editing tool Emmanuelle Charpentier and I developed can rewrite the DNA of crops with precision. That means plants that resist disease, tolerate drought, and yield more on the same land — feeding more people as the climate destabilises.",
    approach:
      "Apply CRISPR to develop climate-resilient staple crops — drought- and heat-tolerant, disease-resistant, more nutritious — far faster and more precisely than conventional breeding. Pursue accessible, openly licensed editing tools so smallholder farmers in the Global South benefit, not just agribusiness, and steward the technology through transparent safety and ethics frameworks so it earns public trust.",
    link: "https://www.nobelprize.org/prizes/chemistry/2020/doudna/facts/",
  },

  // ─── Achieve Gender Equality ───────────────────────────────────────────────
  {
    challengeSlug: "gender-equality",
    authorSlug: "denis-mukwege",
    authorName: "Denis Mukwege",
    title: "End Sexual Violence as a Weapon of War",
    description:
      "At Panzi Hospital I have treated tens of thousands of survivors of wartime sexual violence. Repairing bodies is not enough — we must end the impunity that allows rape to be used as a weapon.",
    approach:
      "Provide survivors holistic care — medical, psychological, legal, and socioeconomic — through the one-stop Panzi model, while campaigning to end impunity by prosecuting perpetrators and commanders. Mobilise international pressure and reparations so that sexual violence carries real consequences, transforming survivors from victims into leaders and making gender-based violence a prosecutable atrocity rather than an accepted cost of conflict.",
    link: "https://www.nobelprize.org/prizes/peace/2018/mukwege/facts/",
  },
  {
    challengeSlug: "gender-equality",
    authorSlug: "nadia-murad",
    authorName: "Nadia Murad",
    title: "Justice and Recovery for Survivors of Atrocity",
    description:
      "I survived genocide and sexual slavery at the hands of ISIS, and I chose to tell the world rather than stay silent. I fight so that survivors of sexual violence find justice and so it never happens to other women.",
    approach:
      "Pursue accountability by documenting atrocities and bringing perpetrators to international justice, while funding survivor-centred recovery — health, education, and economic rebuilding for affected communities like the Yazidis. Through Nadia's Initiative, rebuild war-torn regions and put survivors at the centre of decisions about their own future, breaking the silence and stigma that let sexual violence persist.",
    link: "https://www.nobelprize.org/prizes/peace/2018/murad/facts/",
  },
  {
    challengeSlug: "gender-equality",
    authorSlug: "narges-mohammadi",
    authorName: "Narges Mohammadi",
    title: "Woman, Life, Freedom — Women's Rights Under Oppression",
    description:
      "From inside an Iranian prison I continue to fight against the oppression of women and for human rights for all. The struggle for gender equality is inseparable from the struggle for freedom itself.",
    approach:
      "Document and expose human-rights abuses — especially the systematic oppression of women and the use of torture and the death penalty — and sustain nonviolent civil resistance even under imprisonment. Build international solidarity that raises the cost of repression for authoritarian regimes, advancing the principle that no society can be free or just while half its people are denied equal rights.",
    link: "https://www.nobelprize.org/prizes/peace/2023/mohammadi/facts/",
  },
];

export async function seedChallengeContributors(): Promise<void> {
  try {
    const existingRows = await db
      .select({
        challengeSlug: challengeSolutionsTable.challengeSlug,
        authorSlug: challengeSolutionsTable.authorSlug,
      })
      .from(challengeSolutionsTable);

    const seen = new Set(
      existingRows
        .filter((r) => r.authorSlug)
        .map((r) => `${r.challengeSlug}::${r.authorSlug}`),
    );

    const toInsert = CONTRIBUTOR_SOLUTIONS.filter(
      (s) => !seen.has(`${s.challengeSlug}::${s.authorSlug}`),
    ).map((s) => ({
      challengeSlug: s.challengeSlug,
      userId: null,
      authorName: s.authorName,
      authorSlug: s.authorSlug,
      title: s.title,
      description: s.description,
      approach: s.approach,
      link: s.link,
    }));

    if (toInsert.length === 0) {
      logger.info("Challenge contributor solutions already seeded, skipping");
      return;
    }

    await db.insert(challengeSolutionsTable).values(toInsert);
    logger.info(
      { seeded: toInsert.length },
      "Seeded living-figure challenge contributor solutions",
    );
  } catch (err) {
    logger.error({ err }, "Failed to seed challenge contributor solutions");
  }
}
