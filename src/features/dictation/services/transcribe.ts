import type { DictationPrefs, DictationResult } from "../types";

export class UnauthorizedError extends Error {}

export async function transcribe(audio: Blob, prefs: DictationPrefs): Promise<DictationResult> {
  const fd = new FormData();
  fd.append("audio", audio, "audio");
  fd.append("language", prefs.language);
  fd.append("cleanup", prefs.cleanup ? "1" : "0");
  fd.append("style", prefs.style);
  fd.append("vocabulary", prefs.vocabulary.slice(0, 600));
  const r = await fetch("/api/transcribe", { method: "POST", body: fd, credentials: "same-origin" });
  if (r.status === 401) throw new UnauthorizedError("Sesión vencida");
  const j = (await r.json().catch(() => ({}))) as Partial<DictationResult> & { error?: string };
  if (!r.ok || j.error) throw new Error(j.error || `Error ${r.status}`);
  return { text: j.text ?? "", words: j.words ?? 0, latencyMs: j.latencyMs ?? 0, cleaned: Boolean(j.cleaned) };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
