import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { postRepository } from "../../../repositories/posts.repository";
import { errorMessages } from "../../../../core/utils/error-messages.util";
import { blogsRepository } from "../../../repositories/blogs.repository";
import { PostInputDtoTypeModel } from "../../../../types/post.types";

export function updatePostHandler(
  req: Request<{ id: string }, PostInputDtoTypeModel>,
  res: Response
) {
  const { id } = req.params;
  const dto: PostInputDtoTypeModel = req.body;

  const post = postRepository.getPostById(req.params.id);

  if (!post) {
    res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json(
      errorMessages([
        {
          field: "id",
          message: `Post with id=${id} is not found`,
        },
      ])
    );
  }

  const blog = blogsRepository.findBlogById(dto.blogId);

  if (!blog) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST_400).json(
      errorMessages([
        {
          field: "blogId",
          message: `Blog with id=${dto.blogId} is not found`,
        },
      ])
    );
  }

  postRepository.updatePost(
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
}
