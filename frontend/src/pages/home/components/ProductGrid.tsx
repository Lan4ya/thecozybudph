import ProductCard from "@/components/products/ProductCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import type { ProductData } from "@TheCozyBud/schema";

const ProductGrid = () => {
  const { data, error, isFetching } = useSuspenseQuery<ProductData[]>({
    queryKey: ["homepage-product-recommendations"],
    queryFn: () => ProductAPI.getAll({ perPage: 12 }),
  });

  if (error && !isFetching) throw error;

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="container max-w-[1600px] mx-auto"
    >
      <h2
        id="recommendations-heading"
        className="text-lg font-semibold lg:text-3xl text-center mb-6 lg:mb-12"
      >
        Recommendations For You
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 xl:gap-8 2xl:gap-10 ">
        {data.map((d) => (
          <ProductCard
            key={d.id}
            productId={d.id}
            name={d.name}
            imageUrl={d.imageUrls[0]}
            price={d.price}
          />
        ))}
      </div>

      <div className="mx-auto py-8 flex justify-center">
        <button
          className="px-6 py-2 rounded-md"
          style={{
            background: "transparent",
            border: "1px dashed var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          View all
        </button>
      </div>
    </section>
  );
};

export default ProductGrid;
