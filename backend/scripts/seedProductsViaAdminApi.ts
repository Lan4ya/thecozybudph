import { readFile } from "node:fs/promises";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

type SeedVariant = {
  priceCents: number;
  attributes: Record<string, string>;
};

type SeedOption = {
  name: string;
  values: string[];
};

type SeedProduct = {
  name: string;
  description?: string | null;
  categoryName: string;
  collectionName?: string | null;
  options: SeedOption[];
  variants: SeedVariant[];
  primaryImageIndex: number;
  images: string[];
};

type SeedFile = {
  products: SeedProduct[];
};

const DEFAULT_DATA_FILE = path.resolve(
  process.cwd(),
  "./scripts/data/products.seed.example.json",
);

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const current = args[i];
    if (!current.startsWith("--")) continue;

    const key = current.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) continue;

    parsed[key] = next;
    i++;
  }

  return parsed;
};

const getMimeType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext];
  if (!mime) {
    throw new Error(
      `Unsupported image extension "${ext}" for "${filePath}". Use png/jpg/jpeg/webp.`,
    );
  }
  return mime;
};

const toFile = async (absoluteFilePath: string) => {
  const buffer = await readFile(absoluteFilePath);
  const mimeType = getMimeType(absoluteFilePath);

  return new File([buffer], path.basename(absoluteFilePath), {
    type: mimeType,
  });
};

const assertProductInput = (product: SeedProduct, idx: number) => {
  if (!product.name?.trim())
    throw new Error(`products[${idx}].name is required`);
  if (!product.categoryName?.trim()) {
    throw new Error(`products[${idx}].categoryName is required`);
  }
  if (!Array.isArray(product.images) || product.images.length === 0) {
    throw new Error(`products[${idx}].images must contain at least 1 image`);
  }
  if (product.images.length > 3) {
    throw new Error(`products[${idx}].images supports up to 3 images only`);
  }
  if (
    product.primaryImageIndex < 0 ||
    product.primaryImageIndex >= product.images.length
  ) {
    throw new Error(`products[${idx}].primaryImageIndex is out of range`);
  }
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    throw new Error(
      `products[${idx}].variants must contain at least 1 variant`,
    );
  }
  if (!Array.isArray(product.options)) {
    throw new Error(`products[${idx}].options must be an array`);
  }
};

const main = async () => {
  const {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SEED_ADMIN_EMAIL,
    SEED_ADMIN_PASSWORD,
  } = process.env;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in env");
  }
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in env for admin login",
    );
  }

  const args = parseArgs();
  const dataArg = args["data"] ?? DEFAULT_DATA_FILE;
  const imagesDirArg = args["images-dir"];
  const dataPath = path.resolve(process.cwd(), dataArg);

  const raw = await readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw) as SeedFile;

  if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
    throw new Error("Seed file must contain a non-empty products array");
  }

  const imagesBaseDir = imagesDirArg
    ? path.resolve(process.cwd(), imagesDirArg)
    : path.dirname(dataPath);

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: SEED_ADMIN_EMAIL,
      password: SEED_ADMIN_PASSWORD,
    });

  if (authError || !authData.session?.access_token) {
    throw new Error(
      `Admin login failed: ${authError?.message ?? "No access token returned"}`,
    );
  }

  const token = authData.session.access_token;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < parsed.products.length; i++) {
    const product = parsed.products[i];
    assertProductInput(product, i);

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("categoryName", product.categoryName);
    formData.append("options", JSON.stringify(product.options));
    formData.append("variants", JSON.stringify(product.variants));
    formData.append("primaryImageIndex", String(product.primaryImageIndex));

    if (product.description !== undefined && product.description !== null) {
      formData.append("description", product.description);
    }
    if (
      product.collectionName !== undefined &&
      product.collectionName !== null
    ) {
      formData.append("collectionName", product.collectionName);
    }

    for (const relativeImagePath of product.images) {
      const absoluteImagePath = path.resolve(imagesBaseDir, relativeImagePath);
      const file = await toFile(absoluteImagePath);
      formData.append("productImages", file);
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin/product`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const json = (await response.json().catch(() => ({}))) as {
      data?: { id?: string };
      error?: unknown;
    };

    if (!response.ok) {
      failCount++;
      console.error(
        `[${i + 1}/${parsed.products.length}] Failed: "${product.name}"`,
        json.error ?? response.statusText,
      );
      continue;
    }

    successCount++;
    console.log(
      `[${i + 1}/${parsed.products.length}] Created: "${product.name}" (${json.data?.id ?? "no-id"})`,
    );
  }

  console.log(`Done. Created: ${successCount}, Failed: ${failCount}`);
  if (failCount > 0) process.exit(1);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
