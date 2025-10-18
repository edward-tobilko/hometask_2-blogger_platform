import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { PostInputDto, PostView } from "../../types/post.types";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/api-error-result.util";
import { mapToPostViewModelUtil } from "../mappers/map-to-post-view-model.util";

export async function createNewPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response<PostView | { errorsMessages: ErrorMessages[] }>
) {
  try {
    const { title, shortDescription, content, blogId } = req.body;

    const blogsDbResponse = await blogsRepository.findBlogById(blogId);

    if (!blogsDbResponse) {
      return res
        .status(HTTP_STATUS_CODES.BAD_REQUEST_400)
        .json(
          errorMessagesUtil([
            { message: `Blog with id=${blogId} is not found`, field: "blogId" },
          ])
        );
    }

    const blogViewResponse = await postRepository.createNewPost(
      {
        title,
        shortDescription,
        content,
        blogId,
      },
      blogsDbResponse.name
    );

    res
      .status(HTTP_STATUS_CODES.CREATED_201)
      .json(mapToPostViewModelUtil(blogViewResponse));
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
