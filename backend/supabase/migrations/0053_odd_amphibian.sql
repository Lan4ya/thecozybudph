ALTER POLICY "select_policy" ON "addresses" RENAME TO "users can select own address";--> statement-breakpoint
ALTER POLICY "update_policy" ON "addresses" RENAME TO "users can update own address";--> statement-breakpoint
ALTER POLICY "delete_policy" ON "addresses" RENAME TO "users can delete own address";--> statement-breakpoint
ALTER POLICY "insert_policy" ON "addresses" RENAME TO "users can insert own address";