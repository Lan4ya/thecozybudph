export interface Coordinates {
  lat: string;
  lng: string;
}

export interface GeocodeOptions {
  signal?: AbortSignal;
  limit?: number;
}

// Geoapify works even with jumbled address but preferably the address
// should be formatted as follows: 'house number & street name (addressLine), barangay, province, postal code, city, region, country'
export async function getCoordinates(
  address: string,
  options: GeocodeOptions = {},
): Promise<Coordinates> {
  const apiKey = Deno.env.get("GEOAPIFY_API_KEY");
  if (!apiKey) {
    throw new Error("Missing GEOAPIFY_API_KEY");
  }

  if (!address || address.trim().length < 5) {
    throw new Error("Invalid address input");
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", address);
  url.searchParams.set("apiKey", apiKey);
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
