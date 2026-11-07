"use client";

import { useState } from "react";
import { copyText } from "../services/transcribe";
import { useDictationStore } from "../store/dictation-store";

export function HistoryList({ onToast }: { onToast: (msg: string) => void }) {
  const { history, remove, clear } = useDictationStore();
  const [q, setQ] = useState("");
  const items = q ? history.filter((h) => h.text.toLowerCase().includes(q.toLowerCase())) : history;
  const words = history.reduce((n, h) => n + h.words, 0);

  return (
    <div className="w-full max-w-lg">
      <div className="mb-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Dictados" value={history.length} />
        <Stat label="Palabras" value={words} />
        <Stat label="Min. ahorrados" value={Math.round(Math.max(0, words / 40 - history.reduce((n, h) => n + h.duration, 0) / 60))} />
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="mb-3 w-full rounded-xl border border-ink-line bg-ink-raised px-3 py-2.5 outline-none focus:border-neon-violet"
      />
      {items.length === 0 && <p className="py-10 text-center text-muted">{q ? "Sin resultados" : "Tus dictados aparecerán aquí"}</p>}
      <ul className="space-y-2">
        {items.map((h) => (
          <li key={h.id} className="rounded-xl border border-ink-line bg-ink-panel p-3">
            <button
              className="w-full select-text whitespace-pre-wrap break-words text-left"
              onClick={async () => onToast((await copyText(h.text)) ? "✓ Copiado" : "No se pudo copiar")}
            >
              {h.text}
            </button>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span>
                {new Date(h.createdAt).toLocaleString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>{h.words} palabras</span>
              {h.cleaned && <span className="rounded border border-neon-magenta/40 px-1.5 text-[#ff9be9]">IA</span>}
              <button className="ml-auto text-[#ff4d5e]" onClick={() => remove(h.id)}>
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
      {history.length > 0 && (
        <button
          className="mt-4 w-full rounded-xl border border-ink-line py-2.5 text-sm text-[#ff4d5e]"
          onClick={() => confirm("¿Borrar todo el historial de este dispositivo?") && clear()}
        >
          Borrar todo
        </button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink-line bg-ink-panel py-3">
      <div className="font-display text-xl">{value.toLocaleString("es")}</div>
      <div className="text-[11px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
