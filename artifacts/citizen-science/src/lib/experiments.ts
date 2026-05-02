import { type Difficulty } from "./categories";

export interface ExperimentStep {
  text: string;
}

export interface Experiment {
  id: string;
  slug: string;
  title: string;
  categoryId: string; // matches slug in CATEGORIES
  difficulty: Difficulty;
  estimatedTime: string;
  materials: string[];
  steps: ExperimentStep[];
}

export const EXPERIMENTS: Experiment[] = [
  // Plant Science
  {
    id: "exp-plant-1",
    slug: "light-vs-shade-growth",
    title: "Light vs. Shade Growth",
    categoryId: "plant-science",
    difficulty: "Beginner",
    estimatedTime: "3 weeks",
    materials: ["2 small pots", "Potting soil", "Seeds (e.g., bean or basil)", "Water", "Ruler"],
    steps: [
      { text: "Fill both pots with equal amounts of potting soil." },
      { text: "Plant 2-3 seeds in each pot at the same depth." },
      { text: "Place Pot A on a sunny windowsill and Pot B in a dark cupboard or room." },
      { text: "Water both pots equally whenever the top soil feels dry." },
      { text: "Measure and record the height of the seedlings daily." },
      { text: "Observe color and stem thickness differences over 3 weeks." }
    ]
  },
  {
    id: "exp-plant-2",
    slug: "water-frequency-impact",
    title: "Water Frequency Impact",
    categoryId: "plant-science",
    difficulty: "Beginner",
    estimatedTime: "4 weeks",
    materials: ["3 similar plants", "Water", "Measuring cup"],
    steps: [
      { text: "Label the plants as Daily (A), Weekly (B), and Bi-weekly (C)." },
      { text: "Water Plant A with 50ml of water every day." },
      { text: "Water Plant B with 100ml of water once a week." },
      { text: "Water Plant C with 150ml of water every two weeks." },
      { text: "Monitor and record signs of wilting, yellowing, or rapid growth." }
    ]
  },
  {
    id: "exp-plant-3",
    slug: "soil-type-comparison",
    title: "Soil Type Comparison",
    categoryId: "plant-science",
    difficulty: "Intermediate",
    estimatedTime: "6 weeks",
    materials: ["Potting mix", "Sand", "Backyard dirt", "3 pots", "Seeds"],
    steps: [
      { text: "Fill one pot with potting mix, one with sand, and one with backyard dirt." },
      { text: "Plant seeds equally in all three." },
      { text: "Provide equal water and light to all." },
      { text: "Track germination time and overall health." }
    ]
  },

  // Water Quality
  {
    id: "exp-water-1",
    slug: "tap-vs-filtered-ph",
    title: "Tap vs. Filtered Water pH",
    categoryId: "water-quality",
    difficulty: "Beginner",
    estimatedTime: "1 day",
    materials: ["Tap water", "Filtered water", "pH test strips", "2 clean glasses"],
    steps: [
      { text: "Pour tap water into Glass A." },
      { text: "Pour filtered water into Glass B." },
      { text: "Dip a pH strip into Glass A for 2 seconds and remove." },
      { text: "Dip a new pH strip into Glass B." },
      { text: "Compare the colors to the pH chart and record the results." }
    ]
  },
  {
    id: "exp-water-2",
    slug: "turbidity-check",
    title: "Local Pond Turbidity",
    categoryId: "water-quality",
    difficulty: "Beginner",
    estimatedTime: "1 hour",
    materials: ["Clear jar", "Local pond/river water", "White paper with black text"],
    steps: [
      { text: "Collect a water sample in the clear jar." },
      { text: "Place the jar on top of the text on the white paper." },
      { text: "Look down through the water and see if you can read the text." },
      { text: "Rate turbidity on a scale of 1-5 (1=clear, 5=opaque)." }
    ]
  },
  {
    id: "exp-water-3",
    slug: "evaporation-rates",
    title: "Salinity and Evaporation",
    categoryId: "water-quality",
    difficulty: "Intermediate",
    estimatedTime: "1 week",
    materials: ["Salt", "Water", "2 shallow dishes", "Scale"],
    steps: [
      { text: "Mix 1 tbsp of salt into 1 cup of water and pour into Dish A." },
      { text: "Pour 1 cup of fresh water into Dish B." },
      { text: "Weigh both dishes and record." },
      { text: "Leave both in a warm, dry place." },
      { text: "Weigh daily to calculate evaporation rate." }
    ]
  },

  // Physics
  {
    id: "exp-physics-1",
    slug: "pendulum-period",
    title: "Pendulum Period Calculation",
    categoryId: "physics",
    difficulty: "Intermediate",
    estimatedTime: "1 hour",
    materials: ["String", "Small weight (washer or nut)", "Tape measure", "Stopwatch"],
    steps: [
      { text: "Tie the weight to a 50cm length of string." },
      { text: "Secure the top of the string so the weight hangs freely." },
      { text: "Pull the weight back to a 20-degree angle and release." },
      { text: "Time how long it takes to complete 10 full swings." },
      { text: "Divide the time by 10 to find the period of one swing." },
      { text: "Repeat with string lengths of 40cm, 30cm, and 20cm." }
    ]
  },
  {
    id: "exp-physics-2",
    slug: "friction-coefficient",
    title: "Testing Surface Friction",
    categoryId: "physics",
    difficulty: "Beginner",
    estimatedTime: "30 mins",
    materials: ["Wooden block", "Rubber band", "Ruler", "Different surfaces (carpet, tile, wood)"],
    steps: [
      { text: "Attach the rubber band to the block." },
      { text: "Place the block on wood and pull the band slowly." },
      { text: "Measure how far the band stretches before the block moves." },
      { text: "Repeat on carpet and tile to compare friction levels." }
    ]
  },
  {
    id: "exp-physics-3",
    slug: "gravity-drop",
    title: "Gravity Object Drop",
    categoryId: "physics",
    difficulty: "Beginner",
    estimatedTime: "20 mins",
    materials: ["Tennis ball", "Crumpled paper ball", "Camera (optional)"],
    steps: [
      { text: "Hold the tennis ball and paper ball at the exact same height." },
      { text: "Drop them simultaneously." },
      { text: "Listen for the impact or record it in slow motion." },
      { text: "Observe that they hit the ground at the same time." }
    ]
  },

  // Add dummy starters for others to ensure 3 per category
  ...["biology", "environmental-science", "chemistry", "human-health", "microbiology", "food-science", "agriculture", "neuroscience", "climate-science", "astronomy", "materials-science"].flatMap(cat => [
    {
      id: `exp-${cat}-1`,
      slug: `starter-1-${cat}`,
      title: `Introductory ${cat.replace("-", " ")} observation`,
      categoryId: cat,
      difficulty: "Beginner" as Difficulty,
      estimatedTime: "1 hour",
      materials: ["Notebook", "Pen"],
      steps: [{ text: "Read the safety guidelines." }, { text: "Make initial observations." }, { text: "Record findings." }]
    },
    {
      id: `exp-${cat}-2`,
      slug: `starter-2-${cat}`,
      title: `Core ${cat.replace("-", " ")} experiment`,
      categoryId: cat,
      difficulty: "Intermediate" as Difficulty,
      estimatedTime: "1 day",
      materials: ["Standard household items"],
      steps: [{ text: "Set up the environment." }, { text: "Introduce the variable." }, { text: "Monitor changes." }, { text: "Log data." }]
    },
    {
      id: `exp-${cat}-3`,
      slug: `starter-3-${cat}`,
      title: `Advanced ${cat.replace("-", " ")} analysis`,
      categoryId: cat,
      difficulty: "Advanced" as Difficulty,
      estimatedTime: "1 week",
      materials: ["Specialized kit", "Safety gear"],
      steps: [{ text: "Prepare sterile/safe environment." }, { text: "Conduct procedure." }, { text: "Gather long-term metrics." }, { text: "Calculate conclusions." }]
    }
  ])
];
