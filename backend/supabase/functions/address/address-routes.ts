import { Hono, Env } from "hono";
import {
  supabaseMiddleware,
  authMiddleware,
  drizzleMiddleware,
} from "@shared/middlewares/mod.ts";
import {
  createAddressHandler,
  getAddressesHandler,
  getDefaultAddressesHandler,
  updateAddressHandler,
} from "./address-handlers.ts";

const address = new Hono<Env>();

address.use("*", supabaseMiddleware());
address.use("*", authMiddleware());
address.use("*", drizzleMiddleware());

address.get("/", ...getAddressesHandler);
address.get("/default", ...getDefaultAddressesHandler);
address.post("/", ...createAddressHandler);
address.patch("/:id", ...updateAddressHandler);

export default address;
