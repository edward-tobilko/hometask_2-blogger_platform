import { config } from "dotenv";
import { Secret } from "jsonwebtoken";
import { StringValue } from "ms";

import { defaultDbName } from "./mongo-db.setting";

config();

export const appConfig = {
  PORT: process.env.PORT,
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
};
