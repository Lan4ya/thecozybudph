import { pgRole } from "drizzle-orm/pg-core";

export const postgres = pgRole("postgres").existing();
