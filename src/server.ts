import express from "express";

import { setupApp } from "./app";
import { SETTINGS_MONGO_DB } from "./core/settings/setting-mongo-db";
import { runDB } from "./db/mongo.db";

const bootstrap = async () => {
  const app = express();
  setupApp(app);

  const PORT = Number(SETTINGS_MONGO_DB.PORT ?? 5001);

  await runDB(SETTINGS_MONGO_DB.MONGO_URL);

  const server = app.listen(PORT);

  server.on("listening -> ", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  console.log("ENTRY:", __filename);

  return app;
};

bootstrap();
