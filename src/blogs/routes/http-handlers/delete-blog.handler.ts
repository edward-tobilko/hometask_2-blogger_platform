// import { Request, Response } from "express";

// import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
// import { blogsService } from "../../application/blogs-service";

// export async function deleteBlogHandler(
//   req: Request<{ id: string }>,
//   res: Response
// ) {
//   try {
//     await blogsService.deleteBlog(req.params.id);

//     res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
//   } catch (error: unknown) {
//     res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);
//   }
// }
