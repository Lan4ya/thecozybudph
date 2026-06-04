import Lalamove from "@lalamove/lalamove-js";
import { Stop, CreateShippingQuoteData } from "@shared/schemas/types/index.ts";
import { COMPANY_ADDRESS, MARKET, sdkClient, SERVICE_TYPES } from "./client.ts";

/**
 * Generates delivery quotations from Lalamove for various service types.
 *
 * A quotation provides the estimated price and distance for a delivery. It is
 * required before an order can be placed. This function fetches coordinates
 * for the addresses and requests quotes for all available service types
 * (e.g., MOTORCYCLE, SEDAN) unless a specific one is requested.
 *
 * @param payload - Contains sender and recipient addresses.
 * @returns An array of quotations, one for each requested service type.
 */
export type CreateLalamoveQuoteInput = {
  senderAddress: {
    region: string;
    city: string;
    postalCode: string;
    barangay: string;
    addressLine: string;
    province?: string | null | undefined;
    latitude: string;
    longitude: string;
  };
  recipientAddress: {
    region: string;
    city: string;
    postalCode: string;
    barangay: string;
    addressLine: string;
    province?: string | null | undefined;
    latitude: string;
    longitude: string;
  };
  serviceType?: "motorcycle" | "sedan" | undefined;
};

export const createLalamoveQuotation = async (
  payload: CreateLalamoveQuoteInput,
): Promise<CreateShippingQuoteData[]> => {
  const senderAddress = payload.senderAddress;
  const recipientAddress = payload.recipientAddress;

  let pickUpAddress: string;
  if (senderAddress) {
    pickUpAddress = [
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
    pickUpAddress = COMPANY_ADDRESS;
  }

  const dropOffAddress = [
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

  const pickupStop: Stop = {
    coordinates: { lat: senderAddress.latitude, lng: senderAddress.longitude },
    address: pickUpAddress,
  };
  const dropoffStop: Stop = {
    coordinates: {
      lat: recipientAddress.latitude,
      lng: recipientAddress.longitude,
    },
    address: dropOffAddress,
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
