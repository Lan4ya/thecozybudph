import { AddressData, UpdateAddress } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { AppError } from "../../../errors/Errors.ts";
import { Geoapify } from "@shared/integrations/geoapify/mod.ts";

export const updateAddress = async (
  db: DrizzleClient,
  id: string,
  isAdmin: boolean,
  payload: UpdateAddress,
): Promise<AddressData> => {
  // Check if any location-altering fields are present in the partial payload
  const hasLocationChanged = [
    payload.addressLine,
    payload.barangay,
    payload.city,
    payload.region,
    payload.postalCode,
  ].some((field) => field !== undefined);

  console.log({ hasLocationChanged });

  let coordsUpdate = {};

  if (hasLocationChanged) {
    // Fetch the existing record to fill missing gaps for the geocoding query
    const currentAddress = await AddressRepository.getById(db, id);
    if (!currentAddress) {
      throw AppError.notFound({ message: "Address not found" });
    }

    // Merges old values with new updates so Geoapify gets a complete string
    const geoPayload = {
      addressLine: payload.addressLine ?? currentAddress.addressLine,
      barangay: payload.barangay ?? currentAddress.barangay,
      city: payload.city ?? currentAddress.city,
      region: payload.region ?? currentAddress.region,
      province: payload.province ?? currentAddress.province,
      postalCode: payload.postalCode ?? currentAddress.postalCode,
    };

    const { lat, lng } = await Geoapify.getCoordsByAddress(geoPayload);

    coordsUpdate = {
      latitude: lat.toString(),
      longitude: lng.toString(),
    };
  }

  const finalPayload = {
    ...payload,
    isCompanyAddress: isAdmin && payload.isDefault === true, // Make the admin's default addr the company addr
    ...coordsUpdate,
  };

  return await AddressRepository.update(db, id, finalPayload);
};
