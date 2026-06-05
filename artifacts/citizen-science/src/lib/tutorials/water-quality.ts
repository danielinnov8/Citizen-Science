import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "water-quality",
  title: "Introduction to Water Quality",
  subtitle: "What makes water healthy for life — and how to measure pH, clarity, oxygen, and contaminants.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Water quality studies the physical, chemical, and biological properties that determine whether water is safe for people and aquatic life.",
      body: [
        {
          kind: "text",
          text: "Water quality is the study of what is dissolved, suspended, and living in water, and how those properties affect its suitability for drinking, recreation, and ecosystems. Pure water is rare in nature — every stream, lake, and tap carries minerals, gases, organic matter, and microbes. The field measures these components and compares them against thresholds that define healthy or hazardous water.",
        },
        {
          kind: "text",
          text: "A few core measurements describe most of a water body's condition: how acidic it is (pH), how clear it is (turbidity), how much oxygen it holds (dissolved oxygen), and its temperature. These variables interact — warm water holds less oxygen, and cloudy water blocks the light aquatic plants need — so reading them together tells you far more than any single number alone.",
        },
        {
          kind: "list",
          items: [
            "Physical properties — temperature, turbidity (cloudiness), and color",
            "Chemical properties — pH, dissolved oxygen, nutrients, and contaminants",
            "Biological indicators — bacteria, algae, and the invertebrates that live in the water",
            "Aquatic health — how all of these combine to support or stress living organisms",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Clean water sustains human health, food production, and the aquatic ecosystems that depend on it.",
      body: [
        {
          kind: "text",
          text: "Water quality is a direct public-health issue. Contaminated drinking water spreads disease and exposes people to harmful chemicals and heavy metals, while polluted rivers and lakes lose the fish and insects that food webs depend on. Excess nutrients from fertilizer and sewage trigger algal blooms that strip oxygen from the water and suffocate aquatic life.",
        },
        {
          kind: "text",
          text: "It is also one of the most active areas of citizen science. Inexpensive test strips, thermometers, and clarity tubes let volunteers monitor streams that agencies cannot visit often enough. Networks of community samplers have detected pollution spikes, tracked recovery after cleanups, and built long records of how local waterways change with the seasons.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Volunteer stream monitors have repeatedly caught illegal discharges and sewage leaks by noticing sudden drops in clarity or oxygen, prompting investigations that official sampling schedules would have missed.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "pH, turbidity, dissolved oxygen, temperature, and contaminants are the pillars of water assessment.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "pH", definition: "A measure of acidity on a 0–14 scale; 7 is neutral. Most freshwater life thrives between pH 6.5 and 8.5." },
            { term: "Turbidity", definition: "How cloudy water is, caused by suspended particles like silt and algae. High turbidity blocks light and can clog fish gills." },
            { term: "Dissolved oxygen (DO)", definition: "The amount of oxygen gas dissolved in water, usually in mg/L; most fish need at least 5–6 mg/L to stay healthy." },
            { term: "Temperature", definition: "A master variable: warmer water holds less oxygen and speeds up metabolism, raising stress on cold-water species." },
            { term: "Contaminants", definition: "Harmful additions such as nitrates, phosphates, heavy metals, or bacteria that degrade water for life and human use." },
          ],
        },
        {
          kind: "text",
          text: "These factors are linked. Rising temperature lowers dissolved oxygen; nutrient contaminants feed algae that increase turbidity and, when they die and decay, consume oxygen; and shifts in pH change how toxic many contaminants become. Healthy water is really a balance among all of them.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Build a Secchi-style clarity tube to measure and compare the turbidity of different water samples.",
      body: [
        {
          kind: "text",
          text: "Turbidity is one of the easiest water properties to measure without instruments. Professionals lower a black-and-white Secchi disk until it disappears; you can make a tabletop version that gives a repeatable clarity reading and reveals how much suspended material different waters carry.",
        },
        {
          kind: "steps",
          items: [
            "Draw a small black-and-white cross or checkerboard on white paper and tape it flat to the bottom (outside) of a tall, clear glass or plastic jar.",
            "Mark a ruler scale in centimeters up the side of the jar, starting from the bottom.",
            "Collect water samples in clean containers — for example tap water, water from a pond or puddle, and tap water with a pinch of stirred-in soil.",
            "Slowly pour one sample in while looking straight down, and stop the moment the pattern at the bottom just disappears.",
            "Record the water depth in centimeters at that point — clearer water lets you fill higher before the pattern vanishes.",
            "Empty, rinse, and repeat for each sample, then compare the depths.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Keep everything identical — same jar, same lighting, same viewer — and change only one variable, such as the amount of soil stirred in or how long a muddy sample is left to settle. Then any difference in clarity depth can be attributed to that single factor.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Sampling water is low-risk with care, but natural and contaminated water can carry pathogens and hazards.",
      body: [
        {
          kind: "list",
          items: [
            "Never drink or taste sample water, even if it looks clean — clarity does not mean it is safe.",
            "Wear waterproof gloves when collecting from ponds, streams, or storm drains, and keep water away from your face and any cuts.",
            "Wash hands thoroughly after sampling and disinfect any containers and tools you reuse.",
            "Watch your footing on wet, slippery banks and never wade into fast, deep, or cold water.",
            "Store test strips and reagents as labeled, away from children and pets, and dispose of them per the instructions.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Contaminated water and pathogens",
          text: "Avoid sampling near sewage outfalls, industrial runoff, or stagnant water with foul odors or surface scum, which can carry harmful bacteria and chemicals. If you accidentally contact such water, wash immediately, and seek medical advice if you swallow it or develop symptoms.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "pH, clarity, temperature, and basic chemical levels are all measurable with low-cost kits and tools.",
      body: [
        {
          kind: "text",
          text: "Reliable water data depends on a consistent method, not costly gear. Sample at the same spot, depth, and time of day, use the same tools each visit, and your readings will be comparable enough to spot real change.",
        },
        {
          kind: "list",
          items: [
            "pH — read with inexpensive aquarium or pool test strips or a pocket pH meter",
            "Turbidity — clarity depth in centimeters from a homemade Secchi tube",
            "Temperature — degrees Celsius from a simple thermometer, taken at the same depth each time",
            "Chemistry — nitrate, phosphate, hardness, or chlorine from multi-parameter test strips",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the site, date, time, weather, and recent rainfall with every reading. Rain and runoff strongly affect water, so a season of consistent entries reveals patterns a single sample would hide.",
        },
      ],
    },
  ],
};

export default tutorial;
