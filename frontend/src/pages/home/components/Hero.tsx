import React, { useEffect, useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import TBC_1 from "@/assets/thecozybud/TCB_1.png";

const Hero: React.FC = () => {
  return (
    <section
      className="flex w-full items-center justify-center pb-10 lg:h-[550px] 2xl:h-[650px]"
      aria-label="Hero"
    >
      <HeroImage />
    </section>
  );
};

export const HeroImage = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = TBC_1;
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {!loaded && <Skeleton className="h-full w-full rounded-none bg-card" />}
      {loaded && (
        <img
          src={TBC_1}
          alt="hero"
          className="pointer-events-none select-none h-full w-full scale-150 opacity-100 transition-opacity duration-300 lg:scale-100 lg:object-cover"
          draggable="false"
          loading="eager"
        />
      )}

      <div className="absolute top-[60%] left-[7%] flex flex-col gap-1 text-white md:top-[60%] md:left[15%] lg:gap-6">
        <h1 className="font-ivy-ora-display font-bold text-accent max-[395px]:text-base text-xl sm:text-2xl md:text-3xl lg:text-4xl">
          BLOSSOMING ELEGANCE
        </h1>

        <p className="font-ivy-ora-display text-sm max-w-[230px] sm:text-[16px] sm:max-w-[270px] md:text-xl md:max-w-[390px]  lg:max-w-[490px]">
          Fresh, handcrafted arrangements designed to elevate everyday moments.
        </p>
      </div>
    </div>
  );
};

export default Hero;
