import { useEffect, useRef, useState } from "react";

export type RegisterSentinel = (ref: HTMLElement | null) => void;

export const useAnimateOnView = (threshold = 0.1) => {
  const [visibleMap, setVisibleMap] = useState<boolean[]>([]);
  const sentinelRefs = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sentinelRefs.current.indexOf(
              entry.target as HTMLElement,
            );
            if (index !== -1) {
              setVisibleMap((prev) => {
                if (prev[index]) return prev;
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
              // Once visible, we can stop observing this element
              observerRef.current?.unobserve(entry.target);
            }
          }
        });
      },
      { threshold },
    );

    sentinelRefs.current.forEach((el) => {
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [threshold]);

  const registerSentinel: RegisterSentinel = (el) => {
    if (el && !sentinelRefs.current.includes(el)) {
      sentinelRefs.current.push(el);
      const index = sentinelRefs.current.length - 1;
      setVisibleMap((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });

      // Observe the newly registered element immediately if observer exists
      if (observerRef.current) {
        observerRef.current.observe(el);
      }
    }
  };

  return { registerSentinel, visibleMap };
};
