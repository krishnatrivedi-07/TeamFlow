
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dns from "node:dns";

import { connectDatabase } from "./config/db.js";
import api from "./routes/api.js";
import { notFound, errorHandler } from "./middleware/error.js";

// DNS workaround for MongoDB Atlas SRV lookup
dns.setServers(["8.8.8.8"]);

const app = express();

// Security and middleware
app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
  }),
);

app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: "connected" });
});

// API routes
app.use("/api", api);

app.use(notFound);
app.use(errorHandler);

// Server configuration
const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error(
    "JWT_SECRET is missing or too short. Set a private value of at least 32 characters in backend/.env.",
  );
  process.exit(1);
}

// Connect database and start server
connectDatabase()
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(port, () => {
      console.log(`TeamFlow API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("\n========== DATABASE CONNECTION ERROR ==========");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Full error:", err);
    console.error("Underlying cause:", err.cause);
    console.error("================================================\n");

    process.exit(1);
  });
