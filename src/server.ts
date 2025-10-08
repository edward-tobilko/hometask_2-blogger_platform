import express from "express";

import { setupApp } from "./app";
import { SETTINGS_MONGO_DB } from "./core/settings/setting-mongo-db";
import { runDB } from "./db/mongo.db";

const bootstrap = async () => {
  const app = express();
  setupApp(app);

  // * Render задаємо PORT автоматично. Локально 5001.
  const PORT = Number(SETTINGS_MONGO_DB.PORT ?? 5001);

  try {
    await runDB(SETTINGS_MONGO_DB.MONGO_URL);

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);

      server.on("error", (err) => {
        console.error("❌ Server error:", err);
        process.exit(1);
      });

      console.log("✅ ENTRY:", __filename);
    });
  } catch (error) {
    console.error("❌ Failed to start app:", error);
    process.exit(1);
  }
};

bootstrap();
