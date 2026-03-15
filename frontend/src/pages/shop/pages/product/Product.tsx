import Carousel from "./components/Carousel.tsx";
import { Link, useParams } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product.ts";
import {
  type Product as ProductType,
  addCartItemSchema,
} from "@TheCozyBud/types";
import PersistSuspense from "@/components/PersistSuspense";
import { RouteLoaderSpinner } from "@/components/RouteLoaderSpinner";
import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Shield } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";
import { BottomBar } from "./components/BottomBar.tsx";
import { formatPriceCents } from "@/lib/utils/format";
import z from "zod";
import { useProductSelectionStore } from "@/features/shop/store/useProductSelectionStore.tsx";
import isDev from "@/lib/utils/isDev";
import { useCartItemMutations } from "@/features/cart/hooks/useCartMutations.ts";
import { useAuthStore } from "@/store/useAuthStore.tsx";

const Product = () => {
  return (
    <div className="max-w-7xl flex flex-col items-center gap-8 mb-25 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start lg:mt-8 justify-center lg:mx-auto lg:px-6">
      <PersistSuspense fallback={<RouteLoaderSpinner />}>
        <ProductInner />
      </PersistSuspense>
    </div>
  );
};

const ProductInner = () => {
  const { id } = useParams();

  const isValidUUID = useMemo(() => {
    if (!id) return false;

    const parsedId = z.uuid().safeParse(id);
    if (!parsedId.success) return false;

    return true;
  }, [id]);

  const {
    data: product,
    isLoading: getProductLoading,
    error,
  } = useSuspenseQuery<ProductType | null>({
    queryKey: ["product", id],
    queryFn: () => {
      if (!isValidUUID || !id) return Promise.resolve(null);
      return ProductAPI.getById(id);
    },
    staleTime: 1 * 60 * 60 * 1000,
    gcTime: 1 * 60 * 60 * 1000,
  });

  const smScreenAndBelow = useMediaQuery("(max-width: 518px)");

  const { addToast } = useToast();
  const session = useAuthStore((s) => s.session);

  const [hearted, setHearted] = useState(false);

  const setSelectedOptions = useProductSelectionStore(
    (s) => s.setSelectedOptions,
  );

  const reset = useProductSelectionStore((s) => s.reset);

  useEffect(() => {
    if (!product) return;

    const initial: Record<string, string> = {};

    product.options.forEach((opt) => {
      if (opt.values.length > 0) {
        initial[opt.name] = opt.values[0];
      }
    });

    setSelectedOptions(initial);
  }, [product, setSelectedOptions]);

  const { addToCartMutation } = useCartItemMutations();
  const addToCartLoading = addToCartMutation.isPending;

  const handleAddToCart = async () => {
    if (!product) return;

    if (!session) {
      addToast("Please log in first to continue.", "error");
      return;
    }

    const { quantity, selectedVariant, cardMessages } =
      useProductSelectionStore.getState();

    const result = addCartItemSchema.safeParse({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      cardMessages,
    });

    if (!result.success) {
      isDev && console.error(z.flattenError(result.error));
      addToast("Something wen't wrong. Please try again later.", "error");
      return;
    }

    await addToCartMutation.mutateAsync(result.data);
    reset(product.options);
  };

  const handleHeartClick = async () => {
    setHearted((prev) => !prev);
  };

  if (!product || !isValidUUID)
    return (
      <div className="absolute inset-0 z-10 flex-center mb-70 text-lg lg:text-xl text-muted-foreground">
        Product Not Found
      </div>
    );

  if (error && !getProductLoading) throw error;

  return (
    <>
      {smScreenAndBelow && (
        <Link
          to="/shop"
          className="p-2 rounded-md text-lg bg-black/60 text-white flex-center gap-2 hover:bg-black/45 absolute top-18 left-4"
        >
          <ArrowLeft />
        </Link>
      )}

      {/* Product Carousel */}
      <Carousel urls={product.imageUrls} />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-[380px]:px-2! px-4 lg:px-0 max-w-2xl w-full"
      >
        <div className="space-y-2 border-b pb-6">
          {/* Product Header */}
          <div className="flex items-center justify-between">
            <div className="flex-center gap-4">
              <h1 className="text-lg lg:text-xl font-semibold text-foreground">
                {product.name}
              </h1>

              <span className="text-sm text-green-600 font-medium">
                In Stock
              </span>
            </div>

            <button
              onClick={handleHeartClick}
              className="p-2  rounded-full transition-colors"
            >
              <Heart
                className={cn(
                  "w-6 h-6 text-muted-foreground hover:text-red-600 transition-colors",
                  hearted && "fill-red-600 text-red-400",
                )}
              />
            </button>
          </div>

          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl lg:text-2xl font-bold text-primary">
                {formatPriceCents(product.minPriceCents)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get vouchers on orders above ₱1,999
            </p>
          </div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-200 rounded-full">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Made With Love</div>
              <div className="text-xs text-muted-foreground">
                Carefully arranged by hand
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Personalized Touch</div>
              <div className="text-xs text-muted-foreground">
                Choose colors & add a custom message
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Long-lasting Floral</div>
              <div className="text-xs text-muted-foreground">
                Dried & preserved flowers
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4 py-6 "
        >
          <h3 className="font-semibold">Description</h3>
          <div className="text-sm text-muted-foreground">
            {product.description ?? "No product description"}
          </div>
        </motion.div>
      </motion.div>

      {/* CTA */}
      <BottomBar
        product={product}
        onAddToCart={handleAddToCart}
        addToCartLoading={addToCartLoading}
      />
    </>
  );
};

export default Product;
