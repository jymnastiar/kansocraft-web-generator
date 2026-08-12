import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { connectToDatabase } from "./config/db.js";
import projectRouter from "./routes/projectRoutes.js";

// Rate limiter — createProject max 10 request/minute/IP
export const createProjectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: "To many request. tyr again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

// HTTP request logging
app.use(morgan("dev"));

let allowedOrigins = [];
if (process.env.ORIGINS) {
  allowedOrigins = process.env.ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
if (allowedOrigins.length === 0) {
  throw new Error("ORIGINS must contain at least one allowed origin");
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => res.send("Server is Live!"));
app.use(`/api/projects`, projectRouter);

app.use((err, _req, res, _next) => {
  console.error(`[Error] ${err.message}`);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3000;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  });
