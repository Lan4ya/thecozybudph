import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { DrizzleClient } from "../../db/client.ts";
import { AppError } from "../../errors/Errors.ts";
import {
  InsertAddress,
  addresses,
  orderAddressesSnapshot,
} from "@shared/schemas/index.ts";

const getMutationSelection = () => ({
  id: addresses.id,
  fullName: addresses.fullName,
  postalCode: addresses.postalCode,
  region: addresses.region,
  city: addresses.city,
  province: addresses.province,
  barangay: addresses.barangay,
  addressLine: addresses.addressLine,
  phoneNumber: addresses.phoneNumber,
  isDefault: addresses.isDefault,
});

const baseColumns = {
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
} as const;

async function ensureCompanyAddress(db: DrizzleClient) {
  try {
    await db.admin.insert(addresses).values({
      fullName: "The Cozy Bud",
      postalCode: "1550",
      region: "NCR",
      city: "Mandaluyong",
      province: "Metro Manila",
      barangay: "Barangka Ilaya",
      addressLine: "Edsa Corner Pioneer Street",
      phoneNumber: "+639170000000",
      isDefault: true,
      isCompanyAddress: true,
      latitude: "14.5739000",
      longitude: "121.0447000",
      profileId: null,
    });
  } catch (_err) {
    // Ignore unique constraint violations (race condition)
  }
}

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
        throw AppError.badRequest({
          message: "Cannot have more than 10 addresses",
        });
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

      // If this new address is a company address, unset any existing company address first
      if (addressInsert.isCompanyAddress) {
        await tx
          .update(addresses)
          .set({ isCompanyAddress: false })
          .where(eq(addresses.isCompanyAddress, true));
      }

      // Auto default if there's no any other address yet
      const isDefault = count === 0 || addressInsert.isDefault;

      // Insert new address
      const [inserted] = await tx
        .insert(addresses)
        .values({ ...addressInsert, isDefault })
        .returning(getMutationSelection());

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
        throw AppError.notFound({ message: "Address not found" });
      }

      // If updating the address as default, unset any existing default first
      if (addressUpdate.isDefault === true) {
        await tx
          .update(addresses)
          .set({
            isDefault: false,
            // For admin address specifically (default address is the company
            // address) unset also the isCompanyAddress flag to prevent
            // multiple company addresses
            isCompanyAddress: false,
          })
          .where(
            and(
              eq(addresses.profileId, currentAddress.profileId!),
              eq(addresses.isDefault, true),
              // If new address is already the default then NOOP
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
        throw AppError.badRequest({
          message:
            "Cannot unset default address. Set another address as default instead.",
        });
      }

      // Update the address
      const [updated] = await tx
        .update(addresses)
        .set(addressUpdate)
        .where(eq(addresses.id, id))
        .returning(getMutationSelection());

      return updated;
    });
  },

  delete: (db: DrizzleClient, id: string, profileId: string) =>
    db.rls(async (tx) => {
      return await tx
        .delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.profileId, profileId)))
        .returning({
          id: addresses.id,
        })
        .then((r) => r[0]);
    }),

  getById: (db: DrizzleClient, id: string) =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq }) => eq(addresses.id, id),
        columns: baseColumns,
      });
    }),

  getByIdWithCoords: (db: DrizzleClient, id: string) =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq }) => eq(addresses.id, id),
        columns: {
          ...baseColumns,
          latitude: true,
          longitude: true,
        },
      });
    }),

  getByIds: (db: DrizzleClient, ids: string[]) =>
    db.rls(async (tx) => {
      if (ids.length === 0) return [];

      return await tx.query.addresses.findMany({
        where: (addresses) => inArray(addresses.id, ids),
        columns: baseColumns,
      });
    }),

  getCompany: async (db: DrizzleClient) => {
    const existing = await db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq, and }) =>
          and(
            eq(addresses.isDefault, true),
            eq(addresses.isCompanyAddress, true),
          ),
        columns: baseColumns,
      });
    });

    if (existing) return existing;

    // Create company address if it doesn't exist (Lazy Seeding)
    await ensureCompanyAddress(db);

    return await db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq, and }) =>
          and(
            eq(addresses.isDefault, true),
            eq(addresses.isCompanyAddress, true),
          ),
        columns: baseColumns,
      });
    });
  },

  getCompanyWithCoords: async (db: DrizzleClient) => {
    const existing = await db.admin.query.addresses.findFirst({
      where: (addresses, { eq, and }) =>
        and(
          eq(addresses.isDefault, true),
          eq(addresses.isCompanyAddress, true),
        ),
      columns: {
        ...baseColumns,
        latitude: true,
        longitude: true,
      },
    });

    if (existing) return existing;

    // Create company address if it doesn't exist (Lazy Seeding)
    await ensureCompanyAddress(db);

    return await db.admin.query.addresses.findFirst({
      where: (addresses, { eq, and }) =>
        and(
          eq(addresses.isDefault, true),
          eq(addresses.isCompanyAddress, true),
        ),
      columns: {
        ...baseColumns,
        latitude: true,
        longitude: true,
      },
    });
  },

  getDefault: (db: DrizzleClient, profileId: string) =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findFirst({
        where: (addresses, { eq, and }) =>
          and(
            eq(addresses.isDefault, true),
            eq(addresses.profileId, profileId),
          ),
        columns: baseColumns,
      });
    }),

  getByProfileId: (db: DrizzleClient, profileId: string) =>
    db.rls(async (tx) => {
      return await tx.query.addresses.findMany({
        where: (addresses, { eq }) => eq(addresses.profileId, profileId),
        columns: baseColumns,
      });
    }),

  getSnapshotByOrderId: (db: DrizzleClient, orderId: string) =>
    db.admin.query.orderAddressesSnapshot.findFirst({
      where: eq(orderAddressesSnapshot.orderId, orderId),
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
        latitude: true,
        longitude: true,
      },
    }),
};
