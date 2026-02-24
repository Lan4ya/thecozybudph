import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import { Trash2, Plus, Minus, Gift, Check, XIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPriceCents } from "@/lib/utils/format";
import ProductCard from "@/components/products/ProductCard";
import { useState } from "react";
import type { CartItemUI } from "../Cart";

type CartItemProps = CartItemUI & {
  onToggleSelection: () => void;
  onUpdateCardMessage: (message: string) => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
};

const CartItem = ({
  productId,
  name,
  productVariant,
  imageUrl,
  quantity,
  selected,
  cardMessage,
  onToggleSelection,
  onUpdateCardMessage: onUpdateGiftMessage,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  const [showGiftMessage, setShowGiftMessage] = useState(!!cardMessage);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className={cn("hover:shadow-md transition-shadow pb-4")}>
      <CardContent className="px-4">
        <div className="flex gap-4">
          {/* Selection Toggle */}
          <div className="flex items-center gap-4">
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
                price={productVariant.priceCents}
                imageUrl={imageUrl}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <div>
              <h3
                className={cn(
                  "font-medium line-clamp-2",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {name}
              </h3>
              <p className={cn("text-primary font-semibold")}>
                {formatPriceCents(productVariant.priceCents * quantity)}
              </p>
            </div>

            {/* Quantity Controls */}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="minimal"
                  size="icon-sm"
                  className="hover:bg-accent"
                  onClick={() => onUpdateQuantity(quantity - 1)}
                >
                  <Minus className="size-3" />
                </Button>

                <span className="py-1 text-sm font-medium min-w-3 text-center">
                  {quantity}
                </span>

                <Button
                  variant="minimal"
                  size="icon-sm"
                  className="hover:bg-accent"
                  onClick={() => onUpdateQuantity(quantity + 1)}
                >
                  <Plus className="size-3" />
                </Button>
              </div>

              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  {!isEditing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <Button
                        size="sm"
                        variant="minimal"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      className="flex gap-2.5"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <Button
                        size="icon-sm"
                        variant="destructive"
                        onClick={onRemove}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="minimal"
                        className="border"
                        onClick={() => setIsEditing(false)}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/30">
          {/* Gift Message Toggle */}
          <Button
            variant="minimal"
            size="sm"
            className={cn(
              "flex items-center gap-2 text-xs h-auto",
              showGiftMessage ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => setShowGiftMessage(!showGiftMessage)}
          >
            <Gift className="size-4" />
            {showGiftMessage ? "Hide Card Message" : "Add Card Message"}
          </Button>

          {/* Gift Message Input */}
          {showGiftMessage && (
            <div className="space-y-2 mt-2">
              <Textarea
                placeholder="Write a special message for this gift..."
                value={cardMessage}
                onChange={(e) => onUpdateGiftMessage(e.target.value)}
                className="min-h-20 resize-none border-border/50 focus:border-primary transition-colors text-sm"
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>This message will be included with the product</span>
                <span>{cardMessage.length}/200</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
