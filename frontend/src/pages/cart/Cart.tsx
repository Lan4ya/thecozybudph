import { CartItemsList } from "./components/CartItemsList";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useNavigate } from "react-router";
import { useToast } from "@/providers/ToastProvider";
import { useShallow } from "zustand/react/shallow";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyOrErrorState } from "@/components/EmptyOrErrorState";
import { useCartStore } from "@/store/useCartStore";
import { useCheckoutStore } from "@/store/useCheckoutStore";
import { CartBottomBar } from "./components/CartBottomBar";

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
      addToast("Please select item(s) first.", "info");
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
    useCheckoutStore.getState().setFromCart(true);
    useCheckoutStore.getState().setOrderItemsUI(orderItems);
    // Since sessionId only is stored client side only (sessionStorage), we're gonna use this
    // to verify the user really created the checkout sessionId properly and not
    // just typed some random uuid in the url by comparing if param uuid === sessionId store
    useCheckoutStore.getState().setCheckout({ sessionId, status: "active" });
    navigate(`/checkout/${sessionId}`);
  };

  return (
    <>
      <div className="custom-container space-y-22 pb-25 pt-6 max-w-7xl mx-auto">
        <header className="py-2 border-b border-border/40 grid grid-cols-3 items-center">
          <h1 className="text-nowrap col-start-2 text-header justify-self-center">
            Your Cart Items
          </h1>

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
          <ErrorBoundary
            FallbackComponent={(props) => (
              <EmptyOrErrorState
                title="Failed to load your cart"
                description="Please check your connection and try again."
                {...props}
              />
            )}
          >
            <CartItemsList />
          </ErrorBoundary>
        </main>
      </div>

      <CartBottomBar
        allItemsSelected={allItemsSelected}
        toggleAllSelection={toggleAllSelection}
        selectedCount={selectedItems.length}
        totalCount={cartItems.length}
        isEditingCart={isEditingCart}
        onDelete={handleDeleteItems}
        subtotalCents={subtotal}
        hasNoItems={hasNoItems}
        onCheckout={handleCheckout}
      />
    </>
  );
};

export default Cart;
