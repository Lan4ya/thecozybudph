import { z } from "zod";

export const orderStatusSchema = z.enum([
  "toPay, toShip, toReceive, completed, cancelled",
]);
