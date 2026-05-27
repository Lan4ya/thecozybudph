import { Button } from "@/lib/ui/__shadcn__/button";
import type { Product } from "@cozybud/schemas";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { OptionsDrawer } from "./OptionsDrawer";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";
import { cn } from "@/lib/utils/cn";

type BottomBarProps = {
  product: Product;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  onChatNow?: () => void;
  addToCartLoading: boolean;
};

export const BottomBar = (props: BottomBarProps) => {
  const [mode, setMode] = useState<"addToCart" | "buyNow">("addToCart");

  const selectedOptions = useProductSelectionStore((s) => s.selectedOptions);
  const setSelectedVariant = useProductSelectionStore(
    (s) => s.setSelectedVariant,
  );
  const selectedVariant = useProductSelectionStore((s) => s.selectedVariant);
  const setDrawerOpen = useProductSelectionStore((s) => s.setDrawerOpen);

  useEffect(() => {
    const variant = props.product.variants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([key, value]) => variant.attributes[key] === value,
      ),
    );
    setSelectedVariant(variant ?? null);
  }, [props.product.variants, selectedOptions, setSelectedVariant]);

  const handleBuyNowMode = () => {
    if (!selectedVariant) return;
    setMode("buyNow");
    setDrawerOpen(true);
  };

  const handleAddToCartMode = () => {
    if (!selectedVariant) return;
    setMode("addToCart");
    setDrawerOpen(true);
  };

  return (
    <>
      <OptionsDrawer
        onAddToCart={props.onAddToCart}
        onBuyNow={props.onBuyNow}
        productOptions={props.product.options}
        isLoading={mode === "addToCart" && props.addToCartLoading}
        mode={mode}
      />

      <BottomBarActions
        onChatNow={props.onChatNow}
        onAddToCart={handleAddToCartMode}
        onBuyNow={handleBuyNowMode}
        disabled={!selectedVariant}
      />
    </>
  );
};

type BottomBarActionsProps = {
  onChatNow?: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
};

export const BottomBarActions = ({
  onChatNow,
  onAddToCart,
  onBuyNow,
  disabled,
}: BottomBarActionsProps) => {
  return (
    <div
      className={cn(
        "w-full flex lg:gap-3 lg:mt-3",
        "fixed left-0 z-30 bottom-0 lg:static lg:left-auto lg:bottom-auto",
      )}
    >
      <Button
        onClick={onChatNow}
        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto bg-secondary border-r border-white/20"
        variant="secondary"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-medium">Chat Now</span>
      </Button>

      <Button
        onClick={onAddToCart}
        variant="secondary"
        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto bg-secondary"
        disabled={disabled}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-xs font-medium">
          {disabled ? "Select Options" : "Add to Cart"}
        </span>
      </Button>

      <Button
        onClick={onBuyNow}
        className="flex-[1.5] flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto bg-primary text-white"
        disabled={disabled}
      >
        <span className="text-xs font-medium">Buy Now</span>
      </Button>
    </div>
  );
};
