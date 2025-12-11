import { Request, Response, Router } from "express";

import {
  blogCollection,
  postCollection,
  userCollection,
} from "../../db/mongo.db";
import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";

export const testingRoute = Router({});

testingRoute.delete("", async (_req: Request, res: Response) => {
  await Promise.all([
    blogCollection.deleteMany(),
    postCollection.deleteMany(),
    userCollection.deleteMany(),
  ]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
