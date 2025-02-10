'use client'

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  isActive: boolean;
}

export default function ConfettiEffect({ isActive }: ConfettiEffectProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isActive && !isPlaying) {
      setIsPlaying(true);
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      let interval: NodeJS.Timeout | null = null;

      const run = () => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          setIsPlaying(false);
          if (interval) {
            clearInterval(interval);
          }
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          spread: 60,
          origin: { x: 0.5, y: 0.8 },
          ticks: 300,
        });
      };

      interval = setInterval(run, 250);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [isActive, isPlaying]);

  return null;
} 