import {
  DBEventInquiryStatus,
  eventInquiries,
  InsertEventInquiry,
} from "@shared/schemas/index.ts";
import { and, desc, eq, sql } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";

export const EventInquiryRepository = {
  create: async (db: DrizzleClient, data: InsertEventInquiry) => {
    const [row] = await db.admin
      .insert(eventInquiries)
      .values(data)
      .returning();
    return row;
  },

  getById: async (db: DrizzleClient, id: string) => {
    return await db.admin.query.eventInquiries.findFirst({
      where: eq(eventInquiries.id, id),
    });
  },

  query: async (
    db: DrizzleClient,
    params: {
      profileId?: string;
      status?: DBEventInquiryStatus;
      limit: number;
      offset: number;
    },
  ) => {
    const { profileId, status, limit, offset } = params;

    return await db.admin
      .select()
      .from(eventInquiries)
      .where(
        and(
          profileId ? eq(eventInquiries.profileId, profileId) : undefined,
          status ? eq(eventInquiries.status, status) : undefined,
        ),
      )
      .orderBy(desc(eventInquiries.createdAt))
      .limit(limit)
      .offset(offset);
  },

  update: async (
    db: DrizzleClient,
    id: string,
    data: Partial<InsertEventInquiry>,
  ) => {
    const [row] = await db.admin
      .update(eventInquiries)
      .set({
        ...data,
        updatedAt: sql`now()`,
      })
      .where(eq(eventInquiries.id, id))
      .returning();
    return row;
  },
};
