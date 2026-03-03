import { Request, Response, Router } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { SessionModel } from "auth/mongoose/auth-schema.mongoose";
import { BlogModel } from "blogs/mongoose/blog-schema.mongoose";
import { PostModel } from "posts/infrastructure/mongoose/post.schema";
import { UserModel } from "users/mongoose/user-schema.mongoose";
import { PostCommentsModel } from "posts/infrastructure/mongoose/post-comments.schema";

export const testingRoute = Router({});

// * DELETE: Clear database: delete all data from all tables/collections.
testingRoute.delete("", async (_req: Request, res: Response) => {
  // if (process.env.NODE_ENV !== "test") {
  //   return res.sendStatus(HTTP_STATUS_CODES.FORBIDDEN_403);
  // }

  await Promise.all([
    SessionModel.deleteMany(),
    BlogModel.deleteMany(),
    PostModel.deleteMany(),
    UserModel.deleteMany(),
    PostCommentsModel.deleteMany(),
  ]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
