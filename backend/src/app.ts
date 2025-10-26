import "dotenv/config";
import express from "express";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { initDB } from "./db/connectDB";

// err middlewares
import { notFound } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://null.com", "https://null.com"] // accept requests only from these domains
        : "http://localhost:5173", // accept requests from Vite dev server
    credentials: true,
  }),
);
app.use(helmet()); // set security HTTP headers
app.use(express.json()); // parse JSON requests
app.use(morgan("dev")); // log HTTP requests

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const __dirname = path.resolve();
const DIST_PATH = path.join(__dirname, "dist-frontend");

// normalize trailing slashes
app.use((req, res, next) => {
  if (
    req.path.length > 1 &&
    req.path.endsWith("/") &&
    !req.path.startsWith("/api")
  ) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  next();
});

if (NODE_ENV === "production") {
  app.use(express.static(DIST_PATH));

  // handle React SPA routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(DIST_PATH, "index.html"));
  });
} else {
  console.log("🚧 Running in dev mode... 🚧");
}

// test API endpoint
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from Express backend!" });
});

// error handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  initDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
