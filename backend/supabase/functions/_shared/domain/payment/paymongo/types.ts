// Since paymongo's SDK is scaffolding/codegen and not a runtime lib. what happens is
// that it won't work on edge functions that needs actual executatble ESM
// modules through import_maps. What I did here instead is manual call of their
// api endpoint. Downside of this tho is that I have to do manual typing of the
// api response (idk even if their SDK is typed). For that reason I'm not gonna type the full response for less
// headaches, only the ones that are really needed. For the full response see
// the Postman workspace already configured or test it on their website:
// https://developers.paymongo.com/reference/create-a-paymentintent

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

export interface CreatePaymentMethodResponse {
  data: {
    id: string;
    type: "payment_method";
    attributes: {
      type: "gcash" | "card";
      billing: {
        name: string;
        email: string;
      };
    };
  };
}

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
