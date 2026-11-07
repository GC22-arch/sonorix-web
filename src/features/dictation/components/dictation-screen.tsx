"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/shared/components/brand-mark";
import { useRecorder } from "../hooks/use-recorder";
import { UnauthorizedError, copyText, transcribe } from "../services/transcribe";
import { useDictationStore } from "../store/dictation-store";
import type { DictationResult } from "../types";
import { HistoryList } from "./history-list";
import { RecordButton } from "./record-button";
import { ResultCard } from "./result-card";
import { SettingsPanel } from "./settings-panel";
import { Waveform } from "./waveform";

type Tab = "dictar" | "historial" | "ajustes";

export function DictationScreen() {
  const [tab, setTab] = useState<Tab>("dictar");
  const [result, setResult] = useState<DictationResult | null>(null);
  const [hint, setHint] = useState("Toca para dictar · mantén pulsado para hablar y soltar · espacio en la compu");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { state, setState, elapsed, error, levelRef, start, stop } = useRecorder();
  const { prefs, add } = useDictationStore();

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2000);
  }, []);

  useEffect(() => {
    if (error) setHint(error);
  }, [error]);

  const begin = async () => {
    setHint("Escuchando… toca para terminar");
    await start();
  };

  const finish = async () => {
    const rec = await stop();
    if (!rec) return;
    if (rec.duration < 0.4) {
      setState("idle");
      setHint("Muy corto, intenta de nuevo");
      return;
    }
    setHint("Transcribiendo…");
    try {
      const r = await transcribe(rec.blob, prefs);
      if (!r.text) {
        setHint("No se escuchó voz");
        return;
      }
      setResult(r);
      add({ ...r, id: crypto.randomUUID(), createdAt: Date.now(), duration: rec.duration });
      const copied = prefs.autoCopy && (await copyText(r.text));
      setHint(copied ? "✓ Copiado al portapapeles" : "Listo · toca Copiar");
      navigator.vibrate?.([10, 40, 10]);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        location.href = "/login";
        return;
      }
      setHint(e instanceof Error ? e.message : "Sin conexión");
    } finally {
      setState("idle");
    }
  };

  // En la compu: barra espaciadora para empezar/terminar.
  const handlers = useRef({ begin, finish, state, tab });
  handlers.current = { begin, finish, state, tab };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code !== "Space" || e.repeat || el.closest("input, textarea, select, button")) return;
      const h = handlers.current;
      if (h.tab !== "dictar") return;
      e.preventDefault();
      if (h.state === "idle") h.begin();
      else if (h.state === "recording") h.finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const mm = Math.floor(elapsed / 60);
  const ss = String(Math.floor(elapsed % 60)).padStart(2, "0");

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-48px)] max-w-2xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+14px)]">
      <header className="flex items-center gap-3">
        <BrandMark size={34} />
        <div className="leading-tight">
          <div className="bg-neon bg-clip-text font-display text-lg font-extrabold tracking-[3px] text-transparent">SONORIX</div>
          <div className="font-display text-[10px] tracking-[4px] text-muted">
            TECH <span className="text-neon-magenta">//</span> SOUND
          </div>
        </div>
      </header>

      <nav className="mt-5 grid grid-cols-3 rounded-xl border border-ink-line bg-ink-panel p-1 text-sm">
        {(["dictar", "historial", "ajustes"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg py-2 capitalize ${tab === t ? "bg-ink-raised text-white shadow-[inset_0_-2px_0_#7C4DFF]" : "text-muted"}`}
          >
            {t}
          </button>
        ))}
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        {tab === "dictar" && (
          <>
            <Waveform levelRef={levelRef} active={state === "recording"} />
            <RecordButton state={state} onStart={begin} onStop={finish} />
            <div className="h-5 font-mono text-sm text-muted">{state === "recording" ? `${mm}:${ss}` : ""}</div>
            <p className={`min-h-5 text-center text-sm ${error ? "text-[#ff4d5e]" : "text-muted"}`}>{hint}</p>
            {result && (
              <ResultCard result={result} onCopy={async () => showToast((await copyText(result.text)) ? "✓ Copiado" : "No se pudo copiar")} />
            )}
          </>
        )}
        {tab === "historial" && <HistoryList onToast={showToast} />}
        {tab === "ajustes" && <SettingsPanel />}
      </main>

      <div
        className={`pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-ink-line bg-ink-raised px-4 py-2.5 text-sm transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}
