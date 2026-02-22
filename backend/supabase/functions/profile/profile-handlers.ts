import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { ProfileService } from "@shared/domain/profile/mod.ts";
import { handleSuccess } from "@shared/utils/mod.ts";
import { updateProfileSchema } from "@shared/types/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getProfileHandler = createHandlers(async (c) => {
  const supabase = c.get("supabase");
  const { sub: profileId } = c.get("claims");
  const res = await ProfileService.getProfile(supabase, profileId);
  return handleSuccess(res);
});

export const updateProfileHandler = createHandlers(
  zodValidatorMiddleware("json", updateProfileSchema),
  async (c) => {
    const supabase = c.get("supabase");
    const { sub: profileId } = c.get("claims");
    const payload = c.req.valid("json");
    const res = await ProfileService.updateProfile(
      supabase,
      payload,
      profileId,
    );
    return handleSuccess(res);
  },
);
