const GEOAPIFY_API_KEY = Deno.env.get("GEOAPIFY_API_KEY");

if (!GEOAPIFY_API_KEY) {
  throw new Error("Missing GEOAPIFY_API_KEY");
}

export interface Coordinates {
  lat: string;
  lng: string;
}

export interface GeocodeOptions {
  signal?: AbortSignal;
  limit?: number;
}

// Geoapify works even with jumbled address but preferably the address
// should be formatted as follows: 'street name, postal code, region, city, country'
export async function getCoordinates(
  address: string,
  options: GeocodeOptions = {},
): Promise<Coordinates> {
  if (!address || address.trim().length < 5) {
    throw new Error("Invalid address input");
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", address);
  url.searchParams.set("apiKey", GEOAPIFY_API_KEY!);
  url.searchParams.set("limit", String(options.limit ?? 1));

  const res = await fetch(url.toString(), {
    method: "GET",
    signal: options.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Geoapify request failed: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  const data = await res.json();

  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;

  if (!coords || coords.length < 2) {
    throw new Error("No geocoding results found");
  }

  const [lng, lat] = coords;

  return {
    lat: String(lat),
    lng: String(lng),
  };
}
