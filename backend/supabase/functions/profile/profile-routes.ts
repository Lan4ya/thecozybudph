import { Hono, Env } from "hono";
import { supabaseMiddleware, authMiddleware } from "@shared/middlewares/mod.ts";
import { getProfileHandler, updateProfileHandler } from "./profile-handlers.ts";

const profile = new Hono<Env>();

profile.use("*", supabaseMiddleware());
profile.use("*", authMiddleware());

profile.get("/", ...getProfileHandler);
profile.patch("/", ...updateProfileHandler); // no id in params since it's derived from JWT

export default profile;
