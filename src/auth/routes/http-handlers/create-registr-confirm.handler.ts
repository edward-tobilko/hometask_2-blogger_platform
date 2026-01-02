import { Request, Response } from "express";
import { log } from "node:console";

import { errorsHandler } from "@core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";
import { authService } from "auth/application/auth.service";

export const createRegistrConfirmHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { code } = req.body;

    const result = await authService.registrEmailConfirm(code);

    log("result ->", result);

    res.sendStatus(HTTP_STATUS_CODES.NO_CONTENT_204);
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};
