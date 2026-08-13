import { rateLimit } from "express-rate-limit";

// Rate limiter — createProject max 10 request/minute/IP
export const createProjectLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: "Too many request. try again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter — chat revision max 15 request/minute/user
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  keyGenerator: (req) => req.user?.userId || req.ip,
  message: { error: "Too many chat requests. Please try again in 1 minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
