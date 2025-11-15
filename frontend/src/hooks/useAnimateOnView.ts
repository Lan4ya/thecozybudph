import { useEffect, useRef, useState } from "react";

export const useAnimateOnView = (threshold = 0.1) => {
  const [visibleMap, setVisibleMap] = useState<boolean[]>([]);
  const sentinelRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = sentinelRefs.current.indexOf(
            entry.target as HTMLElement,
          );
          if (index === -1) return;

          if (entry.isIntersecting) {
            setVisibleMap((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        });
      },
      { threshold },
    );

    sentinelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [threshold]);

  const registerSentinel = (el: HTMLElement | null) => {
    if (el && !sentinelRefs.current.includes(el)) {
      sentinelRefs.current.push(el);
      setVisibleMap((prev) => [...prev, false]);
    }
  };

  return { registerSentinel, visibleMap };
};
