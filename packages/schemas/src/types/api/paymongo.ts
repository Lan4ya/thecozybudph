/*
 *  Since paymongo's SDK is scaffolding/codegen and not a runtime lib. what
 *  happens is that it can't be imported on edge functions that needs actual
 *  executatble ESM modules through import_maps. What I instead is manual call
 *  of their api endpoint. Downside of this tho is manual type maintainance.
 *  For that reason I'm only gonna type the data the app needs. For the full
 *  response, see the App Postman workspace or on their website:
 *  https://developers.paymongo.com/reference/create-a-paymentintent
 */

import type { PaymentMethodTypes } from "./payment.ts";

export type PaymentMethodInput = {
  type: PaymentMethodTypes;
  billing: {
    name: string;
    email: string;
  };
};
export type CreatePaymentMethodInput = PaymentMethodInput;

export interface CreatePaymentIntentResponse {
  data: {
    id: string;
    type: "payment_intent";
    attributes: {
      amount: number;
      client_key: string;
    };
  };
}

export type CreatePaymentIntentInput = {
  amountCents: number;
  paymentMethodType: PaymentMethodInput["type"];
};

export interface CreatePaymentMethodResponse {
  data: {
    id: string;
    type: "payment_method";
    attributes: {
      type: PaymentMethodInput["type"];
      billing: {
        name: string;
        email: string;
      };
    };
  };
}

export type AttachPaymentIntentInput = {
  paymentIntentId: string;
  paymentMethodId: string;
  returnUrl: string;
};

export interface AttachPaymentIntentResponse {
  data: {
    id: string;
    type: "payment_intent";
    attributes: {
      amount: number;
      client_key: string;
      next_action: {
        type: "redirect";
        redirect: {
          url: string;
          return_url: string;
        };
      };
    };
  };
}

// https://developers.paymongo.com/docs/creating-webhook
export type PayMongoWebhookEventPayload = {
  data?: {
    id?: string;
    attributes?: {
      type?:
        | "payment.paid"
        | "payment.failed"
        | "payment.refunded"
        | "payment.refunded.updated";
      data?: {
        id?: string;
        attributes?: {
          payment_intent_id?: string;
          paid_at?: number;
        };
      };
    };
  };
};
