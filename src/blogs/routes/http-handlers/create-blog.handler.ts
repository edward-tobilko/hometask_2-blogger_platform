import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { blogsService } from "../../application/blogs-service";
import { matchedData } from "express-validator";
import { CreateBlogDtoCommand } from "../../application/commands/blog-dto-type.commands";

export async function createNewBlogHandler(
  req: Request<{}, {}, CreateBlogRP, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedParam = matchedData<CreateBlogRP>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<CreateBlogDtoCommand>(sanitizedParam);

    const createdBlogOutput = await blogsService.createBlog(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdBlogOutput.data);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
