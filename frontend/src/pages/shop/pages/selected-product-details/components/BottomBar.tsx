import { Button } from "@/lib/ui/__shadcn__/button";
import type { Product } from "@TheCozyBud/types";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { useMemo } from "react";

type BottomBarProps = {
  product: Product;
  selectedOptions: Record<string, string>;
  cardMessage: string;
  quantity: number;
  onQuantityChange?: (qty: number) => void;
  onAddToCart?: (payload: {
    productId: string;
    sku: string;
    quantity: number;
    selectedOptions: Record<string, string>;
    cardMessage: string;
  }) => void;
  onChatNow?: () => void;
  onBuyNow?: () => void;
};

export const BottomBar = ({
  product,
  selectedOptions,
  cardMessage,
  quantity,
  onAddToCart,
  onChatNow,
  onBuyNow,
}: BottomBarProps) => {
  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) =>
      Object.entries(selectedOptions).every(
        ([key, values]) => variant.options[key] === values[0],
      ),
    );
  }, [product.variants, selectedOptions]);

  const handleAddToCart = () => {
    if (!selectedVariant || !onAddToCart) return;

    onAddToCart({
      productId: product.id,
      sku: selectedVariant.sku,
      quantity,
      selectedOptions,
      cardMessage,
    });
  };

  return (
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
        variant="secondary"
        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-secondary"
        onClick={handleAddToCart}
        disabled={!selectedVariant}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-xs font-medium">
          {selectedVariant ? "Add to Cart" : "Select Options"}
        </span>
      </Button>

      {/* Buy Now */}
      <Button
        onClick={onBuyNow}
        className="flex-[1.5] flex flex-col items-center justify-center gap-1 rounded-none py-1! h-auto bg-primary text-white"
        disabled={!selectedVariant}
      >
        <span className="text-xs font-medium">Buy Now</span>
      </Button>
    </div>
  );
};
