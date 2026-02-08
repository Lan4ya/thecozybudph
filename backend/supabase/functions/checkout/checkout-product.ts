import { SupabaseType } from "@shared/types.d.ts";
import { OrderService } from "@shared/domain/order/mod.ts";
import { PaymentService } from "@shared/domain/payment/mod.ts";
import type { CheckoutInput } from "@shared/types/index.ts";

export const checkoutProduct = async (
  supabase: SupabaseType,
  payload: CheckoutInput,
  profileId: string,
) => {
  const { pendingOrder, orderItems } = await OrderService.createPendingOrder(
    supabase,
    payload.orderDetails,
    profileId,
  );

  const paymentDetailsInput = {
    orderId: pendingOrder.id,
    ...payload.paymentDetails,
  };

  const { pendingPayment, redirectUrls } =
    await PaymentService.createPendingPayment(supabase, paymentDetailsInput);

  return {
    order: {
      ...pendingOrder,
      orderItems,
    },
    payment: pendingPayment,
    redirectUrls,
  };
};
