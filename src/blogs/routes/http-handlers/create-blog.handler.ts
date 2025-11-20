import { Request, Response } from "express";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { blogsService } from "../../application/blogs-service";

export async function createNewBlogHandler(
  req: Request<{}, {}, {}, {}>,
  res: Response
) {
  try {
    const command = createCommand(req.body);

    const createdBlogResult = await blogsService.createBlog(command);

    log("createdBlogResult ->", createdBlogResult);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(blogOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
