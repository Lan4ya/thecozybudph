import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product";
import { cn } from "@/lib/utils/cn";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { useAuthStore } from "@/store/useAuthStore";

const Recommendations = () => {
  const sectionRef = useRef<HTMLElement>(null);
  // Fetch when the section is 800px away from the viewport to ensure data is ready
  const isInView = useInView(sectionRef, {
    once: true,
    margin: "0px 0px 800px 0px",
  });

  const staleTime = 1000 * 60 * 5; // 5 mins

  const { data, error, isFetching } = useQuery({
    queryKey: ["homepage-product-recommendations"],
    queryFn: () => ProductAPI.queryProducts({ perPage: 10 }),
    enabled: isInView,
    meta: { persist: true },
    staleTime,
    gcTime: staleTime * 2,
  });

  const session = useAuthStore((s) => s.session);
  const isLg = useIsLgScreenMin();
  const { registerSentinel, visibleMap } = useAnimateOnView();

  if (error && !isFetching) throw error;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="recommendations-heading"
      className={cn(
        "custom-container py-18 lg:py-24 max-w-[1420px] mx-auto flex w-full flex-col gap-5 md:gap-6",
        // if there's session a component below this component (MembersOnlySection) disappears and so we'll pass the margin here
        session && "mb-24",
      )}
    >
      <div
        ref={registerSentinel}
        className={cn(
          "space-y-6 lg:text-right transition-all duration-1000 ease-out",
          visibleMap[0]
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0",
        )}
      >
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent/70">
          Editor's Picks
        </p>

        {/* Heading */}
        <h2
          id="recommendations-heading"
          className="font-ivy-ora-display text-4xl leading-tight text-accent lg:text-5xl"
        >
          Our most loved floral pieces
        </h2>

        {/* Description */}
        <p className="max-w-[52ch] lg:ml-auto text-lg text-muted-foreground">
          A refined selection of arrangements our customers return to—designed
          to impress, crafted to last, and suited for any meaningful occasion.
        </p>
      </div>

      <div
        className={cn(
          "mx-auto grid w-full grid-cols-2 gap-x-6 gap-y-16 min-[600px]:grid-cols-3 md:grid-cols-4 pb-32",
          "lg:flex lg:flex-wrap lg:justify-center lg:gap-x-12 lg:gap-y-24 lg:px-10 lg:pt-12",
        )}
      >
        {!data && isFetching
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-full max-w-[180px] mx-auto space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))
          : data?.map((d, i) => {
              // Organic variables: rot, y-offset, x-offset (lg only)
              const styles = [
                { rot: -1.5, y: 0, x: 0, tape: true },
                { rot: 2, y: 30, x: 15, tape: true },
                { rot: -1, y: 10, x: -10, tape: true },
                { rot: 1.5, y: -20, x: 5, tape: true },
                { rot: -2, y: 40, x: -20, tape: true },
                { rot: 1, y: 5, x: 10, tape: true },
                { rot: -1.8, y: 25, x: -5, tape: true },
                { rot: 2.2, y: -10, x: 20, tape: true },
                { rot: -0.5, y: 15, x: -15, tape: true },
                { rot: 1.2, y: 35, x: 0, tape: true },
              ];

              const s = styles[i % styles.length];
              const isLeftColumn = i % 2 === 0;
              const cardVisible = visibleMap[i + 1];

              return (
                <div
                  key={d.id}
                  ref={registerSentinel}
                  style={
                    {
                      "--rot": `${s.rot}deg`,
                      "--y": `${isLg ? s.y : 0}px`,
                      "--x": `${isLg ? s.x : 0}px`,
                      transform: `rotate(var(--rot)) translate(var(--x), var(--y))`,
                      transitionDelay: `${(i % 4) * 50}ms`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "relative w-full max-w-[180px] mx-auto group transition-all duration-1000 ease-out hover:!transform-none hover:scale-110 hover:z-30",
                    cardVisible
                      ? "translate-x-0 translate-y-0 opacity-100"
                      : cn(
                          "translate-y-8 opacity-0 pointer-events-none",
                          isLeftColumn ? "-translate-x-8" : "translate-x-8",
                        ),
                  )}
                >
                  {/* Realistic Washi Tape Accent */}
                  {s.tape && (
                    <div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 w-14 h-7 bg-primary/25 backdrop-blur-[1px] -rotate-2 z-40 pointer-events-none border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `linear-gradient(to right, transparent, rgba(255,255,255,0.1) 50%, transparent)`,
                        clipPath:
                          "polygon(2% 10%, 98% 5%, 100% 90%, 95% 95%, 5% 100%, 0% 85%)",
                      }}
                    />
                  )}

                  {/* Always Visible Specimen Tag */}
                  <div className="absolute -bottom-5 -right-1 z-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-100">
                    <span className="font-back-to-black text-2xl text-primary/60 drop-shadow-sm">
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <ProductCard
                    productId={d.id}
                    name={d.name}
                    imageUrl={d.primaryImageUrl}
                    price={d.minPriceCents}
                  />
                </div>
              );
            })}
      </div>
    </section>
  );
};

export default Recommendations;
