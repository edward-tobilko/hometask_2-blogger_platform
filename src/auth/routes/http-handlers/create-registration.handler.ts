import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { CreateUserRP } from "users/routes/request-payload-types/create-user.request-payload-types";
import { authService } from "auth/application/auth.service";
import { mapResultCodeToHttpException } from "@core/result/map-result-code-to-http.result";
import {
  ApplicationError,
  NotFoundError,
} from "@core/errors/application.error";
import { ApplicationResultStatus } from "./../../../core/result/types/application-result-status.enum";

export const createRegistrationHandler = async (
  req: Request<{}, {}, CreateUserRP, {}>,
  res: Response
) => {
  try {
    const { login, password, email } = req.body;

    const resultUser = await authService.registerUser(login, password, email);

    if (!resultUser) {
      return res
        .status(HTTP_STATUS_CODES.NOT_FOUND_404)
        .json(new NotFoundError("user", "User is not exist", 404));
    }

    if (resultUser.status === ApplicationResultStatus.Success) {
      res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
    } else {
      res.status(mapResultCodeToHttpException(resultUser.status)).json(
        resultUser.extensions.map((err: ApplicationError) => ({
          field: err.field,
          message: err.message,
          statusCode: err.statusCode,
        }))
      );
    }
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
