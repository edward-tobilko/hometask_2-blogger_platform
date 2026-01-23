import { Request, Response, Router } from "express";

import {
  authSessionCollection,
  blogCollection,
  postCollection,
  postCommentsCollection,
  userCollection,
} from "../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const testingRoute = Router({});

// * DELETE: Clear database: delete all data from all tables/collections.
testingRoute.delete("", async (_req: Request, res: Response) => {
  if (process.env.NODE_ENV !== "test") {
    return res.sendStatus(HTTP_STATUS_CODES.FORBIDDEN_403);
  }

  await Promise.all([
    authSessionCollection.deleteMany(),
    blogCollection.deleteMany(),
    postCollection.deleteMany(),
    userCollection.deleteMany(),
    postCommentsCollection.deleteMany(),
  ]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
