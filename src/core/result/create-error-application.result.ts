import { ApplicationError } from "../errors/application.error";
import { ApplicationResult } from "./application.result";

export const createErrorApplicationResult = (
  message: string,
  statusCode: string,
  throwError: boolean = true
) => {
  const applicationError = new ApplicationError(message, undefined, statusCode);

  if (throwError) {
    throw applicationError;
  }

  return new ApplicationResult({ errors: [applicationError], data: null });
};
