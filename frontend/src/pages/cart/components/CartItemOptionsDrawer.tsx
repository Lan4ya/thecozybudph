import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/ui/__shadcn__/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
import { formatPriceCents } from "@/lib/utils/format";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import React, { useState, useEffect } from "react";
import "swiper/swiper.css";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useShallow } from "zustand/react/shallow";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";

type CartItemDrawerProps = {
  cartItemId: string;
  onUpdateCartItem: (
    cardMessages: string[],
    quantity: number,
    newVariantId: string,
  ) => Promise<void>;
};

export const CartItemOptionsDrawer = ({
  cartItemId,
  onUpdateCartItem,
}: CartItemDrawerProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    getCartItem,
    setCartItems,
    increment,
    decrement,
    // selectedOptions,
    // setSelectedOption,
  } = useCartStore(
    useShallow((s) => ({
      // selectedOptions: s.selectedOptions,
      // setSelectedOption: s.setSelectedOption,
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
    queryKey: ["productVariants", cartItem.product.id],
    queryFn: () => ProductAPI.getById(cartItem.product.id!),
    enabled: !!cartItem.product.id && drawerOpen,
    meta: { persist: false },
  });
  const { quantity, cardMessages, product } = cartItem;

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(product.variant.attributes);

  // DEV:
  useEffect(() => {
    if (drawerOpen) {
      console.log("productQueryData: ", productQueryData);
    }
  }, [drawerOpen, productQueryData]);

  // reset on close
  useEffect(() => {
    if (!drawerOpen) {
      setSelectedOptions(product.variant.attributes);
      setActiveIndex(0);
    }
  }, [drawerOpen, product.variant.attributes]);

  const displaySelectedOptions = Object.values(product.variant.attributes).join(
    ", ",
  );

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

  const [activeIndex, setActiveIndex] = useState(0);

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === cardMessages.length - 1;

  useEffect(() => {
    if (activeIndex >= quantity) {
      setActiveIndex(quantity - 1);
    }
  }, [quantity, activeIndex]);

  if (error && !isFetching) throw error;

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
      {/* @ts-ignore */}
      <DrawerTrigger asChild>
        <Button
          variant="minimal"
          className="text-xs border rounded-sm h-6 gap-1 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="truncate min-w-0">{displaySelectedOptions}</span>
          <ChevronUp className="size-4 shrink-0" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="w-full rounded-t-xl border border-border/40 pb-8">
        <VisuallyHidden>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Review your selected variant, adjust quantity, and confirm adding to
            cart.
          </DialogDescription>
        </VisuallyHidden>

        <div className="overflow-y-auto px-5 pt-6 space-y-6">
          {product.variant && (
            <>
              {/* Variant Summary */}
              <div className="space-y-9">
                <div className="flex gap-4 items-end">
                  <ProductImage
                    src={product.primaryImageUrl}
                    className="size-25"
                    roundedSize="md"
                  />

                  <div>
                    <div>{product.name}</div>
                    <div className="text-primary text-sm font-semibold">
                      {formatPriceCents(price)}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-4">
                  {product.options.map((option) => {
                    return (
                      <div key={option.name} className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {option.name}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {option.values.map((v) => {
                            const isSelected =
                              selectedOptions[option.name] === v;

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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Card Message (optional)
                </p>

                <div className="relative w-full overflow-hidden">
                  <Swiper
                    lazyPreloadPrevNext={1}
                    modules={[Navigation, A11y]}
                    slidesPerView={1}
                    navigation={{
                      prevEl: ".custom-prev",
                      nextEl: ".custom-next",
                    }}
                    onSlideChange={(swiper) =>
                      setActiveIndex(swiper.activeIndex)
                    }
                  >
                    {cardMessages.map((msg, msgIndex) => (
                      <SwiperSlide key={msgIndex}>
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

                  {/* Nav Buttons */}
                  <button
                    className={`custom-prev absolute left-2 top-1/2 -translate-y-1/2 z-30 size-10 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                      isFirstSlide
                        ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
                        : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
                    }`}
                    disabled={isFirstSlide}
                  >
                    ‹
                  </button>

                  <button
                    className={`custom-next absolute right-2 top-1/2 -translate-y-1/2 z-30 size-10 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-200 shadow-lg border ${
                      isLastSlide
                        ? "bg-white/10 border-white/10 text-white/30 cursor-not-allowed"
                        : "bg-white/20 hover:bg-white/30 border-white/30 hover:scale-110 text-white"
                    }`}
                    disabled={isLastSlide}
                  >
                    ›
                  </button>

                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Included free with your flowers</span>
                    <span>{cardMessages[activeIndex]?.length ?? 0}/600</span>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-md">
                    <button
                      onClick={() => decrement(cartItemId)}
                      disabled={quantity <= 1}
                      className="w-8 h-8 text-sm hover:bg-accent transition-colors disabled:opacity-40"
                    >
                      −
                    </button>

                    <div className="w-10 text-center text-sm font-medium">
                      {quantity}
                    </div>

                    <button
                      onClick={() => increment(cartItemId)}
                      className="w-8 h-8 text-sm hover:bg-accent transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-sm">
                    <div className="font-semibold text-primary">
                      {formatPriceCents(subtotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  size="default"
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
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

type CardSlideProps = {
  value: string;
  index: number;
  onChange: (index: number, value: string) => void;
};

export const CardSlide = React.memo(
  ({ value, index, onChange }: CardSlideProps) => {
    return (
      <Textarea
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        placeholder={`message for flower ${index + 1}`}
        maxLength={600}
        className="min-h-[120px] resize-none text-sm w-full"
      />
    );
  },
);

CardSlide.displayName = "CardSlide";
