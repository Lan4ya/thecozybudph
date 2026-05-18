import ProductCard from "@/components/products/ProductCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils/cn";

const Recommendations = () => {
  const { data, error, isFetching } = useSuspenseQuery({
    queryKey: ["homepage-product-recommendations"],
    queryFn: () => ProductAPI.queryProducts({ perPage: 10 }),
  });

  const session = useAuthStore((s) => s.session);

  if (error && !isFetching) throw error;

  return (
    <section
      aria-labelledby="recommendations-heading"
      className={cn(
        "custom-container py-18 lg:py-24 max-w-[1420px] mx-auto flex w-full flex-col gap-5 md:gap-6",
        // if there's session a component below this component (MembersOnlySection) disappears and so we'll pass the margin here
        session && "mb-24",
      )}
    >
      <div className="space-y-6 lg:text-right">
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

      <div className="mx-auto grid w-full grid-cols-2 gap-4 min-[600px]:grid-cols-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8 2xl:gap-10">
        {data.map((d) => (
          <ProductCard
            key={d.id}
            productId={d.id}
            name={d.name}
            imageUrl={d.primaryImageUrl}
            price={d.minPriceCents}
          />
        ))}
      </div>
    </section>
  );
};

export default Recommendations;
