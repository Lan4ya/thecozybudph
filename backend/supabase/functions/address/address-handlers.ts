import { AddressService } from "@shared/domain/address/mod.ts";
import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from "@shared/package-types/index.ts";
import {
  handleSuccess,
  createHandlers,
  requireVariables,
} from "@shared/utils/mod.ts";

export const createAddressHandler = createHandlers(
  zodValidatorMiddleware("json", createAddressSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const { db, claims } = requireVariables(c, "db", "claims");
    const profileId = claims.sub;
    const res = await AddressService.createAddress(db, payload, profileId);
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
    const res = await AddressService.updateAddress(db, id, payload);
    return handleSuccess(res);
  },
);

export const getDefaultAddressesHandler = createHandlers(async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressService.getDefaultAddress(db, profileId);
  return handleSuccess(res);
});

export const getAddressesHandler = createHandlers(async (c) => {
  const { db, claims } = requireVariables(c, "db", "claims");
  const profileId = claims.sub;
  const res = await AddressService.getAddresses(db, profileId);
  return handleSuccess(res);
});
