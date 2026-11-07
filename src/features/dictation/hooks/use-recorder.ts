"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RecorderState } from "../types";

const MIMES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

function pickMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  return MIMES.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

export interface Recording {
  blob: Blob;
  duration: number;
}

/** Graba con MediaRecorder y expone el nivel de audio (0..1) para el visualizador. */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const levelRef = useRef(0);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const t0 = useRef(0);
  const resolver = useRef<((r: Recording | null) => void) | null>(null);

  const teardown = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (timer.current) clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    levelRef.current = 0;
  }, []);

  useEffect(() => teardown, [teardown]);

  const start = useCallback(async () => {
    if (rec.current?.state === "recording") return;
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setError("Permite el micrófono para dictar");
      return;
    }
    const mime = pickMime();
    const chunks: Blob[] = [];
    const mr = new MediaRecorder(stream.current, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      const duration = (performance.now() - t0.current) / 1000;
      teardown();
      resolver.current?.({ blob: new Blob(chunks, { type: mr.mimeType || "audio/webm" }), duration });
      resolver.current = null;
    };
    mr.start(250);
    rec.current = mr;
    t0.current = performance.now();
    setElapsed(0);
    setState("recording");
    timer.current = setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 250);
    navigator.vibrate?.(15);

    try {
      ctx.current = ctx.current ?? new AudioContext();
      await ctx.current.resume();
      const analyser = ctx.current.createAnalyser();
      analyser.fftSize = 1024;
      ctx.current.createMediaStreamSource(stream.current).connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const loop = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += ((v - 128) / 128) ** 2;
        const db = 20 * Math.log10(Math.sqrt(sum / buf.length) + 1e-6);
        levelRef.current = Math.max(0, Math.min(1, (db + 52) / 40));
        raf.current = requestAnimationFrame(loop);
      };
      loop();
    } catch {
      /* el visualizador es opcional */
    }
  }, [teardown]);

  const stop = useCallback((): Promise<Recording | null> => {
    const mr = rec.current;
    if (!mr || mr.state !== "recording") return Promise.resolve(null);
    setState("processing");
    navigator.vibrate?.(10);
    return new Promise((resolve) => {
      resolver.current = resolve;
      mr.stop();
    });
  }, []);

  return { state, setState, elapsed, error, setError, levelRef, start, stop };
}
