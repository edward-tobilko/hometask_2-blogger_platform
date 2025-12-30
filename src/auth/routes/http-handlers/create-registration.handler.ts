import { Request, Response } from "express";

import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "@core/result/types/http-status-codes.enum";

export const createRegistrationHandler = async (
  req: Request,
  res: Response
) => {
  try {
    return res.status(HTTP_STATUS_CODES.OK_200).json("lol");
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
};

// ? Request<Params, ResBody, ReqBody, Query>
