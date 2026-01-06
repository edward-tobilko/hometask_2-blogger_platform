import { ApplicationError } from "../errors/application.error";
import { ApplicationResult } from "./application.result";
import { ApplicationResultStatus } from "./types/application-result-status.enum";

export const createErrorApplicationResult = (
  message: string,
  throwError: boolean = true
) => {
  const applicationError = new ApplicationError(message, null, 400);

  if (throwError) throw applicationError;

  return new ApplicationResult({
    status: ApplicationResultStatus.BadRequest,
    data: null,
    extensions: [applicationError],
  });
};
