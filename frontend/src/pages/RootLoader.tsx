import { redirect, type LoaderFunctionArgs } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { PROTECTED_ROUTES } from "./Root";

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname.startsWith(p));

/**
 * Root level route loader responsible for global authentication guarding and session retrieval.
 * This loader intercept requests before rendering down the route tree. It verifies
 * the current user session via Supabase and cross-references the targeted pathname
 * against a whitelist of protected application routes.
 */
const RootLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = matchesPath(pathname, PROTECTED_ROUTES);

  // Hard redirect for auth routes if no session.
  if (isAuthRoute && !session) {
    throw redirect("/auth/login");
  }

  return session;
};

export default RootLoader;
