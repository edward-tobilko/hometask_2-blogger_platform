// import { Request, Response } from "express";

// import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
// import { blogsService } from "../../application/blogs-service";

// export async function createNewBlogHandler(
//   req: Request<{}, {}, BlogInputDtoModel>,
//   res: Response<BlogViewModel>
// ) {
//   try {
//     const createdBlog = await blogsService.createBlog(req.body);

//     res.status(HTTP_STATUS_CODES.CREATED_201).json(blogOutput);
//   } catch (error: unknown) {
//     res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
//   }
// }
