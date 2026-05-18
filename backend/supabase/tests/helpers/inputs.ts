import {
  CreateAddressInput,
  CreateOrderInput,
  CreateProductInput,
  CreateShippingQuoteInput,
  PayOrderInput,
} from "@shared/schemas/index.ts";

export const genCreateProductInput = (): CreateProductInput => ({
  name: "Rose Bouquet",
  description: "Test description",
  categoryName: "flowers",
  collectionName: "summer",

  productImages: [new File([""], "dummy-1.png", { type: "image/png" })],

  primaryImageIndex: 0,

  options: [
    {
      name: "size",
      values: ["small", "medium"],
    },
  ],

  variants: [
    {
      priceCents: 10000,
      attributes: {
        size: "small",
      },
    },
    {
      priceCents: 15000,
      attributes: {
        size: "medium",
      },
    },
  ],
});

export function genCreateProductForm(
  overrides: Partial<CreateProductInput> = {},
): FormData {
  const form = new FormData();

  const data: CreateProductInput = {
    name: "Rose Bouquet",
    description: "Test description",
    categoryName: "flowers",
    collectionName: "summer",
    primaryImageIndex: 0,
    productImages: [new File(["abc"], "test.jpg", { type: "image/jpeg" })],

    options: [{ name: "size", values: ["small", "medium"] }],

    variants: [
      {
        priceCents: 10000,
        attributes: { size: "small" },
      },
      {
        priceCents: 15000,
        attributes: { size: "medium" },
      },
    ],

    ...overrides,
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (key === "options" || key === "variants") {
      form.set(key, JSON.stringify(value));
      continue;
    }

    if (key === "productImages") {
      for (const file of value as File[]) {
        form.append("productImages", file);
      }
      continue;
    }

    form.set(key, String(value));
  }

  return form;
}

export const genCreateAddressInput = (): CreateAddressInput => ({
  fullName: "Lan4ya 404",
  region: "NCR",
  city: "Manila",
  province: "Sampaloc",
  postalCode: "1008",
  barangay: "411",
  addressLine: "Tuazon Street",
  phoneNumber: "+639171234567",
  isDefault: true,
});

export const createShippingQuotationInput = (): CreateShippingQuoteInput => ({
  recipientAddress: {
    postalCode: "1008",
    region: "NCR",
    province: "Sampaloc Manila",
    city: "Metro Manila",
    barangay: "411",
    addressLine: "1462 G Tuazon St.",
  },
  senderAddress: {
    postalCode: "1550",
    region: "NCR",
    province: "Mandaluyong City",
    city: "Metro Manila",
    barangay: "Barangka Ilaya",
    addressLine: "Edsa Corner Pioneer Street",
  },
  serviceType: "motorcycle",
});

export const genCreateOrderInput = (params: {
  addressId: string;
  productId: string;
  variantId: string;
  shippingQuoteId: string;
}): CreateOrderInput => ({
  source: "shop",
  addressId: params.addressId,
  items: [
    {
      productId: params.productId,
      variantId: params.variantId,
      cardMessages: [],
      quantity: 2,
      primaryImageUrl:
        "http://127.0.0.1:54321/storage/v1/object/public/products/e940a49c-96ca-45d6-b0b4-88aae5bb0440",
    },
  ],
  shippingQuoteId: params.shippingQuoteId,
  paymentMethodType: "gcash",
  serviceType: "motorcycle",
});

export const genPayOrderInput = (params: {
  paymentId: string;
  // other params later?
}): PayOrderInput => ({
  paymentId: params.paymentId,
  billing: {
    name: "test",
    email: "test@gmail.com",
  },
  type: "gcash",
  checkoutSessionId: "9ec2e6a5-5482-4961-945f-ec6a9cbda07c",
});
