import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { CreateOrderInput, InsertOrder } from "@shared/schemas/index.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { OrderRepository } from "../order-repository.ts";
import { calculatePassOnFee } from "@shared/integrations/paymongo/calculate-pass-on-fee.ts";
import { Lalamove } from "@shared/integrations/lalamove/mod.ts";

type VariantDetails = Awaited<
  ReturnType<typeof OrderRepository.getDetailsByVariantIds>
>[number];

type AddressRow = NonNullable<
  Awaited<ReturnType<typeof AddressRepository.getById>>
>;

export type PreparedOrderAddress = Omit<AddressRow, "id" | "isDefault">;
export type PreparedOrderItem = Omit<VariantDetails, "id"> & {
  variantId: VariantDetails["id"];
  quantity: CreateOrderInput["items"][number]["quantity"];
  cardMessages: CreateOrderInput["items"][number]["cardMessages"];
  primaryImageUrl: CreateOrderInput["items"][number]["primaryImageUrl"];
};

export type PreparedCreateOrderData = {
  orderAddress: PreparedOrderAddress;
  orderItems: PreparedOrderItem[];
  order: InsertOrder;
};

/**
 * Validates order input and prepares all necessary data for persistence.
 *
 * This function performs critical business logic:
 * 1. Checks if the delivery address exists.
 * 2. Verifies that all requested product variants exist and are available.
 * 3. Fetches a real-time shipping quotation.
 * 4. Calculates the financial breakdown (subtotal, shipping, discounts).
 * 5. Applies a "Pass-on Fee" (gateway fees charged to the customer based on payment method).
 * 6. Sets the order expiration (e.g., 24 hours).
 *
 * @returns A structured object containing the prepared address, items, and the order itself.
 */
export const prepareCreateOrderData = async (
  db: DrizzleClient,
  profileId: string,
  payload: Omit<CreateOrderInput, "fromCart">,
): Promise<PreparedCreateOrderData> => {
  const address = await AddressRepository.getById(db, payload.addressId);
  if (!address) throw AppError.notFound({ message: "Address not found" });

  const { isDefault: _isDefault, id: _id, ...orderAddress } = address;

  const payloadVariantIds = [
    ...new Set(
      payload.items
        .map((item) => item.variantId)
        .filter((id): id is string => !!id),
    ),
  ];

  const existingVariants = await OrderRepository.getDetailsByVariantIds(
    db,
    payloadVariantIds,
  );

  const existingVariantMap = new Map(
    existingVariants.map(({ id, ...rest }) => [id, { variantId: id, ...rest }]),
  );

  const missingIds = payloadVariantIds.filter(
    (id) => !existingVariantMap.has(id),
  );
  if (missingIds.length) {
    throw AppError.badRequest({
      message: `The following product variant ids are not available: ${missingIds.join(", ")}`,
    });
  }

  const orderItems: PreparedOrderItem[] = payload.items.map((item) => {
    const variant = existingVariantMap.get(item.variantId);

    if (!variant) {
      throw AppError.badRequest({
        message: `Variant not found: ${item.variantId}`,
      });
    }

    return {
      ...variant,
      quantity: item.quantity,
      cardMessages: item.cardMessages,
      primaryImageUrl: item.primaryImageUrl,
    };
  });

  const shippingQuote = await Lalamove.getQuotation(payload.shippingQuoteId);
  const shippingCents = Math.round(
    Number(shippingQuote.priceBreakdown.total) * 100,
  );

  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  const discountCents = 0;
  const totalPriceCents = subtotalCents + shippingCents - discountCents;

  const passOnFeeCents = calculatePassOnFee(
    totalPriceCents,
    payload.paymentMethodType,
  );

  const sellingPriceCents = totalPriceCents + passOnFeeCents;
  const now = new Date();

  const order = {
    profileId,
    subtotalCents,
    shippingCents,
    passOnFee: passOnFeeCents,
    totalCents: sellingPriceCents,
    discountCents,
    status: "to_pay",
    source: payload.source,
    serviceType: payload.serviceType,
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
  } satisfies InsertOrder;

  return {
    orderAddress,
    orderItems,
    order,
  };
};
