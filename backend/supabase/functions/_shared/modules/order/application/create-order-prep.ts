import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { LalamoveActions } from "@shared/integrations/lalamove/mod.ts";
import { CreateOrderInput, InsertOrder } from "@shared/schemas/index.ts";
import { AddressRepository } from "../../address/address-repository.ts";
import { calculatePricing } from "../calculate-pricing.ts";
import { OrderRepository } from "../mod.ts";

type VariantDetails = Awaited<
  ReturnType<typeof OrderRepository.getDetailsByVariantIds>
>[number];
type AddressRow = NonNullable<Awaited<ReturnType<typeof AddressRepository.getById>>>;

export type PreparedOrderAddress = Omit<AddressRow, "id">;
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

export const prepareCreateOrderData = async (
  db: DrizzleClient,
  profileId: string,
  payload: CreateOrderInput,
): Promise<PreparedCreateOrderData> => {
  const address = await AddressRepository.getById(db, payload.addressId);
  if (!address) throw AppError.notFound("Address not found");

  const { id: _id, ...orderAddress } = address;

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

  const missingIds = payloadVariantIds.filter((id) => !existingVariantMap.has(id));
  if (missingIds.length) {
    throw AppError.badRequest(
      `The following product variant ids are not available: ${missingIds.join(", ")}`,
    );
  }

  const orderItems: PreparedOrderItem[] = payload.items.map((item) => {
    const variant = existingVariantMap.get(item.variantId);

    if (!variant) {
      throw AppError.badRequest(`Variant not found: ${item.variantId}`);
    }

    return {
      ...variant,
      quantity: item.quantity,
      cardMessages: item.cardMessages,
      primaryImageUrl: item.primaryImageUrl,
    };
  });

  const shippingQuote = await LalamoveActions.getShippingQuotation(
    payload.shippingQuoteId,
  );
  const shippingCents = Math.round(Number(shippingQuote.priceBreakdown.total) * 100);
  const { subtotalCents, discountCents, passOnFeeCents, sellingPriceCents } =
    calculatePricing({
      orderItems,
      shippingCents,
      paymentMethodType: payload.paymentMethodType,
    });

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
