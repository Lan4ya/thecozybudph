import { SupabaseClient } from "supabase";
import { CustomError } from "./errors/CustomError.ts";

interface AuthRequest {
  headers: {
    get(name: string): string | null;
  };
}

export const authAdmin = async (supabase: SupabaseClient, req: AuthRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw CustomError.unauthorized();
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError) {
    throw CustomError.internal(
      `Database error during admin verification: ${authError.message}`,
    );
  }

  if (!user) {
    // Token is invalid, expired, or user doesn't exist
    throw CustomError.unauthorized();
  }

  // Check if user is admin
  const { data: admin, error: adminErr } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminErr) {
    throw CustomError.internal(
      `Database error during admin verification: ${adminErr.message}`,
    );
  }

  if (!admin) {
    throw CustomError.forbidden();
  }
};
