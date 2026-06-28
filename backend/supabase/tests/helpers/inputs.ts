import {
  CreateAddressInput,
  CreateOrderInput,
  CreateProductInput,
  CreateShippingQuoteInput,
  PayOrderInput,
  ShipOrderInput,
} from "@shared/schemas/index.ts";
import { CreateLalamoveQuoteInput } from "@shared/integrations/lalamove/create-lalamove-quotation.ts";

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

export const createShippingQuotationInput = (params: {
  recipientAddressId: string;
}): CreateShippingQuoteInput => ({
  recipientAddressId: params.recipientAddressId,
  serviceType: "motorcycle",
});

export const genLalamoveQuoteInput = (
  address: CreateLalamoveQuoteInput["recipientAddress"],
) => ({
  senderAddress: {
    region: "NCR",
    city: "Mandaluyong City",
    postalCode: "1550",
    barangay: "Barangka Ilaya",
    addressLine: "Edsa Corner Pioneer Street",
    latitude: "14.5794000",
    longitude: "121.0359000",
  },
  recipientAddress: {
    region: address.region,
    city: address.city,
    postalCode: address.postalCode,
    barangay: address.barangay,
    addressLine: address.addressLine,
    province: address.province,
    latitude: address.latitude,
    longitude: address.longitude,
  },
  serviceType: "motorcycle",
});

export const genCreateOrderInput = (params: {
  addressId: string;
  productId: string;
  variantId: string;
  shippingQuoteId: string;
  primaryImageUrl?: string;
}): CreateOrderInput => ({
  source: "shop",
  fromCart: false,
  addressId: params.addressId,
  items: [
    {
      productId: params.productId,
      variantId: params.variantId,
      cardMessages: [],
      quantity: 2,
      primaryImageUrl:
        params.primaryImageUrl ??
        "http://127.0.0.1:54321/storage/v1/object/public/products/dummy",
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
});

export const genAdminShipOrderInput = (p?: ShipOrderInput): ShipOrderInput => ({
  remarks: p?.remarks ?? "Handle with care",
});
