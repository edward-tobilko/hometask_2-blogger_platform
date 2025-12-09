import { NextFunction, Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { userService } from "../../applications/user.service";

export const deleteUserHandler = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const command = createCommand<{ id: string }>({ id: req.params.id });

    const result = await userService.deleteUser(command);

    if (result.hasError()) {
      const firstError = result.errors![0];

      if (firstError.code === "USER_NOT_FOUND") {
        return res.sendStatus(HTTP_STATUS_CODES.NOT_FOUND_404);
      }

      if (firstError.code === "DELETE_FAILED") {
        return res.sendStatus(HTTP_STATUS_CODES.BAD_REQUEST_400);
      }

      return res.sendStatus(HTTP_STATUS_CODES.BAD_REQUEST_400);
    }

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    res.sendStatus(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500);

    next(error);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
