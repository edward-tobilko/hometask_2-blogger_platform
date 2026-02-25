import "reflect-metadata";
import express from "express";

import { setupApp } from "./app";
import { runMongoose } from "db/mongoose.db";

export const app = express();

const bootstrap = async () => {
  // * Render подставляет свой порт, локально — дефолт 8080

  const PORT = Number(process.env.PORT) || 3000;

  try {
    // * сначала вызов db
    await runMongoose();

    // * затем setupApp (он внутри вызовет initCompositionRoot)
    setupApp(app);

    // * потом listen
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on ${PORT} PORT`);
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
