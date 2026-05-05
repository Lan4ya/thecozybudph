import Lalamove from "@lalamove/lalamove-js";
import z from "zod";
import {
  addShippingOrderPriorityFeeSchema,
  adminQueryOrdersSchema,
  adminShipOrderSchema,
  changeShippingDriverSchema,
  createShippingOrderSchema,
  createShippingQuoteSchema,
  editShippingOrderSchema,
  getShippingCitySchema,
  getShippingDriverSchema,
  patchOrderStopSchema,
  quoteStop,
  serviceTypeSchema,
  shippingQuoteSchema,
} from "../../zod/index.ts";
import { AdminOrderListItem } from "../domain/admin.ts";

export type AdminQueryOrdersInput = z.infer<typeof adminQueryOrdersSchema>;

export type AdminQueryOrdersRes = {
  orders: AdminOrderListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type AdminShipOrderInput = z.infer<typeof adminShipOrderSchema>;

export type ServiceType = z.infer<typeof serviceTypeSchema>;

export type QuoteStop = z.infer<typeof quoteStop>;
export type ShippingQuote = z.infer<typeof shippingQuoteSchema>;

export type CreateShippingQuoteInput = z.infer<
  typeof createShippingQuoteSchema
>;
export type CreateQuotationsRes = Lalamove.IQuotation[];

export type PatchOrderStop = z.infer<typeof patchOrderStopSchema>;
export type CreateShippingOrderInput = z.infer<
  typeof createShippingOrderSchema
>;
export type EditShippingOrderInput = z.infer<typeof editShippingOrderSchema>;
export type AddShippingOrderPriorityFeeInput = z.infer<
  typeof addShippingOrderPriorityFeeSchema
>;
export type GetShippingDriverInput = z.infer<typeof getShippingDriverSchema>;
export type ChangeShippingDriverInput = z.infer<
  typeof changeShippingDriverSchema
>;
export type GetShippingCityInput = z.infer<typeof getShippingCitySchema>;
