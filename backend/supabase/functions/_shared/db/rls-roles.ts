import { pgRole } from "drizzle-orm/pg-core/roles";

export const publicRole = pgRole("public").existing();
