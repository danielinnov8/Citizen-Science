import type { ModuleTutorial } from "./types";
import biology from "./biology";
import plantScience from "./plant-science";
import environmentalScience from "./environmental-science";
import waterQuality from "./water-quality";
import chemistry from "./chemistry";
import physics from "./physics";
import humanHealth from "./human-health";
import microbiology from "./microbiology";
import foodScience from "./food-science";
import agriculture from "./agriculture";
import neuroscience from "./neuroscience";
import climateScience from "./climate-science";
import astronomy from "./astronomy";
import materialsScience from "./materials-science";

export const TUTORIALS: Record<string, ModuleTutorial> = {
  biology,
  "plant-science": plantScience,
  "environmental-science": environmentalScience,
  "water-quality": waterQuality,
  chemistry,
  physics,
  "human-health": humanHealth,
  microbiology,
  "food-science": foodScience,
  agriculture,
  neuroscience,
  "climate-science": climateScience,
  astronomy,
  "materials-science": materialsScience,
};

export function getTutorial(slug: string | undefined): ModuleTutorial | undefined {
  if (!slug) return undefined;
  return TUTORIALS[slug];
}

export type { ModuleTutorial, TutorialSection, TutorialBlock } from "./types";
