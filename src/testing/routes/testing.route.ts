import { Request, Response, Router } from "express";

import {
  authCollection,
  blogCollection,
  postCollection,
  postCommentsCollection,
  userCollection,
} from "../../db/mongo.db";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const testingRoute = Router({});

// Clear database: delete all data from all tables/collections
testingRoute.delete("", async (_req: Request, res: Response) => {
  await Promise.all([
    authCollection.deleteMany(),
    blogCollection.deleteMany(),
    postCollection.deleteMany(),
    userCollection.deleteMany(),
    postCommentsCollection.deleteMany(),
  ]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
