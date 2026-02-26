import { config } from "dotenv";
import { Secret } from "jsonwebtoken";
import { StringValue } from "ms";

type NodeEnv = "development" | "test" | "production";

const nodeEnv = (process.env.NODE_ENV as NodeEnv | undefined) ?? "development";

if (nodeEnv !== "production") {
  const envFilePath =
    nodeEnv === "test" ? ".env.test.local" : ".env.development.local";

  config({ path: envFilePath });

  console.log("ENV MODE:", nodeEnv);
  console.log("ENV FILE:", envFilePath);
} else {
  console.log("ENV MODE:", nodeEnv);
  console.log("ENV FILE: (skipped in production)");
}

const defaultDbName =
  nodeEnv === "test"
    ? "home_task2-blogger_platform_test"
    : nodeEnv === "production"
      ? "home_task2-blogger_platform_prod"
      : "home_task2-blogger_platform_dev";

export const appConfig = {
  NODE_ENV: nodeEnv,

  PORT: Number(process.env.PORT) || 8080,

  MONGO_URL: process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017",
  DB_NAME: process.env.DB_NAME ?? defaultDbName,

  AT_SECRET: process.env.AT_SECRET as Secret, // Access token secret
  AT_TIME: process.env.AT_TIME as StringValue | undefined, // Access token time

  RT_SECRET: process.env.RT_SECRET as string, // Refresh token secret
  RT_TIME: process.env.RT_TIME as StringValue | undefined, // Refresh token time

  DB_TYPE: process.env.DB_TYPE,

  EMAIL: process.env.EMAIL as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,

  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",

  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
} as const;
