// Shared chat types used by both the science copilot (/agent) and the
// figure-scoped digital mentor (/mentor/:slug).

export interface WebSource {
  title: string;
  url: string;
}

export interface VerifiedVideo {
  id: string;
  title: string;
  channel: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: WebSource[];
  video?: VerifiedVideo;
}
