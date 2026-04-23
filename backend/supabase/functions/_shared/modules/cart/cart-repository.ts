import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { cartItems, carts } from "../../db/schema/carts.ts";
import { products, productVariants } from "../../db/schema/products.ts";
import { AppError } from "../../errors/Errors.ts";
import {
  AddCartItemInput,
  CartItem,
  ProductOption,
  ProductVariant,
  UpdateCartItemInput,
} from "../../package-types/index.ts";
import { DrizzleClient } from "../../db/client.ts";

export const CartRepository = {
  getCartByProfileId: (db: DrizzleClient, profileId: string) => {
    return db.rls(async (tx) => {
      const result = await tx
        .select({ id: carts.id })
        .from(carts)
        .where(eq(carts.profileId, profileId))
        .limit(1);

      return result[0] ?? null;
    });
  },

  getCartItemsByCartId: (db: DrizzleClient, cartId: string) => {
    return db.rls(async (tx) => {
      return await tx
        .select({
          id: cartItems.id,
          cartId: cartItems.cartId,
          quantity: cartItems.quantity,
          cardMessages: cartItems.cardMessages,
          productId: cartItems.productId,
          productVariantId: cartItems.productVariantId,
          isAvailable: cartItems.isAvailable,
          createdAt: cartItems.createdAt,

          productName: products.name,
          productOptions: products.options,
          primaryImageUrl: products.primaryImageUrl,

          variantId: productVariants.id,
          variantPrice: productVariants.priceCents,
          variantAttributes: productVariants.attributes,
        })
        .from(cartItems)
        .innerJoin(products, eq(products.id, cartItems.productId))
        .innerJoin(
          productVariants,
          eq(productVariants.id, cartItems.productVariantId),
        )
        .where(eq(cartItems.cartId, cartId))
        .orderBy(desc(cartItems.createdAt));
    });
  },

  /**
   * Adds a new cart item or updates an existing one with the same product variant.
   * If the item already exists in the cart, it increments the quantity and
   * appends any new card messages.
   */
  upsertCartItem: (
    db: DrizzleClient,
    cartId: string,
    payload: AddCartItemInput,
  ): Promise<CartItem> => {
    return db.rls(async (tx) => {
      const [variant] = await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          priceCents: productVariants.priceCents,
          attributes: productVariants.attributes,
          productName: products.name,
          productOptions: products.options,
          primaryImageUrl: products.primaryImageUrl,
        })
        .from(productVariants)
        .leftJoin(products, eq(products.id, productVariants.productId))
        .where(eq(productVariants.id, payload.variantId))
        .limit(1);

      if (!variant || !variant.productName || !variant.primaryImageUrl) {
        throw AppError.badRequest(
          `Variant ${payload.variantId} not found or data is incomplete`,
        );
      }

      const [upsertedCartItem] = await tx
        .insert(cartItems)
        .values({
          cartId,
          productId: variant.productId,
          productVariantId: variant.id,
          quantity: payload.quantity,
          cardMessages: payload.cardMessages,
        })
        .onConflictDoUpdate({
          target: [
            cartItems.cartId,
            cartItems.productId,
            cartItems.productVariantId,
          ],
          set: {
            quantity: sql`${cartItems.quantity} + ${payload.quantity}`,
            cardMessages:
              payload.cardMessages.length > 0
                ? sql`${cartItems.cardMessages} || ARRAY[${sql.join(payload.cardMessages, sql`, `)}]::text[]`
                : sql`${cartItems.cardMessages}`,
          },
        })
        .returning({
          id: cartItems.id,
          quantity: cartItems.quantity,
          cardMessages: cartItems.cardMessages,
          isAvailable: cartItems.isAvailable,
        });

      const cartItem: CartItem = {
        ...upsertedCartItem,
        product: {
          id: variant.productId,
          name: variant.productName,
          primaryImageUrl: variant.primaryImageUrl,
          options: variant.productOptions as unknown as ProductOption[],
          variant: {
            id: variant.id,
            priceCents: variant.priceCents,
            attributes:
              variant.attributes as unknown as ProductVariant["attributes"],
          },
        },
      };

      return cartItem;
    });
  },

  updateCartItem: (
    db: DrizzleClient,
    cartItemId: string,
    payload: UpdateCartItemInput,
  ) => {
    return db.rls(async (tx) => {
      const [currentItem] = await tx
        .select({
          id: cartItems.id,
          cartId: cartItems.cartId,
          productId: cartItems.productId,
          productVariantId: cartItems.productVariantId,
          quantity: cartItems.quantity,
          cardMessages: cartItems.cardMessages,
          isAvailable: cartItems.isAvailable,
        })
        .from(cartItems)
        .where(eq(cartItems.id, cartItemId))
        .limit(1);

      if (!currentItem || !currentItem.cartId || !currentItem.productId) {
        throw AppError.notFound("Cart item not found or incomplete");
      }

      // CASE A: No variant change (or no new variant provided)
      // Only update mutable fields (quantity, cardMessages)
      // No need to touch productVariantId or perform merge logic
      if (
        !payload.newVariantId ||
        payload.newVariantId === currentItem.productVariantId
      ) {
        const [updatedRow] = await tx
          .update(cartItems)
          .set({
            quantity: payload.quantity,
            cardMessages:
              payload.cardMessages.length > 0
                ? sql`ARRAY[${sql.join(payload.cardMessages, sql`, `)}]`
                : sql`ARRAY[]::text[]`,
          })
          .where(eq(cartItems.id, cartItemId))
          .returning({
            id: cartItems.id,
            quantity: cartItems.quantity,
            cardMessages: cartItems.cardMessages,
            isAvailable: cartItems.isAvailable,
          });

        const [productRow] = await tx
          .select({
            productId: products.id,
            productName: products.name,
            primaryImageUrl: products.primaryImageUrl,
            options: products.options,

            variantId: productVariants.id,
            variantPriceCents: productVariants.priceCents,
            variantAttributes: productVariants.attributes,
          })
          .from(cartItems)
          .leftJoin(products, eq(products.id, cartItems.productId))
          .leftJoin(
            productVariants,
            eq(productVariants.id, cartItems.productVariantId),
          )
          .where(eq(cartItems.id, updatedRow.id))
          .limit(1);

        if (
          !productRow ||
          !productRow.productId ||
          !productRow.productName ||
          !productRow.options
        ) {
          throw AppError.notFound("Product not found");
        }

        const item: CartItem = {
          id: updatedRow.id,
          quantity: updatedRow.quantity,
          cardMessages: updatedRow.cardMessages,
          isAvailable: updatedRow.isAvailable,
          product: {
            id: productRow.productId,
            name: productRow.productName,
            primaryImageUrl: productRow.primaryImageUrl ?? "",
            options: productRow.options as unknown as ProductOption[],
            variant: {
              id: productRow.variantId!,
              priceCents: productRow.variantPriceCents ?? 0,
              attributes:
                productRow.variantAttributes as ProductVariant["attributes"],
            },
          },
        };

        return {
          item,
          deletedItemId: null,
        };
      }

      // Load Variant
      const [variant] = await tx
        .select({
          id: productVariants.id,
          productId: productVariants.productId,
          priceCents: productVariants.priceCents,
          attributes: productVariants.attributes,
          productName: products.name,
          productOptions: products.options,
          primaryImageUrl: products.primaryImageUrl,
        })
        .from(productVariants)
        .leftJoin(products, eq(products.id, productVariants.productId))
        .where(eq(productVariants.id, payload.newVariantId))
        .limit(1);

      if (!variant || !variant.productName || !variant.primaryImageUrl) {
        throw AppError.badRequest(
          `Variant ${payload.newVariantId} not found or incomplete`,
        );
      }

      if (variant.productId !== currentItem.productId) {
        throw AppError.badRequest(
          "Variant does not belong to the same product",
        );
      }

      const [existingTarget] = await tx
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          cardMessages: cartItems.cardMessages,
          isAvailable: cartItems.isAvailable,
        })
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, currentItem.cartId),
            eq(cartItems.productVariantId, payload.newVariantId),
          ),
        )
        .limit(1);

      let finalRow;
      let deletedItemId: string | null = null;

      // CASE B: Target variant already exists in cart → merge items
      // Combine quantities and merge cardMessages into existing item
      // Delete the current item to avoid duplicate variant entries
      // Ensures one cart item per productVariantId
      if (existingTarget && existingTarget.id !== currentItem.id) {
        const [updatedTarget] = await tx
          .update(cartItems)
          .set({
            quantity: sql`${cartItems.quantity} + ${currentItem.quantity}`,
            cardMessages:
              payload.cardMessages.length > 0
                ? sql`${cartItems.cardMessages} || ARRAY[${sql.join(payload.cardMessages, sql`, `)}]::text[]`
                : sql`ARRAY[]::text[]`,
          })
          .where(eq(cartItems.id, existingTarget.id))
          .returning({
            id: cartItems.id,
            quantity: cartItems.quantity,
            cardMessages: cartItems.cardMessages,
            isAvailable: cartItems.isAvailable,
          });

        await tx.delete(cartItems).where(eq(cartItems.id, currentItem.id));

        finalRow = updatedTarget;
        deletedItemId = currentItem.id;
      }

      // CASE C: Variant change with no existing target item
      // Update current row with new variantId and overwrite fields
      // No merge needed since no duplicate variant exists in cart
      else {
        const [updatedItem] = await tx
          .update(cartItems)
          .set({
            productVariantId: payload.newVariantId,
            quantity: payload.quantity,
            cardMessages:
              payload.cardMessages.length > 0
                ? sql`ARRAY[${sql.join(payload.cardMessages, sql`, `)}]`
                : sql`ARRAY[]::text[]`,
          })
          .where(eq(cartItems.id, currentItem.id))
          .returning({
            id: cartItems.id,
            quantity: cartItems.quantity,
            cardMessages: cartItems.cardMessages,
            isAvailable: cartItems.isAvailable,
          });

        finalRow = updatedItem;
      }

      const item: CartItem = {
        id: finalRow.id,
        quantity: finalRow.quantity,
        cardMessages: finalRow.cardMessages,
        isAvailable: finalRow.isAvailable,
        product: {
          id: variant.productId,
          name: variant.productName,
          primaryImageUrl: variant.primaryImageUrl,
          options: variant.productOptions as unknown as ProductOption[],
          variant: {
            id: variant.id,
            priceCents: variant.priceCents,
            attributes: variant.attributes as ProductVariant["attributes"],
          },
        },
      };

      return {
        item,
        deletedItemId,
      };
    });
  },

  deleteCartItems: (
    db: DrizzleClient,
    cartId: string,
    cartItemIds: string[],
  ) => {
    return db.rls(async (tx) => {
      const deleted = await tx
        .delete(cartItems)
        .where(
          and(eq(cartItems.cartId, cartId), inArray(cartItems.id, cartItemIds)),
        )
        .returning({ id: cartItems.id });

      return deleted;
    });
  },
};
