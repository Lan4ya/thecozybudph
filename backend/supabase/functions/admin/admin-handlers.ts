import { ProductActions } from "@shared/modules/product/mod.ts";
import { AdminActions } from "@shared/modules/admin/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import {
  createProductSchema,
  deleteProductsSchema,
  productIdSchema,
  updateProductSchema,
  adminQueryOrdersSchema,
  adminShipOrderSchema,
  uuidParamSchema,
} from "@shared/schemas/index.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createProductHandler = createHandlers(
  zodValidatorMiddleware("form", createProductSchema),
  async (c) => {
    const { db, supabaseService } = requireVariables(
      c,
      "db",
      "supabaseService",
    );
    const payload = c.req.valid("form");
    const res = await ProductActions.createProduct(
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
    const res = await ProductActions.updateProduct(
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
    const { db, supabaseService } = requireVariables(
      c,
      "db",
      "supabaseService",
    );
    const payload = c.req.valid("json");
    const deletedProductIds = await ProductActions.deleteProducts(
      db,
      supabaseService,
      payload,
    );
    return handleSuccess(deletedProductIds);
  },
);

export const getOrdersHandler = createHandlers(
  zodValidatorMiddleware("query", adminQueryOrdersSchema),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const query = c.req.valid("query");
    const res = await AdminActions.getOrders(db, query);
    return handleSuccess(res);
  },
);

export const shipOrderHandler = createHandlers(
  zodValidatorMiddleware("param", uuidParamSchema("id")),
  zodValidatorMiddleware("json", adminShipOrderSchema),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const payload = c.req.valid("json");
    const { id: orderId } = c.req.valid("param");
    const res = await AdminActions.shipOrder(db, orderId, payload);
    return handleSuccess(res);
  },
);

export const cancelShipOrderHandler = createHandlers(
  zodValidatorMiddleware("param", uuidParamSchema("id")),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const { id: orderId } = c.req.valid("param");
    const res = await AdminActions.cancelShipmentOrder(db, orderId);
    return handleSuccess(res);
  },
);

export const getShippingOrderHandler = createHandlers(
  zodValidatorMiddleware("param", uuidParamSchema("id")),
  async (c) => {
    const { id: shippingOrderId } = c.req.valid("param");
    const res = await AdminActions.getShippingOrder(shippingOrderId);
    return handleSuccess(res);
  },
);
