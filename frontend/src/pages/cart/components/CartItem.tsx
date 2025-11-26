import { Button } from "@/lib/ui/__shadcn__/button";
import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Trash2, Plus, Minus, Gift, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import ProductCard from "@/components/products/ProductCard";
import { useState } from "react";

interface CartItemProps {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  selected: boolean;
  giftMessage: string;
  onToggleSelection: () => void;
  onUpdateGiftMessage: (message: string) => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem = ({
  productId,
  name,
  price,
  imageUrl,
  quantity,
  selected,
  giftMessage,
  onToggleSelection,
  onUpdateGiftMessage,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  const [showGiftMessage, setShowGiftMessage] = useState(!!giftMessage);

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-shadow",
        !selected && "opacity-60",
      )}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Selection Toggle */}
          <div className="flex flex-col items-center gap-4">
            <div
              onClick={onToggleSelection}
              className={cn(
                "flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all mt-2",
                selected
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground hover:border-primary",
              )}
            >
              {selected && <Check className="size-3" />}
            </div>

            {/* Product Image */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden">
              <ProductCard
                productId={productId}
                name={name}
                price={price}
                imageUrl={imageUrl}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <h3
                className={cn(
                  "font-medium line-clamp-2",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {name}
              </h3>
              <p
                className={cn(
                  "text-lg font-semibold mt-1",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              >
                {formatPrice(price)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="minimal"
                  size="icon-sm"
                  className="hover:bg-accent"
                  onClick={() => onUpdateQuantity(quantity - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="px-3 py-1 text-sm font-medium min-w-10 text-center">
                  {quantity}
                </span>
                <Button
                  variant="minimal"
                  size="icon-sm"
                  className="hover:bg-accent"
                  onClick={() => onUpdateQuantity(quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground ml-auto">
                {formatPrice(price * quantity)}
              </div>

              <Button
                variant="minimal"
                size="icon-sm"
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                onClick={onRemove}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {/* Gift Message Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant="minimal"
                size="sm"
                className={cn(
                  "flex items-center gap-2 text-xs",
                  showGiftMessage ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setShowGiftMessage(!showGiftMessage)}
              >
                <Gift className="size-3" />
                {showGiftMessage ? "Hide Gift Message" : "Add Gift Message"}
              </Button>
            </div>

            {/* Gift Message Input */}
            {showGiftMessage && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Write a special message for this gift..."
                  value={giftMessage}
                  onChange={(e) => onUpdateGiftMessage(e.target.value)}
                  className="min-h-20 resize-none border-border/50 focus:border-primary transition-colors text-sm"
                  maxLength={200}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>This message will be included with the product</span>
                  <span>{giftMessage.length}/200</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
