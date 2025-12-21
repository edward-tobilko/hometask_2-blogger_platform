import { Request, Response } from "express";
import { errorsHandler } from "../../../core/errors/errors-handler.error";
import { HTTP_STATUS_CODES } from "../../../core/utils/http-status-codes.util";

export async function getAuthMe(req: Request, res: Response) {
  try {
    res.status(HTTP_STATUS_CODES.OK_200).json("Hello");
  } catch (error: unknown) {
    errorsHandler(error, req, res);
  }
}
