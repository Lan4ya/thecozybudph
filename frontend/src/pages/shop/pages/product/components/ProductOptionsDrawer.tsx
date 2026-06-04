import { Drawer, DrawerContent } from "@/lib/ui/__shadcn__/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import React, { useState } from "react";
import "swiper/swiper.css";
import { useShallow } from "zustand/react/shallow";
import type { Product } from "@cozybud/schemas";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useProductSelectionStore } from "@/store/useProductSelectionStore";

type Mode = "addToCart" | "buyNow";

type Props = {
  onAddToCart: () => Promise<void>;
  productOptions: Product["options"];
  onBuyNow: () => Promise<void>;
  isLoading: boolean;
  mode: Mode;
};

export const ProductOptionsDrawer = ({
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

  const [msgCardActiveIndex, setMsgCardActiveIndex] = useState(0);

  const isFirstSlide = msgCardActiveIndex === 0;
  const isLastSlide = msgCardActiveIndex === cardMessages.length - 1;

  return (
    <Drawer open={drawerOpen} onOpenChange={(open) => setDrawerOpen(open)}>
      <DrawerContent
        className={cn(
          "h-[70vh] xl:h-[65vh] z-99 w-full rounded-t-xl border border-border/40",
        )}
      >
        <VisuallyHidden>
          <DialogTitle>Add to Cart</DialogTitle>
          <DialogDescription>
            Review your selected variant, adjust quantity, and confirm adding to
            cart.
          </DialogDescription>
        </VisuallyHidden>

        <div
          className={cn(
            "max-w-7xl w-full mx-auto px-5 pt-4 pb-42 flex-1 flex flex-col gap-4 h-full overflow-y-auto relative",
            // productOptions.length < 4 && "pb-42",
          )}
        >
          {/* Variant Summary */}
          {selectedVariant && (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold lg:text-lg pb-4">
                  Customize Your Arrangement
                </h3>

                {/* Option Selections */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 capitalize text-sm lg:text-base text-muted-foreground space-y-2">
                  {productOptions.map((option) => {
                    const selectedValues = selectedOptions[option.name] ?? [];

                    return (
                      <div key={option.name} className="space-y-2">
                        <div className="font-medium text-muted-foreground">
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
                    {cardMessages.map((msg, i) => (
                      <SwiperSlide key={i} className="">
                        <CardSlide
                          value={msg}
                          index={i}
                          onChange={setCardMessage}
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

              <div className="max-w-7xl mx-auto flex flex-col gap-6 fixed bottom-2 left-1/2 -translate-x-1/2 z-200 custom-container w-full bg-background ">
                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-muted-foreground text-sm lg:text-base font-medium">
                    Quantity
                  </label>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border rounded-md">
                      <button
                        onClick={decrement}
                        disabled={quantity <= 1}
                        className="w-8 h-8 text-sm hover:bg-accent rounded-md transition-colors disabled:opacity-40"
                      >
                        −
                      </button>

                      <div className="w-10 text-center text-sm  font-medium">
                        {quantity}
                      </div>
                      <button
                        onClick={increment}
                        className="w-8 h-8 rounded-md text-sm hover:bg-accent transition-colors"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="text-sm lg:text-base">
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
              </div>
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
        placeholder={`message for item ${index + 1}`}
        maxLength={600}
        className="min-h-[100px] resize-none text-sm w-full"
      />
    );
  },
);

CardSlide.displayName = "CardSlide";
