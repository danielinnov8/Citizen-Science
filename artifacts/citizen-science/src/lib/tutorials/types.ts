export type TutorialBlock =
  | { kind: "text"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "steps"; items: string[] }
  | { kind: "terms"; items: { term: string; definition: string }[] }
  | { kind: "callout"; tone: "tip" | "warning" | "info"; title?: string; text: string };

export interface TutorialSection {
  title: string;
  summary: string;
  body: TutorialBlock[];
}

export interface ModuleTutorial {
  slug: string;
  title: string;
  subtitle: string;
  readingTime: string;
  sections: TutorialSection[];
}
