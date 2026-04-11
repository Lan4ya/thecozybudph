import { ProductService } from "@shared/domain/product/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import {
  createProductSchema,
  deleteProductsSchema,
  productIdSchema,
  updateProductSchema,
} from "@shared/package-types/index.ts";
import {
  createHandlers,
  handleSuccess,
  requireVariables,
} from "@shared/utils/mod.ts";

export const createProductHandler = createHandlers(
  zodValidatorMiddleware("form", createProductSchema),
  async (c) => {
    const { db, supabaseService } = requireVariables(
      c,
      "db",
      "supabaseService",
    );
    const payload = c.req.valid("form");
    const res = await ProductService.createProduct(
      db,
      supabaseService,
      payload,
    );
    return handleSuccess(res);
  },
);

export const updateProductHandler = createHandlers(
  zodValidatorMiddleware("param", productIdSchema),
  zodValidatorMiddleware("form", updateProductSchema),
  async (c) => {
    const { db, supabaseService } = requireVariables(
      c,
      "db",
      "supabaseService",
    );
    const { id: productId } = c.req.valid("param");
    const payload = c.req.valid("form");
    const res = await ProductService.updateProduct(
      db,
      supabaseService,
      productId,
      payload,
    );
    return handleSuccess(res);
  },
);

export const deleteProductHandler = createHandlers(
  zodValidatorMiddleware("json", deleteProductsSchema),
  async (c) => {
    const { supabaseService } = requireVariables(c, "supabaseService");
    const payload = c.req.valid("json");
    const deletedProductIds = await ProductService.deleteProducts(
      supabaseService,
      payload,
    );
    return handleSuccess(deletedProductIds);
  },
);
