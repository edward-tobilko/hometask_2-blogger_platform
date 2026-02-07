import express from "express";
import request from "supertest";

import { appConfig } from "@core/settings/config";
import { customRateLimitCollection, runDB, stopDB } from "db/mongo.db";
import { setupApp } from "app";
import { clearDB } from "../utils/clear-db";
import { routersPaths } from "@core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

const path = `${routersPaths.auth}/password-recovery`;

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

  it("POST: /auth/password-recovery -> 204: even if current email is not registered (for prevent user's email detection)", async () => {
    await request(app)
      .post(path)
      .send({ email: "not-exist@gmail.com" })
      .expect(HTTP_STATUS_CODES.NO_CONTENT_204);
  });

  it("POST: /auth/password-recovery -> 400: if the inputModel has invalid email", async () => {
    await request(app)
      .post(path)
      .send({ email: "222^gmail.com" })
      .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);
  });
});
