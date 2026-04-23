import { execSync } from "node:child_process";
import { mkdir, rm, cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT = resolve(__dirname, "..");

const SUPABASE_TYPES = resolve(ROOT, "../packages/types/src/supabase.types.ts");

const SHARED_PACKAGES = resolve(ROOT, "./supabase/functions/_shared/packages");

const SCHEMAS_SRC = resolve(ROOT, "../packages/schemas/src");
const TYPES_SRC = resolve(ROOT, "../packages/types/src");

const SCHEMAS_TARGET = resolve(SHARED_PACKAGES, "schemas");
const TYPES_TARGET = resolve(SHARED_PACKAGES, "types");

async function main() {
  console.log("→ Generating Supabase types...");
  execSync(`supabase gen types typescript --local > ${SUPABASE_TYPES}`, {
    stdio: "inherit",
    shell: true,
  });

  console.log("→ Resetting shared packages dir...");
  await rm(SHARED_PACKAGES, { recursive: true, force: true });

  console.log("→ Creating directories...");
  await mkdir(SCHEMAS_TARGET, { recursive: true });
  await mkdir(TYPES_TARGET, { recursive: true });

  console.log("→ Copying schemas...");
  await cp(SCHEMAS_SRC, SCHEMAS_TARGET, {
    recursive: true,
  });

  console.log("→ Copying types...");
  await cp(TYPES_SRC, TYPES_TARGET, {
    recursive: true,
  });

  console.log("✓ Done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
