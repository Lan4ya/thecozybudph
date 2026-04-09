import { isDev } from "../../utils/isDev.ts";
// import LalaMove from "npm:@lalamove/lalamove-js";
import Lalamove from "@lalamove/lalamove-js";

const PUBLIC_KEY = Deno.env.get("LALAMOVE_PUBLIC_KEY");
const SECRET_KEY = Deno.env.get("LALAMOVE_SECRET_KEY");

const environment = isDev ? "sandbox" : "production";

export const MARKET = "PH";

// SDK Docs: https://github.com/lalamove/delivery-nodejs-sdk
export const sdkClient = new Lalamove.ClientModule(
  new Lalamove.Config(PUBLIC_KEY!, SECRET_KEY!, environment),
);

/* 

// Manual implementation with axios:

 const baseURL = isDev ? "https://rest.sandbox.lalamove.com" : "https://rest.lalamove.com";

 export const lalamoveClient = axios.create({
   baseURL,
 });

 axios.interceptors.response.use(
   (res) => res.data.data,
   (err: unknown) => {
     if (axios.isAxiosError(err)) {
       const status = err?.response?.status ?? 500;
       const message = err?.response?.data || err.message;

       return Promise.reject(
         new AppError(status, "Lalamove request failed", message),
       );
     }

     // else throw it to global error handler
     throw err;
   },
 );

// Example Client Usage: Creating Quotations
// https://developers.lalamove.com/#introduction

import { createHmac } from "node:crypto";

const PUBLIC_KEY = Deno.env.get("LALAMOVE_PUBLIC_KEY");
const SECRET_KEY = Deno.env.get("LALAMOVE_SECRET_KEY");

const METHOD = "POST";
const PATH = "/v3/quotations";
const MARKET = "PH";

interface LalamoveStop {
  coordinates: {
    lat: string;
    lng: string;
  };
  address: string;
}

// add more needed types here
type getQuote = {
  serviceType: string;
  stops: LalamoveStop;
};

// interface IQuotation {
//   id: string;
//   scheduleAt: Date;
//   serviceType: string;
//   specialRequests: string[];
//   expiresAt: Date;
//   priceBreakdown: PriceBreakdown;
//   isRouteOptimized: boolean;
//   stops: Stop[];
// }

// https://github.com/lalamove/api-examples/blob/master/nodejs/quotation-v3.js
export const createQuotation = async (payload: getQuote): IQuotation => {
  const timestamp = new Date().getTime().toString();
  const requestId = crypto.randomUUID(); // NONCE

  const body = {
    data: {
      serviceType: payload.serviceType,
      stops: payload.stops,
      language: `en_${MARKET}`,
    },
  };

  // https://developers.lalamove.com/#authentication-sandbox-amp-production-api-keys
  const rawSignature = `${timestamp}\r\n${METHOD}\r\n${PATH}\r\n\r\n${body}`;
  const signature = createHmac("sha256", SECRET_KEY!)
    .update(rawSignature)
    .digest("hex");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `hmac ${PUBLIC_KEY}:${timestamp}:${signature}`,
    Market: MARKET,
    "Request-ID": requestId,
    Accept: "application/json",
  };

  return await lalamoveClient.post("/v3/quotations", body, { headers });
};

*/
