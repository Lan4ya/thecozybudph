import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { getAddressByCoords } from "@shared/integrations/geoapify/get-address-by-coordinates.ts";
import { ShipmentRepository } from "@shared/modules/admin/application/shipment/shipment-repository.ts";
import { DBOrderStatus } from "@shared/schemas/index.ts";
import { isDev } from "@shared/utils/isDev.ts";
import { verifySignature } from "./verify-signature.ts"; // Adjust path to your utility file

// Lalamove Webhook Specs: https://developers.lalamove.com/files/v3_Webhook_v1.5.pdf

// https://developers.lalamove.com/#order-flow-order-status
export type LalamoveShipmentStatus =
  | "ASSIGNING_DRIVER"
  | "ON_GOING"
  | "PICKED_UP"
  | "CANCELED" // yes, lalamove uses single L for status
  | "COMPLETED"
  | "REJECTED"
  | "EXPIRED";

const mapLalamoveStatusToOrderStatus = (
  lalamoveStatus: NonNullable<LalamoveShipmentStatus>,
): DBOrderStatus => {
  switch (lalamoveStatus) {
    case "ASSIGNING_DRIVER":
      return "to_ship"; // Still looking for driver or driver assigned but not picked up

    case "ON_GOING":
      return "to_ship"; // Driver en route to pickup/delivery

    case "PICKED_UP":
      return "shipped"; // Driver has package, in transit

    case "COMPLETED":
      return "fulfilled"; // Successfully delivered

    case "CANCELED":
      return "paid"; // Admin or Lalamove cancelled, need rebooking

    case "REJECTED":
      return "paid"; // Drivers rejected, need rebooking

    case "EXPIRED":
      return "paid"; // No driver accepted in time, need rebooking

    default:
      throw AppError.internal({
        message: `Unknown Lalamove order status: ${lalamoveStatus}`,
      });
  }
};

interface OrderStatusEvent {
  eventId: string;
  eventType: "ORDER_STATUS_CHANGED";
  data: {
    order: {
      orderId: string;
      status: NonNullable<LalamoveShipmentStatus>;
      scheduleAt: string;
      shareLink: string;
      cancelReason?: string;
      cancelParty?: string;
    };
    updatedAt: string;
  };
}

interface OrderAmountChangedEvent {
  eventId: string;
  eventType: "ORDER_AMOUNT_CHANGED";
  data: {
    order: {
      orderId: string;
      price: {
        totalPrice: number;
      };
    };
  };
}

interface DriverAssignedEvent {
  eventId: string;
  eventType: "DRIVER_ASSIGNED";
  data: {
    driver: {
      driverId: string;
      name: string;
      phone: string;
      photo: string;
      plateNumber: string;
    };
    location: {
      lat: number;
      lng: number;
    };
    order: {
      orderId: string;
    };
  };
}

type PODStatus = "FAILED" | "SIGNED" | "DELIVERED";

type Stops = [
  // pickup fields (not needed)
  unknown,
  // dropoff fields (we' only care about POD status here)
  {
    POD: {
      status: PODStatus;
      image?: string;
      failedAt?: string;
      delieveredAt?: string;
    };
  },
];

interface PODStatusChangedEvent {
  eventId: string;
  eventType: "POD_STATUS_CHANGED";
  data: {
    order: {
      orderId: string;
      stops: Stops;
    };
  };
}

const parseLalamoveDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;

  // Try standard parsing first
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Lalamove sometimes sends "2026-06-13T14:59.00Z" (note the . instead of : for seconds)
  // We try to fix it by replacing the first dot after 'T' with a colon
  // Match T18:07.00Z -> T18:07:00Z
  // Also handle timezone offsets like +08:00
  const fixed = dateStr.replace(
    /(T\d{2}:\d{2})\.(\d{2}(?:Z|[+-]\d{2}:\d{2}))$/,
    "$1:$2",
  );

  const dFixed = new Date(fixed);
  if (!isNaN(dFixed.getTime())) {
    return dFixed;
  }

  console.error(`Failed to parse date: "${dateStr}"`);
  return null;
};
export const handleShipmentWebhook = async (
  db: DrizzleClient,
  rawBody: string,
  authorizationHeader?: string,
): Promise<{ success: boolean }> => {
  // HANDSHAKE: Instantly accept empty test pings from Lalamove's registration system
  if (!rawBody || rawBody.trim() === "") {
    console.log("[Webhook] Received empty body (handshake), returning success");
    return { success: true };
  }

  // DEV BYPASS: Skip verification in local development if header is absent
  if (isDev && !authorizationHeader) {
    console.log(
      "[Webhook] isDev is true and Authorization header is missing, skipping verification and proceeding",
    );
    // NOTE: We should probably NOT return early here if we want to process the payload in dev
    // but the current logic does it. I'll change it to proceed if there's a body.
  } else {
    if (!authorizationHeader) {
      throw AppError.badRequest({ message: "Missing Authorization header" });
    }

    // SECURITY: Verify the signature using the updated Lalamove spec utility
    const isValid = verifySignature(rawBody, authorizationHeader);
    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      throw AppError.forbidden({ message: "Invalid signature" });
    }
  }

  // BUSINESS LOGIC: Parse and route the verified event payload safely
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
    console.log("Successfully verified and parsed Lalamove payload:", payload);
  } catch (_err) {
    throw AppError.badRequest({ message: "Malformed JSON payload body" });
  }

  const { eventType, eventId, data } = payload as
    | OrderStatusEvent
    | DriverAssignedEvent
    | OrderAmountChangedEvent
    | PODStatusChangedEvent;

  console.log(`Processing Lalamove event: ${eventType} (${eventId})`);

  // List of order status: https://developers.lalamove.com/#order-flow-order-status
  switch (eventType) {
    case "ORDER_STATUS_CHANGED":
      {
        const { status, orderId, scheduleAt, shareLink } =
          data.order as OrderStatusEvent["data"]["order"];
        console.log(
          `[Webhook] ORDER_STATUS_CHANGED: status=${status}, lalamoveOrderId=${orderId}`,
        );

        const parsedScheduleAt = parseLalamoveDate(scheduleAt);
        const parsedUpdatedAt = parseLalamoveDate(data.updatedAt);

        await ShipmentRepository.updateShipmentWithOrderStatusUpdate(db, {
          shipmentStatus: status === "CANCELED" ? "CANCELLED" : status,
          shareLink,
          lalamoveOrderId: orderId,
          ...(parsedScheduleAt && { scheduleAt: parsedScheduleAt }),
          ...(data.order.cancelParty && {
            cancelParty:
              data.order.cancelParty === "USER"
                ? "ADMIN"
                : data.order.cancelParty,
          }),
          ...(data.order.cancelReason && {
            cancelReason: data.order.cancelReason,
          }),
          ...(parsedUpdatedAt && { shipmentStatusUpdatedAt: parsedUpdatedAt }),

          orderStatus: mapLalamoveStatusToOrderStatus(status),
        });
      }
      break;

    case "DRIVER_ASSIGNED":
      {
        const { location, driver, order } = data as DriverAssignedEvent["data"];

        console.log(
          `[Webhook] DRIVER_ASSIGNED: lalamoveOrderId=${order.orderId}, driver=${driver.name}`,
        );

        const geoApifyLocation = await getAddressByCoords(
          location.lat,
          location.lng,
        );
        console.log("Resolved driver location via Geoapify:", geoApifyLocation);

        const driverLocation = geoApifyLocation.city;

        await ShipmentRepository.updateShipmentWithOrderStatusUpdate(db, {
          lalamoveOrderId: order.orderId,
          driverId: driver.driverId,
          driverName: driver.name,
          driverPhone: driver.phone,
          driverImageUrl: driver.photo,
          driverPlateNumber: driver.plateNumber,
          driverLocation,
        });
      }
      break;

    case "ORDER_AMOUNT_CHANGED":
      {
        const { order } = data as OrderAmountChangedEvent["data"];
        console.log(
          `[Webhook] ORDER_AMOUNT_CHANGED: lalamoveOrderId=${order.orderId}, price=${order.price.totalPrice}`,
        );

        await ShipmentRepository.updateShipmentWithOrderStatusUpdate(db, {
          totalCents: order.price.totalPrice,
          lalamoveOrderId: order.orderId,
        });
      }
      break;

    case "POD_STATUS_CHANGED":
      {
        const { order } = data as PODStatusChangedEvent["data"];
        const POD = order.stops[1].POD;
        console.log(
          `[Webhook] POD_STATUS_CHANGED: lalamoveOrderId=${order.orderId}, status=${POD.status}`,
        );

        const parsedFailedAt = parseLalamoveDate(POD.failedAt);
        const parsedDeliveredAt = parseLalamoveDate(POD.delieveredAt);

        await ShipmentRepository.updateShipmentWithOrderStatusUpdate(db, {
          lalamoveOrderId: order.orderId,
          PODStatus: POD.status as unknown as PODStatus,
          PODImageUrl: POD.image,
          ...(parsedFailedAt && { PODFailedAt: parsedFailedAt }),
          ...(parsedDeliveredAt && {
            PODDeliveredAt: parsedDeliveredAt,
          }),
        });
      }
      break;

    default:
      console.log(`[Webhook] Unhandled event type: ${eventType}`);
      break;
  }

  return { success: true };
};
