import { Request, Response } from "express";

import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { userService } from "../../applications/user.service";
import { RepositoryNotFoundError } from "../../../core/errors/repository-not-found.error";

export const deleteUserHandler = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const command = createCommand<{ id: string }>({ id: req.params.id });

    await userService.deleteUser(command);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    if (error instanceof RepositoryNotFoundError) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND_404).json({
        errorsMessages: [{ message: (error as Error).message, field: "id" }],
      });
    }

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [{ message: "Internal Server Error", field: "id" }],
    });
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
