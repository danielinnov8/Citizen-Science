import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "plant-science",
  title: "Introduction to Plant Science",
  subtitle: "How plants build themselves from light, air, and water — and what controls how well they grow.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Plant science studies how plants are structured, how they make and use energy, and what conditions shape their growth.",
      body: [
        {
          kind: "text",
          text: "Plant science — botany together with plant physiology — asks how plants are built and how they function. It covers the structures you can see (roots, stems, leaves, flowers) and the processes you cannot (photosynthesis, respiration, the movement of water and sugars). The central puzzle is striking: plants assemble their entire bodies largely out of carbon dioxide from the air and water from the soil, powered by sunlight.",
        },
        {
          kind: "text",
          text: "Because plants cannot move to find food or escape stress, almost everything about them is a response to their environment. A leaf angles toward light, roots grow toward moisture, and a stem stretches when it is shaded. Once you learn to read these responses, a windowsill seedling and a forest canopy reveal the same underlying rules.",
        },
        {
          kind: "list",
          items: [
            "Plant anatomy — the tissues and organs that make up roots, stems, and leaves",
            "Photosynthesis & respiration — how plants capture, store, and release energy",
            "Water relations & transport — how water and dissolved sugars move through the plant",
            "Growth & development — how light, nutrients, soil, and hormones shape form over time",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Plants feed us, supply much of our oxygen, and anchor nearly every ecosystem on land.",
      body: [
        {
          kind: "text",
          text: "Plants are the foundation of life on land. Through photosynthesis they convert sunlight into the chemical energy that feeds almost every food web, and they release the oxygen that most living things breathe. Agriculture, forestry, and the global carbon cycle all rest on understanding how plants grow and what limits them.",
        },
        {
          kind: "text",
          text: "Plant science is also remarkably accessible. A packet of seeds and a sunny windowsill are enough to run real experiments, and plants respond visibly to changes in light, water, and nutrients over days rather than years. Volunteers tracking when trees leaf out or flowers first bloom have built decades-long records that scientists now use to study climate change.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "Improving photosynthetic efficiency in staple crops like rice and wheat is an active research goal — even small gains could raise yields enough to feed tens of millions more people.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Photosynthesis, respiration, transpiration, nutrients, and tropisms explain most of what plants do.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Photosynthesis", definition: "The process in which chloroplasts use light energy to turn carbon dioxide and water into glucose, releasing oxygen as a by-product." },
            { term: "Respiration", definition: "How plants break down stored sugars to release usable energy — running day and night, unlike photosynthesis." },
            { term: "Transpiration", definition: "The evaporation of water from leaf pores (stomata), which pulls water and nutrients up from the roots like a wick." },
            { term: "Macronutrients", definition: "The minerals plants need in large amounts — nitrogen for leaves, phosphorus for roots and flowers, potassium for overall vigor (N-P-K)." },
            { term: "Tropism", definition: "A directional growth response to a stimulus, such as phototropism (toward light) or gravitropism (roots down, shoots up)." },
          ],
        },
        {
          kind: "text",
          text: "These processes interlock. Photosynthesis builds the sugars that respiration later burns for energy; transpiration delivers the water and dissolved nutrients those reactions depend on; and tropisms aim leaves and roots so the whole system can keep capturing light, water, and minerals efficiently.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Grow bean seedlings under different light conditions to see how plants respond to their environment.",
      body: [
        {
          kind: "text",
          text: "Fast-sprouting seeds like beans, peas, or cress make growth visible within a week. By germinating several and giving them different amounts or directions of light, you can watch phototropism and the effect of light on healthy growth happen in real time.",
        },
        {
          kind: "steps",
          items: [
            "Soak 8 dried beans overnight, then plant 2 each in four identical cups of moist potting soil, about 2 cm deep.",
            "Water all cups equally so the only thing you change is light — keep the soil damp but not waterlogged.",
            "Place two cups on a sunny windowsill and two inside a closed cardboard box with a single coin-sized hole cut in one side.",
            "Check daily, water as needed, and measure each seedling's height in millimeters once it emerges.",
            "After 7–10 days, compare stem height, leaf color, and the direction the box-grown plants leaned.",
            "Record your measurements each day so you can plot height over time for both groups.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Change only one variable at a time. To test light direction, keep both groups equally bright but let one receive light from a single side; to test light amount, keep direction constant and vary the hours of exposure. Everything else — soil, water, temperature, seed type — stays identical.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Growing plants at home is low-risk, but soil, fertilizer, and certain plants still call for care.",
      body: [
        {
          kind: "list",
          items: [
            "Wash your hands after handling soil or compost, which contain microbes that can infect cuts.",
            "Store and use fertilizers exactly as labeled; concentrated nutrients can burn skin, eyes, and plant roots.",
            "Never eat sprouts, seeds, or plants grown for an experiment unless you know they are food-safe and grew clean.",
            "Keep treated seeds, fertilizers, and unknown plants away from children and pets.",
            "Provide ventilation if you grow under lamps indoors, and avoid overwatering, which breeds mold.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Toxic and allergenic plants",
          text: "Many common ornamentals (such as oleander, foxglove, and lily) are poisonous if eaten, and pollen or mold from plants can trigger allergies and asthma. Identify any plant before handling it closely, and work in a ventilated space.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "Growth rate, water use, germination success, and responses to light are all easy to quantify.",
      body: [
        {
          kind: "text",
          text: "You don't need a lab to gather solid plant data — you need consistent conditions and careful records. The most reliable home measurements are repeatable, so anyone following your method would get a comparable result.",
        },
        {
          kind: "list",
          items: [
            "Growth — seedling height in millimeters, number of leaves, or stem thickness over time",
            "Germination — the percentage of seeds that sprout under a given condition",
            "Water use — soil moisture or how much water a potted plant draws in a day by weighing it",
            "Response — the angle a plant leans toward light, or how quickly leaves wilt and recover",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Note the date, light, water, and temperature alongside every measurement. A two-week run of consistent daily entries tells a far clearer story than a single dramatic photo.",
        },
      ],
    },
  ],
};

export default tutorial;
