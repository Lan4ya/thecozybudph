import { ProductImage } from "@/components/products/ProductImage";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Card, CardContent } from "@/lib/ui/__shadcn__/card";
import { cn } from "@/lib/utils/cn";
import { formatPriceCents } from "@/lib/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Trash2, XIcon, Minus, Plus } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { CartItemOptionsDrawer } from "./CartItemOptionsDrawer";
import { useCartStore } from "@/store/useCartStore";

type CartItemProps = {
  cartItemId: string;
  onToggleSelection: () => void;
  onRequestRemove: () => void;
  onUpdateCartItem: (
    cardMessages?: string[],
    quantity?: number,
    newVariantId?: string,
  ) => Promise<void>;
};

const CartItem = ({
  cartItemId,
  onToggleSelection,
  onUpdateCartItem,
  onRequestRemove,
}: CartItemProps) => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const cartItem = useCartStore((s) => s.getCartItem(cartItemId));
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);

  const debounceTimeout = useRef<number | null>(null);

  if (!cartItem) return null;

  const { quantity, selected, product, isAvailable } = cartItem;

  if (!isAvailable || !product) return null;

  const price = formatPriceCents(product.variant.priceCents * quantity);
  const isItemAvailable = isAvailable && product.id && product.variant.id;

  const debouncedUpdateQuantity = (newQuantity: number) => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      onUpdateCartItem(undefined, newQuantity);
    }, 1000);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    increment(cartItemId);
    debouncedUpdateQuantity(newQuantity);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      onRequestRemove();
      return;
    }
    const newQuantity = quantity - 1;
    decrement(cartItemId);
    debouncedUpdateQuantity(newQuantity);
  };

  // TODO: disable btns if item is not avail
  return (
    <Card className="hover:shadow-sm transition-shadow relative py-4">
      {!isItemAvailable && (
        <div className="absolute inset-0 bg-black/50 z-50 flex-center rounded-xl pointer-events-none">
          <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded">
            Product Not Available
          </span>
        </div>
      )}

      <CardContent
        className="flex gap-3 cursor-default px-2"
        onClick={() =>
          isItemAvailable && navigate(`/shop/products/${product.id}`)
        }
      >
        {/* Selection Toggle */}
        <div className="flex items-center">
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            className={cn(
              "flex-center size-5 border-2 rounded cursor-pointer transition-all",
              selected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary",
            )}
          >
            {selected && <Check className="size-3" />}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex gap-2">
          <ProductImage
            src={product.primaryImageUrl}
            className="size-20"
            roundedSize="md"
          />

          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            {/* Name & Edit Btn*/}
            <div className="capitalize flex items-center justify-between">
              <h3 className={"font-medium line-clamp-2 "}>{product.name}</h3>

              <div className="flex tems-center">
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
                        className="text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                        }}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestRemove();
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="minimal"
                        className="border"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(false);
                        }}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Price */}
            <div className="-mt-1">
              <p className={cn("text-primary font-semibold")}>{price}</p>
            </div>

            {/* Drawer & Quantity Control */}
            <div
              className="flex justify-between items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <CartItemOptionsDrawer
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                cartItemId={cartItemId}
                onUpdateCartItem={onUpdateCartItem}
              />

              <div className="flex items-center">
                <Button
                  variant="minimal"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDecrement();
                  }}
                >
                  <Minus className="size-3" />
                </Button>

                <span className="text-sm font-medium bg-sidebar rounded-sm min-w-6 text-center">
                  {quantity}
                </span>

                <Button
                  variant="minimal"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncrement();
                  }}
                >
                  <Plus className="size-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
