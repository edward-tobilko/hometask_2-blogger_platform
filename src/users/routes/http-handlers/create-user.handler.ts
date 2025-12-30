import { Request, Response } from "express";
import { matchedData } from "express-validator";

import { createCommand } from "../../../core/helpers/create-command.helper";
import { CreateUserDtoCommand } from "../../applications/commands/user-dto.commands";
import { userService } from "../../applications/user.service";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { CreateUserRP } from "../request-payload-types/create-user.request-payload-types";

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserRP, {}>,
  res: Response
) => {
  try {
    const sanitizedBodyParam = matchedData<CreateUserRP>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const command = createCommand<CreateUserDtoCommand>(sanitizedBodyParam);

    const createdUserOutput = await userService.createUser(command);

    res.status(HTTP_STATUS_CODES.CREATED_201).json(createdUserOutput.data);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
