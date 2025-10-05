import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../../core/utils/http-statuses.util";
import { blogsRepository } from "../../../repositories/blogs.repository";

export function getBlogListHandler(_req: Request, res: Response) {
  const blogs = blogsRepository.findAllBlogs();

  res.status(HTTP_STATUS_CODES.OK_200).json(blogs);
}
