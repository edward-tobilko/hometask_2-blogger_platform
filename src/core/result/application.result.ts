import { ApplicationError } from "../errors/application.error";
import { ApplicationResultBody } from "./types/application-result-body.type";
import { ApplicationResultStatus } from "./types/application-result-status.enum";

export class ApplicationResult<D = null> {
  public readonly status: ApplicationResultStatus;
  public readonly data: D | null = null;
  public readonly extensions: ApplicationError[] = [];
  public readonly errorMessage?: string;

  constructor(body: ApplicationResultBody<D>) {
    this.status = body.status;
    this.data = body.data;
    this.extensions = body.extensions ?? [];
    this.errorMessage = body.errorMessage;
  }

  isSuccess() {
    return this.status === ApplicationResultStatus.Success;
  }

  hasError() {
    return !this.isSuccess;
  }

  static ok<D>(data: D): ApplicationResult<D> {
    return new ApplicationResult({
      status: ApplicationResultStatus.Success,
      data,
      extensions: [],
    });
  }

  static fail(
    message: string,
    field: string | null = null,
    statusCode = 400
  ): ApplicationResult<null> {
    return new ApplicationResult({
      status: ApplicationResultStatus.Error,
      data: null,
      extensions: [new ApplicationError(message, field!, statusCode)],
      errorMessage: message,
    });
  }
}
