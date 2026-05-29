import { seedUsers } from "./seedUsers.ts";
import { seedAdmin } from "./seedAdmin.ts";
import { seedProducts } from "./seedProducts.ts";
import { seedAvatars } from "./seedAvatars.ts";

// WARN: Execution order matters! Script will break otherwise
async function main() {
  console.log("Starting seeding pipeline...");

  try {
    console.log("\n--- Seeding Avatars ---");
    await seedAvatars();

    console.log("\n--- Seeding Users ---");
    await seedUsers();

    console.log("\n--- Seeding Admin ---");
    await seedAdmin();

    console.log("\n--- Seeding Products ---");
    await seedProducts();

    console.log("\nSeeding pipeline finished successfully.");
  } catch (err) {
    console.error("\nSeeding pipeline failed:");
    console.error(err);
    process.exit(1);
  }
}

main();
