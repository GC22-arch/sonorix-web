"use client";

import { useEffect, useRef, type RefObject } from "react";

const BARS = 48;

/** Onda neón que se desplaza con el nivel del micrófono. */
export function Waveform({ levelRef, active }: { levelRef: RefObject<number>; active: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    const grad = g.createLinearGradient(0, 0, c.width, 0);
    grad.addColorStop(0, "#00E5FF");
    grad.addColorStop(0.55, "#7C4DFF");
    grad.addColorStop(1, "#FF2BD6");
    const hist = new Array<number>(BARS).fill(0);
    let raf = 0;
    const draw = () => {
      hist.push(active ? levelRef.current ?? 0 : hist[hist.length - 1] * 0.85);
      hist.shift();
      g.clearRect(0, 0, c.width, c.height);
      g.fillStyle = grad;
      const bw = c.width / BARS;
      hist.forEach((v, i) => {
        const shape = 0.55 + 0.45 * Math.sin((Math.PI * i) / (BARS - 1));
        const h = Math.max(3 * dpr, v * c.height * shape);
        g.beginPath();
        g.roundRect(i * bw + bw * 0.2, (c.height - h) / 2, bw * 0.6, h, 3 * dpr);
        g.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active, levelRef]);

  return <canvas ref={canvas} className="h-24 w-full max-w-md" aria-hidden />;
}
