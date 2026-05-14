import { AddressActions } from "@shared/modules/address/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from "@shared/schemas/index.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { createFactory } from "hono/factory";
import { AppEnv } from "@shared/types.d.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createAddressHandler = createHandlers(
  zodValidatorMiddleware("json", createAddressSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const { db, claims } = requireVariables(c, "db", "claims");
    const profileId = claims.sub;
    const res = await AddressActions.createAddress(db, payload, profileId);
    return handleSuccess(res);
  },
);

export const updateAddressHandler = createHandlers(
  zodValidatorMiddleware("param", addressIdSchema),
  zodValidatorMiddleware("json", updateAddressSchema),
  async (c) => {
    const { db } = requireVariables(c, "db");
    const payload = c.req.valid("json");
    const { id } = c.req.valid("param");
    const res = await AddressActions.updateAddress(db, id, payload);
    return handleSuccess(res);
  },
);

export const getDefaultAddressesHandler = createHandlers(async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressActions.getDefaultAddress(db, profileId);
  return handleSuccess(res);
});

export const getAddressesHandler = createHandlers(async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressActions.getAddresses(db, profileId);
  return handleSuccess(res);
});
