import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/ui/__shadcn__/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { formatPriceCents } from "@/lib/utils/format";
import { useProductSelectionStore } from "@/store/useProductSelectionStore";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation } from "swiper/modules";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { useRef, useState, useEffect } from "react";
import "swiper/swiper.css";
import type { Product } from "@TheCozyBud/types";

type Props = { onAddToCart: () => void; productOptions: Product["options"] };

export const AddToCartDrawer = ({ onAddToCart, productOptions }: Props) => {
  const quantity = useProductSelectionStore((s) => s.quantity);
  const selectedVariant = useProductSelectionStore((s) => s.selectedVariant);
  const increment = useProductSelectionStore((s) => s.increment);
  const decrement = useProductSelectionStore((s) => s.decrement);
  const cardMessages = useProductSelectionStore((s) => s.cardMessages);
  const setCardMessage = useProductSelectionStore((s) => s.setCardMessage);

  const selectedOptions = useProductSelectionStore((s) => s.selectedOptions);

  const setSelectedOptions = useProductSelectionStore(
    (s) => s.setSelectedOptions,
  );

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

  const swiperRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Adjust activeIndex if quantity decreases
  useEffect(() => {
    if (activeIndex >= quantity) setActiveIndex(quantity - 1);
  }, [quantity]);

  return (
    <Drawer>
      {/* @ts-ignore */}
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-secondary"
          disabled={!selectedVariant}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">
            {selectedVariant ? "Add to Cart" : "Select Options"}
          </span>
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
          {/* Variant Summary */}
          {selectedVariant && (
            <div className="space-y-3">
              <h3 className="font-semibold">Customize Arrangement</h3>
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
          )}

          {/* Card Messages Carousel */}
          {selectedVariant && quantity >= 1 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Card Message</p>
              <p className="text-xs text-muted-foreground">
                Swipe to add message for other flowers
              </p>
              <div className="w-full overflow-hidden">
                <Swiper
                  modules={[Navigation, A11y]}
                  slidesPerView={1}
                  onSwiper={(swiper) => (swiperRef.current = swiper)}
                  onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                >
                  {cardMessages.map((msg, i) => (
                    <SwiperSlide key={i}>
                      <Textarea
                        spellCheck={false}
                        value={msg}
                        onChange={(e) => setCardMessage(i, e.target.value)}
                        placeholder={`Message for flower ${i + 1}`}
                        maxLength={600}
                        className="min-h-[120px] resize-none text-sm w-full"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>Included free with your flowers</span>
                  <span>{cardMessages[activeIndex].length}/600</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          {selectedVariant && (
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
                <div className="text-sm">
                  <div className="font-semibold text-foreground">
                    {formatPriceCents(total)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          {selectedVariant && (
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button
                size="default"
                className="w-full h-11 text-sm font-semibold"
                onClick={onAddToCart}
              >
                Add to Cart
              </Button>
            </motion.div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
