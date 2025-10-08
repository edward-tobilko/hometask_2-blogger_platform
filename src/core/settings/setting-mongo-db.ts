import dotenv from "dotenv";
import fs from "fs";

const ENV = process.env.NODE_ENV ?? "development";

// спроби у пріоритеті: .env.{env}.local → .env.{env} → .env.local → .env
const candidates = [`.env.${ENV}.local`, `.env.${ENV}`, `.env.local`, `.env`];

for (const file of candidates) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file });
    break;
  }
}

export const SETTINGS_MONGO_DB = {
  PORT: Number(process.env.PORT) || 5001,
  MONGO_URL: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017",
  DB_NAME: process.env.DB_NAME ?? "home_task2-blogger_platform",
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
};
