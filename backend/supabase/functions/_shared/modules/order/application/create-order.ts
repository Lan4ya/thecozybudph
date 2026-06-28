import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { CreateOrderInput, CreateOrderRes } from "@shared/schemas/index.ts";
import { SupabaseDB } from "../../../types.d.ts";
import {
  beginCreateOrderIdempotency,
  failCreateOrderIdempotency,
} from "./_create-order-idempotency.ts";
import { prepareCreateOrderData } from "./_create-order-prep.ts";
import {
  createOrderSnapshots,
  rollbackOrderSnapshots,
} from "./_create-order-snapshots.ts";
import { persistCreateOrderTransaction } from "./_create-order-transaction.ts";

/**
 * Orchestrates the creation of a new order.
 *
 * This process is designed to be atomic and idempotent. It coordinates:
 * 1. Idempotency check: Prevents duplicate orders from network retries or double-clicks.
 * 2. Data Preparation: Retrieves data (prices, address, etc.) directly from DB for data integrity,
 * 3. Snapshotting: Creates permanent copies of product images and other details to preserve the order's
 *    state even if the original product is modified or deleted.
 * 4. Persistence: Saves the order and related records in a single database transaction.
 * 5. Cleanup/Rollback: Handles failure by recording errors and cleaning up orphan snapshots.
 *
 * @param db - Drizzle database client.
 * @param supabaseService - Supabase client for storage operations.
 * @param params - Contains profileId, payload, and the mandatory Idempotency-Key.
 * @returns orderId and paymentId.
 */
export const createOrder = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  params: {
    profileId: string;
    payload: CreateOrderInput;
    idempotencyKey?: string;
  },
): Promise<CreateOrderRes> => {
  const { profileId, payload, idempotencyKey } = params;
  const { fromCart, ...orderInput } = payload;

  if (!idempotencyKey) {
    throw AppError.badRequest({ message: "Missing Idempotency-Key" });
  }

  // Claim or replay idempotency key.
  const idempotencyResult = await beginCreateOrderIdempotency(db, {
    profileId,
    orderInput,
    idempotencyKey,
  });

  if (idempotencyResult.kind === "replay") {
    return idempotencyResult.response;
  }

  // Tracks which snapshot references we incremented so we can decrement them on failure.
  const incrementedSnapshotHashes: string[] = [];

  try {
    const preparedOrderData = await prepareCreateOrderData(
      db,
      profileId,
      orderInput,
    );

    const snapshotUrlByHash = await createOrderSnapshots(
      db,
      supabaseService,
      preparedOrderData.orderItems,
      incrementedSnapshotHashes,
    );

    const createdOrder = await persistCreateOrderTransaction(db, {
      profileId,
      fromCart,
      order: preparedOrderData.order,
      orderAddress: preparedOrderData.orderAddress,
      orderItems: preparedOrderData.orderItems,
      snapshotUrlByHash,
      idempotencyKey,
      requestHash: idempotencyResult.requestHash,
    });

    return createdOrder;
  } catch (error) {
    // Failure Handling:
    // Mark idempotency as failed so the client can retry with the same key.
    await failCreateOrderIdempotency(db, {
      profileId,
      idempotencyKey,
      requestHash: idempotencyResult.requestHash,
      error,
    });

    await rollbackOrderSnapshots(
      db,
      supabaseService,
      incrementedSnapshotHashes,
    );

    throw error;
  }
};
