import { Request, Response, Router } from "express";
import { matchedData } from "express-validator";
import { log } from "node:console";

import { HTTP_STATUS_CODES } from "../../core/utils/http-status-codes.util";
import { loginOrEmailAuthMiddlewareValidation } from "./middleware-validations/login-auth.middleware-validation";
import { inputResultMiddlewareValidation } from "../../core/middlewares/validation/input-result.middleware-validation";
import { authService } from "../application/auth.service";
import { LoginAuthRequestPayload } from "./request-payloads/login-auth.request-payload";
import { createCommand } from "../../core/helpers/create-command.helper";
import { LoginAuthDtoCommand } from "../application/commands/login-auth-dto.command";

export const authRoute = Router();

authRoute.post(
  "",
  loginOrEmailAuthMiddlewareValidation,
  inputResultMiddlewareValidation,

  async (req: Request, res: Response) => {
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

      log(accessToken);

      res.status(HTTP_STATUS_CODES.OK_200).json(accessToken);
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
  }
);

// ?
