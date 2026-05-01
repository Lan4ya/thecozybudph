import { CartRepository } from "../cart-repository.ts";

import {
  CartItem,
  ProductOption,
  ProductVariant,
} from "@shared/schemas/index.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { DrizzleClient } from "../../../db/client.ts";

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

  const rows = await CartRepository.getCartItemsByCartId(db, cart.id);

  const cartItems: CartItem[] = rows.map((row) => {
    const product = {
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

    return {
      id: row.id,
      cartId: row.cartId!,
      quantity: row.quantity,
      cardMessages: row.cardMessages,
      isAvailable: row.isAvailable,
      product,
      createdAt: row.createdAt,
    };
  });

  return cartItems;
};
