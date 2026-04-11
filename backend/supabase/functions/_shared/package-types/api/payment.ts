export type CreatePaymentRes = {
  redirectUrls: {
    paymentUrl: string;
    returnUrl: string;
  };
  id: string;
  status: string;
};
