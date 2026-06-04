import { AddressData, CreateAddressInput } from "@shared/schemas/index.ts";
import { AddressRepository } from "../address-repository.ts";
import { DrizzleClient } from "../../../db/client.ts";
import { Geoapify } from "@shared/integrations/geoapify/mod.ts";

export const createAddress = async (
  db: DrizzleClient,
  profileId: string,
  isAdmin: boolean,
  payload: CreateAddressInput,
): Promise<AddressData> => {
  const geoPayload = {
    addressLine: payload.addressLine,
    barangay: payload.barangay,
    city: payload.city,
    region: payload.region,
    province: payload.province,
    postalCode: payload.postalCode,
  };

  const { lat: latitude, lng: longitude } =
    await Geoapify.getCoordsByAddress(geoPayload);

  const address = await AddressRepository.insert(db, {
    profileId,
    ...payload,
    isCompanyAddress: isAdmin && payload.isDefault === true, // Make the admin's default addr the company addr
    latitude,
    longitude,
  });
  return address;
};
