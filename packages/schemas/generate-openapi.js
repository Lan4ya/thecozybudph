import { execa } from "execa";
import { mkdir } from "node:fs/promises";

await mkdir("./src/types/openapi", { recursive: true });

const edgeFunctions = ["profile", "address", "admin", "order", "cart"];

await Promise.all(
  edgeFunctions.map((name) => {
    const url = `http://localhost:54321/functions/v1/${name}/doc`;
    const out = `./src/types/api/openapi/${name}.ts`;

    return execa("openapi-typescript", [url, "-o", out], {
      stdio: "inherit",
    });
  }),
);
