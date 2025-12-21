import { matchedData } from "express-validator";
import { Request, Response } from "express";
import { log } from "node:console";

import { createCommand } from "../../../core/helpers/create-command.helper";
import { LoginAuthRequestPayload } from "../request-payloads/login-auth.request-payload";
import { LoginAuthDtoCommand } from "../../application/commands/login-auth-dto.command";
import { authService } from "../../application/auth.service";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";

export const createLoginHandler = async (req: Request, res: Response) => {
  try {
    const sanitizedBodyParam = matchedData<LoginAuthRequestPayload>(req, {
      locations: ["body"],
      includeOptionals: true,
    });

    const command = createCommand<LoginAuthDtoCommand>(sanitizedBodyParam);

    const accessToken = await authService.loginUser(command);

    if (!accessToken)
      return res.status(HTTP_STATUS_CODES.UNAUTHORIZED_401).json({
        errorsMessages: [
          {
            message: "Not Unauthorized",
            field: "loginOrEmail or password",
          },
        ],
      });

    log("accessToken from handler ->", accessToken); // b6c12d943338c4ad242ba2ee06af45a03dfda0aa0a6a335dd8d88c5d43fbfa70

    res.status(HTTP_STATUS_CODES.NO_CONTENT_204).json(accessToken);
  } catch (error: unknown) {
    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR_500).json({
      errorsMessages: [
        {
          message: "Internal Server Error",
          field: "loginOrEmail or password",
        },
      ],
    });
  }
};
