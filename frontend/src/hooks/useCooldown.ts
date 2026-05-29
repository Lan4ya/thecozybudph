import { useState, useEffect, useCallback } from "react";

interface UseCooldownResult {
  countdown: number;
  isLocked: boolean;
  startCooldown: () => void;
}

export function useCooldown(
  cooldownSeconds: number,
  storageKey: string,
): UseCooldownResult {
  // Extract storage reading into lazy initial state function
  const [countdown, setCountdown] = useState<number>(() => {
    if (typeof window === "undefined") return 0;

    const targetTime = localStorage.getItem(storageKey);
    if (!targetTime) return 0;

    const remaining = Math.ceil((parseInt(targetTime, 10) - Date.now()) / 1000);
    if (remaining > 0) return remaining;

    localStorage.removeItem(storageKey);
    return 0;
  });

  // Initiate lockout
  const startCooldown = useCallback(() => {
    const expiresAt = Date.now() + cooldownSeconds * 1000;
    localStorage.setItem(storageKey, expiresAt.toString());
    setCountdown(cooldownSeconds);
  }, [storageKey, cooldownSeconds]);

  // Ticker logic
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          localStorage.removeItem(storageKey);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, storageKey]);

  return {
    countdown,
    isLocked: countdown > 0,
    startCooldown,
  };
}
