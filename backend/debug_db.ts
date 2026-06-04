import { db } from "./scripts/helpers/drizzleClient.ts";
import { addresses } from "@cozybud/schemas";
import { sql } from "drizzle-orm";

async function debug() {
  try {
    console.log("Checking addresses table...");
    const tableInfo = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'addresses'`);
    console.log("Columns:", tableInfo);

    const count = await db.select({ count: sql`count(*)` }).from(addresses);
    console.log("Total addresses:", count);

    const firstRow = await db.select().from(addresses).limit(1);
    console.log("First row:", firstRow);
  } catch (err) {
    console.error("Debug failed:", err);
  } finally {
    process.exit(0);
  }
}

debug();
