import { useEffect, useState } from "react";

type MediaQueryEntry = {
  mql: MediaQueryList;
  matches: boolean;
  listeners: Set<React.Dispatch<React.SetStateAction<boolean>>>;
  handler: (e: MediaQueryListEvent | MediaQueryList) => void;
};

const mediaQueryStore = new Map<string, MediaQueryEntry>();

// Call the base function itself if you want a customized breakpoint
// or use the helper functions below for common breakpoints.

export function useMediaQuery(
  query: string,
  options?: { defaultMatches?: boolean },
): boolean | undefined {
  const isClient = typeof window !== "undefined";

  const initial = (() => {
    if (isClient) {
      const cached = mediaQueryStore.get(query);
      if (cached) return cached.matches;
      return window.matchMedia(query).matches;
    }
    // server: return provided defaultMatches if given, otherwise undefined
    return options?.defaultMatches;
  })();

  const [matches, setMatches] = useState<boolean | undefined>(initial);

  useEffect(() => {
    if (!isClient) return;

    let entry = mediaQueryStore.get(query);

    if (!entry) {
      const mql = window.matchMedia(query);
      const listeners = new Set<
        React.Dispatch<React.SetStateAction<boolean>>
      >();

      // handler: normalize both old (MediaQueryList) and new (MediaQueryListEvent) shapes
      const handler = (e: MediaQueryListEvent | MediaQueryList) => {
        // determine matches value
        const currentMatches =
          // MediaQueryListEvent has .matches, older API may pass MediaQueryList directly
          "matches" in e ? e.matches : (e as MediaQueryList).matches;

        // update shared state
        const stored = mediaQueryStore.get(query);
        if (stored) stored.matches = currentMatches;

        // notify subscribers
        for (const fn of listeners) {
          try {
            fn(currentMatches);
          } catch {
            // swallow listener errors to avoid breaking other listeners
          }
        }
      };

      // register listener with fallback for legacy browsers
      if (mql.addEventListener) {
        mql.addEventListener("change", handler as EventListener);
      } else if ((mql as any).addListener) {
        (mql as any).addListener(handler as EventListener);
      }

      entry = {
        mql,
        matches: mql.matches,
        listeners,
        handler,
      };

      mediaQueryStore.set(query, entry);
    }

    // subscribe this hook
    entry.listeners.add(
      setMatches as React.Dispatch<React.SetStateAction<boolean>>,
    );

    // sync immediately
    setMatches(entry.matches);

    return () => {
      const stored = mediaQueryStore.get(query);
      if (!stored) return;

      stored.listeners.delete(
        setMatches as React.Dispatch<React.SetStateAction<boolean>>,
      );

      if (stored.listeners.size === 0) {
        // remove listener with same fallback
        if (stored.mql.removeEventListener) {
          stored.mql.removeEventListener(
            "change",
            stored.handler as EventListener,
          );
        } else if ((stored.mql as any).removeListener) {
          (stored.mql as any).removeListener(stored.handler as EventListener);
        }
        mediaQueryStore.delete(query);
      }
    };
  }, [query, isClient]);

  return matches;
}

// Helper Functions for common breakpoints.

// The sizes set in these helper fn's tries to match tailwind's breakpoints:
// sm	640px	Small screens (phones)
// md	768px	Medium (tablets)
// lg	1024px	Large (laptops)
export const useIsSmallScreen = () => !!useMediaQuery("(max-width: 639px)");
export const useIsMediumScreen = () =>
  !!useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
export const useIsLargeScreen = () => !!useMediaQuery("(min-width: 1024px)");
export const useIsExtraLargeScreen = () =>
  !!useMediaQuery("(min-width: 1280px)");
