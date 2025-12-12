import { NextFunction, Request, Response } from "express";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { blogsService } from "../../application/blogs-service";
import { CreateBlogRequestPayload } from "../request-payloads/create-blog.request-payload";
import { matchedData } from "express-validator";
import { CreateBlogDtoCommand } from "../../application/commands/blog-dto-type.commands";

export async function createNewBlogHandler(
  req: Request<{}, {}, CreateBlogRequestPayload, {}>,
  res: Response,
  next: NextFunction
) {
  try {
    const sanitizedParam = matchedData<CreateBlogRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<CreateBlogDtoCommand>(sanitizedParam);

    const createdBlogOutput = await blogsService.createBlog(command);

    log("createdBlogOutput ->", createdBlogOutput.data);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdBlogOutput.data);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
}

// ? Request<Params, ResBody, ReqBody, Query>
