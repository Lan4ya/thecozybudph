import React, { useEffect, useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import TBC_1 from "@/assets/thecozybud/TCB_1.png";

const Hero: React.FC = () => {
  return (
    <section
      className="w-full lg:h-[550px] 2xl:h-[650px] flex items-center justify-center pb-10"
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
    <>
      {!loaded && <Skeleton className="w-full h-full bg-card rounded-none" />}
      {loaded && (
        <img
          src={TBC_1}
          alt=""
          className="lg:object-cover w-full h-full transition-opacity duration-300 opacity-100"
          loading="eager"
        />
      )}
    </>
  );
};

export default Hero;
