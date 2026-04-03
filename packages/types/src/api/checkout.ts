export type CreatePendingCheckoutRes = {
  order: {
    source: string;
    id: string;
    profileId: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    status: string;
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    totalCents: number;
    items: {
      quantity: number;
      cardMessages: string[];
      id: string;
      productId: string | null;
      name: string;
      primaryImageUrl: string;
      priceCents: number;
      productVariantId: string | null;
      orderId: string;
      collection: string | null;
      category: string;
      variantAttributes: Record<string, string>;
    }[];
    address: {
      id: string;
      fullName: string;
      postalCode: string;
      region: string;
      city: string;
      province: string;
      barangay: string;
      addressLine: string;
      phoneNumber: string;
      orderId: string;
    };
  };
  payment: {
    id: string;
    method: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    status: string;
    orderId: string;
    paymentIntentId: string;
    paymentId: string | null;
    amountCents: number;
    currency: string;
    paidAt: Date | null;
  };
  redirectUrls: {
    url: string;
    returnUrl: string;
  };
};
