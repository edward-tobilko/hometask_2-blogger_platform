import express from "express";
import request from "supertest";

import { setupApp } from "../app";
import { clearDB } from "./utils/clear-db";
import { BLOGS_PATH, POSTS_PATH } from "../core/paths/paths";
import { HTTP_STATUS_CODES } from "../core/utils/http-statuses.util";
import { errorMessages } from "../core/utils/error-messages.util";
import { ErrorMessagesTypeModel } from "../types/error-messages.types";

describe.each([
  { urlName: "blogs", path: BLOGS_PATH },
  { urlName: "posts", path: POSTS_PATH },
])(
  "paramIdMiddlewareValidation on GET: /blogs/:id and /posts/:id",
  ({ urlName, path }) => {
    const app = express();
    setupApp(app);

    beforeEach(async () => {
      await clearDB(app);
    });

    it("OK path: numeric id passes middleware (status != 400)", async () => {
      // * Якщо ресурсу з таким id нема, handler віддасть 404 — ok. Головне — НЕ 400.
      const resultId = await request(app).get(`${path}/123`);

      expect(resultId.status).not.toBe(HTTP_STATUS_CODES.BAD_REQUEST_400);
      // * Дозволяємо як 200 (якщо існує), так і 404 (якщо не існує)
    });

    it.each([
      { case: "not numeric id", id: "abc" },
      { case: "contains letters", id: "123abc" },
      { case: "spaces", id: "1 2 3" },
    ])("if incorrect id - 400", async ({ id }) => {
      const resultError = await request(app)
        .get(`${path}/${id}`)
        .expect(HTTP_STATUS_CODES.NOT_FOUND_404);

      const { errorsMessages } = errorMessages(
        resultError.body.errorsMessages as ErrorMessagesTypeModel[]
      );

      expect(errorsMessages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "id",
            message: expect.any(String), // "ID must be a string" etc...
          }),
        ])
      );
    });
  }
);
