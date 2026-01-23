import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { CreateUserRP } from "users/routes/request-payload-types/create-user.request-payload-types";
import { authService } from "auth/application/session.service";
import { mapApplicationStatusToHttpStatus } from "@core/result/map-app-status-to-http.result";
import { ApplicationError } from "@core/errors/application.error";
import { ApplicationResultStatus } from "../../../core/result/types/application-result-status.enum";

export const registrationHandler = async (
  req: Request<{}, {}, CreateUserRP, {}>,
  res: Response
) => {
  try {
    const { login, password, email } = req.body;

    const resultUser = await authService.registerUser(login, password, email);

    if (resultUser.status !== ApplicationResultStatus.Success) {
      return res
        .status(mapApplicationStatusToHttpStatus(resultUser.status))
        .json({
          errorsMessages: resultUser.extensions.map(
            (err: ApplicationError) => ({
              message: err.message,
              field: err.field,
            })
          ),
        });
    }

    return res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
