import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/ui/__shadcn__/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { motion } from "framer-motion";
import { ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPriceCents } from "@/lib/utils/format";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import React, { useState, useEffect } from "react";
import "swiper/swiper.css";
import { useShallow } from "zustand/react/shallow";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";

type CardSlideProps = {
  value: string;
  index: number;
  onChange: (index: number, value: string) => void;
};

type CartItemDrawerProps = {
  cartItemId: string;
  onUpdateCartItem: (
    cardMessages: string[],
    quantity: number,
    newVariantId: string,
  ) => Promise<void>;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const CardSlide = React.memo(
  ({ value, index, onChange }: CardSlideProps) => {
    return (
      <Textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`message for item ${index + 1}`}
        maxLength={600}
        className="min-h-[100px] resize-none text-sm w-full"
      />
    );
  },
);

CardSlide.displayName = "CardSlide";

export const CartItemOptionsDrawer = ({
  cartItemId,
  onUpdateCartItem,
  onIncrement,
  onDecrement,
}: CartItemDrawerProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { getCartItem, setCartItems, increment, decrement } = useCartStore(
    useShallow((s) => ({
      getCartItem: s.getCartItem,
      setCartItems: s.setCartItems,
      increment: s.increment,
      decrement: s.decrement,
      cartItems: s.cartItems,
    })),
  );

  const cartItem = getCartItem(cartItemId);
  if (!cartItem) return null;

  const {
    data: productQueryData,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["productVariants", cartItem.product?.id],
    queryFn: () => ProductAPI.getById(cartItem.product?.id!),
    enabled: !!cartItem.product?.id && drawerOpen,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  });
  const { isAvailable, quantity, cardMessages, product } = cartItem;

  if (!isAvailable || !product) return null;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(product.variant.attributes);

  // // DEV:
  // useEffect(() => {
  //   if (isDev && drawerOpen) {
  //     console.log("productQueryData: ", productQueryData);
  //   }
  // }, [drawerOpen, productQueryData, isDev]);

  // Reset on close
  useEffect(() => {
    if (!drawerOpen) {
      setSelectedOptions(product.variant.attributes);
      setMsgCardActiveIndex(0);
    }
  }, [drawerOpen, product.variant.attributes]);

  const displaySelectedOptions = Object.entries(product.variant.attributes)
    .map(([_, value]) => `${value}`)
    .join(", ");

  const selectedVariant = React.useMemo(() => {
    if (!productQueryData) return;

    return (
      productQueryData.variants.find((variant) =>
        Object.entries(selectedOptions).every(
          ([key, value]) => variant.attributes[key] === value,
        ),
      ) ?? null
    );
  }, [productQueryData, selectedOptions]);

  const price = selectedVariant?.priceCents ?? 0;
  const subtotal = price * quantity;

  const [msgCardActiveIndex, setMsgCardActiveIndex] = useState(0);

  const isFirstSlide = msgCardActiveIndex === 0;
  const isLastSlide = msgCardActiveIndex === cardMessages.length - 1;

  useEffect(() => {
    if (msgCardActiveIndex >= quantity) {
      setMsgCardActiveIndex(quantity - 1);
    }
  }, [quantity, msgCardActiveIndex]);

  if (error && !isFetching) throw error;

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
      <DrawerTrigger asChild>
        <Button
          variant="minimal"
          className="text-[10px] border rounded-sm h-6 gap-1 px-2 w-fit max-w-40 md:max-w-64"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="truncate flex-1 text-left text-xs lg:text-sm">
            {displaySelectedOptions}
          </span>
          <ChevronUp className="size-4 shrink-0 opacity-80" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[80vh] xl:h-[70vh] w-full rounded-t-xl border border-border/40">
        <VisuallyHidden>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Review your selected variant, adjust quantity, and confirm adding to
            cart.
          </DialogDescription>
        </VisuallyHidden>

        {product.variant && (
          <div className="max-w-7xl w-full mx-auto px-5 pt-4 pb-42 flex-1 flex flex-col gap-4 overflow-y-auto relative">
            {/* Variant Summary */}
            <div className="flex gap-4 items-end pb-2">
              <ProductImage
                src={product.primaryImageUrl}
                className="size-20"
                roundedSize="md"
              />
              <div>
                <div className="font-medium text-accent">{product.name}</div>
                <div className="text-primary text-sm font-semibold">
                  {formatPriceCents(price)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option Selections - Grid Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 capitalize text-sm lg:text-base text-muted-foreground space-y-2">
                {product.options.map((option) => {
                  return (
                    <div key={option.name} className="space-y-2">
                      <div className="font-medium text-muted-foreground">
                        {option.name}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {option.values.map((v) => {
                          const isSelected = selectedOptions[option.name] === v;

                          return (
                            <Button
                              variant={isSelected ? "default" : "outline"}
                              key={v}
                              onClick={() =>
                                setSelectedOptions((prev) => {
                                  if (isSelected) return prev;

                                  return {
                                    ...prev,
                                    [option.name]: v,
                                  };
                                })
                              }
                            >
                              {v}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card Messages Carousel */}
            <div className="text-muted-foreground space-y-2 pt-4">
              <div className="flex items-end justify-between">
                <p className="text-sm lg:text-base font-medium">
                  Card Message{" "}
                  <span className="text-muted-foreground text-xs lg:text-sm">
                    (optional)
                  </span>
                </p>

                <div className="flex items-center gap-1.5 bg-background p-1 rounded-full border border-border/50">
                  <button
                    className="custom-prev size-5 rounded-full flex items-center justify-center transition-colors disabled:opacity-20 hover:bg-background"
                    disabled={isFirstSlide}
                  >
                    <ChevronLeft className="size-4" />
                  </button>

                  <span className="text-[11px] font-semibold min-w-8 text-center tabular-nums">
                    {msgCardActiveIndex + 1} / {cardMessages.length}
                  </span>

                  <button
                    className="custom-next size-5 rounded-full flex items-center justify-center transition-colors disabled:opacity-20 hover:bg-background"
                    disabled={isLastSlide}
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              <div className="relative w-full">
                <Swiper
                  key={cardMessages.length}
                  lazyPreloadPrevNext={1}
                  modules={[Navigation, A11y]}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".custom-prev",
                    nextEl: ".custom-next",
                  }}
                  onSlideChange={(swiper) =>
                    setMsgCardActiveIndex(swiper.activeIndex)
                  }
                >
                  {cardMessages.map((msg, msgIndex) => (
                    <SwiperSlide key={msgIndex} className="">
                      <CardSlide
                        value={msg}
                        index={msgIndex}
                        onChange={(index, value) =>
                          setCartItems((prev) =>
                            prev.map((item) =>
                              item.id === cartItemId
                                ? {
                                    ...item,
                                    cardMessages: item.cardMessages.map(
                                      (m, i) => (i === index ? value : m),
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="mt-1 flex justify-between items-center font-medium text-muted-foreground">
                  <p className="text-[11px] text-muted-foreground">
                    Included free with your flowers
                  </p>
                  <p className="text-[10px] lg:text-xs">
                    {cardMessages[msgCardActiveIndex]?.length ?? 0}/600
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col gap-6 fixed bottom-2 left-1/2 -translate-x-1/2 z-60 custom-container w-full bg-background">
              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-sm lg:text-base font-medium">
                  Quantity
                </label>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={onDecrement}
                      // disabled={quantity <= 1}
                      className="w-8 h-8 text-sm hover:bg-accent rounded-md transition-colors disabled:opacity-40"
                    >
                      −
                    </button>

                    <div className="w-10 text-center text-sm font-medium">
                      {quantity}
                    </div>

                    <button
                      onClick={onIncrement}
                      className="w-8 h-8 rounded-md text-sm hover:bg-accent transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-sm lg:text-base">
                    <div className="font-semibold text-primary">
                      {formatPriceCents(subtotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.div whileTap={{ scale: 0.98 }} className="">
                <Button
                  size="default"
                  variant="secondary"
                  className="w-full h-11 text-sm font-semibold"
                  onClick={async () => {
                    if (!selectedVariant) return;
                    await onUpdateCartItem(
                      cardMessages,
                      quantity,
                      selectedVariant.id,
                    );
                    setDrawerOpen(false);
                  }}
                  disabled={!selectedVariant}
                >
                  Confirm
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
