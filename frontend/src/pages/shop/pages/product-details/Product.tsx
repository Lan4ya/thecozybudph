// import React, { useEffect, useRef, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
import Carousel from "./Carousel";
import { useParams } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  fetchProductById,
  type ProductPayloadFromDB,
} from "@/lib/supabase/products";
import PersistSuspense from "@/components/PersistSuspense";
// import { ProductDetailSkeleton } from "../../skeletons/ProductDetailSkeleton";
import { RouteLoader } from "@/components/RouteLoaderFallback";
import ProductDetails from "./Details";

export const Product = () => {
  return (
    <PersistSuspense fallback={<RouteLoader />}>
      <ProductDetailContent />
      {/* <ProductDetailContent initialData={initialData} /> */}
    </PersistSuspense>
  );
};

type Props = {
  initialIndex?: number;
};

const ProductDetailContent = (
  {
    // initialData,
    // initialIndex = 0,
  }: Props,
) => {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useSuspenseQuery<ProductPayloadFromDB>({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
  });

  return (
    <div className="mx-auto gap-4 mb-8 lg:gap-15 flex flex-col w-full lg:flex-row flex-center">
      <Carousel urls={product.image_urls} />

      {/* Details section */}

      <div className="w-full container">
        <ProductDetails product={product} />
      </div>
    </div>
  );
};
