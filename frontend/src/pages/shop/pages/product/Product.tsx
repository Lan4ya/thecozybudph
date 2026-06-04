import Carousel from "./components/Carousel.tsx";
import { Link, useNavigate, useParams } from "react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductAPI } from "@/api/product.ts";
import {
  type Product as ProductType,
  addCartItemSchema,
  orderItemSchema,
} from "@cozybud/schemas";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useEffect, useMemo, useState } from "react";
import { Star, Heart, Shield } from "lucide-react";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils/cn";
import { BottomBar } from "./components/BottomBar.tsx";
import { formatPriceCents } from "@/lib/utils/format";
import z from "zod";
import isDev from "@/lib/utils/isDev";
import { useCartItemMutations } from "@/pages/cart/hooks/useCartMutations.ts";
import { useAuthStore } from "@/store/useAuthStore.ts";
import { useCheckoutStore } from "@/store/useCheckoutStore.ts";
import { useProductSelectionStore } from "@/store/useProductSelectionStore.ts";
import { Button } from "@/lib/ui/__shadcn__/button.tsx";

const Product = () => {
  return (
    <div className="max-w-7xl flex flex-col items-center gap-8 mb-25 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center lg:mt-8 justify-center lg:mx-auto lg:px-6">
      {/* <PersistSuspense fallback={<RouteLoaderFlowerSpinner />}> */}
      <ProductInner />
      {/* </PersistSuspense> */}
    </div>
  );
};

const ProductInner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isValidUUID = useMemo(() => {
    const parsedId = z.uuid().safeParse(id);
    if (!parsedId.success) return false;

    return true;
  }, [id]);

  const staleTime = 1000 * 60 * 5; // 5 mins

  const {
    data: product,
    isLoading: getProductLoading,
    error,
  } = useSuspenseQuery<ProductType | null>({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id || !isValidUUID) return Promise.resolve(null);
      return ProductAPI.getById(id);
    },
    staleTime,
    gcTime: staleTime * 2,
    meta: { persist: true },
  });

  const isSmScreenMax = useMediaQuery("(max-width: 518px)");

  const { addToast } = useToast();

  const [hearted, setHearted] = useState(false);

  const setSelectedOptions = useProductSelectionStore(
    (s) => s.setSelectedOptions,
  );

  const resetProductSelectionStore = useProductSelectionStore((s) => s.reset);

  const setCheckoutSource = useCheckoutStore((s) => s.setSource);
  const setCheckoutOrderItems = useCheckoutStore((s) => s.setOrderItemsUI);

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
      addToast("Invalid card message or quantity. Please try again.", "error");
      return;
    }

    await addToCartMutation.mutateAsync(result.data);
    resetProductSelectionStore(product.options);
  };

  const handleBuyNow = async () => {
    if (!product) return;

    const { quantity, selectedVariant, cardMessages } =
      useProductSelectionStore.getState();

    const result = orderItemSchema.safeParse({
      productId: product.id,
      variantId: selectedVariant?.id,
      quantity,
      cardMessages,
    });

    if (!result.success) {
      isDev && console.error(z.flattenError(result.error));
      addToast("Invalid card message or quantity. Please try again.", "error");
      return;
    }

    const orderItem = {
      ...result.data,
      name: product.name,
      priceCents: selectedVariant?.priceCents ?? product.minPriceCents,
      attributes: selectedVariant?.attributes ?? {},
      imageUrl: product.primaryImageUrl ?? "",
    };

    const sessionId = crypto.randomUUID();

    useCheckoutStore.getState().reset();
    setCheckoutSource("shop");
    setCheckoutOrderItems([orderItem]);
    // Since sessionId only is stored client side only (sessionStorage), we're gonna use this
    // to verify the user really created the checkout sessionId properly and not
    // just typed some random uuid in the url by comparing if param uuid === sessionId store
    useCheckoutStore.getState().setCheckout({ sessionId, status: "active" });
    navigate(`/checkout/${sessionId}`);

    // Reset selection configs
    resetProductSelectionStore(product.options);
  };

  const handleHeartClick = async () => {
    setHearted((prev) => !prev);
  };

  if (!product || !isValidUUID)
    return (
      <div className="w-full grid-cols-2 rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-primary/2 py-18 lg:py-24 text-center">
        <div className="mx-auto size-18 lg:size-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
          <AlertCircle className="text-primary/40 size-8 lg:size-10" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-primary">
          Product not found
        </h3>
        <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto">
          We coudn't find the product you're looking for
        </p>
        <Button asChild className="rounded-full px-6!">
          <a href="/shop">
            Go to Shop <ArrowRight />
          </a>
        </Button>
      </div>
    );

  if (error && !getProductLoading) throw error;

  return (
    <>
      {isSmScreenMax && (
        <Link
          to="/shop"
          className="p-2 rounded-md text-lg bg-black/60 text-white flex-center gap-2 hover:bg-black/45 absolute top-18 left-4"
        >
          <ArrowLeft />
        </Link>
      )}

      <Carousel urls={product.imageUrls} />

      <div className="space-y-6 max-[380px]:px-2! px-4 lg:px-0 max-w-2xl w-full">
        <div className="space-y-2 lg:space-y-8 border-b pb-6">
          {/* Product Header */}
          <div className="flex items-center justify-between">
            <div className="flex-center gap-4">
              <h1 className="text-lg lg:text-xl font-semibold text-foreground capitalize">
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
                  "size-7 lg:size-7 text-muted-foreground hover:text-red-600 transition-colors",
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-200 rounded-full">
              <Heart className="size-5 text-red-600" />
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
        </div>

        {/* Description */}
        <div className="space-y-4 py-6 ">
          <h3 className="font-semibold">Description</h3>
          <div className="first-letter:capitalize text-sm text-muted-foreground">
            {product.description ?? "No product description"}
          </div>
        </div>

        {/* CTA */}
        <BottomBar
          product={product}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          addToCartLoading={addToCartLoading}
        />
      </div>
    </>
  );
};

export default Product;
