import { Button } from "@/lib/ui/__shadcn__/button";
import type { Product } from "@TheCozyBud/types";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductOptionsDrawer } from "./ProductOptionsDrawer";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";

type BottomBarProps = {
  product: Product;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  onChatNow?: () => void;
  addToCartLoading: boolean;
  buyNowLoading: boolean;
};

export const BottomBar = ({
  product,
  onAddToCart,
  onChatNow,
  onBuyNow,
  addToCartLoading,
  buyNowLoading,
}: BottomBarProps) => {
  const [mode, setMode] = useState<"addToCart" | "buyNow">("addToCart");

  const selectedOptions = useProductSelectionStore((s) => s.selectedOptions);
  const setSelectedVariant = useProductSelectionStore(
    (s) => s.setSelectedVariant,
  );
  const selectedVariant = useProductSelectionStore((s) => s.selectedVariant);
  const setDrawerOpen = useProductSelectionStore((s) => s.setDrawerOpen);

  useEffect(() => {
    const variant = product.variants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([key, value]) => variant.attributes[key] === value,
      ),
    );
    setSelectedVariant(variant ?? null);
  }, [product.variants, selectedOptions]);

  const handleBuyNowMode = async () => {
    if (!selectedVariant) return;
    setMode("buyNow");
    setDrawerOpen(true);
  };

  const handleAddToCartMode = async () => {
    if (!selectedVariant) return;
    setMode("addToCart");
    setDrawerOpen(true);
  };

  return (
    <>
      <ProductOptionsDrawer
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        productOptions={product.options}
        isLoading={mode === "addToCart" ? addToCartLoading : buyNowLoading}
        mode={mode}
      />

      <div className="fixed z-10 left-0 bottom-0 w-full bg-card flex border-t border-border">
        {/* Chat Now */}
        <Button
          onClick={onChatNow}
          className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-secondary border-r border-white/20"
          variant="secondary"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">Chat Now</span>
        </Button>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCartMode}
          variant="secondary"
          className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-secondary"
          disabled={!selectedVariant}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-xs font-medium">
            {selectedVariant ? "Add to Cart" : "Select Options"}
          </span>
        </Button>

        {/* Buy Now */}
        <Button
          onClick={handleBuyNowMode}
          className="flex-[1.5] flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-primary text-white"
          disabled={!selectedVariant}
        >
          <span className="text-xs font-medium">Buy Now</span>
        </Button>
      </div>
    </>
  );
};
