CREATE TABLE "image_snapshots" (
	"hash" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_hashes" text[] DEFAULT '{}' NOT NULL;