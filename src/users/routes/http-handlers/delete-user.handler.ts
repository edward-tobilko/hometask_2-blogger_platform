import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { userService } from "../../applications/user.service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";

export const deleteUserHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const command = createCommand<{ id: string }>({ id: req.params.id });

    const result = await userService.deleteUser(command);

    if (!result.isSuccess()) {
      return res
        .status(mapApplicationStatusToHttpStatus(result.status))
        .json({ errorsMessages: result.extensions });
    }

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
