import { z } from "zod";

export const ORDER_STATUS = [
  "toPay",
  "paid",
  "toShip",
  "shipped",
  "toReceive",
  "fulfilled",
  "cancelled",
  "expired",
] as const;

export const orderStatusSchema = z.enum(ORDER_STATUS);
export const orderSourceSchema = z.enum(["shop", "cart"]);
