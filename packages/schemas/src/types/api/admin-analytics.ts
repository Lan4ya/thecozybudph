import type z from "zod";
import type { adminAnalyticsSchema } from "../../zod/index.ts";

export type AdminAnalyticsRes = z.infer<typeof adminAnalyticsSchema>;
