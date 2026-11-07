"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DictationPrefs, HistoryItem } from "../types";

const MAX_HISTORY = 200;

interface DictationStore {
  prefs: DictationPrefs;
  history: HistoryItem[];
  setPrefs: (patch: Partial<DictationPrefs>) => void;
  add: (item: HistoryItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}

// El historial vive en el dispositivo: no hay base de datos que mantener ni filtrar.
export const useDictationStore = create<DictationStore>()(
  persist(
    (set) => ({
      prefs: { language: "es", cleanup: false, style: "natural", vocabulary: "", autoCopy: true },
      history: [],
      setPrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),
      add: (item) => set((s) => ({ history: [item, ...s.history].slice(0, MAX_HISTORY) })),
      remove: (id) => set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clear: () => set({ history: [] }),
    }),
    { name: "sonorix-web" },
  ),
);
