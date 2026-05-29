import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import pLimit from "p-limit";
import { z } from "zod";
import { createProductSchema } from "@cozybud/schemas";
import { ADMIN_EMAIL, ADMIN_PASSWORD } from "./seedAdmin.ts";
import { supabase } from "./helpers/supabase.ts";
import { convertToOptimalWebp } from "./helpers/convertToOptimalWebp.ts";

type CreateProductPayload = { id?: string };

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

type SeedResult =
  | { status: "created"; index: number; name: string; id?: string }
  | { status: "failed"; index: number; name: string; error: string };

const DEFAULT_DATA_FILE = path.resolve(
  import.meta.dirname,
  "./data/products.seed.json",
);

const DEFAULT_CONCURRENCY = 3;

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_RETRY_DELAY_MS = 750;
const MAX_RETRY_DELAY_MS = 5_000;

const seedProductSchema = createProductSchema.superRefine((data, ctx) => {
  if (data.primaryImageIndex >= data.productImages.length) {
    ctx.addIssue({
      code: "custom",
      path: ["primaryImageIndex"],
      message: "primaryImageIndex is out of range",
    });
  }
});

type ValidatedSeedProduct = z.infer<typeof seedProductSchema>;

class RetryableSeedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableSeedError";
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelayMs = (attempt: number) =>
  Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 2 ** (attempt - 1));

const toFile = async (absoluteFilePath: string) => {
  const stats = await stat(absoluteFilePath);
  const originalSizeMB = stats.size / 1024 / 1024;

  const optimizedWebpBuffer = await convertToOptimalWebp(absoluteFilePath, {
    quality: 85,
    effort: 5,
    keepMetadata: false,
  });

  const optimizedSizeKB = optimizedWebpBuffer.length / 1024;
  const ext = path.extname(absoluteFilePath);
  const baseName = path.basename(absoluteFilePath, ext);
  const targetFileName = `${baseName}.webp`;

  console.log(
    `  ↳ ${path.basename(absoluteFilePath)}: ${originalSizeMB.toFixed(2)} MB -> ${optimizedSizeKB.toFixed(2)} KB (webp)`,
  );

  return new File([optimizedWebpBuffer], targetFileName, {
    type: "image/webp",
  });
};

const parseApiResponse = async <T>(
  response: Response,
): Promise<{ data?: T; error?: unknown } | null> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  return (await response.json().catch(() => null)) as {
    data?: T;
    error?: unknown;
  } | null;
};

const buildValidatedProduct = async (
  product: SeedProduct,
  imagesBaseDir: string,
): Promise<ValidatedSeedProduct> => {
  console.log(`Optimizing images: ${product.name}`);
  const productImages: File[] = [];

  for (const relativeImagePath of product.images) {
    const absoluteImagePath = path.resolve(imagesBaseDir, relativeImagePath);
    productImages.push(await toFile(absoluteImagePath));
  }

  const parsed = seedProductSchema.safeParse({
    ...product,
    productImages,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => {
        const field = issue.path.length > 0 ? issue.path.join(".") : "product";
        return `${field}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(issues);
  }

  return parsed.data;
};

const buildFormData = (product: ValidatedSeedProduct) => {
  const formData = new FormData();

  formData.append("name", product.name);
  formData.append("categoryName", product.categoryName);
  formData.append("options", JSON.stringify(product.options));
  formData.append("variants", JSON.stringify(product.variants));
  formData.append("primaryImageIndex", String(product.primaryImageIndex));

  if (product.description != null) {
    formData.append("description", product.description);
  }

  if (product.collectionName != null) {
    formData.append("collectionName", product.collectionName);
  }

  for (const file of product.productImages) {
    formData.append("productImages", file);
  }

  return formData;
};

const runWithRetry = async <T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isRetryable = err instanceof RetryableSeedError;
      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        throw err;
      }

      const delay = getRetryDelayMs(attempt);
      console.warn(
        `${label} retry ${attempt}/${MAX_ATTEMPTS} in ${delay}ms: ${err}`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
};

const uploadOnce = async (
  supabaseUrl: string,
  token: string,
  product: ValidatedSeedProduct,
): Promise<{ id?: string }> => {
  const formData = buildFormData(product);

  let response: Response;
  try {
    response = await fetch(`${supabaseUrl}/functions/v1/admin/product`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (err) {
    throw new RetryableSeedError(`Network error: ${err}`);
  }

  const json = await parseApiResponse<CreateProductPayload>(response);

  if (!response.ok) {
    const error =
      json && "error" in json
        ? json.error
        : `Request failed with status ${response.status}`;

    const message = error;

    if (RETRYABLE_STATUS_CODES.has(response.status)) {
      throw new RetryableSeedError(
        `Request failed with status ${response.status}: ${message}`,
      );
    }

    return {
      id: undefined,
    };
  }

  const createdId =
    json && "data" in json && json.data && typeof json.data === "object"
      ? (json.data as CreateProductPayload).id
      : undefined;

  return { id: createdId };
};

const seed = async (
  supabaseUrl: string,
  token: string,
  product: SeedProduct,
  index: number,
  imagesBaseDir: string,
): Promise<SeedResult> => {
  try {
    const validated = await buildValidatedProduct(product, imagesBaseDir);

    const result = await runWithRetry(`[${index + 1}] ${product.name}`, () =>
      uploadOnce(supabaseUrl, token, validated),
    );

    return {
      status: "created",
      index,
      name: product.name,
      id: result.id,
    };
  } catch (err) {
    return {
      status: "failed",
      index,
      name: product.name,
      error: err as string,
    };
  }
};

const deleteExisting = async (
  supabaseUrl: string,
  token: string,
  productIds: string[],
) => {
  if (productIds.length === 0) return;

  await runWithRetry("delete existing products", async () => {
    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/functions/v1/admin/product`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }),
      });
    } catch (err) {
      throw new RetryableSeedError(`Network error: ${err}`);
    }

    const json = await parseApiResponse<string[]>(response);

    if (!response.ok) {
      const error =
        json && "error" in json
          ? json.error
          : `Request failed with status ${response.status}`;

      const message = error;

      if (RETRYABLE_STATUS_CODES.has(response.status)) {
        throw new RetryableSeedError(
          `Delete failed with status ${response.status}: ${message}`,
        );
      }

      throw new Error(`Delete failed (${response.status}): ${message}`);
    }
  });
};

