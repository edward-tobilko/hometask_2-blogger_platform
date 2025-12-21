import express from "express";

import { setupApp } from "./app";
import { runDB } from "./db/mongo.db";
import { appConfig } from "./core/settings/config";

const bootstrap = async () => {
  const app = express();
  setupApp(app);

  // * Render підставляє свій порт, локально — дефолт 5001
  const PORT = Number(process.env.PORT ?? 5001);

  try {
    await runDB(appConfig.MONGO_URL);

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(
        `NODE_ENV=${process.env.NODE_ENV} PORT=${process.env.PORT ?? 5001}`
      );
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
