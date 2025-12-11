import { Express } from "express";
import request from "supertest";

import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";
import { routersPaths } from "../../core/paths/paths";

export async function clearDB(app: Express) {
  await request(app)
    .delete(routersPaths.testing)
    .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  return;
}
