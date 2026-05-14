import { calculatePassOnFee } from "../../integrations/paymongo/calculate-pass-on-fee.ts";
import { PaymentMethodTypes } from "../../schemas/index.ts";

type PricingInput = {
  orderItems: {
    priceCents: number;
    quantity: number;
  }[];

  shippingCents: number;

  discountCents?: number;

  paymentMethodType: PaymentMethodTypes;
};

type PricingBreakdown = {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalPriceCents: number;
  passOnFeeCents: number;
  sellingPriceCents: number;
};

export function calculatePricing({
  orderItems,
  shippingCents,
  discountCents = 0,
  paymentMethodType,
}: PricingInput): PricingBreakdown {
  const subtotalCents = orderItems.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  const totalPriceCents = subtotalCents + shippingCents - discountCents;

  const passOnFeeCents = calculatePassOnFee(totalPriceCents, paymentMethodType);

  const sellingPriceCents = totalPriceCents + passOnFeeCents;

  return {
    subtotalCents,
    shippingCents,
    discountCents,
    totalPriceCents,
    passOnFeeCents,
    sellingPriceCents,
  };
}
