import { and, eq, ne, sql } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { AppError } from "../../errors/Errors.ts";
import { InsertAddress, Address, addresses } from "@shared/schemas/index.ts";

export const AddressRepository = {
  insert: async (
    db: DrizzleClient,
    addressInsert: InsertAddress & { profileId: string },
  ) => {
    return await db.rls(async (tx) => {
      // Acquires a transaction-scoped advisory lock keyed by profileId.
      // Ensures only one transaction at a time can operate on this profile’s addresses,
      // preventing race conditions (e.g., multiple concurrent inserts bypassing the 10-address limit).
      await tx.execute(sql` select
        pg_advisory_xact_lock(hashtext(${addressInsert.profileId})) `);

      // Count existing addresses for this profile
      const [countResult] = await tx
        .select({ c: sql<number>`count(*)` })
        .from(addresses)
        .where(eq(addresses.profileId, addressInsert.profileId!))
        .execute();

      const count = Number(countResult.c);

      if (count >= 10) {
        throw AppError.badRequest("Cannot have more than 10 addresses");
      }

      // If this new address is set as default, unset any existing default first
      if (addressInsert.isDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(addresses.profileId, addressInsert.profileId),
              eq(addresses.isDefault, true),
            ),
          );
      }

      // auto default if there's no any other address yet
      const isDefault = count === 0 || addressInsert.isDefault;

      // Insert new address
      const [inserted] = await tx
        .insert(addresses)
        .values({ ...addressInsert, isDefault })
        .returning();

      return inserted;
    });
  },

  update: async (
    db: DrizzleClient,
    id: string,
    addressUpdate: Partial<InsertAddress>,
  ) => {
    return await db.rls(async (tx) => {
      // Get the current address to know its profileId and current isDefault status
      const [currentAddress] = await tx
        .select({
          profileId: addresses.profileId,
          isDefault: addresses.isDefault,
        })
        .from(addresses)
        .where(eq(addresses.id, id))
        .limit(1);

      if (!currentAddress) {
        throw AppError.notFound("Address not found");
      }

      // If we're setting this address as default, unset any existing default first
      if (addressUpdate.isDefault === true) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(
            and(
              eq(addresses.profileId, currentAddress.profileId!),
              eq(addresses.isDefault, true),
              // Don't unset this address if it's already default
              ne(addresses.id, id),
            ),
          );
      }

      if (
        addressUpdate.isDefault === false &&
        currentAddress.isDefault === true
      ) {
        // Do not let the user unset a default address to false. If we allow
        // that, one option would be to update another address as default
        // automatically as fallback but it's a sloppy UX. Instead control the
        // UI to not let users be able to unset a default, making this just a
        // guard and should never be triggered. This behavior is similar to
        // Shoppee's address update feature.
        throw AppError.badRequest(
          "Cannot unset default address. Set another address as default instead.",
        );
      }

      // Update the address
      const [updated] = await tx
        .update(addresses)
        .set(addressUpdate)
        .where(eq(addresses.id, id))
        .returning();

      return updated;
    });
  },

  getById: (db: DrizzleClient, id: string) =>
    db.rls(
      async (tx) =>
        await tx.query.addresses.findFirst({
          where: (addresses, { eq }) => eq(addresses.id, id),
          columns: {
            id: true,
            fullName: true,
            postalCode: true,
            region: true,
            city: true,
            province: true,
            barangay: true,
            addressLine: true,
            phoneNumber: true,
          },
        }),
    ),

  getDefault: (db: DrizzleClient, profileId: string) =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq, and }) =>
          and(
            eq(addresses.isDefault, true),
            eq(addresses.profileId, profileId),
          ),
        columns: {
          id: true,
          fullName: true,
          postalCode: true,
          region: true,
          city: true,
          province: true,
          barangay: true,
          addressLine: true,
          phoneNumber: true,
          isDefault: true,
        },
      });
    }),

  getByProfileId: (db: DrizzleClient, profileId: string): Promise<Address[]> =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findMany({
        where: (addresses, { eq }) => eq(addresses.profileId, profileId),
        columns: {
          id: true,
          fullName: true,
          postalCode: true,
          region: true,
          city: true,
          province: true,
          barangay: true,
          addressLine: true,
          phoneNumber: true,
          isDefault: true,
        },
      });
    }),
};
