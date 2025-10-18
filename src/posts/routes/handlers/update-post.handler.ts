import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { postRepository } from "../../repositories/posts.repository";
import { blogsRepository } from "../../../blogs/repositories/blogs.repository";
import { PostInputDto } from "../../types/post.types";
import {
  ErrorMessages,
  errorMessagesUtil,
} from "../../../core/utils/api-error-result.util";

export async function updatePostHandler(
  req: Request<{ id: string }, PostInputDto>,
  res: Response<{ errorsMessages: ErrorMessages[] }>
) {
  try {
    const { id } = req.params;
    const dto: PostInputDto = req.body;

    const post = await postRepository.getPostById(req.params.id);

    if (!post) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
        errorMessagesUtil([
          {
            message: `Post with id=${id} is not found`,
            field: "id",
          },
        ])
      );
    }

    const blog = await blogsRepository.findBlogById(dto.blogId);

    if (!blog) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST_400).json(
        errorMessagesUtil([
          {
            message: `Blog with id=${dto.blogId} is not found`,
            field: "blogId",
          },
        ])
      );
    }

    await postRepository.updatePost(
      id,
      {
        ...dto,
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
      },
      blog.name
    );

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
