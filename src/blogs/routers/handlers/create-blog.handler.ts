import { Request, Response } from "express";

import {
  BloggerInputDtoTypeModel,
  BloggerTypeModel,
} from "../../../types/blogger.types";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { db } from "../../../db/mock.db";
import { blogsRepository } from "../../repositories/blogs.repository";

export function createNewBlogHandler(
  req: Request<{}, {}, BloggerInputDtoTypeModel>,
  res: Response
) {
  const nextId = db.blogs.length ? db.blogs[db.blogs.length - 1].id + 1 : 1;

  const createNewBlog: BloggerTypeModel = {
    id: nextId as string,
    name: req.body.name,
    description: req.body.description,
    websiteUrl: req.body.websiteUrl,
  };

  blogsRepository.createNewBlog(createNewBlog);

  res.status(HTTP_STATUS_CODES.CREATED_201).json(createNewBlog);
}
