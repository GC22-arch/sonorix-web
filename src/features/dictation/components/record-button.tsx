"use client";

import { useRef } from "react";
import type { RecorderState } from "../types";

const HOLD_MS = 450;

interface Props {
  state: RecorderState;
  onStart: () => void;
  onStop: () => void;
}

/** Toque = empezar/terminar. Mantener pulsado = hablar y soltar. */
export function RecordButton({ state, onStart, onStop }: Props) {
  const pressedAt = useRef(0);

  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    pressedAt.current = performance.now();
    if (state === "idle") onStart();
    else if (state === "recording") {
      pressedAt.current = 0;
      onStop();
    }
  };
  const up = () => {
    if (pressedAt.current && state === "recording" && performance.now() - pressedAt.current > HOLD_MS) onStop();
    pressedAt.current = 0;
  };

  const base = "relative grid h-44 w-44 place-items-center rounded-full transition-transform active:scale-95 select-none touch-none";
  const look =
    state === "recording"
      ? "bg-[#ff4d5e] animate-pulseRing"
      : state === "processing"
        ? "bg-ink-raised"
        : "bg-neon shadow-[0_0_0_2px_#00E5FF33,0_18px_60px_#7C4DFF66]";

  return (
    <button
      type="button"
      aria-label={state === "recording" ? "Terminar" : "Dictar"}
      className={`${base} ${look}`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onContextMenu={(e) => e.preventDefault()}
      disabled={state === "processing"}
    >
      <svg viewBox="0 0 24 24" className={`h-16 w-16 fill-white ${state === "processing" ? "animate-spin" : ""}`}>
        {state === "recording" ? (
          <rect x="6" y="6" width="12" height="12" rx="2.5" />
        ) : state === "processing" ? (
          <path d="M12 2a10 10 0 1 0 10 10h-2.5A7.5 7.5 0 1 1 12 4.5V2Z" />
        ) : (
          <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-2.08A7 7 0 0 0 19 12h-2Z" />
        )}
      </svg>
    </button>
  );
}
