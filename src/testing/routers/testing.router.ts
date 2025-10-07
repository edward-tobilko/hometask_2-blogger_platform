import { Request, Response, Router } from "express";

import { blogCollection, postCollection } from "../../db/mongo.db";
import { HTTP_STATUS_CODES } from "../../core/utils/http-statuses.util";

export const testingRouter = Router({});

testingRouter.delete("", async (_req: Request, res: Response) => {
  await Promise.all([blogCollection.deleteMany(), postCollection.deleteMany()]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
