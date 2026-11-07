"use client";

import { useDictationStore } from "../store/dictation-store";
import type { CleanupStyle, Language } from "../types";

const LANGS: [Language, string][] = [
  ["es", "Español"], ["en", "Inglés"], ["pt", "Portugués"], ["fr", "Francés"], ["it", "Italiano"], ["de", "Alemán"], ["", "Autodetectar"],
];

export function SettingsPanel() {
  const { prefs, setPrefs } = useDictationStore();
  const field = "w-full rounded-xl border border-ink-line bg-ink-raised px-3 py-2.5 outline-none focus:border-neon-violet";

  return (
    <div className="w-full max-w-lg space-y-4">
      <label className="block">
        <span className="mb-1.5 block font-semibold">Idioma</span>
        <select className={field} value={prefs.language} onChange={(e) => setPrefs({ language: e.target.value as Language })}>
          {LANGS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>
      <Toggle
        title="Limpieza con IA"
        desc="Quita muletillas, arregla puntuación y arma listas."
        checked={prefs.cleanup}
        onChange={(v) => setPrefs({ cleanup: v })}
      />
      {prefs.cleanup && (
        <label className="block">
          <span className="mb-1.5 block font-semibold">Estilo</span>
          <select className={field} value={prefs.style} onChange={(e) => setPrefs({ style: e.target.value as CleanupStyle })}>
            <option value="natural">Natural</option>
            <option value="formal">Formal</option>
            <option value="casual">Casual</option>
          </select>
        </label>
      )}
      <Toggle title="Copiar automáticamente" desc="Al terminar, el texto queda en el portapapeles." checked={prefs.autoCopy} onChange={(v) => setPrefs({ autoCopy: v })} />
      <label className="block">
        <span className="mb-1.5 block font-semibold">Vocabulario propio</span>
        <textarea
          className={`${field} min-h-20`}
          value={prefs.vocabulary}
          maxLength={600}
          placeholder="Nombres y términos que uses: Sonorix, Orbita, Supabase…"
          onChange={(e) => setPrefs({ vocabulary: e.target.value })}
        />
      </label>
      <p className="text-xs text-muted">
        Comandos de voz: “nueva línea”, “nuevo párrafo”, “punto y aparte”, “dos puntos”.
      </p>
      <button
        className="w-full rounded-xl border border-ink-line py-2.5 text-sm text-muted"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          location.href = "/login";
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function Toggle({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-ink-line bg-ink-panel p-3">
      <span>
        <b className="block">{title}</b>
        <span className="text-xs text-muted">{desc}</span>
      </span>
      <input type="checkbox" className="h-5 w-5 accent-[#FF2BD6]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
