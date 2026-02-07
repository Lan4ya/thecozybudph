import { PaymentsRow } from "../db/payment.ts";
import { SnakeToCamel } from "../utils/snakeToCamelCase.ts";

export type Payment = SnakeToCamel<PaymentsRow>;
