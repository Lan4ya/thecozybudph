import { CartAPI } from "@/api/cart";
import isDev from "@/lib/utils/isDev";
import { useToast } from "@/providers/ToastProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItem } from "@TheCozyBud/types";

export const useCartItemMutations = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const addToCartMutation = useMutation({
    mutationFn: CartAPI.addItems,
    onError: (err: Error) => {
      isDev && console.error(err.message);
      addToast("Something wen't wrong. Please try again later.", "error");
    },
    onSuccess: (cartItem) => {
      queryClient.setQueryData<CartItem[]>(["cart"], (old = []) => {
        const index = old.findIndex((i) => i.id === cartItem.id);

        if (index !== -1) {
          const updated = [...old];
          updated[index] = cartItem;
          return updated;
        }

        // If not found, prepend
        return [cartItem, ...old];
      });

      addToast("Added to cart", "success");
    },
  });

  const deleteCartItemsMutation = useMutation({
    mutationFn: CartAPI.deleteItems,
    onSuccess: ({ deletedItemIds }) => {
      queryClient.setQueryData<CartItem[]>(["cart"], (old) => {
        if (!old) return old;

        const next = [...old];

        for (const id of deletedItemIds) {
          const index = next.findIndex((item) => item.id === id);
          if (index !== -1) {
            next.splice(index, 1);
          }
        }

        return next;
      });
    },
    onError: (err: Error) => {
      isDev && console.error(err.message);
      addToast("Something went wrong. Please try again later.", "error");
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: ({
      cartItemId,
      newVariantId,
      quantity,
      cardMessages = [],
    }: {
      cartItemId: string;
      newVariantId?: string;
      quantity?: number;
      cardMessages: string[];
    }) =>
      CartAPI.updateItemsVariant(cartItemId, {
        newVariantId,
        quantity,
        cardMessages,
      }),
    onSuccess: ({ item, deletedItemId }) => {
      queryClient.setQueryData<CartItem[]>(["cart"], (old) => {
        if (!old) return old;

        const next = [...old];

        // remove merged row
        if (deletedItemId) {
          const deleteIndex = next.findIndex((i) => i.id === deletedItemId);
          if (deleteIndex !== -1) next.splice(deleteIndex, 1);
        }

        const index = next.findIndex((i) => i.id === item.id);

        if (index !== -1) {
          // replace without changing position
          next[index] = item;
        }

        return next;
      });
    },
    onError: (err: Error) => {
      isDev && console.error(err.message);
      addToast("Something wen't wrong. Please try again later.", "error");
    },
  });

  return { addToCartMutation, updateCartItemMutation, deleteCartItemsMutation };
};
