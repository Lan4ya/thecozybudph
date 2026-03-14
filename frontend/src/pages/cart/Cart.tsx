import { deleteCartItemsSchema, updateCartItemSchema } from "@TheCozyBud/types";
import CartItem from "./components/CartItem";
import { DeleteCartItemDialog } from "./components/CartItemDeleteDialog";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { useCartItemMutations } from "@/features/cart/hooks/useCartMutations";
import {
  useCartStore,
  type CartItemUI,
} from "@/features/cart/store/useCartStore";
import isDev from "@/lib/utils/isDev";
import z from "zod";
import { useToast } from "@/providers/ToastProvider";
import { useShallow } from "zustand/react/shallow";
import { useCartQuery } from "@/features/cart/hooks/useCartQuery";

// TODO:
// add created_at in db for most recent display sorting
// add UI for !isAvailable
const Cart = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const { data: cartQueryData, error, isFetching } = useCartQuery();

  const {
    getCartItem,
    setCartItems,
    cartItems,
    toggleItemSelection,
    toggleAllSelection,
    allItemsSelected,
    isEditingCart,
    setIsEditingCart,
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
    })),
  );

  useEffect(() => {
    isDev && console.log("Cart Items:", cartQueryData);
  }, [cartQueryData]);

  const hydrateCartItems = (): CartItemUI[] => {
    return (
      cartQueryData?.map((c) => {
        const existingItem = getCartItem(c.id);

        // Fill the cardMessages array with empty strings so its length always matches the item’s quantity.
        // This is needed to render extra empty TextArea's so the user can add more messages if wanted.
        const cardMessages =
          c.cardMessages.length < c.quantity
            ? [
                ...c.cardMessages,
                ...Array(Math.max(0, c.quantity - c.cardMessages.length)).fill(
                  "",
                ),
              ]
            : c.cardMessages;

        return {
          ...c,
          cardMessages,
          selected: existingItem?.selected ?? false,
        };
      }) ?? []
    );
  };

  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

  useEffect(() => {
    if (cartQueryData) {
      setCartItems(hydrateCartItems());
    }
  }, [cartQueryData]);

  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.product.variant.priceCents * item.quantity,
    0,
  );

  const { updateCartItemMutation, deleteCartItemsMutation } =
    useCartItemMutations();
  const deleteCartItemLoading = deleteCartItemsMutation.isPending;

  const updateCartItem = async (
    cartItemId: string,
    cardMessages?: string[],
    quantity?: number,
    newVariantId?: string,
  ) => {
    const cartItem = getCartItem(cartItemId);
    if (!cartItem) return;

    const result = updateCartItemSchema.safeParse({
      newVariantId,
      quantity,
      cardMessages,
    });

    if (!result.success) {
      isDev && console.error(z.flattenError(result.error));
      addToast("Something wen't wrong. Please try again later.", "error");
      return;
    }

    await updateCartItemMutation.mutateAsync({
      cartItemId,
      newVariantId: result.data.newVariantId,
      quantity: result.data.quantity,
      cardMessages: result.data.cardMessages,
    });
  };

  const deleteCartItems = async (cartItemIds: string[]) => {
    const result = deleteCartItemsSchema.safeParse({
      cartItemIds,
    });

    if (!result.success) {
      isDev && console.error(z.flattenError(result.error));
      addToast("Something wen't wrong. Please try again later.", "error");
      return;
    }

    await deleteCartItemsMutation.mutateAsync({ cartItemIds });
  };

  const hasNoItems =
    !cartQueryData || (cartQueryData.length === 0 && !isFetching);

  if (error && !isFetching) throw error;

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
                <span className="w-8">{isEditingCart ? "Done" : "Edit"}</span>
              </Button>
            )}
          </div>
        </header>

        <main>
          {hasNoItems ? (
            <div className="mt-40">
              <p className="text-center text-muted-foreground">
                No cart items.
              </p>
            </div>
          ) : (
            // Cart Items
            <div className="max-w-3xl mx-auto">
              <ul className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <li key={item.id}>
                    <CartItem
                      cartItemId={item.id}
                      onToggleSelection={() => toggleItemSelection(item.id!)}
                      onRequestRemove={() =>
                        setPendingDeleteIds((p) => [...p, item.id])
                      }
                      onUpdateCartItem={(
                        cardMessages,
                        quantity,
                        newVariantId,
                      ) =>
                        updateCartItem(
                          item.id,
                          cardMessages,
                          quantity,
                          newVariantId,
                        )
                      }
                    />
                  </li>
                ))}

                <DeleteCartItemDialog
                  open={pendingDeleteIds.length > 0}
                  onCancel={() => setPendingDeleteIds([])}
                  onConfirm={() => {
                    deleteCartItems(pendingDeleteIds);
                    setPendingDeleteIds([]);
                  }}
                  isDeleting={deleteCartItemLoading}
                  deletingItemCount={pendingDeleteIds.length}
                />
              </ul>
            </div>
          )}
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
