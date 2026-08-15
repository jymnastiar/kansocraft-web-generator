import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectToDatabase } from "./config/db.js";
import projectRouter from "./routes/projectRoutes.js";

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
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[Error ${statusCode}] ${err.stack || err.message}`);

  const isDev = process.env.NODE_ENV !== "production";
  res.status(statusCode).json({
    error: isDev
      ? err.message
      : statusCode === 500
        ? "Internal server error"
        : err.message,
  });
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
