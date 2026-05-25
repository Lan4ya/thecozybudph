import { CustomerOrderStatus } from "@shared/schemas/index.ts";
import { AppError } from "@shared/errors/Errors.ts";

export function toCustomerStatus(status: string): CustomerOrderStatus {
  switch (status) {
    case "to_pay":
      return "toPay";

    // Since this is for customers view, we won't show full details
    // so we compress paid and to_ship statuses into 'toShip'.
    case "paid":
      return "toShip";
    case "shipped":
      return "toShip";
    case "to_ship":
      return "toShip";

    case "to_receive":
      return "toReceive";

    case "fulfilled":
      return "fulfilled";

    case "cancelled":
      return "cancelled";

    default:
      throw AppError.internal({
        message: "Internal server error",
        cause: `Invariant violation: Invalid customer order status: ${status}`,
      });
  }
}
