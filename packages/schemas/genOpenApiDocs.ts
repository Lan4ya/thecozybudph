import { mkdir, writeFile } from "node:fs/promises";
import openapiTS, { astToString } from "openapi-typescript";
import ts from "typescript";
import { EDGE_FUNCTIONS } from "./src/index.ts";

await mkdir("./src/types/api/openapi", { recursive: true });

await Promise.all(
  EDGE_FUNCTIONS.map(async (name) => {
    const url = `http://localhost:54321/functions/v1/${name}/doc`;
    const outPath = `./src/types/api/openapi/${name}.ts`;

    const ast = await openapiTS(url, {
      transform(schema) {
        // Transform "format: binary" -> File | Blob
        if (schema.format === "binary") {
          // Check for our custom tag
          // Note: We cast to 'any' because 'x-ts-type' isn't in standard TypeScript definitions
          const customType = (schema as any)["x-ts-type"];

          if (customType === "File") {
            // Returns "File" type
            return schema.nullable
              ? ts.factory.createUnionTypeNode([
                  ts.factory.createTypeReferenceNode("File"),
                  ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ])
              : ts.factory.createTypeReferenceNode("File");
          } else if (customType === "Blob") {
            // Returns "Blob" type
            return schema.nullable
              ? ts.factory.createUnionTypeNode([
                  ts.factory.createTypeReferenceNode("Blob"),
                  ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                ])
              : ts.factory.createTypeReferenceNode("Blob");
          } else {
            // Default Fallback (if custom tag is not set)
            // Returns "File | Blob" type
            return ts.factory.createUnionTypeNode([
              ts.factory.createTypeReferenceNode("File"),
              ts.factory.createTypeReferenceNode("Blob"),
            ]);
          }
        }

        //  ---------- Prob not needed since http can't send Date objects at the network level. we'll see --------------

        // Transform "format: date-time" -> Date
        // if (schema.format === "date-time" || schema.format === "date") {
        //   return schema.nullable
        //     ? ts.factory.createUnionTypeNode([
        //         ts.factory.createTypeReferenceNode(
        //           // "Date",
        //           ts.factory.createIdentifier("Date"),
        //         ),
        //         ts.factory.createLiteralTypeNode(ts.factory.createNull()),
        //       ])
        //     : ts.factory.createTypeReferenceNode(
        //         ts.factory.createIdentifier("Date"),
        //       );
        // }

        // Lets openapi-typescript handle other types
        return undefined;
      },
    });

    const contents = astToString(ast);
    await writeFile(outPath, contents);

    console.log(`✔ Generated types for ${name}`);
  }),
);
