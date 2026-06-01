import { useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { cn } from "@/lib/utils/cn";
import { ASSETS } from "@/lib/constants/assets";

interface HeroSectionProps {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
}

const HeroSection = ({ registerSentinel, visibleMap }: HeroSectionProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="relative h-[60vh] lg:h-[70vh] w-full overflow-hidden">
      {!loaded && (
        <Skeleton className="absolute inset-0 rounded-none bg-card" />
      )}
      <img
        ref={registerSentinel}
        src={ASSETS.TCB_1}
        alt="The Cozy Bud"
        className={cn(
          "pointer-events-none select-none h-full w-full object-cover transition-all duration-900 ease-out",
          loaded && visibleMap[0] ? "opacity-100" : "opacity-0",
        )}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Content */}
      <div
        ref={(el) => registerSentinel(el)}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 transition-all duration-900 ease-out",
          visibleMap[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <h1 className="font-ivy-ora-display text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
          The Cozy Bud
        </h1>
        <p className="font-ivy-ora-display text-lg md:text-xl lg:text-2xl max-w-2xl">
          Bringing beauty and joy through fresh flowers
        </p>
      </div>
    </section>
  );
};

export default HeroSection;

