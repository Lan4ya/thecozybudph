import { DrizzleClient } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { ProductStorage } from "@shared/modules/product/product-storage.ts";
import { imageSnapshots } from "@shared/schemas/index.ts";
import { and, eq, sql } from "drizzle-orm";
import pLimit from "p-limit";
import { formatSupabasePublicUrl } from "../../../utils/mod.ts";
import { parseSupabaseUrls } from "../parse-supabase-urls.ts";
import { PreparedOrderItem } from "./_create-order-prep.ts";
import { SupabaseDB } from "@shared/types.d.ts";

export const createOrderSnapshots = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  orderItems: PreparedOrderItem[],
  incrementedSnapshotHashes: string[],
): Promise<Map<string, string>> => {
  const limit = pLimit(5);

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

        // Download the image from products bucket and upload it to image_snapshots bucket (copying it over)
        if (snapshotRecord.refCount === 1) {
          const { images, invalids } = parseSupabaseUrls([img.primaryImageUrl]);

          if (invalids.length) {
            throw AppError.badRequest({
              message: `Invalid image URL: ${img.primaryImageUrl}`,
            });
          }
          const image = images[0];
          // console.log(image.bucket, image.path);

          const { data: blob, error } = await supabaseService.storage
            .from(image.bucket)
            .download(image.path);

          if (error || !blob) {
            throw (
              error ??
              AppError.internal({
                message: `Failed to download ${img.primaryImageUrl}`,
              })
            );
          }

          const file = new File([blob], hash, {
            type: blob.type,
          });

          const { error: uploadError } = await supabaseService.storage
            .from("image_snapshots")
            .upload(hash, file, {
              upsert: true,
            });

          if (uploadError) {
            throw uploadError;
          }
        }

        const {
          data: { publicUrl },
        } = supabaseService.storage.from("image_snapshots").getPublicUrl(hash);

        return {
          sourceHash: hash,
          snapshotUrl: formatSupabasePublicUrl(publicUrl),
        };
      }),
    ),
  );

  return new Map(
    snapshots.map((snapshot) => [snapshot.sourceHash, snapshot.snapshotUrl]),
  );
};

/**
 * Reverts reference count increments if the order creation fails.
 *
 * This prevents storage leaks. If a refCount reaches 0, the snapshot is orphaned
 * (no orders point to it) and the physical file is deleted from storage.
 */
export const rollbackOrderSnapshots = async (
  db: DrizzleClient,
  supabaseService: SupabaseDB,
  incrementedSnapshotHashes: string[],
) => {
  if (!incrementedSnapshotHashes.length) return;

  const hashesToDelete: string[] = [];

  await db.admin
    .transaction(async (tx) => {
      for (const hash of incrementedSnapshotHashes) {
        const [updated] = await tx
          .update(imageSnapshots)
          .set({ refCount: sql`GREATEST(0, ${imageSnapshots.refCount} - 1)` })
          .where(eq(imageSnapshots.hash, hash))
          .returning({ refCount: imageSnapshots.refCount });

        if (updated?.refCount === 0) {
          const [deleted] = await tx
            .delete(imageSnapshots)
            .where(
              and(
                eq(imageSnapshots.hash, hash),
                eq(imageSnapshots.refCount, 0),
              ),
            )
            .returning({ hash: imageSnapshots.hash });

          if (deleted) {
            hashesToDelete.push(hash);
          }
        }
      }
    })
    .catch((err) => {
      console.error("Failed to rollback reference counts after error", err);
    });

  // Perform external storage cleanup safely outside tx
  if (hashesToDelete.length > 0) {
    await ProductStorage.deleteImages(
      supabaseService,
      "image_snapshots",
      hashesToDelete,
    ).catch((err) =>
      console.error(
        `Failed to delete orphaned snapshots ${hashesToDelete.join(", ")}:`,
        err,
      ),
    );
  }
};
