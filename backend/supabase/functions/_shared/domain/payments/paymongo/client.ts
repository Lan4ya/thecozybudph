import axios from "axios";

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
