import { Hono, Env } from "hono";
import { supabaseMiddleware, authMiddleware } from "@shared/middlewares/mod.ts";
import {
  createAddressHandler,
  getAddressHandler,
  updateAddressHandler,
} from "./address-handlers.ts";

const address = new Hono<Env>();

address.use("*", supabaseMiddleware());
address.use("*", authMiddleware());

address.get("/", ...getAddressHandler);
address.post("/", ...createAddressHandler);
address.patch("/:id", ...updateAddressHandler);

export default address;
