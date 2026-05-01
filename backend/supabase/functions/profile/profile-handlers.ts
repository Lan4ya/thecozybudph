import { zodValidatorMiddleware } from "@shared/middlewares/zodValidatorMiddleware.ts";
import { AppEnv } from "@shared/types.d.ts";
import { createFactory } from "hono/factory";
import { ProfileActions } from "@shared/modules/profile/mod.ts";
import { handleSuccess, requireVariables } from "@shared/utils/mod.ts";
import { updateProfileSchema } from "@shared/schemas/index.ts";

const factory = createFactory<AppEnv>();
const { createHandlers } = factory;

export const getProfileHandler = createHandlers(async (c) => {
  const { claims, supabase } = requireVariables(c, "claims", "supabase");
  const profileId = claims.sub;
  const res = await ProfileActions.getProfile(supabase, profileId);
  return handleSuccess(res);
});

export const updateProfileHandler = createHandlers(
  zodValidatorMiddleware("json", updateProfileSchema),
  async (c) => {
    const { claims, supabase } = requireVariables(c, "claims", "supabase");
    const profileId = claims.sub;
    const payload = c.req.valid("json");
    const res = await ProfileActions.updateProfile(
      supabase,
      payload,
      profileId,
    );
    return handleSuccess(res);
  },
);
