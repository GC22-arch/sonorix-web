export type Language = "" | "es" | "en" | "pt" | "fr" | "it" | "de";
export type CleanupStyle = "natural" | "formal" | "casual";

export interface DictationResult {
  text: string;
  words: number;
  latencyMs: number;
  cleaned: boolean;
}

export interface HistoryItem extends DictationResult {
  id: string;
  createdAt: number;
  duration: number;
}

export interface DictationPrefs {
  language: Language;
  cleanup: boolean;
  style: CleanupStyle;
  vocabulary: string;
  autoCopy: boolean;
}

export type RecorderState = "idle" | "recording" | "processing";
