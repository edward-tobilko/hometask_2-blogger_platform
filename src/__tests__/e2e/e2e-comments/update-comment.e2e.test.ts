import express from "express";
// import request from "supertest";

import { setupApp } from "app";
import { runDB, stopDB } from "db/mongo.db";
import { clearDB } from "__tests__/utils/clear-db";
import { appConfig } from "@core/settings/config";

describe("E2E update comment tests", () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  afterAll(async () => {
    await stopDB();
  });
});
