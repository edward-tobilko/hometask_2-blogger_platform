import { Request, Response, Router } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { SessionModel } from "auth/mongoose/auth-schema.mongoose";
import { BlogModel } from "blogs/infrastructure/schemas/blog.schema";
import { PostModel } from "posts/infrastructure/schemas/post.schema";
import { UserModel } from "users/infrastructure/schemas/user-schema";
import { PostCommentsModel } from "posts/infrastructure/schemas/post-comments.schema";
import { PostLikeModel } from "posts/infrastructure/schemas/post-like.schema";
import { CommentLikeModel } from "comments/infrastructure/schemas/comment-likes.schema";

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
    PostLikeModel.deleteMany(),
    CommentLikeModel.deleteMany(),
  ]);

  res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
});
