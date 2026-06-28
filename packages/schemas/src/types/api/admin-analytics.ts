import type z from "zod";
import type { adminAnalyticsDataSchema } from "../../zod/index.ts";

export type AdminAnalyticsData = z.infer<typeof adminAnalyticsDataSchema>;
