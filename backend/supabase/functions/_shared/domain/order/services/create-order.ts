import { DrizzleClient } from "../../../db/client.ts";
import { InsertPendingOrder } from "../../../db/types/orders.ts";
import { AppError } from "../../../errors/Errors.ts";
import { handleDbError } from "@shared/errors/handle-db-error.ts";
import { getShippingQuotation } from "@shared/integrations/lalamove/get-quotation.ts";
import {
  CreateOrderInput,
  CreateOrderRes,
} from "@shared/package-types/index.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { OrderRepository } from "../../order/mod.ts";
import { calculatePassOnFee } from "../../../integrations/paymongo/calculate-pass-on-fee.ts";

// TODO: implement pending order 24hr expiration

export const createOrder = async (
  db: DrizzleClient,
  profileId: string,
  payload: CreateOrderInput,
): Promise<CreateOrderRes> => {
  try {
    const address = await AddressRepository.getById(db, payload.addressId);

    if (!address) throw AppError.notFound("Addresss not found");

    const { id: _id, ...orderAddress } = address;

    const variantIds = payload.items
      .map((item) => item.variantId)
      .filter(Boolean);

    console.log({ variantIds });

    const existingVariants = await OrderRepository.getDetailsByVariantIds(
      db,
      variantIds,
    );
    // console.log({ existingVariants });

    const variantMap = new Map(
      existingVariants.map(({ id, ...rest }) => [id, rest]),
    );

    const missingIds = variantIds.filter((id) => !variantMap.has(id));
    if (missingIds.length) {
      throw AppError.badRequest(
        `The following product variant ids are not available: ${missingIds.join(", ")}`,
      );
    }

    // Merge order item details from DB with payload details
    const orderItems = payload.items.map((item) => {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        throw AppError.badRequest(`Variant not found: ${item.variantId}`);
      }

      return {
        ...variant,
        quantity: item.quantity,
        cardMessages: item.cardMessages,
      };
    });

    // Calculate prices
    const subtotalCents = orderItems.reduce(
      (sum, item) => sum + item.priceCents * item.quantity,
      0,
    );
    const shippingQuote = await getShippingQuotation(payload.shippingQuoteId);
    const shippingCents = Number(shippingQuote.priceBreakdown.total);
    const discountCents = 0;
    const totalPriceCents = subtotalCents + shippingCents - discountCents;
    const passOnFee = calculatePassOnFee(
      totalPriceCents,
      payload.paymentMethodType,
    );
    const sellingPriceCents = totalPriceCents + passOnFee;

    const inserts: InsertPendingOrder = {
      order: {
        profileId,
        subtotalCents,
        shippingCents,
        totalCents: sellingPriceCents,
        discountCents,
        status: "pending",
        source: payload.source,
      },
      items: orderItems,
      address: orderAddress,
    };

    const orderId = await OrderRepository.insertPendingOrder(db, inserts);

    return { orderId };
  } catch (error) {
    throw handleDbError("Failed to create pending checkout", error);
  }
};
