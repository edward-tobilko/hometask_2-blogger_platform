import { Express } from "express";
import request from "supertest";

import { TESTING_PATH } from "../../core/paths/paths";
import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";

export async function clearDB(app: Express) {
  await request(app)
    .delete(TESTING_PATH)
    .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  return;
}
