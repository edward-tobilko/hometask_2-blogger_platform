import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { CreateUserRequestPayload } from "../request-payloads/create-user.request-payload";
import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreateUserDtoCommand } from "../../applications/commands/user-dto.commands";
import { userService } from "../../applications/user.service";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { errorsHandler } from "../../../core/errors/errors-handler.error";

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserRequestPayload, {}>,
  res: Response
) => {
  try {
    const sanitizedBodyParam = matchedData<CreateUserRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<CreateUserDtoCommand>(sanitizedBodyParam);

    const createdUserOutput = await userService.createUser(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdUserOutput.data);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
