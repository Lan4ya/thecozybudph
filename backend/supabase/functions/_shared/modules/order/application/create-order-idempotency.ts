import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import {
  CreateOrderInput,
  CreateOrderRes,
  idempotencyKeys,
} from "@shared/schemas/index.ts";
import { and, eq } from "drizzle-orm";

export const CREATE_ORDER_IDEMPOTENCY_OPERATION = "create_order";

type BeginIdempotencyResult =
  | {
      kind: "replay";
      response: CreateOrderRes;
    }
  | {
      kind: "claimed";
      requestHash: string;
    };

const toStableJson = (value: unknown): string => {
  if (value === null || value === undefined) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => toStableJson(item)).join(",")}]`;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sortedEntries = Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${toStableJson(record[key])}`);
    return `{${sortedEntries.join(",")}}`;
  }

  return JSON.stringify(value);
};

const hashPayload = async (payload: unknown): Promise<string> => {
  const data = new TextEncoder().encode(toStableJson(payload));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const isCreateOrderRes = (value: unknown): value is CreateOrderRes => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.orderId === "string" &&
    typeof candidate.paymentId === "string"
  );
};

export const beginCreateOrderIdempotency = async (
  db: DrizzleClient,
  params: {
    profileId: string;
    payload: CreateOrderInput;
    idempotencyKey: string;
  },
): Promise<BeginIdempotencyResult> => {
  const { idempotencyKey, payload, profileId } = params;
  const requestHash = await hashPayload(payload);

  const [claimedIdempotencyKey] = await db.admin
    .insert(idempotencyKeys)
    .values({
      profileId,
      operation: CREATE_ORDER_IDEMPOTENCY_OPERATION,
      idempotencyKey,
      requestHash,
      status: "processing",
    })
    .onConflictDoNothing()
    .returning({ id: idempotencyKeys.id });

  if (claimedIdempotencyKey) {
    return {
      kind: "claimed",
      requestHash,
    };
  }

  const existingIdempotencyKey = await db.admin.query.idempotencyKeys.findFirst({
    where: and(
      eq(idempotencyKeys.profileId, profileId),
      eq(idempotencyKeys.operation, CREATE_ORDER_IDEMPOTENCY_OPERATION),
      eq(idempotencyKeys.idempotencyKey, idempotencyKey),
    ),
    columns: {
      requestHash: true,
      status: true,
      responsePayload: true,
    },
  });

  if (!existingIdempotencyKey) {
    throw AppError.conflict(
      "Idempotency conflict detected but no request record was found",
    );
  }

  if (existingIdempotencyKey.requestHash !== requestHash) {
    throw AppError.conflict(
      "This Idempotency-Key was already used with a different payload",
    );
  }

  if (existingIdempotencyKey.status === "completed") {
    if (!isCreateOrderRes(existingIdempotencyKey.responsePayload)) {
      throw AppError.internal(
        "Completed idempotent create-order request has invalid response payload",
      );
    }

    return {
      kind: "replay",
      response: existingIdempotencyKey.responsePayload,
    };
  }

  if (existingIdempotencyKey.status === "processing") {
    throw AppError.conflict(
      "Order creation is already in progress for this Idempotency-Key",
    );
  }

  const [reclaimedIdempotencyKey] = await db.admin
    .update(idempotencyKeys)
    .set({
      status: "processing",
      responsePayload: null,
      errorPayload: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(idempotencyKeys.profileId, profileId),
        eq(idempotencyKeys.operation, CREATE_ORDER_IDEMPOTENCY_OPERATION),
        eq(idempotencyKeys.idempotencyKey, idempotencyKey),
        eq(idempotencyKeys.requestHash, requestHash),
        eq(idempotencyKeys.status, "failed"),
      ),
    )
    .returning({ id: idempotencyKeys.id });

  if (!reclaimedIdempotencyKey) {
    throw AppError.conflict(
      "Unable to reclaim failed idempotent create-order request",
    );
  }

  return {
    kind: "claimed",
    requestHash,
  };
};

export const completeCreateOrderIdempotency = async (
  db: DrizzleClient,
  params: {
    profileId: string;
    idempotencyKey: string;
    requestHash: string;
    response: CreateOrderRes;
  },
) => {
  const { idempotencyKey, profileId, requestHash, response } = params;

  const [completedIdempotencyKey] = await db.admin
    .update(idempotencyKeys)
    .set({
      status: "completed",
      responsePayload: response,
      errorPayload: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(idempotencyKeys.profileId, profileId),
        eq(idempotencyKeys.operation, CREATE_ORDER_IDEMPOTENCY_OPERATION),
        eq(idempotencyKeys.idempotencyKey, idempotencyKey),
        eq(idempotencyKeys.requestHash, requestHash),
        eq(idempotencyKeys.status, "processing"),
      ),
    )
    .returning({ id: idempotencyKeys.id });

  if (!completedIdempotencyKey) {
    throw AppError.conflict("Failed to finalize idempotent create-order request");
  }
};

export const failCreateOrderIdempotency = async (
  db: DrizzleClient,
  params: {
    profileId: string;
    idempotencyKey: string;
    requestHash: string;
    error: unknown;
  },
) => {
  const { error, idempotencyKey, profileId, requestHash } = params;
  const errorMessage =
    error instanceof Error ? error.message : "Unknown create-order error";

  await db.admin
    .update(idempotencyKeys)
    .set({
      status: "failed",
      errorPayload: { message: errorMessage },
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(idempotencyKeys.profileId, profileId),
        eq(idempotencyKeys.operation, CREATE_ORDER_IDEMPOTENCY_OPERATION),
        eq(idempotencyKeys.idempotencyKey, idempotencyKey),
        eq(idempotencyKeys.requestHash, requestHash),
        eq(idempotencyKeys.status, "processing"),
      ),
    );
};
