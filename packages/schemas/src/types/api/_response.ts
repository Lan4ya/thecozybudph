import type { paths as ShipmentPaths } from "./openapi/shipment.ts";
import type { paths as AddressPaths } from "./openapi/address.ts";
import type { paths as AdminPaths } from "./openapi/admin.ts";
import type { paths as ProfilePaths } from "./openapi/profile.ts";
import type { paths as CartPaths } from "./openapi/cart.ts";
import type { paths as OrderPaths } from "./openapi/order.ts";
import {
  apiErrorResponseSchema,
  apiSuccessResponseSchema,
} from "../../zod/index.ts";
import { z } from "zod";

export const EDGE_FUNCTIONS = [
  "admin",
  "order",
  "cart",
  "profile",
  "address",
  "shipment",
] as const;

export type OpenApiPaths = {
  admin: AdminPaths;
  order: OrderPaths;
  cart: CartPaths;
  profile: ProfilePaths;
  address: AddressPaths;
  shipment: ShipmentPaths;
};

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type ApiSuccessResponse = z.infer<typeof apiSuccessResponseSchema>;
