import { ApplicationError } from "../errors/application.error";
import { ApplicationResult } from "./application.result";
import { ApplicationResultStatus } from "./types/application-result-status.enum";

export const createErrorApplicationResult = (
  message: string,
  throwError: boolean = true
) => {
  const applicationError = new ApplicationError(null, message, 400);

  if (throwError) throw applicationError;

  return new ApplicationResult({
    status: ApplicationResultStatus.Error,
    data: null,
    extensions: [applicationError],
  });
};
