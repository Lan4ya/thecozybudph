import { useEffect, useState } from "react";

import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import TCB_1 from "@/assets/thecozybud/TCB_1.png";
import TCB_1_Cropped from "@/assets/thecozybud/TCB_1_Cropped.jpg";
import TCB_3 from "@/assets/thecozybud/TCB_3.png";
import TCB_5 from "@/assets/thecozybud/TCB_5.jpg";
import TCB_6 from "@/assets/thecozybud/TCB_6.jpg";
import TCB_7 from "@/assets/thecozybud/TCB_7.jpg";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import { cn } from "@/lib/utils/cn";
import { useIsLargeScreen } from "@/hooks/useMediaQuery";

const imgSrcs = [TCB_1_Cropped, TCB_6, TCB_7, TCB_5, TCB_3];

const Hero = () => {
  const { registerSentinel, visibleMap } = useAnimateOnView();
  const isLgScreen = useIsLargeScreen();

  return (
    <section
      className="flex w-full items-center justify-center  lg:mb-6 lg:h-screen"
      aria-label="Hero"
    >
      {isLgScreen ? (
        <DesktopHeroInner
          registerSentinel={registerSentinel}
          visibleMap={visibleMap}
        />
      ) : (
        <MobileHeroInner
          registerSentinel={registerSentinel}
          visibleMap={visibleMap}
        />
      )}
    </section>
  );
};

const TRANSITION_MS = 1550;

const MobileHeroInner = ({
  registerSentinel,
  visibleMap,
}: {
  registerSentinel: (ref: HTMLElement | null) => void;
  visibleMap: boolean[];
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const slides = [imgSrcs[imgSrcs.length - 1], ...imgSrcs, imgSrcs[0]];
  const [index, setIndex] = useState(1); // start at first real slide
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => i + 1);
    }, 6_000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (index === slides.length - 1) {
      // reached ghost FIRST
      setTimeout(() => {
        setTransition(false);
        setIndex(1); // real FIRST
      }, TRANSITION_MS); // match CSS transition duration
    }
  }, [index]);

  useEffect(() => {
    if (!transition) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransition(true);
        });
      });
    }
  }, [transition]);

  if (index === 0) {
    // reached ghost LAST
    setTimeout(() => {
      setTransition(false);
      setIndex(slides.length - 2);
    }, TRANSITION_MS);
  }

  // const realIndex =
  //   index === 0 ? slides.length - 2 : index === slides.length - 1 ? 1 : index;

  return (
    <div className=" text-center flex-center flex-col gap-15 mt-30">
      <div
        ref={registerSentinel}
        className={cn(
          "transition-all duration-900 ease-out flex flex-col gap-1 lg:gap-6 ",
          visibleMap[0]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <h1 className="font-ivy-ora-display font-semibold  text-accent text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl">
          BLOSSOMING ELEGANCE
        </h1>

        <p className="font-ivy-ora-display max-w-[350px] fold-semibold sm:text-lg md:text-xl lg:text-xl 2xl:text-2xl sm:max-w-[270px] md:max-w-[390px] lg:max-w-[540px]">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
          quod dolore voluptates. Amet, veritatis officia. Tenetur voluptate
          {/* Fresh, handcrafted arrangements designed to elevate everyday moments. */}
        </p>
      </div>

      {/* HERO IMG*/}
      <div
        ref={registerSentinel}
        className={cn(
          "transition-all duration-900 ease-out h-full w-full overflow-hidden",
          visibleMap[1]
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8",
        )}
      >
        <div
          className={`flex transition-transform h-full duration-[${TRANSITION_MS}ms] `}
          style={{
            transform: `translateX(-${index * 100}%)`,
            transitionDuration: transition ? `${TRANSITION_MS}ms` : "0ms",
          }}
        >
          {slides.map((src, i) => (
            <div key={i} className="relative w-full h-full shrink-0 aspect-7/6">
              {!imgLoaded && <Skeleton className="h-full w-full bg-card" />}
              <img
                src={src}
                loading={i === index ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DesktopHeroInner = ({
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
        src={TCB_1}
        alt="hero"
        className={cn(
          "pointer-events-none select-none h-full w-full transition-all duration-900 ease-out object-cover",
          loaded && visibleMap[0]
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-8",
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
        "absolute top-[40%] left-[7%] flex flex-col gap-1 text-white md:top-[45%] md:left-[7%] lg:left-[4%] lg:top-[40%] lg:gap-6 transition-all duration-900 ease-out",
        visibleMap[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      <h1 className="font-ivy-ora-display font-medium lg:font-bold text-accent max-[395px]:text-base text-[22px] sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl">
        BLOSSOMING ELEGANCE
      </h1>
      <p className="font-ivy-ora-display max-w-[280px] fold-semibold sm:text-lg md:text-xl lg:text-xl 2xl:text-2xl sm:max-w-[270px] md:max-w-[390px] lg:max-w-[540px]">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        quod dolore voluptates. Amet, veritatis officia. Tenetur voluptate
        {/* Fresh, handcrafted arrangements designed to elevate everyday moments. */}
      </p>
    </div>
  );
};

export default Hero;
