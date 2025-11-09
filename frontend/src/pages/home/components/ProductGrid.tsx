import ProductCard from "@/components/products/ProductCard";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  type ProductPayloadFromDB,
} from "@/lib/supabase/products";
// const ProductCard = ({ name, imageUrl, price }: Props) => {
//   return (
//     <div className="group bg-card text-card-foreground rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer active:scale-95">
//       <div className="relative overflow-hidden">
//         <ProductImage
//           src={imageUrl}
//           className="aspect-square group-hover:scale-105 group-active:scale-110 transition-transform duration-300 rounded-b-none"
//         />
//       </div>
//
//       <div className="p-2 space-y-1 text-center">
//         <h3 className="font-medium text-sm lg:text-base line-clamp-2 leading-tight text-foreground">
//           {name}
//         </h3>
//         <div className="font-medium lg:text-lg text-primary">
//           {price.toLocaleString("en-PH", {
//             style: "currency",
//             currency: "PHP",
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

const ProductGrid = () => {
  const { data, error, isFetching } = useSuspenseQuery<ProductPayloadFromDB[]>({
    queryKey: ["homepagerproduct-recommendations"],
    queryFn: () => fetchProducts({ perPage: 12 }),
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
            imageUrl={d.image_urls[0]}
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
