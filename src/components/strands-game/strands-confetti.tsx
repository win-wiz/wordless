"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

type StrandsConfettiProps = {
  active: boolean;
};

const CONFETTI_DURATION_MS = 3000;
const CONFETTI_INTERVAL_MS = 250;

export default function StrandsConfetti({ active }: StrandsConfettiProps) {
  const playedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      playedRef.current = false;
      return;
    }
    if (playedRef.current) {
      return;
    }
    playedRef.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const animationEnd = Date.now() + CONFETTI_DURATION_MS;

    const fire = () => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return;
      }

      const particleCount = Math.round(50 * (timeLeft / CONFETTI_DURATION_MS));
      const baseOptions = {
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      } as const;

      confetti({
        ...baseOptions,
        origin: { x: 0.1 + Math.random() * 0.2, y: Math.random() - 0.2 },
      });
      confetti({
        ...baseOptions,
        origin: { x: 0.7 + Math.random() * 0.2, y: Math.random() - 0.2 },
      });
    };

    fire();
    const interval = window.setInterval(() => {
      if (Date.now() >= animationEnd) {
        window.clearInterval(interval);
        return;
      }
      fire();
    }, CONFETTI_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [active]);

  return null;
}
