import "reflect-metadata";
import express from "express";

import { setupApp } from "./app";
import { runMongoose } from "db/mongoose.db";
import { appConfig } from "@core/settings/config";

export const app = express();

const bootstrap = async () => {
  // * Hosting подставляет свой порт, локально — 8080
  const PORT = appConfig.PORT;
  const HOST = "0.0.0.0";

  if (!PORT) throw new Error("PORT is not set");

  try {
    // * сначала вызов db
    await runMongoose();

    // * затем setupApp (он внутри вызовет initCompositionRoot)
    setupApp(app);

    // * потом listen
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Server running on ${PORT} PORT`);
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

// * защита — bootstrap запускаем только если это реальный запуск, а не импорт в тестах
if (require.main === module) {
  bootstrap().catch((e) => {
    console.error("❌ Failed to start app:", e);
    process.exit(1);
  });
}

// ? reflect-metadata - это механизм, который позволяет Inversify / декораторам читать метаданные типов.

// ? .find() → Query
// ? .exec() → Promise
// ? Promise → Document
// ? Document → Domain
// ? Domain → Output
