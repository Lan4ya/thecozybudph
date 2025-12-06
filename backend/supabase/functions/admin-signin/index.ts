import { createClient } from "supabase";
import { CustomError } from "@shared/errors/mod.ts";
import { handleError } from "@shared/response/handleError.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve((req) => {
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
