interface GeoapifyResult {
  city?: string;
  formatted: string;
}

/**
 * Resolves latitude and longitude into an address using Geoapify
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param apiKey - Your Geoapify API access token
 */
export async function getAddressByCoords(
  lat: number,
  lon: number,
): Promise<GeoapifyResult> {
  const apiKey = Deno.env.get("GEOAPIFY_API_KEY");
  if (!apiKey) {
    throw new Error("Missing GEOAPIFY_API_KEY");
  }
  const url = new URL("https://api.geoapify.com/v1/geocode/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("apiKey", apiKey);

  // Execute the network request
  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Geoapify API failed: ${errorText}`);
  }

  const data = await response.json();

  // 3. Ensure a valid feature was returned by the engine
  if (!data.features || data.features.length === 0) {
    throw new Error("No location details found for these coordinates.");
  }

  //  Extract the properties from the most accurate match (index 0)
  const properties = data.features[0].properties;

  return {
    city: properties.city, // Useful for matching Lalamove cityId!
    formatted: properties.formatted, // Full human-readable address text
  };
}
