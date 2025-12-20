import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { userService } from "../../applications/user.service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";

export const deleteUserHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const command = createCommand<{ id: string }>({ id: req.params.id });

    await userService.deleteUser(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
