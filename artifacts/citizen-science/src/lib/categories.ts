import { Microscope, Leaf, Globe2, Droplet, FlaskConical, Atom, HeartPulse, Beaker, UtensilsCrossed, Sprout, Brain, CloudSun, Telescope, Layers, type LucideIcon } from "lucide-react";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  tutorialsCount: number;
  toolsCount: number;
  safety: "Low" | "Medium" | "High";
  accent: string;
  tutorialSections: { title: string; status: "done" | "active" | "locked" }[];
  toolPreview: {
    name: string;
    description: string;
  };
}

export const CATEGORIES: Category[] = [
  {
    slug: "biology",
    name: "Biology",
    description: "Study of living organisms, their structure, function, growth, origin, evolution, and distribution.",
    icon: "microscope",
    difficulty: "Beginner",
    tutorialsCount: 6,
    toolsCount: 2,
    safety: "Low",
    accent: "green",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Cell Structure Viewer", description: "Simulate cell division and structures." }
  },
  {
    slug: "plant-science",
    name: "Plant Science",
    description: "Botany and plant physiology. Learn how light, water, nutrients, and soil composition affect growth.",
    icon: "leaf",
    difficulty: "Beginner",
    tutorialsCount: 8,
    toolsCount: 4,
    safety: "Low",
    accent: "green",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts (Photosynthesis & Respiration)", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Plant Growth Planner", description: "Simulate and track plant development." }
  },
  {
    slug: "environmental-science",
    name: "Environmental Science",
    description: "Ecosystems, biodiversity, and sustainability. Track ecological shifts and monitor habitats.",
    icon: "globe2",
    difficulty: "Intermediate",
    tutorialsCount: 5,
    toolsCount: 3,
    safety: "Low",
    accent: "emerald",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Carbon Footprint Estimator", description: "Calculate daily emissions." }
  },
  {
    slug: "water-quality",
    name: "Water Quality",
    description: "Hydrology and purification. Understand the chemistry of local water sources.",
    icon: "droplet",
    difficulty: "Beginner",
    tutorialsCount: 4,
    toolsCount: 2,
    safety: "Medium",
    accent: "blue",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Water Quality Tracker", description: "Log pH and clarity measurements." }
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    description: "Matter, its properties, how and why substances combine or separate to form other substances.",
    icon: "flask-conical",
    difficulty: "Advanced",
    tutorialsCount: 10,
    toolsCount: 5,
    safety: "High",
    accent: "purple",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "pH Experiment Planner", description: "Structure your acidity tests." }
  },
  {
    slug: "physics",
    name: "Physics",
    description: "Study of matter, energy, and force. Test the fundamental laws of motion.",
    icon: "atom",
    difficulty: "Intermediate",
    tutorialsCount: 7,
    toolsCount: 3,
    safety: "Low",
    accent: "blue",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Motion Simulator", description: "Calculate velocity and momentum." }
  },
  {
    slug: "human-health",
    name: "Human Health",
    description: "Wellness, physiology, and performance. Correlate lifestyle habits with bodily functions.",
    icon: "heart-pulse",
    difficulty: "Beginner",
    tutorialsCount: 6,
    toolsCount: 4,
    safety: "Low",
    accent: "rose",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Sleep & Wellness Logger", description: "Correlate habits with rest." }
  },
  {
    slug: "microbiology",
    name: "Microbiology",
    description: "Microscopic organisms. Explore the unseen world of bacteria, viruses, and fungi.",
    icon: "beaker",
    difficulty: "Advanced",
    tutorialsCount: 8,
    toolsCount: 2,
    safety: "High",
    accent: "violet",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Microbial Growth Simulator", description: "Model population expansion." }
  },
  {
    slug: "food-science",
    name: "Food Science",
    description: "Culinary chemistry, fermentation, and nutrition. Experiment with flavors and preservation.",
    icon: "utensils-crossed",
    difficulty: "Intermediate",
    tutorialsCount: 5,
    toolsCount: 2,
    safety: "Medium",
    accent: "orange",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Fermentation Tracker", description: "Monitor fermentation progress." }
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    description: "Farming, soil health, and crop cultivation. Optimize growing conditions for food production.",
    icon: "sprout",
    difficulty: "Beginner",
    tutorialsCount: 7,
    toolsCount: 3,
    safety: "Low",
    accent: "amber",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Soil Health Calculator", description: "Estimate nutrient density." }
  },
  {
    slug: "neuroscience",
    name: "Neuroscience",
    description: "Nervous system and brain function. Map reaction times, memory, and cognition.",
    icon: "brain",
    difficulty: "Intermediate",
    tutorialsCount: 6,
    toolsCount: 2,
    safety: "Low",
    accent: "fuchsia",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Reaction Time Tester", description: "Measure cognitive reflexes." }
  },
  {
    slug: "climate-science",
    name: "Climate Science",
    description: "Weather and climate systems. Track long-term meteorological data and patterns.",
    icon: "cloud-sun",
    difficulty: "Beginner",
    tutorialsCount: 5,
    toolsCount: 3,
    safety: "Low",
    accent: "sky",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Meteorological Log", description: "Record daily weather data." }
  },
  {
    slug: "astronomy",
    name: "Astronomy",
    description: "Stars, planets, and the universe. Observe and log celestial events.",
    icon: "telescope",
    difficulty: "Beginner",
    tutorialsCount: 4,
    toolsCount: 2,
    safety: "Low",
    accent: "indigo",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Sky Observation Journal", description: "Log astronomical events." }
  },
  {
    slug: "materials-science",
    name: "Materials Science",
    description: "Properties of matter. Test tensile strength, conductivity, and durability.",
    icon: "layers",
    difficulty: "Intermediate",
    tutorialsCount: 5,
    toolsCount: 2,
    safety: "Medium",
    accent: "slate",
    tutorialSections: [
      { title: "What this field studies", status: "done" },
      { title: "Why it matters", status: "done" },
      { title: "Key concepts", status: "active" },
      { title: "Simple example experiment", status: "locked" },
      { title: "Safety considerations", status: "locked" },
      { title: "What you can measure at home", status: "locked" },
    ],
    toolPreview: { name: "Stress Tester", description: "Log material failure points." }
  }
];

const ICONS: Record<string, LucideIcon> = {
  microscope: Microscope,
  leaf: Leaf,
  globe2: Globe2,
  droplet: Droplet,
  "flask-conical": FlaskConical,
  atom: Atom,
  "heart-pulse": HeartPulse,
  beaker: Beaker,
  "utensils-crossed": UtensilsCrossed,
  sprout: Sprout,
  brain: Brain,
  "cloud-sun": CloudSun,
  telescope: Telescope,
  layers: Layers,
};

export const getCategoryIcon = (iconName: string): LucideIcon => {
  return ICONS[iconName] || Beaker;
};
