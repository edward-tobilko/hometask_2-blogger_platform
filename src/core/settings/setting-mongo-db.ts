import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development.local" });
}

const env = process.env.NODE_ENV ?? "development";
const defaultDbName =
  env === "production"
    ? "home_task2-blogger_platform_prod"
    : env === "test"
      ? "home_task2-blogger_platform_test"
      : "home_task2-blogger_platform_dev";

export const SETTINGS_MONGO_DB = {
  MONGO_URL: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017",
  DB_NAME: process.env.DB_NAME ?? defaultDbName,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
};
