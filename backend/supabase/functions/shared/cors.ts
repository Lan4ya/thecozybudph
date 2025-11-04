/**
 * Safe CORS helper for Supabase Edge Functions.
 * Supports preflight (OPTIONS) and restricts allowed origins in production.
 */

export const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://thecozybudph.com", // your production site
  "https://www.thecozybudph.com",
];

// Build headers dynamically per request
export function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0]; // fallback to dev origin

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  };
}

// Helper to handle preflight requests quickly
export function handleCorsOptions(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
