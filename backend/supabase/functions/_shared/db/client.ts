import { sql } from "drizzle-orm";
import { JwtPayload } from "supabase";
import { AppError } from "../errors/Errors.ts";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/mod.ts";

const connString = Deno.env.get("DB_TX_POOLER_URL")!;

// Use this conn string instead if the pooler url doesnt work on your machine:
// const connString = Deno.env.get("SUPABASE_DB_URL")!;

const adminPg = postgres(connString, {
  prepare: false, // prepared statements are not supported in serverless
});

export const adminDb = drizzle(adminPg, {
  schema,
});

type AdminDb = typeof adminDb;

export type DrizzleClient = {
  admin: AdminDb;
  rls: AdminDb["transaction"];
};

const guardAdminDb = (isAdmin: boolean) => {
  if (isAdmin) return adminDb;

  return new Proxy(adminDb, {
    get(_, prop) {
      throw AppError.forbidden(
        `Forbidden`,
        [
          `Contract violation: You attempted to use db.admin.${String(prop)} without admin privileges.`,
          "Ensure you have admin status before calling this via 'adminMiddleware'.",
          "If you don't need admin privileges, use 'db.rls' instead",
        ].join(" "),
      );
    },
  });
};

// -------------------- WARN --------------------

/*
 * 1. Never use this function directly. Instead access the db through
 * 'drizzleMiddleware' to have proper auth, ensuring safe usage.
 * The only exception would be operations that forces you to access adminDb without auth (e.g. webhooks).
 *
 * 2. Always use rls unless you need to do an operation that requires admin priviliges (e.g. product creation/deletion).
 * 'rls' respects Row Level Security Policies while 'admin' bypasses it.
 * Althouth rls is a transaction (causes no problem) it's the only way (afaik) to integrate
 * supabase's built-in rls policy execution 'auth.uid()' with drizzle.
 *
 * 3. As of this writing, this wrapper function is not yet built-in to
 * 'drizzle-orm/supabase'. This is a just an implementation of the snippet
 * provided in the docs, but it'll soon be built-in as per the docs:
 * https://orm.drizzle.team/docs/rls
 * https://github.com/orgs/supabase/discussions/23224
 */

// -------------------- WARN --------------------

export function createDrizzle(
  isAdmin: boolean,
  token?: JwtPayload,
): DrizzleClient {
  return {
    admin: guardAdminDb(isAdmin),
    rls: ((
      transaction: Parameters<typeof adminDb.transaction>[0],
      ...rest: Parameters<typeof adminDb.transaction>[1][]
    ) => {
      return adminDb.transaction(
        async (tx) => {
          // Supabase exposes auth.uid() and auth.jwt()
          // https://supabase.com/docs/guides/database/postgres/row-level-security#helper-functions
          if (token) {
            await tx.execute(sql`
          -- auth.jwt()
          select set_config('request.jwt.claims', '${sql.raw(
            JSON.stringify(token),
          )}', TRUE);
          -- auth.uid()
          select set_config('request.jwt.claim.sub', '${sql.raw(
            token.sub ?? "",
          )}', TRUE);												
          -- set local role
          set local role ${sql.raw(token.role ?? "anon")};
          `);

            const result = await transaction(tx);

            await tx.execute(sql`
            -- reset
            select set_config('request.jwt.claims', NULL, TRUE);
            select set_config('request.jwt.claim.sub', NULL, TRUE);
            reset role;
            `);

            return result;
          }

          return await transaction(tx);
        },
        ...rest,
      );
    }) as typeof adminDb.transaction,
  };
}
