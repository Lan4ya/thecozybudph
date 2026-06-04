import { DrizzleClient } from "@shared/db/client.ts";
import { shipments } from "@shared/schemas/drizzle/shipments.ts";
import { DBOrderStatus, orders } from "@shared/schemas/index.ts";
import {
  SelectShipment,
  ShipmentStatus,
  UpdateShipment,
} from "@shared/schemas/types/db/shipment.ts";
import { eq } from "drizzle-orm";
import { isDev } from "@shared/utils/isDev.ts";

export const ShipmentRepository = {
  getByOrderId: async (
    db: DrizzleClient,
    orderId: string,
  ): Promise<Omit<SelectShipment, "id">> => {
    const [row] = await db.admin
      .select({
        orderId: shipments.orderId,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,

        lalamoveOrderId: shipments.lalamoveOrderId,
        lalamoveQuotationId: shipments.lalamoveQuotationId,
        shipmentStatus: shipments.shipmentStatus,
        shipmentStatusUpdatedAt: shipments.shipmentStatusUpdatedAt,
        shareLink: shipments.shareLink,
        totalCents: shipments.totalCents,
        scheduleAt: shipments.scheduleAt,

        PODImageUrl: shipments.PODImageUrl,
        PODStatus: shipments.PODStatus,
        PODFailedAt: shipments.PODFailedAt,
        PODDeliveredAt: shipments.PODDeliveredAt,

        driverId: shipments.driverId,
        driverName: shipments.driverName,
        driverPhone: shipments.driverPhone,
        driverShareLink: shipments.driverShareLink,
        driverLocation: shipments.driverLocation,
        driverImageUrl: shipments.driverImageUrl,
        driverPlateNumber: shipments.driverPlateNumber,

        cancelParty: shipments.cancelParty,
        cancelReason: shipments.cancelReason,
      })
      .from(shipments)
      .where(eq(shipments.orderId, orderId));
    return row;
  },

  updateShipmentWithOrderStatusUpdate: async (
    db: DrizzleClient,
    params: {
      orderStatus?: DBOrderStatus;
      lalamoveOrderId: string;
    } & UpdateShipment,
  ): Promise<void> => {
    const { orderStatus, ...shipmentData } = params;

    return await db.admin.transaction(async (tx) => {
      isDev &&
        console.log(
          `[ShipmentRepository] Attempting to update shipment in DB. query: where lalamoveOrderId = "${shipmentData.lalamoveOrderId}"`,
        );

      // Update shipment
      const [result] = await tx
        .update(shipments)
        .set(shipmentData)
        .where(eq(shipments.lalamoveOrderId, shipmentData.lalamoveOrderId))
        .returning({
          orderId: shipments.orderId,
        });

      if (!result) {
        console.warn(
          `[ShipmentRepository] No shipment found with lalamoveOrderId: ${shipmentData.lalamoveOrderId}`,
        );
        return;
      }

      console.log(
        `[ShipmentRepository] Updated shipment for order: ${result.orderId}`,
      );

      if (orderStatus) {
        console.log(
          `[ShipmentRepository] Updating order status to: ${orderStatus} for order: ${result.orderId}`,
        );
        await tx
          .update(orders)
          .set({ status: orderStatus })
          .where(eq(orders.id, result.orderId))
          .returning({ status: orders.status });
      }
    });
  },

  upsertShipmentWithOrderStatusUpdate: async (
    db: DrizzleClient,
    params: {
      orderId: string;
      lalamoveOrderId: string;
      lalamoveQuotationId: string;
      shipmentStatus: ShipmentStatus;
      totalCents: number;
    },
  ) => {
    return await db.admin.transaction(async (tx) => {
      // Update order status
      await tx
        .update(orders)
        .set({ status: "to_ship" })
        .where(eq(orders.id, params.orderId));

      console.log(
        `[ShipmentRepository] Updating shipment status with status: ${params.shipmentStatus}`,
      );

      // Upsert shipment (book/rebook shipment)
      const [result] = await tx
        .insert(shipments)
        .values({
          orderId: params.orderId,
          lalamoveOrderId: params.lalamoveOrderId,
          lalamoveQuotationId: params.lalamoveQuotationId,
          shipmentStatus: params.shipmentStatus,
          totalCents: params.totalCents,
        })
        .onConflictDoUpdate({
          target: shipments.orderId,
          set: {
            lalamoveOrderId: params.lalamoveOrderId,
            lalamoveQuotationId: params.lalamoveQuotationId,
            shipmentStatus: params.shipmentStatus,
            totalCents: params.totalCents,

            // Reset stale fields
            shareLink: null,
            driverId: null,
            driverName: null,
            driverPhone: null,
            driverShareLink: null,
            driverImageUrl: null,
            driverPlateNumber: null,
            driverLocation: null,

            PODImageUrl: null,
            PODStatus: null,
            PODFailedAt: null,
            PODDeliveredAt: null,

            cancelParty: null,
            cancelReason: null,

            scheduleAt: null,
            shipmentStatusUpdatedAt: null,
            updatedAt: new Date(),
          },
        })
        .returning({
          orderId: shipments.orderId,
          createdAt: shipments.createdAt,
          updatedAt: shipments.updatedAt,

          lalamoveOrderId: shipments.lalamoveOrderId,
          lalamoveQuotationId: shipments.lalamoveQuotationId,
          shipmentStatus: shipments.shipmentStatus,
          shareLink: shipments.shareLink,
          totalCents: shipments.totalCents,
          scheduleAt: shipments.scheduleAt,

          PODImageUrl: shipments.PODImageUrl,
          PODStatus: shipments.PODStatus,
          PODFailedAt: shipments.PODFailedAt,
          PODDeliveredAt: shipments.PODDeliveredAt,

          driverId: shipments.driverId,
          driverName: shipments.driverName,
          driverPhone: shipments.driverPhone,
          driverShareLink: shipments.driverShareLink,
          driverLocation: shipments.driverLocation,
          driverImageUrl: shipments.driverImageUrl,
          driverPlateNumber: shipments.driverPlateNumber,

          cancelParty: shipments.cancelParty,
          cancelReason: shipments.cancelReason,
        });

      return result;
    });
  },
};
