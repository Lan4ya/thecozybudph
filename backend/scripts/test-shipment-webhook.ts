import { getAdminSession } from "./helpers/getSession.ts";

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

const { SUPABASE_URL } = process.env;

export const ADMIN_EMAIL = "admin@local.dev";
export const ADMIN_PASSWORD = "password123";

function getArg(name: string): string {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) {
    console.error(
      "Usage: pn dev:webhook --id <lalamove_order_id> --status <status>",
    );
    process.exit(1);
  }
  return process.argv[index + 1];
}

const lalamoveId = getArg("id");
const status = getArg("status") as LalamoveShipmentStatus;

async function webhookEventSimulation() {
  const session = await getAdminSession();
  const token = session.access_token;

  switch (status) {
    case "ON_GOING":
      {
        // Simulate DRIVER_ASSIGNED
        const driverEvent: DriverAssignedEvent = {
          eventId: "evt_driver_111",
          eventType: "DRIVER_ASSIGNED",
          data: {
            driver: {
              driverId: "DRV_888",
              name: "Juan Dela Cruz",
              phone: "+639171234567",
              photo: "",
              plateNumber: "ABC 1234",
            },
            location: {
              // Near Araneta City, Cubao, Quezon City
              lat: 14.6197,
              lng: 121.0531,
            },
            order: { orderId: lalamoveId },
          },
        };

        const response = await fetch(
          `${SUPABASE_URL}/functions/v1/admin/shipment/webhook`,
          {
            method: "POST",
            headers: {
              // NOTE: ommiting Auth header is needed to pass webhook handler verification in dev
              "Content-Type": "application/json",
            },
            body: JSON.stringify(driverEvent),
          },
        );

        console.log("✅ Simulating DRIVER_ASSIGNED completed.");
        console.log("Response status:", response.status);
        console.log("Response body:", await response.text());
      }
      break;
  }

  const statusEvent: OrderStatusEvent = {
    eventId: "evt_status_222",
    eventType: "ORDER_STATUS_CHANGED",
    data: {
      order: {
        orderId: lalamoveId,
        status,
        scheduleAt: new Date().toISOString(),
        shareLink: "https://lalamove.com",
      },
    },
  };

  const statusResponse = await fetch(
    `${SUPABASE_URL}/functions/v1/admin/shipment/webhook`,
    {
      method: "POST",
      headers: {
        // NOTE: ommiting Auth header is needed to passs webhook handler verification in dev
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusEvent),
    },
  );
  console.log(`✅ Done simulating ORDER_STATUS_CHANGED ${status}.`);
  console.log("Response status:", statusResponse.status);
  console.log("Response body:", await statusResponse.text());
}

webhookEventSimulation().catch(console.error);
