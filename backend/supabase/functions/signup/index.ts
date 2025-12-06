/**
 * Create a user in DB
 *
 * @method POST
 * @endpoint https://utmrwkolxhuawhaajmng.supabase.co/functions/v1/signup
 *
 */

import { createClient } from "supabase";
import { CustomError } from "@shared/errors/mod.ts";
import { handleError } from "@shared/response/handleError.ts";
import { handleSuccess } from "@shared/response/handleSuccess.ts";
import { getCorsHeaders, handleCorsOptions } from "@shared/corsHeaders.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req: Request): Promise<Response> => {
  const optionsRes = handleCorsOptions(req);
  if (optionsRes) return optionsRes;
  const corsHeaders = getCorsHeaders(req);

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  const { email, password } = await req.json();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    const { user, session } = data;

    if (error) throw CustomError.internal(`Signup failed: ${error}`);

    if (user && !session)
      throw CustomError.validation([
        { message: "email is already taken", field: "email" },
      ]);

    return handleSuccess({ user: data.user }, corsHeaders);
  } catch (error) {
    console.log(error);
    return handleError(error, corsHeaders);
  }
});
