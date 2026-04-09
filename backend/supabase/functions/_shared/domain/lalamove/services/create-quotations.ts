import Lalamove from "@lalamove/lalamove-js";
import {
  CreateShippingQuoteInput,
  QuoteStop,
  CreateQuotationsRes,
} from "../../../types/index.ts";
import { getCoordinates } from "../../geoapify/get-coordinates.ts";
import { MARKET, sdkClient } from "../client.ts";

// https://apidocs.geoapify.com/playground/geocoding/?searchType=structured&query=38 Upper Montagu Street, London W1H 1LJ, United Kingdom&street=Tuazon Street&postcode=1008&city=Sampaloc Manila&country=Philippines&numberOfResults=1&lang=en&type=street#geocoding

const companyAddress =
  "Pioneer Street, Mandaluyong, 1552 National Capital District, Philippines";

// This is from Geoapify also. I decided to query it in advance and hardcode it
// so that we can have a faster response, querying only the lat and lng of
// dropoff address (delivery address).
const pickupStop: QuoteStop = {
  coordinates: {
    lat: "14.571965",
    lng: "121.048353",
  },
  address: companyAddress,
};

const SERVICE_TYPES = ["MOTORCYCLE", "SEDAN"] as const;

export const createQuotations = async (
  payload: CreateShippingQuoteInput,
): Promise<CreateQuotationsRes> => {
  const deliveryAddress = payload.address;

  const dropOffAddress = [
    deliveryAddress.addressLine,
    deliveryAddress.postalCode,
    deliveryAddress.region,
    deliveryAddress.city,
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

  const quoteForMotorCycle = await sdkClient.Quotation.create(
    MARKET,
    quotationPayloadForMotorCycle,
  );
  const quoteForSedan = await sdkClient.Quotation.create(
    MARKET,
    quotationPayloadForSedan,
  );

  return [quoteForMotorCycle, quoteForSedan];
};
