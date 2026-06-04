import { seedUsers } from "./seedUsers.ts";
import { seedAdmin } from "./seedAdmin.ts";
import { seedProducts } from "./seedProducts.ts";
import { seedAvatars } from "./seedAvatars.ts";
import { seedAssets } from "./seedAssets.ts";
import { initBuckets } from "./initBuckets.ts";
import { seedOrders } from "./seedOrders.ts";

// Execution order matters! Script will break otherwise
async function main() {
  try {
    console.log("\n--- 🚀 Initializing Buckets ---");
    await initBuckets();

    console.log("\n--- 🚀 Seeding Avatars ---");
    await seedAvatars();

    console.log("\n--- 🚀 Seeding Site Assets ---");
    await seedAssets();

    console.log("\n--- 🚀 Seeding Users ---");
    await seedUsers();

    console.log("\n--- 🚀 Seeding Admin ---");
    await seedAdmin();

    console.log("\n--- 🚀 Seeding Products ---");
    await seedProducts();

    console.log("\n--- 🚀 Seeding Orders ---");
    await seedOrders();

    console.log("\n✅ DB Seeding finished.");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seeding pipeline failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
