// Mismo post-procesado que la app de Windows.

const HALLUCINATIONS = new Set(
  [
    "subtítulos realizados por la comunidad de amara.org",
    "subtítulos por la comunidad de amara.org",
    "gracias por ver el video",
    "gracias por ver el vídeo",
    "gracias por ver",
    "suscríbete al canal",
    "thank you for watching",
    "thanks for watching",
    "you",
  ].map(norm),
);

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/^[\s.!¡¿?]+|[\s.!¡¿?]+$/g, "");
}

export function stripHallucinations(text: string): string {
  if (HALLUCINATIONS.has(norm(text))) return "";
  return text.replace(/\s*Subtítulos (realizados )?por la comunidad de Amara\.org\.?/gi, "").trim();
}

const P = "[\\s,.;:]*";
const COMMANDS: [RegExp, string][] = [
  [new RegExp(`${P}\\b(nuevo p[aá]rrafo|new paragraph)\\b${P}`, "gi"), "\n\n"],
  [new RegExp(`${P}\\b(punto y aparte)\\b${P}`, "gi"), ".\n"],
  [new RegExp(`${P}\\b(nueva l[ií]nea|salto de l[ií]nea|new line)\\b${P}`, "gi"), "\n"],
  [/\s*\b(dos puntos)\b[\s.,]*/gi, ": "],
  [/\s*\b(punto y coma)\b[\s.,]*/gi, "; "],
];

export function applyVoiceCommands(text: string): string {
  let out = text;
  for (const [re, rep] of COMMANDS) out = out.replace(re, rep);
  if (out === text) return text;
  return out
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/ {2,}/g, " ")
    .trim()
    .replace(/(^|\n|[.!?¿¡]\s+)([a-záéíóúñ])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

export function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}_]+/gu) ?? []).length;
}
