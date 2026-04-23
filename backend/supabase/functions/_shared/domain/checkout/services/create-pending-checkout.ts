import { DrizzleClient } from "../../../db/client.ts";
import { InsertCheckout } from "../../../db/types/checkout.ts";
import { AppError } from "../../../errors/Errors.ts";
import { handleDbError } from "../../../errors/handle-db-error.ts";
import {
  CheckoutInput,
  CreatePendingCheckoutRes,
} from "../../../types/index.ts";
import { snakeToCamel } from "../../../utils/caseConverter.ts";
import { isDev } from "../../../utils/isDev.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { OrderRepository } from "../../order/mod.ts";
import { PayMongoService } from "../../paymongo/services/mod.ts";
import { CheckoutRepository } from "../checkout-repository.ts";

const APP_URL = Deno.env.get("APP_URL");
if (!APP_URL) {
  throw AppError.internal("Env variable APP_URL not found");
}

export const createPendingCheckout = async (
  db: DrizzleClient,
  profileId: string,
  payload: CheckoutInput,
  idempotencyKey?: string,
): Promise<CreatePendingCheckoutRes> => {
  if (!idempotencyKey) throw AppError.badRequest("Missing Idempotency Key");

  try {
    const address = await AddressRepository.getById(
      db,
      payload.order.addressId,
    );

    // Remove id. We don't wanna insert address.id in order_address_snapshots
    const { id: _id, ...orderAddress } = address;

    const variantIds = payload.order.items
      .map((item) => item.variantId)
      .filter(Boolean);

    console.log({ variantIds });

    if (!variantIds.length) {
      throw AppError.badRequest("No valid product variants in the order");
    }

    const existingVariants = await OrderRepository.getDetailsByVariantIds(
      db,
      variantIds,
    );

    // console.log({ existingVariants });

    const variantMap = new Map(
      // separate the id since we'll only be inserting variant details
      existingVariants.map(({ id, ...rest }) => [id, rest]),
    );

    const missingIds = variantIds.filter((id) => !variantMap.has(id));
    if (missingIds.length) {
      throw AppError.badRequest(
        `The following product variant ids are not available: ${missingIds.join(", ")}`,
      );
    }

    // Merge order item details from DB with payload details
    const orderItems = payload.order.items.map((item) => {
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
    const shippingCents = 1500;
    const discountCents = 0;
    const totalCents = subtotalCents + shippingCents - discountCents;

    // Paymongo Workflow
    const paymentIntentData = await PayMongoService.createPaymentIntent(
      {
        amountCents: totalCents,
        paymentMethodType: payload.payment.method.type,
      },
      idempotencyKey,
    );

    const paymentMethodData = await PayMongoService.createPaymentMethod(
      payload.payment.method,
      idempotencyKey,
    );

    const attachedPaymentMethodData = await PayMongoService.attachPaymentIntent(
      {
        paymentIntentId: paymentIntentData.id,
        paymentMethodId: paymentMethodData.id,
        returnUrl: isDev ? "http://localhost:5173" : APP_URL,
      },
    );

    const redirectUrls =
      attachedPaymentMethodData.attributes.next_action.redirect;

    // DEBUG:
    // if (isDev) {
    // console.log({ paymentIntentData });
    // console.log({ paymentMethodData });
    // console.log({ attachedPaymentMethodData });
    // }

    const inserts: InsertCheckout = {
      order: {
        profileId,
        subtotalCents,
        shippingCents,
        totalCents,
        discountCents,
        status: "pending",
        source: payload.order.source,
      },
      items: orderItems,
      address: orderAddress,
      payment: {
        paymentIntentId: paymentIntentData.id,
        method: paymentMethodData.attributes.type,
        amountCents: paymentIntentData.attributes.amount,
        status: "pending",
        currency: "PHP",
        paymentId: null,
        paidAt: null,
      },
    };

    const pendingCheckoutData = await CheckoutRepository.insertCheckOut(
      db,
      inserts,
    );

    return {
      order: {
        ...pendingCheckoutData.insertedPendingOrder,
        items: pendingCheckoutData.insertedPendingOrderItems,
        address: pendingCheckoutData.insertedOrderAddressSnapshot,
      },
      payment: pendingCheckoutData.insertedPendingPayment,
      redirectUrls: snakeToCamel(redirectUrls),
    } satisfies CreatePendingCheckoutRes;
  } catch (error) {
    throw handleDbError("Failed to create pending checkout", error);
  }
};
