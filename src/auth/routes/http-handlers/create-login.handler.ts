import { matchedData } from "express-validator";
import { Request, Response } from "express";

import { createCommand } from "../../../core/helpers/create-command.helper";
import { LoginAuthRP } from "../request-payload-types/login-auth.request-payload";
import { LoginAuthDtoCommand } from "../../application/commands/login-auth-dto.command";
import { authService } from "../../application/auth.service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { mapResultCodeToHttpException } from "../../../core/result/map-result-code-to-http.result";
import { ApplicationError } from "@core/errors/application.error";

export const createLoginHandler = async (req: Request, res: Response) => {
  try {
    const sanitizedBodyParam = matchedData<LoginAuthRP>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const command = createCommand<LoginAuthDtoCommand>(sanitizedBodyParam);

    const result = await authService.loginUser(command);

    if (result.status !== ApplicationResultStatus.Success)
      return res.status(mapResultCodeToHttpException(result.status)).json(
        result.extensions.map((err: ApplicationError) => ({
          field: err.field,
          message: err.message,
          statusCode: err.statusCode,
        }))
      );

    return res
      .status(HTTP_STATUS_CODES.OK_200)
      .json({ accessToken: result.data!.accessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
