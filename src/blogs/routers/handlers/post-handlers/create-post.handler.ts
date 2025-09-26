import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import {
  PostInputDtoTypeModel,
  PostTypeModel,
} from "../../../../types/post.types";
import { db } from "../../../../db/mock.db";
import { postRepository } from "../../../repositories/posts.repository";
import { blogsRepository } from "../../../repositories/blogs.repository";
import { errorMessages } from "../../../../core/utils/error-messages.util";

export function createNewPostHandler(
  req: Request<{}, {}, PostInputDtoTypeModel>,
  res: Response
) {
  const { title, shortDescription, content, blogId } = req.body;

  const lastId = db.posts.length ? Number(db.posts[db.posts.length - 1].id) : 0;
  const nextId = lastId + 1;

  const blog = blogsRepository.findBlogById(String(blogId));

  if (!blog) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST_400)
      .json(
        errorMessages([
          { field: "blogId", message: `Blog with id=${blogId} is not found` },
        ])
      );
  }

  const createNewPost: PostTypeModel = {
    id: nextId,
    title: title,
    shortDescription: shortDescription,
    content: content,
    blogId: String(blogId),
    blogName: blog.name,
  };

  postRepository.createNewPost(createNewPost);

  res.status(HTTP_STATUS_CODES.CREATED_201).json(createNewPost);
}
