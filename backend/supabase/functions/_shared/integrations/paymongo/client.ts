import axios from "axios";
import { AppError } from "../../errors/Errors.ts";

// TODO: read this again after creating checkout UI in client for the full workflow:
// https://developers.paymongo.com/docs/accepting-a-paymenT

// TODO: activate gcash payment method in paymongo dashboard (needs beneficiary
// documents) to properly create live mode payment methods:
// https:dashboard.paymongo.com/payment-methods

// TODO:
// GCash Deep Links: Important Note for App-Based Merchants
// If your customer chooses GCash as the payment method and you are using a mobile app-based checkout experience (e.g., within your iOS or Android app), GCash’s new payment authentication flow includes a deeplink that triggers an “Open in GCash” button. This button attempts to open the GCash mobile app directly so the customer can complete their payment.
// To ensure this works correctly:
//    iOS and Android apps must support gcash:// deeplinks.
//    Without proper handling, the “Open in GCash” button will not work (e.g., it may do nothing or show an error).
//    Customers can still scan the QR code, but the in-app redirection flow will not function as intended.

export const paymongoClient = axios.create({
  baseURL: "https://api.paymongo.com/v1",
  headers: {
    // btoa (Binary to ASCII) is a built-in fn that converts a string to Base64-encoded string.
    // HTTP Basic Authentication requires this format: Authorization: Basic base64(username:password)

    // https://developers.paymongo.com/docs/authentication#authenticate-using-your-api-keys
    Authorization: `Basic ${btoa(Deno.env.get("PAYMONGO_SECRET_KEY") + ":")}`,
    "Content-Type": "application/json",
  },
});

paymongoClient.interceptors.response.use(
  (res) => res.data.data,
  (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500;
      const message = err.response?.data || err.message;

      return Promise.reject(
        new AppError({ status, message: "Paymongo request failed", cause: message }),
      );
    }

    // else throw it to global error handler
    throw err;
  },
);
