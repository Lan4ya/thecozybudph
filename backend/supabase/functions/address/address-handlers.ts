import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { AddressService } from "./services/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import {
  addressIdSchema,
  createAddressSchema,
  updateAddressSchema,
} from "@shared/core/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const createAddressHandler = createHandlers(
  zodValidatorMiddleware("json", createAddressSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const { sub: profileId } = c.get("claims");
    const payload = c.req.valid("json");
    const res = await AddressService.createAddress(
      supabase,
      payload,
      profileId,
    );
    return handleSuccess(res);
  },
);

export const updateAddressHandler = createHandlers(
  zodValidatorMiddleware("param", addressIdSchema),
  zodValidatorMiddleware("json", updateAddressSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const payload = c.req.valid("json");
    const { id } = c.req.valid("param");
    const res = await AddressService.updateAddress(supabase, id, payload);
    return handleSuccess(res);
  },
);

export const getAddressHandler = createHandlers(async (c) => {
  const supabase = c.get("supabase");
  const { sub: profileId } = c.get("claims");
  const res = await AddressService.getAddress(supabase, profileId);
  return handleSuccess(res);
});
