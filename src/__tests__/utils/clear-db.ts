import { Express } from "express";
import request from "supertest";

import { routersPaths } from "../../core/paths/paths";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export async function clearDB(app: Express) {
  await request(app)
    .delete(routersPaths.testing)
    .expect(HTTP_STATUS_CODES.NO_CONTENT_204);

  return;
}
