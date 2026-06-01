import { Button } from "@/lib/ui/__shadcn__/button";
import type { Product } from "@cozybud/schemas";
import { MessageCircle, ShoppingCart, Instagram, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { OptionsDrawer } from "./OptionsDrawer";
import { useProductSelectionStore } from "@/pages/shop/store/useProductSelectionStore";
import { cn } from "@/lib/utils/cn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/ui/__shadcn__/popover";

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
        product={props.product}
        onChatNow={props.onChatNow}
        onAddToCart={handleAddToCartMode}
        onBuyNow={handleBuyNowMode}
        disabled={!selectedVariant}
      />
    </>
  );
};

type BottomBarActionsProps = {
  product: Product;
  onChatNow?: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled: boolean;
};

export const BottomBarActions = ({
  product,
  onAddToCart,
  onBuyNow,
  disabled,
}: BottomBarActionsProps) => {
  const messengerLink = `https://m.me/thecozybudph?text=${encodeURIComponent(`Hi! I'm interested in ${product.name}: ${window.location.href}`)}`;
  const instagramLink = `https://ig.me/m/thecozybudph`;
  const gmailLink = `mailto:thecozybudph@gmail.com?subject=${encodeURIComponent(`Inquiry about ${product.name}`)}&body=${encodeURIComponent(`Hi, I'm interested in ${product.name}: ${window.location.href}`)}`;

  return (
    <div
      className={cn(
        "w-full flex lg:gap-3 lg:mt-3",
        "fixed left-0 z-30 bottom-0 lg:static lg:left-auto lg:bottom-auto",
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto border-r border-white/20"
            variant="secondary"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Chat Now</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={8}
          className="w-48 p-2 flex flex-col gap-1"
        >
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
          >
            <div className="bg-[#0084FF] p-1.5 rounded-lg text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.908 1.458 5.488 3.733 7.153V22l3.414-1.874c.905.251 1.865.388 2.853.388 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.06 12.012-2.707-2.887-5.286 2.887 5.808-6.17 2.707 2.887 5.286-2.887-5.808 6.17z" />
              </svg>
            </div>
            <span className="text-sm font-medium lg:hidden">Messenger</span>
            <span className="text-sm font-medium hidden lg:inline">
              Messenger
            </span>
          </a>

          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
          >
            <div className="bg-linear-to-tr from-[#FFB700] via-[#FF0069] to-[#7600E5] p-1.5 rounded-lg text-white">
              <Instagram className="size-4" />
            </div>
            <span className="text-sm font-medium">Instagram</span>
          </a>

          <a
            href={gmailLink}
            className="flex items-center gap-3 p-2 hover:bg-accent rounded-md transition-colors"
          >
            <div className="bg-[#EA4335] p-1.5 rounded-lg text-white">
              <Mail className="size-4" />
            </div>
            <span className="text-sm font-medium">Gmail</span>
          </a>
        </PopoverContent>
      </Popover>

      <Button
        onClick={onAddToCart}
        variant="secondary"
        className="flex-1 flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto"
        disabled={disabled}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="text-xs font-medium">
          {disabled ? "Select Options" : "Add to Cart"}
        </span>
      </Button>

      <Button
        onClick={onBuyNow}
        className="flex-[1.5] flex flex-col items-center justify-center gap-1 rounded-none lg:rounded-lg py-1! h-auto"
        disabled={disabled}
      >
        <span className="text-xs font-medium">Buy Now</span>
      </Button>
    </div>
  );
};
