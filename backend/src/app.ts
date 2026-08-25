import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import * as Sentry from "@sentry/node";
import router from "./routes";
import userNotificationPreferences from "./routes/user-notification-preferences";
import { logger } from "./lib/logger";
import { sanitizeMiddleware } from "./lib/sanitize";

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
  "http://localhost:5173",
  "http://localhost:8080",
].filter(Boolean) as string[];
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".replit.dev")) cb(null, true);
      else cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware);

const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many requests, please try again in a minute." },
});
app.use("/api/auth", authLimiter);
app.use("/api/chat", authLimiter);

app.use("/api", router);
app.use("/api", userNotificationPreferences);
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

export default app;
