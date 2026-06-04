import { createAdminOrGet } from "./helpers/createAdminOrGet.ts";
import { supabase } from "./helpers/supabase.ts";

const { SUPABASE_URL } = process.env;

export async function seedAdmin() {
  const { email, password } = await createAdminOrGet();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError || !authData.session?.access_token) {
    throw new Error(
      `Admin login failed: ${authError?.message ?? "No access token returned"}`,
    );
  }

  const token = authData.session.access_token;

  try {
    await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/address`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Admin",
          region: "NCR",
          city: "Mandaluyong City",
          postalCode: "1550",
          barangay: "Barangka Ilaya",
          addressLine: "Edsa Corner Pioneer Street",
          phoneNumber: "+639123456789",
          isDefault: true,
        }),
      }),
      fetch(`${SUPABASE_URL}/functions/v1/address`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Admin",
          region: "NCR",
          city: "Manila",
          postalCode: "1008",
          province: "Sampaloc",
          barangay: "Barangay 411",
          addressLine: "G Tuazon St.",
          phoneNumber: "+639123456789",
          isDefault: false,
        }),
      }),
    ]);
  } catch (err) {
    throw new Error(`Network error: ${err}`);
  }

  console.log(`Created admin creds:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

if (process.argv[1] === import.meta.filename) {
  seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
