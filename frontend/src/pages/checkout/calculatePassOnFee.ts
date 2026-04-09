import type { PaymentMethodTypes } from "@TheCozyBud/types";

// WARN: This is nothing more than a ui price preview. we won't send any sort of
// price or fees on backend since client side code can be abused easily. All
// the calculations will and should happen in server side.

// Transaction fees: https://developers.paymongo.com/docs/dashboard-navigation-billing
const BRANKAS_FIXED_CENTS_FEE = 1500; // 15php
const BRANKAS_MDR_RATE = 0.01; // 1% rate
const GCASH_MDR_RATE = 0.02; // 2% rate

const fees = {
  brankas: { mdr: BRANKAS_MDR_RATE, fixed: BRANKAS_FIXED_CENTS_FEE },
  gcash: { mdr: GCASH_MDR_RATE, fixed: 0 },
};

// How to calculte pass on fees: https://developers.paymongo.com/docs/pass-on-fee
export const calculatePassOnFee = (
  originalPriceCents: number,
  paymentMethodType: PaymentMethodTypes,
): number => {
  const { fixed, mdr } = fees[paymentMethodType];
  const chargeAmount = Math.ceil((originalPriceCents + fixed) / (1 - mdr));
  return chargeAmount - originalPriceCents;
};
