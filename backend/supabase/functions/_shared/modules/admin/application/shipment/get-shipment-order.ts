import { DrizzleClient } from "@shared/db/client.ts";
import { ShipmentRepository } from "@shared/modules/admin/application/shipment/shipment-repository.ts";
import { GetShipmentOrderData } from "@shared/schemas/index.ts";

export const getShipmentOrder = async (
  db: DrizzleClient,
  orderId: string,
): Promise<GetShipmentOrderData> => {
  return await ShipmentRepository.getByOrderId(db, orderId);
};
