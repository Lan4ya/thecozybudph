import { eq, sql } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { addresses } from "../../db/schema/addresses.ts";
import { AddressInsert } from "../../db/types/addresses.ts";
import { AppError } from "../../errors/Errors.ts";

export const AddressRepository = {
  insert: async (db: DrizzleClient, address: AddressInsert) => {
    return await db.rls(async (tx) => {
      // Count existing addresses for this profile
      const [countResult] = await tx
        .select({ c: sql<number>`count(*)` })
        .from(addresses)
        .where(eq(addresses.profileId, address.profileId!))
        .execute();

      console.log({ countResult });

      if (countResult.c >= 3) {
        throw AppError.badRequest("Cannot have more than 3 addresses");
      }

      // Insert new address
      const [inserted] = await tx.insert(addresses).values(address).returning();
      return inserted;
    });
  },

  update: async (
    db: DrizzleClient,
    id: string,
    address: Partial<AddressInsert>,
  ) => {
    return await db.rls(async (tx) => {
      const [updated] = await tx
        .update(addresses)
        .set(address)
        .where(eq(addresses.id, id))
        .returning();

      return updated;
    });
  },

  getById: async (db: DrizzleClient, id: string) =>
    await db.rls(async (tx) => {
      const [address] = await tx
        .select({
          id: addresses.id,
          fullName: addresses.fullName,
          postalCode: addresses.postalCode,
          region: addresses.region,
          city: addresses.city,
          province: addresses.province,
          barangay: addresses.barangay,
          addressLine: addresses.addressLine,
          phoneNumber: addresses.phoneNumber,
        })
        .from(addresses)
        .where(eq(addresses.id, id));

      return address;
    }),

  getByProfileId: (db: DrizzleClient, profileId: string) =>
    db.rls(async (tx) => {
      const address = await tx
        .select({
          id: addresses.id,
          fullName: addresses.fullName,
          postalCode: addresses.postalCode,
          region: addresses.region,
          city: addresses.city,
          province: addresses.province,
          barangay: addresses.barangay,
          addressLine: addresses.addressLine,
          phoneNumber: addresses.phoneNumber,
        })
        .from(addresses)
        .where(eq(addresses.profileId, profileId));

      return address;
    }),
};
