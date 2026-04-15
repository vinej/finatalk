import pino from "pino";

const transport = process.env.NODE_ENV === "production"
  ? undefined
  : pino.transport({
      target: "pino-pretty",
      options: { colorize: true },
    });

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    base: { app: "myapp-server", env: process.env.NODE_ENV ?? "development" },
    redact: {
      paths: ["email", "*.email", "password", "*.password", "token", "*.token", "req.headers.cookie", "req.headers.authorization"],
      censor: "[redacted]",
    },
  },
  transport,
);
