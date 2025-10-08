import dotenv from "dotenv";

dotenv.config();

export const SETTINGS_MONGO_DB = {
  PORT: Number(process.env.PORT) || 5001,
  MONGO_URL: process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017",
  DB_NAME: process.env.DB_NAME ?? "home_task2-blogger_platform",
};
