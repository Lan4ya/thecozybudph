import ProductCard from "@/components/products/ProductCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import type { ProductData } from "@TheCozyBud/schema";

const ProductRecommendations = () => {
  const { data, error, isFetching } = useSuspenseQuery<ProductData[]>({
    queryKey: ["homepage-product-recommendations"],
    queryFn: () => ProductAPI.getAll({ perPage: 6, noDummyProduct: true }),
  });

  if (error && !isFetching) throw error;

  return (
    <section
      aria-labelledby="recommendations-heading"
      className="custom-container flex flex-col gap-6 max-w-[1600px] mx-auto"
    >
      <div>
        <h2 id="recommendations-heading" className="text-2xl lg:text-3xl">
          Our Best Sellers
        </h2>
        <p>
          Timeless favorites crafted to impress, delight, and never go out of
          style.
        </p>
      </div>

      <div className="w-full max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 xl:gap-8 2xl:gap-10 ">
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

      {/* <div className="mx-auto flex justify-center"> */}
      {/*   <button */}
      {/*     className="px-6 py-2 rounded-md" */}
      {/*     style={{ */}
      {/*       background: "transparent", */}
      {/*       border: "1px dashed var(--color-border)", */}
      {/*       color: "var(--color-muted-foreground)", */}
      {/*     }} */}
      {/*   > */}
      {/*     View all in shop */}
      {/*   </button> */}
      {/* </div> */}
    </section>
  );
};

export default ProductRecommendations;
