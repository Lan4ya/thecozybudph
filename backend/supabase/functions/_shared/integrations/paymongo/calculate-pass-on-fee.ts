import { PaymentMethodTypes } from "@shared/package-types/index.ts";

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
) => {
  const { fixed, mdr } = fees[paymentMethodType];
  const chargeAmount = Math.ceil((originalPriceCents + fixed) / (1 - mdr));
  return chargeAmount - originalPriceCents;
};
