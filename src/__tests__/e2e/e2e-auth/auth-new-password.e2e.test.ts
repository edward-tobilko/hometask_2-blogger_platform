import express from "express";
import request from "supertest";

import { appConfig } from "@core/settings/config";
import { customRateLimitCollection, runDB, stopDB } from "db/mongo.db";
import { setupApp } from "app";
import { clearDB } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

const path = `${routersPaths.auth}/new-password`;

describe("E2E: password recovery flow", () => {
  const app = express();

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);

    setupApp(app);
  });

  beforeEach(async () => {
    await clearDB(app);

    await customRateLimitCollection.deleteMany({});
  });

  afterAll(async () => {
    await stopDB();
  });
});
