import express from "express";

import { setupApp } from "./app";
import { runDB } from "./db/mongo.db";
import { appConfig } from "./core/settings/config";

const bootstrap = async () => {
  const app = express();

  // * Render подставляет свой порт, локально — дефолт 8080
  const PORT = Number(process.env.PORT) || 8080;

  try {
    await runDB(appConfig.MONGO_URL);

    setupApp(app);

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on ${PORT}`);
      console.log(`NODE_ENV=${process.env.NODE_ENV}`);
      console.log("✅ ENTRY:", __filename);
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    process.exit(1);
  }
};

bootstrap();
