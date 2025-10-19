import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-statuses.util";
import { blogsService } from "../../application/blogs-service";
import { mapToBlogOutputUtil } from "../mappers/map-to-blog-output.util";

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const id = req.params.id;

    const blogDbByIdOutput = await blogsService.findBlogById(id);

    const mappedBlogByIdOutput = mapToBlogOutputUtil(blogDbByIdOutput);

    res.status(HTTP_STATUS_CODES.OK_200).json(mappedBlogByIdOutput);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
  }
}
