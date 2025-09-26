import { Request, Response } from "express";

import {
  BloggerInputDtoTypeModel,
  BlogTypeModel,
} from "../../../../types/blog.types";
import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { db } from "../../../../db/mock.db";
import { blogsRepository } from "../../../repositories/blogs.repository";

export function createNewBlogHandler(
  req: Request<{}, {}, BloggerInputDtoTypeModel>,
  res: Response
) {
  const lastId = db.blogs.length ? Number(db.blogs[db.blogs.length - 1].id) : 0;
  const nextId = lastId + 1;

  const createNewBlog: BlogTypeModel = {
    id: nextId,
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  };

  blogsRepository.createNewBlog(createNewBlog);

  res.status(HTTP_STATUS_CODES.CREATED_201).json(createNewBlog);
}
