import Lalamove from "@lalamove/lalamove-js";
import {
  CreateShippingQuoteInput,
  Stop,
  CreateShippingQuoteData,
} from "@shared/schemas/types/index.ts";
import { getCoordinates } from "../geoapify/get-coordinates.ts";
import { COMPANY_ADDRESS, MARKET, sdkClient, SERVICE_TYPES } from "./client.ts";

export const createShippingQuotation = async (
  payload: CreateShippingQuoteInput,
): Promise<CreateShippingQuoteData[]> => {
  const senderAddress = payload.senderAddress;
  const recipientAddress = payload.recipientAddress;

  let pickupAddress: string;
  if (senderAddress) {
    pickupAddress = [
      senderAddress.addressLine,
      senderAddress.barangay,
      senderAddress.province,
      senderAddress.postalCode,
      senderAddress.city,
      // senderAddress.region,
      "Philippines",
    ]
      .filter(Boolean)
      .join(", ");
  } else {
    pickupAddress = COMPANY_ADDRESS;
  }

  const dropoffAddress = [
    recipientAddress.addressLine,
    recipientAddress.barangay,
    recipientAddress.province,
    recipientAddress.postalCode,
    recipientAddress.city,
    // recipientAddress.region,
    "Philippines",
  ]
    .filter(Boolean)
    .join(", ");

  const coordinates = await Promise.all([
    getCoordinates(pickupAddress),
    getCoordinates(dropoffAddress),
  ]);

  const pickupStop: Stop = {
    coordinates: coordinates[0],
    address: pickupAddress,
  };
  const dropoffStop: Stop = {
    coordinates: coordinates[1],
    address: dropoffAddress,
  };

  const requestedServices = payload.serviceType
    ? [payload.serviceType.toUpperCase()]
    : SERVICE_TYPES;

  const quotes = await Promise.all(
    requestedServices.map((type) => {
      const quotationPayload =
        Lalamove.QuotationPayloadBuilder.quotationPayload()
          .withLanguage(`en_${MARKET}`)
          .withServiceType(type)
          .withStops([pickupStop, dropoffStop])
          .build();

      return sdkClient.Quotation.create(MARKET, quotationPayload);
    }),
  );

  return quotes;
};
