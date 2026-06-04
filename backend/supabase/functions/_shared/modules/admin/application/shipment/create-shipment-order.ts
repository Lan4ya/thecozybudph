import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { AddressRepository } from "@shared/modules/address/address-repository.ts";
import { ShipmentRepository } from "@shared/modules/admin/application/shipment/shipment-repository.ts";
import { shipments } from "@shared/schemas/drizzle/shipments.ts";
import {
  ShipOrderData,
  ShipOrderInput,
  orderAddressesSnapshot,
  orders,
} from "@shared/schemas/index.ts";
import { ShipmentStatus } from "@shared/schemas/types/db/shipment.ts";
import { eq } from "drizzle-orm";

export const createShipmentOrder = async (
  db: DrizzleClient,
  payload: ShipOrderInput,
  orderId: string,
): Promise<ShipOrderData> => {
  const [orderDetails] = await db.admin
    .select({
      id: orders.id,
      status: orders.status,
      serviceType: orders.serviceType,

      recipientAddress: {
        fullName: orderAddressesSnapshot.fullName,
        phoneNumber: orderAddressesSnapshot.phoneNumber,
        postalCode: orderAddressesSnapshot.postalCode,
        region: orderAddressesSnapshot.region,
        city: orderAddressesSnapshot.city,
        province: orderAddressesSnapshot.province,
        barangay: orderAddressesSnapshot.barangay,
        addressLine: orderAddressesSnapshot.addressLine,
        latitude: orderAddressesSnapshot.latitude,
        longitude: orderAddressesSnapshot.longitude,
      },

      // shipment details
      shipmentOrderId: shipments.lalamoveOrderId,
      shipmentStatus: shipments.shipmentStatus,
    })
    .from(orders)
    .leftJoin(shipments, eq(orders.id, shipments.orderId))
    .leftJoin(
      orderAddressesSnapshot,
      eq(orders.id, orderAddressesSnapshot.orderId),
    )
    .where(eq(orders.id, orderId));

  if (!orderDetails) {
    throw AppError.notFound({ message: "Order not found" });
  }

  const { recipientAddress: rawRecipient, ...order } = orderDetails;

  if (order.status !== "paid") {
    throw AppError.badRequest({
      message: `Cannot ship order with status: ${order.status}. Order must be 'paid'.`,
    });
  }

  const retryableShipmentStatuses: ShipmentStatus[] = [
    "EXPIRED",
    "REJECTED",
    "CANCELLED",
  ];

  if (
    order.shipmentOrderId &&
    !retryableShipmentStatuses.includes(order.shipmentStatus)
  ) {
    throw AppError.badRequest({
      message:
        "This order already has a shipment in progress. Please cancel the existing shipment before creating a new one",
      cause: `order has existing shipment with status "${order.shipmentStatus}". Only ${retryableShipmentStatuses.join(", ")} shipments can be retried`,
    });
  }

  if (!rawRecipient) {
    throw AppError.badRequest({
      message: "Recipient address record not found",
    });
  }

  const rawSenderAddress = await AddressRepository.getCompanyWithCoords(db);

  if (!rawSenderAddress) {
    throw AppError.internal({
      cause: "Invariant violation: Company address not found or missing",
    });
  }

  const {
    fullName: recipientFullName,
    phoneNumber: recipientPhone,
    ...recipientAddress
  } = rawRecipient;

  const {
    fullName: senderFullName,
    phoneNumber: senderPhone,
    ...senderAddress
  } = rawSenderAddress;

  try {
    // Create Lalamove quotes  TODO: reuse quote from checkout if not expired
    const [quotation] = await Lalamove.createQuotation({
      senderAddress,
      recipientAddress,
      serviceType: order.serviceType,
    });

    const senderStop = quotation.stops[0];
    const recipientStop = quotation.stops[1];

    if (!senderStop.id || !recipientStop.id) {
      throw AppError.internal({
        message: "Failed to retrieve stop IDs from quotation",
      });
    }

    // Place Lalamove Order
    const lalamoveOrder = await Lalamove.createOrder({
      quotationId: quotation.id,
      sender: {
        stopId: senderStop.id,
        name: senderFullName,
        phone: senderPhone,
      },
      recipients: [
        {
          stopId: recipientStop.id,
          name: recipientFullName,
          phone: recipientPhone,
          remarks: payload.remarks ?? "",
        },
      ],
      isPODEnabled: true, // Proof of delivery (driver's photo confirmation)
      isRecipientSMSEnabled: true,
    });

    // No need to assign driver details yet. we'll assign it later once a driver
    // accepts the job through a webhook handler intecepting 'DRIVER_ASSIGNED' event.
    return await ShipmentRepository.upsertShipmentWithOrderStatusUpdate(db, {
      orderId: orderDetails.id,
      lalamoveOrderId: lalamoveOrder.id,
      lalamoveQuotationId: quotation.id,
      shipmentStatus: lalamoveOrder.status as unknown as ShipmentStatus,
      totalCents: Number(lalamoveOrder.priceBreakdown.total),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError({
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during shipping",
      cause: error,
    });
  }
};
