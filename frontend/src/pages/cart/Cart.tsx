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
import { useCheckoutStore } from "../checkout/store/useCheckoutStore";

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

  const handleDeleteItems = () => {
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
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      addToast("Please select item(s).", "info");
      return;
    }

    const orderItems = selectedItems
      .filter(
        (item): item is typeof item & { product: { id: string } } =>
          item.product.id !== null,
      )
      .map((item) => ({
        variantId: item.product.variant.id,
        productId: item.product.id,
        quantity: item.quantity,
        cardMessages: item.cardMessages,
        imageUrl: item.product.primaryImageUrl,
        attributes: item.product.variant.attributes,
        name: item.product.name,
        priceCents: item.product.variant.priceCents,
      }));

    const sessionId = crypto.randomUUID();

    useCheckoutStore.getState().reset();
    useCheckoutStore.getState().setCheckoutIds({ session: sessionId });
    useCheckoutStore.getState().setSource("cart");
    useCheckoutStore.getState().setOrderItemsUI(orderItems);
    navigate(`/checkout/${sessionId}`);
  };

  return (
    <>
      <div className="custom-container space-y-8 pb-25 pt-6 max-w-7xl mx-auto">
        <header className="py-2 border-b border-border/40  grid grid-cols-3 items-center">
          <div>
            <Button variant="minimal" size="auto" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>
          </div>

          <h1 className="text-header text-center">Your Cart</h1>

          <div className="flex justify-end ">
            {!hasNoItems && (
              <Button
                variant="minimal"
                size="auto"
                className="text-foreground"
                onClick={() => setIsEditingCart(!isEditingCart)}
              >
                <span
                  className={cn(
                    "text-primary hover:text-primary/90 text-sm lg:text-base w-8",
                    isEditingCart && "text-primary",
                  )}
                >
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
      <div className="fixed left-0 bottom-0 w-full z-10 bg-card border">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 p-4">
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
              onClick={handleDeleteItems}
            >
              Delete
            </Button>
          ) : (
            <div className="flex gap-2 items-center">
              <span className="text-sm">{formatPriceCents(subtotal)}</span>

              <Button
                disabled={hasNoItems}
                onClick={handleCheckout}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                Check Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
