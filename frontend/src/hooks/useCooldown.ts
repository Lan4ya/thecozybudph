import { useState, useEffect, useCallback, useMemo } from "react";

interface UseCooldownOptions {
  durationSeconds?: number;
}

interface UseCooldownResult {
  onCooldown: boolean;
  timeRemaining: string;
  countdown: number;
  startCooldown: (customDuration?: number) => void;
  resetCooldown: () => void;
}

/**
 * A client-side only cooldown hook that persists to localStorage.
 *
 * @param storageKey Unique key for localStorage (e.g., 'cooldown:password_reset:user@example.com')
 * @param options Configuration options
 */
export function useActionCooldown(
  storageKey: string,
  options: UseCooldownOptions = {},
): UseCooldownResult {
  const { durationSeconds = 120 } = options;

  // Initialize from localStorage
  const getInitialEndsAt = (): number | null => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    const endsAt = parseInt(saved, 10);
    return isNaN(endsAt) ? null : endsAt;
  };

  const [endsAt, setEndsAt] = useState<number | null>(getInitialEndsAt());
  const [, setTick] = useState(0);

  const calculateRemaining = useCallback(() => {
    if (!endsAt) return 0;
    const remainingMs = endsAt - Date.now();
    return Math.max(0, Math.ceil(remainingMs / 1000));
  }, [endsAt]);

  const countdown = calculateRemaining();

  // Tick every second
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const startCooldown = useCallback(
    (customDuration?: number) => {
      const duration = (customDuration ?? durationSeconds) * 1000;
      const newEndsAt = Date.now() + duration;
      localStorage.setItem(storageKey, newEndsAt.toString());
      setEndsAt(newEndsAt);
    },
    [storageKey, durationSeconds],
  );

  const resetCooldown = useCallback(() => {
    localStorage.removeItem(storageKey);
    setEndsAt(null);
  }, [storageKey]);

  const timeRemaining = useMemo(() => {
    if (countdown <= 0) return "0:00";
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    const unit = countdown >= 60 ? "m" : "s";
    return `${minutes}:${seconds.toString().padStart(2, "0")}${unit}`;
  }, [countdown]);

  return {
    onCooldown: countdown > 0,
    timeRemaining,
    countdown,
    startCooldown,
    resetCooldown,
  };
}
