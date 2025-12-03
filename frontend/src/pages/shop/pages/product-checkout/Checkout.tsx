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
import { useEffect, useState } from "react";

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
  const [isValidUUID, setIsValidUUID] = useState(false);

  // validate UUID format before making the API call
  useEffect(() => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    setIsValidUUID(uuidRegex.test(id || ""));
  }, [id]);

  const {
    data: product,
    isLoading,
    error,
  } = useSuspenseQuery<ProductData | null>({
    queryKey: ["product", id],
    queryFn: () => {
      if (!isValidUUID || !id) return Promise.resolve(null);
      return ProductAPI.getById(id);
    },
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
  });
  const smScreenAndBelow = useMediaQuery("(max-width: 518px)");

  if (!product || !isValidUUID)
    return (
      <div className="mt-40 text-center text-lg lg:text-xl text-muted-foreground">
        Product Not Found
      </div>
    );
  if (error && !isLoading) throw error;

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
