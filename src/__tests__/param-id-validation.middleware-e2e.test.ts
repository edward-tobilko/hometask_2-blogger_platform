import express from "express";
import request from "supertest";

import { setupApp } from "../app";
import { clearDB } from "./utils/clear-db";
import { HTTP_STATUS_CODES } from "../core/utils/http-status-codes.util";
import { runDB, stopDB } from "../db/mongo.db";
import { SETTINGS_MONGO_DB } from "../core/settings/setting-mongo.db";
import { routersPaths } from "../core/paths/paths";

describe.each([
  { urlName: "blogs", path: routersPaths.blogs },
  { urlName: "posts", path: routersPaths.posts },
])(
  "paramIdMiddlewareValidation on GET: /blogs/:id and /posts/:id",
  ({ urlName, path }) => {
    const app = express();
    setupApp(app);

    beforeAll(async () => {
      await runDB(SETTINGS_MONGO_DB.MONGO_URL);
      await clearDB(app);
    });

    afterAll(async () => {
      await stopDB();
    });

    it("OK path: numeric id passes middleware (status != 400)", async () => {
      const validId = "68e55f7929dde212b97ea83f";

      // * Якщо ресурсу з таким id нема, handler віддасть 404 — ok. Головне — НЕ 400.
      const resultId = await request(app).get(`${path}/${validId}`);

      expect(resultId.status).not.toBe(HTTP_STATUS_CODES.BAD_REQUEST_400); // Дозволяємо як 200 (якщо існує), так і 404 (якщо не існує)
    });

    it.each([
      { case: "too short", id: "abc" },
      { case: "not hex", id: "zzzzzzzzzzzzzzzzzzzzzzzz" }, // 24 символи, але не hex
      { case: "spaces", id: "1 2 3" },
      { case: "empty after trim", id: "    " },
    ])("if incorrect id - 400", async ({ id }) => {
      const resultError = await request(app)
        .get(`${path}/${id}`)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST_400);

      expect(resultError.body.errorMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "id",
            message: expect.any(String), // "ID must be a valid ObjectId" etc...
          }),
        ])
      );
    });
  }
);
