import { z } from "zod";
import { apiSuccessResponseSchema } from "./_response.ts";
import { serviceTypeSchema } from "../common.ts";

export const coordinatesSchema = z.object({
  lat: z
    .string()
    .trim()
    .refine(
      (v) => {
        const n = Number(v);
        return !Number.isNaN(n) && n >= -90 && n <= 90;
      },
      { message: "latitude must be between -90 and 90" },
    ),

  lng: z
    .string()
    .trim()
    .refine(
      (v) => {
        const n = Number(v);
        return !Number.isNaN(n) && n >= -180 && n <= 180;
      },
      { message: "longitude must be between -180 and 180" },
    ),
});

export const stopSchema = z.object({
  id: z.uuid().optional(),

  coordinates: coordinatesSchema,

  address: z
    .string()
    .trim()
    .min(1, "address is required")
    .max(500, "address cannot exceed 500 characters"),
});

export const stopWithContactSchema = stopSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(255, "name cannot exceed 255 characters"),

  phone: z
    .string()
    .trim()
    .min(5, "phone number is too short")
    .max(30, "phone number cannot exceed 30 characters"),

  remarks: z.string().trim().optional(),
  POD: z.record(z.string(), z.unknown()).optional(),
});

const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^-?\d+(\.\d{1,2})?$/, {
    message: "must be a valid monetary amount",
  });

export const shipmentPriceBreakdownSchema = z.object({
  base: moneyStringSchema.optional(),
  extraMileage: moneyStringSchema.optional(),
  surcharge: moneyStringSchema.optional(),
  coupon: moneyStringSchema.optional(),
  specialRequests: moneyStringSchema.optional(),
  priorityFee: moneyStringSchema.optional(),
  priorityFeeVat: moneyStringSchema.optional(),
  specialVehicle: moneyStringSchema.optional(),
  minimumSurcharge: moneyStringSchema.optional(),
  discountCap: moneyStringSchema.optional(),
  insurance: moneyStringSchema.optional(),
  multiStopSurcharge: moneyStringSchema.optional(),
  surchargeDiscount: moneyStringSchema.optional(),
  vat: moneyStringSchema.optional(),
  customerSupportDiscretionary: moneyStringSchema.optional(),
  totalBeforeOptimization: moneyStringSchema.optional(),
  totalExcludePriorityFee: moneyStringSchema.optional(),
  total: moneyStringSchema,
  currency: z
    .string()
    .trim()
    .length(3, "currency must be ISO 4217 format")
    .transform((v) => v.toUpperCase()),
});

export const shipmentStatusSchema = z.enum([
  "ASSIGNING_DRIVER",
  "ON_GOING",
  "PICKED_UP",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
]);

export const podStatusSchema = z.enum(["FAILED", "SIGNED", "DELIVERED"]);

export const shipmentDriverSchema = z.object({
  id: z.string(),
  contact: z.object({
    name: z.string(),
    phone: z.string(),
  }),
  plateNumber: z.string(),
  photo: z.url(),
  coordinates: coordinatesSchema,
  updatedAt: z.date(),
});

// ------------------------ REQUEST SCHEMAS ------------------------

export const shipOrderSchema = z.object({
  remarks: z.string().optional(),
});

export const createShippingQuoteSchema = z.object({
  recipientAddressId: z.uuid(),
  serviceType: serviceTypeSchema.optional(),
});

// export const shippingQuoteSchema = z.object({
//   serviceType: z.enum(
//     ["MOTORCYCLE", "SEDAN"],
//     "invalid serviceType, value must be 'MOTORCYCLE' or 'SEDAN'",
//   ),
//   stops: z.array(stopSchema).max(2, "stops should only have 2 items"),
// });

const contactSchema = z.object({
  stopId: z.string().trim().min(1, "stopId can't be empty"),
  name: z.string().trim().min(1, "name can't be empty"),
  phone: z.string().trim().min(1, "phone can't be empty"),
});

const recipientSchema = contactSchema.extend({
  remarks: z.string().trim().default(""),
});

