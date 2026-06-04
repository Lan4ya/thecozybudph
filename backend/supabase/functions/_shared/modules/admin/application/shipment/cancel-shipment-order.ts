import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { Lalamove } from "@shared/integrations/lalamove/mod.ts";
import { shipments } from "@shared/schemas/drizzle/shipments.ts";
import { eq } from "drizzle-orm";

export const cancelShipmentOrder = async (
  db: DrizzleClient,
  orderId: string,
): Promise<{ success: boolean }> => {
  const [shipment] = await db.admin
    .select({
      lalamoveOrderId: shipments.lalamoveOrderId,
      shipmentStatus: shipments.shipmentStatus,
      updatedAt: shipments.updatedAt,
    })
    .from(shipments)
    .where(eq(shipments.orderId, orderId));

  if (!shipment || !shipment.lalamoveOrderId)
    throw AppError.notFound({ message: "Shipment not found" });

  const isDriverOnGoingFor5Minutes =
    Date.now() - new Date(shipment.updatedAt).getTime() >= 5 * 60 * 1000;

  if (shipment.shipmentStatus === "ON_GOING" && isDriverOnGoingFor5Minutes) {
    throw AppError.conflict({
      message:
        "Cannot cancel shipment that has been ongoing for more than 5 minutes",
    });
  }

  if (
    shipment.shipmentStatus !== "ASSIGNING_DRIVER" &&
    shipment.shipmentStatus !== "ON_GOING"
  ) {
    throw AppError.conflict({
      message:
        "Shipment can only be cancelled while a driver is being assigned or is on the way.",
      cause:
        "Shipment status must be 'ASSIGNING_DRIVER' or 'ON_GOING' to cancel",
    });
  }

  try {
    await Lalamove.cancelOrder(shipment.lalamoveOrderId);

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError({
      status: 500,
      message:
        error instanceof Error
          ? error.message
          : "Failed to cancel shipment order",
      cause: error,
    });
  }
};
