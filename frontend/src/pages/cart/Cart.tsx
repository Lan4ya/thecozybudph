import { CartItemsList } from "./components/CartItemsList";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { useCartStore } from "@/pages/cart/store/useCartStore";
import { useToast } from "@/providers/ToastProvider";
import { useShallow } from "zustand/react/shallow";
import { CustomErrorBoundary } from "@/components/CustomErrorBoundary";

// TODO:
// add created_at in db for most recent display sorting
// add UI for !isAvailable
const Cart = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const {
    cartItems,
    toggleAllSelection,
    allItemsSelected,
    isEditingCart,
    setIsEditingCart,
    setPendingDeleteIds,
  } = useCartStore(
    useShallow((s) => ({
      cartItems: s.cartItems,
      setCartItems: s.setCartItems,
      getCartItem: s.getCartItem,
      toggleAllSelection: s.toggleAllSelection,
      toggleItemSelection: s.toggleItemSelection,
      allItemsSelected: s.allItemsSelected,
      isEditingCart: s.isEditingCart,
      setIsEditingCart: s.setIsEditingCart,
      pendingDeleteIds: s.pendingDeleteIds,
      setPendingDeleteIds: s.setPendingDeleteIds,
    })),
  );

  const hasNoItems = !cartItems.length;

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.variant.priceCents * item.quantity,
    0,
  );

  return (
    <>
      <div className="custom-container space-y-8 pt-4 pb-25 max-w-7xl mx-auto">
        <header className="grid grid-cols-3 items-center">
          <div>
            <Button variant="minimal" size="auto" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
          </div>

          <h1 className="text-xl lg:text-2xl font-bold text-foreground text-center">
            Your Cart
          </h1>

          <div className="flex justify-end">
            {!hasNoItems && (
              <Button
                variant="minimal"
                size="auto"
                className="text-foreground"
                onClick={() => setIsEditingCart(!isEditingCart)}
              >
                <span className="text-base lg:text-lg w-8">
                  {isEditingCart ? "Done" : "Edit"}
                </span>
              </Button>
            )}
          </div>
        </header>

        {/* Cart Items List */}
        <main>
          <CustomErrorBoundary uiMessage="Failed to load cart items.">
            <CartItemsList />
          </CustomErrorBoundary>
        </main>
      </div>

      {/* Bottom Bar */}
      <div className="fixed left-0 bottom-0 w-full z-10 flex items-center justify-between gap-3 p-4 bg-card border">
        <div className="flex gap-2">
          <div
            onClick={toggleAllSelection}
            className={cn(
              "flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all",
              allItemsSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary",
            )}
          >
            {allItemsSelected && <Check className="size-3" />}
          </div>
          <span
            className="text-sm font-medium cursor-pointer select-none"
            onClick={toggleAllSelection}
          >
            Select all ({selectedItems.length}/{cartItems.length})
          </span>
        </div>

        {isEditingCart ? (
          <Button
            variant={"destructive"}
            className=""
            onClick={() => {
              if (selectedItems.length === 0) {
                addToast("Please select item(s).", "info");
                return;
              }

              setPendingDeleteIds(
                cartItems.reduce<string[]>((acc, i) => {
                  if (i.selected) acc.push(i.id);
                  return acc;
                }, []),
              );
            }}
          >
            Delete
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            <span className="text-sm">{formatPriceCents(subtotal)}</span>

            <Button
              disabled={hasNoItems}
              onClick={() => {
                if (selectedItems.length === 0) {
                  addToast("Please select item(s).", "info");
                  return;
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Check Out
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
