import Carousel from "./Carousel";
import { Link, useParams } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import type { ProductData } from "@TheCozyBud/schema";
import PersistSuspense from "@/components/PersistSuspense";
import { RouteLoader } from "@/components/RouteLoaderFallback";
import ProductDetails from "./Details";
import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const ProductCheckout = () => {
  return (
    <div className="max-w-7xl flex flex-col items-center gap-8 mb-25 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start lg:mt-8 justify-center lg:mx-auto lg:px-6! max-[380px]:px-2!">
      <PersistSuspense fallback={<RouteLoader />}>
        <ProductDetailContent />
      </PersistSuspense>
    </div>
  );
};

const ProductDetailContent = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useSuspenseQuery<ProductData>({
    queryKey: ["product", id],
    queryFn: () => ProductAPI.getById(id!),
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
  });
  const smScreenAndBelow = useMediaQuery("(max-width: 518px)");

  return (
    <>
      <Carousel urls={product.imageUrls} />
      <ProductDetails product={product} />
      {smScreenAndBelow && (
        <Link
          to="/shop"
          className="p-2 rounded-md text-lg bg-black/50 text-white flex-center gap-2 hover:bg-black/45 absolute top-18 left-4"
        >
          <ArrowLeft className="size-5" />
        </Link>
      )}
    </>
  );
};
