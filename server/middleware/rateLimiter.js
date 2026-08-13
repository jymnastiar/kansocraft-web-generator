import { rateLimit } from "express-rate-limit";

// Rate limiter — createProject max 10 request/minute/IP
export const createProjectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: "Too many request. try again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