export const createShippingOrderSchema = z.object({
  quotationId: z.string().trim().min(1, "quotationId can't be empty"),
  sender: contactSchema,
  recipients: z
    .array(recipientSchema)
    .min(1, "at least one recipient is required"),
  isPODEnabled: z.boolean().optional(),
  isRecipientSMSEnabled: z.boolean().optional(),
  partner: z.string().trim().min(1, "partner can't be empty").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const patchOrderStopSchema = z.object({
  coordinates: coordinatesSchema.optional(),
  address: z.string().trim().min(1, "address can't be empty"),
  name: z.string().trim().min(1, "name can't be empty").optional(),
  phone: z.string().trim().min(1, "phone can't be empty").optional(),
  remarks: z.string().trim().min(1, "remarks can't be empty").optional(),
});

export const editShippingOrderSchema = z.object({
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  stops: z.array(patchOrderStopSchema).min(1, "at least one stop is required"),
});

export const addShippingOrderPriorityFeeSchema = z.object({
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  fee: z
    .string()
    .trim()
    .regex(/^\d+(\.\d+)?$/, "fee must be a valid numeric string"),
});

export const getShippingDriverSchema = z.object({
  driverId: z.string().trim().min(1, "driverId can't be empty"),
  orderId: z.string().trim().min(1, "orderId can't be empty"),
});

export const changeShippingDriverSchema = z.object({
  driverId: z.string().trim().min(1, "driverId can't be empty"),
  orderId: z.string().trim().min(1, "orderId can't be empty"),
  reason: z.string().trim().min(1, "reason can't be empty"),
});

export const getShippingCitySchema = z.object({
  cityId: z.string().trim().min(1, "cityId can't be empty"),
});

// ------------------------ DATA SCHEMAS ------------------------

export const getShippingDriverDataSchema = shipmentDriverSchema;

export const getShippingCityDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string().optional(),
});

export const getShippingMarketDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  cities: z.array(getShippingCityDataSchema),
});

export const shipOrderDataSchema = z.object({
  orderId: z.uuid(),

  lalamoveOrderId: z.string().nullable(),
  lalamoveQuotationId: z.string().nullable(),
  scheduleAt: z.date().nullable(),
  shipmentStatus: shipmentStatusSchema.nullable(),
  shareLink: z.string().nullable(),
  totalCents: z.number().nullable(),

  // POD fields
  PODImageUrl: z.string().nullable(),
  PODStatus: podStatusSchema.nullable(),
  PODFailedAt: z.date().nullable(),
  PODDeliveredAt: z.date().nullable(),

  // Driver fields
  driverId: z.string().nullable(),
  driverName: z.string().nullable(),
  driverPhone: z.string().nullable(),
  driverImageUrl: z.string().nullable(),
  driverShareLink: z.url().nullable(),
  driverLocation: z.string().nullable(),
  driverPlateNumber: z.string().nullable(),

  cancelParty: z.string().nullable(),
  cancelReason: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getShipmentOrderDataSchema = shipOrderDataSchema;

// Matches Lalamove.IQuotation
export const createShippingQuoteDataSchema = z.object({
  id: z.uuid(),
  scheduleAt: z.date().meta({
    type: "string",
    format: "date-time",
    nullable: false,
  }),
  serviceType: z
    .string()
    .trim()
    .min(1, "service type is required")
    .max(100, "service type cannot exceed 100 characters"),
  specialRequests: z.array(
    z
      .string()
      .trim()
      .min(1, "special request cannot be empty")
      .max(255, "special request cannot exceed 255 characters"),
  ),
  expiresAt: z.date(),
  priceBreakdown: shipmentPriceBreakdownSchema,
  isRouteOptimized: z.boolean(),
  stops: z.array(stopSchema).min(1, "at least one stop is required"),
});

// ------------------------ RESPONSE SCHEMAS ------------------------

export const changeShippingDriverResponseSchema = apiSuccessResponseSchema(
  changeShippingDriverSchema,
);

export const createShippingQuoteResponseSchema = apiSuccessResponseSchema(
  z.array(createShippingQuoteDataSchema),
);

export const shipOrderResponseSchema =
  apiSuccessResponseSchema(shipOrderDataSchema);

export const getShippingOrderResponseSchema = apiSuccessResponseSchema(
  getShipmentOrderDataSchema,
);

export const getShippingDriverResponseSchema = apiSuccessResponseSchema(
  getShippingDriverDataSchema,
);

export const getShippingCityResponseSchema = apiSuccessResponseSchema(
  getShippingCityDataSchema,
);

export const getShippingMarketResponseSchema = apiSuccessResponseSchema(
  getShippingMarketDataSchema,
);

export const addShippingOrderPriorityFeeResponseSchema =
  apiSuccessResponseSchema(getShipmentOrderDataSchema);

export const editShippingOrderResponseSchema = apiSuccessResponseSchema(
  getShipmentOrderDataSchema,
);
