import { sql } from "drizzle-orm";
import { createClient, JwtPayload } from "supabase";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schemas/drizzle/index.ts";
import { Database } from "@shared/schemas/index.ts";

// Fallback to SUPABASE_DB_URL which works on every env
// const connString =
//   Deno.env.get("DB_TX_POOLER_URL") || Deno.env.get("SUPABASE_DB_URL")!;
const connString = Deno.env.get("SUPABASE_DB_URL")!;

export const adminPg = postgres(connString, {
  prepare: false, // prepared statements are not supported in serverless
});

// -------------------- WARN --------------------

/*  

 *  NEVER use these functions directly. Always access drizzle client through
 *  dependency injection (DI) using 'drizzleMiddleware' to have proper auth.


 *  @rls is a transaction. Although we are always forced to use transactions
 *  even on simple CRUD that doesn't need transactions, it's the only way
 *  (afaik currently) to integrate supabase's internal rls policy check
 *  (auth.uid() === foo.id) with drizzle. This is what you'd use 95% of the
 *  time


 *  @admin uses a direct Postgres connection with full database privileges,
 *  bypassing Supabase Row Level Security (RLS) policies entirely. Use this 
 *  mindfully ONLY on operations that needs elevated actions


 *  Info: As of this writing, this wrapper function is not yet built-in to
 *  'drizzle-orm/supabase'. This is a just an implementation of the snippet
 *  provided in the docs, but it'll soon be built-in as per the docs:
 *  https://orm.drizzle.team/docs/rls
 *  https://github.com/orgs/supabase/discussions/23224

 */

// -------------------- WARN --------------------

type AdminDb = typeof adminDb;

export type DrizzleClient = {
  admin: AdminDb;
  rls: AdminDb["transaction"];
};

export type DrizzleClientTransactionRLS = Parameters<
  DrizzleClient["rls"]
>[0] extends (tx: infer T) => unknown
  ? T
  : never;

export const supabase = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

export const supabaseService = createClient<Database>(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

export const adminDb = drizzle(adminPg, {
  schema,
});

export function createDrizzle(token?: JwtPayload): DrizzleClient {
  return {
    admin: adminDb,
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
