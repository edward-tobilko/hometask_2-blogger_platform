import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.development.local" });
}

const env = process.env.NODE_ENV ?? "development";

export const defaultDbName =
  env === "production"
    ? "home_task2-blogger_platform_prod"
    : env === "test"
      ? "home_task2-blogger_platform_test"
      : "home_task2-blogger_platform_dev";
