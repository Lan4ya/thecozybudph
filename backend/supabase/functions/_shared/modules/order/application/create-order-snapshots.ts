import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { ProductStorage } from "@shared/modules/product/product-storage.ts";
import { imageSnapshots } from "@shared/schemas/index.ts";
import { and, eq, sql } from "drizzle-orm";
import pLimit from "p-limit";
import { SupabaseDB } from "../../../types.d.ts";
import { formatSupabasePublicUrl } from "../../../utils/mod.ts";
import { isDev } from "../../../utils/isDev.ts";
import { parseSupabaseUrls } from "../parse-supabase-urls.ts";
import { PreparedOrderItem } from "./create-order-prep.ts";

export const createOrderSnapshots = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  orderItems: PreparedOrderItem[],
  incrementedSnapshotHashes: string[],
): Promise<Map<string, string>> => {
  const limit = pLimit(10);

  const uniqueHashes = Array.from(
    new Map(orderItems.map((item) => [item.primaryImageHash, item])).values(),
  );

  const snapshots = await Promise.all(
    uniqueHashes.map((img) =>
      limit(async () => {
        const hash = img.primaryImageHash;

        const [snapshotRecord] = await db.admin
          .insert(imageSnapshots)
          .values({ hash, refCount: 1 })
          .onConflictDoUpdate({
            target: imageSnapshots.hash,
            set: { refCount: sql`${imageSnapshots.refCount} + 1` },
          })
          .returning({ refCount: imageSnapshots.refCount });

        incrementedSnapshotHashes.push(hash);

        if (snapshotRecord.refCount === 1) {
          const { images, invalids } = parseSupabaseUrls([img.primaryImageUrl]);

          if (invalids.length) {
            throw AppError.badRequest({ message: `Invalid image URL: ${img.primaryImageUrl}` });
          }
          const image = images[0];

          const { data: blob, error } = await supabaseService.storage
            .from(image.bucket)
            .download(image.path);

          if (error || !blob) {
            throw (
              error ?? AppError.internal({ message: `Failed to download ${img.primaryImageUrl}` })
            );
          }

          const file = new File([blob], hash, {
            type: blob.type,
          });

          const { error: uploadError } = await supabaseService.storage
            .from("product_snapshots")
            .upload(hash, file, {
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }
        }

        const {
          data: { publicUrl },
        } = supabaseService.storage.from("product_snapshots").getPublicUrl(hash);

        return {
          sourceHash: hash,
          snapshotUrl: formatSupabasePublicUrl(publicUrl, isDev),
        };
      }),
    ),
  );

  return new Map(snapshots.map((snapshot) => [snapshot.sourceHash, snapshot.snapshotUrl]));
};

export const rollbackOrderSnapshots = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  incrementedSnapshotHashes: string[],
) => {
  if (!incrementedSnapshotHashes.length) {
    return;
  }

  await db.admin
    .transaction(async (tx) => {
      for (const hash of incrementedSnapshotHashes) {
        const [updated] = await tx
          .update(imageSnapshots)
          .set({
            refCount: sql`GREATEST(0, ${imageSnapshots.refCount} - 1)`,
          })
          .where(eq(imageSnapshots.hash, hash))
          .returning({ refCount: imageSnapshots.refCount });

        if (updated?.refCount === 0) {
          const [deleted] = await tx
            .delete(imageSnapshots)
            .where(
              and(eq(imageSnapshots.hash, hash), eq(imageSnapshots.refCount, 0)),
            )
            .returning({ hash: imageSnapshots.hash });

          if (deleted) {
            await ProductStorage.deleteImages(supabaseService, "product_snapshots", [
              hash,
            ]).catch((err) =>
              console.error(`Failed to delete orphaned snapshot ${hash}:`, err),
            );
          }
        }
      }
    })
    .catch((err) => {
      console.error("Failed to rollback reference counts after error", err);
    });
};
