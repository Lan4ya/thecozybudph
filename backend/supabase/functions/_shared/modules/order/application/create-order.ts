import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { CreateOrderInput, CreateOrderRes } from "@shared/schemas/index.ts";
import { SupabaseDB } from "../../../types.d.ts";
import {
  beginCreateOrderIdempotency,
  completeCreateOrderIdempotency,
  failCreateOrderIdempotency,
} from "./create-order-idempotency.ts";
import { prepareCreateOrderData } from "./create-order-prep.ts";
import {
  createOrderSnapshots,
  rollbackOrderSnapshots,
} from "./create-order-snapshots.ts";
import { persistCreateOrderTransaction } from "./create-order-transaction.ts";

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

  if (!idempotencyKey) {
    throw AppError.badRequest({ message: "Missing Idempotency-Key" });
  }

  const idempotencyResult = await beginCreateOrderIdempotency(db, {
    profileId,
    payload,
    idempotencyKey,
  });

  if (idempotencyResult.kind === "replay") {
    return idempotencyResult.response;
  }

  const incrementedSnapshotHashes: string[] = [];

  try {
    const preparedOrderData = await prepareCreateOrderData(
      db,
      profileId,
      payload,
    );
    const snapshotUrlByHash = await createOrderSnapshots(
      db,
      supabaseService,
      preparedOrderData.orderItems,
      incrementedSnapshotHashes,
    );

    const createdOrder = await persistCreateOrderTransaction(db, {
      profileId,
      order: preparedOrderData.order,
      orderAddress: preparedOrderData.orderAddress,
      orderItems: preparedOrderData.orderItems,
      snapshotUrlByHash,
    });

    await completeCreateOrderIdempotency(db, {
      profileId,
      idempotencyKey,
      requestHash: idempotencyResult.requestHash,
      response: createdOrder,
    });

    return createdOrder;
  } catch (error) {
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
