import { useEffect } from "react";
import "swiper/swiper.css";
import { useCartStore } from "@/pages/cart/store/useCartStore";
import { useShallow } from "zustand/react/shallow";
import { useCartQuery } from "@/pages/cart/hooks/useCartQuery";
import { DeleteCartItemDialog } from "./CartItemDeleteDialog";
import { useCartItemMutations } from "@/pages/cart/hooks/useCartMutations";
import isDev from "@/lib/utils/isDev";
import { updateCartItemSchema, deleteCartItemsSchema } from "@cozybud/schemas";
import z from "zod";
import { useToast } from "@/providers/ToastProvider";
import CartItem from "./CartItem";
import CartItemsListSkeleton from "@/lib/ui/skeletons/CartItemsListSkeleton";
import type { CartItemUI } from "@/types";

export const CartItemsList = () => {
  const { addToast } = useToast();

  const { data: cartQueryData, error, isFetching } = useCartQuery();

  const {
    pendingDeleteIds,
    setPendingDeleteIds,
    getCartItem,
    setCartItems,
    cartItems,
    toggleItemSelection,
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

  const hydrateCartItems = (): CartItemUI[] => {
    return (
      cartQueryData?.reduce<CartItemUI[]>((acc, item) => {
        if (!item.isAvailable) return acc;

        const existingItem = getCartItem(item.id);

        // Fill the cardMessages array with empty strings so its length always matches the item’s quantity.
        // This is needed to render extra empty TextArea's so the user can add more messages if wanted.
        const cardMessages =
          item.cardMessages.length < item.quantity
            ? [
                ...item.cardMessages,
                ...Array(
                  Math.max(0, item.quantity - item.cardMessages.length),
                ).fill(""),
              ]
            : item.cardMessages;

        acc.push({
          ...item,
          cardMessages,
          selected: existingItem?.selected ?? false,
        });

        return acc;
      }, []) ?? []
    );
  };

  useEffect(() => {
    if (cartQueryData) {
      setCartItems(hydrateCartItems());
    }
  }, [cartQueryData]);

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

  if (error && !isFetching) throw error;

  if (isFetching) return <CartItemsListSkeleton />;

  if (!cartItems.length && !isFetching)
    return (
      <div className="mt-40">
        <p className="text-center text-muted-foreground">No cart items.</p>
      </div>
    );

  return (
    <div className="">
      <ul className="space-y-5">
        {cartItems.map((item) => (
          <li key={item.id}>
            <CartItem
              cartItemId={item.id}
              onToggleSelection={() => toggleItemSelection(item.id!)}
              onRequestRemove={() =>
                setPendingDeleteIds((p) => [...p, item.id])
              }
              onUpdateCartItem={(cardMessages, quantity, newVariantId) =>
                updateCartItem(item.id, cardMessages, quantity, newVariantId)
              }
            />
          </li>
        ))}
      </ul>

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
    </div>
  );
};