export async function seedProducts(
  options: {
    concurrency?: number;
    data?: string;
    imagesDir?: string;
  } = {},
) {
  const { SUPABASE_URL } = process.env;
  if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL");

  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const limit = pLimit(concurrency);

  if (concurrency > 1) {
    console.log(
      `Concurrency is set at ${concurrency}. If you experience high CPU usage lower it with flag --concurrency <value>`,
    );
  }

  const dataPath = path.resolve(
    process.cwd(),
    options.data ?? DEFAULT_DATA_FILE,
  );
  const raw = await readFile(dataPath, "utf8");
  const parsed = JSON.parse(raw) as SeedFile;

  if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
    throw new Error("Seed file must contain a non-empty products array");
  }

  const imagesBaseDir = options.imagesDir
    ? path.resolve(process.cwd(), options.imagesDir)
    : path.dirname(dataPath);

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

  if (authError || !authData.session?.access_token) {
    throw new Error(
      `Admin login failed: ${authError?.message ?? "No access token returned"}`,
    );
  }

  const token = authData.session.access_token;

  const { data: existingProducts, error: getProductsErr } = await supabase
    .from("products")
    .select("id");

  if (getProductsErr) {
    throw new Error(getProductsErr.message);
  }

  const productIds = (existingProducts ?? []).map((p) => p.id);
  await deleteExisting(SUPABASE_URL, token, productIds);

  const results = await Promise.all(
    parsed.products.map((product, index) =>
      limit(() => seed(SUPABASE_URL, token, product, index, imagesBaseDir)),
    ),
  );

  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    const label = `[${result.index + 1}/${parsed.products.length}] "${result.name}"`;

    if (result.status === "created") {
      successCount++;
      console.log(`${label} created${result.id ? ` (${result.id})` : ""}`);
      continue;
    }

    failCount++;
    console.error(`${label} failed: ${result.error}`);
  }

  console.log(`Done. Created: ${successCount}, Failed: ${failCount}`);
}

if (process.argv[1] === import.meta.filename) {
  const args = process.argv.slice(2);

  const parsedArgs: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const current = args[i];
    if (!current.startsWith("--")) continue;
    const key = current.slice(2);
    const next = args[i + 1];
    if (!next || next.startsWith("--")) continue;
    parsedArgs[key] = next;
    i++;
  }

  const concurrency = parsedArgs.concurrency
    ? Number(parsedArgs.concurrency)
    : undefined;
  if (
    concurrency != null &&
    (Number.isNaN(concurrency) || concurrency < 1 || concurrency > 5)
  ) {
    throw new Error("Concurrency must be between 1 and 5");
  }

  seedProducts({
    concurrency,
    data: parsedArgs.data,
    imagesDir: parsedArgs["images-dir"],
  }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
