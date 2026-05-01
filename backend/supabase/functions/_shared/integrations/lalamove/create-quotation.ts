import Lalamove from "@lalamove/lalamove-js";
import {
  CreateQuotationsRes,
  CreateShippingQuoteInput,
  QuoteStop,
} from "@shared/schemas/index.ts";
import { MARKET, sdkClient } from "./client.ts";
import { getCoordinates } from "../geoapify/get-coordinates.ts";

// Default company address.
const companyAddress =
  "Pioneer Street, Mandaluyong, 1552 National Capital District, Philippines";

// This is the result of the company's address from Geoapify. I decided to
// query it in advance and hardcode it so that we can have a faster response,
// querying only the lat and lng of dropoff address (delivery address).
const pickupStop: QuoteStop = {
  coordinates: {
    lat: "14.571965",
    lng: "121.048353",
  },
  address: companyAddress,
};

const SERVICE_TYPES = ["MOTORCYCLE", "SEDAN"] as const;

export const createShippingQuotation = async (
  payload: CreateShippingQuoteInput,
): Promise<CreateQuotationsRes> => {
  const deliveryAddress = payload.address;

  const dropOffAddress = [
    deliveryAddress.addressLine,
    deliveryAddress.postalCode,
    deliveryAddress.region,
    deliveryAddress.city,
    deliveryAddress.province,
    "Philippines",
  ].join(", ");

  const dropoffCoords = await getCoordinates(dropOffAddress);

  const dropoffStop: QuoteStop = {
    coordinates: dropoffCoords,
    address: dropOffAddress,
  };

  const quotationPayloadForMotorCycle =
    Lalamove.QuotationPayloadBuilder.quotationPayload()
      .withLanguage(`en_${MARKET}`)
      .withServiceType(SERVICE_TYPES[0])
      .withStops([pickupStop, dropoffStop])
      .build();

  const quotationPayloadForSedan =
    Lalamove.QuotationPayloadBuilder.quotationPayload()
      .withLanguage(`en_${MARKET}`)
      .withServiceType(SERVICE_TYPES[1])
      .withStops([pickupStop, dropoffStop])
      .build();

  const motorcycleQuote = await sdkClient.Quotation.create(
    MARKET,
    quotationPayloadForMotorCycle,
  );
  const sedanQuote = await sdkClient.Quotation.create(
    MARKET,
    quotationPayloadForSedan,
  );

  return [motorcycleQuote, sedanQuote];
};
