import { Drawer, DrawerContent } from "@/lib/ui/__shadcn__/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import React, { useState, useEffect } from "react";
import "swiper/swiper.css";
import { useShallow } from "zustand/react/shallow";
import type { Product } from "@TheCozyBud/schemas";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

type Mode = "addToCart" | "buyNow";

type Props = {
  onAddToCart: () => Promise<void>;
  productOptions: Product["options"];
  onBuyNow: () => Promise<void>;
  isLoading: boolean;
  mode: Mode;
};

export const OptionsDrawer = ({
  onAddToCart,
  onBuyNow,
  productOptions,
  isLoading,
  mode,
}: Props) => {
  const {
    quantity,
    selectedVariant,
    increment,
    decrement,
    cardMessages,
    setCardMessage,
    selectedOptions,
    setSelectedOptions,
    drawerOpen,
    setDrawerOpen,
  } = useProductSelectionStore(
    useShallow((s) => ({
      quantity: s.quantity,
      selectedVariant: s.selectedVariant,
      increment: s.increment,
      decrement: s.decrement,
      cardMessages: s.cardMessages,
      setCardMessage: s.setCardMessage,
      selectedOptions: s.selectedOptions,
      setSelectedOptions: s.setSelectedOptions,
      drawerOpen: s.drawerOpen,
      setDrawerOpen: s.setDrawerOpen,
      reset: s.reset,
    })),
  );

  const getButtonText = () => {
    if (isLoading)
      return mode === "addToCart" ? "Adding to Cart..." : "Processing...";
    return mode === "addToCart" ? "Add to Cart" : "Buy Now";
  };

  const handleAction = async () => {
    if (mode === "addToCart") {
      await onAddToCart();
    } else {
      await onBuyNow();
    }
    setDrawerOpen(false);
  };

  const selectOption = (optionName: string, value: string) => {
    const currentValue = selectedOptions[optionName];

    if (value === currentValue) return;

    setSelectedOptions({
      ...selectedOptions,
      [optionName]: value,
    });
  };

  const total =
    selectedVariant?.priceCents != null
      ? selectedVariant.priceCents * quantity
      : 0;

  const [activeIndex, setActiveIndex] = useState(0);

  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === cardMessages.length - 1;

  useEffect(() => {
    if (activeIndex >= quantity) {
      setActiveIndex(quantity - 1);
    }
  }, [quantity, activeIndex]);

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
      <DrawerContent className="w-full rounded-t-xl border border-border/40 pb-8">
        <VisuallyHidden>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Review your selected variant, adjust quantity, and confirm adding to
            cart.
          </DialogDescription>
        </VisuallyHidden>

        <div className="max-w-7xl w-full mx-auto px-5 pt-6 space-y-6">
          {/* Variant Summary */}
          {selectedVariant && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold">Customize Arrangement</h3>

                {/* Option Selections */}
                <div className="text-sm text-muted-foreground space-y-4">
                  {productOptions.map((option) => {
                    const selectedValues = selectedOptions[option.name] ?? [];

                    return (
                      <div key={option.name} className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {option.name}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {option.values.map((value) => {
                            const isSelected = selectedValues.includes(value);

                            return (
                              <Button
                                variant={isSelected ? "default" : "outline"}
                                key={value}
                                onClick={() => selectOption(option.name, value)}
                              >
                                {value}
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
                    {cardMessages.map((msg, i) => (
                      <SwiperSlide key={i}>
                        <CardSlide
                          value={msg}
                          index={i}
                          onChange={setCardMessage}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Card Msg Nav Buttons */}
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
                      onClick={decrement}
                      disabled={quantity <= 1}
                      className="w-8 h-8 text-sm hover:bg-accent transition-colors disabled:opacity-40"
                    >
                      −
                    </button>

                    <div className="w-10 text-center text-sm font-medium">
                      {quantity}
                    </div>
                    <button
                      onClick={increment}
                      className="w-8 h-8 text-sm hover:bg-accent transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Total */}
                  <div className="text-sm">
                    <div className="font-semibold text-primary">
                      {formatPriceCents(total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.div whileTap={{ scale: 0.98 }} className="">
                <Button
                  size="default"
                  className="w-full h-11 text-sm font-semibold"
                  onClick={handleAction}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner /> {getButtonText()}
                    </>
                  ) : (
                    getButtonText()
                  )}
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
