import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import { CustomError, handleError } from "@shared/errors/mod.ts";

const supabase = createClient(
  // @ts-ignore
  Deno.env.get("SUPABASE_URL")!,
  // @ts-ignore
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// @ts-ignore
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  return new Promise((resolve) => {
    req
      .json()
      .then((data: any) => {
        const { email, password } = data;
        return supabase.auth.signInWithPassword({ email, password });
      })
      .then(({ data: authData, error }: any) => {
        if (error) {
          resolve(handleError(new CustomError(401, "Invalid credentials")));
          return;
        }

        /* success */
        resolve(
          Response.json(
            {
              data: authData,
            },
            { status: 200 },
          ),
        );
      })
      .catch((err: unknown) => {
        resolve(handleError(err));
      });
  });
});
