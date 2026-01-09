import { matchedData } from "express-validator";
import { Request, Response } from "express";

import { createCommand } from "../../../core/helpers/create-command.helper";
import { LoginAuthRP } from "../request-payload-types/login-auth.request-payload";
import { LoginAuthDtoCommand } from "../../application/commands/login-auth-dto.command";
import { authService } from "../../application/auth.service";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { mapApplicationStatusToHttpStatus } from "../../../core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const sanitizedBodyParam = matchedData<LoginAuthRP>(req, {
      locations: ["body"],
      includeOptionals: false,
    });

    const command = createCommand<LoginAuthDtoCommand>(sanitizedBodyParam);

    const result = await authService.loginUser(command);

    if (result.status !== ApplicationResultStatus.Success)
      return res.status(mapApplicationStatusToHttpStatus(result.status)).json({
        errorsMessages: result.extensions.map((err: ApplicationError) => ({
          message: err.message,
          field: err.field,
        })),
      });

    const { accessToken, refreshToken } = result.data!;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // для https = true
      // secure: appConfig.NODE_ENV === "production", // или просто false - локально
      sameSite: "strict", // нужна для защиты от кросс-доменных подмен кук
      path: "/",
      // maxAge: 20 * 1000, // 20s как в swagger (но лучше брать с appConfig.RT_TIME)
    });

    return res.status(HTTP_STATUS_CODES.OK_200).json({ accessToken });
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
