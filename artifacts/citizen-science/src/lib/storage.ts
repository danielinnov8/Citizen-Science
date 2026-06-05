export interface NotebookEntry {
  id: string;
  experimentId: string;
  date: string;
  observation: string;
  categorySlug: string | undefined;
}

export interface CompletedStep {
  experimentId: string;
  stepIndex: number;
}

export interface StartedExperiment {
  id: string;
  startedAt: string;
  progress: number;
}

export const storage = {
  // Notebook
  getNotebookEntries: (): NotebookEntry[] => {
    try {
      const data = localStorage.getItem("cs_notebook");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addNotebookEntry: (entry: Omit<NotebookEntry, "id">) => {
    const entries = storage.getNotebookEntries();
    const newEntry = { ...entry, id: Math.random().toString(36).substring(2, 9) };
    localStorage.setItem("cs_notebook", JSON.stringify([newEntry, ...entries]));
    return newEntry;
  },

  // Completed Steps
  getCompletedSteps: (): CompletedStep[] => {
    try {
      const data = localStorage.getItem("cs_completed_steps");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  markStepComplete: (experimentId: string, stepIndex: number) => {
    const steps = storage.getCompletedSteps();
    if (!steps.some(s => s.experimentId === experimentId && s.stepIndex === stepIndex)) {
      localStorage.setItem("cs_completed_steps", JSON.stringify([...steps, { experimentId, stepIndex }]));
    }
  },

  // Started Experiments
  getStartedExperiments: (): StartedExperiment[] => {
    try {
      const data = localStorage.getItem("cs_started_experiments");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  startExperiment: (id: string) => {
    const started = storage.getStartedExperiments();
    if (!started.some(s => s.id === id)) {
      localStorage.setItem(
        "cs_started_experiments",
        JSON.stringify([...started, { id, startedAt: new Date().toISOString(), progress: 0 }])
      );
    }
  },
  updateExperimentProgress: (id: string, progress: number) => {
    const started = storage.getStartedExperiments();
    const updated = started.map(s => (s.id === id ? { ...s, progress } : s));
    localStorage.setItem("cs_started_experiments", JSON.stringify(updated));
  },

  // Completed Tutorials
  getCompletedTutorials: (): string[] => {
    try {
      const data = localStorage.getItem("cs_completed_tutorials");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  markTutorialComplete: (tutorialId: string) => {
    const completed = storage.getCompletedTutorials();
    if (!completed.includes(tutorialId)) {
      localStorage.setItem("cs_completed_tutorials", JSON.stringify([...completed, tutorialId]));
    }
  },

  // Tutorial section progress (per module): { [categorySlug]: number[] }
  getTutorialSections: (slug: string): number[] => {
    try {
      const data = localStorage.getItem("cs_tutorial_sections");
      const parsed = data ? JSON.parse(data) : {};
      if (typeof parsed !== "object" || parsed === null) return [];
      const value = (parsed as Record<string, unknown>)[slug];
      if (!Array.isArray(value)) return [];
      const indices = value.filter((n): n is number => Number.isInteger(n) && n >= 0);
      return Array.from(new Set(indices)).sort((a, b) => a - b);
    } catch {
      return [];
    }
  },
  setTutorialSections: (slug: string, sections: number[]) => {
    try {
      const data = localStorage.getItem("cs_tutorial_sections");
      const map: Record<string, number[]> = data ? JSON.parse(data) : {};
      map[slug] = Array.from(new Set(sections)).sort((a, b) => a - b);
      localStorage.setItem("cs_tutorial_sections", JSON.stringify(map));
    } catch {
      /* ignore */
    }
  },

  // Clear all
  clearAll: () => {
    localStorage.removeItem("cs_notebook");
    localStorage.removeItem("cs_completed_steps");
    localStorage.removeItem("cs_started_experiments");
    localStorage.removeItem("cs_completed_tutorials");
    localStorage.removeItem("cs_tutorial_sections");
    localStorage.removeItem("cs_onboarded");
  }
};
