import { matchedData } from "express-validator";
import { Request, Response } from "express";

import { createCommand } from "../../../core/helpers/create-command.helper";
import { LoginAuthRP } from "../request-payload-types/login-auth.request-payload";
import { LoginAuthDtoCommand } from "../../application/commands/login-auth-dto.command";
import { authService } from "../../application/auth.service";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";

export const createLoginHandler = async (req: Request, res: Response) => {
  try {
    const sanitizedBodyParam = matchedData<LoginAuthRP>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const command = createCommand<LoginAuthDtoCommand>(sanitizedBodyParam);

    const result = await authService.loginUser(command);

    if (result.status !== ApplicationResultStatus.Success)
      return res
        .status(HTTP_STATUS_CODES.UNAUTHORIZED_401)
        .json(result.extensions);

    return res
      .status(HTTP_STATUS_CODES.OK_200)
      .json({ accessToken: result.data!.accessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
