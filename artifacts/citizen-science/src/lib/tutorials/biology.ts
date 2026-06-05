import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "biology",
  title: "Introduction to Biology",
  subtitle: "From single cells to whole ecosystems — how life is organized, and how to study it.",
  readingTime: "11 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Biology is the study of living systems — how they are built, how they work, and how they change over time.",
      body: [
        {
          kind: "text",
          text: "Biology is the science of life. It asks how living things are organized, how they capture and use energy, how they reproduce, and how populations change across generations. The field spans an enormous range of scale: from molecules like DNA and proteins, up through cells, tissues, and organs, to whole organisms, populations, and the ecosystems they live in.",
        },
        {
          kind: "text",
          text: "What unites all of these scales is a small set of shared principles. Every living thing is made of one or more cells, stores its instructions in nucleic acids, and is connected to other life through a single evolutionary history. Once you learn to look for these patterns, a tide pool, a compost heap, and your own body all start to make sense as variations on the same themes.",
        },
        {
          kind: "list",
          items: [
            "Molecular & cell biology — the machinery inside cells",
            "Genetics — how traits are inherited and expressed",
            "Physiology — how organs and systems keep an organism alive",
            "Ecology & evolution — how populations interact and change over time",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Biology underpins medicine, food, conservation, and how we understand ourselves.",
      body: [
        {
          kind: "text",
          text: "Almost every major challenge facing people today has biology at its core. New medicines and vaccines come from understanding cells and immune systems. Feeding a growing population depends on crop science and soil ecology. Protecting biodiversity, managing pandemics, and adapting to a changing climate all require reading the living world accurately.",
        },
        {
          kind: "text",
          text: "Biology is also unusually friendly to citizen scientists. Living things are everywhere, they respond to simple interventions, and many important observations — when a plant flowers, which birds visit a feeder, how fast yeast ferments — need no specialized lab. Careful amateurs have contributed real data to studies of migration, phenology, and microbial diversity.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Long-running volunteer datasets, like backyard bird counts and first-bloom records, are now key evidence for how species are shifting in response to warming springs.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Cells, DNA, energy flow, homeostasis, and evolution by natural selection.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Cell", definition: "The smallest unit that counts as alive. All organisms are made of one (bacteria) or many (you) cells." },
            { term: "DNA & genes", definition: "The molecule that stores hereditary instructions. A gene is a stretch of DNA that codes for a trait or protein." },
            { term: "Metabolism", definition: "The set of chemical reactions that capture energy (e.g. respiration, photosynthesis) and build the molecules of life." },
            { term: "Homeostasis", definition: "How an organism keeps internal conditions — temperature, pH, water balance — steady despite a changing environment." },
            { term: "Natural selection", definition: "The process where heritable traits that improve survival and reproduction become more common over generations." },
          ],
        },
        {
          kind: "text",
          text: "These ideas connect. Genes encode the proteins that run metabolism; metabolism powers the activity that keeps an organism in homeostasis; and differences in how well organisms do all of this, passed down through DNA, are the raw material for natural selection.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Watch yeast respire by feeding it sugar and capturing the carbon dioxide it produces.",
      body: [
        {
          kind: "text",
          text: "Yeast are single-celled fungi. When you give them sugar and warm water, they respire and release carbon dioxide gas — the same process that makes bread rise. This experiment lets you see a metabolic reaction happen in real time, and measure how it responds to a variable you choose.",
        },
        {
          kind: "steps",
          items: [
            "Add 1 packet (about 7 g) of active dry yeast and 1 teaspoon of sugar to a small bottle.",
            "Pour in roughly 100 ml of warm (not hot) water and swirl gently to mix.",
            "Stretch the neck of a balloon over the mouth of the bottle.",
            "Place the bottle somewhere warm and start a timer.",
            "Measure the balloon's circumference every 5 minutes for 30 minutes and record it.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Run several bottles at once, changing only one variable — sugar amount, water temperature, or yeast brand. Keep everything else identical so any difference in inflation can be traced to that one factor.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Biology at home is low-risk, but treat live cultures and sharp tools with respect.",
      body: [
        {
          kind: "list",
          items: [
            "Never eat or taste anything from an experiment, even food-grade yeast cultures.",
            "Wash hands before and after handling living material; keep work surfaces clean.",
            "Seal and discard cultures (yeast, mold, pond water) in the trash — do not pour large amounts down household drains.",
            "Use warm, not boiling, water to avoid burns and to keep cells alive.",
            "If you grow microbes on purpose, keep the containers sealed and never open colonies you cannot identify.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Allergies",
          text: "Yeast, molds, and plant material can trigger allergies or asthma. Work in a ventilated space and stop if you notice irritation.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Growth rates, response times, population counts, and simple behavioral patterns.",
      body: [
        {
          kind: "text",
          text: "You don't need a lab to collect biological data — you need a consistent method and good notes. The best home measurements are repeatable: anyone following your steps should get a similar number.",
        },
        {
          kind: "list",
          items: [
            "Growth — height of a seedling, area of a mold colony, or balloon size from fermenting yeast",
            "Rate — how long a reaction or behavior takes under different conditions",
            "Counts — number of insects, birds, or sprouted seeds over time",
            "Response — how an organism reacts to light, temperature, or food",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Record the date, conditions, and exact measurement every time. A week of consistent entries is worth more than one perfect-looking result.",
        },
      ],
    },
  ],
};

export default tutorial;
