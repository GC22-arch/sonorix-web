"use client";

import type { DictationResult } from "../types";

interface Props {
  result: DictationResult;
  onCopy: () => void;
}

export function ResultCard({ result, onCopy }: Props) {
  const share = () => {
    if (navigator.share) navigator.share({ text: result.text }).catch(() => {});
    else onCopy();
  };
  return (
    <div className="w-full max-w-lg rounded-2xl border border-ink-line bg-ink-panel p-4">
      <p className="max-h-[28vh] select-text overflow-auto whitespace-pre-wrap break-words">{result.text}</p>
      <div className="mt-3 flex gap-2">
        <button onClick={onCopy} className="flex-1 rounded-xl bg-neon py-3 font-semibold">
          Copiar
        </button>
        <button onClick={share} className="flex-1 rounded-xl border border-ink-line bg-ink-raised py-3">
          Compartir
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {result.words} palabras · {(result.latencyMs / 1000).toFixed(1)} s{result.cleaned ? " · IA" : ""}
      </p>
    </div>
  );
}
