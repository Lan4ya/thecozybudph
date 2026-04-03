import { CartRepository } from "../cart-repository.ts";

import {
  CartItem,
  ProductOption,
  ProductVariant,
} from "@shared/types/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";

export const getCartItems = async (
  db: DrizzleClient,
  profileId: string,
): Promise<CartItem[]> => {
  const cart = await CartRepository.getCartByProfileId(db, profileId);

  if (!cart?.id) {
    throw AppError.internal(
      "Invariant violation: get cart by profile id returned no data",
    );
  }

  try {
    const rows = await CartRepository.getCartItemsByCartId(db, cart.id);

    const cartItems: CartItem[] = rows.map((row) => {
      let product: CartItem["product"];
      let isAvailable = true;

      if (
        !row.productVariantId ||
        !row.productId ||
        !row.primaryImageUrl ||
        !row.productName
      ) {
        product = null;
        isAvailable = false;
      } else {
        product = {
          id: row.productId,
          name: row.productName,
          primaryImageUrl: row.primaryImageUrl,
          options: row.productOptions as unknown as ProductOption[],
          variant: {
            id: row.variantId!,
            priceCents: row.variantPrice ?? 0,
            attributes:
              row.variantAttributes as unknown as ProductVariant["attributes"],
          },
        };
      }

      return {
        id: row.id,
        cartId: row.cartId!,
        quantity: row.quantity,
        cardMessages: row.cardMessages,
        isAvailable,
        product,
        createdAt: row.createdAt,
      };
    });

    return cartItems;
  } catch (error) {
    throw handleDbError("Failed adding product to cart", error);
  }
};
