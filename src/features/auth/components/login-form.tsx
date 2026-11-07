"use client";

import { useState } from "react";
import { BrandMark } from "@/shared/components/brand-mark";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Escribe tu contraseña");
      return;
    }
    setLoading(true);
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setLoading(false);
    if (r?.ok) {
      location.href = "/";
      return;
    }
    const j = (await r?.json().catch(() => ({}))) as { error?: string } | undefined;
    setError(j?.error || "Sin conexión");
  };

  return (
    <div className="grid min-h-[calc(100dvh-48px)] place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <BrandMark size={88} />
        </div>
        <h1 className="bg-neon bg-clip-text font-display text-3xl font-extrabold tracking-[5px] text-transparent">SONORIX</h1>
        <p className="mb-8 font-display text-[11px] tracking-[5px] text-muted">
          TECH <span className="text-neon-magenta">//</span> SOUND
        </p>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Contraseña"
          className="w-full rounded-xl border border-ink-line bg-ink-raised px-4 py-3 outline-none focus:border-neon-violet"
        />
        {error && <p className="mt-2 text-left text-sm text-[#ff4d5e]">{error}</p>}
        <button disabled={loading} className="mt-4 w-full rounded-xl bg-neon py-3 font-semibold shadow-[0_0_24px_#7C4DFF55] disabled:opacity-60">
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
