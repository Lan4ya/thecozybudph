import * as addresses from "./addresses.ts";
import * as carts from "./carts.ts";
import * as orders from "./orders.ts";
import * as shipments from "./shipments.ts";
import * as products from "./products.ts";
import * as payments from "./payments.ts";
import * as profiles from "./profiles.ts";
import * as infra from "./infra.ts";
import * as imageSnapshots from "./image_snapshots.ts";
import * as eventInquiries from "./event-inquiries.ts";

export const drizzleSchemas = {
  ...addresses,
  ...carts,
  ...orders,
  ...shipments,
  ...products,
  ...payments,
  ...profiles,
  ...infra,
  ...imageSnapshots,
  ...eventInquiries,
};

export * from "./addresses.ts";
export * from "./carts.ts";
export * from "./orders.ts";
export * from "./shipments.ts";
export * from "./products.ts";
export * from "./payments.ts";
export * from "./profiles.ts";
export * from "./infra.ts";
export * from "./image_snapshots.ts";
export * from "./event-inquiries.ts";
