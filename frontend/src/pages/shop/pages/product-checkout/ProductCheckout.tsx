// import React, { useEffect, useRef, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
import Carousel from "./Carousel";
import { useParams } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/services/api/products";
import type { ProductData } from "@TheCozyBud/schema";
import PersistSuspense from "@/components/PersistSuspense";
// import { ProductDetailSkeleton } from "../../skeletons/ProductDetailSkeleton";
import { RouteLoader } from "@/components/RouteLoaderFallback";
import ProductDetails from "./Details";

export const ProductCheckout = () => {
  return (
    <div className="mx-auto gap-4 mb-8 flex flex-col items-center lg:gap-15 lg:flex-row  lg:items-start justify-center">
      <PersistSuspense fallback={<RouteLoader />}>
        <ProductDetailContent />
        {/* <ProductDetailContent initialData={initialData} /> */}
      </PersistSuspense>
    </div>
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
  const { data: product } = useSuspenseQuery<ProductData>({
    queryKey: ["product", id],
    queryFn: () => ProductAPI.getById(id!),
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
  });

  return (
    <>
      <Carousel urls={product.imageUrls} />
      <ProductDetails product={product} />
    </>
  );
};
