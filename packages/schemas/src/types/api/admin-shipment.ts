import type z from "zod";
import type {
  serviceTypeSchema,
  createShippingQuoteSchema,
  patchOrderStopSchema,
  createShippingOrderSchema,
  editShippingOrderSchema,
  addShippingOrderPriorityFeeSchema,
  getShippingDriverSchema,
  changeShippingDriverSchema,
  getShippingCitySchema,
  stopWithContactSchema,
  stopSchema,
  coordinatesSchema,
  createShippingQuoteDataSchema,
  shipOrderSchema,
  shipOrderDataSchema,
  getShipmentOrderDataSchema,
  getShippingDriverDataSchema,
  getShippingCityDataSchema,
  getShippingMarketDataSchema,
  shipmentPriceBreakdownSchema,
} from "../../zod/index.ts";
import type { isEqual, Expect } from "../utils.ts";
import type { IQuotation } from "@lalamove/lalamove-js";

export type ServiceType = z.infer<typeof serviceTypeSchema>;

export type ShipOrderInput = z.infer<typeof shipOrderSchema>;

export type CreateShippingQuoteInput = z.infer<
  typeof createShippingQuoteSchema
>;

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

export type StopWithContact = z.infer<typeof stopWithContactSchema>;
export type Stop = z.infer<typeof stopSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type PriceBreakdown = z.infer<typeof shipmentPriceBreakdownSchema>;

export type ShipOrderData = z.infer<typeof shipOrderDataSchema>;
export type GetShipmentOrderData = z.infer<typeof getShipmentOrderDataSchema>;

export type GetShippingOrderData = z.infer<typeof getShipmentOrderDataSchema>;
export type GetShippingDriverData = z.infer<typeof getShippingDriverDataSchema>;
export type GetShippingCityData = z.infer<typeof getShippingCityDataSchema>;
export type GetShippingMarketData = z.infer<typeof getShippingMarketDataSchema>;

// Test to make sure the schema type aligns with Lalamove's quote shape.
// Will error if not equal
void (0 as unknown as Expect<isEqual<CreateShippingQuoteData, IQuotation>>);

export type CreateShippingQuoteData = z.infer<
  typeof createShippingQuoteDataSchema
>;
