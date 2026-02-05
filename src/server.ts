import "reflect-metadata";

import express from "express";

import { setupApp } from "./app";
import { runDB } from "./db/mongo.db";
import { appConfig } from "./core/settings/config";

export const app = express();

const bootstrap = async () => {
  // * Render подставляет свой порт, локально — дефолт 8080
  const PORT = Number(process.env.PORT) || 8080;

  try {
    // * сначала вызов db
    await runDB(appConfig.MONGO_URL);

    // * затем setupApp (он внутри вызовет initCompositionRoot)
    setupApp(app);

    // * потом listen
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

// ? reflect-metadata - это механизм, который позволяет Inversify / декораторам читать метаданные типов.
