import { useState } from "react";

import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import TBC_1 from "@/assets/thecozybud/TCB_1.png";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import { cn } from "@/lib/utils/cn";

const Hero = () => {
  const { registerSentinel, visibleMap } = useAnimateOnView();

  return (
    <section
      className="flex w-full items-center justify-center h-[400px] lg:pb-6 lg:h-[550px] 2xl:h-[650px]"
      aria-label="Hero"
    >
      <HeroImage registerSentinel={registerSentinel} visibleMap={visibleMap} />
    </section>
  );
};

export const HeroImage = ({
  registerSentinel,
  visibleMap,
}: {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative h-full w-full overflow-hidden")}>
      {!loaded && <Skeleton className="h-full w-full rounded-none bg-card" />}
      <img
        ref={registerSentinel}
        src={TBC_1}
        alt="hero"
        className={cn(
          "pointer-events-none select-none h-full w-full transition-all duration-700 ease-out object-cover",
          loaded && visibleMap[0]
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-6",
        )}
        loading="eager"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />

      <HeroText registerSentinel={registerSentinel} visibleMap={visibleMap} />
    </div>
  );
};

export const HeroText = ({
  registerSentinel,
  visibleMap,
}: {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
}) => {
  return (
    <div
      ref={(el) => registerSentinel(el)}
      className={cn(
        "absolute top-[60%] left-[7%] flex flex-col gap-1 text-white md:top-[60%] md:left-[7%] lg:gap-6 transition-all duration-900 ease-out",
        visibleMap[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      )}
    >
      <h1 className="font-ivy-ora-display font-medium lg:font-bold text-accent max-[395px]:text-base text-[22px] sm:text-2xl md:text-3xl lg:text-5xl">
        BLOSSOMING ELEGANCE
      </h1>
      <p className="font-ivy-ora-display max-w-[280px] fold-semibold sm:text-lg md:text-xl lg:text-3xl sm:max-w-[270px] md:max-w-[390px] lg:max-w-[540px]">
        Fresh, handcrafted arrangements designed to elevate everyday moments.
      </p>
    </div>
  );
};

export default Hero;
