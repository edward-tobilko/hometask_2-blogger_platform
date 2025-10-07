import { Request, Response } from "express";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";
import { mapToPostViewModelUtil } from "../mappers/map-to-post-view-model.util";
import { PostView } from "../../types/post.types";

export async function getPostListHandler(
  _req: Request,
  res: Response<PostView[]>
) {
  try {
    const fetchPostsDb = await postRepository.getAllPosts();

    const fetchPostView = fetchPostsDb.map(mapToPostViewModelUtil);

    log(fetchPostView);

    res.status(HTTP_STATUS_CODES.OK_200).json(fetchPostView);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
