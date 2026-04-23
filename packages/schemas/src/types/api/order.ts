import Lalamove from "@lalamove/lalamove-js";

export type CreateOrderRes = {
  orderId: string;
};

export type CreateQuotationsRes = Lalamove.IQuotation[];
