"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Animates a number from 0 → value the first time it scrolls into view.
 * Falls back to the final value when JS motion is reduced — the reduced
 * state is read during render (useSyncExternalStore), never via setState
 * inside the effect.
 */
export function CountUp({
  value,
  duration = 1200,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const reducedMotion = useReducedMotion();

  // Reduced motion: show the final number immediately, skip the animation.
  const shown = reducedMotion ? value : display;

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(value * eased));
          if (progress < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, reducedMotion]);

  return (
    <span ref={ref}>
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
