import { DrizzleClient } from "../../../db/client.ts";
import { InsertPayment } from "../../../db/types/payments.ts";
import { AppError } from "../../../errors/Errors.ts";
import {
  attachPaymentIntent,
  createPaymentIntent,
  createPaymentMethod,
} from "../../../integrations/paymongo/mod.ts";
import {
  CreatePaymentInput,
  CreatePaymentRes,
} from "@shared/package-types/index.ts";
import { isDev } from "../../../utils/isDev.ts";
import { OrderRepository } from "../../order/order-repository.ts";
import { PaymentRepository } from "../payment-repository.ts";

const APP_URL = Deno.env.get("APP_URL");

export const createPayment = async (
  db: DrizzleClient,
  payload: CreatePaymentInput,
  profileId: string,
  idempotencyKey?: string,
): Promise<CreatePaymentRes> => {
  if (!idempotencyKey) throw AppError.badRequest("Missing Idempotency Key");

  const order = await OrderRepository.getByIdAndProfileId(
    db,
    payload.orderId,
    profileId,
  );

  if (!order) throw AppError.notFound("Order not found");

  // Paymongo Payment Workflow
  const paymentIntentData = await createPaymentIntent(
    {
      amountCents: order.totalCents,
      paymentMethodType: payload.type,
    },
    idempotencyKey,
  );

  const paymentMethodData = await createPaymentMethod(payload, idempotencyKey);

  const attachedPaymentMethodData = await attachPaymentIntent({
    paymentIntentId: paymentIntentData.id,
    paymentMethodId: paymentMethodData.id,
    returnUrl: isDev ? "http://localhost:5173" : APP_URL!,
  });

  // DEBUG:
  // if (isDev) {
  // console.log({ paymentIntentData });
  // console.log({ paymentMethodData });
  // console.log({ attachedPaymentMethodData });
  // }

  const redirectUrls =
    attachedPaymentMethodData.attributes.next_action.redirect;

  const inserts: InsertPayment = {
    orderId: order.id,
    status: "pending",
    currency: "PHP",
    paymentIntentId: paymentIntentData.id,
    method: paymentMethodData.attributes.type,
    amountCents: paymentIntentData.attributes.amount,
  };

  const data = await PaymentRepository.insertPendingPayment(db, inserts);
  return {
    ...data,
    redirectUrls: {
      paymentUrl: redirectUrls.url,
      returnUrl: redirectUrls.return_url,
    },
  };
};
