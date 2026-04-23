import ProductCard from "@/components/products/ProductCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product";

const Recommendations = () => {
  const { data, error, isFetching } = useSuspenseQuery({
    queryKey: ["homepage-product-recommendations"],
    queryFn: () => ProductAPI.queryListItems({ perPage: 6 }),
  });

  if (error && !isFetching) throw error;

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="custom-container mx-auto flex w-full max-w-[1600px] flex-col gap-5 md:gap-6"
    >
      <div className="space-y-2">
        <h2 id="recommendations-heading" className="text-2xl lg:text-3xl">
          Our Best Sellers
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          Timeless favorites crafted to impress, delight, and never go out of
          style.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-8 2xl:gap-10">
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
