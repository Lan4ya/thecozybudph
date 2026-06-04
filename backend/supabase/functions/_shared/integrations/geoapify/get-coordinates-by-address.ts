import { AppError } from "@shared/errors/Errors.ts";
import { AddressData } from "@shared/schemas/index.ts";

export interface Coordinates {
  lat: string;
  lng: string;
}

export interface GeocodeOptions {
  signal?: AbortSignal;
  limit?: number;
}

export async function getCoordsByAddress(
  address: Omit<AddressData, "fullName" | "phoneNumber" | "isDefault" | "id">,
  options: GeocodeOptions = {},
): Promise<Coordinates> {
  // Geoapify works even with jumbled address but preferably the address
  // should be formatted as follows: 'house number & street name (addressLine), barangay, province, postal code, city, country'
  const addrStr = [
    address.addressLine,
    address.barangay,
    address.province,
    address.postalCode,
    address.city,
    // payload.region,
    "Philippines",
  ]
    .filter(Boolean)
    .join(", ");

  const apiKey = Deno.env.get("GEOAPIFY_API_KEY");
  if (!apiKey) {
    throw new Error("Missing GEOAPIFY_API_KEY");
  }

  if (!addrStr || addrStr.trim().length < 5) {
    throw new Error("Invalid address input");
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", addrStr);
  url.searchParams.set("apiKey", apiKey);
  url.searchParams.set("limit", String(options.limit ?? 1));

  // try {
  const res = await fetch(url.toString(), {
    method: "GET",
    signal: options.signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw AppError.internal({
      message: `Geoapify request failed: ${res.status} ${res.statusText} - ${text}`,
    });
  }

  const data = await res.json();

  const feature = data?.features?.[0];
  const coords = feature?.geometry?.coordinates;

  if (!coords || coords.length < 2) {
    throw AppError.notFound({
      message: "No geocoding results found",
      cause: data,
    });
  }

  const [lng, lat] = coords;

  return {
    lat: String(lat),
    lng: String(lng),
  };
  // } catch (error) {
  //   isDev && console.error("Error fetching coordinates from Geoapify:", error);
  //   throw error;
  // }
}
