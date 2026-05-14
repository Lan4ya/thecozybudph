import { buildApp } from "@shared/factory/mod.ts";
import { buildAdminRoutes } from "./admin-routes.ts";

export const adminApp = buildApp("admin", buildAdminRoutes());
Deno.serve(adminApp.fetch);
