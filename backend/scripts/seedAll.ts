import { execa } from "execa";

// Order matters
const steps = [
  "storage:init-bucket",
  "db:seed:users",
  "db:seed:admin",
  "db:seed:products",
];

let hasFailure = false;

for (const step of steps) {
  try {
    await execa("pnpm", ["run", step], { stdio: "inherit" });
  } catch (err) {
    hasFailure = true;
    console.error(`Script failed: ${step}`);
    console.error(err);
  }
}

console.log("Seeding pipeline finished.");

process.exit(hasFailure ? 1 : 0);
