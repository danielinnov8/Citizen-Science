import type { ModuleTutorial } from "./types";

const tutorial: ModuleTutorial = {
  slug: "chemistry",
  title: "Introduction to Chemistry",
  subtitle: "How atoms combine, rearrange, and react — and how to watch it happen in your kitchen.",
  readingTime: "10 min read",
  sections: [
    {
      title: "What this field studies",
      summary: "Chemistry is the study of matter — what it is made of, how it is structured, and how it changes when substances meet.",
      body: [
        {
          kind: "text",
          text: "Chemistry is the science of matter and its transformations. It explains what everything around you is built from — the air you breathe, the water you drink, the metal in a spoon — and what happens when those substances interact. At its heart are atoms, the roughly hundred kinds of building blocks listed on the periodic table, and the bonds that join them into molecules.",
        },
        {
          kind: "text",
          text: "A chemical change rearranges those bonds to make new substances with new properties: iron plus oxygen and water becomes rust, vinegar plus baking soda becomes carbon dioxide gas. Chemistry tracks where the atoms go, how much energy is absorbed or released, and how fast it all happens. Nothing is created or destroyed — the same atoms are simply reshuffled.",
        },
        {
          kind: "list",
          items: [
            "Atomic & physical chemistry — the structure of atoms and how energy moves",
            "Organic chemistry — carbon-based molecules, from fuels to plastics to your DNA",
            "Inorganic chemistry — metals, minerals, salts, and acids",
            "Analytical chemistry — measuring exactly what a sample contains",
          ],
        },
      ],
    },
    {
      title: "Why it matters",
      summary: "Chemistry shapes medicine, materials, food, energy, and the health of the environment.",
      body: [
        {
          kind: "text",
          text: "Almost every manufactured thing passes through chemistry. Medicines are molecules designed to bind specific targets in the body. Batteries, fertilizers, soaps, paints, and the polymers in your phone are all products of controlled reactions. Understanding chemistry is what lets us purify drinking water, preserve food safely, and develop cleaner ways to store energy.",
        },
        {
          kind: "text",
          text: "Chemistry is also remarkably approachable at home. Acids and bases, dissolving, crystallizing, and gas-producing reactions all happen with ordinary kitchen materials and clear, measurable results. With a thermometer, a scale, and a notebook, you can quantify real chemical behavior without any specialized equipment.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "Real-world impact",
          text: "The pH of soil, rainwater, and aquariums directly controls which plants, fish, and microbes can survive — and you can measure it accurately with inexpensive test strips.",
        },
      ],
    },
    {
      title: "Key concepts",
      summary: "Atoms, molecules, reactions, the pH scale, and the three common states of matter.",
      body: [
        {
          kind: "terms",
          items: [
            { term: "Atom & element", definition: "An atom is the smallest unit of an element. An element (like oxygen or gold) is a substance made of only one kind of atom." },
            { term: "Molecule & compound", definition: "A molecule is two or more atoms bonded together; a compound is a molecule made of different elements, such as water (H₂O)." },
            { term: "Chemical reaction", definition: "A process that breaks and forms bonds to turn reactants into new products, often with a color, temperature, or gas change." },
            { term: "Acid & base (pH)", definition: "Acids release hydrogen ions and have a low pH; bases accept them and have a high pH. The 0–14 scale measures this, with 7 being neutral." },
            { term: "States of matter", definition: "Solid, liquid, and gas — the same molecules packed tightly, loosely, or spread far apart depending on temperature and pressure." },
          ],
        },
        {
          kind: "text",
          text: "These ideas link together. Atoms join into molecules; reactions rearrange those molecules; acids and bases are simply substances that trade hydrogen ions during reactions; and heating or cooling a substance shifts it between states without changing what the molecules are.",
        },
      ],
    },
    {
      title: "Simple example experiment",
      summary: "Use red cabbage to build a natural pH indicator and classify household liquids as acids or bases.",
      body: [
        {
          kind: "text",
          text: "Red cabbage contains pigments called anthocyanins that change color with pH — pink-red in acids, purple near neutral, and blue-green in bases. Brewing a cabbage solution gives you a genuine chemical indicator you can use to measure the acidity of everyday liquids and see the pH scale come alive in color.",
        },
        {
          kind: "steps",
          items: [
            "Chop about two cups of red cabbage, cover with hot water, and let it steep for 10 minutes until the water turns deep purple.",
            "Strain out the cabbage and let the purple liquid cool — this is your indicator.",
            "Pour about 50 ml of the indicator into each of several clear cups.",
            "Add a small amount of one test liquid to each cup — lemon juice, vinegar, plain water, baking soda solution, and soapy water work well.",
            "Compare the colors: pink/red means acidic, purple means near neutral, and blue/green means basic.",
            "Record each liquid and its resulting color in your notebook.",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Make it a real experiment",
          text: "Pick one variable and hold everything else constant. For example, add baking soda to a fixed amount of vinegar one spoon at a time, noting the color after each addition, to track how pH shifts as you neutralize the acid.",
        },
      ],
    },
    {
      title: "Safety considerations",
      summary: "Household chemistry is safe with care, but some everyday products are genuinely hazardous when mixed.",
      body: [
        {
          kind: "list",
          items: [
            "Never taste or drink anything from an experiment, even food-based materials like cabbage juice or vinegar.",
            "Work in a ventilated area and keep your face away from any container that produces gas or fumes.",
            "Wear eye protection when handling acids, bases, or anything that fizzes vigorously.",
            "Use small quantities — a teaspoon of vinegar reacts just as clearly as a cup, with far less mess and risk.",
            "Label cups and never reuse food containers for chemicals after an experiment.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Never mix cleaning products",
          text: "Combining bleach with ammonia or vinegar releases toxic chlorine or chloramine gases that can cause serious lung damage. Stick to the mild, food-grade materials in these activities and never improvise with cleaning chemicals.",
        },
      ],
    },
    {
      title: "What you can measure at home",
      summary: "pH, temperature change, gas production, dissolving rates, and crystal growth.",
      body: [
        {
          kind: "text",
          text: "Good home chemistry comes from measuring change, not just watching it. With a thermometer, a kitchen scale, a measuring cup, and pH strips, you can put numbers on reactions and compare conditions fairly.",
        },
        {
          kind: "list",
          items: [
            "pH — acidity of liquids using cabbage indicator or test strips, on a 0–14 scale",
            "Temperature — heat absorbed or released when substances dissolve or react",
            "Gas volume — how much carbon dioxide a fizzing reaction inflates a balloon",
            "Solubility — how much sugar or salt dissolves in water at different temperatures",
            "Crystal growth — the size or mass of crystals formed from a saturated solution over days",
          ],
        },
        {
          kind: "callout",
          tone: "tip",
          title: "Log it in your Notebook",
          text: "Always record the exact amounts, temperature, and time alongside your result. Reactions are sensitive to conditions, so precise notes are what make your measurements repeatable.",
        },
      ],
    },
  ],
};

export default tutorial;
