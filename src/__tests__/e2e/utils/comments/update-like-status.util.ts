import request from "supertest";
import express from "express";

import { routersPaths } from "@core/paths/paths";
import { LikeStatus } from "@core/types/like-status.enum";

export const putLikeStatus = (
  app: express.Express,
  commentId: string,
  accessToken: string,
  likeStatus: LikeStatus | string
) => {
  return request(app)
    .put(`${routersPaths.comments}/${commentId}/like-status`)
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ likeStatus });
};
