import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { userQueryService } from "../../../users/applications/users-query.service";

export async function getAuthMeHandler(req: Request, res: Response) {
  try {
    const userId = req.user.id;

    if (!userId) return res.sendStatus(HTTP_STATUS_CODES.UNAUTHORIZED_401);

    const result = await userQueryService.getUserById(userId);

    res.status(HTTP_STATUS_CODES.OK_200).json(result);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}
