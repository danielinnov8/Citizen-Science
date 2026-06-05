import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "environmental-science",
  title: "Introduction to Environmental Science",
  subtitle: "How ecosystems work, how human activity disturbs them, and how to measure the difference.",
  readingTime: "11 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Environmental science studies how living things and their physical surroundings interact, and how human activity reshapes those connections.",
      body: [
        {
          kind: "text",
          text: "Environmental science is an interdisciplinary field that examines how organisms, energy, and matter move through ecosystems — and how people alter those flows. It draws on biology, chemistry, geology, and climate science to ask practical questions: where does our waste go, how does carbon cycle through air and soil, and what keeps an ecosystem stable or pushes it toward collapse.",
        },
        {
          kind: "text",
          text: "A core idea is that everything is connected. Energy enters most ecosystems as sunlight and passes from plants to herbivores to predators, losing usable energy at each step. Nutrients like carbon, nitrogen, and water cycle endlessly between living things and the environment. Disturb one part — remove a predator, add a pollutant — and effects ripple through the whole system.",
        },
        {
          kind: "list",
          items: [
            "Ecosystem ecology — how energy and nutrients flow through food webs",
            "Pollution science — how contaminants enter air, water, and soil and what they do",
            "Biodiversity & conservation — why variety of life matters and how it is lost",
            "Human impact & sustainability — carbon footprints, resource use, and climate change",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "The systems that supply our air, water, food, and stable climate all depend on healthy ecosystems.",
      body: [
        {
          kind: "text",
          text: "Environmental science underpins the services we rely on but rarely notice: forests and oceans that absorb carbon dioxide, wetlands that filter water, insects that pollinate crops, and soils that grow food. When these systems degrade, the costs show up as polluted water, failing harvests, flooding, and a warming climate.",
        },
        {
          kind: "text",
          text: "It is also a field where ordinary people contribute serious data. Air-quality sensors, stream surveys, and species counts run by volunteers fill gaps that professional networks cannot cover. Large biodiversity platforms now hold hundreds of millions of citizen observations that researchers use to track range shifts and population declines.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Volunteer-run air monitors have repeatedly revealed pollution hotspots near highways and industry that official stations missed, prompting real regulatory attention.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Ecosystems, biodiversity, carbon footprint, pollution, and carrying capacity frame most environmental questions.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Ecosystem", definition: "A community of living organisms together with the non-living environment — air, water, soil — they interact with as one system." },
            { term: "Biodiversity", definition: "The variety of life in a place, across genes, species, and ecosystems; greater diversity generally makes systems more resilient." },
            { term: "Carbon footprint", definition: "The total greenhouse gases, expressed as carbon dioxide equivalents, produced by a person, product, or activity." },
            { term: "Pollution", definition: "The release of substances or energy — chemicals, plastics, excess nutrients, heat, noise — at levels that harm living systems." },
            { term: "Carrying capacity", definition: "The maximum population an environment can sustain given its food, water, and space without degrading over time." },
          ],
        },
        {
          kind: "text",
          text: "These ideas connect tightly. Pollution and overuse can push a population beyond its carrying capacity and erode biodiversity, which weakens an ecosystem's resilience — and a growing carbon footprint warms the climate, shifting the conditions every ecosystem depends on.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Survey local biodiversity with a one-square-meter quadrat to quantify how habitats differ.",
      body: [
        {
          kind: "text",
          text: "Ecologists estimate the richness of a habitat by sampling small, defined areas called quadrats rather than counting everything. With string and a ruler you can run the same method in a lawn, a flowerbed, or an untended patch, and compare how human management affects the variety of life.",
        },
        {
          kind: "steps",
          items: [
            "Make a 1 m × 1 m square frame by tying string between four sticks or laying down four meter-long rulers.",
            "Choose two contrasting spots — for example, a mown lawn and a patch left wild — and place the quadrat in each.",
            "Within each square, count how many different types of plant and visible insect you can distinguish (you don't need exact species names).",
            "Record the number of distinct types and roughly how many individuals of each you see.",
            "Repeat the placement three times per habitat to average out lucky or unlucky spots.",
            "Compare the average number of distinct types between the two habitats.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Hold everything constant except one factor — for instance, sample only sunny areas, on the same day, at the same time — and vary just management (mown vs. wild) or just distance from a path. That way any difference in diversity can be traced to the single variable you changed.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Fieldwork is generally safe, but plants, wildlife, terrain, and contaminated sites all deserve caution.",
      body: [
        {
          kind: "list",
          items: [
            "Identify plants before touching them; avoid handling anything you cannot recognize, especially thorny or sap-producing species.",
            "Do not disturb nests, dens, or wildlife, and never handle animals — observe from a distance.",
            "Wash hands after fieldwork, particularly before eating, since soil and water carry microbes.",
            "Watch your footing near water, slopes, and roadsides, and tell someone where you are going.",
            "Take only photos and notes; collecting plants or animals may be illegal or harmful in protected areas.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Contaminated sites and water",
          text: "Avoid sampling in or near sewage outfalls, industrial runoff, or stagnant water that may carry harmful bacteria or chemicals. If you must approach polluted water, wear waterproof gloves and never let it touch your face or any cuts.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Species counts, waste output, energy use, and air or noise levels are all trackable with simple tools.",
      body: [
        {
          kind: "text",
          text: "Meaningful environmental data comes from consistent, repeatable observation rather than expensive instruments. Decide exactly what and how you will measure, then stick to the same method so your numbers can be compared over time.",
        },
        {
          kind: "list",
          items: [
            "Biodiversity — number of bird, insect, or plant species seen in a fixed area and time",
            "Waste — weight or volume of household rubbish and recycling produced per week",
            "Carbon footprint — kilowatt-hours of electricity used, or kilometers driven, logged over a month",
            "Conditions — temperature, rainfall, or noise and air-quality readings from a phone app or low-cost sensor",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Always record the location, date, time, and weather with each reading. A month of steady weekly entries reveals trends that a single snapshot never could.",
        },
      ],
    },
  ],
};

export default tutorial;
