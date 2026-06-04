import * as https from "https";
import * as crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(import.meta.dirname, "../.env") });

interface Config {
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  apiUrl: string;
}

interface ApiResponse<T = any> {
  status: number;
  data: T | null;
}

const config: Config = {
  apiKey: process.env.LALAMOVE_PUBLIC_KEY || "",
  apiSecret: process.env.LALAMOVE_SECRET_KEY || "",
  webhookUrl: process.env.LALAMOVE_WEBHOOK_URL || "",
  apiUrl: process.env.LALAMOVE_API_URL || "https://rest.sandbox.lalamove.com",
};

if (!config.apiKey || !config.apiSecret) {
  console.error(
    "❌ Missing required environment variables: LALAMOVE_PUBLIC_KEY or LALAMOVE_SECRET_KEY",
  );
  process.exit(1);
}

/**
 * Official Lalamove v3 Signature Generator
 */
function getHeaders(method: string, path: string, bodyString: string = "") {
  const timestamp = Date.now().toString();
  const rawSignature = `${timestamp}\r\n${method}\r\n${path}\r\n\r\n${bodyString}`;

  const signature = crypto
    .createHmac("sha256", config.apiSecret)
    .update(rawSignature)
    .digest("hex");

  return {
    Authorization: `hmac ${config.apiKey}:${timestamp}:${signature}`,
    "Content-Type": "application/json",
    Market: "PH",
  };
}

/**
 * HTTPS Network Handshake
 */
function makeRequest(
  method: string,
  path: string,
  payload: any = null,
): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const bodyString = payload ? JSON.stringify(payload) : "";
    const headers = getHeaders(method, path, bodyString);
    const url = new URL(config.apiUrl);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: path,
      method: method,
      headers: headers,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode || 0,
            data: data ? JSON.parse(data) : null,
          });
        } catch {
          resolve({ status: res.statusCode || 0, data: data as any });
        }
      });
    });

    req.on("error", reject);
    if (bodyString) req.write(bodyString);
    req.end();
  });
}

async function main() {
  const command = process.argv[2]?.toLowerCase() || "setup";
  console.log("🚚 Lalamove Webhook Management Tool (PH Market)");

  try {
    if (command === "setup") {
      if (!config.webhookUrl) {
        console.error(
          "❌ Error: LALAMOVE_WEBHOOK_URL is missing in your .env file.",
        );
        process.exit(1);
      }

      console.log(`🔧 Assigning webhook target URL to: ${config.webhookUrl}`);

      // Official payload structure required by Lalamove v3 API documentation
      const payload = {
        data: {
          url: config.webhookUrl,
        },
      };

      const res = await makeRequest("PATCH", "/v3/webhook", payload);
      console.log(`Status: ${res.status}`);
      console.log("Response:", JSON.stringify(res.data, null, 2));
    } else if (command === "delete") {
      console.log("🗑️ Clearing webhook registration endpoint...");

      // Lalamove updates require passing an empty string to erase/disable configuration
      const payload = {
        data: {
          url: "",
        },
      };

      const res = await makeRequest("PATCH", "/v3/webhook", payload);
      console.log(`Status: ${res.status}`);
      console.log("Response:", JSON.stringify(res.data, null, 2));
    } else {
      console.error(
        `❌ Unknown command: "${command}". Use "setup" or "delete". Note: "get" is not supported by Lalamove's API.`,
      );
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Network execution error:", err);
  }
}

main();
