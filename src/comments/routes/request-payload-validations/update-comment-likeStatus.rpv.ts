import { body } from "express-validator";

import { LikeStatus } from "@core/types/like-status.enum";

export const updateCommentLikeStatusRPValidation = body("likeStatus")
  .isString()
  .withMessage("likeStatus should be a string")
  .bail()
  .custom((value: string) =>
    Object.values(LikeStatus).includes(value as LikeStatus)
  )
  .withMessage("likeStatus must be one of: None, Like, Dislike");
