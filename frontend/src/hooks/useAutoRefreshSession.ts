import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import isDev from "@/lib/utils/isDev";

type Timeout = ReturnType<typeof setTimeout>;

export function useAutoRefreshSession(idleMs = 5 * 60 * 1000) {
  const [active, setActive] = useState(true);

  const idleTimer = useRef<Timeout | null>(null);
  const refreshTimer = useRef<Timeout | null>(null);

  const resetActivity = () => {
    setActive(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setActive(false), idleMs);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetActivity));

    resetActivity();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  const scheduleRefresh = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) return;

    const expiresAtMs = (data.session.expires_at ?? 0) * 1000;
    const now = Date.now();
    let delay = expiresAtMs - now - 30_000; // refresh 30s before expiry
    delay = Math.max(delay, 0);

    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      await supabase.auth.getSession(); // triggers refresh
      isDev && console.log("refreshed token: ", data.session?.expires_in);
      scheduleRefresh();
    }, delay);
  };

  useEffect(() => {
    if (!active) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      return;
    }

    scheduleRefresh();

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [active]);

  return active;
}
