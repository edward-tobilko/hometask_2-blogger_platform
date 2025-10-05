import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";

export function getPostListHandler(_req: Request, res: Response) {
  const fetchAllPosts = postRepository.getAllPosts();

  res.status(HTTP_STATUS_CODES.OK_200).json(fetchAllPosts);
}
